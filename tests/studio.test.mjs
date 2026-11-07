import test from 'node:test';import assert from 'node:assert/strict';import {env} from './platform.mjs';
import {POST as admin} from '../app/api/admin/route.ts';import {GET as challenge} from '../app/api/challenge/route.ts';
import {POST as brief} from '../app/api/inquiries/route.ts';import {POST as chat} from '../app/api/chat/route.ts';
import {POST as checker} from '../app/api/check/route.ts';import {POST as metrics} from '../app/api/metrics/route.ts';
import {listProjects} from '../lib/studio-data.ts';import {entries,getLinks} from '../lib/cms.ts';
import {POST as owner,GET as ownerStatus} from '../app/api/session/route.ts';
import {pbkdf2Sync,randomBytes} from 'node:crypto';
const salt=randomBytes(16).toString('hex');
const password=randomBytes(24).toString('hex');
env.OWNER_PASSWORD_HASH=salt+':'+pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
let cookie='';
async function signIn(){const result=await owner(req('/api/session',{action:'login',password}));assert.equal(result.status,200);cookie=result.headers.get('set-cookie').split(';')[0];}
const origin='https://hash.example';const req=(path,data,extra={})=>new Request(origin+path,{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json',...extra},body:JSON.stringify(data)});
const example={action:'saveProject',isNew:true,slug:'test-app',title:'Test application',category:'Web platform',summary:'A working project for route tests.',challenge:'Project brief.',solution:'The build.',tech:'React',result:'A working release.',url:'https://example.com',image:'',art:'grid',status:'draft',position:1,kind:'Studio project'};
test('admin authorization, origin, drafts, publication, duplicate slugs and deletion',async()=>{
 cookie='';assert.equal((await admin(req('/api/admin',example))).status,401);
 assert.equal((await admin(req('/api/admin',example,{'oai-authenticated-user-email':'owner@example.test'}))).status,401);
 await signIn();assert.equal((await admin(req('/api/admin',example,{Origin:'https://other.test'}))).status,403);
 assert.equal((await admin(req('/api/admin',example))).status,200);
 assert.ok(!(await listProjects()).some(p=>p.slug===example.slug));
 assert.equal((await admin(req('/api/admin',example))).status,409);
 assert.equal((await admin(req('/api/admin',{...example,isNew:false,status:'published'}))).status,200);assert.ok((await listProjects()).some(p=>p.slug===example.slug));
 assert.equal((await admin(req('/api/admin',{...example,isNew:false,url:'javascript:alert(1)'}))).status,400);
 assert.equal((await admin(req('/api/admin',{action:'deleteProject',slug:example.slug}))).status,200);
});
test('editorial entries, published reviews, real photo requirement, contact links',async()=>{
 await signIn();const row={action:'contentSave',isNew:true,id:'studio-note',kind:'post',title:'Test note',label:'Engineering',body:'A piece of verified test content.',url:'',image:'',status:'draft'};
 assert.equal((await admin(req('/api/admin',row))).status,200);assert.ok(!(await entries('post')).some(x=>x.id===row.id));
 assert.equal((await admin(req('/api/admin',{...row,isNew:false,status:'published'}))).status,200);
 assert.ok((await entries('post')).some(x=>x.id===row.id));
 for(const kind of ['team','review'])assert.equal((await admin(req('/api/admin',{...row,id:kind,kind,status:'published'}))).status,400);
 assert.equal((await admin(req('/api/admin',{action:'connections',whatsapp:'+92 300 1234567',booking:'https://example.com/booking'}))).status,400);
 assert.equal((await admin(req('/api/admin',{action:'connections',whatsapp:'+92 300 1234567',booking:'https://cal.com/example/15min'}))).status,200);
 assert.equal((await getLinks()).whatsapp,'923001234567');
});
test('one-time verification, quote storage and honest mail status without credentials',async()=>{
 const c=await(await challenge(new Request(origin+'/api/challenge'))).json();const [a,b]=c.question.match(/\d+/g).map(Number);
 const form={challenge:c.id,answer:String(a+b),name:'Test Visitor',email:'visitor@example.test',brief:'We need a small internal dashboard.',topic:'Business system',budget:'Still exploring',website:''};
 assert.equal((await brief(req('/api/inquiries',form,{Origin:'https://other.test'}))).status,403);
 const r=await brief(req('/api/inquiries',form));assert.equal(r.status,201);assert.ok((await r.json()).reference);
 assert.equal((await brief(req('/api/inquiries',form))).status,422);
 const saved=await env.DB.prepare('SELECT budget,mail FROM inquiries').first();assert.equal(saved.budget,'Still exploring');assert.equal(saved.mail,'not configured');
});
test('chat secrets isolate visitors; only the owner can reply',async()=>{
 const r=await chat(req('/api/chat',{action:'start',name:'Test Visitor',email:'visitor@example.test',body:'I have a project question.'}));
 assert.equal(r.status,201);const s=await r.json();
 assert.equal((await chat(req('/api/chat',{action:'read',...s,token:'a'.repeat(72)}))).status,403);
 cookie='';assert.equal((await chat(req('/api/chat',{action:'ownerList'}))).status,403);
 await signIn();assert.equal((await chat(req('/api/chat',{action:'ownerReply',thread:s.thread,body:'Thank you for the brief.'}))).status,200);
 const rows=(await(await chat(req('/api/chat',{action:'read',...s}))).json()).messages;assert.deepEqual(rows.map(x=>x.role),['Visitor','Studio']);
});
test('scanner rejects internal targets; valid domains go only to Mozilla with no paths',async()=>{
 for(const url of ['http://127.0.0.1','http://169.254.169.254/a','file:///etc/passwd','https://x.internal','https://bad.example.com:8080'])assert.equal((await checker(req('/api/check',{url,authorized:true}))).status,400);
 const original=globalThis.fetch;
 try{globalThis.fetch=async(url,init)=>{assert.equal(String(url),'https://observatory-api.mdn.mozilla.net/api/v2/scan?host=www.mozilla.org');assert.equal(init.method,'POST');return Response.json({grade:'A',score:91,tests_passed:9,tests_failed:1,tests_quantity:10});};
 assert.equal((await checker(req('/api/check',{url:'https://www.mozilla.org/private?token=sensitive',authorized:true}))).status,200);}finally{globalThis.fetch=original;}
});
test('aggregate analytics honours DNT and stores only section and category',async()=>{
 assert.equal((await metrics(req('/api/metrics',{page:'/portfolio/private?secret=x',source:'Search'},{DNT:'1'}))).status,204);
 assert.equal((await env.DB.prepare('SELECT COUNT(*) as n FROM traffic_totals').first()).n,0);
 await metrics(req('/api/metrics',{page:'/portfolio/private?secret=x',source:'Search'}));const row=await env.DB.prepare('SELECT * FROM traffic_totals').first();assert.equal(row.page,'portfolio');assert.equal(row.source,'Search');
});
test('owner cookies expire, revoke on logout and resist forged headers and replay after rotation',async()=>{
 cookie='';
 const spoof={'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'};
 assert.equal((await admin(req('/api/admin',example,spoof))).status,401);
 assert.equal((await owner(req('/api/session',{action:'login',password:'incorrect-password'}))).status,401);
 const result=await owner(req('/api/session',{action:'login',password}));assert.equal(result.status,200);
 const set=result.headers.get('set-cookie');for(const part of ['HttpOnly','Secure','SameSite=Strict','__Host-','Max-Age=14400'])assert.ok(set.includes(part));
 cookie=set.split(';')[0];const old=env.OWNER_PASSWORD_HASH;env.OWNER_PASSWORD_HASH='';
 assert.equal((await admin(req('/api/admin',example))).status,401);env.OWNER_PASSWORD_HASH=old;
 assert.equal((await owner(req('/api/session',{action:'logout'}))).status,200);
 assert.equal((await admin(req('/api/admin',example))).status,401);
 await signIn();await env.DB.prepare('UPDATE owner_sessions SET expires=0').run();
 assert.equal((await admin(req('/api/admin',example))).status,401);
 let last;for(let i=0;i<9;i++)last=await owner(req('/api/session',{action:'login',password:'wrong'},{'cf-connecting-ip':'198.51.100.23'}));
 assert.equal(last.status,429);
});
test('invalid mail, large JSON and malformed JSON have bounded responses',async()=>{
 for(const body of ['{broken',JSON.stringify({brief:'x'.repeat(18000)}),JSON.stringify({email:'wrong'})]){
   const response=await brief(new Request(origin+'/api/inquiries',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body}));
   assert.equal(response.status,400);assert.deepEqual(await response.json(),{error:'Check your name, email, project details and field lengths.'});
 }
});
test('a retried brief with the same request id returns its original receipt',async()=>{
 const c=await(await challenge(new Request(origin+'/api/challenge'))).json(),[a,b]=c.question.match(/\d+/g).map(Number);
 const data={submissionId:crypto.randomUUID(),challenge:c.id,answer:String(a+b),name:'Route Test',email:'route@example.test',brief:'A replay-safe submission.',topic:'Digital product',budget:'Still exploring'};
 const first=await brief(req('/api/inquiries',data));assert.equal(first.status,201);
 const again=await brief(req('/api/inquiries',data));assert.equal(again.status,200);assert.deepEqual(await again.json(),await first.json());
 assert.equal((await brief(req('/api/inquiries',{...data,email:'different@example.test'}))).status,409);
});
test('a public project edit records a real sitemap modification time',async()=>{
 await signIn();const slug='date-test';
 assert.equal((await admin(req('/api/admin',{...example,slug,status:'published'}))).status,200);
 const row=await env.DB.prepare('SELECT value FROM settings WHERE id=?').bind('modified:/portfolio/'+slug).first();
 assert.ok(Math.abs(new Date(row.value).getTime()-Date.now())<60000);
});

test('session status is private and checks the actual expiring owner cookie',async()=>{
 const request=()=>new Request(origin+'/api/session',{headers:{Cookie:cookie}});
 cookie='';assert.equal((await ownerStatus(request())).status,401);
 await signIn();const response=await ownerStatus(request());assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 await owner(req('/api/session',{action:'logout'}));assert.equal((await ownerStatus(request())).status,401);
});
