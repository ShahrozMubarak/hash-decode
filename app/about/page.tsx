import AboutTeamGrid from '@/components/studio/AboutTeamGrid';
import { studioCopy, listFounders } from '@/lib/studio-data';
import { meta } from '@/lib/meta';
import { ShieldCheck, HeartHandshake, Zap, FileCode, CheckCircle, Terminal, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = meta(
  'About Hash Decode | Software Design & Security Studio',
  'Learn about Hash Decode, founded by Shahroz Dogar. Independent software engineering, clean code, and authorized security audits.',
  '/about'
);

const principles = [
  {
    title: 'Clarity over complexity',
    desc: 'We speak plain English, not confusing technical jargon. We start with the actual user workflow so the software is intuitive and easy to use.',
    icon: Zap,
  },
  {
    title: 'Security by design',
    desc: 'Security is not an afterthought. Every form, API, and database query is audited against vulnerabilities before it ever goes live.',
    icon: ShieldCheck,
  },
  {
    title: 'Client ownership',
    desc: 'You own every line of code, every repository, and every cloud credential. We never lock you in, and we provide clean documentation so any engineer can continue our work.',
    icon: HeartHandshake,
  },
  {
    title: 'Direct engineering',
    desc: 'You work directly with the senior engineers designing and building your product. No account managers, no lost translations, no wasted time.',
    icon: FileCode,
  },
];

const techStack = [
  'TypeScript', 'Next.js', 'React', 'Node.js', 'Python',
  'MongoDB Atlas', 'PostgreSQL', 'Cloudflare Workers', 'Three.js / WebGL',
  'Docker', 'Tailwind CSS', 'Zero Trust TLS'
];

export default async function About() {
  const [copy, founders] = await Promise.all([studioCopy(), listFounders()]);

  return (
    <div className="wrap interior page-about-content">
      {/* Inner-page Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">About Hash Decode</p>
        <h1 className="inner-hero-h1">
          About <span style={{ color: '#1E40AF' }}>Hash Decode.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          {copy.about ||
            'An independent software studio founded by Shahroz Dogar. We build custom web platforms, digital tools, and secure cloud systems for growing companies.'}
        </p>
      </header>

      {/* Leadership & Engineering Team */}
      <section className="about-founder-section" id="team" data-reveal="up" style={{ scrollMarginTop: '96px' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Leadership</span>
          <h2 className="section-rule-heading">
            The team behind <span className="highlight-word">the studio.</span>
          </h2>
          <p className="section-rule-lead">
            Independent architects, product designers, and penetration testers who take pride in crafting resilient software.
          </p>
        </div>

        <AboutTeamGrid founders={founders} />
      </section>

      {/* 4 Core Principles */}
      <section className="about-principles-section" id="principles" data-reveal="up" style={{ scrollMarginTop: '96px' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Core values</span>
          <h2 className="section-rule-heading">
            How we <span className="highlight-word">operate.</span>
          </h2>
          <p className="section-rule-lead">Clear expectations, direct engineering, and zero technical debt.</p>
        </div>
        <div className="principles-grid-4" data-stagger>
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className="principle-card hd-card" data-reveal="up">
                <div className="card-glare" aria-hidden="true" />
                <div className="principle-icon-tile" aria-hidden="true">
                  <Icon size={24} />
                </div>
                <h3 className="principle-title">{p.title}</h3>
                <p className="principle-desc">{p.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Tech Arsenal & Standards */}
      <section className="about-tech-section" id="stack" data-reveal="up" style={{ scrollMarginTop: '96px' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Tools of the craft</span>
          <h2 className="section-rule-heading">
            Our technology <span className="highlight-word">stack.</span>
          </h2>
          <p className="section-rule-lead">Modern, battle-tested technologies chosen for speed, reliability, and security.</p>
        </div>
        <div className="tech-badge-cloud hd-card" data-reveal="up">
          <div className="card-glare" aria-hidden="true" />
          {techStack.map((tech) => (
            <span key={tech} className="tech-badge">
              <Terminal size={14} className="tech-badge-icon" aria-hidden="true" />
              <span>{tech}</span>
            </span>
          ))}
        </div>
      </section>

      {/* The Client Guarantees */}
      <section className="about-guarantee-section" id="guarantees" data-reveal="up" style={{ scrollMarginTop: '96px' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Peace of mind</span>
          <h2 className="section-rule-heading">
            The Hash Decode <span className="highlight-word">guarantee.</span>
          </h2>
        </div>
        <div className="guarantee-grid" data-stagger>
          <div className="guarantee-item hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="guarantee-icon-wrap" aria-hidden="true">
              <CheckCircle size={22} />
            </div>
            <div>
              <strong>Mutual NDA protected</strong>
              <p>Your ideas, code, and customer data are fully protected before we write a single line of code.</p>
            </div>
          </div>
          <div className="guarantee-item hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="guarantee-icon-wrap" aria-hidden="true">
              <CheckCircle size={22} />
            </div>
            <div>
              <strong>Transparent fixed pricing</strong>
              <p>Clear, agreed milestones with zero surprise billing or hidden hourly charges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="work-cta-card hd-card" data-reveal="up">
        <div className="card-glare" aria-hidden="true" />
        <div className="cta-content">
          <span className="section-rule-label">Start today</span>
          <h2 className="section-rule-heading" style={{ margin: '0.4rem 0 0.8rem' }}>
            Work directly with <span className="highlight-word">senior engineers.</span>
          </h2>
          <p className="section-rule-lead">
            Tell us about your next project or security review. We reply within 24 hours.
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
