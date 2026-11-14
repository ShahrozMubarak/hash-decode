import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, newTotpSecret, totp, validTotpStep, encrypt, decrypt, recoveryCodes, sha256 } from '../lib/security-crypto.mjs';
import { assertOrigin, readJson } from '../lib/http.ts';
import { getToken, sessionCookie, sessionFresh } from '../lib/owner-session.ts';
import { inquirySchema } from '../lib/form-validation.ts';
import { databaseConfig } from '../lib/db.ts';
import { sendMail } from '../lib/notify.ts';
test('password hashing rejects weak input; wrong password and dummy checks reject', async () => {
  await assert.rejects(hashPassword('short'));
  const hash = await hashPassword('A long test password 123');
  assert.equal(await verifyPassword('A long test password 123', hash), true);
  assert.equal(await verifyPassword('Incorrect password', hash), false);
  assert.equal(await verifyPassword('A long test password 123', ''), false);
});
test('RFC 6238 SHA1 vector, wrong code, reuse and +/-1 window', () => {
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  assert.equal(totp(secret, 1), '287082');
  assert.equal(validTotpStep(secret, '287082', -1, 59000), 1);
  assert.equal(validTotpStep(secret, '287082', 1, 59000), null);
  assert.equal(validTotpStep(secret, '000000', -1, 59000), null);
  const generated = newTotpSecret(); assert.match(generated, /^[A-Z2-7]{32}$/);
  assert.equal(validTotpStep(generated, totp(generated, 200), -1, 201 * 30000), 200);
});
test('AES-GCM authentication and hashed recovery codes', () => {
  process.env.ENCRYPTION_KEY = 'ac'.repeat(32);
  const value = encrypt('private TOTP secret'); assert.equal(decrypt(value), 'private TOTP secret');
  const parts = value.split('.'); parts[2] = Buffer.from('tampered').toString('base64');
  assert.throws(() => decrypt(parts.join('.')));
  const codes = recoveryCodes(); assert.equal(new Set(codes).size, 10); assert.notEqual(sha256(codes[0]), codes[0]);
});
test('cookie flags, no legacy cookie/bearer, absolute and idle expiry', () => {
  const cookie = sessionCookie('ab'.repeat(32));
  for (const flag of ['__Host-hd_admin=', 'Secure', 'HttpOnly', 'SameSite=Strict', 'Path=/']) assert.ok(cookie.includes(flag));
  assert.ok(!cookie.includes('Domain='));
  assert.equal(getToken('studio-session=' + 'ab'.repeat(32)), null);
  assert.equal(getToken(cookie), 'ab'.repeat(32));
  assert.equal(sessionFresh({ expiresAt: new Date(Date.now() + 60000), lastSeenAt: new Date() }), true);
  assert.equal(sessionFresh({ expiresAt: new Date(0), lastSeenAt: new Date() }), false);
  assert.equal(sessionFresh({ expiresAt: new Date(Date.now() + 60000), lastSeenAt: new Date(Date.now() - 1800001) }), false);
});
test('strict origin rejects cross-origin, missing origin and forwarded-host spoofing', () => {
  delete process.env.APP_ORIGIN;
  assert.doesNotThrow(() => assertOrigin(new Request('https://hashdecode.test/api/admin', { headers: { origin: 'https://hashdecode.test' } })));
  for (const headers of [{}, { origin: 'https://evil.test' }, { origin: 'https://evil.test', 'x-forwarded-host': 'evil.test' }]) assert.throws(() => assertOrigin(new Request('https://hashdecode.test/api/admin', { headers })));
});
test('body limit and Mongo operator injection', async () => {
  const request = body => new Request('https://hashdecode.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  await assert.rejects(readJson(request('x'.repeat(20481))), error => error.status === 413);
  await assert.rejects(readJson(request('[]')), error => error.status === 400);
  assert.equal(inquirySchema.safeParse({ email: { $ne: '' } }).success, false);
});
test('preview database guard rejects production names', () => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017'; process.env.MONGODB_DB_NAME = 'hashdecode_prod'; process.env.APP_ENV = 'preview'; delete process.env.VERCEL_ENV;
  assert.throws(databaseConfig); process.env.MONGODB_DB_NAME = 'hashdecode_preview'; assert.equal(databaseConfig().name, 'hashdecode_preview');
});
test('email escapes HTML, strips subject newlines and exposes provider rejection', async () => {
  const original = globalThis.fetch;
  process.env.RESEND_API_KEY = 'test-only'; process.env.EMAIL_FROM = 'sender@example.test'; process.env.EMAIL_TO = 'owner@example.test';
  let payload;
  globalThis.fetch = async (_url, options) => { payload = JSON.parse(options.body); return Response.json({ message: 'Sender is not verified' }, { status: 403 }); };
  try {
    const result = await sendMail('Subject\r\nInjected', '<img onerror=alert(1)>', 'visitor@example.test');
    assert.equal(result.emailStatus, 'failed'); assert.equal(result.emailError, 'Sender is not verified');
    assert.ok(!payload.subject.includes('\n')); assert.ok(!payload.html.includes('<img')); assert.equal(payload.reply_to, 'visitor@example.test'); assert.equal(payload.text, '<img onerror=alert(1)>');
  } finally { globalThis.fetch = original; delete process.env.RESEND_API_KEY; delete process.env.EMAIL_FROM; delete process.env.EMAIL_TO; }
});
