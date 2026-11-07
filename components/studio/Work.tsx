'use client';
import { useRef, useCallback } from 'react';
import type {Project} from '@/lib/studio-data';
import {ArrowUpRight} from 'lucide-react';

const wave=(phase:number)=>Array.from({length:96},(_,i)=>`${i===0?'M':'L'}${i*3.8},${74+Math.sin(i*.11+phase)*15+Math.cos(i*.33)*8+(i>42&&i<65?Math.sin(i*.7)*14:0)}`).join(' ');

export function Artwork({project:p}:{project:Project}){
 if(p.image)return <div className="art art-image"><img src={p.image} alt={p.title+' project preview'} loading="lazy" width="960" height="570"/></div>;
 return <div aria-hidden="true" className={'art art-'+p.art}>{p.art==='orbit'?<div className="project-window"><div className="window-bar"><b>Orbit Console</b><span>Waveform study</span></div><svg viewBox="0 0 365 115"><path d="M0 60H365M0 90H365M0 30H365" stroke="var(--line)" fill="none"/><path d={wave(.2)} fill="none" stroke="var(--azure)" strokeWidth="2.5"/><path d={wave(1.7)} fill="none" stroke="var(--coral)" strokeWidth="1.2"/></svg></div>:p.art==='relay'?<div className="project-window"><div className="window-bar"><b>Relay Board</b><span>Delivery workflow</span></div><div className="mini-board">{[['Queue','Project brief'],['In progress','API review'],['Released','Style guide']].map(([stage,task])=><div key={stage}><small>{stage}</small><b>{task}</b></div>)}</div></div>:<strong>{p.title}</strong>}</div>;
}

export function WorkCard({project:p,index}:{project:Project,index:number}){
 const cardRef = useRef<HTMLAnchorElement>(null);

 const handlePointerMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
  const card = cardRef.current;
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const rotY = (px - 0.5) * 22; // Tilt left / right (-11 to +11 deg)
  const rotX = (0.5 - py) * 16; // Tilt up / down (-8 to +8 deg)
  card.style.setProperty('--card-rx', `${rotX.toFixed(2)}deg`);
  card.style.setProperty('--card-ry', `${rotY.toFixed(2)}deg`);
  card.style.setProperty('--card-px', `${(px * 100).toFixed(1)}%`);
  card.style.setProperty('--card-py', `${(py * 100).toFixed(1)}%`);
  card.style.setProperty('--card-ty', '-8px');
  card.style.setProperty('--card-scale', '1.025');
 }, []);

 const handlePointerLeave = useCallback(() => {
  const card = cardRef.current;
  if (!card) return;
  card.style.setProperty('--card-rx', '0deg');
  card.style.setProperty('--card-ry', '0deg');
  card.style.setProperty('--card-ty', '0px');
  card.style.setProperty('--card-scale', '1');
 }, []);

 return (
  <a
   ref={cardRef}
   className="work-card"
   href={'/portfolio/'+p.slug}
   data-reveal
   onPointerMove={handlePointerMove}
   onPointerLeave={handlePointerLeave}
  >
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
   {href&&<a className="text-link" href={href}>{link}<ArrowUpRight size={16}/></a>}
  </div>
 );
}
