import { entries } from '@/lib/cms';
import { meta } from '@/lib/meta';
import BottomCta from '@/components/studio/BottomCta';
import { ArrowUpRight, BookOpen, Clock, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = meta(
  'Engineering Notes | Hash Decode',
  'Practical notes on web development, software handovers, mobile performance and application security.',
  '/blog'
);

function calculateReadTime(text: string): string {
  const words = text ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(isoOrTimestamp?: string | number): string {
  if (!isoOrTimestamp) return 'Recent release';
  try {
    const d = new Date(isoOrTimestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recent release';
  }
}

export default async function Blog() {
  const posts = await entries('post');

  return (
    <div className="wrap interior page-blog-content">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio journal</p>
        <h1 className="inner-hero-h1">
          Engineering notes.
        </h1>
        <p className="section-rule-lead">
          Practical notes on web development, software handovers, system performance, and application security.
        </p>
      </header>

      {/* Blog Cards Grid */}
      <section className="blog-posts-section" data-reveal="up" style={{ marginBottom: 'var(--s-8)' }}>
        {posts.length > 0 ? (
          <div className="blog-cards-grid" data-stagger>
            {posts.map((p, i) => {
              const readTime = calculateReadTime(p.body);
              const dateStr = formatDate(p.updated);

              return (
                <article
                  key={p.id}
                  className="blog-card"
                  data-reveal="up"
                  data-reveal-delay={i * 80}
                >
                  <a href={`/blog/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Thumbnail */}
                    <div className="blog-card-thumbnail">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          width={480}
                          height={260}
                          className="blog-thumbnail-img"
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(0,0,0,0.04)' }} aria-hidden="true">
                          <BookOpen size={36} />
                        </div>
                      )}
                    </div>

                    <div className="blog-card-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.06)' }}>
                          {p.label || 'Engineering'}
                        </span>
                        <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} aria-hidden="true" />
                          <span>{readTime}</span>
                        </span>
                      </div>

                      <h3 style={{ fontSize: '19px', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.3 }}>{p.title}</h3>

                      <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0', flexGrow: 1 }}>
                        {p.body.replace(/\s+/g, ' ').slice(0, 130)}...
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} aria-hidden="true" />
                          <span>{dateStr}</span>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>Read note</span>
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ background: 'var(--off-white)', borderRadius: '28px', padding: 'var(--s-7) var(--s-5)', textAlign: 'center' }} data-reveal="up">
            <BookOpen size={40} style={{ margin: '0 auto 16px' }} aria-hidden="true" />
            <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>No engineering notes published yet</h3>
            <p style={{ fontSize: '16px', maxWidth: '480px', margin: '0 auto 24px' }}>
              We are documenting production systems, architecture teardowns, and security insights.
              Check back soon or submit a project brief to start a conversation.
            </p>
            <div>
              <a className="hd-btn-primary" href="/contact">
                <span className="btn-label">Start a project</span>
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </div>
  );
}
