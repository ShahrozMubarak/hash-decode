import { listProjects } from '@/lib/studio-data';
import { WorkCard } from '@/components/studio/Work';
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
      <header className="page-intro">
        <p className="kicker"><span className="key-line" />Our Work</p>
        <h1>Software that works.<br /><span className="text-coral">Built right.</span></h1>
        <p className="lead-text">
          Explore real systems, web platforms, and security audits built by Hash Decode.
          Every project is built for speed, clean architecture, and reliable long-term security.
        </p>
      </header>

      {/* Primary Project Showcase Grid */}
      <section className="work-showcase-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />01 &nbsp;/&nbsp; Selected Releases</p>
            <h2>Featured Projects</h2>
          </div>
          <span className="count-pill">{projects.length} Published Case Studies</span>
        </div>
        <div className="work-grid">
          {projects.map((p, i) => (
            <WorkCard key={p.slug} project={p} index={i} />
          ))}
        </div>
        {!projects.length && <p>New work will appear here as it is published.</p>}
      </section>

      {/* Production Outcomes & Standards */}
      <section className="work-outcomes-band">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />02 &nbsp;/&nbsp; Engineering Standards</p>
            <h2>What every build includes</h2>
          </div>
        </div>
        <div className="outcomes-grid">
          <div className="outcome-card">
            <Zap className="icon-azure" size={28} />
            <h3>Sub-Second Speed</h3>
            <p>Every page and API route is optimized to load under 150ms. Fast software means higher customer conversion.</p>
          </div>
          <div className="outcome-card">
            <ShieldCheck className="icon-coral" size={28} />
            <h3>Penetration Tested</h3>
            <p>We test our own code against real-world attack vectors before launch. No open doors or data leaks.</p>
          </div>
          <div className="outcome-card">
            <CheckCircle2 className="icon-azure" size={28} />
            <h3>Complete Ownership</h3>
            <p>You own 100% of the repository, accounts, database credentials, and documentation. No vendor lock-in.</p>
          </div>
          <div className="outcome-card">
            <Layers className="icon-coral" size={28} />
            <h3>Clean Architecture</h3>
            <p>Built with modern TypeScript, clean database models, and clear documentation your team can maintain easily.</p>
          </div>
        </div>
      </section>

      {/* Interactive Project Inquiry CTA Banner */}
      <section className="work-cta-card">
        <div className="cta-content">
          <p className="kicker"><span className="key-line" />Ready to build?</p>
          <h2>Have a project in mind?</h2>
          <p>Tell us what you want to build. We reply within 24 hours with honest advice and a clear estimate.</p>
        </div>
        <div className="cta-actions">
          <a className="cta" href="/contact">
            Start a project <ArrowUpRight size={18} />
          </a>
          <a className="outline" href="/services">
            See all services
          </a>
        </div>
      </section>
    </div>
  );
}
