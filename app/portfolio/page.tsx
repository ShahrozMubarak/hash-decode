import { meta } from '@/lib/meta';
import WideCard from '@/components/studio/WideCard';
import CostEstimatorMock from '@/components/studio/visuals/CostEstimatorMock';
import HeaderScannerMock from '@/components/studio/visuals/HeaderScannerMock';
import BottomCta from '@/components/studio/BottomCta';
import { studioProjects } from '@/lib/studio-projects';
import { Zap, ShieldCheck, CheckCircle2, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = meta(
  'Work & Projects | Hash Decode',
  'Explore custom software, web platforms, and cybersecurity reviews built by Hash Decode.',
  '/portfolio'
);

function getVisual(slug: string, image?: string) {
  if (slug === 'foolish-arc' && image) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        <img
          src={image}
          alt="Foolish Arc storefront preview"
          style={{
            maxWidth: '92%',
            maxHeight: '92%',
            objectFit: 'cover',
            borderRadius: '14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    );
  }
  if (slug === 'cost-estimator') {
    return <CostEstimatorMock />;
  }
  return <HeaderScannerMock />;
}

export default function Portfolio() {
  const clientProjects = studioProjects.filter((p) => p.slug === 'foolish-arc');
  const toolProjects = studioProjects.filter((p) => p.slug !== 'foolish-arc');

  return (
    <div className="wrap interior page-work-content">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Our work</p>
        <h1 className="inner-hero-h1">
          <span style={{ color: '#0B1F3A' }}>Our</span> Selected Work.
        </h1>
        <p className="section-rule-lead">
          Explore real systems, web platforms, and security audits built by Hash Decode.
          Every project is built for speed, clean architecture, and reliable long-term security.
        </p>
      </header>

      {/* 1. Client Projects Section */}
      <section
        style={{
          background: '#000000',
          borderRadius: 'var(--r-card, 36px)',
          padding: 'clamp(24px, 5vw, 48px)',
          marginBottom: 'var(--s-7)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--s-6)' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Client Platforms
          </span>
          <h2 style={{ color: '#ffffff', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, margin: '8px 0 0 0' }}>
            <span style={{ color: '#93c5fd' }}>Systems</span> in production.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {clientProjects.map((p) => (
            <WideCard
              key={p.slug}
              palette={p.palette}
              reverse={p.reverse}
              eyebrow={p.eyebrow}
              title={p.title}
              desc={p.desc}
              ctaText={p.ctaText}
              ctaHref={p.ctaHref}
              ctaVariant={p.ctaVariant}
              visual={getVisual(p.slug, p.image)}
            />
          ))}
        </div>
      </section>

      {/* 2. Interactive Tools & Calculator Section in Separate Cards */}
      <section
        style={{
          background: 'rgba(11, 31, 63, 0.04)',
          border: '1px solid rgba(11, 31, 63, 0.1)',
          borderRadius: 'var(--r-card, 36px)',
          padding: 'clamp(24px, 5vw, 48px)',
          marginBottom: 'var(--s-8)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--s-6)' }}>
          <span style={{ color: '#0B1F3A', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Interactive Utilities
          </span>
          <h2 style={{ color: '#000000', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, margin: '8px 0 0 0' }}>
            <span style={{ color: '#0B1F3A' }}>Calculators</span> & Security Tools.
          </h2>
          <p style={{ maxWidth: '640px', margin: '12px auto 0', color: 'rgba(0, 0, 0, 0.7)', fontSize: '16px' }}>
            Standalone public utilities engineered to help technical founders forecast infrastructure spend and verify cryptographic compliance.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {toolProjects.map((p) => (
            <WideCard
              key={p.slug}
              palette={p.palette}
              reverse={p.reverse}
              eyebrow={p.eyebrow}
              title={p.title}
              desc={p.desc}
              ctaText={p.ctaText}
              ctaHref={p.ctaHref}
              ctaVariant={p.ctaVariant}
              visual={getVisual(p.slug, p.image)}
            />
          ))}
        </div>
      </section>

      {/* Production Outcomes & Standards */}
      <section className="work-outcomes-band" data-reveal="up" style={{ marginBottom: 'var(--s-8)' }}>
        <div className="section-head-rule">
          <span className="section-rule-label">Engineering standards</span>
          <h2 className="section-rule-heading">
            <span style={{ color: '#0B1F3A' }}>What</span> every build includes.
          </h2>
        </div>
        <div className="outcomes-grid" data-stagger>
          <div className="outcome-card" data-reveal="up">
            <Zap size={24} aria-hidden="true" style={{ marginBottom: '12px', color: '#0B1F3A' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Sub-second speed</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              Every page and API route is optimized to load under 150ms. Fast software means higher customer conversion.
            </p>
          </div>
          <div className="outcome-card" data-reveal="up">
            <ShieldCheck size={24} aria-hidden="true" style={{ marginBottom: '12px', color: '#0B1F3A' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Penetration tested</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              We test our own code against real-world attack vectors before launch. No open doors or data leaks.
            </p>
          </div>
          <div className="outcome-card" data-reveal="up">
            <CheckCircle2 size={24} aria-hidden="true" style={{ marginBottom: '12px', color: '#0B1F3A' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Complete ownership</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              You own 100% of the repository, accounts, database credentials, and documentation. No vendor lock-in.
            </p>
          </div>
          <div className="outcome-card" data-reveal="up">
            <Layers size={24} aria-hidden="true" style={{ marginBottom: '12px', color: '#0B1F3A' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Clean architecture</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>
              Built with modern TypeScript, clean database models, and clear documentation your team can maintain easily.
            </p>
          </div>
        </div>
      </section>

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </div>
  );
}
