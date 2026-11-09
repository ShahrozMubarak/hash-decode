import JourneyControl from './JourneyControl';
import type { Project, Founder } from '@/lib/studio-data';
import { WorkCard } from './Work';
import ContactForm from './ContactForm';
import ResponsiveStage from './ResponsiveStage';
import SceneSurface from './SceneSurface';
import HeroModelContainer from './HeroModelContainer';
import TypingSecure from './TypingSecure';
import TeleportBot from './TeleportBot';
import HeroDustMotes from './HeroDustMotes';
import HeroWordmark from './HeroWordmark';
import HeroParallaxManager from './HeroParallaxManager';
import FAQAccordion from './FAQAccordion';
import ProcessTimeline from './ProcessTimeline';
import TeamStrip from './TeamStrip';
import {
  ArrowUpRight,
  ArrowDown,
  AppWindow,
  Braces,
  ShieldCheck,
  Compass,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

const homeServices = [
  {
    icon: AppWindow,
    title: 'Custom Web Platforms',
    desc: 'High-performance web apps built with modern full-stack architectures, typed APIs, and fluid user experiences.',
    link: '/services',
  },
  {
    icon: Braces,
    title: 'Internal Tools & APIs',
    desc: 'Reliable backend services, automation pipelines, and custom administrative consoles designed for scale.',
    link: '/services',
  },
  {
    icon: ShieldCheck,
    title: 'Security Audits & Hardening',
    desc: 'Comprehensive penetration tests, vulnerability audits, and concrete remediation roadmaps before launch.',
    link: '/services',
  },
];

const securitySteps = [
  {
    icon: Compass,
    title: 'Scope',
    desc: 'Map every entry point, API route, auth boundary, and data model to agree on precise testing surfaces.',
  },
  {
    icon: Terminal,
    title: 'Test',
    desc: 'Conduct thorough manual penetration testing and automated vulnerability analysis against real exploits.',
  },
  {
    icon: CheckCircle2,
    title: 'Verify fixes',
    desc: 'Retest patched endpoints, confirm vulnerability closures, and deliver an actionable security sign-off report.',
  },
];

export default function MotionLanding({
  projects,
  founders,
  links,
}: {
  projects: Project[];
  founders?: Founder[];
  links: { whatsapp: string; booking: string };
  intro: string;
}) {
  return (
    <div className="landing original-composition">
      <div className="story-backdrop" aria-hidden="true" />
      <JourneyControl />
      <ResponsiveStage />

      {/* HERO RUNWAY */}
      <section className="hero-runway" id="overview" data-station="Overview">
        <div className="hero-sheet">
          <HeroParallaxManager />

          {/* L1 Spotlight Cone from above the robot */}
          <div className="hero-spotlight-cone" aria-hidden="true" />

          {/* L3 Perspective Grid Floor */}
          <div className="hero-grid-floor" aria-hidden="true" />

          {/* L2 Light Pool on Floor */}
          <div className="hero-light-pool" aria-hidden="true" />

          {/* L4 Dust Motes Canvas */}
          <HeroDustMotes />

          {/* L5 Giant Wordmark "HASH DECODE" with Light Sweep */}
          <HeroWordmark />

          {/* L6 Vignette & 4% Film Grain */}
          <div className="hero-vignette-grain" aria-hidden="true" />

          {/* Hero Foreground Content */}
          <div className="wrap hero-grid">
            <div className="hero-heading-block">
              <div className="hero-pill-badge">SECURE SOFTWARE STUDIO</div>
              <h1 aria-label="Build it. Break it. Secure it.">
                <span className="hero-h1-mask">
                  <span className="hero-h1-line hero-h1-line-1">Build it.</span>
                </span>
                <span className="hero-h1-mask">
                  <span className="hero-h1-line hero-h1-line-2">Break it.</span>
                </span>
                <span className="hero-h1-mask">
                  <span className="hero-h1-line hero-h1-line-3">
                    <TypingSecure />
                  </span>
                </span>
              </h1>
            </div>

            <HeroModelContainer />

            <div className="hero-cta-block">
              <p className="hero-cta-subtext">
                Custom software, web platforms and security reviews for teams building their next release.
              </p>
              <div className="actions">
                <a className="hd-btn-primary hero-start-cta cta-magnetic" href="#brief">
                  <span className="btn-label">Start a project</span>
                  <span className="btn-arrow-circle" aria-hidden="true">
                    <span className="btn-arrow-track">
                      <span className="btn-arrow-icon btn-arrow-primary">
                        <ArrowUpRight size={15} />
                      </span>
                      <span className="btn-arrow-icon btn-arrow-clone">
                        <ArrowUpRight size={15} />
                      </span>
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="wrap hero-baseline">
            <a href="#services" className="hd-text-link hero-explore-link">
              <span>Explore the studio</span>
              <span className="link-arrow">
                <ArrowDown size={14} />
              </span>
            </a>
          </div>

          {/* Extra Proof Row: Technologies slow marquee */}
          <div className="hero-tech-strip" aria-label="Technologies used by Hash Decode">
            <div className="hero-tech-track">
              <div className="hero-tech-list">
                <span>React</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Next.js</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Node</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Python</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>TypeScript</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Cloudflare</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
              </div>
              <div className="hero-tech-list" aria-hidden="true">
                <span>React</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Next.js</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Node</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Python</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>TypeScript</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
                <span>Cloudflare</span>
                <span className="hero-tech-dot" aria-hidden="true">·</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. SERVICES (3 CARDS) */}
      <section className="section-rule-block" id="services" data-station="Services">
        <div className="wrap">
          <div className="section-head-rule section-head-with-action">
            <div className="section-head-text">
              <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
                Capabilities
              </span>
              <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
                Engineered for <span className="highlight-word">performance.</span>
              </h2>
              <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
                Custom software, web platforms, and secure APIs built around the way your business works.
              </p>
            </div>
            <div className="section-head-link-wrap" data-reveal="fade" data-reveal-delay="200">
              <a className="hd-text-link" href="/services">
                <span>Explore services</span>
                <span className="link-arrow">
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>

          <div className="services-tri-grid" data-stagger>
            {homeServices.map((svc, i) => (
              <article
                key={svc.title}
                className="service-tri-card hd-card"
                data-reveal="up"
                data-reveal-delay={320 + i * 90}
              >
                <div className="card-glare" aria-hidden="true" />
                <div className="service-card-icon-wrap" aria-hidden="true">
                  <svc.icon size={24} />
                </div>
                <h3 className="service-card-title">{svc.title}</h3>
                <p className="service-card-desc">{svc.desc}</p>
                <a
                  href={svc.link}
                  className="card-arrow-link"
                  aria-label={`Learn more about ${svc.title}`}
                >
                  <span>Learn more</span>
                  <ArrowUpRight size={16} className="card-link-arrow" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 1.5. DESKTOP-ONLY NOVA MODEL SHOWCASE */}
      <section className="desktop-nova-showcase section-rule-block" id="specimen" data-station="Specimen">
        <div className="wrap">
          <div className="section-head-rule section-head-with-action">
            <div className="section-head-text">
              <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
                Studio Specimen
              </span>
              <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
                Intelligent systems. <span className="highlight-word">Precision visualised.</span>
              </h2>
              <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
                High-performance computing interfaces, dynamic data engines, and fluid 3D visual architectures engineered to scale.
              </p>
            </div>
            <div className="section-head-link-wrap" data-reveal="fade" data-reveal-delay="200">
              <a className="hd-text-link" href="#brief">
                <span>Request a build</span>
                <span className="link-arrow">
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>

          <div className="nova-stage-card hd-card" data-reveal="up" data-reveal-delay="280">
            <div className="nova-card-inner">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/models/novaai/hero-poster.jpg"
                src="/models/novaai/hero.mp4"
                className="nova-full-video"
              />
              <div className="nova-overlay-scrim" />
              <div className="nova-meta-bar">
                <span className="nova-status-indicator">
                  <span className="nova-status-pulse" />
                  <span>Nova AI Model · Autonomous Core</span>
                </span>
                <span className="nova-spec-tag">60 FPS · Hardware Accelerated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECURITY (3-STEP STRIP: Scope, Test, Verify fixes + one "Request an audit" button) */}
      <section className="section-rule-block" id="security" data-station="Security">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Security assurance
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Tested before <span className="highlight-word">launch.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Rigorous penetration testing, authorized code reviews, and concrete security sign-offs.
            </p>
          </div>

          <div className="security-steps-wrapper" data-reveal="up" data-reveal-delay="320">
            {/* Self-drawing SVG connector line */}
            <svg
              className="security-connector-svg"
              viewBox="0 0 1000 2"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="security-connector-line"
                d="M 166 1 L 834 1"
                stroke="rgba(30, 64, 175, 0.35)"
                strokeWidth="2"
                strokeDasharray="668"
                strokeDashoffset="668"
              />
            </svg>

            <div className="security-strip-grid" data-stagger>
              {securitySteps.map((st, i) => (
                <article
                  key={st.title}
                  className="security-strip-card hd-card"
                  data-reveal="up"
                  data-reveal-delay={320 + i * 80}
                >
                  <div className="card-glare" aria-hidden="true" />
                  <div className="security-card-icon-wrap" aria-hidden="true">
                    <st.icon size={24} />
                  </div>
                  <h3 className="security-card-title">{st.title}</h3>
                  <p className="security-card-desc">{st.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-btn-primary" href="#brief">
              <span className="btn-label">Request an audit</span>
              <span className="btn-arrow-circle" aria-hidden="true">
                <span className="btn-arrow-track">
                  <span className="btn-arrow-icon btn-arrow-primary">
                    <ArrowUpRight size={15} />
                  </span>
                  <span className="btn-arrow-icon btn-arrow-clone">
                    <ArrowUpRight size={15} />
                  </span>
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. WORK (2 CONCEPT CARDS + PROJECT INDEX LINK) */}
      <section className="section-rule-block" id="work" data-station="Work">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Selected concepts
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Proven software <span className="highlight-word">concepts.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Explore working architectures, reactive tools, and real-time operational interfaces.
            </p>
          </div>

          <div className="work-duo-grid" data-stagger data-reveal="up" data-reveal-delay="320">
            {projects.slice(0, 2).map((project, index) => (
              <WorkCard key={project.slug} project={project} index={index} />
            ))}
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-text-link" href="/portfolio">
              <span>Project index</span>
              <span className="link-arrow">
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. PROCESS (4-STEP HORIZONTAL TIMELINE: Brief, Design, Build, Handover) */}
      <section className="section-rule-block" id="process" data-station="Process">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Delivery lifecycle
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              From brief to <span className="highlight-word">handover.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              A direct engineering process with transparent weekly increments and full client ownership.
            </p>
          </div>

          <div data-reveal="up" data-reveal-delay="320">
            <ProcessTimeline />
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-btn-secondary" href="/about">
              <span>How we work</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. TEAM STRIP */}
      <section className="section-rule-block" id="team" data-station="Team">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Leadership
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Senior engineering <span className="highlight-word">talent.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Led by architects and security specialists dedicated to building resilient platforms.
            </p>
          </div>

          <div data-reveal="up" data-reveal-delay="320">
            <TeamStrip founders={founders} />
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-btn-secondary" href="/about">
              <span>Meet the team</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* 6. FAQ (5 QUESTIONS ACCORDION) */}
      <section className="section-rule-block" id="faq" data-station="Questions">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Common questions
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Everything you need to <span className="highlight-word">know.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Transparent pricing, clear timelines, code ownership, and post-launch support.
            </p>
          </div>

          <div data-reveal="up" data-reveal-delay="320">
            <FAQAccordion />
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-btn-secondary" href="/tools">
              <span>Explore project tools</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION (Animated Navy to Deep Blue Gradient + Magnetic Primary Button) */}
      <section className="section-rule-block final-cta-section" id="brief" data-station="Contact">
        <div className="wrap contact-grid">
          <div>
            <span className="section-rule-label cta-eyebrow" data-reveal="fade" data-reveal-delay="0">
              Project brief
            </span>
            <h2
              className="section-rule-heading cta-heading"
              data-reveal="fade"
              data-reveal-delay="80"
              style={{ margin: '0.6rem 0 1rem' }}
            >
              What are you <span className="highlight-word cta-highlight">working on?</span>
            </h2>
            <p
              className="section-rule-lead cta-lead"
              data-reveal="up"
              data-reveal-delay="200"
              style={{ maxWidth: '42ch', marginBottom: '1.5rem' }}
            >
              Tell us who it’s for, what needs to change, and your target timeline.
            </p>
            <div className="contact-links" data-reveal="up" data-reveal-delay="320">
              <a
                className="hd-text-link whatsapp-contact-link cta-link"
                href={'https://wa.me/' + (links.whatsapp || '923000000000')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  style={{ verticalAlign: 'middle', marginRight: '6px' }}
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp the studio</span>
                <span className="link-arrow">↗</span>
              </a>
              {links.booking && (
                <a className="hd-text-link cta-link" href={links.booking}>
                  <span>Book a conversation</span>
                  <span className="link-arrow">↗</span>
                </a>
              )}
              <a className="hd-text-link cta-link" href="/contact">
                <span>Contact page</span>
                <span className="link-arrow">↗</span>
              </a>
            </div>
            <TeleportBot />
          </div>

          <div data-reveal="up" data-reveal-delay="320">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
