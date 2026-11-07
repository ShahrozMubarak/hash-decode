'use client';
import {useEffect,useRef,useState} from 'react';
import ModelPoster,{type PosterModel} from './ModelPoster';
import SceneBoundary from './SceneBoundary';
import {sceneBudget} from '@/lib/scene-settings';

function SceneViewport({model,autoMobile=false}:{model:PosterModel,autoMobile?:boolean}){
 const mount=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [near,setNear]=useState(false),[allowed,setAllowed]=useState(false),[automatic,setAutomatic]=useState(false);
 const [request,setRequest]=useState(0),[status,setStatus]=useState<'poster'|'loading'|'live'|'failed'|'unavailable'>('poster');
 useEffect(()=>{
  const sync=()=>setAllowed(document.documentElement.dataset.motion==='on'&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
  sync();window.addEventListener('hd:motion',sync);
  const connection=(navigator as Navigator&{connection?:{saveData?:boolean},deviceMemory?:number});
  const low=sceneBudget(innerWidth,navigator.hardwareConcurrency,connection.deviceMemory||0,devicePixelRatio).lite;
  const idle=window.setTimeout(()=>setAutomatic((autoMobile||!low)&&!connection.connection?.saveData),autoMobile?1400:700);
  const observer=new IntersectionObserver(entries=>setNear(!!entries[0]?.isIntersecting),{rootMargin:'100% 0px'});
  if(mount.current)observer.observe(mount.current);
  return()=>{clearTimeout(idle);observer.disconnect();window.removeEventListener('hd:motion',sync);};
 },[autoMobile]);
 const active=near&&allowed&&(automatic||request>0);
 useEffect(()=>{
  if(!active||!canvas.current)return;
  const node=canvas.current,controller=new AbortController();let lastState='';
  const update=(state:'loading'|'live'|'failed')=>{if(!controller.signal.aborted&&lastState!==state){lastState=state;setStatus(state);}};
  const context=node.getContext('webgl2',{alpha:true,antialias:innerWidth>=700,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!context){queueMicrotask(()=>{if(!controller.signal.aborted)setStatus('unavailable');});return()=>controller.abort();}
  update('loading');
  import('@/lib/studio-scene').then(async({mountScene})=>{if(!controller.signal.aborted)await mountScene(node,model,controller.signal,()=>update('live'),()=>update('failed'));}).catch(()=>update('failed'));
  return()=>controller.abort();
 },[active,model,request]);
 const live=active&&status==='live';
 return <div className={'scene-surface'+(live?' live':'')} ref={mount}>
  <div className="scene-poster"><ModelPoster model={model}/></div>
  {active&&<canvas key={model+request} ref={canvas} aria-hidden="true"/>}
  {!autoMobile&&allowed&&status!=='unavailable'&&(!live||model==='cube')&&<button type="button" className="scene-action" disabled={active&&status==='loading'} onClick={()=>live?canvas.current?.dispatchEvent(new Event('hd:recompute')):setRequest(v=>v+1)}>
   {live?'Reassemble':status==='failed'?'Retry 3D':active&&status==='loading'?'Loading 3D…':'View in 3D'}
  </button>}
 </div>;
}

export default function SceneSurface({model,autoMobile=false}:{model:PosterModel,autoMobile?:boolean}){return <SceneBoundary key={model} model={model}><SceneViewport model={model} autoMobile={autoMobile}/></SceneBoundary>;}
