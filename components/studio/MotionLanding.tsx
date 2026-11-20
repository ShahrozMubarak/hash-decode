import JourneyControl from './JourneyControl';
import type { Project, Founder } from '@/lib/studio-data';
import type { SocialLinks } from '@/lib/cms';
import { WorkCard } from './Work';
import ContactForm from './ContactForm';
import ResponsiveStage from './ResponsiveStage';
import SceneSurface from './SceneSurface';
import TeleportBot from './TeleportBot';
import HeroParallaxManager from './HeroParallaxManager';
import FAQAccordion from './FAQAccordion';
import ProcessTimeline from './ProcessTimeline';
import TeamStrip from './TeamStrip';
import {
  AppWindow,
  Braces,
  ShieldCheck,
} from 'lucide-react';

const homeServices = [
  {
    icon: AppWindow,
    title: 'Custom Web Platforms',
    desc: 'Fast, modern web apps built end to end.',
    link: '/services',
  },
  {
    icon: Braces,
    title: 'Internal Tools & APIs',
    desc: 'Backends, automations, and admin tools that scale.',
    link: '/services',
  },
  {
    icon: ShieldCheck,
    title: 'Security Audits & Hardening',
    desc: 'Penetration tests and fixes, before you launch.',
    link: '/services',
  },
];

const securitySteps = [
  {
    num: '1',
    title: 'Scope',
    desc: 'We map every entry point, API route, and data flow.',
  },
  {
    num: '2',
    title: 'Test',
    desc: 'Manual and automated testing against real exploits.',
  },
  {
    num: '3',
    title: 'Verify',
    desc: 'We retest every fix and give you a sign-off report.',
  },
];

