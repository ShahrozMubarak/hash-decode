'use client';
import {useEffect,useState} from 'react';
export default function AdminSessionGuard(){
 const [expired,setExpired]=useState(false);
 useEffect(()=>{
  let canceled=false,checking=false;const abort=new AbortController();
  const expire=()=>setExpired(true);
  const check=async()=>{
   if(document.hidden||checking)return;checking=true;
   try{const response=await fetch('/api/session',{cache:'no-store',signal:AbortSignal.any([abort.signal,AbortSignal.timeout(8000)])});if(response.status===401&&!canceled)expire();}catch{/* The next visible check retries a temporary connection failure. */}finally{checking=false;}
  };
  const timer=setInterval(()=>void check(),60000);document.addEventListener('visibilitychange',check);window.addEventListener('hd:session-expired',expire);
  return()=>{canceled=true;abort.abort();clearInterval(timer);document.removeEventListener('visibilitychange',check);window.removeEventListener('hd:session-expired',expire);};
 },[]);
 return expired?<div className="session-notice" role="alert"><strong>Your session has ended.</strong><p>Copy any unsaved edits before signing in again. Changes are protected until you sign in.</p><a className="outline" href="/admin">Return to sign-in ↗</a></div>:null;
}
