'use client';
import React, { useEffect, useRef, useState } from 'react';
import { makeTargets, noise, pigments, specimens } from '@/lib/field.mjs';
import './field.css';

const TAU = Math.PI * 2;
const HOLD_SECONDS = 8;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const ease = t => t*t*(3-2*t);

export default function Field() {
  const panel = useRef(null);
  const surface = useRef(null);
  const controls = useRef(null);
  const [selection, setSelection] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMode, setReducedMode] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);

  useEffect(() => {
    const canvas = surface.current, root = panel.current;
    const ctx = canvas.getContext('2d', {alpha:true});
    if (!ctx || !('ResizeObserver' in window) || !('IntersectionObserver' in window)) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const count = canvas.clientWidth < 440 ? 1024 : 1584;
    const forms = makeTargets(count);
    const particles = forms.cloud.map((p,i) => ({
      x:p.x,y:p.y,z:p.z,tone:p.tone,fx:p.x,fy:p.y,fz:p.z,ft:p.tone,
      dx:0,dy:0,vx:0,vy:0,delay:noise(i+291)*.15, seed:noise(i+31)
    }));

    let index=0, w=0,h=0,dpr=1,frame=0,last=0,clock=0,age=0,morph=0,burst=0;
    let isPaused=false, manual=false, inside=false,visible=true,openOverride=null,scroll=0;
    const pointer={x:-1e5,y:-1e5};
    const rain=Array.from({length:11},(_,i)=>({
      x:noise(i*7+900),y:noise(i*7+300),speed:.018+noise(i+17)*.011,phase:noise(i+110)
    }));

    function choose(next, byUser=false) {
      if(byUser)manual=true;
      for(const p of particles){p.fx=p.x;p.fy=p.y;p.fz=p.z;p.ft=p.tone;}
      index=next;age=0;morph=reduced.matches||isPaused?1.2:0;openOverride=null;setLockOpen(false);
      setSelection(next);draw(0);
    }
    function draw(dt) {
      if(!w||!h)return;
      const still=reduced.matches||isPaused;
      clock+=dt;age+=dt;morph+=dt*.79;
      if(!still && !manual && !inside && !root.contains(document.activeElement) && age>HOLD_SECONDS){
        choose((index+1)%specimens.length);return;
      }
      const id=specimens[index].id,shape=forms[id],cx=w/2,cy=h*.51;
      const scale=Math.min(w*(id==='decode'?.36:.34),h*(id==='decode'?.54:.435));
      const scrollTarget=clamp((innerHeight*.48-root.getBoundingClientRect().top)/Math.max(350,innerHeight*.85),0,1);
      if(!still || id==='lock')scroll=still?scrollTarget:scroll+(scrollTarget-scroll)*.065;
      const lockLift=id==='lock'?(openOverride === null ? scroll : Number(openOverride)):0;
      const rx=id==='decode'?0:-.18+.065*Math.sin(clock*.40);
      const ry=id==='decode'?0:(id==='print'?Math.sin(clock*.27)*.35:-.29+.22*Math.sin(clock*.31));
      const rz=id==='decode'?0:(id==='hash'?-.12:id==='print'?-.17:0)+Math.sin(clock*.28)*.014;
      const sx=Math.sin(rx),cxr=Math.cos(rx),sy=Math.sin(ry),cyr=Math.cos(ry),sz=Math.sin(rz),cz=Math.cos(rz);
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      // Low-contrast, sparse hex rain; never scrolljack or cover the model with a full-screen layer.
      ctx.font='9px ui-monospace, monospace';ctx.textAlign='center';
      for(let j=0;j<rain.length;j++){
        const drop=rain[j],x=(.045+.91*drop.x)*w,y=((drop.y+clock*drop.speed)%1.16-.08)*h;
        const hex=Math.floor((clock*.65+drop.phase*31)%256).toString(16).padStart(2,'0');
        ctx.fillStyle='rgba(21,121,141,.13)';ctx.fillText(hex,x,y);
        ctx.fillStyle='rgba(21,121,141,.075)';ctx.fillText(j%2?'0':'1',x,y-12);
      }
      const buckets=Array.from({length:8},()=>new Path2D());
      const radius=Math.min(92,w*.20),radiusSq=radius*radius;
      const dtFactor=dt?Math.min(dt*50,1.8):0;
      for(let i=0;i<count;i++){
        const p=particles[i],t=shape[i];
        const blend=still?1:ease(clamp((morph-p.delay)/.90,0,1));
        const targetY=t.y-(t.group?lockLift*.28:0);
        const targetX=t.x+(t.group?lockLift*.10:0);
        const drifting=(1-blend)*.05;
        p.x=p.fx+(targetX-p.fx)*blend+drifting*Math.sin(clock*1.1+p.seed*TAU);
        p.y=p.fy+(targetY-p.fy)*blend+drifting*Math.cos(clock+p.seed*TAU);
        p.z=p.fz+(t.z-p.fz)*blend;p.tone=p.ft+(t.tone-p.ft)*blend;
        const ax=p.x*cyr+p.z*sy,az=p.z*cyr-p.x*sy,ay=p.y*cxr-az*sx,depth=p.y*sx+az*cxr;
        const perspective=4.8/(4.8-depth*.35);
        const x=cx+(ax*cz-ay*sz)*perspective*scale,y=cy+(ax*sz+ay*cz)*perspective*scale;
        const dx=x-pointer.x,dy=y-pointer.y,ds=dx*dx+dy*dy;
        if(!still){
          if(ds<radiusSq && ds>0.01){
            const distance=Math.sqrt(ds), force=(1-distance/radius)**2*4.3*dtFactor;
            p.vx+=dx/distance*force;p.vy+=dy/distance*force;
          }
          if(burst){const length=Math.hypot(x-cx,y-cy)||1;p.vx+=(x-cx)/length*burst*(.55+p.seed);p.vy+=(y-cy)/length*burst*(.55+p.seed);}
          const damping=Math.pow(.84,dtFactor);
          p.vx=(p.vx-p.dx*.044*dtFactor)*damping;p.vy=(p.vy-p.dy*.044*dtFactor)*damping;
          p.dx+=p.vx*dtFactor;p.dy+=p.vy*dtFactor;
        }else{p.dx=p.dy=p.vx=p.vy=0;}
        const opacityTone=clamp(p.tone*.92+depth*.12+(ds<radiusSq?.12:0),0,.999);
        const b=Math.floor(opacityTone*8);
        const dot=Math.max(.66,scale*(id==='decode'?.0082:.0091))*(.93+depth*.10);
        const px=x+p.dx,py=y+p.dy;
        // A few nearby fragments briefly reveal their underlying hex character during text reconstruction.
        if(id==='decode' && !still && i%47===0 && (ds<radiusSq*.55 || blend<.55)){
          ctx.fillStyle=pigments[b];ctx.fillText(((i+Math.floor(clock*3))%256).toString(16).padStart(2,'0'),px,py);
        }else{buckets[b].moveTo(px+dot,py);buckets[b].arc(px,py,dot,0,TAU);}
      }
      burst=0;
      buckets.forEach((path,i)=>{ctx.fillStyle=pigments[i];ctx.fill(path);});
    }
    function loop(timestamp){
      frame=0;
      if(document.hidden||!visible||isPaused||reduced.matches)return;
      const delta=last?Math.min((timestamp-last)/1000,.036):0;
      if(!last || timestamp-last>=23){last=timestamp;draw(delta);}
      frame=requestAnimationFrame(loop);
    }
    function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
    function start(){if(!frame&&!document.hidden&&visible&&!isPaused&&!reduced.matches)frame=requestAnimationFrame(loop);}
    function resize(){
      w=canvas.clientWidth;h=canvas.clientHeight;dpr=Math.min(window.devicePixelRatio||1,1.7);
      canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));draw(0);
    }
    function leave(){inside=false;pointer.x=pointer.y=-1e5;}
    function move(e){inside=true;const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;}
    function down(e){move(e);if(!reduced.matches&&!isPaused){burst=8;start();}}
    function up(e){if(e.pointerType!=='mouse')leave();}
    function preference(){setReducedMode(reduced.matches);stop();leave();morph=1.2;draw(0);start();}
    function visibilityChange(){if(document.hidden)stop();else start();}
    controls.current={
      choose:next=>choose(next,true),
      toggle:()=>{isPaused=!isPaused;setPaused(isPaused);stop();if(isPaused){morph=1.2;draw(0);}else start();},
      unlock:()=>{openOverride=!openOverride;setLockOpen(openOverride);draw(0);},
      scatter:()=>{if(!reduced.matches&&!isPaused){burst=13;start();}},
    };
    const ro=new ResizeObserver(resize),io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});
    ro.observe(canvas);io.observe(root);
    canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',leave);
    reduced.addEventListener('change',preference);document.addEventListener('visibilitychange',visibilityChange);
    setReducedMode(reduced.matches);if(reduced.matches)morph=1.2;
    resize();setReady(true);start();
    return ()=>{
      stop();ro.disconnect();io.disconnect();controls.current=null;
      canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',leave);
      reduced.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibilityChange);
    };
  },[]);

  const item=specimens[selection],num=String(selection+1).padStart(2,'0');
  return <figure className="field hd-field" ref={panel} aria-label="Hash Decode interactive point-cloud sculpture">
    <div className="field-cap"><span><i/> Identity laboratory</span><span>HD—{num} / 05</span></div>
    <div className="field-stage">
      <span aria-hidden="true" className="reticle tl">+</span><span aria-hidden="true" className="reticle tr">+</span><span aria-hidden="true" className="reticle bl">+</span><span aria-hidden="true" className="reticle br">+</span>
      {!ready && <img src="/arc-field.svg" className="field-fallback" alt=""/>}
      <canvas ref={surface} role="img" aria-label={`Dotted ${item.name} sculpture. Move your pointer through it, or select a different shape below.`}/>
    </div>
    <div className="hd-field-tabs" role="group" aria-label="Particle shapes">{specimens.map((shape,i)=>
      <button key={shape.id} type="button" aria-pressed={selection===i} disabled={!ready} onClick={()=>controls.current?.choose(i)}><span>{String(i+1).padStart(2,'0')}</span>{shape.name}</button>
    )}</div>
    <figcaption><div><b>{item.label}</b><small>{reducedMode?'Reduced motion':paused?'Motion paused':'Move or tap to scatter'}</small></div>
      <div className="hd-field-actions">
        {item.id==='lock' ? <button disabled={!ready} type="button" onClick={()=>controls.current?.unlock()}>{lockOpen?'Relock':'Unlock'}</button>
          : !reducedMode && <button type="button" disabled={!ready||paused} title="Scatter particles and let them regroup" onClick={()=>controls.current?.scatter()}>↯ Disperse</button>}
        {!reducedMode && <button className="hd-pause" type="button" disabled={!ready} aria-label={paused?'Resume particle motion':'Pause particle motion'} aria-pressed={paused} onClick={()=>controls.current?.toggle()}>{paused?'▶':'Ⅱ'}</button>}
      </div>
    </figcaption>
  </figure>;
}
