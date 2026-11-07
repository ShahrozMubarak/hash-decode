import {meta} from '@/lib/meta';
import {notFound} from 'next/navigation';import {OrbitLab,RelayLab} from '@/components/studio/Lab';import {listProjects} from '@/lib/studio-data';
export const dynamic='force-dynamic';export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const item=(await listProjects()).find(p=>p.slug===slug);
 return item?{...meta(item.title+' Interactive Study',item.summary,'/lab/'+slug),robots:{index:false,follow:true}}:{title:'Study unavailable',robots:{index:false}};
}
export default async function Lab({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!['orbit-console','relay-board'].includes(slug))notFound();const p=(await listProjects()).find(x=>x.slug===slug);if(!p)notFound();return <div className="wrap interior"><a href={'/portfolio/'+slug} className="back-link">← Case study</a><header className="page-intro"><p className="eyebrow"><i/> Interactive studio concept</p><h1>{p.title}<em>.</em></h1><p>{slug==='orbit-console'?'Adjust the controls to shape the signal.':'Add a task and move it through the delivery stages. Changes stay in this session.'}</p></header>{slug==='orbit-console'?<OrbitLab/>:<RelayLab/>}</div>;}
