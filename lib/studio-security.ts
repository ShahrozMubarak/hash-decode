import {headers} from 'next/headers';
import {sessionValid} from './owner-session';
export async function adminAccess(request?:Request){
 const source=request?.headers ?? await headers();
 return {allowed:await sessionValid(source.get('cookie'))};
}
export function bounded(value:unknown,max:number,min=0){
  if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)throw new Error('Check the required fields and their lengths.');
  return value.trim();
}
export function httpsUrl(value:unknown){
  const s=bounded(value,2048); if(!s)return '';
  let u;try{u=new URL(s);}catch{throw new Error('Enter a full HTTPS website address.');}
  if(u.protocol!=='https:'||u.username||u.password)throw new Error('Use an HTTPS address without embedded credentials.');
  return u.href;
}
export function imageOrUrl(value:unknown){
  if(typeof value!=='string')return '';
  const s=value.trim();
  if(!s)return '';
  if(s.startsWith('data:image/')&&s.includes(';base64,')){
    if(s.length>5*1024*1024)throw new Error('Uploaded image is too large (max 5MB).');
    return s;
  }
  if(s.startsWith('/')&&!s.includes('//'))return s;
  return httpsUrl(s);
}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export async function readSmall(req:Request){
  if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Error('Expected a JSON request.');
  const reader=req.body?.getReader(); if(!reader)throw new Error('Missing request body.');
  const chunks:Uint8Array[]=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>6*1024*1024){await reader.cancel();throw new Error('Request is too large.');}chunks.push(value);}
  const data=new Uint8Array(size);let pos=0;for(const c of chunks){data.set(c,pos);pos+=c.length;}
  const result=JSON.parse(new TextDecoder().decode(data));if(!result||typeof result!=='object'||Array.isArray(result))throw new Error('Invalid request.');
  return result;
}
