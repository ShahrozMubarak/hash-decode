import { getDb } from '@/db';
import { projects, inquiries, settings, content } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { concepts, listProjects, studioCopy, listFounders } from '@/lib/studio-data';
import { manageContent, entries, getLinks } from '@/lib/cms';
import {
  adminAccess,
  bounded,
  readSmall,
  sameOrigin,
  httpsUrl,
  imageOrUrl,
} from '@/lib/studio-security';
import {
  saveProjectToMongo,
  saveInquiryToMongo,
  updateInquiryStatusInMongo,
  deleteInquiryFromMongo,
  saveSettingToMongo,
  saveContentToMongo,
  saveSubscriberToMongo,
  removeSubscriberFromMongo,
  getMongoSubscribers,
  getMongoInquiries,
  getMongoSyncStatus,
  recordAuditLog,
  getAuditLogs,
} from '@/lib/mongodb';
import { getPlatformDb } from '@/lib/platform-db';
import { clearRateLimits, getClientIp, trafficSince } from '@/lib/abuse';
import {
  verifyPassword,
  hashPasswordPbkdf2,
  setCustomCredentialHash,
  revokeOtherSessions,
} from '@/lib/owner-session';

const VALID_INQUIRY_STATUSES = ['new', 'in_progress', 'read', 'completed', 'archived'];

export async function loadSubscribersList(limit = 500) {
  const platformDb = getPlatformDb();
  const map = new Map<string, { email: string; status: string; created: number }>();

  try {
    const mongoSubs = await getMongoSubscribers(limit);
    for (const s of mongoSubs) {
      map.set(s.email.toLowerCase(), s);
    }
  } catch {}

  try {
    await platformDb
      .prepare(
        "CREATE TABLE IF NOT EXISTS subscribers (email text PRIMARY KEY NOT NULL, status text DEFAULT 'active' NOT NULL, created integer NOT NULL)"
      )
      .run()
      .catch(() => {});
    const localSubs = await platformDb
      .prepare('SELECT email, created FROM subscribers ORDER BY created DESC LIMIT ?')
      .bind(limit)
      .all<{ email: string; created: number }>();
    for (const s of localSubs.results || []) {
      const key = String(s.email || '').toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, { email: key, status: 'active', created: Number(s.created || Date.now()) });
      }
    }
  } catch {}

  return Array.from(map.values()).sort((a, b) => b.created - a.created);
}

export async function loadInquiryNotesMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const platformDb = getPlatformDb();
    const res = await platformDb
      .prepare("SELECT id, value FROM settings WHERE id LIKE 'note:%'")
      .all<{ id: string; value: string }>();
    for (const r of res.results || []) {
      map.set(r.id.slice(5), r.value);
    }
  } catch {}
  return map;
}

