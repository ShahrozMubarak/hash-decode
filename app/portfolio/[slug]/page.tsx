import { notFound } from 'next/navigation';
import { listProjects } from '@/lib/studio-data';
import { Artwork } from '@/components/studio/Work';
import { meta } from '@/lib/meta';
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
        <a className="hd-text-link case-back-link" href="/portfolio">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to index</span>
        </a>
      </div>

      {/* Header & Meta Row */}
      <header className="page-intro" data-reveal="fade">
        <div className="case-meta-row">
          <span className="concept-status-badge">Concept</span>
          <span className="case-meta-tag">{p.category}</span>
          {p.tech && <span className="case-meta-tag">{p.tech}</span>}
        </div>

        <h1 className="inner-hero-h1">
          {p.title}
          <span style={{ color: '#1E40AF' }}>.</span>
        </h1>

        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          {p.summary}
        </p>

        {(p.url || demo) && (
          <div className="case-hero-action" style={{ marginTop: '1.5rem' }}>
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
      <div className="case-large-preview hd-card" data-reveal="up">
        <div className="card-glare" aria-hidden="true" />
        {p.url ? (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit ${p.title} live website`}
            className="case-preview-anchor"
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
            <section key={t} className="case-detail-card hd-card" data-reveal="up">
              <div className="card-glare" aria-hidden="true" />
              <span className="section-rule-label">{t}</span>
              <h2 className="case-detail-heading">{t}</h2>
              <p className="case-detail-lead">{lead}</p>
              <p className="case-detail-text">{v}</p>
            </section>
          ))}
      </div>

      {/* Next Project Link */}
      {next && (
        <div className="case-next-container" data-reveal="up">
          <a className="case-next-card hd-card" href={'/portfolio/' + next.slug}>
            <div className="card-glare" aria-hidden="true" />
            <div>
              <span className="section-rule-label">Next release</span>
              <h3 className="case-next-title">{next.title}</h3>
              <p className="case-next-summary">{next.summary}</p>
            </div>
            <span className="card-arrow-circle" aria-hidden="true">
              <ArrowUpRight size={20} />
            </span>
          </a>
        </div>
      )}
    </article>
  );
}
