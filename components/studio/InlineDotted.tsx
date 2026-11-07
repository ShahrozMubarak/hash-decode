'use client';
import {useEffect,useRef} from 'react';
import DottedPoster from './DottedPoster';
import type {DottedRenderer} from '@/lib/dotted-models';
import {dottedMotion} from '@/lib/scroll-scene';
export default function InlineDotted({form=3}:{form?:number}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!host.current)return;const element:HTMLDivElement=host.current;
  let renderer:DottedRenderer|undefined,canvas:HTMLCanvasElement|undefined,disposed=false,visible=false,loading=false,frame=0,last=0,time=0,burst=-10;
  const pointer={x:-1000,y:-1000,active:0};
  const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
  const enabled=()=>!connection?.saveData&&document.documentElement.dataset.motion==='on'&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  const clear=()=>{stop();renderer?.destroy();renderer=undefined;canvas?.remove();canvas=undefined;delete element.dataset.live;};
  const render=(now:number)=>{
   frame=0;if(!renderer||!visible||document.hidden||!enabled())return;
   if(!last||now-last>=1000/24){time+=last?Math.min(.1,(now-last)/1000):0;last=now;const rect=element.getBoundingClientRect(),motion=dottedMotion(time,form,time-burst);
    try{renderer.draw({x:rect.width/2,y:rect.height/2,size:Math.min(rect.width,rect.height)*.32,phase:motion.phase,rotation:time*.16-.25,pitch:.1,distance:3.8,explode:motion.scatter*.65,time,ambient:.6,dark:1,alpha:1},pointer);element.dataset.live='true';}catch{clear();return;}
   }frame=requestAnimationFrame(render);
  };
  const sync=async()=>{
   if(!enabled()||!visible||document.hidden){clear();return;}if(renderer){if(!frame)frame=requestAnimationFrame(render);return;}if(loading)return;loading=true;
   try{const {createDottedRenderer}=await import('@/lib/dotted-models');if(disposed||!enabled()||!visible||document.hidden)return;
    canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');element.appendChild(canvas);renderer=createDottedRenderer(canvas,innerWidth<=850?6500:12000);resize();frame=requestAnimationFrame(render);
    canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restore);
   }catch{clear();}finally{loading=false;}
  };
  function resize(){if(renderer){const rect=element.getBoundingClientRect();renderer.resize(rect.width,rect.height,Math.min(devicePixelRatio,innerWidth<=850?1.25:1.5));}}
  function lost(event:Event){event.preventDefault();stop();delete element.dataset.live;}
  function restore(){clear();void sync();}
  const motion=()=>{void sync();};
  const move=(e:PointerEvent)=>{const r=element.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=1;};
  const leave=()=>{pointer.active=0;};const tap=()=>{burst=time;};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;void sync();},{rootMargin:'100px'});observer.observe(element);
  const size=new ResizeObserver(resize);size.observe(element);
  window.addEventListener('hd:motion',motion);document.addEventListener('visibilitychange',motion);element.addEventListener('pointermove',move,{passive:true});element.addEventListener('pointerleave',leave);element.addEventListener('pointerdown',tap);
  return()=>{disposed=true;clear();observer.disconnect();size.disconnect();window.removeEventListener('hd:motion',motion);document.removeEventListener('visibilitychange',motion);element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);element.removeEventListener('pointerdown',tap);};
 },[form]);
 return <div className="inline-dotted" ref={host}><div className="inline-dotted-poster"><DottedPoster/></div></div>;
}
