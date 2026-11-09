import { Estimator } from '@/components/studio/Tools';
import { meta } from '@/lib/meta';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = meta(
  'Project Cost Estimator | Hash Decode',
  'Explore an illustrative software project budget based on foundation, complexity, and custom features.',
  '/tools/estimate'
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
        <p className="section-rule-label">Studio utility / 01</p>
        <h1 className="inner-hero-h1">
          Project cost <span style={{ color: '#1E40AF' }}>estimator.</span>
        </h1>
        <p className="section-rule-lead" style={{ maxWidth: '640px' }}>
          Select your product foundation, configure optional features, and specify operational complexity.
          Results calculate in real time using our studio formula.
        </p>
      </header>

      {/* Interactive Stepper */}
      <div className="tool-interactive-area" data-reveal="up">
        <Estimator />
      </div>
    </div>
  );
}
