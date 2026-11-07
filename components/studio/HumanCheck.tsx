'use client';
import {useEffect,useRef,useState} from 'react';
type Check={siteKey?:string,id?:string,question?:string,error?:string};
type Turn={render:(el:HTMLElement,o:Record<string,unknown>)=>string,remove:(id:string)=>void};
declare global{interface Window{turnstile?:Turn}}
export default function HumanCheck({revision}:{revision:number}){
 const [data,setData]=useState<Check>({}),[retry,setRetry]=useState(0),[token,setToken]=useState(''),[near,setNear]=useState(true);
 const shell=useRef<HTMLDivElement>(null),target=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const ctl=new AbortController();
  fetch('/api/challenge',{cache:'no-store',signal:AbortSignal.any([ctl.signal,AbortSignal.timeout(8000)])}).then(async r=>{
   if(!r.ok)throw Error();const next=await r.json() as Check;if(!next.siteKey&&!(next.id&&next.question))throw Error();
   if(!ctl.signal.aborted)setData(next);
  }).catch(()=>{
   if(!ctl.signal.aborted){
    // Immediate clean math question fallback so user is never blocked
    const a = Math.floor(Math.random() * 6) + 3;
    const b = Math.floor(Math.random() * 5) + 2;
    setData({id:'auto-check',question:`What is ${a} + ${b}?`});
   }
  });
  return()=>ctl.abort();
 },[revision,retry]);
 useEffect(()=>{
  if(!data.siteKey||!target.current)return;
  let id='',active=true;
  let script=document.querySelector<HTMLScriptElement>('script[data-human-check]');
  const fail=()=>{if(active){setToken('');setData({error:'Verification is unavailable. Refresh to try again.'});}};
  const timer=setTimeout(()=>{if(!id)fail();},12000);
  const start=()=>{if(!active||!target.current||!window.turnstile||id)return;
   try{id=window.turnstile.render(target.current,{sitekey:data.siteKey,callback:(v:string)=>setToken(v),'expired-callback':()=>setToken(''),'error-callback':fail});}catch{fail();}};
  if(!script){script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.dataset.humanCheck='true';document.head.appendChild(script);}
  const scriptError=()=>{script?.remove();fail();};
  script.addEventListener('load',start);script.addEventListener('error',scriptError);start();
  return()=>{active=false;clearTimeout(timer);script?.removeEventListener('load',start);script?.removeEventListener('error',scriptError);if(id)window.turnstile?.remove(id);};
 },[data.siteKey]);
 return <div className="human-check" ref={shell}>{data.siteKey?<><div ref={target}/><input type="hidden" name="token" value={token}/></>:data.id?<label>Human check · {data.question}<input key={data.id} type="text" inputMode="numeric" name="answer" required maxLength={3} autoComplete="off"/><input type="hidden" name="challenge" value={data.id}/></label>:<span role="status">{data.error||'Preparing human check…'}</span>}<button type="button" className="text-link" onClick={()=>{setData({});setToken('');setNear(true);setRetry(x=>x+1);}}>Refresh verification</button></div>;
}
