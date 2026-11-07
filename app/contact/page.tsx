import { getLinks } from '@/lib/cms';
import ContactForm from '@/components/studio/ContactForm';
import { meta } from '@/lib/meta';
import { ArrowUpRight, MessageSquare, Calendar, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
            <h1>Start a conversation.<br /><span className="text-coral" style={{ color: 'var(--coral)' }}>Let&apos;s build it.</span></h1>
            <p className="lead-text">
              Tell us about the people using your software and the problem you want to solve.
              We reply within 24 hours with practical advice and a clear estimate.
            </p>
          </header>

          <div className="contact-action-list">
            {links.whatsapp && (
              <a className="contact-channel-pill" href={'https://wa.me/' + links.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="icon-azure" size={20} />
                <div>
                  <strong>WhatsApp the Studio</strong>
                  <span>Fastest direct chat response</span>
                </div>
                <ArrowUpRight size={16} />
              </a>
            )}
            {links.booking && (
              <a className="contact-channel-pill" href={links.booking} target="_blank" rel="noopener noreferrer">
                <Calendar className="icon-coral" size={20} />
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
            <p className="eyebrow"><i />01 &nbsp;/&nbsp; Next Steps</p>
            <h2>What happens after you reach out?</h2>
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
            <p className="eyebrow"><i />02 &nbsp;/&nbsp; Common Questions</p>
            <h2>Before we begin</h2>
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
