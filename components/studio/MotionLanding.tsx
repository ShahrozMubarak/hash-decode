import JourneyControl from './JourneyControl';
import type {Project} from '@/lib/studio-data';
import {capabilities,faq,processSteps} from '@/lib/landing-content';
import {WorkCard} from './Work';
import ContactForm from './ContactForm';
import ResponsiveStage from './ResponsiveStage';
import SceneSurface from './SceneSurface';
import {BriefDialog} from './StudioControls';
import TypingSecure from './TypingSecure';
import CodingBackground from './CodingBackground';
import HackerCoder from './HackerCoder';
import TeleportBot from './TeleportBot';
import {ArrowUpRight,ArrowDown,AppWindow,Braces,ShieldCheck,Workflow} from 'lucide-react';

const serviceIcons=[AppWindow,Braces,ShieldCheck,Workflow];
export default function MotionLanding({projects,links,intro}:{projects:Project[],links:{whatsapp:string,booking:string},intro:string}){
 return <div className="landing original-composition">
   <div className="story-backdrop" aria-hidden="true"/><JourneyControl/><ResponsiveStage/>
   <section className="hero-runway" id="overview" data-station="Overview">
    <div className="hero-sheet"><div className="wrap hero-grid">
     <div className="hero-copy">
      <h1>Build it.<br/>Break it.<br/><TypingSecure /></h1>
      <p className="hero-description">{intro}</p>
      <div className="actions"><a className="cta" href="#brief">Start a project <ArrowUpRight size={18}/></a><a className="text-link" href="#showcase">Explore agent <ArrowDown size={15}/></a></div>
     </div>
     <figure className="hero-object">
      <span className="corner corner-a"/><span className="corner corner-b"/><span className="corner corner-c"/><span className="corner corner-d"/>
      <div className="specimen-visual" id="hero-model-anchor">
       <div className="hero-blueprint-lines" aria-hidden="true"/>
       <SceneSurface model="eva" autoMobile={true}/>
      </div>
     </figure>
    </div><div className="wrap hero-baseline"><a href="#showcase"><ArrowDown size={15}/> Explore the studio</a></div></div>
   </section>
   <section className="showcase dark-band" id="showcase" data-station="Agent">
    <CodingBackground />
    <div className="wrap band">
     <div className="showcase-robot-stage">
      <HackerCoder />
     </div>
    </div>
   </section>
   <section className="band wrap" id="services" data-station="Services">
     <div className="systems-story"><h2>Speed,<br/>structured with<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>clarity.</span></h2><p>Custom web platforms, APIs and business tools, designed around the way your team works.</p><a className="text-link" href="/services">Explore services <ArrowUpRight size={16}/></a></div>
     <div className="service-cards">{capabilities.map(([id,name],i)=>{const Icon=serviceIcons[i];return <a className="service-card" key={id} href={'/services#'+id}><Icon size={26} strokeWidth={1.4} className="icon-azure"/><h3>{name}</h3><ArrowUpRight size={17}/></a>;})}</div>
   </section>
   <section className="wrap band security-section story-security" id="security" data-station="Security">
    <div className="security-stage">
     <div className="security-narrative">
      <h2>Build it. Break it.<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>Secure it.</span></h2>
      <p>Clear boundaries. Practical security testing. Verified fixes.</p>
      <a className="text-link" href="/services#security">Our security approach <ArrowUpRight size={16}/></a>
     </div>
    </div>
   </section>
   <section className="tint-band" id="work" data-station="Work"><div className="wrap band">
    <div className="craft-story"><h2>Rock-solid systems.<br/><span className="text-azure" style={{ color: 'var(--azure)' }}>Fluid experience.</span></h2><p>From database design to the final interaction, reliable foundations and thoughtful details belong together.</p></div><div className="section-head"><h2>Studio concepts.</h2><a className="text-link" href="/portfolio">Project index <ArrowUpRight size={16}/></a></div>
    <div className="work-grid">{projects.map((project,index)=><WorkCard key={project.slug} project={project} index={index}/>)}</div>
   </div></section>
   <section id="process" data-station="Process" className="wrap band"><h2>From brief to handover.</h2>
    <ol className="process-list">{processSteps.map(([name],i)=><li key={name}><span className="step-dot"/><h3>{name}</h3></li>)}</ol>
   </section>
   <section className="wrap band faq-section" id="faq" data-station="Questions"><div><h2>Before we start.</h2></div><div className="questions">{faq.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}<a className="text-link" href="/tools">Explore project tools <ArrowUpRight size={16}/></a></div></section>
   <section className="tint-band" id="brief" data-station="Contact"><div className="wrap band contact-grid"><div><h2>What are you<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>working on?</span></h2><p>Tell us who it’s for, what needs to change and when you need it.</p><div className="contact-links">
    {links.whatsapp&&<a className="text-link" href={'https://wa.me/'+links.whatsapp}>WhatsApp the studio ↗</a>}
    {links.booking&&<a className="text-link" href={links.booking}>Book a conversation ↗</a>}
    <a className="text-link" href="/contact">Contact page ↗</a><BriefDialog/>
   </div><TeleportBot /></div><ContactForm/></div></section>
 </div>;
}
