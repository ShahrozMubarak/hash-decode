import { getDb } from './db';
import { assertOrigin, HttpError } from './http';
import { sha256, randomToken, equal, decrypt, validTotpStep } from './security-crypto.mjs';
import { getClientIp, ipHash } from './abuse';

export const cookieName = process.env.NODE_ENV === 'production' ? '__Host-hd_admin' : 'hd_admin';
export const legacyCookieName = '__Host-hd_admin';
export const sessionSeconds = 43200;

export interface Owner {
  _id: string;
  email: string;
  passwordHash: string;
  totpSecret: string;
  lastTotpStep: number;
  recoveryHashes: string[];
  credentialVersion: string;
  failures: number;
  lockLevel: number;
  lockedUntil?: Date;
}

export interface Session {
  tokenHash: string;
  csrf: string;
  ownerId: string;
  credentialVersion: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  uaHash: string;
  ipPrefixHash: string;
  reauthenticatedAt?: Date;
}

export function getToken(cookies: string | null) {
  if (!cookies) return null;
  const parts = cookies.split(';').map((p) => p.trim());
  for (const name of [cookieName, legacyCookieName, 'hd_admin']) {
    const match = parts.find((p) => p.startsWith(name + '='));
    if (match) {
      const token = match.slice(name.length + 1);
      if (/^[a-f0-9]{64}$/.test(token)) return token;
    }
  }
  return null;
}

export function sessionCookie(token: string, age = sessionSeconds) {
  const isProd = process.env.NODE_ENV === 'production';
  const name = isProd ? '__Host-hd_admin' : 'hd_admin';
  const secureFlag = isProd ? ' Secure;' : '';
  return `${name}=${token};${secureFlag} HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}`;
}

export function sessionFresh(session: Session, now = Date.now()) {
  const expiresMs = new Date(session.expiresAt).getTime();
  const lastSeenMs = new Date(session.lastSeenAt).getTime();
  return expiresMs > now && lastSeenMs > now - 30 * 60000;
}

export async function requireOwner(req?: Request, write = false): Promise<Session> {
  let request = req;
  if (!request) {
    const { headers } = await import('next/headers');
    request = new Request(process.env.APP_ORIGIN || 'https://hashdecode.com', { headers: await headers() });
  }
  const token = getToken(request.headers.get('cookie'));
  if (!token) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  const db = await getDb();
  const session = await db.collection<Session>('sessions').findOne({ tokenHash: sha256(token) });
  if (!session || !sessionFresh(session)) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  }
  const owner = await db
    .collection<Owner>('adminUsers')
    .findOne({ _id: 'owner', credentialVersion: session.credentialVersion });
  if (!owner) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  if (write) {
    assertOrigin(request);
    if (!equal(request.headers.get('x-csrf-token') || '', session.csrf))
      throw new HttpError(403, 'CSRF', 'Refresh this page and try again.');
  }
  const touched = await db
    .collection<Session>('sessions')
    .updateOne({ tokenHash: session.tokenHash }, { $set: { lastSeenAt: new Date() } });
  if (!touched.matchedCount) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue.');
  return session;
}

export async function consumeSecondFactor(owner: Owner, code: string, allowRecovery = true) {
  const db = await getDb();
  const step = validTotpStep(decrypt(owner.totpSecret), code, owner.lastTotpStep);
  if (step !== null) {
    const result = await db
      .collection<Owner>('adminUsers')
      .updateOne(
        { _id: 'owner', credentialVersion: owner.credentialVersion, lastTotpStep: { $lt: step } },
        { $set: { lastTotpStep: step } }
      );
    return result.modifiedCount === 1;
  }
  if (allowRecovery && /^[a-f0-9]{32}$/.test(code)) {
    const result = await db
      .collection<Owner>('adminUsers')
      .updateOne(
        { _id: 'owner', credentialVersion: owner.credentialVersion, recoveryHashes: sha256(code) },
        { $pull: { recoveryHashes: sha256(code) } }
      );
    return result.modifiedCount === 1;
  }
  return false;
}

export async function issueSession(req: Request, owner: Owner) {
  const db = await getDb(),
    token = randomToken(),
    now = new Date();
  const ip = getClientIp(req);
  const session: Session = {
    tokenHash: sha256(token),
    csrf: randomToken(),
    ownerId: 'owner',
    credentialVersion: owner.credentialVersion,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: new Date(Date.now() + sessionSeconds * 1000),
    uaHash: sha256(req.headers.get('user-agent') || ''),
    ipPrefixHash: sha256(
      ip.includes(':') ? ip.split(':').slice(0, 4).join(':') : ip.split('.').slice(0, 3).join('.')
    ),
  };
  await db.collection<Session>('sessions').insertOne(session);
  return { cookie: sessionCookie(token), session };
}

export async function audit(req: Request, action: string, target = '', detail = '') {
  await (await getDb()).collection('auditLogs').insertOne({
    action,
    target,
    detail: detail.slice(0, 300),
    requestId: crypto.randomUUID(),
    ipHash: ipHash(req),
    userAgent: (req.headers.get('user-agent') || '').slice(0, 160),
    createdAt: new Date(),
  });
}

export function requireRecent(session: Session) {
  void session;
}
