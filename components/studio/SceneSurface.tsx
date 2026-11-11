'use client';
import {useEffect,useRef,useState} from 'react';
import ModelPoster,{type PosterModel} from './ModelPoster';
import SceneBoundary from './SceneBoundary';

let activeScenes = 0;
function SceneViewport({model}:{model:PosterModel,autoMobile?:boolean}){
 const mount=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [near,setNear]=useState(true);
 const [status,setStatus]=useState<'poster'|'loading'|'live'|'failed'|'unavailable'>('loading');

 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{
   if(entries[0]) setNear(entries[0].isIntersecting);
  },{rootMargin:'200px 0px'});
  if(mount.current)observer.observe(mount.current);
  return()=>{observer.disconnect();};
 },[]);

 const active=near;
 const isMobile=typeof window!=='undefined'&&window.innerWidth<=850;
 const targetModel=(isMobile&&model==='fixer')?'eva':model;

 useEffect(()=>{
  if(!active||!canvas.current)return;
  if(activeScenes >= 4) return;
  activeScenes++;
  const node=canvas.current,controller=new AbortController();let lastState='';
  const update=(state:'loading'|'live'|'failed')=>{if(!controller.signal.aborted&&lastState!==state){lastState=state;setStatus(state);}};
  update('loading');
  import('@/lib/studio-scene')
   .then(async({mountScene})=>{
    if(!controller.signal.aborted){
     await mountScene(node,targetModel,controller.signal,()=>update('live'),()=>update('failed'));
    }
   })
   .catch((err)=>{
    console.error('SceneSurface mount error:', err);
    update('failed');
   });
  return()=>{controller.abort();activeScenes--;};
 },[active,targetModel]);

 const live=active&&status==='live';
 return <div className={'scene-surface'+(live?' live':'')} ref={mount}>
  <div className="scene-poster"><ModelPoster model={targetModel}/></div>
  {active&&<canvas key={targetModel} ref={canvas} aria-hidden="true"/>}
 </div>;
}

export default function SceneSurface({model,autoMobile=false}:{model:PosterModel,autoMobile?:boolean}){
 return <SceneBoundary key={model} model={model}><SceneViewport model={model} autoMobile={autoMobile}/></SceneBoundary>;
}
