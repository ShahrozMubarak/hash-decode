import {runtime} from '@/lib/abuse';
export async function mailBrief(m:{id:string,name:string,email:string,topic:string,budget:string,brief:string}){
 const key=runtime('RESEND_API_KEY'),from=runtime('MAIL_FROM'),to=runtime('MAIL_TO')||runtime('STUDIO_OWNER_EMAIL');
 if(!key||!from||!to)return 'not configured';
 try{const r=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(7000),headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'brief-'+m.id},body:JSON.stringify({from,to:[to],reply_to:m.email,subject:'Hash Decode · New project brief '+m.id.slice(0,8),text:[m.name,m.email,m.topic,m.budget,m.brief].join('\n\n')})});return r.ok?'accepted':'failed';}catch{return 'failed';}
}
