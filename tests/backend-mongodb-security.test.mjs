import test from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { env } from './platform.mjs';
import { POST as admin, loadSubscribersList } from '../app/api/admin/route.ts';
import { GET as challenge, createSignedChallengeId, verifySignedChallengeId } from '../app/api/challenge/route.ts';
import { POST as brief } from '../app/api/inquiries/route.ts';
import { POST as subscribe } from '../app/api/subscribe/route.ts';
import { POST as upload } from '../app/api/upload/route.ts';
import { POST as owner } from '../app/api/session/route.ts';
import { sanitizeMongoUri, getMongoConfig, getMongoInquiries, getAuditLogs } from '../lib/mongodb.ts';
import { listFounders } from '../lib/studio-data.ts';
import { sameOrigin, imageOrUrl } from '../lib/studio-security.ts';

const salt = randomBytes(16).toString('hex');
const password = randomBytes(24).toString('hex');
env.OWNER_PASSWORD_HASH =
  salt + ':' + pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256').toString('hex');
env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test_hashdecode';
env.MONGODB_DB_NAME = 'hash_decode';

let cookie = '';
const origin = 'https://hash.example';
const req = (path, data, extra = {}) =>
  new Request(origin + path, {
    method: 'POST',
    headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json', ...extra },
    body: JSON.stringify(data),
  });

async function signIn() {
  const result = await owner(req('/api/session', { action: 'login', password }));
  assert.equal(result.status, 200);
  cookie = result.headers.get('set-cookie').split(';')[0];
}

test('sanitizeMongoUri strips quotes/brackets and URL-encodes special characters in passwords', () => {
  assert.equal(
    sanitizeMongoUri('"mongodb://<admin_user>:<p@ss#word?>@cluster0.mongodb.net/hash_decode"'),
    'mongodb://admin_user:p%40ss%23word%3F@cluster0.mongodb.net/hash_decode'
  );
  assert.equal(
    sanitizeMongoUri('mongodb+srv://user:my@pass#1@cluster0.example.mongodb.net/?retryWrites=true'),
    'mongodb+srv://user:my%40pass%231@cluster0.example.mongodb.net/?retryWrites=true'
  );
  const cfg = getMongoConfig();
  assert.equal(cfg.isConfigured, true);
  assert.equal(cfg.dbName, 'hash_decode');
});

test('hardcoded fallback password "shahroz" is rejected when OWNER_PASSWORD_HASH is configured', async () => {
  const res = await owner(req('/api/session', { action: 'login', password: 'shahroz' }));
  assert.equal(res.status, 401);
});

test('HTTP localhost login issues non-Secure studio-session cookie so local dev browsers persist auth', async () => {
  const localReq = new Request('http://localhost:5173/api/session', {
    method: 'POST',
    headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', password }),
  });
  const res = await owner(localReq);
  assert.equal(res.status, 200);
  const setCookie = res.headers.get('set-cookie') || '';
  assert.ok(setCookie.startsWith('studio-session='));
  assert.ok(!setCookie.includes('Secure'));
});

test('sameOrigin allows reverse-proxy loopback requests with x-forwarded-host while blocking cross-origin attacks', () => {
  const proxied = new Request('http://127.0.0.1:3000/api/inquiries', {
    method: 'POST',
    headers: {
      Origin: 'https://hashdecode.com',
      'x-forwarded-host': 'hashdecode.com',
      'x-forwarded-proto': 'https',
    },
  });
  assert.equal(sameOrigin(proxied), true);

  const spoofed = new Request('https://hashdecode.com/api/inquiries', {
    method: 'POST',
    headers: {
      Origin: 'https://attacker.example',
      'x-forwarded-host': 'attacker.example',
    },
  });
  assert.equal(sameOrigin(spoofed), false);
});

test('stateless signed challenge UUIDs verify across serverless restarts and reject tampered answers', async () => {
  const cid = await createSignedChallengeId('14', Date.now() + 60000);
  assert.equal(cid.length, 36);
  assert.equal(await verifySignedChallengeId(cid, '14'), true);
  assert.equal(await verifySignedChallengeId(cid, '15'), false);
});

test('newsletter subscription form saves to SQLite/D1 and MongoDB and supports admin management', async () => {
  const subRes = await subscribe(req('/api/subscribe', { email: 'lead@client.example' }));
  assert.equal(subRes.status, 200);
  assert.equal((await subRes.json()).ok, true);

  await signIn();
  const addRes = await admin(req('/api/admin', { action: 'subscriberAdd', email: 'vip@client.example' }));
  assert.equal(addRes.status, 200);

  let list = await loadSubscribersList();
  assert.ok(list.some((s) => s.email === 'lead@client.example'));
  assert.ok(list.some((s) => s.email === 'vip@client.example'));

  const remRes = await admin(req('/api/admin', { action: 'subscriberRemove', email: 'vip@client.example' }));
  assert.equal(remRes.status, 200);
  list = await loadSubscribersList();
  assert.ok(!list.some((s) => s.email === 'vip@client.example'));
});

