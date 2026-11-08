import { getPlatformDb } from '@/lib/platform-db';
import { bounded, sameOrigin, readSmall, adminAccess } from '@/lib/studio-security';
import { quota } from '@/lib/abuse';
import {
  saveChatThreadToMongo,
  saveChatMessageToMongo,
  getMongoChatThreads,
  getMongoChatMessages,
} from '@/lib/mongodb';

const json = (x: unknown, n = 200) =>
  Response.json(x, { status: n, headers: { 'Cache-Control': 'private, no-store' } });

const digest = async (s: string) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))),
    (x) => x.toString(16).padStart(2, '0')
  ).join('');

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Untrusted request.' }, 403);
  try {
    const x = await readSmall(req);
    const db = getPlatformDb();
    const action = x.action;
    const now = Date.now();

    if (action === 'start') {
      if (!(await quota(req, 'chat-start', 4))) {
        return json({ error: 'Please try again later.' }, 429);
      }
      const name = bounded(x.name, 80, 2);
      const email = bounded(x.email, 254, 3).toLowerCase();
      const body = bounded(x.body, 1200, 2);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Enter a valid email.' }, 400);
      }
      const thread = crypto.randomUUID();
      const token = crypto.randomUUID() + crypto.randomUUID();
      const secretHash = await digest(token);
      const msgId = crypto.randomUUID();

      await db.batch([
        db
          .prepare('INSERT INTO chat_threads(id,secret,name,email,updated) VALUES(?,?,?,?,?)')
          .bind(thread, secretHash, name, email, now),
        db
          .prepare('INSERT INTO chat_messages(id,thread,role,body,created) VALUES(?,?,?,?,?)')
          .bind(msgId, thread, 'Visitor', body, now),
      ]);

      await Promise.all([
        saveChatThreadToMongo({ id: thread, secret: secretHash, name, email, updated: now }),
        saveChatMessageToMongo({ id: msgId, thread, role: 'Visitor', body, created: now }),
      ]);

      return json({ thread, token }, 201);
    }

    const owner = action === 'ownerList' || action === 'ownerRead' || action === 'ownerReply';
    if (owner && !(await adminAccess(req)).allowed) {
      return json({ error: 'Owner access required.' }, 403);
    }

    if (action === 'ownerList') {
      const [localRes, mongoThreads] = await Promise.all([
        db
          .prepare('SELECT id,name,email,updated FROM chat_threads ORDER BY updated DESC LIMIT 100')
          .all<{ id: string; name: string; email: string; updated: number }>()
          .catch(() => ({ results: [] })),
        getMongoChatThreads(100).catch(() => []),
      ]);
      const threadMap = new Map<string, { id: string; name: string; email: string; updated: number }>();
      for (const t of mongoThreads) {
        threadMap.set(t.id, { id: t.id, name: t.name, email: t.email, updated: t.updated });
      }
      for (const t of localRes.results || []) {
        const prev = threadMap.get(t.id);
        if (!prev || t.updated >= prev.updated) {
          threadMap.set(t.id, t);
        }
      }
      const threads = Array.from(threadMap.values()).sort((a, b) => b.updated - a.updated);
      return json({ threads });
    }

    const thread = bounded(x.thread, 36, 36);
    if (!owner) {
      const token = bounded(x.token, 72, 72);
      const secretHash = await digest(token);
      let validThread = await db
        .prepare('SELECT id FROM chat_threads WHERE id=? AND secret=?')
        .bind(thread, secretHash)
        .first();
      if (!validThread) {
        const mongoThreads = await getMongoChatThreads(100);
        const found = mongoThreads.find((t) => t.id === thread && t.secret === secretHash);
        if (found) {
          validThread = { id: found.id };
          await db
            .prepare('INSERT OR REPLACE INTO chat_threads(id,secret,name,email,updated) VALUES(?,?,?,?,?)')
            .bind(found.id, found.secret, found.name, found.email, found.updated)
            .run()
            .catch(() => {});
        }
      }
      if (!validThread) return json({ error: 'Chat unavailable.' }, 403);
    } else {
      let exists = await db.prepare('SELECT id FROM chat_threads WHERE id=?').bind(thread).first();
      if (!exists) {
        const mongoThreads = await getMongoChatThreads(100);
        const found = mongoThreads.find((t) => t.id === thread);
        if (found) {
          exists = { id: found.id };
          await db
            .prepare('INSERT OR REPLACE INTO chat_threads(id,secret,name,email,updated) VALUES(?,?,?,?,?)')
            .bind(found.id, found.secret, found.name, found.email, found.updated)
            .run()
            .catch(() => {});
        }
      }
      if (!exists) return json({ error: 'Chat not found.' }, 404);
    }

    if (action === 'send' || action === 'ownerReply') {
      if (!owner && !(await quota(req, 'chat-message', 35))) {
        return json({ error: 'Please wait before sending more messages.' }, 429);
      }
      const body = bounded(x.body, 1200, 1);
      const msgId = crypto.randomUUID();
      const role = owner ? 'Studio' : 'Visitor';
      await db.batch([
        db
          .prepare('INSERT INTO chat_messages(id,thread,role,body,created) VALUES(?,?,?,?,?)')
          .bind(msgId, thread, role, body, now),
        db.prepare('UPDATE chat_threads SET updated=? WHERE id=?').bind(now, thread),
      ]);
      await saveChatMessageToMongo({ id: msgId, thread, role, body, created: now });
    } else if (action !== 'read' && action !== 'ownerRead') {
      return json({ error: 'Unknown action.' }, 400);
    }

    const [localMsgs, mongoMsgs] = await Promise.all([
      db
        .prepare(
          'SELECT role,body,created FROM (SELECT role,body,created FROM chat_messages WHERE thread=? ORDER BY created DESC,rowid DESC LIMIT 80) ORDER BY created'
        )
        .bind(thread)
        .all<{ role: string; body: string; created: number }>()
        .catch(() => ({ results: [] })),
      getMongoChatMessages(thread, 80).catch(() => []),
    ]);

    const messages =
      (localMsgs.results || []).length >= mongoMsgs.length
        ? localMsgs.results
        : mongoMsgs.map((m) => ({ role: m.role, body: m.body, created: m.created }));

    return json({ messages });
  } catch {
    return json({ error: 'Chat unavailable or invalid input. Please try again.' }, 400);
  }
}
