import { meta } from '@/lib/meta';
import WideCard from '@/components/studio/WideCard';
import BrowserMock from '@/components/studio/visuals/BrowserMock';
import TerminalMock from '@/components/studio/visuals/TerminalMock';
import ScopeMapMock from '@/components/studio/visuals/ScopeMapMock';
import ScanReportMock from '@/components/studio/visuals/ScanReportMock';
import BottomCta from '@/components/studio/BottomCta';
import { Check } from 'lucide-react';

export const metadata = meta(
  'Services & Engineering Solutions | Hash Decode',
  'Custom software engineering, web application development, and authorised security audits.',
  '/services'
);

export default function Services() {
  return (
    <div className="wrap interior page-services-content">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Services</p>
        <h1 className="inner-hero-h1">
          Services &amp; Solutions.
        </h1>
        <p className="section-rule-lead">
          Software designed for the people who use it, and practical security reviews for the teams who maintain it.
          No jargon, no bloated teams—just direct engineering that solves real business problems.
        </p>
      </header>

      {/* 4 Alternating WideCards for Core Services */}
      <section className="service-catalog-section" aria-label="Services Catalog" style={{ marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule" data-reveal="fade">
          <span className="section-rule-label">Core capabilities</span>
          <h2 className="section-rule-heading">
            What we specialise in.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', marginTop: 'var(--s-5)' }}>
          <WideCard
            palette="cloud"
            eyebrow="01 · Products"
            title="Custom web applications."
            desc="Map core user journeys, test interactive prototypes, and ship responsive, typed web apps designed to scale smoothly."
            visual={<BrowserMock />}
            ctaText="Discuss products"
            ctaHref="/contact?type=Products"
          />
          <WideCard
            palette="lilac"
            reverse
            eyebrow="02 · Platforms"
            title="Web platforms &amp; systems."
            desc="Server-rendered pages with sub-second initial loads, structured content models your team can edit without code, and accessible SEO markup."
            visual={<TerminalMock />}
            ctaText="Discuss platforms"
            ctaHref="/contact?type=Platforms"
          />
          <WideCard
            palette="peach"
            eyebrow="03 · Tools"
            title="Internal tools &amp; consoles."
            desc="Automate repeated manual operational workflows with custom management consoles, role-based access, and comprehensive audit trails."
            visual={<ScopeMapMock />}
            ctaText="Discuss tools"
            ctaHref="/contact?type=Tools"
          />
          <WideCard
            palette="ink"
            reverse
            eyebrow="04 · Security"
            title="Security audits &amp; hardening."
            desc="Inspect authentication and permission boundaries, reproducible vulnerability findings with prioritized fixes, and concrete patch roadmaps."
            visual={<ScanReportMock />}
            ctaText="Discuss security"
            ctaHref="/contact?type=Security"
          />
        </div>
      </section>

      {/* 4-Step Build Delivery Timeline */}
      <section className="service-process-section" data-reveal="up" style={{ marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Transparent delivery</span>
          <h2 className="section-rule-heading">
            How we build together.
          </h2>
          <p className="section-rule-lead">From brief to live release with full transparency.</p>
        </div>
        <div className="process-grid-4" data-stagger>
          <div className="process-card" data-reveal="up">
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              01
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Listen &amp; scope</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              We review your goals in plain words. We agree on features, timeline, and a fixed, fair quote with zero hidden fees.
            </p>
          </div>
          <div className="process-card" data-reveal="up">
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              02
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Clickable prototype</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              Within 7 business days, you test a working interactive prototype. You see exactly how the software works before full code is written.
            </p>
          </div>
          <div className="process-card" data-reveal="up">
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              03
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Production build</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              We write clean, tested TypeScript code. Regular progress reviews keep you in the loop as every feature comes to life.
            </p>
          </div>
          <div className="process-card" data-reveal="up">
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              04
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Launch &amp; handover</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              We deploy to your cloud, verify security, and transfer the repository and credentials with the agreed handover documentation.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Hash Decode vs Traditional Agencies */}
      <section className="service-comparison-section" data-reveal="up" style={{ marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">The studio difference</span>
          <h2 className="section-rule-heading">
            Why teams choose us.
          </h2>
        </div>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th style={{ fontWeight: 700 }}>Hash Decode Studio</th>
                <th>Traditional Agencies</th>
                <th>Freelance Marketplaces</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Communication</strong></td>
                <td><Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Direct with senior engineer</td>
                <td>Account managers &amp; middlemen</td>
                <td>Often unresponsive</td>
              </tr>
              <tr>
                <td><strong>Security Reviews</strong></td>
                <td><Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Built-in penetration testing</td>
                <td>Rarely included or extra cost</td>
                <td>Usually ignored</td>
              </tr>
              <tr>
                <td><strong>Code Ownership</strong></td>
                <td><Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Client-owned code &amp; keys</td>
                <td>Complex IP retention clauses</td>
                <td>Unclear license terms</td>
              </tr>
              <tr>
                <td><strong>Speed to Market</strong></td>
                <td><Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 2 to 6 weeks average release</td>
                <td>3 to 6 months of meetings</td>
                <td>Unpredictable delivery</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Single Wide Ink CTA Card */}
      <BottomCta
        title="Request an audit."
        sub="Tell us about your system and timeline. We will scope a fixed-price security review."
        btnText="Request an audit"
        btnHref="/contact"
      />
    </div>
  );
}
