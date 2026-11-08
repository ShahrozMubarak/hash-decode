import FoundersShowcase from '@/components/studio/FoundersShowcase';
import { studioCopy, listFounders } from '@/lib/studio-data';
import { meta } from '@/lib/meta';
import { ArrowUpRight, ShieldCheck, HeartHandshake, Zap, FileCode, CheckCircle, Terminal } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = meta(
  'About Hash Decode | Software Design & Security Studio',
  'Learn about Hash Decode, founded by Shahroz Dogar. Independent software engineering, clean code, and authorized security audits.',
  '/about'
);

const principles = [
  {
    title: 'Clarity Over Complexity',
    desc: 'We speak plain English, not confusing technical jargon. We start with the actual user workflow so the software is intuitive and easy to use.',
    icon: Zap,
  },
  {
    title: 'Security by Design',
    desc: 'Security is not an afterthought. Every form, API, and database query is audited against vulnerabilities before it ever goes live.',
    icon: ShieldCheck,
  },
  {
    title: '100% Client Ownership',
    desc: 'You own every line of code, every repository, and every cloud credential. We never lock you in, and we provide clean documentation so any engineer can continue our work.',
    icon: HeartHandshake,
  },
  {
    title: 'Direct Engineering',
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
      <header className="page-intro">
        <p className="kicker"><span className="key-line" /> ( HASH_DECODE ) [ STUDIO ]</p>
        <h1><span className="title-bold">INSIDE</span> <em className="title-serif">Hash Decode.</em><br /><span className="text-coral" style={{ color: 'var(--coral)' }}><span className="title-bold">CRAFTED</span> <em className="title-serif">with intent.</em></span></h1>
        <p className="lead-text">
          {copy.about || 'An independent software studio founded by Shahroz Dogar. We build custom web platforms, digital tools, and secure cloud systems for growing companies.'}
        </p>
      </header>

      {/* 4 Founders Interactive Showcase with Scroll Pop-Up & Side Typing Info */}
      <section className="about-founder-section">
        <FoundersShowcase founders={founders} />
      </section>

      {/* 4 Core Principles in Simple Words */}
      <section className="about-principles-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i /> ( VALUES ) [ PRINCIPLES ]</p>
            <h2><span className="title-bold">HOW WE</span> <em className="title-serif">operate.</em></h2>
          </div>
        </div>
        <div className="principles-grid-4">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className="principle-card">
                <div className="principle-card-head">
                  <Icon className="icon-coral" size={24} />
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Tech Arsenal & Standards */}
      <section className="about-tech-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i /> ( TOOLS ) [ ARSENAL ]</p>
            <h2><span className="title-bold">OUR TECHNOLOGY</span> <em className="title-serif">stack.</em></h2>
          </div>
          <span className="count-pill">Modern &amp; battle-tested</span>
        </div>
        <div className="tech-badge-cloud">
          {techStack.map((tech) => (
            <span key={tech} className="tech-badge">
              <Terminal size={14} />
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* The Client Guarantees */}
      <section className="about-guarantee-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i /> ( ASSURANCE ) [ GUARANTEE ]</p>
            <h2><span className="title-bold">THE HASH DECODE</span> <em className="title-serif">guarantee.</em></h2>
          </div>
        </div>
        <div className="guarantee-grid">
          <div className="guarantee-item">
            <CheckCircle className="icon-coral" size={22} />
            <div>
              <strong>Mutual NDA Protected</strong>
              <p>Your ideas, code, and customer data are fully protected before we write a single line of code.</p>
            </div>
          </div>
          <div className="guarantee-item">
            <CheckCircle className="icon-coral" size={22} />
            <div>
              <strong>Transparent Fixed Pricing</strong>
              <p>Clear, agreed milestones with zero surprise billing or hidden hourly charges.</p>
            </div>
          </div>
          <div className="guarantee-item">
            <CheckCircle className="icon-coral" size={22} />
            <div>
              <strong>30-Day Post-Launch Support</strong>
              <p>We monitor your production application and fix any warranty bugs free of charge.</p>
            </div>
          </div>
          <div className="guarantee-item">
            <CheckCircle className="icon-coral" size={22} />
            <div>
              <strong>Full Codebase Transfer</strong>
              <p>Everything is committed to your own private GitHub or cloud account from day one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="work-cta-card">
        <div className="cta-content">
          <p className="kicker"><span className="key-line" />Get in touch</p>
          <h2>Let&apos;s build something <span style={{ color: 'var(--coral)' }}>remarkable.</span></h2>
          <p>Whether you need an MVP in weeks or a comprehensive security audit, we are ready.</p>
        </div>
        <div className="cta-actions">
          <a className="cta" href="/contact">
            Start a project <ArrowUpRight size={18} />
          </a>
          <a className="outline" href="/portfolio">
            See our portfolio
          </a>
        </div>
      </section>
    </div>
  );
}
