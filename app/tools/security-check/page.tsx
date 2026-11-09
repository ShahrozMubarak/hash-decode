import { Checker } from '@/components/studio/Tools';
import { meta } from '@/lib/meta';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = meta(
  'Website Security Checker | Hash Decode',
  'Check a public domain with Mozilla HTTP Observatory and review its HTTP security header posture.',
  '/tools/security-check'
);

export default function Page() {
  return (
    <div className="wrap interior page-tool-detail">
      {/* Top back navigation */}
      <div className="tool-top-nav">
        <a className="article-back-link" href="/tools">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>All engineering tools</span>
        </a>
      </div>

      {/* Hero Header */}
      <header className="page-intro" data-reveal="fade">
        <p className="section-rule-label">Studio utility / 02</p>
        <h1 className="inner-hero-h1">
          Website security <span style={{ color: '#1E40AF' }}>check.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Inspect your public domain&apos;s browser-facing security configuration. Checks Content-Security-Policy,
          HSTS, frame guards, and transport protections before commissioning a deeper penetration audit.
        </p>
      </header>

      {/* Interactive Scanner */}
      <div className="tool-interactive-area" data-reveal="up">
        <Checker />
      </div>
    </div>
  );
}
