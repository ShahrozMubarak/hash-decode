import { services } from '@/lib/studio-data';
import { meta } from '@/lib/meta';
import { ArrowUpRight, AppWindow, Shield, Cpu, RefreshCw, Check, Clock, Code2 } from 'lucide-react';

export const metadata = meta(
  'Services & Engineering Solutions | Hash Decode',
  'Custom software engineering, web application development, and authorised security audits.',
  '/services'
);

const types: Record<string, string> = {
  products: 'Digital product',
  platforms: 'Web platform',
  tools: 'Business system',
  security: 'Security audit',
};

const serviceIcons: Record<string, typeof AppWindow> = {
  products: AppWindow,
  platforms: Cpu,
  tools: Code2,
  security: Shield,
};

export default function Services() {
  return (
    <div className="wrap interior page-services-content">
      <header className="page-intro">
        <p className="kicker"><span className="key-line" />Services</p>
        <h1>What we build.<br />How we help.</h1>
        <p className="lead-text">
          Software designed for the people who use it, and practical security reviews for the teams who maintain it.
          No jargon, no bloated teams—just direct engineering that solves real business problems.
        </p>
      </header>

      {/* 4 Core Services with tags and actions */}
      <section className="service-catalog-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />01 &nbsp;/&nbsp; Core Capabilities</p>
            <h2>What We Specialize In</h2>
          </div>
        </div>
        <div className="service-index">
          {services.map((s) => {
            const Icon = serviceIcons[s.id] || AppWindow;
            return (
              <section key={s.id} id={s.id} className="service-detail-card">
                <div className="service-card-header">
                  <small className="service-num">{s.n}</small>
                  <Icon className="service-icon" size={24} />
                </div>
                <div className="service-body">
                  <h2>{s.name}</h2>
                  <p>{s.detail}</p>
                  <div className="tags">
                    {s.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <a className="cta" href={'/contact?type=' + encodeURIComponent(types[s.id] || s.name)}>
                  Discuss a project <ArrowUpRight size={16} />
                </a>
              </section>
            );
          })}
        </div>
      </section>

      {/* 4-Step Build Delivery Timeline */}
      <section className="service-process-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />02 &nbsp;/&nbsp; Transparent Delivery</p>
            <h2>How We Build Together</h2>
          </div>
          <span className="count-pill">From brief to live release</span>
        </div>
        <div className="process-grid-4">
          <div className="process-card">
            <span className="step-tag">Step 01</span>
            <h3>Listen &amp; Scope</h3>
            <p>We review your goals in plain words. We agree on features, timeline, and a fixed, fair quote with zero hidden fees.</p>
          </div>
          <div className="process-card">
            <span className="step-tag">Step 02</span>
            <h3>Clickable Prototype</h3>
            <p>Within 7 business days, you test a working interactive prototype. You see exactly how the software works before full code is written.</p>
          </div>
          <div className="process-card">
            <span className="step-tag">Step 03</span>
            <h3>Production Build</h3>
            <p>We write clean, tested TypeScript code. Weekly video updates keep you in the loop as every feature comes to life.</p>
          </div>
          <div className="process-card">
            <span className="step-tag">Step 04</span>
            <h3>Launch &amp; Handover</h3>
            <p>We deploy to your cloud, verify security, and transfer 100% of the repository and credentials. Plus 30 days of free support.</p>
          </div>
        </div>
      </section>

      {/* Comparison: Hash Decode vs Traditional Agencies */}
      <section className="service-comparison-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />03 &nbsp;/&nbsp; The Hash Decode Difference</p>
            <h2>Why teams work with us</h2>
          </div>
        </div>
        <div className="comparison-table-wrapper">
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
                <td className="highlight-col"><Check size={16} /> 100% client-owned code &amp; keys</td>
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

      {/* Ready to build CTA */}
      <section className="work-cta-card">
        <div className="cta-content">
          <p className="kicker"><span className="key-line" />Get started</p>
          <h2>Ready to build your next release?</h2>
          <p>Book a 15-minute introductory call or send your brief. We reply within 24 hours.</p>
        </div>
        <div className="cta-actions">
          <a className="cta" href="/contact">
            Start a project <ArrowUpRight size={18} />
          </a>
          <a className="outline" href="/portfolio">
            Explore our work
          </a>
        </div>
      </section>
    </div>
  );
}
