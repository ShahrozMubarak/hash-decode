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
import Section from './Section';
import Container from './Container';
import SectionHeader from './SectionHeader';
import WideCard from './WideCard';
import BrowserMock from './visuals/BrowserMock';
import TerminalMock from './visuals/TerminalMock';
import ScanReportMock from './visuals/ScanReportMock';
import ScopeMapMock from './visuals/ScopeMapMock';
import ChecklistMock from './visuals/ChecklistMock';

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
              Build it. Break it. Secure.
            </h1>
            <p className="hero-subtext">
              Custom software and security testing for businesses.
            </p>

            <div className="hero-actions">
              <a className="hd-btn-primary hero-start-cta" href="#brief">
                <span className="btn-label">Start a project</span>
              </a>
              <a href="#services" className="hd-text-link hero-explore-link">
                <span>Explore the studio ›</span>
              </a>
            </div>

            <figure className="hero-robot-wrapper">
              <div className="specimen-visual" id="hero-model-anchor">
                <SceneSurface model="eva" autoMobile={true} />
              </div>
              <div className="hero-ground-shadow" aria-hidden="true" />
            </figure>
          </div>
        </div>
      </section>

      {/* 1. CAPABILITIES (grey section, alternating widecards) */}
      <Section id="services" bg="grey" pad="regular" data-station="Services">
        <Container>
          <SectionHeader
            eyebrow="Capabilities"
            title="Built to perform."
            sub="Custom software, web platforms, and secure APIs, built around how your business works."
          />

          <div className="wide-cards-stack">
            <WideCard
              palette="cloud"
              reverse={false}
              visual={<BrowserMock />}
              eyebrow="Web platforms"
              title="Fast, resilient, accessible."
              desc="Full-stack web applications built with modern frameworks, clean APIs, and rigorous performance standards."
              linkText="Explore web services ›"
              linkHref="/services#web"
            />
            <WideCard
              palette="lilac"
              reverse={true}
              visual={<TerminalMock />}
              eyebrow="API & cloud systems"
              title="Architecture that scales without friction."
              desc="Backend services designed for reliability, high throughput, and straightforward maintenance."
              linkText="Explore cloud services ›"
              linkHref="/services#cloud"
            />
            <WideCard
              palette="ink"
              reverse={false}
              visual={<ScanReportMock />}
              eyebrow="Security testing"
              title="Break it before attackers do."
              desc="Comprehensive vulnerability assessments, penetration testing, and code reviews that leave no stone unturned."
              linkText="Explore security services ›"
              linkHref="/services#security"
            />
          </div>

          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <a className="hd-text-link" href="/services">
              <span>Explore all services ›</span>
            </a>
          </div>
        </Container>
      </Section>

      {/* 2. SECURITY PROCESS (white section, alternating widecards with step numerals) */}
      <Section id="security" bg="white" pad="regular" data-station="Security">
        <Container>
          <SectionHeader
            eyebrow="Security process"
            title="How we break and fix systems."
            sub="A disciplined approach to finding what others miss."
          />

          <div className="wide-cards-stack">
            <WideCard
              palette="mint"
              reverse={false}
              visual={<ScopeMapMock />}
              stepNumber="01"
              eyebrow="Scoping & reconnaissance"
              title="Map every entry point."
              desc="We discover assets, map the attack surface, and build a precise testing plan tailored to your architecture."
            />
            <WideCard
              palette="peach"
              reverse={true}
              visual={<TerminalMock />}
              stepNumber="02"
              eyebrow="Vulnerability analysis"
              title="Uncover the critical flaws."
              desc="Deep manual penetration testing and automated scanning to identify logic errors, injection flaws, and misconfigurations."
            />
            <WideCard
              palette="cloud"
              reverse={false}
              visual={<ChecklistMock />}
              stepNumber="03"
              eyebrow="Remediation & verification"
              title="Fix fast. Retest thoroughly."
              desc="Actionable reports with proof-of-concept steps, remediation guidance, and a complimentary retest to verify every fix."
            />
          </div>

          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <a className="hd-btn-primary" href="#brief">
              <span className="btn-label">Request an audit</span>
            </a>
          </div>
        </Container>
      </Section>

      {/* 3. WORK (STUDIO CONCEPTS - 1 DRAMATIC CARD ON BLACK) */}
      <section className="section-rule-block" id="work" data-station="Work">
        <div className="wrap">
          <div className="section-head-rule">
            <span className="section-rule-label" data-reveal="fade" data-reveal-delay="0">
              Projects
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Studio concepts.
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Working products and tools we have designed and built.
            </p>
          </div>

          <div className="work-duo-grid" data-stagger data-reveal="up" data-reveal-delay="320">
            {projects.length === 0 && <p className="empty-content">Portfolio updates are on their way.</p>}
            {projects.slice(0, 1).map((project, index) => (
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
              From brief to handover.
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
              Team
            </span>
            <h2 className="section-rule-heading" data-reveal="fade" data-reveal-delay="80">
              Meet the team.
            </h2>
            <p className="section-rule-lead" data-reveal="up" data-reveal-delay="200">
              Developers, marketers, and builders working as one studio.
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
              Everything you need to know.
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

      {/* 7. FINAL CALL TO ACTION (Clean two-column contact section on white) */}
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
              What are you working on?
            </h2>
            <p
              className="section-rule-lead cta-lead"
              data-reveal="up"
              data-reveal-delay="200"
              style={{ maxWidth: '42ch', marginBottom: '1.5rem' }}
            >
              Tell us what you need, who it is for, and when you want it done.
            </p>
            <div className="cta-direct-contacts" data-reveal="up" data-reveal-delay="250">
              <div className="cta-contact-row">
                <span className="cta-direct-label">Email:</span>
                <a href="mailto:hashdecodeofficial@gmail.com" className="hd-text-link">hashdecodeofficial@gmail.com</a>
              </div>
              <div className="cta-contact-row">
                <span className="cta-direct-label">WhatsApp:</span>
                <a href="https://wa.me/923001237124" target="_blank" rel="noopener noreferrer" className="hd-text-link">0300 1237124</a>
                <span className="cta-sep"> · </span>
                <a href="https://wa.me/923214866916" target="_blank" rel="noopener noreferrer" className="hd-text-link">0321 4866916</a>
              </div>
              <div className="cta-contact-row">
                <span className="cta-direct-label">HQ:</span>
                <span className="cta-direct-val">Johar Town, Lahore, Pakistan</span>
              </div>
            </div>
            <div className="contact-links" data-reveal="up" data-reveal-delay="320">
              <a
                href="https://wa.me/923001237124"
                target="_blank"
                rel="noopener noreferrer"
                className="hd-text-link"
                aria-label="WhatsApp 0300 1237124"
              >
                <span>WhatsApp 0300 1237124 ›</span>
              </a>
              <a
                href="https://wa.me/923214866916"
                target="_blank"
                rel="noopener noreferrer"
                className="hd-text-link"
                aria-label="WhatsApp 0321 4866916"
              >
                <span>WhatsApp 0321 4866916 ›</span>
              </a>
              {links.instagram && (
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-text-link"
                  aria-label="Instagram"
                >
                  <span>Instagram ›</span>
                </a>
              )}
              {links.facebook && (
                <a
                  href={links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-text-link"
                  aria-label="Facebook"
                >
                  <span>Facebook ›</span>
                </a>
              )}
              {links.youtube && (
                <a
                  href={links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-text-link"
                  aria-label="YouTube"
                >
                  <span>YouTube ›</span>
                </a>
              )}
              {links.tiktok && (
                <a
                  href={links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-text-link"
                  aria-label="TikTok"
                >
                  <span>TikTok ›</span>
                </a>
              )}
              {links.linkedin && (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-text-link"
                  aria-label="LinkedIn"
                >
                  <span>LinkedIn ›</span>
                </a>
              )}
              {links.booking && (
                <a
                  href={links.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-text-link"
                  aria-label="Booking"
                >
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
