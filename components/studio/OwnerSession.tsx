'use client';
import {useState,useRef} from 'react';
import {ArrowUpRight,Eye,EyeOff,LogOut,LockKeyhole} from 'lucide-react';
export default function OwnerSession({logout=false}:{logout?:boolean}){
 const locked=useRef(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[visible,setVisible]=useState(false);
 return <form className={logout?'owner-logout':'form-panel owner-login'} aria-busy={busy} onSubmit={async event=>{
  event.preventDefault();if(locked.current)return;
  const formData=new FormData(event.currentTarget);
  const email=formData.get('email');
  const password=formData.get('password');
  locked.current=true;setBusy(true);setError('');
  try{
   const response=await fetch('/api/session',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:logout?'logout':'login',email,password}),signal:AbortSignal.timeout(12000)});
   if(!response.ok){setError(response.status===429?'Too many attempts. Try again in 15 minutes.':response.status===503?'Sign-in is temporarily unavailable. Please try again.':'Unable to sign in. Check your email & password and try again.');return;}
   location.replace('/admin');
  }catch{setError('Connection interrupted. Please try again.');}finally{locked.current=false;setBusy(false);}
 }}>
 {!logout&&<>
  <span className="login-mark"><LockKeyhole size={24}/></span>
  <h2>Welcome back.</h2>
  <p>Sign in to manage your projects, content and studio briefs.</p>
  <label htmlFor="owner-email">Owner email</label>
  <input id="owner-email" name="email" type="email" required defaultValue="shaahrozdogar@gmail.com" autoComplete="username" style={{marginBottom:'1rem'}}/>
  <label htmlFor="owner-password">Owner password</label>
  <div className="password-field">
    <input id="owner-password" name="password" type={visible?'text':'password'} required minLength={4} maxLength={256} autoComplete="current-password" aria-describedby="login-help login-status"/>
    <button type="button" className="password-toggle" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'} aria-pressed={visible}>
      {visible?<EyeOff size={18}/>:<Eye size={18}/>}
    </button>
  </div>
  <p className="tiny" id="login-help">Sign in using your email and owner password.</p>
 </>}
 <button className={logout?'outline':'cta'} disabled={busy}>
  {busy?'Please wait…':logout?'Sign out':'Sign in'}
  {logout?<LogOut size={16}/>:<ArrowUpRight size={17}/>}
 </button>
 <p id={logout?undefined:'login-status'} className={error?'form-error':'form-status'} role="status" aria-live="polite">{error}</p>
 </form>;
}
