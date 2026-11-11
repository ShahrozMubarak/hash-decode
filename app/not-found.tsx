import { ArrowUpRight, ArrowLeft, Briefcase, Cpu, Mail } from 'lucide-react';
import { meta } from '@/lib/meta';

export const metadata = meta(
  'Page Not Found | Hash Decode',
  'The requested page could not be located. Explore our studio work or contact our engineering team.',
  '/404'
);

export default function NotFound() {
  return (
    <div className="wrap interior page-error-container">
      <div className="error-hero-card hd-card" data-reveal="fade">
        <div className="card-glare" aria-hidden="true" />

        {/* Small Calming Robot / Compass Graphic */}
        <div className="error-graphic-wrap" aria-hidden="true">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="error-robot-svg"
          >
            <rect x="14" y="20" width="44" height="36" rx="10" stroke="#0B1F3A" strokeWidth="2.5" fill="#f8fafc" />
            <circle cx="28" cy="36" r="3.5" fill="#1E40AF" />
            <circle cx="44" cy="36" r="3.5" fill="#1E40AF" />
            <path d="M30 46H42" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M36 12V20" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="36" cy="10" r="3" fill="#D93A2F" />
            <line x1="8" y1="36" x2="14" y2="36" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="58" y1="36" x2="64" y2="36" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <span className="section-rule-label">404 Error</span>
        <h1 className="error-main-title">
          Page <span style={{ color: '#1E40AF' }}>not found.</span>
        </h1>
        <p className="error-lead-text">
          The link you followed may be outdated, or this page has been moved or retired.
        </p>

        {/* Primary Action */}
        <div className="error-primary-action">
          <a className="hd-btn-primary" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="btn-label">Back to home</span>
          </a>
        </div>

        {/* 3 Useful Links */}
        <div className="error-useful-links-box">
          <span className="useful-links-label">Suggested destinations:</span>
          <div className="useful-links-grid">
            <a href="/portfolio" className="useful-link-item">
              <div className="useful-link-icon" aria-hidden="true">
                <Briefcase size={16} />
              </div>
              <div className="useful-link-text">
                <strong>Explore our work</strong>
                <span>Review shipped client software</span>
              </div>
              <ArrowUpRight size={14} className="useful-link-arrow" aria-hidden="true" />
            </a>

            <a href="/services" className="useful-link-item">
              <div className="useful-link-icon" aria-hidden="true">
                <Cpu size={16} />
              </div>
              <div className="useful-link-text">
                <strong>Our services</strong>
                <span>Web platforms &amp; security audits</span>
              </div>
              <ArrowUpRight size={14} className="useful-link-arrow" aria-hidden="true" />
            </a>

            <a href="/contact" className="useful-link-item">
              <div className="useful-link-icon" aria-hidden="true">
                <Mail size={16} />
              </div>
              <div className="useful-link-text">
                <strong>Start a consultation</strong>
                <span>Speak directly with our engineers</span>
              </div>
              <ArrowUpRight size={14} className="useful-link-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
