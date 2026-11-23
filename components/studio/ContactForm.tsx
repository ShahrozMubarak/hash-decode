'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  AlertCircle,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { showToast } from './ToastManager';

export const scopeOptions = [
  'Web Platform',
  'Custom Software',
  'Security Review',
  'Architecture & Cloud',
];

export const budgetOptions = [
  '< 1.5M PKR ($5k)',
  '1.5M – 4M PKR ($5k–$15k)',
  '4M+ PKR ($15k+)',
  'Flexible',
];

interface ContactFormProps {
  initial?: string;
  initialBrief?: string;
}

export default function ContactForm({ initial = '', initialBrief = '' }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  // Progressive disclosure: Stage 1 = Email only; Stage 2 = full form
  const [isExpanded, setIsExpanded] = useState<boolean>(Boolean(initial || initialBrief));
  const [emailValue, setEmailValue] = useState<string>('');

  // Form state
  const [selectedScope, setSelectedScope] = useState<string>(
    scopeOptions.find((s) => s.toLowerCase().includes(initial.toLowerCase())) || scopeOptions[0]
  );
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
      return 'Please enter your name.';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid work email address.';
      }
    }
    if (name === 'brief' && value.trim().length < 10) {
      return 'Please provide a little detail about your project (at least 10 characters).';
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

  const handleContinue = () => {
    const emailErr = validateField('email', emailValue, true);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      triggerShake();
      emailInputRef.current?.focus();
      return;
    }
    setFieldErrors((prev) => ({ ...prev, email: '' }));
    setIsExpanded(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 180);
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
              stroke="#000000"
              strokeWidth="2.5"
            />
            <path
              className="success-check-path"
              fill="none"
              stroke="#000000"
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
          Your inquiry is in our studio inbox. A senior architect will review your requirements and follow up within 24 hours.
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

        // If not yet expanded to stage 2, treat submit as continue
        if (!isExpanded) {
          handleContinue();
          return;
        }

        if (lock.current) return;

        const form = event.currentTarget;
        const formData = new FormData(form);
        const nameVal = String(formData.get('name') || '').trim();
        const emailVal = emailValue.trim() || String(formData.get('email') || '').trim();
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

        const fullBrief = [
          briefRaw,
          `Service: ${selectedScope}`,
          `Budget: ${selectedBudget}`,
          `Mutual NDA: ${ndaChecked ? 'Yes' : 'No'}`,
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
              timeline: 'Flexible',
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
          const msg = 'We could not reach the server right now. You can retry or email hashdecodeofficial@gmail.com directly.';
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
      <div className="simple-form-head">
        <h3 className="simple-form-title">Start a project</h3>
        <p className="simple-form-sub">
          {isExpanded
            ? 'Complete your project specifications below. A senior architect will review and respond within 24 hours.'
            : 'Enter your work email to get started. We will review your project needs and respond within 24 hours.'}
        </p>
      </div>

      {/* Stage 1: Work Email input (Always visible) */}
      <div className="stage-email-wrap">
        <label className="simple-field-label">
          <span className="simple-field-name">Work Email *</span>
          <div className="progressive-email-input-group">
            <input
              ref={emailInputRef}
              name="email"
              type="email"
              value={emailValue}
              onChange={(e) => {
                setEmailValue(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isExpanded) {
                  e.preventDefault();
                  handleContinue();
                }
              }}
              autoComplete="email"
              placeholder="alex@company.com"
              maxLength={254}
              required
              className={`form-input progressive-email-input ${fieldErrors.email ? 'is-invalid' : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              onBlur={handleBlur}
            />
            {!isExpanded && (
              <button
                type="button"
                className="hd-btn-primary progressive-continue-btn"
                onClick={handleContinue}
              >
                <span>Continue</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          {fieldErrors.email && (
            <span id="email-error" className="field-error-msg" role="alert">
              <AlertCircle size={13} aria-hidden="true" />
              {fieldErrors.email}
            </span>
          )}
        </label>
      </div>

      {/* Stage 2: Smooth CSS Grid 0fr -> 1fr height expansion */}
      <div className={`progressive-fields-container ${isExpanded ? 'is-expanded' : ''}`}>
        <div className="progressive-fields-inner">
          {/* Your Name */}
          <label className="simple-field-label">
            <span className="simple-field-name">Your Name *</span>
            <input
              ref={nameInputRef}
              name="name"
              autoComplete="name"
              placeholder="e.g. Alex Sterling"
              minLength={2}
              maxLength={100}
              required={isExpanded}
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

          {/* Service Needed */}
          <div className="simple-field-group">
            <span className="simple-field-name">Service Needed</span>
            <div className="simple-pills-row" role="radiogroup" aria-label="Service Selection">
              {scopeOptions.map((opt) => {
                const isSelected = selectedScope === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`simple-pill-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedScope(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div className="simple-field-group">
            <span className="simple-field-name">Approximate Budget</span>
            <div className="simple-pills-row" role="radiogroup" aria-label="Budget Selection">
              {budgetOptions.map((b) => {
                const isSelected = selectedBudget === b;
                return (
                  <button
                    key={b}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`simple-pill-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedBudget(b)}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Details */}
          <div className="simple-field-group">
            <label className="simple-field-label">
              <span className="simple-field-name">Project Details *</span>
              <textarea
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                name="brief"
                placeholder="Tell us what you're building, key goals, timeline, or any technical requirements..."
                minLength={10}
                maxLength={3000}
                rows={3}
                required={isExpanded}
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
          </div>

          {/* NDA Checkbox */}
          <label className="simple-checkbox-label">
            <input
              type="checkbox"
              checked={ndaChecked}
              onChange={(e) => setNdaChecked(e.target.checked)}
              className="simple-checkbox-input"
            />
            <span className="simple-checkbox-text">
              <ShieldCheck size={14} className="simple-shield-icon" aria-hidden="true" />
              <span>Require mutual NDA prior to technical discussion</span>
            </span>
          </label>

          {/* Honeypot field */}
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>

          {error && (
            <div className="form-inline-alert" role="alert" style={{ marginTop: '0.5rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button & SLA */}
          <div className="form-submit-row">
            <button
              id="send-brief-btn"
              className={`hd-btn-primary send-brief-btn ${busy ? 'is-loading' : ''}`}
              disabled={busy}
              aria-busy={busy}
              type="submit"
            >
              <span className="btn-label">{busy ? 'Sending brief…' : 'Send project brief'}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="btn-spinner" aria-hidden="true" />
            </button>

            <span className="form-sla-guarantee">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Direct response from senior architects within 24 hours</span>
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
