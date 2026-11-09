import { entries } from '@/lib/cms';
import { meta } from '@/lib/meta';
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
      {/* Inner-page Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio journal</p>
        <h1 className="inner-hero-h1">
          Engineering <span style={{ color: '#1E40AF' }}>notes.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Practical notes on web development, software handovers, system performance, and application security.
        </p>
      </header>

      {/* 3-Column Card Grid (2 on tablet, 1 on phones) */}
      <section className="blog-posts-section" data-reveal="up">
        {posts.length > 0 ? (
          <div className="blog-cards-grid" data-stagger>
            {posts.map((p, i) => {
              const readTime = calculateReadTime(p.body);
              const dateStr = formatDate(p.updated);

              return (
                <article
                  key={p.id}
                  className="blog-card hd-card"
                  data-reveal="up"
                  data-reveal-delay={i * 80}
                >
                  <div className="card-glare" aria-hidden="true" />
                  <a href={`/blog/${p.id}`} className="blog-card-link-wrapper">
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
                        <div className="blog-thumbnail-gradient" aria-hidden="true">
                          <BookOpen size={36} className="thumbnail-icon" />
                        </div>
                      )}
                    </div>

                    <div className="blog-card-content">
                      <div className="blog-card-meta">
                        <span className="blog-tag-badge">{p.label || 'Engineering'}</span>
                        <span className="blog-meta-item">
                          <Clock size={13} aria-hidden="true" />
                          <span>{readTime}</span>
                        </span>
                      </div>

                      <h3 className="blog-card-title">{p.title}</h3>

                      <p className="blog-card-excerpt">
                        {p.body.replace(/\s+/g, ' ').slice(0, 130)}...
                      </p>

                      <div className="blog-card-footer">
                        <span className="blog-card-date">
                          <Calendar size={13} aria-hidden="true" />
                          <span>{dateStr}</span>
                        </span>
                        <span className="blog-read-link">
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
          <div className="blog-empty-state hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <BookOpen size={40} className="empty-state-icon" aria-hidden="true" />
            <h3>No engineering notes published yet</h3>
            <p>
              We are documenting production systems, architecture teardowns, and security insights.
              Check back soon or submit a project brief to start a conversation.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <a className="hd-btn-primary" href="/contact">
                <span className="btn-label">Start a project</span>
                <span className="btn-arrow-circle" aria-hidden="true">
                  <ArrowUpRight size={15} />
                </span>
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
