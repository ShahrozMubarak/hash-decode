import { getLinks } from '@/lib/cms';
import ContactForm from '@/components/studio/ContactForm';
import { meta } from '@/lib/meta';
import { ArrowUpRight, Calendar, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata = meta(
  'Start a Software Project | Hash Decode',
  'Send a brief for a web platform, internal tool, custom application or security audit. Tell Hash Decode about your goals, budget and timing.',
  '/contact'
);

type Query = Promise<{ type?: string | string[]; brief?: string | string[] }>;

const faqItems = [
  {
    q: 'How fast can you start working on my project?',
    a: 'We usually begin within 3 to 7 business days of agreeing on scope and budget. We never overbook our studio, ensuring your project gets our full attention.',
  },
  {
    q: 'Do you sign Non-Disclosure Agreements (NDAs)?',
    a: 'Yes, absolutely. We can sign your company NDA or provide our standard mutual NDA before you share any proprietary details or source code.',
  },
  {
    q: 'What is your typical project timeline and cost?',
    a: 'Custom web and mobile MVPs typically range from 2 to 6 weeks. Security audits take 3 to 7 business days. Every quote is fixed-price with clear milestone deliverables.',
  },
  {
    q: 'Who owns the code and credentials after launch?',
    a: 'You own 100% of everything. All source code, GitHub repositories, cloud infrastructure, and database keys are transferred to your company accounts.',
  },
];

export default async function Contact({ searchParams }: { searchParams: Query }) {
  const [q, links] = await Promise.all([searchParams, getLinks()]);

  return (
    <div className="wrap interior page-contact-content">
      {/* Top 2-Column Grid: Left Sidebar + Right Form */}
      <div className="contact-main-grid">
        <aside className="contact-sidebar">
          <header className="page-intro compact">
            <p className="kicker"><span className="key-line" />Direct Inquiry</p>
            <h1>Start a conversation.<br /><span style={{ color: 'var(--highlight)' }}>Let&apos;s build it.</span></h1>
            <p className="lead-text">
              Tell us about the people using your software and the problem you want to solve.
              We reply within 24 hours with practical advice and a clear estimate.
            </p>
          </header>

          <div className="contact-action-list">
            <a className="contact-channel-pill whatsapp-channel" href={'https://wa.me/' + (links.whatsapp || '923000000000')} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="icon-whatsapp" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <div>
                <strong>WhatsApp Engineering</strong>
                <span>Fastest direct chat response</span>
              </div>
              <ArrowUpRight size={16} />
            </a>
            {links.booking && (
              <a className="contact-channel-pill" href={links.booking} target="_blank" rel="noopener noreferrer">
                <Calendar className="icon-azure" size={20} />
                <div>
                  <strong>Book a 15-Min Call</strong>
                  <span>Pick a time that fits your calendar</span>
                </div>
                <ArrowUpRight size={16} />
              </a>
            )}
            <a className="contact-channel-pill" href="mailto:hello@hashdecode.com">
              <Mail className="icon-azure" size={20} />
              <div>
                <strong>Email the Team</strong>
                <span>hello@hashdecode.com</span>
              </div>
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="contact-trust-badges">
            <div className="trust-badge">
              <Clock size={16} />
              <span>Average response under 2 hours</span>
            </div>
            <div className="trust-badge">
              <ShieldCheck size={16} />
              <span>100% Confidential &amp; NDA protected</span>
            </div>
            <div className="trust-badge">
              <CheckCircle2 size={16} />
              <span>Available worldwide for remote releases</span>
            </div>
          </div>
        </aside>

        {/* Right Form Card */}
        <div className="contact-form-column">
          <ContactForm
            initial={typeof q.type === 'string' ? q.type : ''}
            initialBrief={typeof q.brief === 'string' ? q.brief : ''}
          />
        </div>
      </div>

      {/* What Happens Next 3-Step Guide */}
      <section className="contact-next-steps-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />Next steps</p>
            <h2>What happens <span style={{ color: 'var(--highlight)' }}>after you reach out?</span></h2>
          </div>
        </div>
        <div className="steps-row-3">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>Brief Review</h3>
            <p>We read your inquiry carefully. A senior engineer analyzes the technical feasibility and prepares initial recommendations.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h3>15-Min Discovery Call</h3>
            <p>We hop on a quick video call or chat on WhatsApp to align on features, priorities, and your desired launch date.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h3>Clear Proposal &amp; Quote</h3>
            <p>You receive a written architecture outline with fixed milestone pricing and an exact delivery schedule. No surprise fees.</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="contact-faq-section">
        <div className="section-head">
          <div>
            <p className="eyebrow"><i />Common questions</p>
            <h2>Frequently asked <span style={{ color: 'var(--highlight)' }}>questions</span></h2>
          </div>
        </div>
        <div className="contact-faq-list">
          {faqItems.map((item) => (
            <details key={item.q} className="faq-drawer">
              <summary>
                <span>{item.q}</span>
                <span className="plus-icon">+</span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
