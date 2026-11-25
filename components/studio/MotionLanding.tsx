import Link from 'next/link';
import JourneyControl from './JourneyControl';
import { defaultFounders, type Project, type Founder } from '@/lib/studio-defaults';
import type { SocialLinks } from '@/lib/cms';
import type { LiquidPalette } from './Liquid';
import ContactForm from './ContactForm';
import ResponsiveStage from './ResponsiveStage';
import SceneSurface from './SceneSurface';
import TeleportBot from './TeleportBot';
import HeroParallaxManager from './HeroParallaxManager';
import FAQAccordion from './FAQAccordion';
import Section from './Section';
import Container from './Container';
import SectionHeader from './SectionHeader';
import WideCard from './WideCard';
import AppleDeviceCard from './AppleDeviceCard';
import PhoneMockup from './visuals/PhoneMockup';
import LaptopMockup from './visuals/LaptopMockup';
import TerminalMock from './visuals/TerminalMock';
import ScopeMapMock from './visuals/ScopeMapMock';
import ChecklistMock from './visuals/ChecklistMock';
import CostEstimatorMock from './visuals/CostEstimatorMock';
import HeaderScannerMock from './visuals/HeaderScannerMock';
import TypingSecure from './TypingSecure';

export default function MotionLanding({
  founders,
}: {
  projects?: Project[];
  founders?: Founder[];
  links?: SocialLinks;
  intro?: string;
  availability?: string;
}) {
  const founderList = (founders && founders.length > 0) ? founders : defaultFounders;
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
            <h1 className="hero-h1" aria-label="Build it. Break it. Protect.">
              <span className="hero-tag-first" style={{ color: '#ffffff', marginRight: '0.28em' }}>Build it. Break it.</span>
              <span className="hero-tag-dynamic"><TypingSecure /></span>
            </h1>
            <p className="hero-subtext">
              Custom software engineering, high-throughput cloud architecture, and rigorous offensive security testing built shoulder-to-shoulder with founders to scale and protect mission-critical digital systems.
            </p>

            <div className="hero-actions">
              <a className="hd-btn-primary hero-start-cta" href="#brief">
                <span className="btn-label">Start a project</span>
              </a>
              <a href="#services" className="hero-explore-link">
                <span className="btn-label">Explore the studio ›</span>
              </a>
            </div>

            {/* HERO STAGE: Transparent robot container */}
            <div className="hero-stage-card is-visible" aria-label="Autonomous Studio Agent Stage">
              <div className="hero-stage-card__inner">
                <div className="hero-stage-card__content">
                  <figure className="hero-robot-wrapper">
                    <div className="specimen-visual" id="hero-model-anchor">
                      <SceneSurface model="eva" autoMobile={true} />
                    </div>
                    <div className="hero-ground-shadow" aria-hidden="true" />
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. CAPABILITIES (grey section, alternating widecards) */}
      <Section id="services" bg="grey" pad="regular" data-station="Services">
        <Container>
          <SectionHeader
            eyebrow="Capabilities"
            title={<><span className="hd-accent-navy">Built</span> to <span className="hd-accent-navy">perform</span>.</>}
            sub="Custom software, web platforms, and secure APIs, built around how your business works."
          />

          <div className="wide-cards-stack">
            <WideCard
              palette="cloud"
              reverse={false}
              visual={<PhoneMockup variant="web" />}
              eyebrow="Web platforms"
              title={<>Fast, <span className="hd-accent-navy">resilient</span>, accessible.</>}
              desc="Full-stack web applications built with modern frameworks, clean APIs, and rigorous performance standards."
              linkText="Explore web services ›"
              linkHref="/services#web"
            />
            <WideCard
              palette="lilac"
              reverse={true}
              visual={<LaptopMockup variant="cloud" />}
              eyebrow="API & cloud systems"
              title={<><span className="hd-accent-navy">Architecture</span> that <span className="hd-accent-navy">scales</span> without friction.</>}
              desc="Backend services designed for reliability, high throughput, and straightforward maintenance."
              linkText="Explore cloud services ›"
              linkHref="/services#cloud"
            />
            <WideCard
              palette="ink"
              reverse={false}
              visual={<PhoneMockup variant="security" />}
              eyebrow="Security testing"
              title={<><span className="hd-accent-navy">Break</span> it before attackers do.</>}
              desc="Comprehensive vulnerability assessments, penetration testing, and code reviews that leave no stone unturned."
              linkText="Explore security services ›"
              linkHref="/services#security"
            />

            {/* Apple News+ Style Centered Device Showcase Card */}
            <AppleDeviceCard
              palette="peach"
              eyebrow="Interactive Device Preview"
              title={<><span className="hd-accent-navy">Engineered</span> for real-world <span className="hd-accent-navy">devices</span>.</>}
              highlightWords={['S O L U T I O N S']}
              deviceType="phone"
              serviceVariant="web"
              interactive={true}
              sub="Direct senior engineering across web platforms, multi-region cloud clusters, and zero-trust security audits. Tap the tabs on the device to preview each service."
              ctaText="Schedule an architectural review ›"
              ctaHref="/contact"
              ctaVariant="coral"
            />
          </div>

          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <Link className="hd-btn-azure" href="/services">
              <span className="btn-label">Explore all services ›</span>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 2. SECURITY PROCESS (white section, alternating widecards with step numerals) */}
      <Section id="security" bg="white" pad="regular" data-station="Security">
        <Container>
          <SectionHeader
            eyebrow="Security process"
            title={<>How we <span className="hd-accent-navy">break</span> and <span className="hd-accent-navy">fix</span> systems.</>}
            sub="A disciplined approach to finding what others miss."
          />

          <div className="wide-cards-stack">
            <WideCard
              palette="mint"
              reverse={false}
              visual={<ScopeMapMock />}
              stepNumber="01"
              eyebrow="Scoping & reconnaissance"
              title={<><span className="hd-accent-navy">Map</span> every entry point.</>}
              desc="We discover assets, map the attack surface, and build a precise testing plan tailored to your architecture."
            />
            <WideCard
              palette="peach"
              reverse={true}
              visual={<TerminalMock />}
              stepNumber="02"
              eyebrow="Vulnerability analysis"
              title={<><span className="hd-accent-navy">Uncover</span> the critical flaws.</>}
              desc="Deep manual penetration testing and automated scanning to identify logic errors, injection flaws, and misconfigurations."
            />
            <WideCard
              palette="cloud"
              reverse={false}
              visual={<ChecklistMock />}
              stepNumber="03"
              eyebrow="Remediation & verification"
              title={<><span className="hd-accent-navy">Fix</span> fast. <span className="hd-accent-navy">Retest</span> thoroughly.</>}
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
            title={<><span className="hd-accent-navy">Studio</span> concepts.</>}
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
              ctaVariant="coral"
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
                      width={600}
                      height={340}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </div>
              }
            />
          </div>

          {/* Work Action Button */}
          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <Link className="hd-btn-secondary" href="/portfolio">
              <span className="btn-label">View all projects</span>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 3B. INTERACTIVE UTILITIES & CALCULATORS (standalone section separate from projects) */}
      <Section id="tools" bg="grey" pad="regular" data-station="Tools">
        <Container>
          <SectionHeader
            eyebrow="Interactive Utilities"
            title={<>Engineering <span className="hd-accent-navy">calculators</span> &amp; <span className="hd-accent-navy">scanners</span>.</>}
            sub="Standalone public tools engineered to forecast cloud infrastructure spend and verify cryptographic compliance."
          />

          <div className="wide-cards-stack">
            <WideCard
              palette="violet"
              reverse={true}
              eyebrow="Internal tooling"
              title="Cloud Cost Estimator"
              desc="Real-time multi-cloud price modeling tool that helps engineering teams forecast and reduce AWS/GCP spend."
              ctaText="Try the estimator"
              ctaHref="/tools/estimate"
              ctaVariant="azure"
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
              ctaVariant="coral"
              visual={<HeaderScannerMock />}
            />
          </div>
        </Container>
      </Section>

      {/* 4. TEAM (white section, 4 alternating widecards with 4:5 rounded rectangle photos) */}
      <Section id="team" bg="white" pad="regular" data-station="Team">
        <Container>
          <SectionHeader
            eyebrow="Leadership"
            title={<>The <span className="hd-accent-navy">team</span> behind the <span className="hd-accent-navy">studio</span>.</>}
            sub="Engineers and designers building resilient software."
          />

          <div className="wide-cards-stack">
            {founderList.map((founder, idx) => {
              const palettes: LiquidPalette[] = ['midnight', 'mint', 'peach', 'teal'];
              const palette = palettes[idx % palettes.length];
              const isDark = palette === 'midnight' || palette === 'teal';

              return (
                <WideCard
                  key={founder.id || founder.name}
                  palette={palette}
                  reverse={idx % 2 === 1}
                  eyebrow={founder.role}
                  title={founder.name}
                  desc={
                    <>
                      <p style={{ margin: 0 }}>{founder.bio}</p>
                      {founder.quote && (
                        <p className="desktop-only-quote" style={{ margin: '8px 0 0', fontStyle: 'italic', opacity: 0.85 }}>
                          “{founder.quote}”
                        </p>
                      )}
                    </>
                  }
                  linkText="Connect on LinkedIn ›"
                  linkHref={founder.url || 'https://linkedin.com/company/hash-decode'}
                  visual={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', padding: '16px' }}>
                      <div
                        className="founder-photo-frame"
                        style={{
                          width: '100%',
                          maxWidth: '345px',
                          aspectRatio: '4 / 5',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,0.06)',
                          border: isDark
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
                        }}
                      >
                        <img
                          src={founder.image}
                          alt={founder.name}
                          width={819}
                          height={1024}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>

          <div className="section-rule-action" style={{ marginTop: 'var(--s-6)', textAlign: 'center' }}>
            <Link className="hd-btn-azure" href="/about">
              <span className="btn-label">About the founders</span>
            </Link>
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
            <Link className="hd-btn-primary" href="/tools">
              <span className="btn-label">Explore project tools</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CONTACT SECTION (Full-width liquid crystal card with secondary channels relocated below) */}
      <Section id="brief" bg="white" pad="regular" data-station="Contact">
        <Container>
          <div className="contact-fullwidth-wrap" style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--s-6)' }}>
              <p className="hd-section-eyebrow">Contact</p>
              <h2 className="contact-title" style={{ margin: '8px 0 12px' }}>
                <span className="hd-accent-navy">Start</span> a conversation.
              </h2>
              <p className="contact-sub" style={{ maxWidth: '580px', margin: '0 auto' }}>
                Tell us what you&apos;re building. Enter your work email below to begin.
              </p>
            </div>

            {/* Full-width liquid crystal form card */}
            <div
              className="contact-form-card liquid liquid--cloud is-visible"
              style={{ width: '100%', maxWidth: '1120px', margin: '0 auto' }}
            >
              <span className="liquid__blob liquid__blob--a" aria-hidden="true" />
              <span className="liquid__blob liquid__blob--b" aria-hidden="true" />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <ContactForm />
              </div>
            </div>

            {/* Secondary contact channels relocated cleanly below the form */}
            <div className="contact-secondary-channels-bar" style={{ width: '100%', maxWidth: '1120px', margin: '48px auto 0' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                  marginBottom: '36px',
                }}
              >
                {/* Direct email card */}
                <div
                  className="hd-card"
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: 'rgba(11, 31, 58, 0.03)',
                    border: '1px solid rgba(11, 31, 58, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(0,0,0,0.5)', display: 'block', marginBottom: '8px' }}>
                    Direct email
                  </span>
                  <a href="mailto:contact@hashdecode.com" className="hd-text-link" style={{ fontSize: '15px', fontWeight: 600, color: '#0B1F3A' }}>
                    <span>contact@hashdecode.com ›</span>
                  </a>
                </div>

                {/* Office location card */}
                <div
                  className="hd-card"
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: 'rgba(11, 31, 58, 0.03)',
                    border: '1px solid rgba(11, 31, 58, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(0,0,0,0.5)', display: 'block', marginBottom: '8px' }}>
                    Office location
                  </span>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0B1F3A' }}>
                    Lahore, Pakistan
                  </p>
                </div>

                {/* WhatsApp hotline card */}
                <div
                  className="hd-card"
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: 'rgba(11, 31, 58, 0.03)',
                    border: '1px solid rgba(11, 31, 58, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(0,0,0,0.5)', display: 'block', marginBottom: '8px' }}>
                    WhatsApp hotline
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a
                      href="https://wa.me/923214452588"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hd-text-link"
                      style={{ fontSize: '14px', fontWeight: 600, color: '#0B1F3A' }}
                    >
                      <span>🇵🇰 Pakistan: +92 321 4452588 ›</span>
                    </a>
                    <a
                      href="https://wa.me/447943008688"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hd-text-link"
                      style={{ fontSize: '14px', fontWeight: 600, color: '#0B1F3A' }}
                    >
                      <span>🇬🇧 UK: +44 7943 008688 ›</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Social links row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <a href="https://github.com/hashdecode" target="_blank" rel="noopener noreferrer" className="hd-text-link" style={{ fontSize: '14px', fontWeight: 500 }}>
                  <span>GitHub ›</span>
                </a>
                <a href="https://linkedin.com/company/hash-decode" target="_blank" rel="noopener noreferrer" className="hd-text-link" style={{ fontSize: '14px', fontWeight: 500 }}>
                  <span>LinkedIn ›</span>
                </a>
                <a href="https://x.com/hashdecode" target="_blank" rel="noopener noreferrer" className="hd-text-link" style={{ fontSize: '14px', fontWeight: 500 }}>
                  <span>X ›</span>
                </a>
              </div>

              {/* TeleportBot bubble centered */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <TeleportBot />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
