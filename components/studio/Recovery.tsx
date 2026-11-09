'use client';

import { ArrowUpRight, ArrowLeft, RotateCcw, Briefcase, Cpu, Mail } from 'lucide-react';

export default function Recovery({ reset }: { reset: () => void }) {
  return (
    <div className="wrap interior page-error-container">
      <div className="error-hero-card hd-card" data-reveal="fade">
        <div className="card-glare" aria-hidden="true" />

        {/* Small Calming Robot Graphic */}
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
            <circle cx="28" cy="36" r="3.5" fill="#D93A2F" />
            <circle cx="44" cy="36" r="3.5" fill="#D93A2F" />
            <path d="M30 46H42" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M36 12V20" stroke="#0B1F3A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="36" cy="10" r="3" fill="#D93A2F" />
          </svg>
        </div>

        <span className="section-rule-label">System Notice</span>
        <h1 className="error-main-title">
          Something went <span style={{ color: '#D93A2F' }}>wrong.</span>
        </h1>
        <p className="error-lead-text">
          An unexpected application issue interrupted this request. You can retry safely.
        </p>

        {/* Actions */}
        <div className="error-primary-action" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="hd-btn-primary" onClick={reset}>
            <RotateCcw size={15} aria-hidden="true" />
            <span className="btn-label">Try again</span>
          </button>
          <a className="hd-btn-secondary" href="/">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Back to home</span>
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
