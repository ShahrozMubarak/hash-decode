import {origin} from '@/lib/meta';
export function GET(){
  if(!origin)return new Response('Site origin is not configured.',{status:503});
  const expires=new Date(Date.now()+180*86400000).toISOString();
  return new Response(['Contact: '+origin+'/contact','Expires: '+expires,'Canonical: '+origin+'/.well-known/security.txt','Preferred-Languages: en',''].join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=86400'}});
}
