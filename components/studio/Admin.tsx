'use client';
import { useState, useRef } from 'react';
import type { Project, Founder } from '@/lib/studio-data';
import { Upload, ArrowUpRight } from 'lucide-react';

type Message = {
  id: string;
  name: string;
  email: string;
  topic: string;
  brief: string;
  status: string;
  created: number;
  budget: string;
  mail: string;
  notes?: string;
};

type Subscriber = {
  email: string;
  status: string;
  created: number;
};

type AuditLog = {
  id: string;
  action: string;
  actor: string;
  target: string;
  detail: string;
  ip: string;
  created: number;
};

type MongoStatus = {
  configured: boolean;
  connected: boolean;
  dbName: string;
  inquiriesCount?: number;
  projectsCount?: number;
  subscribersCount?: number;
  contentCount?: number;
  chatsCount?: number;
};

const blank = (): Project => ({
  slug: '',
  tech: '',
  result: '',
  title: '',
  category: 'Web application',
  summary: '',
  challenge: '',
  solution: '',
  url: '',
  image: '',
  art: 'grid',
  status: 'draft',
  position: 30,
  kind: 'Studio project',
});

const blankFounder = (): Founder => ({
  id: '',
  name: '',
  role: '',
  bio: '',
  image: '/team/shahroz.svg',
  url: '',
  skills: [],
  position: 10,
});

function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file.'));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(reader.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function submit(data: Record<string, unknown>): Promise<Record<string, any>> {
  const r = await fetch('/api/admin', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (r.status === 401 || r.status === 403) {
    window.dispatchEvent(new Event('hd:session-expired'));
    throw Error('Session ended');
  }
  const out = (await r.json()) as { ok?: boolean; error?: string; [k: string]: any };
  if (!r.ok || !out.ok) throw Error(out.error || 'Unable to save changes.');
  return out;
}

