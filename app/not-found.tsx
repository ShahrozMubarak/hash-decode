import { ArrowLeft, Briefcase, Cpu, Mail } from 'lucide-react';
import { meta } from '@/lib/meta';

export const metadata = meta(
  'Page Not Found | Hash Decode',
  'The requested page could not be located. Explore our studio work or contact our engineering team.',
  '/404'
);

export default function NotFound() {
  return (
    <div className="wrap interior page-error-container">
      <div className="error-hero-card" data-reveal="fade">
        <span className="section-rule-label">404 Error</span>
        <h1 className="error-main-title">
          Page not found.
        </h1>
        <p className="error-lead-text">
          The link you followed may be outdated, or this page has been moved or retired.
        </p>

        {/* Primary Action */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-6)' }}>
          <a className="hd-btn-primary" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="btn-label">Back to home</span>
          </a>
        </div>

        {/* 3 Useful Links */}
        <div style={{ textAlign: 'left', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 'var(--s-5)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '12px' }}>
            Suggested destinations:
          </span>
          <div className="useful-links-grid">
            <a href="/portfolio" className="useful-link-item">
              <div aria-hidden="true">
                <Briefcase size={16} />
              </div>
              <div>
                <strong>Explore our work</strong>
                <span>Review shipped client software</span>
              </div>
            </a>

            <a href="/services" className="useful-link-item">
              <div aria-hidden="true">
                <Cpu size={16} />
              </div>
              <div>
                <strong>Our services</strong>
                <span>Web platforms &amp; security audits</span>
              </div>
            </a>

            <a href="/contact" className="useful-link-item">
              <div aria-hidden="true">
                <Mail size={16} />
              </div>
              <div>
                <strong>Start a consultation</strong>
                <span>Speak directly with our engineers</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
