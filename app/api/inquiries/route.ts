import {env} from 'cloudflare:workers';import {getDb} from '@/db';import {inquiries} from '@/db/schema';import {eq} from 'drizzle-orm';
import {bounded,readSmall,sameOrigin} from '@/lib/studio-security';import {quota,runtime} from '@/lib/abuse';import {mailBrief} from '@/lib/notify';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Untrusted request.'},{status:403});
 let d; let entry:typeof inquiries.$inferSelect;
 try{d=await readSmall(req);if(d.website)return Response.json({error:'Unable to accept this submission.'},{status:400});
 const email=bounded(d.email,254,3).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');
 const topic=bounded(d.topic,60,1),budget=bounded(d.budget,52,1);
 if(!['Digital product','Web platform','Business system','Security audit','Something else'].includes(topic)||!['Under US$2,500','US$2,500–7,500','US$7,500–20,000','US$20,000+','Still exploring'].includes(budget))throw Error('Select a project type and budget.');
 const id=d.submissionId===undefined?crypto.randomUUID():bounded(d.submissionId,36,36);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw Error();
 entry={id,name:bounded(d.name,100,2),email,topic,budget,brief:bounded(d.brief,3000,12),status:'new',mail:'pending',created:Date.now()};
 }catch{return Response.json({error:'Check your name, email, project details and field lengths.'},{status:400});}
 try{
 if(!await quota(req,'brief-attempt',20))return Response.json({error:'Please wait before trying again.'},{status:429});
 if(d.submissionId){
  const saved=await getDb().select().from(inquiries).where(eq(inquiries.id,entry.id)).get();
  if(saved){
   const matches=(['name','email','topic','budget','brief'] as const).every(k=>entry[k]===saved[k]);
   return matches?Response.json({ok:true,reference:saved.id.slice(0,8).toUpperCase()},{status:200}):Response.json({error:'Please refresh and retry.'},{status:409});
  }
 }
 if(runtime('TURNSTILE_SITE_KEY')&&runtime('TURNSTILE_SECRET')){
 const token=bounded(d.token,2048,1);const reply=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',signal:AbortSignal.timeout(6000),body:new URLSearchParams({secret:runtime('TURNSTILE_SECRET'),response:token})});const result=await reply.json() as {success?:boolean,hostname?:string};
 if(!result.success || result.hostname!==new URL(req.url).hostname)return Response.json({error:'Complete the verification again.'},{status:422});
 }else{const id=String(d.challenge||'');if(id.length!==36)return Response.json({error:'Complete the human check.'},{status:422});
 const check=await env.DB!.prepare('DELETE FROM human_challenges WHERE id=? RETURNING answer,expires').bind(id).first<{answer:string,expires:number}>();
 if(!check || check.expires<Date.now()||check.answer!==String(d.answer||'').trim())return Response.json({error:'The human check expired or was incorrect. Try the new question.'},{status:422});}
 if(!await quota(req,'brief',6))return Response.json({error:'Please wait before submitting another brief.'},{status:429});
 await getDb().insert(inquiries).values(entry);
 const mail=await mailBrief(entry);await getDb().update(inquiries).set({mail}).where(eq(inquiries.id,entry.id)).catch(()=>{});
 return Response.json({ok:true,reference:entry.id.slice(0,8).toUpperCase()},{status:201});
 }catch{return Response.json({error:'Submission unavailable. Please check your connection and try again.'},{status:503});}
}
