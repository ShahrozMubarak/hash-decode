import { services } from '@/lib/studio-data';
import { meta } from '@/lib/meta';
import {
  ArrowUpRight,
  AppWindow,
  Cpu,
  Code2,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const metadata = meta(
  'Services & Engineering Solutions | Hash Decode',
  'Custom software engineering, web application development, and authorised security audits.',
  '/services'
);

const serviceIcons: Record<string, typeof AppWindow> = {
  products: AppWindow,
  platforms: Cpu,
  tools: Code2,
  security: ShieldCheck,
};

const serviceBullets: Record<string, string[]> = {
  products: [
    'Map core user journeys and eliminate workflow friction',
    'Interactive prototype before full code production',
    'Responsive, typed web apps designed to scale smoothly',
  ],
  platforms: [
    'Server-rendered pages with sub-second initial loads',
    'Structured content models your team can edit without code',
    'Accessible, SEO-optimized markup built with modern TypeScript',
  ],
  tools: [
    'Automate repeated manual operational workflows',
    'Custom management consoles with role-based access',
    'Comprehensive audit trails and enterprise data security',
  ],
  security: [
    'Inspect authentication and permission boundaries',
    'Reproducible vulnerability findings with prioritized fixes',
    'Concrete patch roadmaps and retest sign-off verification',
  ],
};

function ServiceVisual({ id }: { id: string }) {
  if (id === 'products') {
    return (
      <div className="service-visual-box browser-window-mock" aria-hidden="true">
        <div className="mock-window-chrome">
          <div className="mock-window-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span className="mock-address-pill">hashdecode.com/app</span>
        </div>
        <div className="mock-window-canvas">
          <div className="mock-canvas-sidebar" />
          <div className="mock-canvas-main">
            <div className="mock-canvas-hero-card" />
            <div className="mock-canvas-row">
              <div className="mock-canvas-widget" />
              <div className="mock-canvas-widget" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === 'platforms') {
    return (
      <div className="service-visual-box code-braces-mock" aria-hidden="true">
        <div className="code-mock-header">
          <span className="code-mock-title">PlatformRouter.tsx</span>
          <span className="code-mock-badge">TypeScript</span>
        </div>
        <div className="code-mock-body">
          <div className="code-row"><span className="kw">export default function</span> <span className="fn">Platform</span>() {'{'}</div>
          <div className="code-row ind-1"><span className="kw">const</span> cache = <span className="fn">useRuntime</span>();</div>
          <div className="code-row ind-1"><span className="tag">&lt;Workspace</span> <span className="attr">typed</span> <span className="attr">ssr</span>&gt;</div>
          <div className="code-row ind-2"><span className="tag">&lt;InteractiveFlow</span> <span className="attr">speed</span>=<span className="val">&quot;sub-second&quot;</span> /&gt;</div>
          <div className="code-row ind-1"><span className="tag">&lt;/Workspace&gt;</span></div>
          <div className="code-row">{'}'}</div>
        </div>
      </div>
    );
  }

  if (id === 'tools') {
    return (
      <div className="service-visual-box pipeline-flow-mock" aria-hidden="true">
        <div className="pipeline-node node-active">
          <span className="node-badge">01</span>
          <div className="node-info">
            <strong>Intake &amp; Scope</strong>
            <span>Direct engineer sync</span>
          </div>
        </div>
        <div className="pipeline-connector" />
        <div className="pipeline-node node-running">
          <span className="node-badge">02</span>
          <div className="node-info">
            <strong>Automated Pipeline</strong>
            <span>Typed APIs &amp; Dashboards</span>
          </div>
        </div>
        <div className="pipeline-connector" />
        <div className="pipeline-node">
          <span className="node-badge">03</span>
          <div className="node-info">
            <strong>Full Audit Log</strong>
            <span>Verified sign-off</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-visual-box shield-scan-mock" aria-hidden="true">
      <div className="shield-display-unit">
        <ShieldCheck size={88} className="shield-svg-icon" />
        <div className="shield-laser-beam" />
      </div>
      <div className="shield-status-hud">
        <span className="shield-indicator-dot" />
        <span>ZERO TRUST DEFENSE · AUDITED BOUNDARY</span>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <div className="wrap interior page-services-content">
      {/* Inner-page Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Services</p>
        <h1 className="inner-hero-h1">
          Services &amp; <span style={{ color: '#1E40AF' }}>Solutions.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Software designed for the people who use it, and practical security reviews for the teams who maintain it.
          No jargon, no bloated teams—just direct engineering that solves real business problems.
        </p>
      </header>

      {/* Service Blocks with Alternating Visuals */}
      <section className="service-catalog-section" aria-label="Services Catalog">
        <div className="section-head-rule" data-reveal="fade">
          <span className="section-rule-label">Core capabilities</span>
          <h2 className="section-rule-heading">
            What we <span className="highlight-word">specialise in.</span>
          </h2>
        </div>

        <div className="service-rows-container">
          {services.map((s, index) => {
            const Icon = serviceIcons[s.id] || AppWindow;
            const bullets = serviceBullets[s.id] || [];
            const isReversed = index % 2 === 1;

            return (
              <article
                key={s.id}
                id={s.id}
                className={`service-alternating-row ${isReversed ? 'is-reversed' : ''}`}
                data-reveal="up"
              >
                <div className="service-row-text">
                  <div className="service-icon-tile" aria-hidden="true">
                    <Icon size={24} />
                  </div>
                  <h3 className="service-row-title">{s.name}</h3>
                  <p className="service-row-desc">{s.detail}</p>

                  <ul className="service-bullets-list">
                    {bullets.map((b) => (
                      <li key={b} className="service-bullet-item">
                        <Check size={16} className="bullet-check-icon" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="service-row-action">
                    <a
                      className="hd-text-link"
                      href={`/contact?type=${encodeURIComponent(s.name)}`}
                    >
                      <span>Discuss {s.name.toLowerCase()}</span>
                      <span className="link-arrow">
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </span>
                    </a>
                  </div>
                </div>

                <div className="service-row-visual">
                  <ServiceVisual id={s.id} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4-Step Build Delivery Timeline */}
      <section className="service-process-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Transparent delivery</span>
          <h2 className="section-rule-heading">
            How we build <span className="highlight-word">together.</span>
          </h2>
          <p className="section-rule-lead">From brief to live release with full transparency.</p>
        </div>
        <div className="process-grid-4" data-stagger>
          <div className="process-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <span className="process-step-pill">01</span>
            <h3>Listen &amp; scope</h3>
            <p>We review your goals in plain words. We agree on features, timeline, and a fixed, fair quote with zero hidden fees.</p>
          </div>
          <div className="process-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <span className="process-step-pill">02</span>
            <h3>Clickable prototype</h3>
            <p>Within 7 business days, you test a working interactive prototype. You see exactly how the software works before full code is written.</p>
          </div>
          <div className="process-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <span className="process-step-pill">03</span>
            <h3>Production build</h3>
            <p>We write clean, tested TypeScript code. Regular progress reviews keep you in the loop as every feature comes to life.</p>
          </div>
          <div className="process-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <span className="process-step-pill">04</span>
            <h3>Launch &amp; handover</h3>
            <p>We deploy to your cloud, verify security, and transfer the repository and credentials with the agreed handover documentation.</p>
          </div>
        </div>
      </section>

      {/* Comparison: Hash Decode vs Traditional Agencies */}
      <section className="service-comparison-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">The studio difference</span>
          <h2 className="section-rule-heading">
            Why teams <span className="highlight-word">choose us.</span>
          </h2>
        </div>
        <div className="comparison-table-wrapper hd-card">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th className="highlight-col">Hash Decode Studio</th>
                <th>Traditional Agencies</th>
                <th>Freelance Marketplaces</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Communication</strong></td>
                <td className="highlight-col"><Check size={16} /> Direct with senior engineer</td>
                <td>Account managers &amp; middlemen</td>
                <td>Often unresponsive</td>
              </tr>
              <tr>
                <td><strong>Security Reviews</strong></td>
                <td className="highlight-col"><Check size={16} /> Built-in penetration testing</td>
                <td>Rarely included or extra cost</td>
                <td>Usually ignored</td>
              </tr>
              <tr>
                <td><strong>Code Ownership</strong></td>
                <td className="highlight-col"><Check size={16} /> Client-owned code &amp; keys</td>
                <td>Complex IP retention clauses</td>
                <td>Unclear license terms</td>
              </tr>
              <tr>
                <td><strong>Speed to Market</strong></td>
                <td className="highlight-col"><Check size={16} /> 2 to 6 weeks average release</td>
                <td>3 to 6 months of meetings</td>
                <td>Unpredictable delivery</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Closing Band with Shared Primary Button */}
      <section className="work-cta-card hd-card" data-reveal="up">
        <div className="card-glare" aria-hidden="true" />
        <div className="cta-content">
          <span className="section-rule-label">Get started</span>
          <h2 className="section-rule-heading" style={{ margin: '0.4rem 0 0.8rem' }}>
            Ready to build <span className="highlight-word">your next release?</span>
          </h2>
          <p className="section-rule-lead">
            Book a 15-minute introductory call or send your brief. We reply within 24 hours.
          </p>
        </div>
        <div className="cta-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a className="hd-btn-primary" href="/contact">
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
          <a className="hd-btn-secondary" href="/portfolio">
            <span>Explore our work</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
