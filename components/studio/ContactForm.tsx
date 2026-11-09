'use client';
import HumanCheck from './HumanCheck';
import {useRef,useState} from 'react';
import {ArrowUpRight,Check} from 'lucide-react';
export const topics=['Digital product','Web platform','Business system','Security audit','Something else'];
export default function ContactForm({initial='',initialBrief=''}:{initial?:string,initialBrief?:string}){
 const lock=useRef(false),last=useRef({signature:"",id:""});
 const [revision,setRevision]=useState(0);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState('');
 if(receipt)return <section className="form-panel confirmation" role="status"><Check size={32}/><p className="eyebrow">Brief received / {receipt}</p><h2>Thanks for the brief.</h2><p>Your inquiry is in the studio inbox. We can follow up at the email address you provided.</p><a className="hd-text-link" href="/portfolio"><span>Explore the work</span><span className="link-arrow">↗</span></a></section>;
 return <form className="form-panel" aria-busy={busy} onSubmit={async event=>{
  event.preventDefault();if(lock.current)return;
  const data=Object.fromEntries(new FormData(event.currentTarget));
  const signature=JSON.stringify([data.name,data.email,data.topic,data.budget,data.brief]);
  if(signature!==last.current.signature)last.current={signature,id:typeof crypto.randomUUID==='function'?crypto.randomUUID():''};
  lock.current=true;setBusy(true);setError('');
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('hd:form-submitting'));
  try{
   const r=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,...(last.current.id?{submissionId:last.current.id}:{})}),signal:AbortSignal.timeout(18000)});
   if(!r.ok){
    const msg = r.status===429?'Too many attempts. Please try again later.':r.status===422?'Please answer the new verification question and send again.':r.status===400?'Check the required fields and try again.':'Your brief could not be confirmed. Please try again.';
    setError(msg);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('hd:form-error', { detail: { error: msg } }));
    setRevision(x=>x+1);return;
   }
   const result=await r.json() as {reference?:string};if(!result.reference)throw Error();setReceipt(result.reference);
   if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('hd:form-success', { detail: { reference: result.reference } }));
  }catch{
   const msg = 'Your brief could not be confirmed. Your details are still here. Please retry.';
   setRevision(x=>x+1);setError(msg);
   if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('hd:form-error', { detail: { error: msg } }));
  }
  finally{lock.current=false;setBusy(false);}
 }}>
 <div className="form-row"><label>Your name<input name="name" autoComplete="name" placeholder="Full name" minLength={2} maxLength={100} required/></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} required/></label></div>
 <label>What are you building?<select name="topic" defaultValue={topics.includes(initial)?initial:''} required><option value="" disabled>Select a project type</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label>
 <label>Budget range<select name="budget" defaultValue="Still exploring" required>{['Under US$2,500','US$2,500–7,500','US$7,500–20,000','US$20,000+','Still exploring'].map(b=><option key={b}>{b}</option>)}</select></label>
 <label>Project details<textarea defaultValue={initialBrief.slice(0,1200)} name="brief" placeholder="Who is it for, and what should it help them do?" minLength={12} maxLength={3000} rows={5} required/></label>
 <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
 <HumanCheck key={revision} revision={revision}/><p className="form-note">Your details are used to respond to this project inquiry.</p><div role="status" aria-live="polite">{error|| (busy?"Sending your brief…":"")}</div><button id="send-brief-btn" className={`hd-btn-primary send-brief-btn cta-magnetic ${busy ? 'is-loading' : ''}`} disabled={busy} aria-busy={busy} type="submit"><span className="btn-label">{busy?'Sending brief…':'Send project brief'}</span><span className="btn-arrow-circle" aria-hidden="true"><span className="btn-arrow-track"><span className="btn-arrow-icon btn-arrow-primary"><ArrowUpRight size={15}/></span><span className="btn-arrow-icon btn-arrow-clone"><ArrowUpRight size={15}/></span></span></span><span className="btn-spinner" aria-hidden="true"/></button></form>;
}