export default function Admin({
  initial,
  messages,
  copy,
  initialFounders = [],
  initialSubscribers = [],
  initialAuditLogs = [],
  initialMongoStatus = { configured: false, connected: false, dbName: 'hash_decode' },
}: {
  initial: Project[];
  messages: Message[];
  copy: { intro: string; about: string };
  initialFounders?: Founder[];
  initialSubscribers?: Subscriber[];
  initialAuditLogs?: AuditLog[];
  initialMongoStatus?: MongoStatus;
}) {
  const pending = useRef(false);
  const [list, setList] = useState(initial);
  const [foundersList, setFoundersList] = useState<Founder[]>(initialFounders);
  const [inbox, setInbox] = useState<Message[]>(messages);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [mongoStatus, setMongoStatus] = useState<MongoStatus>(initialMongoStatus);

  const [tab, setTab] = useState('Projects');
  const [edit, setEdit] = useState<Project | null>(null);
  const [editF, setEditF] = useState<Founder | null>(null);
  const [fresh, setFresh] = useState(false);
  const [freshF, setFreshF] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [settings, setSettings] = useState(copy);
  const [confirm, setConfirm] = useState('');
  const [confirmF, setConfirmF] = useState('');
  const [confirmInq, setConfirmInq] = useState('');

  // Inbox filters & notes
  const [inboxFilter, setInboxFilter] = useState('all');
  const [inboxSearch, setInboxSearch] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  // Subscribers state
  const [newSubEmail, setNewSubEmail] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Password rotation state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const run = async (
    data: Record<string, unknown>,
    done: (res: Record<string, any>) => void,
    customNotice = 'Changes saved.'
  ) => {
    if (pending.current) return;
    pending.current = true;
    setNotice('');
    setBusy(true);
    try {
      const res = await submit(data);
      done(res);
      setNotice(customNotice);
    } catch (e: any) {
      setNotice(e?.message || 'Could not save the change. Check the fields and retry.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  function field(key: keyof Project, v: string | number) {
    setEdit((prev) => (prev ? { ...prev, [key]: v } : null));
  }
  function fieldF(key: keyof Founder, v: string | number) {
    setEditF((prev) => (prev ? { ...prev, [key]: v } : null));
  }

  const filteredInbox = inbox.filter((m) => {
    if (inboxFilter !== 'all' && m.status !== inboxFilter) return false;
    if (!inboxSearch.trim()) return true;
    const q = inboxSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.topic.toLowerCase().includes(q) ||
      m.brief.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

  const filteredSubs = subscribers.filter((s) =>
    !subSearch.trim() ? true : s.email.toLowerCase().includes(subSearch.toLowerCase())
  );

  return (
    <div className="admin-body">
      <div className="tabs" role="group" aria-label="Admin sections">
        {['Projects', 'Founders', 'Inbox', 'Subscribers', 'Security & Sync', 'Site copy'].map((t) => (
          <button
            key={t}
            disabled={busy}
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setEdit(null);
              setEditF(null);
              setConfirm('');
              setConfirmF('');
              setConfirmInq('');
              setNotice('');
            }}
          >
            {t}
            {t === 'Inbox' ? ' · ' + inbox.filter((m) => m.status === 'new').length : ''}
            {t === 'Founders' ? ' · ' + foundersList.length : ''}
            {t === 'Subscribers' ? ' · ' + subscribers.length : ''}
          </button>
        ))}
      </div>
      {notice && (
        <p role="status" className="save-notice">
          {notice}
        </p>
      )}

      {/* PROJECTS TAB */}
      {tab === 'Projects' && !edit && (
        <>
          <div className="admin-bar">
            <div>
              <h2>Project library ({list.length})</h2>
              <small className="eyebrow">Hover to preview motion · click to edit or swap photo</small>
            </div>
            <button
              className="cta"
              onClick={() => {
                setEdit(blank());
                setFresh(true);
                setConfirm('');
              }}
            >
              Add project +
            </button>
          </div>
          {list.length > 0 && (
            <div className="admin-preview-reel-wrap">
              <div className="admin-preview-reel-header">
                <span className="eyebrow">
                  <i /> Live Motion Scroll Strip
                </span>
                <span className="reel-hint">
                  Scrolls horizontally · hover cards to preview motion &amp; zoom
                </span>
              </div>
              <div className="admin-preview-reel">
                {list.map((p) => (
                  <div
                    className="reel-item"
                    key={'reel-' + p.slug}
                    onClick={() => {
                      setEdit({ ...p });
                      setFresh(false);
                    }}
                  >
                    <div className="reel-media">
                      {p.image ? (
                        <img src={p.image} alt={p.title} />
                      ) : (
                        <div className={'reel-art art-' + p.art}>
                          <span>{p.title}</span>
                        </div>
                      )}
                      <div className="reel-overlay">
                        <ArrowUpRight size={18} />
                        <span>Edit project</span>
                      </div>
                    </div>
                    <div className="reel-caption">
                      <strong>{p.title}</strong>
                      <small>
                        {p.category} · {p.kind}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="admin-project-showcase">
            {list.map((p) => (
              <div className="admin-card-interactive" key={p.slug}>
                <div className="admin-card-media">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="admin-card-img" />
                  ) : (
                    <div className={'admin-card-art art-' + p.art}>
                      <strong>{p.title}</strong>
                    </div>
                  )}
                  <span className={'status-pill ' + p.status}>{p.status}</span>
                </div>
                <div className="admin-card-body">
                  <small className="eyebrow">
                    {p.category} · {p.kind}
                  </small>
                  <h3>{p.title}</h3>
                  <p className="admin-card-summary">{p.summary}</p>
                  <div className="admin-card-actions">
                    <button
                      className="outline"
                      onClick={() => {
                        setEdit({ ...p });
                        setFresh(false);
                        setConfirm('');
                      }}
                    >
                      Edit details
                    </button>
                    <label className="icon-upload-btn" title="Quick change photo">
                      <Upload size={14} /> Change photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setNotice('Uploading photo for ' + p.title + '…');
                            const dataUrl = await processImageFile(file);
                            await submit({ ...p, image: dataUrl, action: 'saveProject' });
                            setList((prev) =>
                              prev.map((x) => (x.slug === p.slug ? { ...x, image: dataUrl } : x))
                            );
                            setNotice('Photo updated for ' + p.title + '!');
                          } catch (err: any) {
                            setNotice(err.message || 'Could not upload photo');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Projects' && edit && (
        <form
          className="form-panel editor"
          onSubmit={(e) => {
            e.preventDefault();
            run({ ...edit, action: 'saveProject', isNew: fresh }, () => {
              setList(
                [...list.filter((p) => p.slug !== edit.slug), edit].sort(
                  (a, b) => a.position - b.position
                )
              );
              setEdit(null);
            });
          }}
        >
          <div className="admin-bar">
            <h2>{fresh ? 'New project' : 'Edit project'}</h2>
            <button type="button" disabled={busy} onClick={() => setEdit(null)}>
              Close ×
            </button>
          </div>
          <div className="form-row">
            <label>
              Project title
              <input
                required
                minLength={2}
                maxLength={90}
                value={edit.title}
                onChange={(e) => field('title', e.target.value)}
              />
            </label>
            <label>
              Address slug
              <input
                required
                disabled={!fresh}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={80}
                placeholder="my-project"
                value={edit.slug}
                onChange={(e) => field('slug', e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Category
              <input
                required
                minLength={2}
                maxLength={45}
                value={edit.category}
                onChange={(e) => field('category', e.target.value)}
              />
            </label>
            <label>
              Label
              <select value={edit.kind} onChange={(e) => field('kind', e.target.value)}>
                <option>Studio project</option>
                <option>Studio concept</option>
              </select>
            </label>
          </div>
          <label>
            Short summary
            <textarea
              required
              minLength={8}
              maxLength={240}
              value={edit.summary}
              onChange={(e) => field('summary', e.target.value)}
            />
          </label>
          {[
            ['challenge', 'The problem'],
            ['solution', 'The solution'],
            ['tech', 'Technology used'],
            ['result', 'The result'],
          ].map(([k, t]) => (
            <label key={k}>
              {t}
              <textarea
                maxLength={k === 'tech' ? 300 : k === 'result' ? 2000 : 2500}
                value={String(edit[k as keyof Project])}
                onChange={(e) => field(k as keyof Project, e.target.value)}
              />
            </label>
          ))}
          <label>
            Live website URL (optional)
            <input
              type="url"
              placeholder="https://your-project.com"
              maxLength={2048}
              value={edit.url}
              onChange={(e) => field('url', e.target.value)}
            />
          </label>

          <div className="photo-upload-group">
            <label>Project cover photo</label>
            {edit.image ? (
              <div className="admin-photo-card">
                <img src={edit.image} alt="Project cover preview" className="admin-photo-thumb" />
                <div className="admin-photo-actions">
                  <label className="cta-sm">
                    <Upload size={14} /> Change photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setNotice('Optimizing photo…');
                          const dataUrl = await processImageFile(file);
                          field('image', dataUrl);
                          setNotice('Photo ready. Remember to save.');
                        } catch (err: any) {
                          setNotice(err.message || 'Could not load photo');
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-link-danger"
                    onClick={() => field('image', '')}
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <label className="photo-dropzone">
                <Upload size={26} />
                <span>
                  <strong>Click to upload photo</strong> or drag &amp; drop
                </span>
                <small>JPEG, PNG, WebP · optimized automatically for studio speed</small>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setNotice('Optimizing photo…');
                      const dataUrl = await processImageFile(file);
                      field('image', dataUrl);
                      setNotice('Photo loaded.');
                    } catch (err: any) {
                      setNotice(err.message || 'Could not load photo');
                    }
                  }}
                />
              </label>
            )}
            <details className="photo-url-details">
              <summary>Or enter image URL</summary>
              <input
                type="url"
                placeholder="https://…/cover.jpg"
                maxLength={2048}
                value={edit.image.startsWith('data:') ? '' : edit.image}
                onChange={(e) => field('image', e.target.value)}
              />
            </details>
          </div>

          <div className="form-row">
            <label>
              Fallback cover art style
              <select value={edit.art} onChange={(e) => field('art', e.target.value)}>
                <option value="grid">Arc grid</option>
                <option value="orbit">Signal console</option>
                <option value="relay">Workflow board</option>
              </select>
            </label>
            <label>
              Display order
              <input
                type="number"
                min={0}
                max={9999}
                required
                value={edit.position}
                onChange={(e) => field('position', Number(e.target.value))}
              />
            </label>
          </div>
          <label>
            Visibility
            <select value={edit.status} onChange={(e) => field('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <div className="actions">
            <button className="cta" disabled={busy}>
              {busy ? 'Saving…' : 'Save project'}
            </button>
            {!fresh && (
              <button
                type="button"
                disabled={busy}
                className="text-link"
                onClick={() => {
                  if (confirm !== edit.slug) {
                    setConfirm(edit.slug);
                    return;
                  }
                  run({ action: 'deleteProject', slug: edit.slug }, () => {
                    setList(list.filter((p) => p.slug !== edit.slug));
                    setEdit(null);
                    setConfirm('');
                  });
                }}
              >
                {confirm === edit.slug ? 'Confirm deletion' : 'Delete project'}
              </button>
            )}
          </div>
        </form>
      )}

      {/* FOUNDERS MANAGEMENT TAB */}
      {tab === 'Founders' && !editF && (
        <>
          <div className="admin-bar">
            <div>
              <h2>Founding Team ({foundersList.length})</h2>
              <small className="eyebrow">
                Manage the 4 founders · upload photos &amp; customize roles/biographies
              </small>
            </div>
            <button
              className="cta"
              onClick={() => {
                setEditF(blankFounder());
                setFreshF(true);
                setConfirmF('');
              }}
            >
              Add founder +
            </button>
          </div>

          <div className="admin-project-showcase">
            {foundersList.map((f, i) => (
              <div className="admin-card-interactive" key={f.id || i}>
                <div
                  className="admin-card-media"
                  style={{
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                  }}
                >
                  <img
                    src={f.image}
                    alt={f.name}
                    style={{
                      maxHeight: '160px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '16px',
                    }}
                  />
                  <span className="status-pill published">Founder {i + 1}</span>
                </div>
                <div className="admin-card-body">
                  <small className="eyebrow" style={{ color: 'var(--coral)' }}>
                    {f.role}
                  </small>
                  <h3>{f.name}</h3>
                  <p className="admin-card-summary">{f.bio}</p>
                  <div className="admin-card-actions">
                    <button
                      className="outline"
                      onClick={() => {
                        setEditF({ ...f });
                        setFreshF(false);
                        setConfirmF('');
                      }}
                    >
                      Edit details
                    </button>
                    <label className="icon-upload-btn" title="Quick change portrait photo">
                      <Upload size={14} /> Change photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setNotice('Optimizing portrait photo for ' + f.name + '…');
                            const dataUrl = await processImageFile(file);
                            await submit({
                              action: 'contentSave',
                              kind: 'team',
                              id: f.id,
                              title: f.name,
                              label: f.role,
                              body: f.bio,
                              url: f.url || '',
                              image: dataUrl,
                              status: 'published',
                            });
                            setFoundersList((prev) =>
                              prev.map((x) => (x.id === f.id ? { ...x, image: dataUrl } : x))
                            );
                            setNotice('Photo updated for ' + f.name + '!');
                          } catch (err: any) {
                            setNotice(err.message || 'Could not upload photo');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Founders' && editF && (
        <form
          className="form-panel editor"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              {
                action: 'contentSave',
                kind: 'team',
                id: editF.id,
                title: editF.name,
                label: editF.role,
                body: editF.bio,
                url: editF.url || '',
                image: editF.image,
                status: 'published',
                isNew: freshF,
              },
              () => {
                setFoundersList(
                  [...foundersList.filter((x) => x.id !== editF.id), editF].sort(
                    (a, b) => a.position - b.position
                  )
                );
                setEditF(null);
              }
            );
          }}
        >
          <div className="admin-bar">
            <h2>{freshF ? 'Add founder' : 'Edit founder'}</h2>
            <button type="button" disabled={busy} onClick={() => setEditF(null)}>
              Close ×
            </button>
          </div>

          <div className="form-row">
            <label>
              Founder Name
              <input
                required
                minLength={2}
                maxLength={100}
                value={editF.name}
                onChange={(e) => fieldF('name', e.target.value)}
              />
            </label>
            <label>
              Identifier slug
              <input
                required
                disabled={!freshF}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                maxLength={80}
                placeholder="shahroz-dogar"
                value={editF.id}
                onChange={(e) => fieldF('id', e.target.value)}
              />
            </label>
          </div>

          <label>
            Role / Title (e.g. Co-Founder &amp; Lead Systems Architect)
            <input
              required
              minLength={2}
              maxLength={120}
              value={editF.role}
              onChange={(e) => fieldF('role', e.target.value)}
            />
          </label>

          <label>
            Biography &amp; Core Expertise
            <textarea
              required
              minLength={10}
              maxLength={7000}
              rows={5}
              value={editF.bio}
              onChange={(e) => fieldF('bio', e.target.value)}
            />
          </label>

          <label>
            Website or Profile URL (optional)
            <input
              type="url"
              placeholder="https://linkedin.com/in/…"
              maxLength={2048}
              value={editF.url || ''}
              onChange={(e) => fieldF('url', e.target.value)}
            />
          </label>

          <div className="photo-upload-group">
            <label>Founder Portrait Photo (Clean white background recommended)</label>
            {editF.image ? (
              <div className="admin-photo-card">
                <img
                  src={editF.image}
                  alt={editF.name}
                  className="admin-photo-thumb"
                  style={{ objectFit: 'contain', background: '#fff' }}
                />
                <div className="admin-photo-actions">
                  <label className="cta-sm">
                    <Upload size={14} /> Change portrait
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setNotice('Optimizing portrait…');
                          const dataUrl = await processImageFile(file);
                          fieldF('image', dataUrl);
                          setNotice('Portrait loaded. Remember to save.');
                        } catch (err: any) {
                          setNotice(err.message || 'Could not load photo');
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-link-danger"
                    onClick={() => fieldF('image', '/team/shahroz.svg')}
                  >
                    Reset to default
                  </button>
                </div>
              </div>
            ) : (
              <label className="photo-dropzone">
                <Upload size={26} />
                <span>
                  <strong>Click to upload portrait</strong> or drag &amp; drop
                </span>
                <small>JPEG, PNG, WebP · blends smoothly with white studio background</small>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setNotice('Optimizing portrait…');
                      const dataUrl = await processImageFile(file);
                      fieldF('image', dataUrl);
                      setNotice('Portrait loaded.');
                    } catch (err: any) {
                      setNotice(err.message || 'Could not load photo');
                    }
                  }}
                />
              </label>
            )}
            <details className="photo-url-details">
              <summary>Or enter image URL</summary>
              <input
                type="url"
                placeholder="https://…/portrait.jpg"
                maxLength={2048}
                value={editF.image.startsWith('data:') ? '' : editF.image}
                onChange={(e) => fieldF('image', e.target.value)}
              />
            </details>
          </div>

          <div className="actions">
            <button className="cta" disabled={busy}>
              {busy ? 'Saving…' : 'Save founder details'}
            </button>
            {!freshF && (
              <button
                type="button"
                disabled={busy}
                className="text-link"
                onClick={() => {
                  if (confirmF !== editF.id) {
                    setConfirmF(editF.id);
                    return;
                  }
                  run({ action: 'contentRemove', id: editF.id }, () => {
                    setFoundersList(foundersList.filter((x) => x.id !== editF.id));
                    setEditF(null);
                    setConfirmF('');
                  });
                }}
              >
                {confirmF === editF.id ? 'Confirm removal' : 'Remove founder'}
              </button>
            )}
          </div>
        </form>
      )}

      {/* INBOX TAB */}
      {tab === 'Inbox' && (
        <>
          <div className="admin-bar">
            <div>
              <h2>Project inquiries ({filteredInbox.length})</h2>
              <small className="eyebrow">
                {inbox.filter((m) => m.status === 'new').length} unread · synced with D1 &amp; MongoDB
              </small>
            </div>
            <div className="actions">
              {inbox.some((m) => m.status === 'new') && (
                <button
                  type="button"
                  className="outline"
                  disabled={busy}
                  onClick={() =>
                    run(
                      { action: 'bulkInquiryStatus', fromStatus: 'new', status: 'read' },
                      () =>
                        setInbox(
                          inbox.map((x) => (x.status === 'new' ? { ...x, status: 'read' } : x))
                        ),
                      'All new briefs marked as read.'
                    )
                  }
                >
                  Mark all read
                </button>
              )}
              {inbox.length > 0 && (
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    const header = 'ID,Date,Status,Name,Email,Topic,Budget,Mail,Brief,Notes\n';
                    const rows = inbox
                      .map((m) =>
                        [
                          m.id,
                          new Date(m.created).toISOString(),
                          m.status,
                          m.name,
                          m.email,
                          m.topic,
                          m.budget,
                          m.mail,
                          m.brief,
                          m.notes || '',
                        ]
                          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                          .join(',')
                      )
                      .join('\n');
                    downloadFile(`hashdecode-inquiries-${new Date().toISOString().slice(0, 10)}.csv`, header + rows);
                  }}
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: '1.2rem' }}>
            <label>
              Filter by status
              <select value={inboxFilter} onChange={(e) => setInboxFilter(e.target.value)}>
                <option value="all">All inquiries ({inbox.length})</option>
                <option value="new">New ({inbox.filter((m) => m.status === 'new').length})</option>
                <option value="in_progress">
                  In progress ({inbox.filter((m) => m.status === 'in_progress').length})
                </option>
                <option value="read">Read ({inbox.filter((m) => m.status === 'read').length})</option>
                <option value="completed">
                  Completed ({inbox.filter((m) => m.status === 'completed').length})
                </option>
                <option value="archived">
                  Archived ({inbox.filter((m) => m.status === 'archived').length})
                </option>
              </select>
            </label>
            <label>
              Search inquiries
              <input
                type="search"
                placeholder="Search by client name, email, service or ID…"
                value={inboxSearch}
                onChange={(e) => setInboxSearch(e.target.value)}
              />
            </label>
          </div>

          {!filteredInbox.length && (
            <p className="empty-state">
              {inbox.length
                ? 'No inquiries match your current filter.'
                : 'New briefs from the contact page will appear here.'}
            </p>
          )}

          {filteredInbox.map((m) => {
            const currentNotes = noteDrafts[m.id] !== undefined ? noteDrafts[m.id] : m.notes || '';
            return (
              <article key={m.id} className="message">
                <small className="eyebrow">
                  {m.status} / {new Date(m.created).toISOString().slice(0, 10)} / {m.id.slice(0, 8)}
                </small>
                <h3>{m.topic}</h3>
                <p>
                  {m.name} · <a href={'mailto:' + m.email}>{m.email}</a>
                </p>
                <p>
                  Budget: {m.budget} · Email notification: {m.mail}
                </p>
                <p className="prewrap">{m.brief}</p>

                <div className="form-row" style={{ marginTop: '0.75rem' }}>
                  <label>
                    Status{' '}
                    <select
                      disabled={busy}
                      value={m.status}
                      onChange={(e) => {
                        const status = e.target.value;
                        run({ action: 'inquiryStatus', id: m.id, status }, () =>
                          setInbox(inbox.map((x) => (x.id === m.id ? { ...x, status } : x)))
                        );
                      }}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="read">Read</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  <label>
                    Internal engineering notes
                    <input
                      type="text"
                      maxLength={2000}
                      placeholder="Add scoping notes, quote details or follow-up status…"
                      value={currentNotes}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="actions" style={{ marginTop: '0.6rem' }}>
                  {noteDrafts[m.id] !== undefined && noteDrafts[m.id] !== (m.notes || '') && (
                    <button
                      type="button"
                      className="outline"
                      disabled={busy}
                      onClick={() =>
                        run(
                          {
                            action: 'inquiryNotes',
                            id: m.id,
                            status: m.status,
                            notes: currentNotes,
                          },
                          () => {
                            setInbox(
                              inbox.map((x) =>
                                x.id === m.id ? { ...x, notes: currentNotes } : x
                              )
                            );
                          },
                          'Inquiry notes saved.'
                        )
                      }
                    >
                      Save note
                    </button>
                  )}
                  <a
                    className="text-link"
                    href={`mailto:${m.email}?subject=${encodeURIComponent(
                      `Re: ${m.topic} brief (${m.id.slice(0, 8).toUpperCase()}) — Hash Decode`
                    )}`}
                  >
                    Reply via email ↗
                  </a>
                  <button
                    type="button"
                    disabled={busy}
                    className="text-link-danger"
                    onClick={() => {
                      if (confirmInq !== m.id) {
                        setConfirmInq(m.id);
                        return;
                      }
                      run(
                        { action: 'inquiryDelete', id: m.id },
                        () => {
                          setInbox(inbox.filter((x) => x.id !== m.id));
                          setConfirmInq('');
                        },
                        'Inquiry deleted.'
                      );
                    }}
                  >
                    {confirmInq === m.id ? 'Confirm delete' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })}
        </>
      )}

      {/* SUBSCRIBERS TAB */}
      {tab === 'Subscribers' && (
        <>
          <div className="admin-bar">
            <div>
              <h2>Newsletter subscribers ({subscribers.length})</h2>
              <small className="eyebrow">
                Engineering &amp; Security dispatch list · synced with D1 &amp; MongoDB
              </small>
            </div>
            {subscribers.length > 0 && (
              <button
                type="button"
                className="outline"
                onClick={() => {
                  const csv =
                    'Email,Status,SubscribedAt\n' +
                    subscribers
                      .map(
                        (s) =>
                          `"${s.email}","${s.status}","${new Date(s.created).toISOString()}"`
                      )
                      .join('\n');
                  downloadFile(
                    `hashdecode-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
                    csv
                  );
                }}
              >
                Export CSV
              </button>
            )}
          </div>

          <form
            className="form-panel editor"
            style={{ marginBottom: '1.5rem' }}
            onSubmit={(e) => {
              e.preventDefault();
              const clean = newSubEmail.trim().toLowerCase();
              if (!clean) return;
              run(
                { action: 'subscriberAdd', email: clean },
                () => {
                  setSubscribers([
                    { email: clean, status: 'active', created: Date.now() },
                    ...subscribers.filter((s) => s.email !== clean),
                  ]);
                  setNewSubEmail('');
                },
                'Subscriber added.'
              );
            }}
          >
            <div className="form-row">
              <label>
                Add subscriber email
                <input
                  type="email"
                  required
                  placeholder="subscriber@company.com"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                />
              </label>
              <label>
                Filter subscribers
                <input
                  type="search"
                  placeholder="Search by email…"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                />
              </label>
            </div>
            <div className="actions">
              <button className="cta" disabled={busy}>
                Add subscriber +
              </button>
            </div>
          </form>

          {!filteredSubs.length && (
            <p className="empty-state">
              No newsletter subscribers yet. Visitors joining from the footer form will appear here.
            </p>
          )}

          {filteredSubs.map((s) => (
            <div className="admin-item" key={s.email}>
              <div>
                <small className="eyebrow">
                  {s.status} / {new Date(s.created).toISOString().slice(0, 10)}
                </small>
                <h3>{s.email}</h3>
              </div>
              <button
                type="button"
                className="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    { action: 'subscriberRemove', email: s.email },
                    () => setSubscribers(subscribers.filter((x) => x.email !== s.email)),
                    'Subscriber removed.'
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
        </>
      )}

      {/* SECURITY & SYNC TAB */}
      {tab === 'Security & Sync' && (
        <>
          <div className="form-panel editor" style={{ marginBottom: '1.5rem' }}>
            <h2>MongoDB Atlas &amp; Data Backup</h2>
            <p>
              Status:{' '}
              <strong>
                {mongoStatus.configured
                  ? mongoStatus.connected
                    ? `Connected (${mongoStatus.dbName})`
                    : `Configured (${mongoStatus.dbName} — standby)`
                  : 'Local D1 / SQLite active (set MONGODB_URI in .env to enable Atlas cloud sync)'}
              </strong>
            </p>
            {mongoStatus.connected && (
              <p className="eyebrow">
                Atlas documents · Projects: {mongoStatus.projectsCount ?? 0} · Inquiries:{' '}
                {mongoStatus.inquiriesCount ?? 0} · Content: {mongoStatus.contentCount ?? 0} ·
                Subscribers: {mongoStatus.subscribersCount ?? 0} · Chats:{' '}
                {mongoStatus.chatsCount ?? 0}
              </p>
            )}
            <div className="actions" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="cta"
                disabled={busy}
                onClick={() =>
                  run(
                    { action: 'syncMongo' },
                    (res) => {
                      if (res.mongo) setMongoStatus(res.mongo);
                    },
                    'All studio records synchronized with MongoDB Atlas.'
                  )
                }
              >
                {busy ? 'Syncing…' : 'Sync all data with MongoDB'}
              </button>
              <button
                type="button"
                className="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    { action: 'exportData' },
                    (res) => {
                      if (res.snapshot) {
                        downloadFile(
                          `hashdecode-backup-${new Date().toISOString().slice(0, 10)}.json`,
                          JSON.stringify(res.snapshot, null, 2),
                          'application/json'
                        );
                      }
                    },
                    'Full JSON studio backup downloaded.'
                  )
                }
              >
                Download JSON backup
              </button>
            </div>
          </div>

          <div className="form-panel editor" style={{ marginBottom: '1.5rem' }}>
            <h2>Security &amp; Session Controls</h2>
            <p>
              Manage rate-limit buckets, revoke other active owner sessions, or rotate your owner
              password.
            </p>
            <div className="actions" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    { action: 'clearRateLimits' },
                    () => {},
                    'Rate-limit counters cleared across all endpoints.'
                  )
                }
              >
                Clear rate-limit blocks
              </button>
              <button
                type="button"
                className="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    { action: 'revokeOtherSessions' },
                    () => {},
                    'All other owner sessions revoked.'
                  )
                }
              >
                Revoke other sessions
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  { action: 'changePassword', currentPassword, newPassword },
                  () => {
                    setCurrentPassword('');
                    setNewPassword('');
                  },
                  'Owner password updated with a new PBKDF2-SHA256 verifier.'
                );
              }}
            >
              <div className="form-row">
                <label>
                  Current owner password
                  <input
                    type="password"
                    required
                    minLength={4}
                    maxLength={256}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </label>
                <label>
                  New owner password (min 8 chars)
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={256}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
              </div>
              <button className="cta" disabled={busy}>
                Rotate owner password
              </button>
            </form>
          </div>

          <div className="admin-bar">
            <h2>Recent security &amp; workspace audit log ({auditLogs.length})</h2>
          </div>
          {!auditLogs.length && (
            <p className="empty-state">Security and admin actions will be recorded here.</p>
          )}
          {auditLogs.slice(0, 40).map((log) => (
            <div className="admin-item" key={log.id}>
              <div>
                <small className="eyebrow">
                  {new Date(log.created).toISOString().replace('T', ' ').slice(0, 19)} UTC ·{' '}
                  {log.actor} {log.ip ? `(${log.ip})` : ''}
                </small>
                <h3>
                  {log.action} {log.target ? `→ ${log.target}` : ''}
                </h3>
                {log.detail && <p>{log.detail}</p>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* SITE COPY TAB */}
      {tab === 'Site copy' && (
        <form
          className="form-panel editor"
          onSubmit={(e) => {
            e.preventDefault();
            run({ action: 'settings', ...settings }, () => {});
          }}
        >
          <h2>Studio copy</h2>
          <label>
            Homepage introduction
            <textarea
              value={settings.intro}
              onChange={(e) => setSettings({ ...settings, intro: e.target.value })}
              required
              minLength={10}
              maxLength={240}
            />
          </label>
          <label>
            About the studio
            <textarea
              value={settings.about}
              onChange={(e) => setSettings({ ...settings, about: e.target.value })}
              required
              minLength={10}
              maxLength={1200}
            />
          </label>
          <button className="cta" disabled={busy}>
            Save copy
          </button>
        </form>
      )}
    </div>
  );
}
