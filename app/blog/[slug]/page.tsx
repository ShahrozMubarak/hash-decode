import { entries } from '@/lib/cms';
import { meta, origin } from '@/lib/meta';
import { notFound } from 'next/navigation';
import ReadingProgressBar from '@/components/studio/ReadingProgressBar';
import { ArrowLeft, ArrowUpRight, Calendar, Clock, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const posts = await entries('post');
  const p = posts.find((x) => x.id === slug);
  if (!p) {
    return { title: 'Note not found | Hash Decode', robots: { index: false } };
  }
  return meta(
    `${p.title} | Hash Decode Engineering Notes`,
    p.body.replace(/\s+/g, ' ').slice(0, 156),
    `/blog/${p.id}`
  );
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const allPosts = await entries('post');
  const p = allPosts.find((x) => x.id === slug);

  if (!p) notFound();

  const readTime = calculateReadTime(p.body);
  const dateStr = formatDate(p.updated);

  // Find related posts (same tag first, then others, max 2)
  const otherPosts = allPosts.filter((x) => x.id !== p.id);
  const sameTagPosts = otherPosts.filter((x) => x.label && x.label === p.label);
  const fallbackPosts = otherPosts.filter((x) => !sameTagPosts.includes(x));
  const relatedPosts = [...sameTagPosts, ...fallbackPosts].slice(0, 2);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    author: {
      '@type': 'Organization',
      name: 'Hash Decode',
    },
    mainEntityOfPage: `${origin}/blog/${p.id}`,
    ...(p.updated ? { dateModified: new Date(p.updated).toISOString() } : {}),
  };

  // Parse body text into structured blocks (code blocks, headings, paragraphs)
  const rawBlocks = p.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="wrap interior page-article-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }}
      />
      <ReadingProgressBar />

      {/* Navigation breadcrumb */}
      <div className="article-top-nav">
        <a className="article-back-link" href="/blog">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>All engineering notes</span>
        </a>
      </div>

      {/* Article Header */}
      <header className="article-header" data-reveal="fade">
        <div className="article-meta-row">
          <span className="article-tag-badge">
            <Tag size={12} aria-hidden="true" />
            <span>{p.label || 'Engineering'}</span>
          </span>
          <span className="article-meta-item">
            <Calendar size={13} aria-hidden="true" />
            <span>{dateStr}</span>
          </span>
          <span className="article-meta-item">
            <Clock size={13} aria-hidden="true" />
            <span>{readTime}</span>
          </span>
        </div>

        <h1 className="article-main-title">{p.title}</h1>
      </header>

      {/* Optional Featured Image */}
      {p.image && (
        <div className="article-featured-image-wrap hd-card" data-reveal="up">
          <div className="card-glare" aria-hidden="true" />
          <img
            width={1200}
            height={640}
            loading="lazy"
            alt={p.title}
            src={p.image}
            className="article-featured-image"
          />
        </div>
      )}

      {/* Article Body Copy */}
      <div className="article-prose-container" data-reveal="up">
        {rawBlocks.map((block, idx) => {
          const trimmed = block.trim();

          // Check if fenced code block
          if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
            const lines = trimmed.split('\n');
            const codeContent = lines.slice(1, -1).join('\n');
            return (
              <pre key={idx} className="article-code-block">
                <code>{codeContent}</code>
              </pre>
            );
          }

          // Section heading (short string under 80 chars, not starting with list bullet)
          if (trimmed.length < 80 && !trimmed.includes('.') && !trimmed.startsWith('-')) {
            return (
              <h2 key={idx} className="article-section-heading">
                {trimmed}
              </h2>
            );
          }

          return (
            <p key={idx} className="article-paragraph">
              {trimmed}
            </p>
          );
        })}

        {p.url && (
          <p className="article-source-row">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="article-source-link">
              <span>External source / reference</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </p>
        )}
      </div>

      {/* Article Closing Discussion Card */}
      <div className="article-cta-box hd-card" data-reveal="up">
        <div className="card-glare" aria-hidden="true" />
        <div className="article-cta-content">
          <span className="section-rule-label">Have questions?</span>
          <h3 className="article-cta-heading">Need help applying this to your stack?</h3>
          <p className="article-cta-sub">
            Our founding engineers can review your architecture, run a security check, or help plan a release.
          </p>
        </div>
        <div className="article-cta-action">
          <a className="hd-btn-primary" href="/contact">
            <span className="btn-label">Discuss your project</span>
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
      </div>

      {/* Related Posts: Render ONLY if they exist */}
      {relatedPosts.length > 0 && (
        <section className="article-related-section" data-reveal="up">
          <div className="section-head-rule">
            <span className="section-rule-label">Keep reading</span>
            <h2 className="section-rule-heading">
              Related <span className="highlight-word">notes.</span>
            </h2>
          </div>
          <div className="article-related-grid" data-stagger>
            {relatedPosts.map((rp) => (
              <article key={rp.id} className="blog-card hd-card" data-reveal="up">
                <div className="card-glare" aria-hidden="true" />
                <a href={`/blog/${rp.id}`} className="blog-card-link-wrapper">
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="blog-tag-badge">{rp.label || 'Engineering'}</span>
                      <span className="blog-meta-item">
                        <Clock size={13} aria-hidden="true" />
                        <span>{calculateReadTime(rp.body)}</span>
                      </span>
                    </div>
                    <h3 className="blog-card-title">{rp.title}</h3>
                    <p className="blog-card-excerpt">
                      {rp.body.replace(/\s+/g, ' ').slice(0, 110)}...
                    </p>
                    <div className="blog-card-footer">
                      <span className="blog-card-date">
                        <Calendar size={13} aria-hidden="true" />
                        <span>{formatDate(rp.updated)}</span>
                      </span>
                      <span className="blog-read-link">
                        <span>Read note</span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
