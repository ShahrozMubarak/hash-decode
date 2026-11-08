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

const serviceDetails = [
  {
    id: 'web',
    name: 'Web Platforms & Digital Products',
    icon: AppWindow,
    tag: '( 01 ) [ NEXT_REACT ]',
    summary: 'High-performance web applications built for extreme speed, sub-second TTFB, and fluid interactions.'
  },
  {
    id: 'api',
    name: 'Custom APIs & Cloud Microservices',
    icon: Braces,
    tag: '( 02 ) [ CLOUD_API ]',
    summary: 'Resilient cloud infrastructure with type-safe schemas, automated data sync, and sub-15ms execution.'
  },
  {
    id: 'security',
    name: 'Authorized Penetration Audits',
    icon: ShieldCheck,
    tag: '( 03 ) [ ZERO_DAY_DEFENSE ]',
    summary: 'Rigorous white-box vulnerability testing, memory safety validation, and verified cryptographic patches.'
  },
  {
    id: 'workflow',
    name: 'Automation & Business Tools',
    icon: Workflow,
    tag: '( 04 ) [ AUTO_SYSTEMS ]',
    summary: 'Autonomous background workers, transactional webhooks, and fault-tolerant event queues.'
  }
];

export default function MotionLanding({projects,links,intro}:{projects:Project[],links:{whatsapp:string,booking:string},intro:string}){
 return <div className="landing original-composition">
   <div className="story-backdrop" aria-hidden="true"/><JourneyControl/><ResponsiveStage/>

   {/* Hero Section */}
   <section className="hero-runway" id="overview" data-station="Overview">
    <div className="hero-sheet"><div className="wrap hero-grid">
     <div className="hero-copy">
      <div className="iris-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#F8FAFC', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
        ( HASH_DECODE ) · [ v02 // STUDIO_COMMAND ]
      </div>
      <h1>Build it.<br/>Break it.<br/><TypingSecure /></h1>
      <p className="hero-description">{intro}</p>
      <div className="actions">
        <a className="cta" href="#brief">Start a project <ArrowUpRight size={18}/></a>
        <a className="text-link" href="#showcase" style={{ color: '#F8FAFC' }}>Explore agent <ArrowDown size={15}/></a>
      </div>
      <div className="hero-metrics-strip" style={{ display: 'flex', gap: '0.65rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>[ 99.98% AUDIT RESISTANCE ]</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>[ ZERO VULNERABILITY POLICY ]</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#FF4D36' }}>[ LATENCY &lt; 14MS ]</span>
      </div>
     </div>
     <figure className="hero-object">
      <span className="corner corner-a"/><span className="corner corner-b"/><span className="corner corner-c"/><span className="corner corner-d"/>
      <div className="specimen-visual" id="hero-model-anchor">
       <div className="hero-blueprint-lines" aria-hidden="true"/>
       <SceneSurface model="eva" autoMobile={true}/>
      </div>
     </figure>
    </div><div className="wrap hero-baseline"><a href="#showcase" style={{ color: '#94A3B8' }}><ArrowDown size={15}/> Explore the studio</a></div></div>
   </section>

   {/* Agent / Hacker Coder Showcase */}
   <section className="showcase dark-band" id="showcase" data-station="Agent">
    <CodingBackground />
    <div className="wrap band">
     <div className="showcase-robot-stage">
      <HackerCoder />
     </div>
    </div>
   </section>

   {/* Services Section - Balanced 4-Card Grid (No Empty Space) */}
   <section className="band wrap" id="services" data-station="Services">
     <div className="systems-story">
       <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#FF4D36', background: 'rgba(255,77,54,0.1)', border: '1px solid rgba(255,77,54,0.25)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
         ( 02 ) [ CORE_CAPABILITIES ]
       </div>
       <h2>Speed, structured with <span className="text-coral" style={{ color: 'var(--coral)' }}>clarity.</span></h2>
       <p>Custom web platforms, APIs and business tools, designed around the exact way your team operates.</p>
     </div>
     <div className="service-cards">
       {serviceDetails.map((item) => {
         const Icon = item.icon;
         return (
           <a className="service-card" key={item.id} href={'/services#' + item.id}>
             <div className="service-card-meta">
               <span className="service-badge">{item.tag}</span>
               <Icon size={24} strokeWidth={1.5} className="icon-azure" />
             </div>
             <div>
               <h3>{item.name}</h3>
               <p>{item.summary}</p>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
               <span style={{ fontFamily: 'var(--mono)', fontSize: '0.74rem', color: '#94A3B8' }}>Learn more</span>
               <ArrowUpRight size={16} style={{ color: '#FF4D36' }} />
             </div>
           </a>
         );
       })}
     </div>
   </section>

   {/* Security Section - High-Density Image Cards */}
   <section className="wrap band security-section story-security" id="security" data-station="Security">
    <div className="security-stage">
     <div className="security-narrative">
      <div className="iris-pill-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#F8FAFC', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
        ( 03 ) [ PENETRATION_TESTING ]
      </div>
      <h2>Build it. Break it.<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>Secure it.</span></h2>
      <p>Clear boundaries. Practical security testing. Verified zero-day patches.</p>
      <div className="security-actions">
        <a className="cta" href="/services#security">Our security approach <ArrowUpRight size={16}/></a>
        <a className="text-link" href="#brief" style={{ color: '#F8FAFC' }}>Request audit <ArrowDown size={15}/></a>
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

   {/* Work / Concepts Section */}
   <section className="tint-band" id="work" data-station="Work">
    <div className="wrap band">
     <div className="craft-story">
       <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#FF4D36', background: 'rgba(255,77,54,0.1)', border: '1px solid rgba(255,77,54,0.25)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
         ( 04 ) [ RECENT_DEPLOYMENTS ]
       </div>
       <h2>Rock-solid systems. <span className="text-coral" style={{ color: 'var(--coral)' }}>Fluid experience.</span></h2>
       <p>From database design to the final interaction, reliable foundations and thoughtful details belong together.</p>
     </div>
     <div className="section-head" style={{ marginBottom: '1.5rem' }}>
       <h3 style={{ color: '#F8FAFC' }}>Studio concepts.</h3>
       <a className="text-link" href="/portfolio" style={{ color: '#F8FAFC' }}>Project index <ArrowUpRight size={16}/></a>
     </div>
     <div className="work-grid">{projects.map((project,index)=><WorkCard key={project.slug} project={project} index={index}/>)}</div>
    </div>
   </section>

   {/* Process Section */}
   <section id="process" data-station="Process" className="wrap band">
     <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
       <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#FF4D36', background: 'rgba(255,77,54,0.1)', border: '1px solid rgba(255,77,54,0.25)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
         ( 05 ) [ WORKFLOW_ENGINE ]
       </div>
       <h2 style={{ color: '#F8FAFC' }}>From brief to handover.</h2>
     </div>
     <ol className="process-list">{processSteps.map(([name],i)=><li key={name}><span className="step-dot"/><h3>{name}</h3></li>)}</ol>
   </section>

   {/* FAQ Section */}
   <section className="wrap band faq-section" id="faq" data-station="Questions">
     <div>
       <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#FF4D36', background: 'rgba(255,77,54,0.1)', border: '1px solid rgba(255,77,54,0.25)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
         [ TRANSPARENCY_FIRST ]
       </div>
       <h2 style={{ color: '#F8FAFC' }}>Before we start.</h2>
       <p style={{ color: '#94A3B8', marginTop: '0.75rem' }}>Clear questions and honest answers about timelines, intellectual property, and engagement models.</p>
       <a className="text-link" href="/tools" style={{ color: '#F8FAFC', marginTop: '1rem', display: 'inline-flex' }}>Explore project tools <ArrowUpRight size={16}/></a>
     </div>
     <div className="questions">{faq.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div>
   </section>

   {/* Brief / Contact Section */}
   <section className="tint-band" id="brief" data-station="Contact">
    <div className="wrap band contact-grid">
     <div>
       <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: '#FF4D36', background: 'rgba(255,77,54,0.1)', border: '1px solid rgba(255,77,54,0.25)', padding: '0.35rem 0.85rem', borderRadius: '999px', letterSpacing: '0.06em' }}>
         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D36', display: 'inline-block' }} />
         ( 06 ) [ INITIATE_CONTACT ]
       </div>
       <h2 style={{ color: '#F8FAFC' }}>What are you<br/><span className="text-coral" style={{ color: 'var(--coral)' }}>working on?</span></h2>
       <p style={{ color: '#94A3B8' }}>Tell us who it’s for, what needs to change, and when you need it.</p>
       <div className="contact-links" style={{ marginTop: '1.25rem' }}>
        <a className="text-link whatsapp-contact-link" href={'https://wa.me/' + (links.whatsapp || '923000000000')} target="_blank" rel="noopener noreferrer" style={{ color: '#F8FAFC' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }} aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp the studio ↗
        </a>
        {links.booking&&<a className="text-link" href={links.booking} style={{ color: '#F8FAFC' }}>Book a conversation ↗</a>}
        <a className="text-link" href="/contact" style={{ color: '#F8FAFC' }}>Contact page ↗</a>
        <BriefDialog/>
       </div>
       <TeleportBot />
     </div>
     <ContactForm/>
    </div>
   </section>
 </div>;
}