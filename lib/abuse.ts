import {env} from 'cloudflare:workers';
import {getPlatformDb} from './platform-db';

export async function quota(req:Request,scope:string,max:number,period=3600000){
 try{
  const t=Math.floor(Date.now()/period);
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const firstForwarded = forwarded.split(',')[0]?.trim() || '';
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || firstForwarded || 'local';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(scope+':'+t+':'+ip));
  const key=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const db=getPlatformDb();
  const row=await db.prepare('INSERT INTO submission_limits (key,expires,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<? RETURNING count').bind(key,(t+1)*period,max).first();
  if(Math.random()<.04)await db.prepare('DELETE FROM submission_limits WHERE expires<?').bind(Date.now()).run();
  return Boolean(row);
 }catch{return true;}
}

export const runtime = (key: string): string => {
  let val: unknown = undefined;
  try {
    if (typeof env !== 'undefined' && env) {
      val = (env as unknown as Record<string, unknown>)[key];
    }
  } catch {}
  if ((val === undefined || val === null || val === '') && typeof process !== 'undefined' && process.env) {
    val = process.env[key];
  }
  return val !== undefined && val !== null ? String(val).trim() : '';
};

export const trafficSince=()=>new Date(Date.now()-29*86400000).toISOString().slice(0,10);

