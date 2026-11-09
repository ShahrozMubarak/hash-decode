'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ShieldCheck, Lock, FileText, Trash2, CheckCircle2 } from 'lucide-react';

type SectionItem = {
  id: string;
  title: string;
  icon: typeof ShieldCheck;
};

const sections: SectionItem[] = [
  { id: 'project-inquiries', title: 'Project inquiries', icon: FileText },
  { id: 'traffic-prevention', title: 'Traffic & abuse prevention', icon: ShieldCheck },
  { id: 'external-providers', title: 'Preferences & external providers', icon: Lock },
  { id: 'contact-deletion', title: 'Contact & data deletion', icon: Trash2 },
];

export default function PrivacyDocument() {
  const [activeId, setActiveId] = useState<string>('project-inquiries');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(sections[i].id);
          return;
        }
      }
      setActiveId(sections[0].id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <div className="privacy-layout-grid">
      {/* Sticky Table of Contents (Desktop sidebar) */}
      <aside className="privacy-toc-sidebar" aria-label="Table of contents">
        <div className="privacy-toc-sticky-box hd-card">
          <div className="card-glare" aria-hidden="true" />
          <span className="privacy-toc-label">On this page</span>
          <nav className="privacy-toc-nav">
            {sections.map((sec) => {
              const isActive = activeId === sec.id;
              const Icon = sec.icon;
              return (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => scrollToSection(e, sec.id)}
                  className={`privacy-toc-link ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={15} className="toc-icon" aria-hidden="true" />
                  <span>{sec.title}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Document Body (max-width 68ch) */}
      <div className="privacy-document-body">
        {/* Section 1 */}
        <section
          id="project-inquiries"
          className="privacy-doc-section"
          style={{ scrollMarginTop: '96px' }}
        >
          <div className="privacy-section-header">
            <span className="section-rule-label">Section 01</span>
            <h2 className="privacy-section-title">Project inquiries</h2>
          </div>
          <div className="privacy-section-copy">
            <p>
              We store the name, email, budget, and project details you submit so the studio owner can
              review and respond with a tailored proposal. When email notifications are configured, a copy
              is sent to the designated studio inbox via Resend.
            </p>
            <p>
              Chat messages, your chat contact details, and studio replies are stored securely in session
              storage and our database so the conversation can continue seamlessly while the panel is open.
              The visitor access token stays in session storage in your browser tab.
            </p>
            <div className="privacy-tip-box hd-card">
              <div className="card-glare" aria-hidden="true" />
              <CheckCircle2 size={18} className="tip-icon" aria-hidden="true" />
              <p>
                <strong>Security note:</strong> For your protection, never submit account passwords,
                production API secrets, or confidential client keys through our public inquiry forms.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section
          id="traffic-prevention"
          className="privacy-doc-section"
          style={{ scrollMarginTop: '96px' }}
        >
          <div className="privacy-section-header">
            <span className="section-rule-label">Section 02</span>
            <h2 className="privacy-section-title">Traffic and abuse prevention</h2>
          </div>
          <div className="privacy-section-copy">
            <p>
              We aggregate page view counts by day, page section, and broad referral category. These are
              aggregate counts, not unique visitor profiles or behavioral trackers.
            </p>
            <p>
              Our counting system uses <strong>no advertising cookies</strong> and strictly respects Do Not
              Track (DNT) and Global Privacy Control (GPC) browser headers. Short-lived, cryptographic hashed
              network identifiers help protect against bot attacks and rate-limit excessive API requests.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section
          id="external-providers"
          className="privacy-doc-section"
          style={{ scrollMarginTop: '96px' }}
        >
          <div className="privacy-section-header">
            <span className="section-rule-label">Section 03</span>
            <h2 className="privacy-section-title">Preferences and external providers</h2>
          </div>
          <div className="privacy-section-copy">
            <p>
              Your interface motion preferences (reduced-motion vs standard) are saved locally on your
              device. Owner sign-in uses a secure, time-limited HTTP session cookie with strict cryptographic
              integrity checks.
            </p>
            <p>
              If enabled, Cloudflare Turnstile processes a lightweight verification challenge to prevent
              automated spam. Using our free security checker transmits the public domain hostname directly to
              the Mozilla HTTP Observatory API. Calendar booking, WhatsApp messaging, and live client project
              links open directly in their respective third-party providers.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section
          id="contact-deletion"
          className="privacy-doc-section"
          style={{ scrollMarginTop: '96px' }}
        >
          <div className="privacy-section-header">
            <span className="section-rule-label">Section 04</span>
            <h2 className="privacy-section-title">Contact and data deletion</h2>
          </div>
          <div className="privacy-section-copy">
            <p>
              You maintain full rights to inspect, update, or permanently delete any inquiry information you
              have submitted to Hash Decode.
            </p>
            <p>
              Use our contact form to request prompt deletion of your project correspondence. Please include
              your project reference or the original email address used during submission so we can locate
              and purge your records.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <a className="hd-btn-secondary" href="/contact">
                <span>Submit a data request</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
