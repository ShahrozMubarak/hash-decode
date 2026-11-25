import { meta } from '@/lib/meta';
import PrivacyDocument from '@/components/studio/PrivacyDocument';
import BottomCta from '@/components/studio/BottomCta';

export const revalidate = 3600;

export const metadata = meta(
  'Privacy Notice | Hash Decode',
  'How Hash Decode handles project inquiries, aggregate traffic counts, security scans, and third-party integrations.',
  '/privacy'
);

export default function Privacy() {
  return (
    <article className="wrap interior page-privacy-content">
      {/* Centered Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio policy</p>
        <h1 className="inner-hero-h1">
          Privacy notice.
        </h1>
        <p className="section-rule-lead">
          Honest data practices. No advertising cookies, no behavioural profiling, and complete client ownership over your project information.
        </p>
      </header>

      {/* Main Document with Sticky Desktop TOC */}
      <div data-reveal="up" style={{ marginBottom: 'var(--s-8)' }}>
        <PrivacyDocument />
      </div>

      {/* Single Wide Ink CTA Card */}
      <BottomCta />
    </article>
  );
}