export default function MotionLanding({
  projects,
  founders,
  links,
  intro: _intro,
  availability: _availability,
}: {
  projects: Project[];
  founders?: Founder[];
  links: SocialLinks;
  intro: string;
  availability?: string;
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

          {/* Hero Centered Content (Apple-Style) */}
          <div className="wrap hero-centered-column">
            <p className="hero-eyebrow">Secure software studio</p>
            <h1 className="hero-h1" aria-label="Build it. Break it. Secure.">
              Build it. Break it. <span className="highlight-word">Secure.</span>
            </h1>
            <p className="hero-subtext">
              Custom software and security testing for businesses.
            </p>

            <figure className="hero-robot-wrapper">
              <div className="specimen-visual" id="hero-model-anchor">
                <SceneSurface model="eva" autoMobile={true} />
              </div>
              <div className="hero-ground-shadow" aria-hidden="true" />
            </figure>

            <div className="hero-actions">
              <a className="hd-btn-primary hero-start-cta cta-magnetic" href="#brief">
                <span className="btn-label">Start a project</span>
              </a>
              <a href="#services" className="hd-text-link hero-explore-link">
                <span>Explore the studio ›</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 1. CAPABILITIES (grey section, white cards) */}
      <section className="section-rule-block" id="services" data-station="Services">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Capabilities
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Built to <span className="highlight-word">perform.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Custom software, web platforms, and secure APIs, built around how your business works.
            </p>
          </div>

          <div className="services-tri-grid" data-stagger>
            {homeServices.map((svc, i) => (
              <article
                key={svc.title}
                className="service-tri-card hd-card"
                data-reveal="up"
                data-reveal-delay={320 + i * 90}
              >
                <div className="service-card-icon-wrap" aria-hidden="true">
                  <svc.icon size={32} />
                </div>
                <h3 className="service-card-title">{svc.title}</h3>
                <p className="service-card-desc">{svc.desc}</p>
                <a
                  href={svc.link}
                  className="card-arrow-link"
                  aria-label={`Learn more about ${svc.title}`}
                >
                  <span>Learn more ›</span>
                </a>
              </article>
            ))}
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-text-link" href="/services">
              <span>Explore services ›</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. SECURITY (white section, grey cards) */}
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
              Penetration testing, code review, and a clear security sign-off.
            </p>
          </div>

          <div className="security-steps-wrapper" data-reveal="up" data-reveal-delay="320">
            <div className="security-strip-grid" data-stagger>
              {securitySteps.map((st, i) => (
                <article
                  key={st.title}
                  className="security-strip-card hd-card"
                  data-reveal="up"
                  data-reveal-delay={320 + i * 80}
                >
                  <span className="security-step-num" aria-hidden="true">{st.num}</span>
                  <h3 className="security-card-title">{st.title}</h3>
                  <p className="security-card-desc">{st.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-btn-primary" href="#brief">
              <span className="btn-label">Request an audit</span>
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
              Studio <span className="highlight-word">concepts.</span>
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Explore working architectures, reactive tools, and real-time operational interfaces.
            </p>
          </div>

          <div className="work-duo-grid" data-stagger data-reveal="up" data-reveal-delay="320">
            {projects.length === 0 && <p className="empty-content">Portfolio updates are on their way.</p>}
            {projects.slice(0, 2).map((project, index) => (
              <WorkCard key={project.slug} project={project} index={index} />
            ))}
          </div>

          <div className="section-rule-action" data-reveal="up" data-reveal-delay="440">
            <a className="hd-text-link" href="/portfolio">
              <span>Project index ›</span>
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
            <a className="hd-btn-primary" href="/about">
              <span className="btn-label">How we work</span>
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
            <a className="hd-btn-primary" href="/about">
              <span className="btn-label">Meet the team</span>
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
            <a className="hd-btn-primary" href="/tools">
              <span className="btn-label">Explore project tools</span>
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
            <div className="cta-direct-contacts" data-reveal="up" data-reveal-delay="250">
              <a href="mailto:hashdecodeofficial@gmail.com" className="cta-direct-item">
                <span className="cta-direct-label">Email:</span>
                <strong>hashdecodeofficial@gmail.com</strong>
              </a>
              <div className="cta-direct-phones">
                <span className="cta-direct-label">Call / WhatsApp:</span>
                <a href="tel:+923001237124" className="cta-phone-link">0300 1237124</a>
                <span className="cta-sep">•</span>
                <a href="tel:+923214866916" className="cta-phone-link">0321 4866916</a>
              </div>
              <div className="cta-direct-item cta-location">
                <span className="cta-direct-label">HQ:</span>
                <span>Johar Town, Lahore, Pakistan</span>
              </div>
            </div>
            <div className="contact-links social-links" data-reveal="up" data-reveal-delay="320">
              <a
                href="https://wa.me/923001237124"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-whatsapp"
                aria-label="WhatsApp 0300 1237124"
              >
                <span>WhatsApp (0300 1237124) ›</span>
              </a>
              <a
                href="https://wa.me/923214866916"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-whatsapp"
                aria-label="WhatsApp 0321 4866916"
              >
                <span>WhatsApp (0321 4866916) ›</span>
              </a>
              {links.instagram && (
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-instagram"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '6px' }} aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="17.5" x2="17.51" y2="17.51"/></svg>
                  <span>Instagram ›</span>
                </a>
              )}
              {links.facebook && (
                <a
                  href={links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-facebook"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }} aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10H2v6h3v4h4v-4h2l1-4h-4V7a1 1 0 0 1 1-1h3v2.06h-2.22a1 1 0 0 0-1 1v2.06h-3V12h3v4z" /></svg>
                  <span>Facebook ›</span>
                </a>
              )}
              {links.youtube && (
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-youtube"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }} aria-hidden="true"><path d="M23.498 6.327A3 3 0 0 0 22.52 4.5H1.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h21a3 3 0 0 0 3-3V9.327a3 3 0 0 0-.002-3m-9.494 1.834L8.366 16.1l-3.408-6.014L8.366 4.08z" /></svg>
                  <span>YouTube ›</span>
                </a>
              )}
              {links.tiktok && (
                <a
                  href={links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-tiktok"
                  aria-label="TikTok"
                >
                  <span className="social-badge social-tiktok-badge" aria-hidden="true">T</span>
                  <span>TikTok ›</span>
                </a>
              )}
              {links.linkedin && (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-linkedin"
                  aria-label="LinkedIn"
                >
                  <span className="social-badge social-linkedin-badge" aria-hidden="true">in</span>
                  <span>LinkedIn ›</span>
                </a>
              )}
              {links.booking && (
                <a
                  href={links.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-booking"
                  aria-label="Booking"
                >
                  <span className="social-badge social-booking-badge" aria-hidden="true">B</span>
                  <span>Book a conversation ›</span>
                </a>
              )}
              <a className="hd-text-link cta-link" href="/contact">
                <span>Contact page ›</span>
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
