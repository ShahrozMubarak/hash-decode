import ContactForm from '@/components/studio/ContactForm';
import TeleportBot from '@/components/studio/TeleportBot';
import FAQAccordion from '@/components/studio/FAQAccordion';
import { meta } from '@/lib/meta';
import {
  ArrowUpRight,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
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
  const q = await searchParams;

  return (
    <div className="wrap interior page-contact-content">
      {/* Centered Page Intro */}
      <header className="page-intro" style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto var(--s-6)' }} data-reveal="fade">
        <p className="section-rule-label">Direct inquiry</p>
        <h1 className="inner-hero-h1">
          <span className="hd-accent-navy">Start</span> a <span className="hd-accent-navy">Project</span>.
        </h1>
        <p className="section-rule-lead" style={{ margin: '16px auto 0' }}>
          Tell us about the people using your software and the problem you want to solve.
          We reply within 24 hours with practical advice and a clear estimate.
        </p>
      </header>

      {/* Full-Width Solid Liquid Crystal Contact Form Card */}
      <div
        className="contact-form-card liquid liquid--cloud is-visible"
        style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}
        data-reveal="up"
      >
        <span className="liquid__blob liquid__blob--a" aria-hidden="true" />
        <span className="liquid__blob liquid__blob--b" aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <ContactForm
            initial={typeof q.type === 'string' ? q.type : ''}
            initialBrief={typeof q.brief === 'string' ? q.brief : ''}
          />
        </div>
      </div>

      {/* Secondary Contact Channels & Trust Relocated Cleanly Below Form */}
      <div className="contact-secondary-channels-section" style={{ width: '100%', maxWidth: '960px', margin: '48px auto 0' }} data-reveal="up">
        {/* Contact Channel Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <a
            className="contact-channel-pill hd-card"
            href="https://wa.me/923001237124"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp 0300 1237124"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', borderRadius: '18px', background: 'rgba(11, 31, 58, 0.03)', border: '1px solid rgba(11, 31, 58, 0.08)' }}
          >
            <div className="channel-icon-wrap" aria-hidden="true">
              <Phone size={18} />
            </div>
            <div className="channel-text" style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0B1F3A' }}>WhatsApp Hotline</strong>
              <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)' }}>0300 1237124 / 0321 4866916</span>
            </div>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <a
            className="contact-channel-pill hd-card"
            href="mailto:hashdecodeofficial@gmail.com"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', borderRadius: '18px', background: 'rgba(11, 31, 58, 0.03)', border: '1px solid rgba(11, 31, 58, 0.08)' }}
          >
            <div className="channel-icon-wrap" aria-hidden="true">
              <Mail size={18} />
            </div>
            <div className="channel-text" style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0B1F3A' }}>Official Studio Email</strong>
              <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)' }}>hashdecodeofficial@gmail.com</span>
            </div>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>

          <div
            className="contact-channel-pill hd-card location-channel-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', borderRadius: '18px', background: 'rgba(11, 31, 58, 0.03)', border: '1px solid rgba(11, 31, 58, 0.08)' }}
          >
            <div className="channel-icon-wrap" aria-hidden="true">
              <MapPin size={18} />
            </div>
            <div className="channel-text" style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0B1F3A' }}>Studio Headquarters</strong>
              <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)' }}>Johar Town, Lahore, Pakistan</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="contact-trust-badges" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px', margin: '24px 0 36px' }}>
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

        {/* TeleportBot bubble */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 48px' }}>
          <TeleportBot />
        </div>
      </div>

      {/* What Happens Next 3-Step Guide */}
      <section className="contact-next-steps-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Next steps</span>
          <h2 className="section-rule-heading">
            What happens <span className="hd-accent-navy">after you reach out?</span>
          </h2>
          <p className="section-rule-lead">A direct, human engineering onboarding process.</p>
        </div>
        <div className="steps-row-3" data-stagger>
          <div className="step-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="step-icon-tile" aria-hidden="true">
              <Search size={22} />
            </div>
            <h3>Brief <span className="hd-accent-navy">review</span></h3>
            <p>We read your inquiry carefully. A senior engineer analyzes technical feasibility and prepares initial recommendations.</p>
          </div>
          <div className="step-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="step-icon-tile" aria-hidden="true">
              <MessageSquare size={22} />
            </div>
            <h3>Discovery <span className="hd-accent-navy">conversation</span></h3>
            <p>We align on workflows, critical milestones, and your desired launch timeline over WhatsApp or video call.</p>
          </div>
          <div className="step-card hd-card" data-reveal="up">
            <div className="card-glare" aria-hidden="true" />
            <div className="step-icon-tile" aria-hidden="true">
              <FileCheck size={22} />
            </div>
            <h3>Clear <span className="hd-accent-navy">proposal</span> &amp; quote</h3>
            <p>You receive a written architecture outline with fixed milestone pricing and an exact delivery schedule. No surprise fees.</p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="contact-faq-section" data-reveal="up">
        <div className="section-head-rule">
          <span className="section-rule-label">Common questions</span>
          <h2 className="section-rule-heading">
            Frequently asked <span className="hd-accent-navy">questions</span>.
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
