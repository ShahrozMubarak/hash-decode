import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { requireOwner, requireRecent, consumeSecondFactor, audit, sessionCookie, type Owner } from '@/lib/owner-session';
import { readJson, ok, failure, HttpError } from '@/lib/http';
import { enforceLimit } from '@/lib/abuse';
import { projectSchema, founderSchema, postSchema, settingsSchema } from '@/lib/content-models';
import { emailConfigured, mailBrief, sendMail } from '@/lib/notify';
import { hashPassword, recoveryCodes, sha256, randomToken } from '@/lib/security-crypto.mjs';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const editable = ['projects', 'founders', 'posts'] as const;
function field(value: unknown, max = 100) { if (typeof value !== 'string' || value.length > max) throw new HttpError(400, 'INPUT', 'Invalid field.'); return value; }
export async function GET(req: Request) {
  try {
    const session = await requireOwner(req);
    const db = await getDb();
    const action = new URL(req.url).searchParams.get('view') || 'overview';
    if (action === 'health') {
      await db.command({ ping: 1 });
      const counts = Object.fromEntries(await Promise.all(['inquiries', 'projects', 'founders', 'posts', 'subscribers'].map(async name => [name, await db.collection(name).countDocuments()])));
      return ok({ connected: true, database: db.databaseName, counts, emailConfigured: emailConfigured() });
    }
    if (action === 'security') {
      const sessions = await db.collection('sessions').find({ ownerId: session.ownerId, expiresAt: { $gt: new Date() }, lastSeenAt: { $gt: new Date(Date.now() - 1800000) } }, { projection: { _id: 0, createdAt: 1, lastSeenAt: 1, expiresAt: 1, tokenHash: 1 } }).toArray();
      const logs = await db.collection('auditLogs').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(100).toArray();
      return ok({ sessions: sessions.map(s => ({ ...s, current: s.tokenHash === session.tokenHash })), logs, twoFactor: true });
    }
    if (action === 'settings') return ok({ site: await db.collection('settings').findOne({ id: 'site' }, { projection: { _id: 0 } }), emailConfigured: emailConfigured() });
    if (['inquiries', 'projects', 'founders', 'posts', 'subscribers'].includes(action)) {
      const page = Math.max(1, Math.min(10000, Number(new URL(req.url).searchParams.get('page')) || 1));
      const filter = { status: { $ne: 'deleted' } };
      const [rows, total] = await Promise.all([db.collection(action).find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50).toArray(), db.collection(action).countDocuments(filter)]);
      return ok({ rows, total, page });
    }
    if (action !== 'overview') throw new HttpError(400, 'INPUT', 'Unknown view.');
    const since = new Date(Date.now() - 30 * 86400000);
    const [newInquiries, projects, published, drafts, failedEmails, subscribers, attention, activity] = await Promise.all([
      db.collection('inquiries').countDocuments({ createdAt: { $gte: since }, status: { $ne: 'deleted' } }),
      db.collection('projects').countDocuments({ status: { $ne: 'deleted' } }),
      db.collection('posts').countDocuments({ status: 'published', $or: [{ publishAt: null }, { publishAt: { $lte: new Date() } }] }),
      db.collection('posts').countDocuments({ status: 'draft' }),
      db.collection('inquiries').countDocuments({ emailStatus: { $in: ['failed', 'skipped', 'pending'] }, status: { $ne: 'deleted' } }),
      db.collection('subscribers').countDocuments({ status: 'active' }),
      db.collection('inquiries').find({ status: { $ne: 'deleted' }, $or: [{ status: 'new' }, { emailStatus: { $in: ['failed', 'skipped', 'pending'] } }] }, { projection: { _id: 0, name: 1, topic: 1, emailStatus: 1 } }).sort({ createdAt: -1 }).limit(10).toArray(),
      db.collection('auditLogs').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(10).toArray(),
    ]);
    return ok({ counts: { 'Inquiries in 30 days': newInquiries, 'Portfolio projects': projects, 'Published posts': published, 'Draft posts': drafts, 'Emails needing attention': failedEmails, Subscribers: subscribers }, attention, activity });
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    const session = await requireOwner(req, true);
    await enforceLimit(req, 'admin-write', 120, 60000);
    const d = await readJson(req), db = await getDb();
    const action = field(d.action);
    if (action === 'reauth') {
      await enforceLimit(req, 'reauth', 5, 15 * 60000);
      const owner = await db.collection<Owner>('adminUsers').findOne({ _id: 'owner' });
      if (!owner || !(await consumeSecondFactor(owner, field(d.code), false))) throw new HttpError(401, 'REAUTH_FAILED', 'Verification failed. Use a fresh authenticator code.');
      await db.collection('sessions').updateOne({ tokenHash: session.tokenHash }, { $set: { reauthenticatedAt: new Date() } });
      await audit(req, 'reauthenticated'); return ok({});
    }
    if (action === 'revokeSession') {
      await db.collection('sessions').deleteOne({ tokenHash: field(d.tokenHash), ownerId: session.ownerId });
      await audit(req, 'session_revoked'); return ok({});
    }
    if (action === 'password') {
      requireRecent(session);
      const password = field(d.password, 256);
      if (password.length < 14) throw new HttpError(400, 'INPUT', 'Use at least 14 characters.');
      const passwordHash = await hashPassword(password);
      await db.collection<Owner>('adminUsers').updateOne({ _id: 'owner' }, { $set: { passwordHash, credentialVersion: randomToken(), updatedAt: new Date() } });
      await db.collection('sessions').deleteMany({ ownerId: session.ownerId });
      const mail = await sendMail('Hash Decode: password changed', 'Your owner password changed. All owner sessions were revoked.');
      await audit(req, 'password_changed', 'owner', mail.emailStatus);
      return ok({}, 200, { 'Set-Cookie': sessionCookie('', 0) });
    }
    if (action === 'recovery') {
      requireRecent(session); const codes = recoveryCodes();
      await db.collection<Owner>('adminUsers').updateOne({ _id: 'owner' }, { $set: { recoveryHashes: codes.map(sha256) } });
      const mail = await sendMail('Hash Decode: recovery codes changed', 'Your previous recovery codes were replaced.');
      await audit(req, 'recovery_codes_changed', 'owner', mail.emailStatus); return ok({ codes });
    }
    if (action === 'testEmail') { const result = await sendMail('Hash Decode: email configuration test', 'This is the test requested in your owner settings.'); await audit(req, 'email_test', '', result.emailStatus); return ok(result); }
    if (action === 'resend') {
      const id = field(d.id);
      const row = await db.collection<{ id: string; name: string; email: string; topic: string; budget: string; brief: string }>('inquiries').findOne({ id });
      if (!row) throw new HttpError(404, 'NOT_FOUND', 'Inquiry not found.');
      const result = await mailBrief(row, randomToken());
      await db.collection('inquiries').updateOne({ id }, { $set: { ...result, updatedAt: new Date() } });
      await audit(req, 'email_resent', id, result.emailStatus); return ok(result);
    }
    if (action === 'export') {
      requireRecent(session);
      const rows = await db.collection('inquiries').find({ status: { $ne: 'deleted' } }).limit(5000).toArray();
      const cols = ['id', 'name', 'email', 'topic', 'budget', 'brief', 'status'];
      const cell = (value: unknown) => '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""') + '"';
      const csv = [cols.join(','), ...rows.map(row => cols.map(c => cell(row[c])).join(','))].join('\r\n');
      await audit(req, 'inquiries_exported'); return ok({ csv, limit: 5000 });
    }
    if (action === 'inquiry') {
      const id = field(d.id), status = field(d.status);
      if (!['new', 'contacted', 'qualified', 'won', 'lost'].includes(status)) throw new HttpError(400, 'INPUT', 'Invalid status.');
      const notes = field(d.notes, 4000);
      const result = await db.collection<{ id: string; status: string; notes: string; updatedAt: Date; statusHistory: { status: string; at: Date }[] }>('inquiries').updateOne({ id }, { $set: { status, notes, updatedAt: new Date() }, $push: { statusHistory: { status, at: new Date() } } });
      if (!result.matchedCount) throw new HttpError(404, 'NOT_FOUND', 'Inquiry not found.');
      await audit(req, 'inquiry_updated', id);
    } else if (action === 'settings') {
      const parsed = settingsSchema.safeParse(d.data); if (!parsed.success) throw new HttpError(400, 'INPUT', parsed.error.issues[0].message);
      await db.collection('settings').updateOne({ id: 'site' }, { $set: { ...parsed.data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
      await audit(req, 'settings_changed', 'site');
    } else if (action === 'save') {
      const collection = field(d.collection);
      if (!(editable as readonly string[]).includes(collection)) throw new HttpError(400, 'INPUT', 'Invalid collection.');
      const schema = collection === 'projects' ? projectSchema : collection === 'founders' ? founderSchema : postSchema;
      const parsed = schema.safeParse(d.data);
      if (!parsed.success) throw new HttpError(400, 'INPUT', parsed.error.issues[0].message);
      const value = parsed.data;
      const key = 'slug' in value ? { slug: value.slug } : { id: value.id };
      const row = { ...value, ...('publishAt' in value ? { publishAt: value.publishAt ? new Date(value.publishAt) : null, slug: value.id, kind: 'post', updated: Date.now() } : {}), updatedAt: new Date() };
      if (d.isNew === true) {
        try { await db.collection(collection).insertOne({ ...row, createdAt: new Date() }); }
        catch (error) { if ((error as { code?: number }).code === 11000) throw new HttpError(409, 'CONFLICT', 'That address already exists.'); throw error; }
      } else {
        const result = await db.collection(collection).updateOne(key, { $set: row });
        if (!result.matchedCount) throw new HttpError(404, 'NOT_FOUND', 'Record not found.');
      }
      await audit(req, d.isNew === true ? 'created' : 'updated', collection + ':' + Object.values(key)[0]);
    } else if (action === 'archive') {
      const collection = field(d.collection);
      if (!['inquiries', ...editable].includes(collection)) throw new HttpError(400, 'INPUT', 'Invalid collection.');
      const id = field(d.id); const key = collection === 'projects' ? { slug: id } : { id };
      const result = await db.collection(collection).updateOne(key, { $set: { status: 'deleted', updatedAt: new Date() } });
      if (!result.matchedCount) throw new HttpError(404, 'NOT_FOUND', 'Record not found.');
      await audit(req, 'archived', collection + ':' + id);
    } else throw new HttpError(400, 'INPUT', 'Unknown action.');
    for (const path of ['/', '/shahroz', '/about', '/portfolio', '/blog', '/contact', '/sitemap.xml']) revalidatePath(path, 'layout');
    return ok({});
  } catch (error) { return failure(error); }
}
