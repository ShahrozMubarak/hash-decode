import JourneyControl from './JourneyControl';
import type { Project, Founder } from '@/lib/studio-data';
import type { SocialLinks } from '@/lib/cms';
import ContactForm from './ContactForm';
import ResponsiveStage from './ResponsiveStage';
import SceneSurface from './SceneSurface';
import TeleportBot from './TeleportBot';
import HeroParallaxManager from './HeroParallaxManager';
import FAQAccordion from './FAQAccordion';
import ProcessTimeline from './ProcessTimeline';
import Section from './Section';
import Container from './Container';
import SectionHeader from './SectionHeader';
import WideCard from './WideCard';
import BrowserMock from './visuals/BrowserMock';
import TerminalMock from './visuals/TerminalMock';
import ScanReportMock from './visuals/ScanReportMock';
import ScopeMapMock from './visuals/ScopeMapMock';
import ChecklistMock from './visuals/ChecklistMock';
import CostEstimatorMock from './visuals/CostEstimatorMock';
import HeaderScannerMock from './visuals/HeaderScannerMock';

export default function MotionLanding({
  projects: _projects,
  founders: _founders,
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

      {/* 3. WORK / PROJECTS (black section, 3 dark widecards) */}
      <Section id="work" bg="black" pad="regular" data-station="Work">
        <Container>
          <SectionHeader
            eyebrow="Projects"
            title="Studio concepts."
            sub="Working products and tools we have designed and built."
          />

          <div className="wide-cards-stack">
            <WideCard
              palette="midnight"
              reverse={false}
              eyebrow="E-commerce & identity"
              title="Foolish Arc"
              desc="Full e-commerce platform with custom checkout, inventory synchronization, and bespoke brand aesthetics."
              ctaText="View project"
              ctaHref="/portfolio/foolish-arc"
              visual={
                <div className="visual-panel browser-mock" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid currentColor', opacity: 0.85 }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '2px 12px', borderRadius: '980px', fontSize: '11px', fontFamily: 'var(--font-sans)', border: '1px solid currentColor', opacity: 0.6 }}>
                      foolisharc.com
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', flex: 1, minHeight: '180px' }}>
                    <img
                      src="/team/foolisharc.jpeg"
                      alt="Foolish Arc e-commerce platform"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </div>
              }
            />

            <WideCard
              palette="violet"
              reverse={true}
              eyebrow="Internal tooling"
              title="Cloud Cost Estimator"
              desc="Real-time multi-cloud price modeling tool that helps engineering teams forecast and reduce AWS/GCP spend."
              ctaText="Try the estimator"
              ctaHref="/tools/estimate"
              visual={<CostEstimatorMock />}
            />

            <WideCard
              palette="teal"
              reverse={false}
              eyebrow="Security tool"
              title="Header Security Scanner"
              desc="Instant HTTP response header analyzer grading websites against OWASP, HSTS, and CSP security baselines."
              ctaText="Run a scan"
              ctaHref="/tools/security-check"
              visual={<HeaderScannerMock />}
            />
          </div>

          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <a className="hd-btn-primary" href="/portfolio">
              <span className="btn-label">View all projects</span>
            </a>
          </div>
        </Container>
      </Section>

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

      {/* 5. TEAM (white section, 4 alternating widecards with 4:5 rounded rectangle photos) */}
      <Section id="team" bg="white" pad="regular" data-station="Team">
        <Container>
          <SectionHeader
            eyebrow="Leadership"
            title="The team behind the studio."
            sub="Engineers and designers building resilient software."
          />

          <div className="wide-cards-stack">
            {/* 1. Fawad Ahmed */}
            <WideCard
              palette="ink"
              reverse={false}
              eyebrow="Co-Founder & Head of Security"
              title="Fawad Ahmed"
              desc="Engineers containerization pipelines, automated CI/CD releases, and zero-trust edge infrastructure. Guarantees high availability and defensive security."
              linkText="Connect on LinkedIn ›"
              linkHref="https://linkedin.com/company/hash-decode"
              visual={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px' }}>
                  <img
                    src="/team/fawad.jpeg"
                    alt="Fawad Ahmed"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      aspectRatio: '4 / 5',
                      objectFit: 'cover',
                      borderRadius: '28px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'block',
                    }}
                  />
                </div>
              }
            />

            {/* 2. Junaid Tariq */}
            <WideCard
              palette="lilac"
              reverse={true}
              eyebrow="Co-Founder & Head of Engineering"
              title="Junaid Tariq"
              desc="Brings precision to full-stack web applications, real-time architectures, and reactive user interfaces. Focused on sub-second loads and clean, maintainable systems."
              linkText="Connect on LinkedIn ›"
              linkHref="https://linkedin.com/company/hash-decode"
              visual={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px' }}>
                  <img
                    src="/team/junaid.jpeg"
                    alt="Junaid Tariq"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      aspectRatio: '4 / 5',
                      objectFit: 'cover',
                      borderRadius: '28px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      display: 'block',
                    }}
                  />
                </div>
              }
            />

            {/* 3. Shahmeer Khan */}
            <WideCard
              palette="mint"
              reverse={false}
              eyebrow="Lead Product Designer"
              title="Shahmeer Khan"
              desc="Shapes intuitive interaction models, real-time 3D visualizations, and precision design systems. Bridges aesthetic elegance with tactile, latency-free digital response."
              linkText="Connect on LinkedIn ›"
              linkHref="https://linkedin.com/company/hash-decode"
              visual={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px' }}>
                  <img
                    src="/team/shahmeer.jpeg"
                    alt="Shahmeer Khan"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      aspectRatio: '4 / 5',
                      objectFit: 'cover',
                      borderRadius: '28px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      display: 'block',
                    }}
                  />
                </div>
              }
            />

            {/* 4. Shahroz Dogar */}
            <WideCard
              palette="midnight"
              reverse={true}
              eyebrow="Founder & CEO"
              title="Shahroz Dogar"
              desc="Oversees distributed systems architecture, high-concurrency cloud deployments, and zero-trust security frameworks. Leads technical direction and end-to-end delivery for all enterprise platforms."
              linkText="Connect on LinkedIn ›"
              linkHref="https://linkedin.com/company/hash-decode"
              visual={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '24px' }}>
                  <img
                    src="/team/shahroz.jpeg"
                    alt="Shahroz Dogar"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      aspectRatio: '4 / 5',
                      objectFit: 'cover',
                      borderRadius: '28px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'block',
                    }}
                  />
                </div>
              }
            />
          </div>

          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <a className="hd-btn-primary" href="/about">
              <span className="btn-label">About the founders</span>
            </a>
          </div>
        </Container>
      </Section>

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
