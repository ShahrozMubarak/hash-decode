import { listProjects } from '@/lib/studio-data';
import WorkShowcase from '@/components/studio/WorkShowcase';
import { meta } from '@/lib/meta';
import { ArrowUpRight, CheckCircle2, ShieldCheck, Zap, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = meta(
  'Work & Projects | Hash Decode',
  'Explore custom software, web platforms, and cybersecurity reviews built by Hash Decode.',
  '/portfolio'
);

export default async function Portfolio() {
  const projects = await listProjects();

  return (
    <div className="wrap interior page-work-content">
      {/* Inner-page Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Our work</p>
        <h1 className="inner-hero-h1">
          Software that works.<br />
          <span style={{ color: '#1E40AF' }}>Built right.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Explore real systems, web platforms, and security audits built by Hash Decode.
          Every project is built for speed, clean architecture, and reliable long-term security.
        </p>
      </header>

      {/* Primary Project Showcase Grid with Filter Chips */}
      <section className="work-showcase-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Selected releases</span>
          <h2 className="section-rule-heading">
            Featured <span className="highlight-word">projects.</span>
          </h2>
        </div>

        <WorkShowcase projects={projects} />
      </section>

      {/* Production Outcomes & Standards */}
      <section className="work-outcomes-band" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Engineering standards</span>
          <h2 className="section-rule-heading">
            What every build <span className="highlight-word">includes.</span>
          </h2>
        </div>
        <div className="outcomes-grid" data-stagger>
          <div className="outcome-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="outcome-icon-tile" aria-hidden="true">
              <Zap size={24} />
            </div>
            <h3>Sub-second speed</h3>
            <p>Every page and API route is optimized to load under 150ms. Fast software means higher customer conversion.</p>
          </div>
          <div className="outcome-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="outcome-icon-tile" aria-hidden="true">
              <ShieldCheck size={24} />
            </div>
            <h3>Penetration tested</h3>
            <p>We test our own code against real-world attack vectors before launch. No open doors or data leaks.</p>
          </div>
          <div className="outcome-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="outcome-icon-tile" aria-hidden="true">
              <CheckCircle2 size={24} />
            </div>
            <h3>Complete ownership</h3>
            <p>You own 100% of the repository, accounts, database credentials, and documentation. No vendor lock-in.</p>
          </div>
          <div className="outcome-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="outcome-icon-tile" aria-hidden="true">
              <Layers size={24} />
            </div>
            <h3>Clean architecture</h3>
            <p>Built with modern TypeScript, clean database models, and clear documentation your team can maintain easily.</p>
          </div>
        </div>
      </section>

      {/* Project Inquiry CTA Banner */}
      <section className="work-cta-card hd-card" data-reveal="up">
        <div className="card-glare" aria-hidden="true" />
        <div className="cta-content">
          <span className="section-rule-label">Ready to build?</span>
          <h2 className="section-rule-heading" style={{ margin: '0.4rem 0 0.8rem' }}>
            Have a project <span className="highlight-word">in mind?</span>
          </h2>
          <p className="section-rule-lead">
            Tell us what you want to build. We reply within 24 hours with honest advice and a clear estimate.
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
          <a className="hd-btn-secondary" href="/services">
            <span>See all services</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
