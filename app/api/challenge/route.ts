import { quota, runtime } from '@/lib/abuse';
import { getPlatformDb } from '@/lib/platform-db';
import { getMongoDb } from '@/lib/mongodb';

const issuedChallengeIds = new Set<string>();
const consumedChallengeIds = new Set<string>();

export function markChallengeIssued(id: string) {
  issuedChallengeIds.add(id);
}

export function wasChallengeIssuedHere(id: string) {
  return issuedChallengeIds.has(id);
}

export function markChallengeConsumed(id: string) {
  consumedChallengeIds.add(id);
}

export function isChallengeConsumed(id: string) {
  return consumedChallengeIds.has(id);
}

const toHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');

async function challengeMac(expiresSecHex: string, nonceHex: string, answer: string): Promise<string> {
  const secret = runtime('OWNER_PASSWORD_HASH') || runtime('ADMIN_PASSWORD') || 'hd-studio-challenge-key-v1';
  const payload = `hd-challenge:${secret}:${expiresSecHex}:${nonceHex}:${answer.trim()}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return toHex(digest);
}

export async function createSignedChallengeId(answer: string, expiresMs: number): Promise<string> {
  const expiresSec = Math.floor(expiresMs / 1000);
  const expiresSecHex = expiresSec.toString(16).padStart(8, '0').slice(-8);
  const rand = crypto.getRandomValues(new Uint8Array(4));
  const nonceA = Array.from(rand.slice(0, 2), (b) => b.toString(16).padStart(2, '0')).join('');
  const nonceB = Array.from(rand.slice(2, 4), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 3);
  const mac = await challengeMac(expiresSecHex, `${nonceA}${nonceB}`, answer);
  // Format as RFC 4122 UUID v4: 8-4-4-4-12 (total 36 chars)
  return `${expiresSecHex}-${nonceA}-4${nonceB}-8${mac.slice(0, 3)}-${mac.slice(3, 15)}`;
}

export async function verifySignedChallengeId(id: string, answer: string): Promise<boolean> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return false;
  }
  const parts = id.toLowerCase().split('-');
  const expiresSecHex = parts[0];
  const expiresSec = parseInt(expiresSecHex, 16);
  if (Number.isNaN(expiresSec) || expiresSec * 1000 < Date.now()) {
    return false;
  }
  const nonceA = parts[1];
  const nonceB = parts[2].slice(1);
  const expectedMac = await challengeMac(expiresSecHex, `${nonceA}${nonceB}`, answer);
  const actualMacSlice = parts[3].slice(1) + parts[4];
  const expectedSlice = expectedMac.slice(0, 15);
  let diff = 0;
  for (let i = 0; i < 15; i++) {
    diff |= actualMacSlice.charCodeAt(i) ^ expectedSlice.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET(req: Request) {
  try {
    if (!(await quota(req, 'captcha', 1000, 10 * 60 * 1000))) {
      return Response.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }
    const siteKey = runtime('TURNSTILE_SITE_KEY');
    if (siteKey && runtime('TURNSTILE_SECRET')) {
      return Response.json({ siteKey }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const v = crypto.getRandomValues(new Uint8Array(2));
    const a = (v[0] % 9) + 2;
    const b = (v[1] % 8) + 2;
    const answer = String(a + b);
    const expires = Date.now() + 600000;
    const id = await createSignedChallengeId(answer, expires);
    markChallengeIssued(id);

    const db = getPlatformDb();
    await db.batch([
      db.prepare('DELETE FROM human_challenges WHERE expires<?').bind(Date.now()),
      db.prepare('INSERT INTO human_challenges(id,answer,expires) VALUES (?,?,?)').bind(id, answer, expires),
    ]);

    try {
      const mongo = await getMongoDb();
      if (mongo) {
        await mongo.collection('human_challenges').deleteMany({ expires: { $lt: Date.now() } });
        await mongo.collection('human_challenges').insertOne({ id, answer, expires, createdAt: new Date() });
      }
    } catch {}

    return Response.json(
      { id, question: `What is ${a} + ${b}?` },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.warn('[Challenge fallback]:', err);
    const v = crypto.getRandomValues(new Uint8Array(2));
    const a = (v[0] % 9) + 2;
    const b = (v[1] % 8) + 2;
    const answer = String(a + b);
    const expires = Date.now() + 600000;
    const id = await createSignedChallengeId(answer, expires);
    markChallengeIssued(id);
    return Response.json(
      { id, question: `What is ${a} + ${b}?` },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