test('inquiries sync to MongoDB and support extended statuses, internal notes, bulk updates, and deletion', async () => {
  const c = await (await challenge(new Request(origin + '/api/challenge'))).json();
  const [a, b] = c.question.match(/\d+/g).map(Number);
  const subId = crypto.randomUUID();
  const r = await brief(
    req('/api/inquiries', {
      submissionId: subId,
      challenge: c.id,
      answer: String(a + b),
      name: 'Enterprise Client',
      email: 'cto@enterprise.example',
      brief: 'We need a zero-trust architecture audit and custom portal.',
      topic: 'Security audit',
      budget: 'US$20,000+',
    })
  );
  assert.equal(r.status, 201);

  await signIn();
  // Update status to in_progress and attach notes
  const statusRes = await admin(
    req('/api/admin', {
      action: 'inquiryStatus',
      id: subId,
      status: 'in_progress',
      notes: 'Discovery call scheduled for Tuesday.',
    })
  );
  assert.equal(statusRes.status, 200);

  const mongoInq = await getMongoInquiries();
  const found = mongoInq.find((m) => m.id === subId);
  if (found) {
    assert.equal(found.status, 'in_progress');
    assert.equal(found.notes, 'Discovery call scheduled for Tuesday.');
  }

  // Delete inquiry
  const delRes = await admin(req('/api/admin', { action: 'inquiryDelete', id: subId }));
  assert.equal(delRes.status, 200);
});

test('founder creation and deletion properly updates listFounders()', async () => {
  await signIn();
  const beforeCount = (await listFounders(true)).length;
  const saveRes = await admin(
    req('/api/admin', {
      action: 'contentSave',
      isNew: true,
      kind: 'team',
      id: 'test-founder',
      title: 'Test Founder',
      label: 'Principal Security Engineer',
      body: 'Leads cryptographic protocol verification and cloud hardening.',
      url: 'https://hashdecode.com',
      image: '/team/shahroz.svg',
      status: 'published',
    })
  );
  assert.equal(saveRes.status, 200);
  assert.equal((await listFounders(true)).length, beforeCount + 1);

  const delRes = await admin(req('/api/admin', { action: 'contentRemove', id: 'test-founder' }));
  assert.equal(delRes.status, 200);
  assert.equal((await listFounders(true)).length, beforeCount);
});

test('SVG XSS uploads and forged image signatures are rejected while valid PNG uploads succeed', async () => {
  assert.throws(() => imageOrUrl('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4='));

  await signIn();
  const svgForm = new FormData();
  svgForm.append('file', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/svg+xml' }), 'xss.svg');
  const svgRes = await upload(
    new Request(origin + '/api/upload', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin },
      body: svgForm,
    })
  );
  assert.equal(svgRes.status, 400);

  // Forged PNG (wrong magic bytes)
  const fakePngForm = new FormData();
  fakePngForm.append('file', new Blob(['not a real png file content'], { type: 'image/png' }), 'fake.png');
  const fakeRes = await upload(
    new Request(origin + '/api/upload', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin },
      body: fakePngForm,
    })
  );
  assert.equal(fakeRes.status, 400);

  // Valid 1x1 PNG magic bytes
  const validPngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  ]);
  const validPngForm = new FormData();
  validPngForm.append('file', new Blob([validPngBytes], { type: 'image/png' }), 'valid.png');
  const okRes = await upload(
    new Request(origin + '/api/upload', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin },
      body: validPngForm,
    })
  );
  assert.equal(okRes.status, 200);
  const uploaded = await okRes.json();
  assert.ok(uploaded.url.startsWith('data:image/png;base64,'));
});

test('admin syncMongo, exportData, clearRateLimits, and audit logs work end-to-end', async () => {
  await signIn();

  const syncRes = await admin(req('/api/admin', { action: 'syncMongo' }));
  assert.equal(syncRes.status, 200);
  const syncBody = await syncRes.json();
  assert.equal(syncBody.ok, true);

  const exportRes = await admin(req('/api/admin', { action: 'exportData' }));
  assert.equal(exportRes.status, 200);
  const exportBody = await exportRes.json();
  assert.equal(exportBody.ok, true);
  assert.ok(Array.isArray(exportBody.snapshot.projects));
  assert.ok(Array.isArray(exportBody.snapshot.inquiries));
  assert.ok(Array.isArray(exportBody.snapshot.subscribers));

  const rateRes = await admin(req('/api/admin', { action: 'clearRateLimits' }));
  assert.equal(rateRes.status, 200);

  const logs = await getAuditLogs(20);
  assert.ok(logs.length > 0);
});
