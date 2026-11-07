import {notFound} from 'next/navigation';
import {listProjects} from '@/lib/studio-data';
import {Artwork} from '@/components/studio/Work';
import {meta} from '@/lib/meta';
import {ArrowUpRight} from 'lucide-react';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const {slug}=await params;const p=(await listProjects()).find(x=>x.slug===slug);return p?meta(p.title,p.summary,'/portfolio/'+p.slug):{title:'Project not found',robots:{index:false}};}
export default async function Case({params}:Props){const {slug}=await params;const all=await listProjects();const p=all.find(x=>x.slug===slug);if(!p)notFound();
const demo=['orbit-console','relay-board'].includes(p.slug)?'/lab/'+p.slug:'';
const next=all.length>1?all[(all.indexOf(p)+1)%all.length]:null;
return <article className="wrap interior case"><a className="back-link" href="/portfolio">← Project index</a><header className="page-intro"><p className="eyebrow"><i/>{p.kind} / {p.category}</p><h1>{p.title}<em>.</em></h1><p>{p.summary}</p>{(p.url||demo)&&<a className="cta" href={p.url||demo} target={p.url?'_blank':undefined} rel={p.url?'noopener noreferrer':undefined}>{p.url?'Visit live website':'Launch interactive study'} <ArrowUpRight size={17}/></a>}</header><Artwork project={p}/><div className="case-details">{[[p.challenge,'The brief'],[p.solution,'The build'],[p.tech,'Technology'],[p.result,'The result']].filter(([v])=>v).map(([v,t],i)=><section key={t} data-reveal><p className="eyebrow">0{i+1} / Case notes</p><h2>{t}</h2><p>{v}</p></section>)}</div>{next&&<a className="next-work" href={'/portfolio/'+next.slug}><div><p className="eyebrow">Next project</p><h2>{next.title}</h2></div><ArrowUpRight/></a>}</article>;}
