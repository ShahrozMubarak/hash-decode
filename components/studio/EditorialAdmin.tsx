'use client';
import { useState, useRef } from 'react';
import type { Entry } from '@/lib/cms';
import { OwnerChat } from './Chat';

type Links = { whatsapp: string; booking: string };
const sections = [
  ['post', 'Journal'],
  ['team', 'Team'],
  ['review', 'Reviews'],
  ['connections', 'Contact links'],
  ['chat', 'Live chat'],
];

export default function EditorialAdmin({ initial, links }: { initial: Entry[]; links: Links }) {
  const pending = useRef(false);
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState('post');
  const [draft, setDraft] = useState<Entry | null>(null);
  const [fresh, setFresh] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [connect, setConnect] = useState(links);

  const set = (k: keyof Entry, v: string) => setDraft((p) => (p ? { ...p, [k]: v } : null));

  const save = async (data: object, done: () => void) => {
    if (pending.current) return;
    pending.current = true;
    setNotice('');
    setBusy(true);
    try {
      const r = await fetch('/api/admin', {
        method: 'POST',
        signal: AbortSignal.timeout(14000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (r.status === 401 || r.status === 403) {
        window.dispatchEvent(new Event('hd:session-expired'));
        throw Error('Session ended');
      }
      const x = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !x.ok) throw Error(x.error || 'Unable to save.');
      done();
      setNotice('Changes saved.');
    } catch (err: any) {
      setNotice(err?.message || 'Could not save the change. Check your connection and retry.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  return (
    <section className="editorial-admin">
      <p className="eyebrow">Workspace / publishing</p>
      <h2>Content desk</h2>
      <div className="tabs">
        {sections.map(([k, l]) => (
          <button
            key={k}
            disabled={busy}
            aria-pressed={k === tab}
            onClick={() => {
              setTab(k);
              setDraft(null);
              setNotice('');
              setConfirm(false);
            }}
          >
            {l}
          </button>
        ))}
      </div>
      {notice && (
        <p className="save-notice" role="status">
          {notice}
        </p>
      )}
      {tab === 'chat' ? (
        <OwnerChat />
      ) : tab === 'connections' ? (
        <form
          className="form-panel editor"
          onSubmit={(e) => {
            e.preventDefault();
            save({ action: 'connections', ...connect }, () => {});
          }}
        >
          <label>
            Public WhatsApp number, including country code
            <input
              value={connect.whatsapp}
              maxLength={18}
              onChange={(e) => setConnect({ ...connect, whatsapp: e.target.value })}
            />
          </label>
          <label>
            15-minute Calendly or Cal.com booking URL
            <input
              type="url"
              value={connect.booking}
              onChange={(e) => setConnect({ ...connect, booking: e.target.value })}
            />
          </label>
          <button className="cta" disabled={busy}>
            Save contact links
          </button>
        </form>
      ) : draft ? (
        <form
          className="form-panel editor"
          onSubmit={(e) => {
            e.preventDefault();
            save({ ...draft, action: 'contentSave', isNew: fresh }, () => {
              setItems([...items.filter((x) => x.id !== draft.id), { ...draft, updated: Date.now() }]);
              setDraft(null);
            });
          }}
        >
          <div className="admin-bar">
            <h3>
              {fresh ? 'Add' : 'Edit'}{' '}
              {tab === 'post' ? 'article' : tab === 'team' ? 'team member' : 'review'}
            </h3>
            <button type="button" onClick={() => setDraft(null)} disabled={busy}>
              Close ×
            </button>
          </div>
          <label>
            {tab === 'post' ? 'Article title' : tab === 'team' ? 'Member name' : 'Reviewer name'}
            <input
              value={draft.title}
              required
              minLength={2}
              maxLength={100}
              onChange={(e) => set('title', e.target.value)}
            />
          </label>
          <label>
            Unique address
            <input
              value={draft.id}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="unique-entry-name"
              disabled={!fresh}
              onChange={(e) => set('id', e.target.value)}
            />
          </label>
          <label>
            {tab === 'post' ? 'Category' : tab === 'team' ? 'Role' : 'Client role / platform'}
            <input
              required
              minLength={2}
              maxLength={120}
              value={draft.label}
              onChange={(e) => set('label', e.target.value)}
            />
          </label>
          <label>
            {tab === 'post'
              ? 'Article (separate paragraphs with a blank line)'
              : tab === 'team'
              ? 'Bio and skills'
              : 'Quoted review, with permission'}
            <textarea
              value={draft.body}
              required
              minLength={8}
              maxLength={7000}
              rows={8}
              onChange={(e) => set('body', e.target.value)}
            />
          </label>
          <label>
            {tab === 'team' ? 'Real portrait URL' : 'Image URL (optional)'}
            <input type="url" value={draft.image} onChange={(e) => set('image', e.target.value)} />
          </label>
          <label>
            {tab === 'review' ? 'Original review URL' : 'Source or profile URL (optional)'}
            <input type="url" value={draft.url} onChange={(e) => set('url', e.target.value)} />
          </label>
          <label>
            Visibility
            <select value={draft.status} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <div className="actions">
            <button className="cta" disabled={busy}>
              Save entry
            </button>
            {!fresh && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!confirm) return setConfirm(true);
                  save({ action: 'contentRemove', id: draft.id }, () => {
                    setItems(items.filter((x) => x.id !== draft.id));
                    setDraft(null);
                  });
                }}
              >
                {confirm ? 'Confirm deletion' : 'Delete entry'}
              </button>
            )}
          </div>
        </form>
      ) : (
        <>
          <div className="admin-bar">
            <span>{items.filter((x) => x.kind === tab).length} entries</span>
            <button
              className="cta"
              onClick={() => {
                setFresh(true);
                setConfirm(false);
                setDraft({
                  id: '',
                  kind: tab,
                  title: '',
                  label: '',
                  body: '',
                  url: '',
                  image: '',
                  status: 'draft',
                  updated: 0,
                });
              }}
            >
              Add entry +
            </button>
          </div>
          {items
            .filter((x) => x.kind === tab)
            .map((x) => (
              <div className="admin-item" key={x.id}>
                <div>
                  <small className="eyebrow">
                    {x.label} / {x.status}
                  </small>
                  <h3>{x.title}</h3>
                </div>
                <button
                  className="outline"
                  onClick={() => {
                    setDraft(x);
                    setFresh(false);
                    setConfirm(false);
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          {!items.some((x) => x.kind === tab) && (
            <p className="empty-state">
              Add an entry when you have approved content ready to publish.
            </p>
          )}
        </>
      )}
    </section>
  );
}
