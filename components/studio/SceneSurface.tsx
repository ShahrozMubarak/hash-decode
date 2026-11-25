'use client';
import {useEffect,useRef,useState} from 'react';
import type { PosterModel } from './ModelPoster';
import SceneBoundary from './SceneBoundary';

let activeScenes = 0;
function SceneViewport({model}:{model:PosterModel,autoMobile?:boolean}){
 const mount=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [near,setNear]=useState(false);
 const [status,setStatus]=useState<'loading'|'live'|'failed'|'unavailable'>('loading');

 useEffect(()=>{
  const checkNear = () => {
   if (!mount.current) return false;
   const rect = mount.current.getBoundingClientRect();
   return rect.top < (window.innerHeight + 300) && rect.bottom > -300;
  };
  setNear(checkNear());

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
  const update = (state: 'loading' | 'live' | 'failed') => {
    if (!controller.signal.aborted && lastState !== state) {
      lastState = state;
      setStatus(state);
      if (state === 'live' || state === 'failed') {
        if (typeof window !== 'undefined') {
          (window as Window & { __hd_model_ready?: boolean }).__hd_model_ready = true;
          window.dispatchEvent(new CustomEvent('hd:model-ready'));
        }
      }
    }
  };
  update('loading');
  let idleId = 0;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const startScene = () => {
    if (controller.signal.aborted) return;
    import('@/lib/studio-scene')
     .then(async({mountScene})=>{
      if(!controller.signal.aborted){
       await mountScene(node,targetModel,controller.signal,()=>update('live'),()=>update('failed'));
      }
     })
     .catch(()=>{
      update('failed');
     });
  };
  // Defer heavy Three.js import until after initial paint & hydration
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(startScene, { timeout: 120 });
  } else {
    timerId = setTimeout(startScene, 32);
  }
  return()=>{
    if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
      (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
    }
    if (timerId) clearTimeout(timerId);
    controller.abort();
    activeScenes--;
  };
 },[active,targetModel]);

 const live=active&&status==='live';
 return (
  <div className={'scene-surface'+(live?' live':'')} ref={mount}>
   {!live && (
     <div className="scene-model-loader" aria-hidden="true">
       <div className="model-lazy-line" />
     </div>
   )}
   {active&&<canvas key={targetModel} ref={canvas} aria-hidden="true"/>}
  </div>
 );
}

export default function SceneSurface({model,autoMobile=false}:{model:PosterModel,autoMobile?:boolean}){
 return <SceneBoundary key={model} model={model}><SceneViewport model={model} autoMobile={autoMobile}/></SceneBoundary>;
}
