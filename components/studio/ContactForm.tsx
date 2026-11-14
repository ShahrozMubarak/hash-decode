'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowUpRight, AlertCircle } from 'lucide-react';
import { showToast } from './ToastManager';

export const topics = [
  'Digital product',
  'Web platform',
  'Business system',
  'Security audit',
  'Something else',
];

export const budgetRanges = [
  'Under US$2,500',
  'US$2,500–7,500',
  'US$7,500–20,000',
  'US$20,000+',
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
              stroke="#137a4a"
              strokeWidth="2.5"
            />
            <path
              className="success-check-path"
              fill="none"
              stroke="#137a4a"
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
          Your inquiry is in the studio inbox. We will follow up at the email address you provided within 24 hours.
        </p>
        <div className="confirmation-action">
          <a className="hd-text-link" href="/portfolio">
            <span>Explore the work</span>
            <span className="link-arrow">↗</span>
          </a>
        </div>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      className={`form-panel hd-card hd-form ${shaking ? 'form-shake' : ''}`}
      aria-busy={busy}
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (lock.current) return;

        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData) as Record<string, string>;

        // Client validation on submit
        const errors: Record<string, string> = {};
        const nameErr = validateField('name', data.name || '', true);
        if (nameErr) errors.name = nameErr;

        const emailErr = validateField('email', data.email || '', true);
        if (emailErr) errors.email = emailErr;

        const topicErr = validateField('topic', data.topic || '', true);
        if (topicErr) errors.topic = topicErr;

        const briefErr = validateField('brief', data.brief || '', true);
        if (briefErr) errors.brief = briefErr;

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          triggerShake();
          // Focus the first invalid field
          const firstField = form.querySelector<HTMLElement>('[aria-invalid="true"], :invalid');
          if (firstField) firstField.focus();
          return;
        }

        const signature = JSON.stringify([data.name, data.email, data.topic, data.budget, data.brief]);
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
              ...data,
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
      <div className="form-row">
        <label className="form-field-label">
          <span className="field-label-text">Your name</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Full name"
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
          <span className="field-label-text">Email address</span>
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

      <label className="form-field-label">
        <span className="field-label-text">What are you building?</span>
        <div className="select-wrap">
          <select
            name="topic"
            defaultValue={topics.includes(initial) ? initial : ''}
            required
            className={`form-select ${fieldErrors.topic ? 'is-invalid' : ''}`}
            aria-invalid={Boolean(fieldErrors.topic)}
            aria-describedby={fieldErrors.topic ? 'topic-error' : undefined}
            onBlur={handleBlur}
          >
            <option value="" disabled>
              Select a project type
            </option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="select-chevron" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </div>
        {fieldErrors.topic && (
          <span id="topic-error" className="field-error-msg" role="alert">
            <AlertCircle size={13} aria-hidden="true" />
            {fieldErrors.topic}
          </span>
        )}
      </label>

      <label className="form-field-label">
        <span className="field-label-text">Budget range</span>
        <div className="select-wrap">
          <select
            name="budget"
            defaultValue="Still exploring"
            required
            className="form-select"
          >
            {budgetRanges.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span className="select-chevron" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </div>
      </label>

      <label className="form-field-label">
        <span className="field-label-text">Project details</span>
        <textarea
          defaultValue={initialBrief.slice(0, 1200)}
          name="brief"
          placeholder="Who is it for, and what should it help them do?"
          minLength={12}
          maxLength={3000}
          rows={4}
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

      {/* Honeypot field */}
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <p className="form-helper-text">
        Your details are used strictly to reply to this project inquiry.
      </p>

      {error && (
        <div className="form-inline-alert" role="alert">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <button
        id="send-brief-btn"
        className={`hd-btn-primary send-brief-btn cta-magnetic ${busy ? 'is-loading' : ''}`}
        disabled={busy}
        aria-busy={busy}
        type="submit"
      >
        <span className="btn-label">{busy ? 'Sending brief…' : 'Send project brief'}</span>
        <span className="btn-arrow-circle" aria-hidden="true">
          <span className="btn-arrow-track">
            <span className="btn-arrow-icon btn-arrow-primary">
              <ArrowUpRight size={15} />
            </span>
            <span className="btn-arrow-icon btn-arrow-clone">
              <ArrowUpRight size={15} />
            </span>
          </span>
        </span>
        <span className="btn-spinner" aria-hidden="true" />
      </button>
    </form>
  );
}
