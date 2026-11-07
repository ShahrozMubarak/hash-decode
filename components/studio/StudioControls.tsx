'use client';
import {useEffect,useRef,useState} from 'react';
import SceneSurface from './SceneSurface';
import ContactForm from './ContactForm';

const models=[
 {id:'eva',name:'Eva Robot',note:'Autonomous studio model. Floating multi-mesh robot study with 360 camera path and azure lighting.'},
 {id:'halo',name:'Titanium Halo',note:'A machined ring with a recessed barrel, radial fasteners and a fine luminous inner rim.'}
] as const;
export function Gallery(){
 const [mobile,setMobile]=useState<boolean|null>(null);
 useEffect(()=>{const query=matchMedia('(max-width:850px)');const sync=()=>setMobile(query.matches);sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync);},[]);
 const [selected,setSelected]=useState(0),tabs=useRef<(HTMLButtonElement|null)[]>([]);
 const manual=useRef<number|null>(null);
 useEffect(()=>{
  const scroll=(event:Event)=>{
   if(document.documentElement.dataset.motion!=='on'||!matchMedia('(min-width:981px) and (min-height:700px)').matches)return;
   const {gallery,position}=(event as CustomEvent<{gallery:number,position:number}>).detail;
   if(manual.current!==null&&Math.abs(position-manual.current)<innerHeight*.4)return;
   manual.current=null;setSelected(Math.min(models.length-1,Math.floor(gallery*models.length)));
  };
  window.addEventListener('hd:scroll',scroll);return()=>window.removeEventListener('hd:scroll',scroll);
 },[]);
 const choose=(index:number)=>{manual.current=scrollY;setSelected(index);};
 const model=models[selected];
 return <><div className="mobile-gallery"><div className="mobile-halo-object">{mobile===true&&<SceneSurface model="eva" autoMobile/>}</div><h3>Eva Robot</h3><p>Autonomous studio robot with dynamic lighting and floating physics.</p></div><div className="gallery desktop-gallery"><div className="gallery-list" role="tablist" aria-label="Studio models">{models.map((m,i)=>
  <button key={m.id} ref={el=>{tabs.current[i]=el;}} id={'tab-'+m.id} type="button" role="tab" aria-selected={i===selected} aria-controls="model-panel" tabIndex={i===selected?0:-1} onClick={()=>choose(i)} onKeyDown={e=>{
    let next=i;
    if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%models.length;
    else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i+models.length-1)%models.length;
    else if(e.key==='Home')next=0;else if(e.key==='End')next=models.length-1;else return;
    e.preventDefault();choose(next);tabs.current[next]?.focus();
  }}><small>0{i+1}</small>{m.name}<span aria-hidden="true">↗</span></button>)}</div>
  <div role="tabpanel" id="model-panel" tabIndex={0} aria-labelledby={'tab-'+model.id} className="gallery-panel">
   <div className="gallery-object"><span className="model-annotation annotation-left" aria-hidden="true">FORM / {model.id==='eva'?'01':'02'}</span><span className="model-annotation annotation-right" aria-hidden="true">AZURE · BLUE</span>{mobile===false&&<SceneSurface key={model.id} model={model.id}/>}</div><p>{model.note}</p>
  </div></div></>;
}
export function BriefDialog(){
 const dialog=useRef<HTMLDialogElement>(null),[open,setOpen]=useState(false);
 return <><button className="text-link" onClick={()=>{setOpen(true);dialog.current?.showModal();}}>Open brief in a dialog ↗</button><dialog ref={dialog} aria-label="Project brief" onClose={()=>setOpen(false)}><button className="outline" onClick={()=>dialog.current?.close()}>Close</button>{open&&<ContactForm/>}</dialog></>;
}
export function IntroDecode(){
 const [label,setLabel]=useState('');
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce), (max-width:850px)').matches)return;
  try{if(sessionStorage.getItem('hd-intro')||localStorage.getItem('hd-paused')==='1')return;sessionStorage.setItem('hd-intro','1');}catch{return;}
  const frames=['48 41 53 48','HASH 44 45','HASH DEC0DE','HASH DECODE'];
  const timers=frames.map((frame,i)=>setTimeout(()=>setLabel(frame),i*110));timers.push(setTimeout(()=>setLabel(''),620));
  const skip=()=>{timers.forEach(clearTimeout);setLabel('');};
  window.addEventListener('hd:skip',skip);
  return ()=>{timers.forEach(clearTimeout);window.removeEventListener('hd:skip',skip);};
 },[]);
 if(!label)return null;
 return <button className="intro-decode" aria-label="Skip studio introduction" onClick={()=>window.dispatchEvent(new Event('hd:skip'))}><span>{label}</span><small>Skip intro ↗</small></button>;
}
