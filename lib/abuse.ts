import {env} from 'cloudflare:workers';
import {getPlatformDb} from './platform-db';
export async function quota(req:Request,scope:string,max:number,period=3600000){
 const t=Math.floor(Date.now()/period),ip=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'local';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(scope+':'+t+':'+ip));
 const key=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const db=getPlatformDb();
 try{
  const row=await db.prepare('INSERT INTO submission_limits (key,expires,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(key,(t+1)*period,max).first();
  if(Math.random()<.04)await db.prepare('DELETE FROM submission_limits WHERE expires<?').bind(Date.now()).run();
  return Boolean(row);
 }catch{return true;}
}
export const runtime=(key:string)=>String((env as unknown as Record<string,string>)[key]||'');

export const trafficSince=()=>new Date(Date.now()-29*86400000).toISOString().slice(0,10);
