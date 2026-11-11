'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { showToast } from './ToastManager';

export default function FooterSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const lock = useRef(false);
  const startedAt = useRef('');
  useEffect(() => {
    startedAt.current = String(Date.now());
  }, []);
  const honeypot = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lock.current || !email.trim()) return;
    lock.current = true;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), startedAt: startedAt.current, website: honeypot.current?.value || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to subscribe.');
      }
      setStatus('success');
      setEmail('');
      showToast({
        type: 'success',
        title: 'Subscribed',
        message: "You're subscribed to the engineering dispatch.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not subscribe. Please try again.';
      setStatus('error');
      setErrorMsg(msg);
      showToast({
        type: 'error',
        title: 'Subscription issue',
        message: msg,
      });
    } finally {
      lock.current = false;
    }
  };

  return (
    <div className="footer-subscribe-wrapper">
      <div className="footer-subscribe-header">
        <span className="footer-subscribe-eyebrow">Stay ahead</span>
        <h4 className="footer-subscribe-title">Engineering & Security dispatch</h4>
        <p className="footer-subscribe-desc">
          Architecture notes, security teardowns, and digital craft from Hash Decode.
        </p>
      </div>

      {status === 'success' ? (
        <div className="footer-subscribe-success" role="status">
          <Check size={18} style={{ color: 'var(--highlight)' }} />
          <span>You&apos;re subscribed. We&apos;ll keep you posted.</span>
        </div>
      ) : (
        <form className="footer-subscribe-form" onSubmit={handleSubmit} aria-busy={status === 'loading'}>
          <label className="honeypot" aria-hidden="true">Website<input ref={honeypot} tabIndex={-1} autoComplete="off"/></label>
          <div className="footer-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              aria-label="Email address for subscription"
              className="footer-subscribe-input"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="footer-subscribe-btn"
              disabled={status === 'loading'}
              aria-label="Subscribe to newsletter"
            >
              {status === 'loading' ? (
                <span className="spinner-dot" />
              ) : (
                <>
                  <span>Join</span>
                  <ArrowUpRight size={15} />
                </>
              )}
            </button>
          </div>
          {status === 'error' && (
            <p className="footer-subscribe-error" role="alert">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

