import { meta } from '@/lib/meta';
import { ArrowUpRight, Calculator, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = meta(
  'Engineering Utilities & Free Tools | Hash Decode',
  'Estimate a custom software engineering budget or inspect a public website’s HTTP security posture.',
  '/tools'
);

export default function Tools() {
  return (
    <div className="wrap interior page-tools-hub">
      {/* Inner-page Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio utilities</p>
        <h1 className="inner-hero-h1">
          Engineering <span style={{ color: '#1E40AF' }}>tools.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Free interactive utilities designed by our team. Model a project budget with our cost estimator
          or audit your website&apos;s HTTP security headers before planning your next sprint.
        </p>
      </header>

      {/* 2-Card Tools Grid */}
      <section className="tools-cards-section" data-reveal="up">
        <div className="tools-cards-grid" data-stagger>
          {/* Tool 1: Cost Estimator */}
          <article className="tool-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="tool-card-icon-wrap" aria-hidden="true">
              <Calculator size={26} />
            </div>

            <div className="tool-card-content">
              <span className="section-rule-label">Planning utility</span>
              <h2 className="tool-card-title">Project cost estimator</h2>
              <p className="tool-card-desc">
                Step through scope categories, features, and technical complexity to calculate an illustrative
                planning range. Uses only your selections and real studio formulas.
              </p>

              <ul className="tool-feature-list">
                <li>
                  <CheckCircle2 size={15} className="feature-check-icon" aria-hidden="true" />
                  <span>3-step guided configuration stepper</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="feature-check-icon" aria-hidden="true" />
                  <span>Instant real-time pricing breakdown</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="feature-check-icon" aria-hidden="true" />
                  <span>Direct handoff into project consultation</span>
                </li>
              </ul>
            </div>

            <div className="tool-card-footer">
              <a className="hd-btn-primary" href="/tools/estimate">
                <span className="btn-label">Open estimator</span>
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
          </article>

          {/* Tool 2: Security Checker */}
          <article className="tool-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="tool-card-icon-wrap" aria-hidden="true">
              <ShieldCheck size={26} />
            </div>

            <div className="tool-card-content">
              <span className="section-rule-label">Security utility</span>
              <h2 className="tool-card-title">Website security checker</h2>
              <p className="tool-card-desc">
                Inspect any public domain for Content-Security-Policy, HSTS, frame protection, and transport
                safeguards. Direct integration with Mozilla HTTP Observatory.
              </p>

              <ul className="tool-feature-list">
                <li>
                  <CheckCircle2 size={15} className="feature-check-icon" aria-hidden="true" />
                  <span>Honest, real-time HTTP header inspection</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="feature-check-icon" aria-hidden="true" />
                  <span>Observatory grade and pass/fail metrics</span>
                </li>
                <li>
                  <CheckCircle2 size={15} className="feature-check-icon" aria-hidden="true" />
                  <span>Direct link to test-by-test findings</span>
                </li>
              </ul>
            </div>

            <div className="tool-card-footer">
              <a className="hd-btn-primary" href="/tools/security-check">
                <span className="btn-label">Run security check</span>
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
          </article>
        </div>
      </section>

      {/* Need Custom Architecture Section */}
      <section className="work-cta-card hd-card" data-reveal="up" style={{ marginTop: '3.5rem' }}>
        <div className="card-glare" aria-hidden="true" />
        <div className="cta-content">
          <span className="section-rule-label">Custom requirements</span>
          <h2 className="section-rule-heading" style={{ margin: '0.4rem 0 0.8rem' }}>
            Need a custom quote or deeper penetration audit?
          </h2>
          <p className="section-rule-lead">
            Every production system has unique constraints. Speak directly with our founding engineers
            for a fixed-milestone proposal or authorized security assessment.
          </p>
        </div>
        <div className="cta-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a className="hd-btn-primary" href="/contact">
            <span className="btn-label">Start a consultation</span>
            <span className="btn-arrow-circle" aria-hidden="true">
              <Sparkles size={15} />
            </span>
          </a>
          <a className="hd-btn-secondary" href="/services">
            <span>Explore our services</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
