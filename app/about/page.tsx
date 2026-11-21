import AboutTeamGrid from '@/components/studio/AboutTeamGrid';
import { studioCopy, listFounders } from '@/lib/studio-data';
import { meta } from '@/lib/meta';
import WideCard from '@/components/studio/WideCard';
import PhoneMockup from '@/components/studio/visuals/PhoneMockup';
import LaptopMockup from '@/components/studio/visuals/LaptopMockup';
import BottomCta from '@/components/studio/BottomCta';
import { Terminal, Shield, KeyRound, Award, Code2, Cpu, FileCheck } from 'lucide-react';

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

const studioProtections = [
  {
    icon: Shield,
    title: 'Mutual NDA Protected',
    desc: 'Your proprietary concepts, business logic, and customer data are legally safeguarded before we review architecture or draft a single line of code.',
  },
  {
    icon: KeyRound,
    title: '100% Client IP Ownership',
    desc: 'You receive full ownership of the git repositories, production artifacts, container registries, and cloud infrastructure upon project handover.',
  },
  {
    icon: Award,
    title: 'Fixed Milestones & Transparent Billing',
    desc: 'Every phase is tied to explicit delivery criteria and scheduled milestone releases with zero hidden fees or unplanned hourly overages.',
  },
  {
    icon: Code2,
    title: 'Zero Vendor Lock-in',
    desc: 'Every system is built on standardized, open-source runtimes and vendor-neutral cloud primitives that your in-house team can run anywhere.',
  },
  {
    icon: Cpu,
    title: '30-Day Post-Launch Warranty',
    desc: 'Every production release includes a 30-day dedicated warranty window with priority hotfixes and bug remediation at zero additional cost.',
  },
  {
    icon: FileCheck,
    title: 'Complimentary Security Retesting',
    desc: 'Audit engagements include verified proof-of-concept exploits, actionable remediation steps, and an authorized retest report upon fix implementation.',
  },
];

export default async function About() {
  const [copy, founders] = await Promise.all([studioCopy(), listFounders()]);

  return (
    <div className="wrap interior page-about-content">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">About Hash Decode</p>
        <h1 className="inner-hero-h1">
          About <span className="hd-accent-navy">Hash Decode</span>.
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
            The <span className="hd-accent-navy">team</span> behind the <span className="hd-accent-navy">studio</span>.
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
            How we <span className="hd-accent-navy">operate</span>.
          </h2>
          <p className="section-rule-lead">Clear expectations, direct engineering, and zero technical debt.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', marginTop: 'var(--s-5)' }}>
          <WideCard
            palette="lilac"
            eyebrow="01 · Clarity"
            title={<><span className="hd-accent-navy">Clarity</span> over complexity.</>}
            desc="We speak plain English, not confusing technical jargon. We start with the actual user workflow so the software is intuitive and easy to use."
            visual={<PhoneMockup variant="web" />}
          />
          <WideCard
            palette="mint"
            reverse
            eyebrow="02 · Security"
            title={<><span className="hd-accent-navy">Security</span> by design.</>}
            desc="Security is not an afterthought. Every form, API, and database query is audited against vulnerabilities before it ever goes live."
            visual={<PhoneMockup variant="security" />}
          />
          <WideCard
            palette="peach"
            eyebrow="03 · Ownership"
            title={<>Client <span className="hd-accent-navy">ownership</span>.</>}
            desc="You own every line of code, every repository, and every cloud credential. We never lock you in, and we provide clean documentation so any engineer can continue our work."
            visual={<LaptopMockup variant="cloud" />}
          />
          <WideCard
            palette="cloud"
            reverse
            eyebrow="04 · Direct"
            title={<><span className="hd-accent-navy">Direct</span> engineering.</>}
            desc="You work directly with the senior engineers designing and building your product. No account managers, no lost translations, no wasted time."
            visual={<PhoneMockup variant="tools" />}
          />
        </div>
      </section>

      {/* Tech Arsenal & Standards */}
      <section className="about-tech-section" id="stack" data-reveal="up" style={{ scrollMarginTop: '96px', marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Tools of the craft</span>
          <h2 className="section-rule-heading">
            Our <span className="hd-accent-navy">technology</span> stack.
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

      {/* The Studio Protections Info - Heading removed, less thick font, richer info */}
      <section className="about-guarantee-section" id="guarantees" data-reveal="up" style={{ scrollMarginTop: '96px', marginBottom: 'var(--s-8)' }}>
        <div
          className="guarantee-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: 'var(--s-4)',
          }}
        >
          {studioProtections.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="guarantee-card"
                style={{
                  background: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '24px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={20} color="#0B1F3A" aria-hidden="true" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#0B1F3A',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {p.title}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: 1.55,
                    color: '#333333',
                  }}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </div>
  );
}
