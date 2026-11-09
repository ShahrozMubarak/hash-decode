'use client';
import type {Project} from '@/lib/studio-data';
import {ArrowUpRight} from 'lucide-react';

const wave=(phase:number)=>Array.from({length:96},(_,i)=>`${i===0?'M':'L'}${i*3.8},${74+Math.sin(i*.11+phase)*15+Math.cos(i*.33)*8+(i>42&&i<65?Math.sin(i*.7)*14:0)}`).join(' ');

export function Artwork({project:p}:{project:Project}){
 if(p.image)return <div className="art art-image"><img src={p.image} alt={p.title+' project preview'} loading="lazy" width="960" height="570"/></div>;
 return <div aria-hidden="true" className={'art art-'+p.art}>{p.art==='orbit'?<div className="project-window"><div className="window-bar"><b>Orbit Console</b><span>Waveform study</span></div><svg viewBox="0 0 365 115"><path d="M0 60H365M0 90H365M0 30H365" stroke="var(--line)" fill="none"/><path d={wave(.2)} fill="none" stroke="var(--azure)" strokeWidth="2.5"/><path d={wave(1.7)} fill="none" stroke="var(--coral)" strokeWidth="1.2"/></svg></div>:p.art==='relay'?<div className="project-window"><div className="window-bar"><b>Relay Board</b><span>Delivery workflow</span></div><div className="mini-board">{[['Queue','Project brief'],['In progress','API review'],['Released','Style guide']].map(([stage,task])=><div key={stage}><small>{stage}</small><b>{task}</b></div>)}</div></div>:<strong>{p.title}</strong>}</div>;
}

export function WorkCard({project:p,index}:{project:Project,index:number}){
 return (
  <a
   className="work-card"
   href={'/portfolio/'+p.slug}
   data-reveal
  >
   <div className="card-glare" aria-hidden="true" />
   <Artwork project={p}/>
   <div className="work-caption">
    <div>
     <div className="card-tags">
      <span className="pill-tag">{p.category}</span>
      <span className="pill-kind">{p.kind}</span>
     </div>
     <p className="eyebrow">{String(index+1).padStart(2,'0')} <span>/</span> {p.category}</p>
     <h3>{p.title}</h3>
     <p className="work-summary">{p.summary}</p>
    </div>
    <span className="card-arrow"><ArrowUpRight size={20}/></span>
   </div>
  </a>
 );
}

export function SectionTitle({index,kicker,title,href,link}:{index:string,kicker:string,title:string,href?:string,link?:string}){
 return (
  <div className="section-head" data-reveal>
   <div>
    <p className="eyebrow"><i/>{index} &nbsp;/&nbsp; {kicker}</p>
    <h2>{title}</h2>
   </div>
   {href&&<a className="hd-text-link" href={href}><span>{link}</span><span className="link-arrow"><ArrowUpRight size={16}/></span></a>}
  </div>
 );
}
