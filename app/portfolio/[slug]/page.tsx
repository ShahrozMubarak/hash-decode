import { notFound } from 'next/navigation';
import { listProjects } from '@/lib/studio-data';
import { Artwork } from '@/components/studio/Work';
import { meta } from '@/lib/meta';
import BottomCta from '@/components/studio/BottomCta';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = (await listProjects()).find((x) => x.slug === slug);
  return p
    ? meta(p.title, p.summary, '/portfolio/' + p.slug)
    : { title: 'Project not found', robots: { index: false } };
}

export default async function Case({ params }: Props) {
  const { slug } = await params;
  const all = await listProjects();
  const p = all.find((x) => x.slug === slug);
  if (!p) notFound();

  const demo = ['orbit-console', 'relay-board'].includes(p.slug) ? '/lab/' + p.slug : '';
  const next = all.length > 1 ? all[(all.indexOf(p) + 1) % all.length] : null;

  return (
    <article className="wrap interior page-case-content">
      {/* Back to index link */}
      <div className="case-top-nav" data-reveal="fade">
        <a className="case-back-link" href="/portfolio">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to portfolio</span>
        </a>
      </div>

      {/* Centered Header & Meta */}
      <header className="page-intro" data-reveal="fade">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(0,0,0,0.06)', color: '#000000' }}>
            {p.category || 'Platform'}
          </span>
          {p.tech && (
            <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(0,0,0,0.06)', color: '#000000' }}>
              {p.tech}
            </span>
          )}
        </div>

        <h1 className="inner-hero-h1">
          {p.title}.
        </h1>

        <p className="section-rule-lead">
          {p.summary}
        </p>

        {(p.url || demo) && (
          <div style={{ marginTop: 'var(--s-4)' }}>
            <a
              className="hd-btn-primary"
              href={p.url || demo}
              target={p.url ? '_blank' : undefined}
              rel={p.url ? 'noopener noreferrer' : undefined}
            >
              <span className="btn-label">{p.url ? 'Visit live website' : 'Open concept'}</span>
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
        )}
      </header>

      {/* Large Preview */}
      <div className="case-large-preview" data-reveal="up" style={{ padding: 'var(--s-4)', margin: 'var(--s-6) 0' }}>
        {p.url ? (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit ${p.title} live website`}
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            <Artwork project={p} />
          </a>
        ) : (
          <Artwork project={p} />
        )}
      </div>

      {/* Case Details Cards */}
      <div className="case-details-grid">
        {[
          [p.challenge, 'The brief', 'Project requirements and technical goals.'],
          [p.solution, 'The build', 'Architecture, interfaces and implementation notes.'],
          [p.result, 'The result', 'Performance, latency and concrete outcomes.'],
        ]
          .filter(([v]) => Boolean(v))
          .map(([v, t, lead]) => (
            <section key={t} className="case-detail-card" data-reveal="up">
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                {t}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0' }}>{t}</h2>
              <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 12px 0' }}>{lead}</p>
              <p style={{ fontSize: '15px', lineHeight: 1.55, margin: 0 }}>{v}</p>
            </section>
          ))}
      </div>

      {/* Next Project Link */}
      {next && (
        <div style={{ marginTop: 'var(--s-6)' }} data-reveal="up">
          <a className="case-next-card" href={'/portfolio/' + next.slug}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                Next release
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0' }}>{next.title}</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>{next.summary}</p>
            </div>
            <ArrowUpRight size={20} />
          </a>
        </div>
      )}

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </article>
  );
}