export async function GET(req: Request) {
  if (!(await adminAccess(req)).allowed) {
    return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
  }

  const db = getDb();
  const platformDb = getPlatformDb();

  const [
    projectsList,
    d1Messages,
    mongoMessages,
    notesMap,
    copy,
    founders,
    subscribers,
    auditLogs,
    chatThreadsRes,
    stats,
    mongo,
    contentEntries,
    links,
  ] = await Promise.all([
    listProjects(true).catch(() => []),
    db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.created))
      .limit(200)
      .catch(() => []),
    getMongoInquiries(200).catch(() => []),
    loadInquiryNotesMap().catch(() => new Map<string, string>()),
    studioCopy().catch(() => ({ intro: '', about: '' })),
    listFounders(true).catch(() => []),
    loadSubscribersList(500).catch(() => []),
    getAuditLogs(80).catch(() => []),
    platformDb
      .prepare('SELECT id,name,email,updated FROM chat_threads ORDER BY updated DESC LIMIT 100')
      .all<{ id: string; name: string; email: string; updated: number }>()
      .catch(() => ({ results: [] })),
    platformDb
      .prepare(
        'SELECT source,SUM(views) AS n FROM traffic_totals WHERE day>=? GROUP BY source ORDER BY n DESC'
      )
      .bind(trafficSince())
      .all<{ source: string; n: number }>()
      .catch(() => ({ results: [] })),
    getMongoSyncStatus().catch(() => ({
      configured: false,
      connected: false,
      dbName: '',
    })),
    entries(undefined, true).catch(() => []),
    getLinks().catch(() => ({ whatsapp: '', booking: '' })),
  ]);

  const messagesMap = new Map();
  for (const m of mongoMessages) {
    messagesMap.set(m.id, { ...m, notes: notesMap.get(m.id) || m.notes || '' });
  }
  for (const m of d1Messages) {
    const existing = messagesMap.get(m.id);
    messagesMap.set(m.id, {
      ...m,
      status: m.status || existing?.status || 'new',
      notes: notesMap.get(m.id) || existing?.notes || '',
    });
  }
  const messages = Array.from(messagesMap.values()).sort((a, b) => b.created - a.created);
  const views = (stats.results || []).reduce((v: number, r: { n: number }) => v + r.n, 0);

  return Response.json(
    {
      ok: true,
      messages,
      projects: projectsList,
      founders,
      subscribers,
      copy,
      links,
      entries: contentEntries,
      auditLogs,
      chatThreads: chatThreadsRes?.results || [],
      mongo,
      stats,
      totalViews: views,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: 'Untrusted request.' }, { status: 403 });
  if (!(await adminAccess(req)).allowed) {
    return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
  }
  let d: Record<string, unknown>;
  try {
    d = await readSmall(req);
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const db = getDb();
  const platformDb = getPlatformDb();
  const ip = getClientIp(req);

  try {
    if (['contentSave', 'contentRemove', 'connections'].includes(String(d.action))) {
      return await manageContent(d);
    }

    if (d.action === 'saveProject' || d.action === 'project') {
      const p = (d.project && typeof d.project === 'object' ? d.project : d) as Record<string, unknown>;
      const slug = bounded(p.slug, 80, 1);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw Error('Use lowercase words and hyphens for the project address.');
      }
      const existing = (await listProjects(true)).find((x) => x.slug === slug);
      const isNew = d.isNew !== undefined ? Boolean(d.isNew) : !existing;
      if (d.isNew && existing) {
        return Response.json({ error: 'That project address is already in use.' }, { status: 409 });
      }
      const title = bounded(p.title, 90, 2);
      const category = bounded(p.category, 45, 2);
      const summary = bounded(p.summary, 240, 8);
      const challenge = bounded(p.challenge, 2500);
      const solution = bounded(p.solution, 2500);
      const url = httpsUrl(p.url ?? '');
      const image = imageOrUrl(p.image ?? '');
      const status = p.status === 'published' ? 'published' : 'draft';
      const art = ['orbit', 'relay', 'grid'].includes(String(p.art)) ? String(p.art) : 'grid';
      const position = Number(p.position !== undefined ? p.position : 30);
      if (!Number.isInteger(position) || position < 0 || position > 9999) {
        throw Error('Position must be between 0 and 9999.');
      }
      const kind = p.kind === 'Studio concept' ? 'Studio concept' : 'Studio project';
      const row = {
        slug,
        title,
        category,
        summary,
        challenge,
        solution,
        tech: bounded(p.tech || '', 300),
        result: bounded(p.result || '', 2000),
        url,
        image,
        art,
        status,
        position,
        kind,
      };
      if (isNew && !existing) {
        const result = await db
          .insert(projects)
          .values(row)
          .onConflictDoNothing()
          .returning({ slug: projects.slug });
        if (!result.length) {
          return Response.json(
            { error: 'That address is reserved. Choose another.' },
            { status: 409 }
          );
        }
      } else {
        await db.insert(projects).values(row).onConflictDoUpdate({ target: projects.slug, set: row });
      }
      await saveProjectToMongo(row).catch((err) =>
        console.warn('[MongoDB] Project sync note:', err)
      );
      await recordAuditLog({
        action: isNew ? 'project_created' : 'project_updated',
        target: slug,
        detail: `${status} · ${title}`,
        ip,
      });
      return Response.json({ ok: true, project: row }, { headers: { 'Cache-Control': 'no-store' } });
    } else if (d.action === 'deleteProject' || d.action === 'delete_project') {
      const slug = bounded(d.slug, 80, 1);
      const row = (await listProjects(true)).find((p) => p.slug === slug);
      if (!row) return Response.json({ error: 'Project not found.' }, { status: 404 });
      if (concepts.some((p) => p.slug === slug)) {
        await db
          .insert(projects)
          .values({ ...row, status: 'deleted' })
          .onConflictDoUpdate({ target: projects.slug, set: { status: 'deleted' } });
      } else {
        await db.delete(projects).where(eq(projects.slug, slug));
      }
      await saveProjectToMongo({ ...row, status: 'deleted' }).catch((err) =>
        console.warn('[MongoDB] Project delete sync note:', err)
      );
      await recordAuditLog({
        action: 'project_deleted',
        target: slug,
        detail: row.title,
        ip,
      });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } else if (d.action === 'founder' || d.action === 'saveFounder') {
      const f = (d.founder && typeof d.founder === 'object' ? d.founder : d) as Record<string, unknown>;
      const rawId = bounded(String(f.id || `founder-${Date.now()}`), 80, 1)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      const id = rawId.replace(/^-+|-+$/g, '') || `founder-${Date.now()}`;
      const title = bounded(f.name, 100, 2);
      const label = bounded(f.role, 120, 2);
      const body = bounded(f.bio, 7000, 4);
      const image = f.image ? imageOrUrl(f.image) : '/team/shahroz.svg';
      const url = f.url ? httpsUrl(f.url) : '';
      const position = Number.isInteger(Number(f.position)) ? Number(f.position) : 99;
      const row = {
        id,
        kind: 'team',
        title,
        label,
        body,
        image,
        url,
        status: 'published',
        updated: Date.now(),
      };
      await db.insert(content).values(row).onConflictDoUpdate({ target: content.id, set: row });
      await saveContentToMongo(row).catch((err) =>
        console.warn('[MongoDB] Founder sync note:', err)
      );
      await recordAuditLog({
        action: 'founder_saved',
        target: id,
        detail: `${title} · ${label}`,
        ip,
      });
      return Response.json(
        { ok: true, founder: { ...f, id, image, position } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    } else if (d.action === 'delete_founder' || d.action === 'deleteFounder') {
      const id = bounded(String(d.id), 80, 1);
      const deletedRow = {
        id,
        kind: 'team',
        title: '',
        label: '',
        body: '',
        image: '',
        url: '',
        status: 'deleted',
        updated: Date.now(),
      };
      await db
        .insert(content)
        .values(deletedRow)
        .onConflictDoUpdate({ target: content.id, set: { status: 'deleted', updated: deletedRow.updated } });
      await saveContentToMongo(deletedRow).catch((err) =>
        console.warn('[MongoDB] Founder delete sync note:', err)
      );
      await recordAuditLog({
        action: 'founder_deleted',
        target: id,
        detail: `Removed founder ${id}`,
        ip,
      });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } else if (d.action === 'inquiryStatus' || d.action === 'message_status') {
      const status = String(d.status || '');
      if (!VALID_INQUIRY_STATUSES.includes(status)) {
        throw Error('Invalid inquiry status.');
      }
      const id = bounded(d.id, 80, 1);
      const notes = d.notes !== undefined ? bounded(String(d.notes), 2000, 0) : undefined;
      await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
      if (notes !== undefined) {
        await db
          .insert(settings)
          .values({ id: `note:${id}`, value: notes })
          .onConflictDoUpdate({ target: settings.id, set: { value: notes } });
      }
      await updateInquiryStatusInMongo(id, status, notes);
      await recordAuditLog({
        action: 'inquiry_status_updated',
        target: id,
        detail: `Status -> ${status}${notes !== undefined ? ' (notes updated)' : ''}`,
        ip,
      });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } else if (d.action === 'inquiryNotes' || d.action === 'inquiry_notes') {
      const id = bounded(d.id, 80, 1);
      const notes = bounded(String(d.notes ?? ''), 2000, 0);
      const status = VALID_INQUIRY_STATUSES.includes(String(d.status)) ? String(d.status) : 'read';
      await db
        .insert(settings)
        .values({ id: `note:${id}`, value: notes })
        .onConflictDoUpdate({ target: settings.id, set: { value: notes } });
      await updateInquiryStatusInMongo(id, status, notes);
      await recordAuditLog({
        action: 'inquiry_notes_saved',
        target: id,
        detail: `Saved internal notes (${notes.length} chars)`,
        ip,
      });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } else if (d.action === 'inquiryDelete' || d.action === 'delete_inquiry') {
      const id = bounded(d.id, 80, 1);
      await db.delete(inquiries).where(eq(inquiries.id, id));
      await db.delete(settings).where(eq(settings.id, `note:${id}`)).catch(() => {});
      await deleteInquiryFromMongo(id);
      await recordAuditLog({
        action: 'inquiry_deleted',
        target: id,
        detail: 'Removed inquiry from inbox',
        ip,
      });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    } else if (d.action === 'bulkInquiryStatus') {
      const targetStatus = String(d.status || 'read');
      if (!VALID_INQUIRY_STATUSES.includes(targetStatus)) {
        throw Error('Invalid inquiry status.');
      }
      const fromStatus = d.fromStatus ? String(d.fromStatus) : 'new';
      const allInquiries = await db.select().from(inquiries).catch(() => []);
      for (const item of allInquiries) {
        if (fromStatus === 'all' || item.status === fromStatus) {
          await db.update(inquiries).set({ status: targetStatus }).where(eq(inquiries.id, item.id));
          await updateInquiryStatusInMongo(item.id, targetStatus);
        }
      }
      await recordAuditLog({
        action: 'inquiries_bulk_updated',
        target: fromStatus,
        detail: `Marked ${fromStatus} inquiries as ${targetStatus}`,
        ip,
      });
    } else if (d.action === 'subscriberAdd') {
      const email = bounded(d.email, 254, 3).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw Error('Enter a valid subscriber email address.');
      }
      const now = Date.now();
      await platformDb
        .prepare(
          "CREATE TABLE IF NOT EXISTS subscribers (email text PRIMARY KEY NOT NULL, status text DEFAULT 'active' NOT NULL, created integer NOT NULL)"
        )
        .run()
        .catch(() => {});
      await platformDb
        .prepare('INSERT OR REPLACE INTO subscribers (email, created) VALUES (?, ?)')
        .bind(email, now)
        .run();
      await saveSubscriberToMongo(email, 'active');
      await recordAuditLog({
        action: 'subscriber_added_by_admin',
        target: email,
        detail: 'Added subscriber manually',
        ip,
      });
    } else if (d.action === 'subscriberRemove') {
      const email = bounded(d.email, 254, 3).toLowerCase();
      await platformDb.prepare('DELETE FROM subscribers WHERE email=?').bind(email).run().catch(() => {});
      await removeSubscriberFromMongo(email);
      await recordAuditLog({
        action: 'subscriber_removed',
        target: email,
        detail: 'Removed subscriber from dispatch list',
        ip,
      });
    } else if (d.action === 'settings' || d.action === 'copy') {
      const value = JSON.stringify({
        intro: bounded(d.intro, 240, 10),
        about: bounded(d.about, 1200, 10),
      });
      await db
        .insert(settings)
        .values({ id: 'public', value })
        .onConflictDoUpdate({ target: settings.id, set: { value } });
      await saveSettingToMongo('public', value);
      await recordAuditLog({
        action: 'studio_copy_updated',
        target: 'public',
        detail: 'Updated homepage intro and studio about copy',
        ip,
      });
    } else if (d.action === 'clearRateLimits') {
      await clearRateLimits();
      await recordAuditLog({
        action: 'rate_limits_cleared',
        target: 'submission_limits',
        detail: 'Cleared active rate-limit counters',
        ip,
      });
    } else if (d.action === 'revokeOtherSessions') {
      const authHeader = req.headers.get('authorization') || '';
      const directToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
      await revokeOtherSessions(req.headers.get('cookie'), directToken);
      await recordAuditLog({
        action: 'sessions_revoked',
        target: 'owner_sessions',
        detail: 'Revoked all other active owner sessions',
        ip,
      });
    } else if (d.action === 'changePassword' || d.action === 'rotate_password') {
      const currentPassword = String(d.currentPassword || '');
      const rawNew = d.newPassword !== undefined ? d.newPassword : d.nextPassword;
      const newPassword = bounded(rawNew, 256, 8);
      if (!(await verifyPassword(currentPassword))) {
        throw Error('Check your current password and try again.');
      }
      const newHash = await hashPasswordPbkdf2(newPassword);
      setCustomCredentialHash(newHash);
      await db
        .insert(settings)
        .values({ id: 'owner_password_hash', value: newHash })
        .onConflictDoUpdate({ target: settings.id, set: { value: newHash } });
      await saveSettingToMongo('owner_password_hash', newHash);
      await recordAuditLog({
        action: 'owner_password_rotated',
        target: 'owner_credentials',
        detail: 'Rotated owner PBKDF2 password verifier',
        ip,
      });
    } else if (d.action === 'syncMongo') {
      const [allProjects, d1Inquiries, mongoInq, allContent, copy, links, subs] = await Promise.all([
        listProjects(true),
        db.select().from(inquiries).orderBy(desc(inquiries.created)).limit(200).catch(() => []),
        getMongoInquiries(200).catch(() => []),
        entries(undefined, true),
        studioCopy(),
        getLinks(),
        loadSubscribersList(500),
      ]);
      const notesMap = await loadInquiryNotesMap();

      // Sync projects to Mongo & local
      for (const p of allProjects) {
        await saveProjectToMongo(p);
        await db.insert(projects).values(p).onConflictDoUpdate({ target: projects.slug, set: p }).catch(() => {});
      }
      // Sync inquiries to Mongo & local
      const mergedInq = new Map<string, any>();
      for (const m of mongoInq) mergedInq.set(m.id, m);
      for (const m of d1Inquiries) mergedInq.set(m.id, { ...m, notes: notesMap.get(m.id) || '' });
      for (const m of mergedInq.values()) {
        await saveInquiryToMongo(m);
        const { notes: _notes, ...d1Row } = m;
        await db.insert(inquiries).values(d1Row).onConflictDoUpdate({ target: inquiries.id, set: d1Row }).catch(() => {});
      }
      // Sync CMS content (posts, founders, reviews)
      for (const c of allContent) {
        await saveContentToMongo(c);
        await db.insert(content).values(c).onConflictDoUpdate({ target: content.id, set: c }).catch(() => {});
      }
      // Sync settings
      await saveSettingToMongo('public', JSON.stringify(copy));
      await saveSettingToMongo('connections', JSON.stringify(links));
      // Sync subscribers
      for (const s of subs) {
        await saveSubscriberToMongo(s.email, s.status);
      }

      const status = await getMongoSyncStatus();
      await recordAuditLog({
        action: 'mongodb_manual_sync',
        target: status.dbName || 'hash_decode',
        detail: `Connected: ${status.connected} · Projects: ${allProjects.length} · Inquiries: ${mergedInq.size} · Subscribers: ${subs.length}`,
        ip,
      });
      return Response.json(
        { ok: true, mongo: status },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    } else if (d.action === 'exportData') {
      const [allProjects, d1Inquiries, mongoInq, allContent, founders, copy, links, subs, logs, mongo] =
        await Promise.all([
          listProjects(true),
          db.select().from(inquiries).orderBy(desc(inquiries.created)).limit(500).catch(() => []),
          getMongoInquiries(500).catch(() => []),
          entries(undefined, true),
          listFounders(true),
          studioCopy(),
          getLinks(),
          loadSubscribersList(1000),
          getAuditLogs(200),
          getMongoSyncStatus(),
        ]);
      const notesMap = await loadInquiryNotesMap();
      const inqMap = new Map<string, any>();
      for (const m of mongoInq) inqMap.set(m.id, m);
      for (const m of d1Inquiries) {
        inqMap.set(m.id, { ...m, notes: notesMap.get(m.id) || inqMap.get(m.id)?.notes || '' });
      }
      await recordAuditLog({
        action: 'studio_backup_exported',
        target: 'full_snapshot',
        detail: 'Exported studio JSON backup',
        ip,
      });
      return Response.json(
        {
          ok: true,
          snapshot: {
            exportedAt: new Date().toISOString(),
            mongo,
            copy,
            links,
            projects: allProjects,
            founders,
            content: allContent,
            inquiries: Array.from(inqMap.values()),
            subscribers: subs,
            auditLogs: logs,
          },
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    } else {
      return Response.json({ error: 'Unknown operation.' }, { status: 400 });
    }

    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return Response.json(
      {
        error: /^(Use |Enter |Check |Position |Invalid |Only )/.test(msg)
          ? msg
          : 'The change could not be saved. Check the fields and try again.',
      },
      { status: 400 }
    );
  }
}
