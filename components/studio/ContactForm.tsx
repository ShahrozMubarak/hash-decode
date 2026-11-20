'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  AlertCircle,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  Building,
  User,
  Mail,
  FileText,
  DollarSign
} from 'lucide-react';
import { showToast } from './ToastManager';

export const scopeOptions = [
  'Web Platform & SSR',
  'SaaS / Digital Product',
  'Internal Tooling & Automation',
  'Security Audit & Hardening',
  'Architecture Advisory',
];

export const timelineOptions = [
  '< 1 month (Expedited)',
  '1–3 months',
  '3–6 months',
  'Flexible / Exploring',
];

export const budgetOptions = [
  'Under US$5,000',
  'US$5,000–$15,000',
  'US$15,000–$35,000',
  'US$35,000+',
  'Still exploring',
];

interface ContactFormProps {
  initial?: string;
  initialBrief?: string;
}

export default function ContactForm({ initial = '', initialBrief = '' }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const startedAt = useRef('');
  useEffect(() => {
    startedAt.current = String(Date.now());
  }, []);
  const last = useRef({ signature: '', id: '' });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [shaking, setShaking] = useState(false);

  // Form state
  const [selectedScope, setSelectedScope] = useState<string>(
    scopeOptions.find((s) => s.toLowerCase().includes(initial.toLowerCase())) || scopeOptions[0]
  );
  const [selectedTimeline, setSelectedTimeline] = useState<string>(timelineOptions[1]);
  const [selectedBudget, setSelectedBudget] = useState<string>(budgetOptions[1]);
  const [ndaChecked, setNdaChecked] = useState<boolean>(true);
  const [briefText, setBriefText] = useState<string>(initialBrief);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((name: string, value: string, required = true): string => {
    if (required && !value.trim()) {
      return 'This field is required.';
    }
    if (name === 'name' && value.trim().length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid email address.';
      }
    }
    if (name === 'brief' && value.trim().length < 12) {
      return 'Please provide a little more detail (at least 12 characters).';
    }
    return '';
  }, []);

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, required } = e.target;
    const errorMsg = validateField(name, value, required);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 350);
  };

  if (receipt) {
    return (
      <section className="form-panel hd-card confirmation-card" role="status">
        <div className="confirmation-header">
          <svg
            className="success-check-svg"
            viewBox="0 0 52 52"
            width="52"
            height="52"
            aria-hidden="true"
          >
            <circle
              className="success-check-circle"
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="#e15b3e"
              strokeWidth="2.5"
            />
            <path
              className="success-check-path"
              fill="none"
              stroke="#e15b3e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 26.5l7.5 7.5 15-15"
            />
          </svg>
          <p className="eyebrow">Brief received / {receipt}</p>
        </div>
        <h2>Thanks for the brief.</h2>
        <p className="confirmation-copy">
          Your inquiry is in the studio inbox. We will review your requirements and follow up with practical technical advice and milestone estimates within 24 hours.
        </p>
        <div className="confirmation-action" style={{ marginTop: '1.5rem' }}>
          <a className="hd-btn-primary" href="/portfolio">
            <span className="btn-label">Explore our work</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      className={`form-panel hd-card hd-form premium-studio-form ${shaking ? 'form-shake' : ''}`}
      aria-busy={busy}
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (lock.current) return;

        const form = event.currentTarget;
        const formData = new FormData(form);
        const nameVal = String(formData.get('name') || '').trim();
        const emailVal = String(formData.get('email') || '').trim();
        const companyVal = String(formData.get('company') || '').trim();
        const briefRaw = String(formData.get('brief') || '').trim();

        // Client validation on submit
        const errors: Record<string, string> = {};
        const nameErr = validateField('name', nameVal, true);
        if (nameErr) errors.name = nameErr;

        const emailErr = validateField('email', emailVal, true);
        if (emailErr) errors.email = emailErr;

        const briefErr = validateField('brief', briefRaw, true);
        if (briefErr) errors.brief = briefErr;

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          triggerShake();
          const firstField = form.querySelector<HTMLElement>('[aria-invalid="true"], :invalid');
          if (firstField) firstField.focus();
          return;
        }

        // Structure detailed brief incorporating all user selections
        const fullBrief = [
          briefRaw,
          companyVal ? `Company / Organization: ${companyVal}` : '',
          `Project Scope: ${selectedScope}`,
          `Target Timeline: ${selectedTimeline}`,
          `Budget Allocation: ${selectedBudget}`,
          `Mutual NDA Required: ${ndaChecked ? 'Yes (NDA Requested)' : 'Standard Studio Confidentiality'}`,
        ]
          .filter(Boolean)
          .join('\n\n');

        const signature = JSON.stringify([nameVal, emailVal, selectedScope, selectedBudget, fullBrief]);
        if (signature !== last.current.signature || !last.current.id) {
          const generatedId =
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? crypto.randomUUID()
              : 'inq_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
          last.current = {
            signature,
            id: generatedId,
          };
        }

        lock.current = true;
        setBusy(true);
        setError('');

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('hd:form-submitting'));
        }

        try {
          const clientTimestamp = startedAt.current || String(Date.now());
          const submissionId = last.current.id || ('inq_' + Date.now().toString(36));
          const r = await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nameVal,
              email: emailVal,
              topic: selectedScope,
              budget: selectedBudget,
              brief: fullBrief,
              company: companyVal,
              timeline: selectedTimeline,
              nda: ndaChecked,
              startedAt: clientTimestamp,
              submissionId,
            }),
            signal: AbortSignal.timeout(18000),
          });

          if (!r.ok) {
            const payload = await r.json().catch(() => null);
            const msg = payload?.error?.message || 'Please check your information and try submitting again.';

            setError(msg);
            showToast({
              type: 'error',
              title: 'Submission notice',
              message: msg,
            });
            triggerShake();

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('hd:form-error', { detail: { error: msg } }));
            }
            return;
          }

          const result = (await r.json()) as { reference?: string };
          if (!result.reference) throw Error();

          setReceipt(result.reference);
          showToast({
            type: 'success',
            title: 'Brief received',
            message: 'Your project brief is safely in the studio inbox.',
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('hd:form-success', { detail: { reference: result.reference } })
            );
          }
        } catch {
          const msg = 'We could not reach the server right now. Your details are preserved. You can retry or email hashdecodeofficial@gmail.com directly.';
          setError(msg);
          showToast({
            type: 'error',
            title: 'Connection notice',
            message: msg,
          });
          triggerShake();

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('hd:form-error', { detail: { error: msg } }));
          }
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      {/* SECTION 01: IDENTITY */}
      <div className="form-section-group">
        <div className="form-section-header">
          <span className="form-step-num">01</span>
          <div className="form-step-meta">
            <h3 className="form-step-title">Your Identity</h3>
            <span className="form-step-desc">Direct engineer contact details</span>
          </div>
        </div>

        <div className="form-row">
          <label className="form-field-label">
            <span className="field-label-text">
              <User size={13} aria-hidden="true" />
              <span>Full Name</span>
            </span>
            <input
              name="name"
              autoComplete="name"
              placeholder="e.g. Alex Sterling"
              minLength={2}
              maxLength={100}
              required
              className={`form-input ${fieldErrors.name ? 'is-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              onBlur={handleBlur}
            />
            {fieldErrors.name && (
              <span id="name-error" className="field-error-msg" role="alert">
                <AlertCircle size={13} aria-hidden="true" />
                {fieldErrors.name}
              </span>
            )}
          </label>

          <label className="form-field-label">
            <span className="field-label-text">
              <Mail size={13} aria-hidden="true" />
              <span>Work Email</span>
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              maxLength={254}
              required
              className={`form-input ${fieldErrors.email ? 'is-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              onBlur={handleBlur}
            />
            {fieldErrors.email && (
              <span id="email-error" className="field-error-msg" role="alert">
                <AlertCircle size={13} aria-hidden="true" />
                {fieldErrors.email}
              </span>
            )}
          </label>
        </div>

        <label className="form-field-label" style={{ marginTop: '0.85rem' }}>
          <span className="field-label-text">
            <Building size={13} aria-hidden="true" />
            <span>Company or Brand (Optional)</span>
          </span>
          <input
            name="company"
            placeholder="e.g. Acme Corp / Stealth Startup"
            maxLength={100}
            className="form-input"
          />
        </label>
      </div>

      {/* SECTION 02: PROJECT SCOPE */}
      <div className="form-section-group" style={{ marginTop: '1.75rem' }}>
        <div className="form-section-header">
          <span className="form-step-num">02</span>
          <div className="form-step-meta">
            <h3 className="form-step-title">Project Scope</h3>
            <span className="form-step-desc">Select the primary capability you need</span>
          </div>
        </div>

        <div className="form-chips-grid" role="radiogroup" aria-label="Project Scope Selection">
          {scopeOptions.map((opt) => {
            const isSelected = selectedScope === opt;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`form-scope-chip ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedScope(opt)}
              >
                <span className="chip-indicator" aria-hidden="true">
                  {isSelected ? <Check size={13} /> : null}
                </span>
                <span className="chip-label">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 03: TIMELINE & BUDGET */}
      <div className="form-section-group" style={{ marginTop: '1.75rem' }}>
        <div className="form-section-header">
          <span className="form-step-num">03</span>
          <div className="form-step-meta">
            <h3 className="form-step-title">Timeline &amp; Investment</h3>
            <span className="form-step-desc">Align schedules and milestone expectations</span>
          </div>
        </div>

        <div className="form-segmented-group">
          <span className="form-sub-label">
            <Clock size={13} aria-hidden="true" />
            <span>Target Launch Window</span>
          </span>
          <div className="form-segmented-row" role="radiogroup" aria-label="Target Timeline">
            {timelineOptions.map((t) => {
              const isSelected = selectedTimeline === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`form-segment-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedTimeline(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-segmented-group" style={{ marginTop: '1rem' }}>
          <span className="form-sub-label">
            <DollarSign size={13} aria-hidden="true" />
            <span>Budget Allocation</span>
          </span>
          <div className="form-segmented-row" role="radiogroup" aria-label="Budget Allocation">
            {budgetOptions.map((b) => {
              const isSelected = selectedBudget === b;
              return (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`form-segment-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedBudget(b)}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 04: SPECIFICATION & PROTECTIONS */}
      <div className="form-section-group" style={{ marginTop: '1.75rem' }}>
        <div className="form-section-header">
          <span className="form-step-num">04</span>
          <div className="form-step-meta">
            <h3 className="form-step-title">Specification</h3>
            <span className="form-step-desc">Who is it for, and what should it accomplish?</span>
          </div>
        </div>

        <label className="form-field-label">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="field-label-text">
              <FileText size={13} aria-hidden="true" />
              <span>Project Requirements &amp; Goals</span>
            </span>
            <span className="char-counter" style={{ fontSize: '11px', opacity: 0.6 }}>
              {briefText.length} / 3000
            </span>
          </div>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            name="brief"
            placeholder="Describe your user workflow, technical requirements, current stack if any, and any critical security or compliance considerations..."
            minLength={12}
            maxLength={3000}
            rows={5}
            required
            className={`form-textarea ${fieldErrors.brief ? 'is-invalid' : ''}`}
            aria-invalid={Boolean(fieldErrors.brief)}
            aria-describedby={fieldErrors.brief ? 'brief-error' : undefined}
            onBlur={handleBlur}
          />
          {fieldErrors.brief && (
            <span id="brief-error" className="field-error-msg" role="alert">
              <AlertCircle size={13} aria-hidden="true" />
              {fieldErrors.brief}
            </span>
          )}
        </label>

        {/* Mutual NDA Protection Toggle */}
        <div
          className="nda-toggle-box"
          onClick={() => setNdaChecked(!ndaChecked)}
          role="checkbox"
          aria-checked={ndaChecked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setNdaChecked(!ndaChecked);
            }
          }}
        >
          <div className={`nda-checkbox-indicator ${ndaChecked ? 'is-checked' : ''}`} aria-hidden="true">
            {ndaChecked && <Check size={14} />}
          </div>
          <div className="nda-text-wrap">
            <div className="nda-title-row">
              <ShieldCheck size={14} className="nda-shield-icon" aria-hidden="true" />
              <strong>Require Mutual NDA prior to deep technical review</strong>
            </div>
            <p className="nda-desc">
              Your architectural code, proprietary workflows, and customer data remain 100% confidential under mutual non-disclosure.
            </p>
          </div>
        </div>
      </div>

      {/* Honeypot field */}
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {error && (
        <div className="form-inline-alert" role="alert" style={{ marginTop: '1.25rem' }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button in Signature Coral Red */}
      <div className="form-submit-row" style={{ marginTop: '1.75rem' }}>
        <button
          id="send-brief-btn"
          className={`hd-btn-primary send-brief-btn coral-glow ${busy ? 'is-loading' : ''}`}
          disabled={busy}
          aria-busy={busy}
          type="submit"
        >
          <Sparkles size={16} aria-hidden="true" />
          <span className="btn-label">{busy ? 'Sending brief…' : 'Send project brief'}</span>
          <ArrowUpRight size={16} aria-hidden="true" />
          <span className="btn-spinner" aria-hidden="true" />
        </button>

        <span className="form-sla-guarantee">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Direct senior engineer response within 24 hours</span>
        </span>
      </div>
    </form>
  );
}
