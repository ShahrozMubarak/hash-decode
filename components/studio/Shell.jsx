'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,Menu,X,Pause,Play,Briefcase,Cpu,Users,Mail,ShieldCheck,Search,ShoppingBag,Terminal} from 'lucide-react';
import {Chat} from './Chat';
import FooterSubscribe from './FooterSubscribe';

const links=[
  {name:'Work',url:'/portfolio',icon:Briefcase},
  {name:'Services',url:'/services',icon:Cpu},
  {name:'About',url:'/about',icon:Users},
  {name:'Contact',url:'/contact',icon:Mail}
];

export function Brand(){
 const [word,setWord]=useState('DECODE'),timer=useRef(null);
 useEffect(()=>()=>clearInterval(timer.current),[]);
 function decode(){
  const root=document.documentElement;
  if(root.dataset.motion!=='on'||timer.current)return;
  const frames=['D3C0D3','DEC0DE','DECODE'];let i=0;
  timer.current=setInterval(()=>{setWord(frames[i++]);if(i===frames.length){clearInterval(timer.current);timer.current=null;}},55);
 }
 return <a className="brand" href="/" aria-label="HASHDECODE home" onPointerEnter={decode} onFocus={decode}><img src="/logo.png" alt="Hash Decode" className="brand-logo" width="34" height="34" /><strong>HASH<span>{word}</span></strong></a>;
}
export function Header(){
 const [open,setOpen]=useState(false),[paused,setPaused]=useState(false),toggle=useRef(null),menu=useRef(null);
 const path=usePathname();
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[open]);
 function openMenu(){menu.current?.showModal();setOpen(true);}
 function closeMenu(){menu.current?.close();setOpen(false);toggle.current?.focus();}

 useEffect(()=>{
   const preference=matchMedia('(prefers-reduced-motion: reduce)');
   const sync=()=>{let saved=false;try{saved=localStorage.getItem('hd-paused')==='1';}catch{}
    const paused=preference.matches||saved;document.documentElement.dataset.motion=paused?'off':'on';setPaused(paused);window.dispatchEvent(new Event('hd:motion'));};
   sync();preference.addEventListener('change',sync);return()=>preference.removeEventListener('change',sync);
 },[]);
 function pause(){
   const next=!paused||matchMedia('(prefers-reduced-motion: reduce)').matches;
   try{localStorage.setItem('hd-paused',next?'1':'0');}catch{}
   document.documentElement.dataset.motion=next?'off':'on';setPaused(next);window.dispatchEvent(new Event('hd:motion'));window.dispatchEvent(new Event('hd:skip'));
 }
 return (
  <header className="site-header ronin-header" onKeyDown={e=>{if(open&&e.key==='Escape')closeMenu();}}>
    <a className="skip" href="#main">Skip to content</a>
    <div className="wrap nav ronin-nav">
      <div className="ronin-brand-wrap">
        <Brand/>
      </div>
      <nav id="site-links" className="site-links ronin-links" aria-label="Main navigation">
        {links.map(({name,url,icon:Icon})=>(
          <a href={url} aria-current={path===url?'page':undefined} key={url} className="ronin-nav-item" onClick={()=>setOpen(false)}>
            <Icon size={15} className="ronin-nav-icon" aria-hidden="true" />
            <strong className="ronin-nav-text">{name}</strong>
          </a>
        ))}
      </nav>
      <div className="nav-actions ronin-actions">
        <button type="button" className="icon-btn motion-toggle ronin-icon-btn" onClick={pause} aria-pressed={paused} title={paused?'Resume motion':'Pause motion'} aria-label={paused?'Resume motion':'Pause motion'}>
          {paused?<Play size={15}/>:<Pause size={15}/>}
        </button>
        <a className="nav-contact ronin-cta-pill" href="/contact">
          <Terminal size={14} aria-hidden="true" />
          <span>Get in touch</span>
          <ArrowUpRight size={14}/>
        </a>
        <button className="icon-btn nav-toggle ronin-icon-btn" ref={toggle} aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="studio-menu" onClick={openMenu}>
          {open?<X size={20}/>:<Menu size={20}/>}
        </button>
      </div>
    </div>
    <dialog ref={menu} id="studio-menu" className="studio-menu" aria-label="Explore Hash Decode" onClose={()=>{setOpen(false);toggle.current?.focus();}} onClick={e=>{if(e.target===menu.current)closeMenu();}}>
      <div className="menu-panel">
        <div className="menu-top">
          <span className="kicker">HASH DECODE / INDEX</span>
          <button className="icon-btn" onClick={closeMenu} aria-label="Close menu"><X size={22}/></button>
        </div>
        <nav aria-label="Studio navigation">
          {links.map(({name,url,icon:Icon},i)=>(
            <a href={url} key={url} aria-current={path===url?'page':undefined} onClick={closeMenu}>
              <small>0{i+1}</small>
              <Icon size={16} style={{marginRight:8}}/>
              <strong>{name}</strong>
              <ArrowUpRight size={24}/>
            </a>
          ))}
        </nav>
        <div className="menu-bottom">
          <p>Software. Security. Digital craft.</p>
          <a className="cta" href="/contact">Start a project <ArrowUpRight size={17}/></a>
        </div>
        <span className="menu-ghost" aria-hidden="true">DECODE</span>
      </div>
    </dialog>
  </header>
 );
}
export function Footer(){
  return (
    <footer className="site-footer">
      <div className="wrap footer-content-grid">
        <FooterSubscribe />
        <div className="footer-side-actions">
          <div className="footer-whatsapp-box">
            <span className="footer-whatsapp-tag">Direct Line</span>
            <h5>Chat with Engineering</h5>
            <p>Immediate scoping, emergency security audits, and direct founder contact.</p>
            <a
              href="https://wa.me/923000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp-btn"
              aria-label="Contact Hash Decode on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp Us</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
      <div className="wrap footer-row">
        <Brand/>
        <nav className="footer-nav" aria-label="Footer navigation">
          {links.map(({name,url})=><a key={url} href={url}>{name}</a>)}
          <a key="/admin" href="/admin">Admin</a>
          <a key="/privacy" href="/privacy">Privacy</a>
        </nav>
        <p className="developed-by">Developed by <strong>Shahroz Dogar</strong></p>
        <Chat/>
      </div>
    </footer>
  );
}
