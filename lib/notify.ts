import {runtime} from '@/lib/abuse';
export async function mailBrief(m:{id:string,name:string,email:string,topic:string,budget:string,brief:string}){
 const key=runtime('RESEND_API_KEY');
 const from=runtime('MAIL_FROM')||runtime('RESEND_FROM')||'onboarding@resend.dev';
 const to=runtime('ADMIN_NOTIFICATION_EMAIL')||runtime('MAIL_TO')||runtime('STUDIO_OWNER_EMAIL')||'shaahrozdogar@gmail.com';
 if(!key||!from||!to)return 'not configured';
 try{
  const r=await fetch('https://api.resend.com/emails',{
   method:'POST',
   redirect:'error',
   signal:AbortSignal.timeout(7000),
   headers:{
    Authorization:'Bearer '+key,
    'Content-Type':'application/json',
    'Idempotency-Key':'brief-'+m.id
   },
   body:JSON.stringify({
    from:'onboarding@resend.dev',
    to:[to],
    reply_to:m.email,
    subject:`Hash Decode · New project brief ${m.id.slice(0,8)} (${m.name})`,
    text:`New Project Inquiry received on Hash Decode Studio:\n\nName: ${m.name}\nEmail: ${m.email}\nService: ${m.topic}\nBudget: ${m.budget}\n\nBrief:\n${m.brief}\n\nReference ID: ${m.id}`
   })
  });
  return r.ok?'accepted':'failed';
 }catch{return 'failed';}
}
