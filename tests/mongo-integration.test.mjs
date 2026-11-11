import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { setup } from '../scripts/database.mjs';
import { hashPassword, encrypt, newTotpSecret, totp, recoveryCodes, sha256, randomToken } from '../lib/security-crypto.mjs';
import { getDb } from '../lib/db/index.ts';
import * as sessionRoute from '../app/api/session/route.ts';
import * as adminRoute from '../app/api/admin/route.ts';
import * as uploadRoute from '../app/api/upload/route.ts';
import * as inquiriesRoute from '../app/api/inquiries/route.ts';
import * as subscribeRoute from '../app/api/subscribe/route.ts';
import { requireOwner } from '../lib/owner-session.ts';
const uri = process.env.TEST_MONGODB_URI;
test('MongoDB route integration (isolated disposable database)', { skip: !uri }, async t => {
  process.env.MONGODB_URI = uri; process.env.MONGODB_DB_NAME = 'hashdecode_test_' + randomUUID().replaceAll('-', '') + '_dev';
  process.env.APP_ENV = 'development'; delete process.env.VERCEL_ENV; delete process.env.VERCEL;
  process.env.ENCRYPTION_KEY = 'cd'.repeat(32); process.env.APP_ORIGIN = 'https://hashdecode.test';
  delete process.env.RESEND_API_KEY; delete process.env.EMAIL_FROM; delete process.env.EMAIL_TO;
  const db = await getDb(); await setup(db);
  const secret = newTotpSecret(), codes = recoveryCodes(), password = 'A secure test password 123';
  await db.collection('adminUsers').insertOne({ _id: 'owner', email: 'owner@example.test', passwordHash: await hashPassword(password), totpSecret: encrypt(secret), lastTotpStep: -1, recoveryHashes: codes.map(sha256), credentialVersion: randomToken(), failures: 0, lockLevel: 0 });
  const req = (path, body, cookie = '', csrf = '', origin = 'https://hashdecode.test') => new Request('https://hashdecode.test' + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Origin: origin, 'User-Agent': 'Hash Decode integration test', Cookie: cookie, 'X-CSRF-Token': csrf }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const login = body => sessionRoute.POST(req('/api/session', { action: 'login', email: 'owner@example.test', password, code: totp(secret), ...body }));
  let cookie, csrf;
  try {
    await t.test('every private API rejects unauthenticated reads and mutations; page guard rejects', async () => {
      assert.equal((await sessionRoute.GET(req('/api/session'))).status, 401);
      assert.equal((await adminRoute.GET(req('/api/admin'))).status, 401);
      assert.equal((await adminRoute.POST(req('/api/admin', { action: 'settings' }))).status, 401);
      assert.equal((await uploadRoute.POST(req('/api/upload', {}))).status, 401);
      await assert.rejects(requireOwner(req('/admin')), e => e.status === 401);
    });
    await t.test('wrong password, wrong code, five failures and persistent lockout', async () => {
      assert.equal((await login({ password: 'not the right password' })).status, 401);
      assert.equal((await login({ code: 'invalid' })).status, 401);
      for (let i = 0; i < 3; i++) assert.equal((await login({ password: 'incorrect' })).status, 401);
      const owner = await db.collection('adminUsers').findOne({ _id: 'owner' }); assert.ok(owner.lockedUntil > new Date());
      assert.equal((await login({})).status, 401);
      await db.collection('rateLimits').deleteMany({ scope: 'loginFailure' });
      await db.collection('adminUsers').updateOne({ _id: 'owner' }, { $set: { lockedUntil: new Date(0), failures: 0, lockLevel: 0, lastTotpStep: -1 } });
    });
    await t.test('TOTP login, cookie only, no bearer token response, replay rejected', async () => {
      const reusedCode = totp(secret);
      const response = await login({ code: reusedCode }); assert.equal(response.status, 200);
      cookie = response.headers.get('set-cookie').split(';')[0]; const body = await response.json(); csrf = body.data.csrf;
      assert.equal(body.token, undefined); assert.equal((await login({ code: reusedCode })).status, 401);
      assert.equal((await sessionRoute.GET(req('/api/session', null, cookie))).status, 200);
      assert.equal((await adminRoute.GET(req('/api/admin?view=health', null, cookie))).status, 200);
    });
    await t.test('CSRF, cross-origin POST and export without reauthentication rejected', async () => {
      assert.equal((await adminRoute.POST(req('/api/admin', { action: 'settings' }, cookie))).status, 403);
      assert.equal((await adminRoute.POST(req('/api/admin', { action: 'settings' }, cookie, csrf, 'https://evil.test'))).status, 403);
      assert.equal((await adminRoute.POST(req('/api/admin', { action: 'export' }, cookie, csrf))).status, 403);
    });
    await t.test('inquiry persists first; notification failure remains visible; duplicate retry is idempotent', async () => {
      const payload = { name: 'Preview visitor', email: 'visitor@example.test', topic: 'Web platform', budget: 'Still exploring', brief: 'A real project brief for testing persistence.', startedAt: String(Date.now() - 5000), submissionId: randomUUID(), website: '' };
      const first = await inquiriesRoute.POST(req('/api/inquiries', payload)); assert.equal(first.status, 201);
      const saved = await db.collection('inquiries').findOne({ id: payload.submissionId }); assert.equal(saved.emailStatus, 'skipped');
      const second = await inquiriesRoute.POST(req('/api/inquiries', payload)); assert.equal(second.status, 200);
      assert.equal(await db.collection('inquiries').countDocuments({ id: payload.submissionId }), 1);
      const inbox = await adminRoute.GET(req('/api/admin?view=inquiries', null, cookie)); const json = await inbox.json(); assert.equal(json.data.rows[0].id, payload.submissionId);
      assert.equal((await inquiriesRoute.POST(req('/api/inquiries', { ...payload, email: { $ne: '' } }))).status, 400);
    });
    await t.test('newsletter is unique and duplicate response is indistinguishable', async () => {
      const payload = { email: 'subscriber@example.test', startedAt: String(Date.now() - 5000), website: '' };
      const a = await subscribeRoute.POST(req('/api/subscribe', payload)), b = await subscribeRoute.POST(req('/api/subscribe', payload));
      assert.deepEqual(await a.json(), await b.json()); assert.equal(await db.collection('subscribers').countDocuments({ email: payload.email }), 1);
    });
    await t.test('founder edits persist and draft records stay private', async () => {
      const row = { id: 'test-founder', name: 'Test founder', role: 'Engineer', bio: 'Test biography', image: '', url: '', skills: [], quote: '', position: 1, status: 'draft' };
      assert.equal((await adminRoute.POST(req('/api/admin', { action: 'save', collection: 'founders', data: row, isNew: true }, cookie, csrf))).status, 200);
      assert.equal((await adminRoute.POST(req('/api/admin', { action: 'save', collection: 'founders', data: { ...row, bio: 'Changed biography' }, isNew: false }, cookie, csrf))).status, 200);
      const independent = new MongoClient(uri); await independent.connect();
      try { assert.equal((await independent.db(db.databaseName).collection('founders').findOne({ id: row.id })).bio, 'Changed biography'); } finally { await independent.close(); }
      const { listFounders } = await import('../lib/studio-data.ts'); assert.equal((await listFounders()).length, 0);
    });
    await t.test('published blog post visible; future post remains private', async () => {
      for (const [id, publishAt] of [['published-test', null], ['future-test', new Date(Date.now() + 86400000).toISOString()]]) {
        const data = { id, title: 'Test article', label: 'Engineering', body: 'Content that remains safe as text.', image: '', url: '', status: 'published', publishAt };
        assert.equal((await adminRoute.POST(req('/api/admin', { action: 'save', collection: 'posts', data, isNew: true }, cookie, csrf))).status, 200);
      }
      const { entries } = await import('../lib/cms.ts'); const posts = await entries('post'); assert.equal(posts.length, 1); assert.equal(posts[0].id, 'published-test');
    });
    await t.test('idle/absolute expiry and logout kill sessions', async () => {
      const tokenHash = sha256(cookie.split('=')[1]);
      await db.collection('sessions').updateOne({ tokenHash }, { $set: { lastSeenAt: new Date(Date.now() - 1800001) } });
      assert.equal((await sessionRoute.GET(req('/api/session', null, cookie))).status, 401);
      await db.collection('sessions').updateOne({ tokenHash }, { $set: { lastSeenAt: new Date(), expiresAt: new Date(0) } });
      assert.equal((await sessionRoute.GET(req('/api/session', null, cookie))).status, 401);
      await db.collection('sessions').updateOne({ tokenHash }, { $set: { expiresAt: new Date(Date.now() + 60000) } });
      assert.equal((await sessionRoute.POST(req('/api/session', { action: 'logout' }, cookie, csrf))).status, 200);
      assert.equal((await sessionRoute.GET(req('/api/session', null, cookie))).status, 401);
    });
    await t.test('recovery code is single use', async () => {
      assert.equal((await login({ code: codes[0] })).status, 200);
      assert.equal((await login({ code: codes[0] })).status, 401);
    });
  } finally {
    if (!/^hashdecode_test_[a-f0-9]+_dev$/.test(db.databaseName)) throw Error('Refusing to clean up a non-test database.');
    await db.dropDatabase();
    await db.client.close();
    globalThis.hdMongo = undefined;
  }
});
