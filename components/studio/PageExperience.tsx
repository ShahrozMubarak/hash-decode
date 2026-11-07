'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import InlineDotted from './InlineDotted';
export default function PageExperience(){
 const path=usePathname();
 useEffect(()=>{
  if(path==='/')return;
  const elements=Array.from(document.querySelectorAll<HTMLElement>('.page-intro,.owner-intro,.owner-login,.principles article,.service-index section,.article-list a,.tool-cards a,.admin-item,.dashboard-kpis>div,.editorial-admin,.form-panel'));
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('page-visible');reveal.unobserve(entry.target);}}),{threshold:.08});
  elements.forEach(el=>{el.classList.add('page-reveal');reveal.observe(el);});
  return()=>{reveal.disconnect();elements.forEach(el=>el.classList.remove('page-reveal','page-visible'));};
 },[path]);
 if(path==='/'||path.startsWith('/admin'))return null;
 const form=path.startsWith('/services')?1:path.startsWith('/portfolio')?3:path.startsWith('/tools')?0:2;
 return <aside className="inner-experience" aria-hidden="true"><span className="inner-ghost">DECODE</span><InlineDotted form={form}/><span className="inner-caption">FORM / 0{form+1}</span></aside>;
}
