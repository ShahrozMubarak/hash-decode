import { entries } from '@/lib/cms';
import { meta, origin } from '@/lib/meta';
import { notFound } from 'next/navigation';
import ReadingProgressBar from '@/components/studio/ReadingProgressBar';
import BottomCta from '@/components/studio/BottomCta';
import { ArrowLeft, ArrowUpRight, Calendar, Clock, Tag } from 'lucide-react';

export const revalidate = 300;

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

  // Parse body text into structured blocks
  const rawBlocks = p.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="wrap interior page-article-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }}
      />
      <ReadingProgressBar />

      {/* Navigation back link */}
      <div className="article-top-nav">
        <a className="article-back-link" href="/blog">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>All engineering notes</span>
        </a>
      </div>

      {/* Centered Article Header */}
      <header className="page-intro" data-reveal="fade">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(0,0,0,0.06)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} aria-hidden="true" />
            <span>{p.label || 'Engineering'}</span>
          </span>
          <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} aria-hidden="true" />
            <span>{dateStr}</span>
          </span>
          <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} aria-hidden="true" />
            <span>{readTime}</span>
          </span>
        </div>

        <h1 className="inner-hero-h1">
          {p.title}.
        </h1>
      </header>

      {/* Optional Featured Image */}
      {p.image && (
        <div style={{ maxWidth: '900px', margin: '0 auto var(--s-6)', borderRadius: '24px', overflow: 'hidden' }} data-reveal="up">
          <img
            width={1200}
            height={640}
            loading="lazy"
          decoding="async"
            alt={p.title}
            src={p.image}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      {/* Article Body Copy: 680px Reading Column */}
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

          // Section heading
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
          <p style={{ marginTop: 'var(--s-4)', fontSize: '14px', fontWeight: 600 }}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#000000' }}>
              <span>External source / reference</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </p>
        )}
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section style={{ margin: 'var(--s-8) 0' }} data-reveal="up">
          <div className="section-head-rule">
            <span className="section-rule-label">Keep reading</span>
            <h2 className="section-rule-heading">
              Related notes.
            </h2>
          </div>
          <div className="blog-cards-grid" data-stagger>
            {relatedPosts.map((rp) => (
              <article key={rp.id} className="blog-card" data-reveal="up">
                <a href={`/blog/${rp.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%', padding: 'var(--s-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.06)' }}>
                      {rp.label || 'Engineering'}
                    </span>
                    <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} aria-hidden="true" />
                      <span>{calculateReadTime(rp.body)}</span>
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>{rp.title}</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0', flexGrow: 1 }}>
                    {rp.body.replace(/\s+/g, ' ').slice(0, 110)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', fontSize: '13px', fontWeight: 600 }}>
                    <span>{formatDate(rp.updated)}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>Read note</span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </span>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </article>
  );
}
