import {quota} from '@/lib/abuse';
import {readSmall,sameOrigin} from '@/lib/studio-security';
import {issueSession,revokeSession,sessionCookie,verifyPassword,sessionValid} from '@/lib/owner-session';
export async function POST(req:Request){
  const reply=(status:number,error?:string,cookie?:string)=>Response.json(error?{error}:{ok:true},{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
  if(!sameOrigin(req)) return reply(403,'Request denied.');
  let body;
  try{body=await readSmall(req);}catch{return reply(400,'Invalid request.');}
  try{
    if(body.action==='logout'){
      await revokeSession(req.headers.get('cookie'));
      return reply(200,undefined,sessionCookie('',0));
    }
    if(body.action!=='login')return reply(400,'Invalid request.');
    if(!await quota(req,'owner-login',8,15*60*1000))return reply(429,'Please try again in 15 minutes.');
    if(!await verifyPassword(body.password))return reply(401,'Sign-in failed.');
    return reply(200,undefined,await issueSession());
  }catch{return reply(503,'Sign-in is temporarily unavailable.');}
}

export async function GET(req:Request){
 try{const ok=await sessionValid(req.headers.get('cookie'));return Response.json({ok},{status:ok?200:401,headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Session check unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
