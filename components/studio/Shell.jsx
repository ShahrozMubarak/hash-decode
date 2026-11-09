'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,ArrowUp,Menu,X,Pause,Play,Briefcase,Cpu,Users,Mail,ShieldCheck,Search,ShoppingBag,Terminal} from 'lucide-react';
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

 useEffect(()=>{
   if(!open)return;
   const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
   const previousOverflow = document.body.style.overflow;
   const previousPadding = document.body.style.paddingRight;
   document.body.style.overflow = 'hidden';
   if (scrollbarWidth > 0) {
     document.body.style.paddingRight = `${scrollbarWidth}px`;
   }
   return () => {
     document.body.style.overflow = previousOverflow;
     document.body.style.paddingRight = previousPadding;
   };
 },[open]);

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
    <div className="wrap ronin-header-wrap">
      <nav id="site-links" className="nav ronin-nav" aria-label="Main navigation">
        <div className="ronin-brand-wrap">
          <Brand/>
        </div>
        <div className="site-links ronin-links">
          {links.map(({name,url,icon:Icon})=>(
            <a href={url} aria-current={path===url?'page':undefined} key={url} className="ronin-nav-item" onClick={()=>setOpen(false)}>
              <Icon size={15} className="ronin-nav-icon" aria-hidden="true" />
              <strong className="ronin-nav-text">{name}</strong>
            </a>
          ))}
        </div>
        <div className="nav-actions ronin-actions">
          <button type="button" className="icon-btn motion-toggle ronin-icon-btn" onClick={pause} aria-pressed={paused} title={paused?'Resume motion':'Pause motion'} aria-label={paused?'Resume motion':'Pause motion'}>
            {paused?<Play size={15}/>:<Pause size={15}/>}
          </button>
          <a className="nav-contact ronin-cta-pill" href="/contact">
            <Terminal size={14} aria-hidden="true" />
            <span>Get in touch</span>
            <ArrowUpRight size={14}/>
          </a>
          <button
            className={`icon-btn nav-toggle ronin-icon-btn ${open ? 'is-active' : ''}`}
            ref={toggle}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="studio-menu"
            onClick={open ? closeMenu : openMenu}
          >
            <span className="nav-toggle-burger" aria-hidden="true">
              <span className="burger-bar bar-1" />
              <span className="burger-bar bar-2" />
              <span className="burger-bar bar-3" />
            </span>
          </button>
        </div>
      </nav>
    </div>
    <dialog
      ref={menu}
      id="studio-menu"
      className={`studio-menu ${open ? 'is-open' : ''}`}
      aria-label="Explore Hash Decode"
      onClose={()=>{setOpen(false);toggle.current?.focus();}}
      onClick={e=>{if(e.target===menu.current)closeMenu();}}
    >
      <div className="menu-panel">
        <div className="menu-top">
          <span className="menu-brand-kicker">HASH DECODE</span>
          <button className="hd-icon-btn menu-close-btn" onClick={closeMenu} aria-label="Close menu">
            <X size={22}/>
          </button>
        </div>
        <nav aria-label="Studio navigation" className="mobile-nav-list">
          {links.map(({name,url,icon:Icon},i)=>(
            <a
              href={url}
              key={url}
              aria-current={path===url?'page':undefined}
              className="mobile-nav-link"
              style={{ animationDelay: `${(i + 1) * 70}ms` }}
              onClick={closeMenu}
            >
              <span className="mobile-nav-link-num">0{i+1}</span>
              <span className="mobile-nav-link-title">{name}</span>
              <ArrowUpRight size={22} className="mobile-nav-link-arrow" aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="menu-bottom">
          <p className="menu-subtext">Software engineering &amp; digital resilience.</p>
          <a className="hd-btn-primary" href="/contact" onClick={closeMenu}>
            <span className="btn-label">Start a project</span>
            <span className="btn-arrow-circle" aria-hidden="true">
              <ArrowUpRight size={15}/>
            </span>
          </a>
        </div>
      </div>
    </dialog>
  </header>
 );
}
export function Footer(){
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer" id="site-footer">
      <div className="wrap footer-columns-grid">
        {/* Column 1: Capabilities */}
        <div className="footer-col footer-col-capabilities">
          <span className="footer-col-title">Capabilities</span>
          <ul className="footer-links-list">
            <li><a href="/services" className="footer-link">Custom Web Platforms</a></li>
            <li><a href="/services" className="footer-link">Internal Tools &amp; APIs</a></li>
            <li><a href="/services" className="footer-link">Security Audits &amp; Hardening</a></li>
            <li><a href="/tools" className="footer-link">Project Cost Estimator</a></li>
            <li><a href="/tools" className="footer-link">Security Header Scanner</a></li>
          </ul>
        </div>

        {/* Column 2: Studio */}
        <div className="footer-col footer-col-studio">
          <span className="footer-col-title">Studio</span>
          <ul className="footer-links-list">
            <li><a href="/about" className="footer-link">About Hash Decode</a></li>
            <li><a href="/portfolio" className="footer-link">Selected Concepts</a></li>
            <li><a href="/blog" className="footer-link">Engineering Dispatch</a></li>
            <li><a href="/admin" className="footer-link">Admin</a></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="footer-col footer-col-contact">
          <span className="footer-col-title">Contact</span>
          <p className="footer-contact-note">Software engineering and digital resilience for critical releases.</p>
          <div className="footer-contact-actions">
            <a
              href="https://wa.me/923000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="hd-text-link footer-contact-link"
            >
              <span>WhatsApp the studio</span>
              <span className="link-arrow"><ArrowUpRight size={15} /></span>
            </a>
            <a href="/contact" className="hd-text-link footer-contact-link">
              <span>Start a project</span>
              <span className="link-arrow"><ArrowUpRight size={15} /></span>
            </a>
          </div>
          <div className="footer-newsletter-block">
            <FooterSubscribe />
          </div>
        </div>
      </div>

      {/* Small Bottom Row */}
      <div className="wrap footer-bottom-row">
        <div className="footer-bottom-brand">
          <Brand/>
          <span className="footer-copyright">
            &copy; {new Date().getFullYear()} Hash Decode. Developed by <strong>Shahroz Dogar</strong>
          </span>
        </div>
        <div className="footer-bottom-actions">
          <a href="/privacy" className="footer-legal-link">Privacy &amp; Security</a>
          <button
            type="button"
            className="footer-back-to-top"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
        <Chat/>
      </div>
    </footer>
  );
}
