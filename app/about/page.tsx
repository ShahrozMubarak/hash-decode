import AboutTeamGrid from '@/components/studio/AboutTeamGrid';
import { studioCopy, listFounders } from '@/lib/studio-data';
import { meta } from '@/lib/meta';
import WideCard from '@/components/studio/WideCard';
import BrowserMock from '@/components/studio/visuals/BrowserMock';
import ScanReportMock from '@/components/studio/visuals/ScanReportMock';
import TerminalMock from '@/components/studio/visuals/TerminalMock';
import ScopeMapMock from '@/components/studio/visuals/ScopeMapMock';
import BottomCta from '@/components/studio/BottomCta';
import { CheckCircle, Terminal } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = meta(
  'About Hash Decode | Software Design & Security Studio',
  'Learn about Hash Decode, founded by Shahroz Dogar. Independent software engineering, clean code, and authorized security audits.',
  '/about'
);

const techStack = [
  'TypeScript', 'Next.js', 'React', 'Node.js', 'Python',
  'MongoDB Atlas', 'PostgreSQL', 'Cloudflare Workers', 'Three.js / WebGL',
  'Docker', 'Tailwind CSS', 'Zero Trust TLS'
];

export default async function About() {
  const [copy, founders] = await Promise.all([studioCopy(), listFounders()]);

  return (
    <div className="wrap interior page-about-content">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">About Hash Decode</p>
        <h1 className="inner-hero-h1">
          About Hash Decode.
        </h1>
        <p className="section-rule-lead">
          {copy.about ||
            'An independent software studio founded by Shahroz Dogar. We build custom web platforms, digital tools, and secure cloud systems for growing companies.'}
        </p>
      </header>

      {/* Leadership & Engineering Team */}
      <section className="about-founder-section" id="team" data-reveal="up" style={{ scrollMarginTop: '96px', marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Leadership</span>
          <h2 className="section-rule-heading">
            The team behind the studio.
          </h2>
          <p className="section-rule-lead">
            Independent architects, product designers, and penetration testers who take pride in crafting resilient software.
          </p>
        </div>

        <AboutTeamGrid founders={founders} />
      </section>

      {/* 4 Core Principles in Alternating WideCards */}
      <section className="about-principles-section" id="principles" data-reveal="up" style={{ scrollMarginTop: '96px', marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Core values</span>
          <h2 className="section-rule-heading">
            How we operate.
          </h2>
          <p className="section-rule-lead">Clear expectations, direct engineering, and zero technical debt.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', marginTop: 'var(--s-5)' }}>
          <WideCard
            palette="lilac"
            eyebrow="01 · Clarity"
            title="Clarity over complexity."
            desc="We speak plain English, not confusing technical jargon. We start with the actual user workflow so the software is intuitive and easy to use."
            visual={<BrowserMock />}
          />
          <WideCard
            palette="mint"
            reverse
            eyebrow="02 · Security"
            title="Security by design."
            desc="Security is not an afterthought. Every form, API, and database query is audited against vulnerabilities before it ever goes live."
            visual={<ScanReportMock />}
          />
          <WideCard
            palette="peach"
            eyebrow="03 · Ownership"
            title="Client ownership."
            desc="You own every line of code, every repository, and every cloud credential. We never lock you in, and we provide clean documentation so any engineer can continue our work."
            visual={<TerminalMock />}
          />
          <WideCard
            palette="cloud"
            reverse
            eyebrow="04 · Direct"
            title="Direct engineering."
            desc="You work directly with the senior engineers designing and building your product. No account managers, no lost translations, no wasted time."
            visual={<ScopeMapMock />}
          />
        </div>
      </section>

      {/* Tech Arsenal & Standards */}
      <section className="about-tech-section" id="stack" data-reveal="up" style={{ scrollMarginTop: '96px', marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Tools of the craft</span>
          <h2 className="section-rule-heading">
            Our technology stack.
          </h2>
          <p className="section-rule-lead">Modern, battle-tested technologies chosen for speed, reliability, and security.</p>
        </div>
        <div className="tech-badge-cloud" data-reveal="up">
          {techStack.map((tech) => (
            <span key={tech} className="tech-badge">
              <Terminal size={14} aria-hidden="true" />
              <span>{tech}</span>
            </span>
          ))}
        </div>
      </section>

      {/* The Client Guarantees */}
      <section className="about-guarantee-section" id="guarantees" data-reveal="up" style={{ scrollMarginTop: '96px', marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Peace of mind</span>
          <h2 className="section-rule-heading">
            The Hash Decode guarantee.
          </h2>
        </div>
        <div className="guarantee-grid" data-stagger>
          <div className="guarantee-item" data-reveal="up">
            <CheckCircle size={24} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '17px', display: 'block', marginBottom: '4px' }}>Mutual NDA protected</strong>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
                Your ideas, code, and customer data are fully protected before we write a single line of code.
              </p>
            </div>
          </div>
          <div className="guarantee-item" data-reveal="up">
            <CheckCircle size={24} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '17px', display: 'block', marginBottom: '4px' }}>Transparent fixed pricing</strong>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
                Clear, agreed milestones with zero surprise billing or hidden hourly charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </div>
  );
}
