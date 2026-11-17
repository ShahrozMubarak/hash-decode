'use client';
import { useState, type FormEvent } from 'react';
export default function OwnerSession() {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', ...fields }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error?.message || 'Sign-in failed.');
      // Remove tokens stored by the previous release; current credentials are cookie-only.
      localStorage.removeItem('hashdecode_owner_session');
      window.location.replace('/shahroz');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Sign-in unavailable.'); }
    finally { setBusy(false); }
  }
  return <div className="owner-login"><a href="/" className="owner-brand">Hash Decode</a><p className="eyebrow">Owner workspace</p><h1>Welcome back.</h1><p>Sign in with your owner password.</p><form onSubmit={submit}>
    <label>Email<input name="email" type="email" autoComplete="username" required maxLength={254}/></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label>
    {message && <p role="alert" className="owner-notice">{message}</p>}
    <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
  </form><p className="owner-help">Sign in to manage inquiries, projects, and site settings.</p></div>;
}
