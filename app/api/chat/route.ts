import {env} from 'cloudflare:workers';import {bounded,sameOrigin,readSmall,adminAccess} from '@/lib/studio-security';import {quota} from '@/lib/abuse';
const json=(x:unknown,n=200)=>Response.json(x,{status:n,headers:{'Cache-Control':'private, no-store'}});
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'Untrusted request.'},403);
 try{const x=await readSmall(req),db=env.DB!,action=x.action,now=Date.now();
 if(action==='start'){if(!await quota(req,'chat-start',4))return json({error:'Please try again later.'},429);
 const name=bounded(x.name,80,2),email=bounded(x.email,254,3),body=bounded(x.body,1200,2);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter a valid email.'},400);
 const thread=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
 await db.batch([db.prepare('INSERT INTO chat_threads(id,secret,name,email,updated) VALUES(?,?,?,?,?)').bind(thread,await digest(token),name,email,now),db.prepare('INSERT INTO chat_messages(id,thread,role,body,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),thread,'Visitor',body,now)]);
 return json({thread,token},201);}
 const owner=action==='ownerList'||action==='ownerRead'||action==='ownerReply';
 if(owner&&!(await adminAccess(req)).allowed)return json({error:'Owner access required.'},403);
 if(action==='ownerList')return json({threads:(await db.prepare('SELECT id,name,email,updated FROM chat_threads ORDER BY updated DESC LIMIT 100').all()).results});
 const thread=bounded(x.thread,36,36);if(!owner){const token=bounded(x.token,72,72);if(!await db.prepare('SELECT id FROM chat_threads WHERE id=? AND secret=?').bind(thread,await digest(token)).first())return json({error:'Chat unavailable.'},403);}
 else if(!await db.prepare('SELECT id FROM chat_threads WHERE id=?').bind(thread).first())return json({error:'Chat not found.'},404);
 if(action==='send'||action==='ownerReply'){if(!owner&&!await quota(req,'chat-message',35))return json({error:'Please wait before sending more messages.'},429);const body=bounded(x.body,1200,1);await db.batch([db.prepare('INSERT INTO chat_messages(id,thread,role,body,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),thread,owner?'Studio':'Visitor',body,now),db.prepare('UPDATE chat_threads SET updated=? WHERE id=?').bind(now,thread)]);}
 else if(action!=='read'&&action!=='ownerRead')return json({error:'Unknown action.'},400);
 return json({messages:(await db.prepare('SELECT role,body,created FROM (SELECT role,body,created FROM chat_messages WHERE thread=? ORDER BY created DESC,rowid DESC LIMIT 80) ORDER BY created').bind(thread).all()).results});
 }catch{return json({error:'Chat unavailable or invalid input. Please try again.'},400);}}
