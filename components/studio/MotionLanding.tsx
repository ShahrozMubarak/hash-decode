import JourneyControl from './JourneyControl';
import type {Project, Founder} from '@/lib/studio-data';
import {faq} from '@/lib/landing-content';
import {WorkCard} from './Work';
import ContactForm from './ContactForm';
import ResponsiveStage from './ResponsiveStage';
import SceneSurface from './SceneSurface';
import {BriefDialog} from './StudioControls';
import TypingSecure from './TypingSecure';
import CodingBackground from './CodingBackground';
import HackerCoder from './HackerCoder';
import TeleportBot from './TeleportBot';
import {ArrowUpRight,ArrowDown,AppWindow,Braces,ShieldCheck,CheckCircle2,Compass,Terminal,Lock,FileCheck} from 'lucide-react';

const homeServices=[
  {
    icon: AppWindow,
    title: 'Custom Web Platforms',
    desc: 'High-performance web apps built with modern full-stack architectures, typed APIs, and fluid user experiences.'
  },
  {
    icon: Braces,
    title: 'Internal Tools & APIs',
    desc: 'Reliable backend services, automation pipelines, and custom administrative consoles designed for scale.'
  },
  {
    icon: ShieldCheck,
    title: 'Security Audits & Hardening',
    desc: 'Comprehensive penetration tests, vulnerability audits, and concrete remediation roadmaps before launch.'
  }
];

const securitySteps=[
  {
    step: '01',
    title: 'Scope',
    desc: 'Map every entry point, API route, auth boundary, and data model to agree on precise testing surfaces.'
  },
  {
    step: '02',
    title: 'Test',
    desc: 'Conduct thorough manual penetration testing and automated vulnerability analysis against real exploits.'
  },
  {
    step: '03',
    title: 'Verify Fixes',
    desc: 'Retest patched endpoints, confirm vulnerability closures, and deliver an actionable security sign-off report.'
  }
];

const processTimeline=[
  {
    step: '01',
    title: 'Brief',
    desc: 'We discuss user workflows, performance needs, and milestones to define clear releases.'
  },
  {
    step: '02',
    title: 'Design',
    desc: 'We prototype the data schemas, core views, and architecture for rapid sign-off.'
  },
  {
    step: '03',
    title: 'Build',
    desc: 'We deliver working full-stack increments with clean typing and end-to-end testing.'
  },
  {
    step: '04',
    title: 'Handover',
    desc: 'You receive complete source code, repository control, credentials, and runbooks.'
  }
];

