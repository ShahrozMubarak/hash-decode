import type { Db, MongoClient } from 'mongodb';
import { runtime } from './abuse';
import { getPlatformDb } from './platform-db';

const g = globalThis as unknown as {
  __STUDIO_MONGO_CLIENT__?: MongoClient | null;
  __STUDIO_MONGO_DB__?: Db | null;
  __STUDIO_MONGO_URI__?: string;
};

export function sanitizeMongoUri(raw: string): string {
  let uri = (raw || '').trim();
  if (!uri) return '';
  // Strip accidental surrounding quotes
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  // Strip enclosing or accidental angle brackets: <username>:<password> or <db_username>
  uri = uri.replace(/<([^>]+)>/g, '$1');
  // Strip any lingering leading bracket in credentials like :<secret@
  uri = uri.replace(/:<([^@]+)@/, ':$1@');

  // Safely URL-encode unescaped @ or # or ? inside credentials if multiple @ exist
  const schemeMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)(.+)$/i);
  if (schemeMatch) {
    const scheme = schemeMatch[1];
    const rest = schemeMatch[2];
    const slashIdx = rest.indexOf('/');
    const authority = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest;
    const pathAndQuery = slashIdx >= 0 ? rest.slice(slashIdx) : '';
    const lastAt = authority.lastIndexOf('@');
    if (lastAt > 0) {
      const userInfo = authority.slice(0, lastAt);
      const hostInfo = authority.slice(lastAt + 1);
      const colonIdx = userInfo.indexOf(':');
      if (colonIdx > 0) {
        const rawUser = userInfo.slice(0, colonIdx);
        const rawPass = userInfo.slice(colonIdx + 1);
        const safeUser = rawUser.includes('%') ? rawUser : encodeURIComponent(rawUser);
        const safePass = rawPass.includes('%') ? rawPass : encodeURIComponent(rawPass);
        uri = `${scheme}${safeUser}:${safePass}@${hostInfo}${pathAndQuery}`;
      }
    }
  }
  return uri;
}

