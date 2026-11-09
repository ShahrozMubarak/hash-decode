'use client';
import {useState,useRef,useEffect} from 'react';
import {ArrowUpRight,Eye,EyeOff,LogOut,LockKeyhole,Check} from 'lucide-react';

export default function OwnerSession({logout=false}:{logout?:boolean}){
 const locked=useRef(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [visible,setVisible]=useState(false);

 useEffect(()=>{
  if(logout)return;
  try{
    const stored=localStorage.getItem('hashdecode_owner_session');
    if(stored){
      const {token,time}=JSON.parse(stored);
      if(token && Date.now() - Number(time) < 14400000){
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        document.cookie=`studio-session=${token}; Path=/; SameSite=Lax; Max-Age=14400${isSecure ? '; Secure' : ''}`;
        fetch('/api/session', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => {
            if(r.ok) {
              window.location.replace('/admin?auth=' + Date.now());
            }
          })
          .catch(()=>{});
      }
    }
  }catch{}
 },[logout]);

 return <form className={logout?'owner-logout':'form-panel owner-login'} aria-busy={busy} onSubmit={async event=>{
  event.preventDefault();if(locked.current)return;
  const formData=new FormData(event.currentTarget);
  const email=formData.get('email');
  const password=formData.get('password');
  locked.current=true;setBusy(true);setError('');setSuccess('');
  try{
   const response=await fetch('/api/session',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:logout?'logout':'login',email,password}),signal:AbortSignal.timeout(12000)});
   if(!response.ok){
     const msg = response.status===429
       ? 'Too many attempts. Try again in a few minutes.'
       : response.status===503
       ? 'Sign-in is temporarily unavailable. Please try again.'
       : 'Unable to sign in. Check your email & password and try again.';
     setError(msg);
     return;
   }
   const data=await response.json().catch(()=>({}));
   if(!logout&&data?.token){
     setSuccess('Signed in. Opening dashboard…');
     try{
       localStorage.setItem('hashdecode_owner_session',JSON.stringify({token:data.token,email,time:Date.now()}));
       const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
       document.cookie=`studio-session=${data.token}; Path=/; SameSite=Lax; Max-Age=14400${isSecure ? '; Secure' : ''}`;
     }catch{}
     setTimeout(()=>{
       window.location.replace('/admin?auth=' + Date.now());
     },80);
     return;
   }else if(logout){
     try{
       localStorage.removeItem('hashdecode_owner_session');
       document.cookie='studio-session=; Path=/; SameSite=Lax; Max-Age=0';
       document.cookie='__Host-studio-session=; Path=/; SameSite=Lax; Max-Age=0';
     }catch{}
     setTimeout(()=>{
       window.location.replace('/admin?logged_out=' + Date.now());
     },80);
     return;
   }
   window.location.replace('/admin?auth=' + Date.now());
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
  {busy?(success || 'Please wait…'):logout?'Sign out':'Sign in'}
  {success ? <Check size={17}/> : logout ? <LogOut size={16}/> : <ArrowUpRight size={17}/>}
 </button>
 {success && <p className="form-status" style={{ color: 'var(--highlight)', fontWeight: 600 }}>{success}</p>}
 <p id={logout?undefined:'login-status'} className={error?'form-error':'form-status'} role="status" aria-live="polite">{error}</p>
 </form>;
}
