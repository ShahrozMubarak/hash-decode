import { getLinks } from '@/lib/cms';
import ContactForm from '@/components/studio/ContactForm';
import TeleportBot from '@/components/studio/TeleportBot';
import FAQAccordion from '@/components/studio/FAQAccordion';
import { meta } from '@/lib/meta';
import {
  ArrowUpRight,
  Calendar,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Search,
  MessageSquare,
  FileCheck,
} from 'lucide-react';

export const metadata = meta(
  'Start a Software Project | Hash Decode',
  'Send a brief for a web platform, internal tool, custom application or security audit. Tell Hash Decode about your goals, budget and timing.',
  '/contact'
);

type Query = Promise<{ type?: string | string[]; brief?: string | string[] }>;

export default async function Contact({ searchParams }: { searchParams: Query }) {
  const [q, links] = await Promise.all([searchParams, getLinks()]);

  return (
    <div className="wrap interior page-contact-content">
      {/* Top 2-Column Grid: Tops Aligned */}
      <div className="contact-main-grid">
        {/* Left Column: Heading, Subtext, Robot & Channels */}
        <aside className="contact-sidebar" data-reveal="fade">
          <header className="page-intro compact">
            <p className="section-rule-label">Direct inquiry</p>
            <h1 className="inner-hero-h1">
              Start A <span style={{ color: '#1E40AF' }}>Project.</span>
            </h1>
            <p className="section-rule-lead">
              Tell us about the people using your software and the problem you want to solve.
              We reply within 24 hours with practical advice and a clear estimate.
            </p>
          </header>

          {/* Fully visible Speech Bubble & 3D Robot */}
          <div className="contact-robot-wrapper">
            <TeleportBot />
          </div>

          <div className="contact-action-list">
            <a
              className="hd-btn-secondary whatsapp-studio-btn"
              href={links.whatsapp || 'https://wa.me/923000000000'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp the studio"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp the studio</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>

            {links.booking && (
              <a
                className="contact-channel-pill hd-card"
                href={links.booking}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="channel-icon-wrap" aria-hidden="true">
                  <Calendar size={18} />
                </div>
                <div className="channel-text">
                  <strong>Book a 15-min call</strong>
                  <span>Direct founder conversation</span>
                </div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}

            <a className="contact-channel-pill hd-card" href="mailto:hello@hashdecode.com">
              <div className="channel-icon-wrap" aria-hidden="true">
                <Mail size={18} />
              </div>
              <div className="channel-text">
                <strong>Email the engineering desk</strong>
                <span>hello@hashdecode.com</span>
              </div>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="contact-trust-badges">
            <div className="trust-badge">
              <Clock size={16} className="trust-icon" aria-hidden="true" />
              <span>Average response under 2 hours</span>
            </div>
            <div className="trust-badge">
              <ShieldCheck size={16} className="trust-icon" aria-hidden="true" />
              <span>100% Confidential &amp; NDA protected</span>
            </div>
            <div className="trust-badge">
              <CheckCircle2 size={16} className="trust-icon" aria-hidden="true" />
              <span>Available worldwide for remote releases</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Shared Contact Form in Shared Card */}
        <div className="contact-form-column" data-reveal="up">
          <ContactForm
            initial={typeof q.type === 'string' ? q.type : ''}
            initialBrief={typeof q.brief === 'string' ? q.brief : ''}
          />
        </div>
      </div>

      {/* What Happens Next 3-Step Guide */}
      <section className="contact-next-steps-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Next steps</span>
          <h2 className="section-rule-heading">
            What happens <span className="highlight-word">after you reach out?</span>
          </h2>
          <p className="section-rule-lead">A direct, human engineering onboarding process.</p>
        </div>
        <div className="steps-row-3" data-stagger>
          <div className="step-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="step-icon-tile" aria-hidden="true">
              <Search size={22} />
            </div>
            <h3>Brief review</h3>
            <p>We read your inquiry carefully. A senior engineer analyzes technical feasibility and prepares initial recommendations.</p>
          </div>
          <div className="step-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="step-icon-tile" aria-hidden="true">
              <MessageSquare size={22} />
            </div>
            <h3>Discovery conversation</h3>
            <p>We align on workflows, critical milestones, and your desired launch timeline over WhatsApp or video call.</p>
          </div>
          <div className="step-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="step-icon-tile" aria-hidden="true">
              <FileCheck size={22} />
            </div>
            <h3>Clear proposal &amp; quote</h3>
            <p>You receive a written architecture outline with fixed milestone pricing and an exact delivery schedule. No surprise fees.</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="contact-faq-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Common questions</span>
          <h2 className="section-rule-heading">
            Frequently asked <span className="highlight-word">questions.</span>
          </h2>
          <p className="section-rule-lead">Everything you need to know about pricing, delivery, and code ownership.</p>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <FAQAccordion />
        </div>
      </section>
    </div>
  );
}
