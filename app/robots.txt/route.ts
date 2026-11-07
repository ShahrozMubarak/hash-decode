import {origin} from '@/lib/meta';
export function GET(){if(!origin)return new Response('User-agent: *\nDisallow: /\n');return new Response('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: '+origin+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
