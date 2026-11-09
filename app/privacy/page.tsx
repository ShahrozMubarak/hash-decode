import { meta } from '@/lib/meta';
import PrivacyDocument from '@/components/studio/PrivacyDocument';

export const dynamic = 'force-dynamic';

export const metadata = meta(
  'Privacy Notice | Hash Decode',
  'How Hash Decode handles project inquiries, aggregate traffic counts, security scans, and third-party integrations.',
  '/privacy'
);

export default function Privacy() {
  return (
    <article className="wrap interior page-privacy-content">
      {/* Inner Hero */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio policy</p>
        <h1 className="inner-hero-h1">
          Privacy <span style={{ color: '#1E40AF' }}>notice.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Honest data practices. No advertising cookies, no behavioural profiling, and complete client ownership over your project information.
        </p>
      </header>

      {/* Main Document with Sticky Desktop TOC */}
      <div data-reveal="up">
        <PrivacyDocument />
      </div>
    </article>
  );
}
