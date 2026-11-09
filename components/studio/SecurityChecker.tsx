'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowUpRight,
  Globe,
  RotateCcw,
  Loader2,
  Info,
} from 'lucide-react';

type Scan = {
  host: string;
  grade: string;
  score: number;
  passed: number;
  failed: number;
  total: number;
  at: string;
  report: string;
};

type ScanState = 'idle' | 'running' | 'done' | 'error';

function getGradeBadgeStyle(grade: string) {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) {
    return { bg: '#ecfdf5', text: '#059669', border: 'rgba(5, 150, 105, 0.25)' };
  }
  if (g.startsWith('B')) {
    return { bg: '#eff6ff', text: '#1e40af', border: 'rgba(30, 64, 175, 0.25)' };
  }
  if (g.startsWith('C') || g.startsWith('D')) {
    return { bg: '#fffbeb', text: '#d97706', border: 'rgba(217, 119, 6, 0.25)' };
  }
  return { bg: '#fef2f2', text: '#dc2626', border: 'rgba(220, 38, 38, 0.25)' };
}

export default function SecurityChecker() {
  const [status, setStatus] = useState<ScanState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<Scan | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'running') return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const domainInput = String(formData.get('url') || '').trim();
    const authorized = formData.get('authorized') === 'on';

    if (!domainInput) return;

    setStatus('running');
    setErrorMsg('');
    setResult(null);

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        signal: AbortSignal.timeout(22000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: domainInput,
          authorized,
        }),
      });

      const data = (await response.json()) as Scan & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'The security scan could not be completed.');
      }

      setResult(data);
      setStatus('done');
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'The scan could not finish. Verify the public domain is online or try again later.';
      setErrorMsg(message);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMsg('');
    setResult(null);
  };

  return (
    <div className="checker-container">
      <div className="checker-split-grid">
        {/* Left Column: Form Panel */}
        <div className="checker-form-card hd-card" data-reveal="fade">
          <div className="card-glare" aria-hidden="true" />
          <div className="checker-card-head">
            <span className="section-rule-label">Public domain inspection</span>
            <h2 className="checker-card-heading">HTTP security posture</h2>
            <p className="checker-card-desc">
              Audit the HTTP security headers and transport protections of any public website using Mozilla HTTP Observatory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="checker-form-body">
            <div className="checker-input-group">
              <label htmlFor="target-domain" className="checker-label">
                Website domain
              </label>
              <div className="checker-input-wrap">
                <Globe size={18} className="input-prefix-icon" aria-hidden="true" />
                <input
                  id="target-domain"
                  name="url"
                  type="text"
                  placeholder="yourcompany.com"
                  required
                  maxLength={2048}
                  disabled={status === 'running'}
                  className="checker-text-input"
                />
              </div>
            </div>

            <div className="checker-check-group">
              <label className="checker-checkbox-label">
                <input
                  type="checkbox"
                  name="authorized"
                  required
                  disabled={status === 'running'}
                  className="checker-checkbox-input"
                />
                <span className="checker-checkbox-text">
                  I own this public site or have explicit permission to check it.
                </span>
              </label>
            </div>

            <div className="checker-disclaimer-box">
              <Info size={16} className="disclaimer-icon" aria-hidden="true" />
              <p className="disclaimer-text">
                Only the hostname is transmitted to Mozilla HTTP Observatory. Scan results are public and may be cached.
              </p>
            </div>

            <div className="checker-form-actions">
              <button
                type="submit"
                disabled={status === 'running'}
                className="hd-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {status === 'running' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span className="btn-label">Analyzing headers...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-label">Run free check</span>
                    <span className="btn-arrow-circle" aria-hidden="true">
                      <ArrowUpRight size={15} />
                    </span>
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <div className="checker-error-box" role="alert">
                <AlertTriangle size={18} className="error-icon" aria-hidden="true" />
                <div className="error-content">
                  <strong>Scan failed</strong>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Dynamic Status & Results */}
        <div className="checker-results-card hd-card" data-reveal="fade" aria-live="polite">
          <div className="card-glare" aria-hidden="true" />

          {/* STATE: IDLE */}
          {status === 'idle' && (
            <div className="checker-state-idle">
              <div className="status-badge-item is-neutral">
                <span>Checklist coverage</span>
              </div>
              <h3 className="result-headline-title">What this scan audits</h3>
              <p className="result-headline-lead">
                A browser-security audit covering essential HTTP headers and transport safeguards:
              </p>

              <ul className="audit-checklist-items">
                <li className="audit-item">
                  <CheckCircle2 size={16} className="item-icon-pass" aria-hidden="true" />
                  <div>
                    <strong>Content-Security-Policy (CSP)</strong>
                    <p>Prevents cross-site scripting (XSS) and malicious code injection.</p>
                  </div>
                </li>
                <li className="audit-item">
                  <CheckCircle2 size={16} className="item-icon-pass" aria-hidden="true" />
                  <div>
                    <strong>Strict-Transport-Security (HSTS)</strong>
                    <p>Enforces encrypted TLS communication and prevents downgrade attacks.</p>
                  </div>
                </li>
                <li className="audit-item">
                  <CheckCircle2 size={16} className="item-icon-pass" aria-hidden="true" />
                  <div>
                    <strong>X-Frame-Options & Clickjacking</strong>
                    <p>Blocks framing to protect users against unauthorized clickjacking.</p>
                  </div>
                </li>
                <li className="audit-item">
                  <CheckCircle2 size={16} className="item-icon-pass" aria-hidden="true" />
                  <div>
                    <strong>Referrer-Policy & MIME Sniffing</strong>
                    <p>Guards user privacy in HTTP referrers and blocks content sniffing.</p>
                  </div>
                </li>
              </ul>

              <div className="audit-scope-note">
                <p>
                  <strong>Note:</strong> Application authorization flaws, API vulnerabilities, and database injection
                  require a manual penetration audit.
                </p>
              </div>
            </div>
          )}

          {/* STATE: RUNNING */}
          {status === 'running' && (
            <div className="checker-state-running">
              <div className="status-badge-item is-running">
                <span className="pulsing-dot" />
                <span>Request in progress</span>
              </div>
              <h3 className="result-headline-title">Querying Observatory</h3>
              <p className="result-headline-lead">
                Fetching fresh HTTP response headers from Mozilla HTTP Observatory. This typically finishes in 5 to 15 seconds.
              </p>
              <div className="running-activity-indicator" aria-hidden="true">
                <div className="activity-spinner" />
                <span>Waiting for response from external scanner...</span>
              </div>
            </div>
          )}

          {/* STATE: DONE */}
          {status === 'done' && result && (
            <div className="checker-state-done">
              <div className="done-top-row">
                <div className="status-badge-item is-success">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  <span>Scan complete</span>
                </div>
                <span className="result-scanned-date">
                  {result.at ? `Scanned ${new Date(result.at).toLocaleDateString()}` : 'Live scan'}
                </span>
              </div>

              <div className="done-target-host">
                <span className="section-rule-label">Audited Hostname</span>
                <h3 className="scanned-domain-name">{result.host}</h3>
              </div>

              {/* Grade Callout */}
              {(() => {
                const badgeStyle = getGradeBadgeStyle(result.grade);
                return (
                  <div
                    className="grade-display-card"
                    style={{
                      backgroundColor: badgeStyle.bg,
                      borderColor: badgeStyle.border,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <div className="grade-badge-circle" style={{ color: badgeStyle.text }}>
                      <span className="grade-letter">{result.grade}</span>
                    </div>
                    <div className="grade-info-text">
                      <span className="grade-label" style={{ color: badgeStyle.text }}>
                        Observatory Grade
                      </span>
                      <strong className="grade-heading" style={{ color: badgeStyle.text }}>
                        Overall Score: {result.score} / 100
                      </strong>
                    </div>
                  </div>
                );
              })()}

              {/* Status Badges Metrics Grid */}
              <div className="done-metrics-grid">
                <div className="metric-badge-box is-passed">
                  <CheckCircle2 size={18} className="badge-icon" aria-hidden="true" />
                  <div className="metric-badge-text">
                    <span className="badge-metric-value">{result.passed}</span>
                    <span className="badge-metric-label">Tests passed</span>
                  </div>
                </div>

                <div className="metric-badge-box is-failed">
                  <XCircle size={18} className="badge-icon" aria-hidden="true" />
                  <div className="metric-badge-text">
                    <span className="badge-metric-value">{result.failed}</span>
                    <span className="badge-metric-label">Tests failed</span>
                  </div>
                </div>

                <div className="metric-badge-box is-total">
                  <ShieldCheck size={18} className="badge-icon" aria-hidden="true" />
                  <div className="metric-badge-text">
                    <span className="badge-metric-value">{result.total}</span>
                    <span className="badge-metric-label">Total checks</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="done-actions-row">
                <a
                  href={result.report}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hd-btn-secondary"
                >
                  <span>Test-by-test report</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>

                <a className="hd-btn-primary" href="/contact?type=Security%20audit">
                  <span className="btn-label">Request scoped audit</span>
                  <span className="btn-arrow-circle" aria-hidden="true">
                    <ArrowUpRight size={15} />
                  </span>
                </a>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="checker-reset-btn"
                  onClick={handleReset}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>Audit another domain</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE: ERROR */}
          {status === 'error' && (
            <div className="checker-state-error">
              <div className="status-badge-item is-failed">
                <AlertTriangle size={13} aria-hidden="true" />
                <span>Unable to scan</span>
              </div>
              <h3 className="result-headline-title">Analysis incomplete</h3>
              <p className="result-headline-lead">
                {errorMsg || 'The scan could not finish. Check the domain and try again.'}
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="hd-btn-secondary"
                  onClick={handleReset}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  <span>Try another domain</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

