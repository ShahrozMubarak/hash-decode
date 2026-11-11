'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
type Row = Record<string, unknown>;
type View = 'overview' | 'inquiries' | 'projects' | 'posts' | 'founders' | 'subscribers' | 'settings' | 'security';
const views: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'O' }, { id: 'inquiries', label: 'Inbox', icon: 'I' }, { id: 'projects', label: 'Projects', icon: 'P' }, { id: 'posts', label: 'Blog', icon: 'B' }, { id: 'founders', label: 'Team', icon: 'T' }, { id: 'subscribers', label: 'Subscribers', icon: 'S' }, { id: 'settings', label: 'Settings', icon: 'C' }, { id: 'security', label: 'Security', icon: 'A' },
];
const blank: Record<string, Row> = {
  projects: { slug: '', title: '', category: '', summary: '', challenge: '', solution: '', tech: '', result: '', url: '', image: '', art: 'grid', status: 'draft', position: 0, kind: 'Studio concept' },
  founders: { id: '', name: '', role: '', bio: '', image: '', url: '', skills: [], quote: '', position: 0, status: 'draft' },
  posts: { id: '', title: '', label: '', body: '', url: '', image: '', status: 'draft', publishAt: null },
  settings: { intro: '', about: '', contactEmail: '', availability: 'Unavailable', whatsapp: '', booking: '' },
};
const labels: Record<string, string> = { id: 'Address', slug: 'Address', tech: 'Technology', url: 'Website URL', image: 'Image URL', bio: 'Biography', body: 'Article text', label: 'Tag', publishAt: 'Publish date (ISO, optional)', contactEmail: 'Contact email', art: 'Cover illustration', kind: 'Project type' };
const options: Record<string, string[]> = { status: ['draft', 'published'], kind: ['Studio concept', 'Client project'], art: ['grid', 'orbit', 'relay'], availability: ['Taking new projects', 'Limited availability', 'Unavailable'] };
const string = (v: unknown) => String(v ?? '');
function date(v: unknown) { return v ? new Date(String(v)).toLocaleString() : ''; }
export default function OwnerDashboard() {
  const [view, setView] = useState<View>('overview'), [data, setData] = useState<Row>({}), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [notice, setNotice] = useState('');
  const [editor, setEditor] = useState<Row | null>(null), [isNew, setIsNew] = useState(false), [dirty, setDirty] = useState(false), [search, setSearch] = useState(''), [page, setPage] = useState(1);
  const [rail, setRail] = useState(false), [drawer, setDrawer] = useState(false), [codes, setCodes] = useState<string[]>([]);
  const csrf = useRef('');
  useEffect(() => { try { setRail(localStorage.getItem('hd-admin-rail') === '1'); } catch {} }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const session = await fetch('/api/session', { cache: 'no-store' });
      if (session.status === 401) { window.location.replace('/admin'); return; }
      const sessionBody = await session.json();
      if (!session.ok) throw Error(sessionBody.error?.message || 'Session unavailable.');
      csrf.current = sessionBody.data.csrf;
      const response = await fetch(`/api/admin?view=${view}&page=${page}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw Error(result.error?.message || 'Unable to load this view.');
      setData(result.data);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to load.'); }
    finally { setLoading(false); }
  }, [view, page]);
  useEffect(() => { void load(); }, [load]);
  async function action(body: Row, endpoint = '/api/admin'): Promise<Row> {
    setBusy(true); setNotice('');
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf.current }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error?.message || 'The change could not be saved.');
      return result.data as Row;
    } finally { setBusy(false); }
  }
  async function perform(body: Row) {
    try { const result = await action(body); setNotice(result.emailStatus ? `Email: ${result.emailStatus}. ${result.emailError || result.providerId || ''}` : 'Saved.'); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to save.'); }
  }
  function navigate(next: View) {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    setView(next); setEditor(null); setDirty(false); setSearch(''); setNotice(''); setPage(1); setDrawer(false); setData({}); setCodes([]);
  }
  function edit(row: Row, create = false) {
    const template = blank[view];
    setEditor(Object.fromEntries(Object.entries(template).map(([key, fallback]) => [key, row[key] ?? fallback])));
    setIsNew(create); setDirty(false);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!editor) return;
    try {
      const payload = { ...editor };
      if ('position' in payload) payload.position = Number(payload.position);
      if ('skills' in payload && typeof payload.skills === 'string') payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
      if ('publishAt' in payload) payload.publishAt = payload.publishAt ? new Date(String(payload.publishAt)).toISOString() : null;
      await action(view === 'settings' ? { action: 'settings', data: payload } : { action: 'save', collection: view, data: payload, isNew });
      setDirty(false); setEditor(null); setNotice('Your changes are saved.'); await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to save.'); }
  }
  async function logout(all = false) {
    try { await action({ action: all ? 'logoutAll' : 'logout' }, '/api/session'); window.location.replace('/admin'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Sign-out failed.'); }
  }
  async function download() {
    try {
      const result = await action({ action: 'export' });
      const url = URL.createObjectURL(new Blob([string(result.csv)], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'hashdecode-inquiries.csv'; link.click(); URL.revokeObjectURL(url);
      setNotice('Export downloaded. Limited to 5,000 records.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Export failed.'); }
  }
  const rows = ((data.rows as Row[] | undefined) || []).filter(row => [row.title, row.name, row.email, row.status].some(value => string(value).toLowerCase().includes(search.toLowerCase())));
  return <div className={`owner-workspace ${rail ? 'owner-rail' : ''}`}>
    <aside className={`owner-sidebar ${drawer ? 'is-open' : ''}`}><a href="/" className="owner-brand">{rail ? 'HD' : 'Hash Decode'}</a><p className="owner-sidebar-label">Owner workspace</p><nav aria-label="Workspace">{views.map(item => <button key={item.id} aria-current={view === item.id ? 'page' : undefined} title={item.label} onClick={() => navigate(item.id)}><span aria-hidden="true">{item.icon}</span><span className="owner-nav-label">{item.label}</span></button>)}</nav><button className="owner-collapse" onClick={() => { setRail(!rail); localStorage.setItem('hd-admin-rail', !rail ? '1' : '0'); }}>{rail ? 'Expand' : 'Collapse sidebar'}</button><button onClick={() => void logout()}>Sign out</button></aside>
    <div className="owner-content"><header className="owner-topbar"><button className="owner-menu" onClick={() => setDrawer(!drawer)} aria-expanded={drawer}>Menu</button><span>Workspace / <strong>{views.find(item => item.id === view)?.label}</strong></span><a href="/" target="_blank" rel="noopener noreferrer">View site ↗</a></header>
    <div className="owner-body"><p className="eyebrow">Your studio</p><h1>{views.find(item => item.id === view)?.label}</h1>
    {notice && <div className="owner-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
    {loading ? <div className="owner-loading" role="status">Loading your workspace…</div> : <>
      {view === 'overview' && <><div className="owner-stats">{Object.entries((data.counts as Row) || {}).map(([label, value]) => <article className="owner-card" key={label}><p>{label}</p><strong>{String(value)}</strong></article>)}</div><div className="owner-columns"><section className="owner-card"><h2>Needs attention</h2>{(data.attention as Row[] || []).length ? (data.attention as Row[]).map((r, i) => <p key={i}>{string(r.name)} · {string(r.topic)}<small>Email: {string(r.emailStatus)}</small></p>) : <p>No inquiries need attention.</p>}<button onClick={() => navigate('inquiries')}>Open inbox</button></section><section className="owner-card"><h2>Recent activity</h2>{(data.activity as Row[] || []).length ? (data.activity as Row[]).map((r, i) => <p key={i}>{string(r.action).replaceAll('_', ' ')}<small>{date(r.createdAt)}</small></p>) : <p>Activity appears as you use the workspace.</p>}</section></div></>}
      {['projects', 'posts', 'founders', 'inquiries', 'subscribers'].includes(view) && <><div className="owner-tools"><input aria-label="Search this page" placeholder="Search this page…" value={search} onChange={e => setSearch(e.target.value)}/>{blank[view] && <button onClick={() => edit(blank[view], true)}>Create {view === 'posts' ? 'post' : view === 'founders' ? 'team member' : 'project'}</button>}{view === 'inquiries' && <button onClick={() => void download()}>Export CSV</button>}</div>
      <div className="owner-records">{rows.length ? rows.map((row, index) => <article className="owner-card" key={string(row.id || row.slug || row.email || index)}><div className="owner-record-heading"><h2>{string(row.title || row.name || row.email)}</h2><span className="owner-badge">{string(row.status)}</span></div>
      {view === 'inquiries' ? <><a href={`mailto:${string(row.email)}`}>{string(row.email)}</a><p>{string(row.topic)} · {string(row.budget)}</p><p className="owner-preserve">{string(row.brief)}</p><small>{date(row.createdAt)}</small><p>Email: {string(row.emailStatus || 'unknown')} {string(row.emailError)}</p><button disabled={busy} onClick={() => void perform({ action: 'resend', id: row.id })}>Resend email</button><form onSubmit={e => { e.preventDefault(); void perform({ action: 'inquiry', id: row.id, ...Object.fromEntries(new FormData(e.currentTarget)) }); }}><label>Status<select name="status" defaultValue={string(row.status)}>{['new', 'contacted', 'qualified', 'won', 'lost'].map(s => <option key={s}>{s}</option>)}</select></label><label>Internal notes<textarea name="notes" defaultValue={string(row.notes)} maxLength={4000}/></label><button disabled={busy}>Save inquiry</button></form></> : <p>{string(row.summary || row.role || row.label || date(row.createdAt))}</p>}
      {blank[view] && <button onClick={() => edit(row)}>Edit</button>}{view !== 'subscribers' && <button disabled={busy} className="owner-secondary" onClick={() => { if (window.confirm('Archive this record? It will remain in the database.')) void perform({ action: 'archive', collection: view, id: row.id || row.slug }); }}>Archive</button>}</article>) : <div className="owner-card"><h2>No records to show</h2><p>{search ? 'Try another search.' : 'Your saved records will appear here.'}</p></div>}</div>
      <div className="owner-tools"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} · {string(data.total)} records</span><button disabled={page * 50 >= Number(data.total || 0)} onClick={() => setPage(page + 1)}>Next</button></div></>}
      {view === 'settings' && <section className="owner-card"><h2>Site and email</h2><p>Email configured: {data.emailConfigured ? 'Yes' : 'No — add the required environment variables in DEPLOY.md.'}</p><button onClick={() => edit((data.site as Row) || blank.settings)}>Edit site settings</button><button disabled={busy} onClick={() => void perform({ action: 'testEmail' })}>Send test email</button><button onClick={async () => { try { const r = await fetch('/api/admin?view=health', { cache: 'no-store' }); const j = await r.json(); if (!r.ok) throw Error(j.error?.message); setNotice(`Database: ${j.data.database}; connected: ${j.data.connected}. Counts: ${JSON.stringify(j.data.counts)}`); } catch { setNotice('Health check failed.'); } }}>Check connection</button></section>}
      {view === 'security' && <><section className="owner-card"><h2>Two-factor authentication is required</h2><p>Verify a fresh code before exporting data, changing your password or replacing recovery codes. Verification lasts five minutes.</p><form onSubmit={e => { e.preventDefault(); void perform({ action: 'reauth', ...Object.fromEntries(new FormData(e.currentTarget)) }); }}><label>Fresh authenticator code<input name="code" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6}/></label><button disabled={busy}>Verify code</button></form><form onSubmit={async e => { e.preventDefault(); try { await action({ action: 'password', ...Object.fromEntries(new FormData(e.currentTarget)) }); window.location.replace('/admin'); } catch (error) { setNotice(error instanceof Error ? error.message : 'Password change failed.'); } }}><label>New password<input name="password" type="password" autoComplete="new-password" minLength={14} maxLength={256} required/></label><button disabled={busy}>Change password and sign out</button></form><button disabled={busy} onClick={async () => { try { const result = await action({ action: 'recovery' }); setCodes(result.codes as string[]); } catch (error) { setNotice(error instanceof Error ? error.message : 'Recovery update failed.'); } }}>Replace recovery codes</button>{codes.length > 0 && <div role="status"><p>Save these codes now. Each works once; previous codes are invalid.</p><pre>{codes.join('\n')}</pre><button onClick={() => setCodes([])}>I saved them</button></div>}</section>
      <section className="owner-card"><h2>Active sessions</h2>{(data.sessions as Row[] || []).map(row => <div key={string(row.tokenHash)}><p>{row.current ? 'This session' : 'Owner session'} · Last active {date(row.lastSeenAt)}</p><button disabled={busy} onClick={() => void perform({ action: 'revokeSession', tokenHash: row.tokenHash })}>Revoke</button></div>)}<button onClick={() => void logout(true)}>Sign out everywhere</button></section><section className="owner-card"><h2>Audit log</h2>{(data.logs as Row[] || []).map((row, i) => <p key={i}>{string(row.action).replaceAll('_', ' ')} · {string(row.target)}<small>{date(row.createdAt)} · Request {string(row.requestId)}</small></p>)}</section></>}
      {editor && <section className="owner-card owner-editor" aria-label="Record editor"><h2>{isNew ? 'Create record' : 'Edit record'}</h2><form onSubmit={save}>{Object.entries(editor).map(([key, value]) => <label key={key}>{labels[key] || key[0].toUpperCase() + key.slice(1)}{options[key] ? <select value={string(value)} onChange={e => { setEditor({ ...editor, [key]: e.target.value }); setDirty(true); }}>{options[key].map(option => <option key={option}>{option}</option>)}</select> : ['body', 'bio', 'about', 'brief', 'summary', 'challenge', 'solution', 'result'].includes(key) ? <textarea value={string(value)} rows={key === 'body' ? 16 : 4} onChange={e => { setEditor({ ...editor, [key]: e.target.value }); setDirty(true); }}/> : <input type={key === 'position' ? 'number' : 'text'} value={Array.isArray(value) ? value.join(', ') : string(value)} disabled={!isNew && (key === 'id' || key === 'slug')} onChange={e => { setEditor({ ...editor, [key]: e.target.value }); setDirty(true); }}/>}</label>)}<p>{view === 'posts' ? 'Article text renders safely as text blocks and fenced code. Use draft until ready. A future publish date delays public visibility.' : 'Image URLs must point to raster images. Leave the team image blank to use initials.'}</p><button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button><button type="button" className="owner-secondary" onClick={() => { if (!dirty || window.confirm('Discard unsaved changes?')) { setEditor(null); setDirty(false); } }}>Cancel</button></form></section>}
      <button className="owner-secondary" onClick={() => void load()}>Refresh view</button>
    </>}
    </div></div>
  </div>;
}
