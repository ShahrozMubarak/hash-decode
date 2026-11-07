import {getDb} from '@/db';import {content,settings} from '@/db/schema';import {eq} from 'drizzle-orm';import {bounded,httpsUrl,imageOrUrl} from '@/lib/studio-security';
export type Entry=typeof content.$inferSelect;
const notes=[
 ['ownership-before-handover','Before you take ownership of a web app','Delivery','Ask for a fresh install','Run the project from its documentation in a new environment. Confirm database migrations, build commands and backups before the previous team leaves.','Walk through the failure paths','Try a failed submission, a lost connection and an expired login. The product should explain what happened and preserve the work a user can safely retry.','Finish with an access inventory','Record who owns the domain, repository, mail sender and hosting account. Transfer ownership and rotate shared credentials before sign-off.'],
 ['permission-tests','Three permission checks for a new API','Security','Start without a session','Call a private endpoint without signing in. Confirm that it returns a deliberate denial and no private fields.','Try the same action as another user','Use two test accounts with separate records. Change the record identifier and verify that account A cannot read or modify account B’s data.','Test the write path separately','A protected page does not protect its API. Repeat the tests against create, update and delete operations, and record the expected status for each.'],
 ['mobile-performance','A practical mobile launch check','Engineering','Start with the first screen','Load the page with a cold cache and a throttled connection. Identify which file delays the main headline or image.','Make decoration optional','Give canvases a static first frame, pause motion offscreen, and respect reduced-motion preferences. A visitor should be able to read and navigate before animation starts.','Measure the real journey','Test a low-end handset, submit a brief and open a case study. Repeat after a release and compare measurements from the same device and network.']
];
export const initialPosts:Entry[]=notes.map(([id,title,label,a,b,c,d,e,f])=>({id,kind:'post',title,label,body:[a,b,c,d,e,f].join('\n\n'),url:'',image:'',status:'published',updated:0}));
export async function entries(kind?:string,all=false){const rows=kind?await getDb().select().from(content).where(eq(content.kind,kind)):await getDb().select().from(content);const map=new Map((!kind||kind==='post'?initialPosts:[]).map(x=>[x.id,x]));rows.forEach(x=>map.set(x.id,x));return [...map.values()].filter(x=>all?x.status!=='deleted':x.status==='published').sort((a,b)=>b.updated-a.updated);}
export async function getLinks(){const row=await getDb().select().from(settings).where(eq(settings.id,'connections')).get();return row?JSON.parse(row.value) as {whatsapp:string,booking:string}:{whatsapp:'',booking:''};}
export async function manageContent(d:Record<string,unknown>){
 const db=getDb();
 if(d.action==='connections'){const whatsapp=bounded(d.whatsapp,18).replace(/[+ ()-]/g,''),booking=httpsUrl(d.booking);
 if(whatsapp&&!/^[1-9][0-9]{7,14}$/.test(whatsapp))throw Error('Enter an international WhatsApp number.');
 if(booking&&!['cal.com','calendly.com','www.calendly.com','www.cal.com'].includes(new URL(booking).hostname))throw Error('Use a Calendly or Cal.com link.');
 const value=JSON.stringify({whatsapp,booking});await db.insert(settings).values({id:'connections',value}).onConflictDoUpdate({target:settings.id,set:{value}});
 }else{
 const id=bounded(d.id,80,1);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw Error('Use lowercase words and hyphens for the address.');
 const prior=(await entries(undefined,true)).find(x=>x.id===id);
 if(d.action==='contentRemove'){if(!prior)return Response.json({error:'Entry not found.'},{status:404});await db.insert(content).values({...prior,status:'deleted'}).onConflictDoUpdate({target:content.id,set:{status:'deleted'}});
 }else{const kind=String(d.kind);if(!['post','team','review'].includes(kind)||prior&&prior.kind!==kind)throw Error('Invalid content type.');
 const row={id,kind,title:bounded(d.title,100,2),label:bounded(d.label,120,2),body:bounded(d.body,7000,8),url:httpsUrl(d.url),image:imageOrUrl(d.image),status:d.status==='published'?'published':'draft',updated:Date.now()};
 if(kind==='review'&&row.status==='published'&&!row.url)throw Error('Enter the original review URL before publishing.');
 if(kind==='team'&&row.status==='published'&&!row.image)throw Error('Enter the member’s actual photo URL before publishing.');
 if(d.isNew){if(prior)return Response.json({error:'This address already exists.'},{status:409});const done=await db.insert(content).values(row).onConflictDoNothing().returning({id:content.id});if(!done.length)return Response.json({error:'Address already used.'},{status:409});}
 else await db.insert(content).values(row).onConflictDoUpdate({target:content.id,set:row});
 }}
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}
