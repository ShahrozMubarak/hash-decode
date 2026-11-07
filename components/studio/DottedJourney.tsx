"use client";
import {useEffect,useRef} from 'react';
import type {DottedRenderer} from '@/lib/dotted-models';
import {dottedMotion,type Pose} from '@/lib/scroll-scene';
export default function DottedJourney(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const node=canvas.current;if(!node)return;
  const landing=document.querySelector<HTMLElement>('.landing')!;
  let renderer:DottedRenderer|undefined,disposed=false,frame=0,last=0,elapsed=0,pose:Pose|undefined,visible=true,lost=false,burst=-10,velocity=0,previousY=0;
  const weak=navigator.hardwareConcurrency<=4||(navigator as Navigator&{deviceMemory?:number}).deviceMemory!<=4;
  const pointer={x:-1000,y:-1000,active:0};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  const render=(now:number)=>{
   frame=0;if(disposed||lost||document.hidden||!visible||!renderer||!pose||pose.alpha<.005)return;
   if(!last||now-last>=1000/(weak?24:40)){
    elapsed+=last?Math.min(.1,(now-last)/1000):0;last=now;
    const motion=dottedMotion(elapsed,pose.phase,elapsed-burst);velocity*=.9;
    try{renderer.draw({x:pose.x+Math.sin(elapsed*.45)*9,y:pose.y+Math.sin(elapsed*.6)*12,size:pose.size,phase:pose.distance<3?3:motion.phase,rotation:pose.yaw+(pose.distance<3?0:elapsed*.16),pitch:pose.pitch+Math.sin(elapsed*.35)*.16,distance:pose.distance,explode:pose.distance<3?0:motion.scatter+velocity*.55,time:elapsed,ambient:1,dark:pose.phase>=1?1:0,alpha:pose.alpha},pointer);landing.dataset.dots='live';}
    catch{lost=true;delete landing.dataset.dots;stop();return;}
   }
   frame=requestAnimationFrame(render);
  };
  const start=()=>{if(!frame&&renderer&&pose&&!disposed&&!lost&&!document.hidden&&visible)frame=requestAnimationFrame(render);};
  const resize=()=>renderer?.resize(innerWidth,innerHeight,Math.min(devicePixelRatio,weak?1.25:1.75));
  const scroll=(event:Event)=>{const detail=(event as CustomEvent<{desktop:Pose,position:number}>).detail;pose=detail.desktop;velocity=Math.min(1,Math.abs(detail.position-previousY)/90);previousY=detail.position;node.style.opacity=pose.alpha<.005?'0':'1';start();};
  const visibility=()=>{if(document.hidden)stop();else start();};
  const move=(event:PointerEvent)=>{if(event.pointerType!=='mouse')return;pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=1;};
  const leave=()=>{pointer.active=0;};
  const scatter=(e:PointerEvent)=>{if(!pose||e.pointerType!=='mouse'||(e.target instanceof Element&&e.target.closest('a,button,input,textarea,select')))return;if(Math.hypot(e.clientX-pose.x,e.clientY-pose.y)<pose.size*1.6){burst=elapsed;start();}};
  const onLost=(event:Event)=>{event.preventDefault();lost=true;stop();delete landing.dataset.dots;};
  const initialize=async()=>{
   try{const rendererModule=await import('@/lib/dotted-models');if(disposed)return;renderer?.destroy();renderer=rendererModule.createDottedRenderer(node,weak?8000:18000);lost=false;resize();window.dispatchEvent(new Event('hd:measure'));start();}
   catch{delete landing.dataset.dots;}
  };
  const restore=()=>{void initialize();};
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});view.observe(landing);
  const idle=setTimeout(()=>void initialize(),450);
  window.addEventListener('hd:scroll',scroll);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);window.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave);window.addEventListener('pointerdown',scatter);
  node.addEventListener('webglcontextlost',onLost);node.addEventListener('webglcontextrestored',restore);
  return()=>{disposed=true;clearTimeout(idle);stop();view.disconnect();renderer?.destroy();delete landing.dataset.dots;window.removeEventListener('hd:scroll',scroll);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);window.removeEventListener('pointerdown',scatter);node.removeEventListener('webglcontextlost',onLost);node.removeEventListener('webglcontextrestored',restore);};
 },[]);
 return <canvas className="dotted-journey" ref={canvas} aria-hidden="true"/>;
}
