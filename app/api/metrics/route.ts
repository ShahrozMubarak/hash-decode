import {getPlatformDb} from '@/lib/platform-db';import {readSmall,sameOrigin} from '@/lib/studio-security';import {quota} from '@/lib/abuse';
export async function POST(req:Request){if(!sameOrigin(req))return new Response(null,{status:403});if(req.headers.get('DNT')==='1'||req.headers.get('Sec-GPC')==='1')return new Response(null,{status:204});
 try{const d=await readSmall(req);const page=String(d.page||'').split('/')[1]||'home',source=String(d.source||'');
 if(!['home','services','portfolio','about','blog','contact','tools','privacy','lab'].includes(page)||!['Direct','Search','Social','Referral','Internal'].includes(source))return new Response(null,{status:400});
 if(!await quota(req,'traffic',180))return new Response(null,{status:429});
 const day=new Date().toISOString().slice(0,10);
 const db=getPlatformDb();
 await db.prepare('INSERT INTO traffic_totals(key,day,page,source,views) VALUES(?,?,?,?,1) ON CONFLICT(key) DO UPDATE SET views=views+1').bind(day+'|'+page+'|'+source,day,page,source).run();return new Response(null,{status:204});
 }catch{return new Response(null,{status:400});}}
