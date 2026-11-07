import {getDb} from '@/db';
import {projects,inquiries,settings} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {concepts,listProjects} from '@/lib/studio-data';
import {manageContent} from '@/lib/cms';
import {adminAccess,bounded,readSmall,sameOrigin,httpsUrl,imageOrUrl} from '@/lib/studio-security';
export async function POST(req:Request){
  if(!sameOrigin(req))return Response.json({error:'Untrusted request.'},{status:403});
  if(!(await adminAccess(req)).allowed)return Response.json({error:'Sign in to continue.'},{status:401});
  let d;try{d=await readSmall(req);}catch{return Response.json({error:'Invalid request.'},{status:400});}
  const db=getDb();
  try{
    if(['contentSave','contentRemove','connections'].includes(d.action))return await manageContent(d);
    if(d.action==='saveProject'){
      const slug=bounded(d.slug,80,1);
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Use lowercase words and hyphens for the project address.');
      const existing=(await listProjects(true)).find(p=>p.slug===slug);
      if(d.isNew && existing)return Response.json({error:'That project address is already in use.'},{status:409});
      const title=bounded(d.title,90,2),category=bounded(d.category,45,2),summary=bounded(d.summary,240,8),challenge=bounded(d.challenge,2500),solution=bounded(d.solution,2500);
      const url=httpsUrl(d.url),image=imageOrUrl(d.image),status=d.status==='published'?'published':'draft',art=['orbit','relay','grid'].includes(d.art)?d.art:'grid';
      const position=Number(d.position);
      if(!Number.isInteger(position)||position<0||position>9999)throw Error('Position must be between 0 and 9999.');
      const kind=d.kind==='Studio concept'?'Studio concept':'Studio project';
      const row={slug,title,category,summary,challenge,solution,tech:bounded(d.tech||'',300),result:bounded(d.result||'',2000),url,image,art,status,position,kind};
      if(d.isNew){const result=await db.insert(projects).values(row).onConflictDoNothing().returning({slug:projects.slug});if(!result.length)return Response.json({error:'That address is reserved. Choose another.'},{status:409});}
      else await db.insert(projects).values(row).onConflictDoUpdate({target:projects.slug,set:row});
    }else if(d.action==='deleteProject'){
      const slug=bounded(d.slug,80,1);const row=(await listProjects(true)).find(p=>p.slug===slug);
      if(!row)return Response.json({error:'Project not found.'},{status:404});
      if(concepts.some(p=>p.slug===slug))await db.insert(projects).values({...row,status:'deleted'}).onConflictDoUpdate({target:projects.slug,set:{status:'deleted'}});
      else await db.delete(projects).where(eq(projects.slug,slug));
    }else if(d.action==='inquiryStatus'){
      if(!['new','read','archived'].includes(d.status))throw Error('Invalid inquiry status.');
      await db.update(inquiries).set({status:d.status}).where(eq(inquiries.id,bounded(d.id,80,1)));
    }else if(d.action==='settings'){
      const value=JSON.stringify({intro:bounded(d.intro,240,10),about:bounded(d.about,1200,10)});
      await db.insert(settings).values({id:'public',value}).onConflictDoUpdate({target:settings.id,set:{value}});
    }else return Response.json({error:'Unknown operation.'},{status:400});
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  }catch(e){const msg=e instanceof Error?e.message:'';return Response.json({error:/^(Use |Enter |Check |Position |Invalid )/.test(msg)?msg:'The change could not be saved. Check the fields and try again.'},{status:400});}
}