export function getMongoConfig() {
  const rawUri =
    runtime('MONGODB_URI') ||
    runtime('MONGO_URI') ||
    runtime('MONGODB_URL') ||
    (runtime('DATABASE_URL').startsWith('mongodb') ? runtime('DATABASE_URL') : '');
  const uri = sanitizeMongoUri(rawUri);
  const dbName = (runtime('MONGODB_DB_NAME') || 'hash_decode')
    .trim()
    .replace(/[<>"]/g, '');
  const isConfigured = Boolean(
    uri &&
      /^mongodb(?:\+srv)?:\/\//i.test(uri) &&
      !uri.includes('db_username') &&
      !uri.includes('YOUR_PASSWORD')
  );
  return { uri, dbName, isConfigured };
}

export async function getMongoDb(): Promise<Db | null> {
  const { uri, dbName, isConfigured } = getMongoConfig();
  if (!isConfigured || !uri) return null;

  if (g.__STUDIO_MONGO_DB__ && g.__STUDIO_MONGO_URI__ === uri) {
    return g.__STUDIO_MONGO_DB__;
  }

  try {
    const mongodbModule = await import('mongodb');
    const MongoClientCtor = mongodbModule.MongoClient;
    const client = new MongoClientCtor(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
      socketTimeoutMS: 12000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    await client.connect();
    const db = client.db(dbName);
    g.__STUDIO_MONGO_CLIENT__ = client;
    g.__STUDIO_MONGO_DB__ = db;
    g.__STUDIO_MONGO_URI__ = uri;
    return db;
  } catch (err) {
    g.__STUDIO_MONGO_DB__ = null;
    console.warn('[MongoDB Atlas] Connection note:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function saveInquiryToMongo(inquiry: {
  id: string;
  name: string;
  email: string;
  topic: string;
  budget?: string;
  brief: string;
  status: string;
  created: number;
  mail?: string;
  notes?: string;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    const cleanId = String(inquiry.id);
    await db.collection('inquiries').updateOne(
      { id: cleanId },
      {
        $set: {
          id: cleanId,
          name: String(inquiry.name),
          email: String(inquiry.email),
          topic: String(inquiry.topic),
          budget: String(inquiry.budget || 'Not specified'),
          brief: String(inquiry.brief),
          status: String(inquiry.status || 'new'),
          created: Number(inquiry.created || Date.now()),
          mail: String(inquiry.mail || 'not configured'),
          ...(inquiry.notes !== undefined ? { notes: String(inquiry.notes) } : {}),
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    await db.collection('orders').updateOne(
      { orderId: cleanId },
      {
        $set: {
          orderId: cleanId,
          customerName: String(inquiry.name),
          customerEmail: String(inquiry.email),
          serviceCategory: String(inquiry.topic),
          budgetTier: String(inquiry.budget || 'Not specified'),
          requirements: String(inquiry.brief),
          status: inquiry.status === 'new' ? 'pending_review' : String(inquiry.status),
          ...(inquiry.notes !== undefined ? { notes: String(inquiry.notes) } : {}),
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveInquiryToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function updateInquiryStatusInMongo(id: string, status: string, notes?: string) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    const cleanId = String(id);
    const updateFields: Record<string, unknown> = { status: String(status), updatedAt: now };
    if (notes !== undefined) {
      updateFields.notes = String(notes);
    }
    await Promise.all([
      db.collection('inquiries').updateOne({ id: cleanId }, { $set: updateFields }),
      db.collection('orders').updateOne(
        { orderId: cleanId },
        {
          $set: {
            status: status === 'new' ? 'pending_review' : String(status),
            ...(notes !== undefined ? { notes: String(notes) } : {}),
            updatedAt: now,
          },
        }
      ),
    ]);
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] updateInquiryStatusInMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function deleteInquiryFromMongo(id: string) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const cleanId = String(id);
    await Promise.all([
      db.collection('inquiries').deleteOne({ id: cleanId }),
      db.collection('orders').deleteOne({ orderId: cleanId }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function saveProjectToMongo(project: {
  slug: string;
  title: string;
  category: string;
  summary: string;
  challenge: string;
  solution: string;
  tech?: string;
  result?: string;
  url?: string;
  image?: string;
  art?: string;
  status: string;
  position?: number;
  kind?: string;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    const cleanSlug = String(project.slug);
    await db.collection('projects').updateOne(
      { slug: cleanSlug },
      { $set: { ...project, slug: cleanSlug, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveProjectToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function getMongoProjects() {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const list = await db.collection('projects').find().sort({ position: 1 }).limit(200).toArray();
    return list.map((p: any) => ({
      slug: String(p.slug || ''),
      title: String(p.title || ''),
      category: String(p.category || 'Web application'),
      summary: String(p.summary || ''),
      challenge: String(p.challenge || ''),
      solution: String(p.solution || ''),
      tech: String(p.tech || ''),
      result: String(p.result || ''),
      url: String(p.url || ''),
      image: String(p.image || ''),
      art: String(p.art || 'grid'),
      status: String(p.status || 'draft'),
      position: typeof p.position === 'number' ? p.position : 30,
      kind: String(p.kind || 'Studio project'),
    })).filter((p) => p.slug);
  } catch {
    return [];
  }
}

export async function saveContentToMongo(entry: {
  id: string;
  kind: string;
  title: string;
  label: string;
  body: string;
  url: string;
  image: string;
  status: string;
  updated: number;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    const cleanId = String(entry.id);
    await db.collection('studio_content').updateOne(
      { id: cleanId },
      { $set: { ...entry, id: cleanId, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    if (entry.kind === 'team') {
      await db.collection('founders').updateOne(
        { id: cleanId },
        {
          $set: {
            id: cleanId,
            name: entry.title,
            role: entry.label,
            bio: entry.body,
            url: entry.url,
            image: entry.image,
            status: entry.status,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );
    }
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveContentToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function getMongoContent(kind?: string) {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const filter = kind ? { kind: String(kind) } : {};
    const list = await db.collection('studio_content').find(filter).sort({ updated: -1 }).limit(300).toArray();
    return list.map((x: any) => ({
      id: String(x.id || ''),
      kind: String(x.kind || 'post'),
      title: String(x.title || ''),
      label: String(x.label || ''),
      body: String(x.body || ''),
      url: String(x.url || ''),
      image: String(x.image || ''),
      status: String(x.status || 'draft'),
      updated: typeof x.updated === 'number' ? x.updated : Date.now(),
    })).filter((x) => x.id);
  } catch {
    return [];
  }
}

export async function saveSettingToMongo(id: string, value: string) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    const cleanId = String(id);
    await db.collection('settings').updateOne(
      { id: cleanId },
      { $set: { id: cleanId, value: String(value), updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function getMongoSetting(id: string): Promise<string | null> {
  try {
    const db = await getMongoDb();
    if (!db) return null;
    const doc = await db.collection('settings').findOne({ id: String(id) });
    return doc && typeof doc.value === 'string' ? doc.value : null;
  } catch {
    return null;
  }
}

export async function saveSubscriberToMongo(email: string, status = 'active') {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    const cleanEmail = String(email).trim().toLowerCase();
    await db.collection('subscribers').updateOne(
      { email: cleanEmail },
      {
        $set: { email: cleanEmail, status, updatedAt: now },
        $setOnInsert: { created: Date.now(), createdAt: now },
      },
      { upsert: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function removeSubscriberFromMongo(email: string) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    await db.collection('subscribers').deleteOne({ email: String(email).trim().toLowerCase() });
    return true;
  } catch {
    return false;
  }
}

export async function getMongoSubscribers(limit = 500) {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const list = await db.collection('subscribers').find().sort({ created: -1, createdAt: -1 }).limit(limit).toArray();
    return list.map((s: any) => ({
      email: String(s.email || ''),
      status: String(s.status || 'active'),
      created: typeof s.created === 'number' ? s.created : (s.createdAt ? new Date(s.createdAt).getTime() : Date.now()),
    })).filter((s) => s.email);
  } catch {
    return [];
  }
}

export async function saveChatThreadToMongo(thread: {
  id: string;
  secret: string;
  name: string;
  email: string;
  updated: number;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    await db.collection('chat_threads').updateOne(
      { id: String(thread.id) },
      {
        $set: {
          id: String(thread.id),
          secret: String(thread.secret),
          name: String(thread.name),
          email: String(thread.email),
          updated: Number(thread.updated),
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function saveChatMessageToMongo(message: {
  id: string;
  thread: string;
  role: string;
  body: string;
  created: number;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    await Promise.all([
      db.collection('chat_messages').updateOne(
        { id: String(message.id) },
        {
          $set: {
            id: String(message.id),
            thread: String(message.thread),
            role: String(message.role),
            body: String(message.body),
            created: Number(message.created),
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      ),
      db.collection('chat_threads').updateOne(
        { id: String(message.thread) },
        { $set: { updated: Number(message.created), updatedAt: now } }
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function getMongoChatThreads(limit = 100) {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const list = await db.collection('chat_threads').find().sort({ updated: -1 }).limit(limit).toArray();
    return list.map((t: any) => ({
      id: String(t.id || ''),
      secret: String(t.secret || ''),
      name: String(t.name || 'Visitor'),
      email: String(t.email || ''),
      updated: typeof t.updated === 'number' ? t.updated : Date.now(),
    })).filter((t) => t.id);
  } catch {
    return [];
  }
}

export async function getMongoChatMessages(threadId: string, limit = 80) {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const list = await db
      .collection('chat_messages')
      .find({ thread: String(threadId) })
      .sort({ created: -1 })
      .limit(limit)
      .toArray();
    return list
      .reverse()
      .map((m: any) => ({
        id: String(m.id || ''),
        thread: String(m.thread || threadId),
        role: String(m.role || 'Visitor'),
        body: String(m.body || ''),
        created: typeof m.created === 'number' ? m.created : Date.now(),
      }));
  } catch {
    return [];
  }
}

export async function recordTrafficToMongo(key: string, day: string, page: string, source: string) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    await db.collection('traffic_totals').updateOne(
      { key: String(key) },
      {
        $set: { key: String(key), day: String(day), page: String(page), source: String(source), updatedAt: new Date() },
        $inc: { views: 1 },
      },
      { upsert: true }
    );
    return true;
  } catch {
    return false;
  }
}

export async function saveOrderToMongo(order: {
  orderId: string;
  userId?: string;
  userEmail: string;
  title: string;
  amount?: number;
  currency?: string;
  status: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    await db.collection('orders').updateOne(
      { orderId: String(order.orderId) },
      { $set: { ...order, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveOrderToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function recordAuditLog(entry: {
  action: string;
  actor?: string;
  target?: string;
  detail?: string;
  ip?: string;
}) {
  const id = crypto.randomUUID();
  const created = Date.now();
  const row = {
    id,
    action: String(entry.action || 'event').slice(0, 80),
    actor: String(entry.actor || 'owner').slice(0, 80),
    target: String(entry.target || '').slice(0, 160),
    detail: String(entry.detail || '').slice(0, 500),
    ip: String(entry.ip || '').slice(0, 64),
    created,
  };
  try {
    const platformDb = getPlatformDb();
    await platformDb
      .prepare('CREATE TABLE IF NOT EXISTS audit_logs (id text PRIMARY KEY NOT NULL, action text NOT NULL, actor text NOT NULL, target text NOT NULL, detail text NOT NULL, ip text NOT NULL, created integer NOT NULL)')
      .run()
      .catch(() => {});
    await platformDb
      .prepare('INSERT INTO audit_logs (id, action, actor, target, detail, ip, created) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(row.id, row.action, row.actor, row.target, row.detail, row.ip, row.created)
      .run();
  } catch {}

  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection('audit_logs').insertOne({ ...row, createdAt: new Date(created) });
    }
  } catch {}
}

export async function getAuditLogs(limit = 100) {
  const map = new Map<string, { id: string; action: string; actor: string; target: string; detail: string; ip: string; created: number }>();
  try {
    const platformDb = getPlatformDb();
    await platformDb
      .prepare('CREATE TABLE IF NOT EXISTS audit_logs (id text PRIMARY KEY NOT NULL, action text NOT NULL, actor text NOT NULL, target text NOT NULL, detail text NOT NULL, ip text NOT NULL, created integer NOT NULL)')
      .run()
      .catch(() => {});
    const local = await platformDb
      .prepare('SELECT id, action, actor, target, detail, ip, created FROM audit_logs ORDER BY created DESC LIMIT ?')
      .bind(limit)
      .all<any>();
    for (const r of local.results || []) {
      map.set(r.id, r);
    }
  } catch {}

  try {
    const db = await getMongoDb();
    if (db) {
      const remote = await db.collection('audit_logs').find().sort({ created: -1 }).limit(limit).toArray();
      for (const r of remote) {
        const id = String(r.id || r._id);
        if (!map.has(id)) {
          map.set(id, {
            id,
            action: String(r.action || ''),
            actor: String(r.actor || 'owner'),
            target: String(r.target || ''),
            detail: String(r.detail || ''),
            ip: String(r.ip || ''),
            created: typeof r.created === 'number' ? r.created : Date.now(),
          });
        }
      }
    }
  } catch {}

  return Array.from(map.values())
    .sort((a, b) => b.created - a.created)
    .slice(0, limit);
}

export async function getMongoSyncStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  dbName: string;
  inquiriesCount?: number;
  projectsCount?: number;
  subscribersCount?: number;
  contentCount?: number;
  chatsCount?: number;
}> {
  const { isConfigured, dbName } = getMongoConfig();
  if (!isConfigured) {
    return { configured: false, connected: false, dbName };
  }
  try {
    const db = await getMongoDb();
    if (!db) return { configured: true, connected: false, dbName };
    const [inquiriesCount, projectsCount, subscribersCount, contentCount, chatsCount] = await Promise.all([
      db.collection('inquiries').countDocuments().catch(() => 0),
      db.collection('projects').countDocuments().catch(() => 0),
      db.collection('subscribers').countDocuments().catch(() => 0),
      db.collection('studio_content').countDocuments().catch(() => 0),
      db.collection('chat_threads').countDocuments().catch(() => 0),
    ]);
    return {
      configured: true,
      connected: true,
      dbName,
      inquiriesCount,
      projectsCount,
      subscribersCount,
      contentCount,
      chatsCount,
    };
  } catch {
    return { configured: true, connected: false, dbName };
  }
}

export async function getMongoInquiries(limit = 200) {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const list = await db.collection('inquiries').find().sort({ created: -1 }).limit(limit).toArray();
    return list.map((item: any) => ({
      id: String(item.id || item._id),
      name: String(item.name || 'Anonymous Visitor'),
      email: String(item.email || ''),
      topic: String(item.topic || 'Digital product'),
      budget: String(item.budget || 'Still exploring'),
      brief: String(item.brief || item.message || ''),
      status: String(item.status || 'new'),
      created:
        typeof item.created === 'number'
          ? item.created
          : item.createdAt
          ? new Date(item.createdAt).getTime()
          : Date.now(),
      mail: String(item.mail || 'recorded'),
      notes: String(item.notes || ''),
    }));
  } catch {
    return [];
  }
}
