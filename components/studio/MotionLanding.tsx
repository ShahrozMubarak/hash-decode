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
     <div className="systems-story">
       <div className="iris-pill-badge">[ ARCHITECTURE // SYSTEMS ]</div>
       <h2>Speed,<br/>structured with<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>clarity.</span></h2>
       <p>Custom web platforms, APIs and business tools, designed around the way your team works.</p>
       <a className="text-link" href="/services">Explore services <ArrowUpRight size={16}/></a>
     </div>
     <div className="service-cards">
       {capabilities.map(([id,name],i)=>{
         const Icon=serviceIcons[i];
         const codeTag = `[ SYS_0${i + 1} ]`;
         return (
           <a className="service-card" key={id} href={'/services#'+id}>
             <div className="service-card-head">
               <Icon size={26} strokeWidth={1.4} className="icon-azure"/>
               <span className="service-code-tag">{codeTag}</span>
             </div>
             <h3>{name}</h3>
             <ArrowUpRight size={17} className="service-card-arrow"/>
           </a>
         );
       })}
     </div>
   </section>
   <section className="wrap band security-section story-security" id="security" data-station="Security">
    <div className="security-stage">
     <div className="security-narrative">
      <div className="iris-pill-badge"><span className="telemetry-live-dot" /> [ SYS // ACTIVE_DEFENSE_V01 ]</div>
      <h2>Build it. Break it.<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>Secure it.</span></h2>
      <p className="security-lead">Clear boundaries. Practical security testing. Verified fixes.</p>
      
      <div className="tech-telemetry-row">
        <div className="telemetry-pill">
          <span className="telemetry-key">AST SCAN</span>
          <span className="telemetry-val">100% COVERAGE</span>
        </div>
        <div className="telemetry-pill">
          <span className="telemetry-key">EDGE MESH</span>
          <span className="telemetry-val">ZERO-TRUST</span>
        </div>
        <div className="telemetry-pill">
          <span className="telemetry-key">RESILIENCE</span>
          <span className="telemetry-val">99.99%</span>
        </div>
      </div>

      <div className="security-actions">
        <a className="cta" href="/services#security">Our security approach <ArrowUpRight size={16}/></a>
        <a className="text-link" href="#brief">Request audit <ArrowDown size={15}/></a>
      </div>
     </div>

     <div className="security-cards-grid">
       <article className="security-card">
         <div className="security-card-media">
           <img src="/images/security-core.jpg" alt="Cryptographic Penetration Audit" width={480} height={320} loading="lazy" />
           <span className="card-tag">( 01 ) [ PENETRATION_AUDIT ]</span>
         </div>
         <div className="security-card-body">
           <h3>Cryptographic Defense Matrix</h3>
           <p>Automated zero-day simulation, memory safety validation, and smart contract protocol verification.</p>
         </div>
       </article>

       <article className="security-card">
         <div className="security-card-media">
           <img src="/images/cloud-architecture.jpg" alt="Distributed Edge Mesh" width={480} height={320} loading="lazy" />
           <span className="card-tag">( 02 ) [ CLOUD_RESILIENCE ]</span>
         </div>
         <div className="security-card-body">
           <h3>Distributed Edge Infrastructure</h3>
           <p>Isolated VPC boundaries, global Anycast routing, and micro-segmented zero-trust access control.</p>
         </div>
       </article>

       <article className="security-card">
         <div className="security-card-media">
           <img src="/images/code-audit.jpg" alt="Continuous Verification" width={480} height={320} loading="lazy" />
           <span className="card-tag">( 03 ) [ CONTINUOUS_VERIFY ]</span>
         </div>
         <div className="security-card-body">
           <h3>Automated AST & Code Auditing</h3>
           <p>Static syntax vulnerability detection, compiler dependency checks, and regression resistance.</p>
         </div>
       </article>
     </div>
    </div>
   </section>
   <section className="tint-band" id="work" data-station="Work"><div className="wrap band">
    <div className="craft-story"><h2>Rock-solid systems.<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>Fluid experience.</span></h2><p>From database design to the final interaction, reliable foundations and thoughtful details belong together.</p></div><div className="section-head"><h2>Studio concepts.</h2><a className="text-link" href="/portfolio">Project index <ArrowUpRight size={16}/></a></div>
    <div className="work-grid">{projects.map((project,index)=><WorkCard key={project.slug} project={project} index={index}/>)}</div>
   </div></section>
   <section id="process" data-station="Process" className="wrap band"><h2>From brief to handover.</h2>
    <ol className="process-list">{processSteps.map(([name],i)=><li key={name}><span className="step-dot"/><h3>{name}</h3></li>)}</ol>
   </section>
   <section className="wrap band faq-section" id="faq" data-station="Questions"><div><h2>Before we start.</h2></div><div className="questions">{faq.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}<a className="text-link" href="/tools">Explore project tools <ArrowUpRight size={16}/></a></div></section>
   <section className="tint-band" id="brief" data-station="Contact"><div className="wrap band contact-grid"><div><h2>What are you<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>working on?</span></h2><p>Tell us who it’s for, what needs to change and when you need it.</p><div className="contact-links">
    <a className="text-link whatsapp-contact-link" href={'https://wa.me/' + (links.whatsapp || '923000000000')} target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }} aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      WhatsApp the studio ↗
    </a>
    {links.booking&&<a className="text-link" href={links.booking}>Book a conversation ↗</a>}
    <a className="text-link" href="/contact">Contact page ↗</a><BriefDialog/>
   </div><TeleportBot /></div><ContactForm/></div></section>
 </div>;
}