export default function MotionLanding({projects,founders,links,intro}:{projects:Project[],founders?:Founder[],links:{whatsapp:string,booking:string},intro:string}){
 return <div className="landing original-composition">
   <div className="story-backdrop" aria-hidden="true"/><JourneyControl/><ResponsiveStage/>
   <section className="hero-runway" id="overview" data-station="Overview">
    <div className="hero-sheet">
      <div className="wrap hero-grid">
        <div className="hero-heading-block">
          <div className="hero-pill-badge">SECURE SOFTWARE STUDIO</div>
          <h1>Build it.<br/>Break it.<br/><TypingSecure /></h1>
        </div>

        <figure className="hero-object">
          <div className="hero-robot-glow" aria-hidden="true"/>
          <div className="hero-robot-shadow" aria-hidden="true"/>
          <div className="hero-wordmark-backdrop" aria-hidden="true">
            <svg viewBox="0 0 1200 130" className="hero-wordmark-svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <text
                x="50%"
                y="54%"
                textAnchor="middle"
                dominantBaseline="central"
                textLength="1140"
                lengthAdjust="spacing"
                fill="rgba(255, 255, 255, 0.45)"
                fontFamily="var(--font-body), system-ui, sans-serif"
                fontWeight="900"
                letterSpacing="0.1em"
              >
                HASH DECODE
              </text>
            </svg>
          </div>
          <div className="specimen-visual" id="hero-model-anchor">
            <SceneSurface model="eva" autoMobile={true}/>
          </div>
        </figure>

        <div className="hero-cta-block">
          <p className="hero-cta-subtext">
            Custom software, web platforms and security reviews for teams building their next release.
          </p>
          <div className="actions">
            <a className="hero-start-cta" href="#brief">
              <span>Start a project</span>
              <span className="cta-arrow-circle"><ArrowUpRight size={14}/></span>
            </a>
          </div>
        </div>
      </div>

      <div className="wrap hero-baseline">
        <a href="#showcase" className="hero-explore-link">Explore the studio <ArrowDown size={14}/></a>
      </div>
    </div>
   </section>

   {/* Hacker Coder Interactive Showcase */}
   <section className="showcase" id="showcase" data-station="Agent">
    <div className="showcase-stage-frame">
      <CodingBackground />
      <div className="wrap band">
       <div className="showcase-robot-stage">
        <HackerCoder />
       </div>
      </div>
    </div>
   </section>

   {/* 1. SERVICES (3 CARDS) */}
   <section className="section-rule-block" id="services" data-station="Services">
     <div className="wrap">
     <div className="section-head-rule">
       <span className="section-rule-label">01 · CAPABILITIES</span>
       <h2 className="section-rule-heading">Engineered for <span className="highlight-word">performance.</span></h2>
       <p className="section-rule-lead">Custom software, web platforms, and secure APIs built around the way your business works.</p>
     </div>
     <div className="services-tri-grid">
       {homeServices.map((svc, i)=>(
         <article key={i} className="service-tri-card">
           <div className="service-card-icon-wrap">
             <svc.icon size={22} />
           </div>
           <h3>{svc.title}</h3>
           <p>{svc.desc}</p>
         </article>
       ))}
     </div>
     <div className="section-rule-action">
       <a className="cta" href="/services">Explore services <ArrowUpRight size={16}/></a>
     </div>
     </div>
   </section>

   {/* 2. SECURITY (3-STEP STRIP: Scope, Test, Verify fixes + one "Request an audit" button) */}
   <section className="section-rule-block" id="security" data-station="Security">
     <div className="wrap">
     <div className="section-head-rule">
       <span className="section-rule-label">02 · SECURITY ASSURANCE</span>
       <h2 className="section-rule-heading">Tested before <span className="highlight-word">launch.</span></h2>
       <p className="section-rule-lead">Rigorous penetration testing, authorized code reviews, and concrete security sign-offs.</p>
     </div>
     <div className="security-strip-grid">
       {securitySteps.map((st, i)=>(
         <div key={i} className="security-strip-card">
           <span className="strip-step-num">{st.step}</span>
           <h3>{st.title}</h3>
           <p>{st.desc}</p>
         </div>
       ))}
     </div>
     <div className="section-rule-action">
       <a className="cta" href="#brief">Request an audit <ArrowUpRight size={16}/></a>
     </div>
     </div>
   </section>

   {/* 3. WORK (2 CONCEPT CARDS + PROJECT INDEX LINK) */}
   <section className="section-rule-block" id="work" data-station="Work">
     <div className="wrap">
     <div className="section-head-rule">
       <span className="section-rule-label">03 · SELECTED CONCEPTS</span>
       <h2 className="section-rule-heading">Proven software <span className="highlight-word">concepts.</span></h2>
       <p className="section-rule-lead">Explore working architectures, reactive tools, and real-time operational interfaces.</p>
     </div>
     <div className="work-duo-grid">
       {projects.slice(0, 2).map((project, index)=>(
         <WorkCard key={project.slug} project={project} index={index}/>
       ))}
     </div>
     <div className="section-rule-action">
       <a className="cta" href="/portfolio">Project index <ArrowUpRight size={16}/></a>
     </div>
     </div>
   </section>

   {/* 4. PROCESS (4-STEP TIMELINE: Brief, Design, Build, Handover) */}
   <section className="section-rule-block" id="process" data-station="Process">
     <div className="wrap">
     <div className="section-head-rule">
       <span className="section-rule-label">04 · DELIVERY LIFECYCLE</span>
       <h2 className="section-rule-heading">From brief to <span className="highlight-word">handover.</span></h2>
       <p className="section-rule-lead">A direct engineering process with transparent weekly increments and full client ownership.</p>
     </div>
     <div className="process-timeline-grid">
       {processTimeline.map((item, i)=>(
         <div key={i} className="process-timeline-card">
           <span className="timeline-step-pill">{item.step}</span>
           <h3>{item.title}</h3>
           <p>{item.desc}</p>
         </div>
       ))}
     </div>
     <div className="section-rule-action">
       <a className="cta" href="/about">How we work <ArrowUpRight size={16}/></a>
     </div>
     </div>
   </section>

   {/* 5. TEAM STRIP */}
   <section className="section-rule-block" id="team" data-station="Team">
     <div className="wrap">
     <div className="section-head-rule">
       <span className="section-rule-label">05 · LEADERSHIP</span>
       <h2 className="section-rule-heading">Senior engineering <span className="highlight-word">talent.</span></h2>
       <p className="section-rule-lead">Led by architects and security specialists dedicated to building resilient platforms.</p>
     </div>
     <div className="team-strip-grid">
       {(founders && founders.length > 0 ? founders : [
         {name:'Shahroz Dogar',role:'Founder & Principal Systems Architect',image:'/team/shahroz.svg',skills:['Full-Stack','Security']},
         {name:'Zaeem Asim',role:'Security Researcher & Reverse Engineer',image:'/team/zaeem.svg',skills:['Penetration Testing','Audits']},
         {name:'Hammad Shakeel',role:'Lead Frontend Engineer',image:'/team/hammad.svg',skills:['React','TypeScript']},
         {name:'Muhammad Abdullah',role:'Distributed Cloud Engineer',image:'/team/abdullah.svg',skills:['Cloudflare','DevOps']}
       ]).slice(0, 4).map((f, i)=>(
         <article key={i} className="team-strip-card">
           <div className="team-avatar-wrap">
             <img src={f.image || '/team/shahroz.svg'} alt={f.name} width="72" height="72" loading="lazy" />
           </div>
           <h3>{f.name}</h3>
           <span className="team-role-tag">{f.role}</span>
         </article>
       ))}
     </div>
     <div className="section-rule-action">
       <a className="cta" href="/about">Meet the team <ArrowUpRight size={16}/></a>
     </div>
     </div>
   </section>

   {/* 6. FAQ (5 QUESTIONS) */}
   <section className="section-rule-block" id="faq" data-station="Questions">
     <div className="wrap">
     <div className="section-head-rule">
       <span className="section-rule-label">06 · COMMON QUESTIONS</span>
       <h2 className="section-rule-heading">Everything you need to <span className="highlight-word">know.</span></h2>
       <p className="section-rule-lead">Transparent pricing, clear timelines, code ownership, and post-launch support.</p>
     </div>
     <div className="faq-accordions-block">
       {faq.slice(0, 5).map(([q,a], i)=>(
         <details key={i} className="faq-accordion-item">
           <summary><span>{q}</span><span className="faq-plus" aria-hidden="true">+</span></summary>
           <p>{a}</p>
         </details>
       ))}
     </div>
     <div className="section-rule-action">
       <a className="cta" href="/tools">Explore project tools <ArrowUpRight size={16}/></a>
     </div>
     </div>
   </section>

   {/* 7. FINAL CTA */}
   <section className="section-rule-block" id="brief" data-station="Contact">
     <div className="wrap contact-grid">
       <div>
         <span className="section-rule-label">07 · PROJECT BRIEF</span>
         <h2 className="section-rule-heading" style={{margin:'0.6rem 0 1rem'}}>What are you <span className="highlight-word">working on?</span></h2>
         <p className="section-rule-lead" style={{maxWidth:'42ch',marginBottom:'1.5rem'}}>Tell us who it’s for, what needs to change, and your target timeline.</p>
         <div className="contact-links">
           <a className="text-link whatsapp-contact-link" href={'https://wa.me/' + (links.whatsapp || '923000000000')} target="_blank" rel="noopener noreferrer">
             <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }} aria-hidden="true">
               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
             </svg>
             WhatsApp the studio ↗
           </a>
           {links.booking&&<a className="text-link" href={links.booking}>Book a conversation ↗</a>}
           <a className="text-link" href="/contact">Contact page ↗</a><BriefDialog/>
         </div>
         <TeleportBot />
       </div>
       <ContactForm/>
     </div>
   </section>
 </div>;
}
