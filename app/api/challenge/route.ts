import {quota,runtime} from '@/lib/abuse';
import {getPlatformDb} from '@/lib/platform-db';

export async function GET(req:Request){
 try{
  if(!await quota(req,'captcha',500))return Response.json({error:'Too many attempts. Try again later.'},{status:429});
  const siteKey=runtime('TURNSTILE_SITE_KEY');
  if(siteKey&&runtime('TURNSTILE_SECRET'))return Response.json({siteKey},{headers:{'Cache-Control':'no-store'}});
  const v=crypto.getRandomValues(new Uint8Array(2)),a=v[0]%9+2,b=v[1]%8+2,id=crypto.randomUUID();
  const db=getPlatformDb();
  await db.batch([
    db.prepare('DELETE FROM human_challenges WHERE expires<?').bind(Date.now()),
    db.prepare('INSERT INTO human_challenges(id,answer,expires) VALUES (?,?,?)').bind(id,String(a+b),Date.now()+600000)
  ]);
  return Response.json({id,question:`What is ${a} + ${b}?`},{headers:{'Cache-Control':'no-store'}});
 }catch(err){
  console.warn('[Challenge fallback]:', err);
  const v=crypto.getRandomValues(new Uint8Array(2)),a=v[0]%9+2,b=v[1]%8+2,id=crypto.randomUUID();
  return Response.json({id,question:`What is ${a} + ${b}?`},{headers:{'Cache-Control':'no-store'}});
 }
}
