'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {X,ArrowUpRight} from 'lucide-react';
import FooterSubscribe from './FooterSubscribe';
import StudioManifesto from './StudioManifesto';

const links=[
  {name:'Work',url:'/portfolio'},
  {name:'Services',url:'/services'},
  {name:'About',url:'/about'},
  {name:'Contact',url:'/contact'}
];

export function Brand({ showText = true } = {}){
 const [word,setWord]=useState('DECODE'),timer=useRef(null);
 useEffect(()=>()=>clearInterval(timer.current),[]);
 function decode(){
  const root=document.documentElement;
  if(root.dataset.motion!=='on'||timer.current)return;
  const frames=['D3C0D3','DEC0DE','DECODE'];let i=0;
  timer.current=setInterval(()=>{setWord(frames[i++]);if(i===frames.length){clearInterval(timer.current);timer.current=null;}},55);
 }
 return <Link className="brand" href="/" aria-label="HASHDECODE home" onPointerEnter={decode} onFocus={decode}><img src="/logo.png" alt="Hash Decode" className="brand-logo" width="26" height="26" decoding="async" />{showText && <strong>HASH<span>{word}</span></strong>}</Link>;
}
export function Header(){
 const [open,setOpen]=useState(false),toggle=useRef(null),menu=useRef(null);
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
   document.documentElement.dataset.motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
 },[]);
 if(path&&(path.startsWith('/shahroz') || path.startsWith('/admin') || path.startsWith('/portal')))return null;
 return (
  <header className="site-header ronin-header" onKeyDown={e=>{if(open&&e.key==='Escape')closeMenu();}}>
    <a className="skip" href="#main">Skip to content</a>
    <div className="wrap ronin-header-wrap">
      <nav id="site-links" className="nav ronin-nav" aria-label="Main navigation">
        <div className="ronin-brand-wrap">
          <Brand/>
        </div>
        <div className="site-links ronin-links">
          {links.map(({name,url})=>(
            <Link href={url} aria-current={path===url?'page':undefined} key={url} className="ronin-nav-item" onClick={()=>setOpen(false)}>
              <span className="ronin-nav-text">{name}</span>
            </Link>
          ))}
        </div>
        <div className="nav-actions ronin-actions">
          <Link className="nav-contact ronin-cta-pill" href="/contact">
            <span>Get in touch</span>
          </Link>
          <button
            type="button"
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
            <X size={18}/>
          </button>
        </div>
        <nav aria-label="Studio navigation" className="mobile-nav-list">
          {links.map(({name,url},i)=>(
            <Link
              href={url}
              key={url}
              aria-current={path===url?'page':undefined}
              className="mobile-nav-link"
              style={{ animationDelay: `${(i + 1) * 70}ms` }}
              onClick={closeMenu}
            >
              <span className="mobile-nav-link-num">0{i+1}</span>
              <span className="mobile-nav-link-title">{name}</span>
              <ArrowUpRight size={20} className="mobile-nav-link-arrow" aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <div className="menu-bottom">
          <p className="menu-subtext">Software engineering &amp; digital resilience.</p>
          <Link className="hd-btn-primary" href="/contact" onClick={closeMenu}>
            <span className="btn-label">Start a project</span>
          </Link>
        </div>
      </div>
    </dialog>
  </header>
 );
}
export function Footer(){
  const path = usePathname();
  if (path && (path.startsWith('/shahroz') || path.startsWith('/admin') || path.startsWith('/portal'))) return null;

  const currentYear = new Date().getFullYear();

  return (
    <>
      <StudioManifesto />
      <footer className="site-footer" id="site-footer">
      <div className="wrap site-footer__container">
        {/* Top row: Brand + Newsletter */}
        <div className="site-footer__top">
          <div className="site-footer__brand-block">
            <span className="site-footer__wordmark">HASH DECODE</span>
            <p className="site-footer__tagline">Hash Decode Studio.</p>
          </div>
          <div className="site-footer__subscribe-block">
            <FooterSubscribe />
          </div>
        </div>

        {/* Middle row: 3 columns of links */}
        <div className="site-footer__middle">
          <div className="site-footer__col">
            <span className="site-footer__col-heading">Studio</span>
            <ul className="site-footer__list">
              <li><Link href="/about" className="site-footer__link">About</Link></li>
              <li><Link href="/services" className="site-footer__link">Services</Link></li>
              <li><Link href="/portfolio" className="site-footer__link">Portfolio</Link></li>
              <li><Link href="/tools" className="site-footer__link">Tools</Link></li>
              <li><Link href="/blog" className="site-footer__link">Blog</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <span className="site-footer__col-heading">Security</span>
            <ul className="site-footer__list">
              <li><Link href="/services#security" className="site-footer__link">Security Services</Link></li>
              <li><Link href="/tools/security-check" className="site-footer__link">Security Check</Link></li>
              <li><a href="/.well-known/security.txt" className="site-footer__link">Security.txt</a></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <span className="site-footer__col-heading">Legal &amp; Social</span>
            <ul className="site-footer__list">
              <li><Link href="/privacy" className="site-footer__link">Privacy Policy</Link></li>
              <li><a href="https://github.com/hashdecode" target="_blank" rel="noopener noreferrer" className="site-footer__link">GitHub</a></li>
              <li><a href="https://linkedin.com/company/hash-decode" target="_blank" rel="noopener noreferrer" className="site-footer__link">LinkedIn</a></li>
              <li><a href="https://x.com/hashdecode" target="_blank" rel="noopener noreferrer" className="site-footer__link">X (Twitter)</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom row: Copyright + Location */}
        <div className="site-footer__bottom">
          <p className="site-footer__copyright">
            &copy; {currentYear} Hash Decode. All rights reserved.
          </p>
          <span className="site-footer__badge">Lahore &amp; Global</span>
        </div>
      </div>
    </footer>
    </>
  );
}
