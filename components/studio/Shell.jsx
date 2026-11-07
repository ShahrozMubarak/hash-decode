'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,Menu,X,Pause,Play} from 'lucide-react';
import {Chat} from './Chat';

const links=[['Work','/portfolio'],['Services','/services'],['About','/about'],['Contact','/contact']];
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
 return <header className="site-header" onKeyDown={e=>{if(open&&e.key==='Escape')closeMenu();}}><a className="skip" href="#main">Skip to content</a><div className="wrap nav"><Brand/>
 <nav id="site-links" className="site-links" aria-label="Main navigation">{links.map(([name,url])=><a href={url} aria-current={path===url?'page':undefined} key={url} onClick={()=>setOpen(false)}>{name}</a>)}</nav>
 <div className="nav-actions"><button type="button" className="icon-btn motion-toggle" onClick={pause} aria-pressed={paused} title={paused?'Resume motion':'Pause motion'} aria-label={paused?'Resume motion':'Pause motion'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><a className="nav-contact" href="/contact">Get in touch <ArrowUpRight size={15}/></a>
 <button className="icon-btn nav-toggle" ref={toggle} aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="studio-menu" onClick={openMenu}>{open?<X size={22}/>:<Menu size={22}/>}</button></div></div><dialog ref={menu} id="studio-menu" className="studio-menu" aria-label="Explore Hash Decode" onClose={()=>{setOpen(false);toggle.current?.focus();}} onClick={e=>{if(e.target===menu.current)closeMenu();}}><div className="menu-panel"><div className="menu-top"><span className="kicker">HASH DECODE / INDEX</span><button className="icon-btn" onClick={closeMenu} aria-label="Close menu"><X size={22}/></button></div><nav aria-label="Studio navigation">{links.map(([name,url],i)=><a href={url} key={url} aria-current={path===url?'page':undefined} onClick={closeMenu}><small>0{i+1}</small><span>{name}</span><ArrowUpRight size={24}/></a>)}</nav><div className="menu-bottom"><p>Software. Security. Digital craft.</p><a className="cta" href="/contact">Start a project <ArrowUpRight size={17}/></a></div><span className="menu-ghost" aria-hidden="true">DECODE</span></div></dialog></header>;
}
export function Footer(){return <footer className="site-footer"><div className="wrap footer-row"><Brand/><nav className="footer-nav" aria-label="Footer navigation">{[...links,['Privacy','/privacy']].map(([n,u])=><a key={u} href={u}>{n}</a>)}</nav><p className="developed-by">Developed by <strong>Shahroz Dogar</strong></p><Chat/></div></footer>;}
