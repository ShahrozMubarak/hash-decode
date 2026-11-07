import {entries} from '@/lib/cms';
import {origin} from '@/lib/meta';
import {listProjects} from '@/lib/studio-data';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const release='2026-11-06';
export async function GET(){
 if(!origin)return new Response('Site origin is not configured.',{status:503});
 const [posts,projects,edits]=await Promise.all([entries('post'),listProjects(),env.DB!.prepare("SELECT id,value FROM settings WHERE id LIKE 'modified:%'").all<{id:string,value:string}>()]);
 const updates=new Map(edits.results.map(r=>[r.id.slice(9),r.value]));
 const sectionTime=(path:string)=>updates.get(path)||release;
 const pages=['/','/portfolio','/services','/about','/contact','/blog','/privacy','/tools','/tools/security-check','/tools/estimate'].map(path=>[path,sectionTime(path)]);
 for(const post of posts)pages.push(['/blog/'+encodeURIComponent(post.id),post.updated?new Date(post.updated).toISOString():release]);
 for(const p of projects){const path='/portfolio/'+encodeURIComponent(p.slug);pages.push([path,sectionTime(path)]);}
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(([path,modified])=>'<url><loc>'+origin+path+'</loc><lastmod>'+modified+'</lastmod></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});
}
