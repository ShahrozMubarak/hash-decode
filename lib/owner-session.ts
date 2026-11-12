import { getDb } from './db';
import { assertOrigin, HttpError } from './http';
import { sha256, randomToken, equal, decrypt, validTotpStep } from './security-crypto.mjs';
import { getClientIp, ipHash } from './abuse';

export const cookieName = '__Host-hd_admin';
export const fallbackCookieName = 'hd_admin';
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
  lastFailureAt?: Date;
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

function toTimestamp(value: Date | string | number | undefined | null): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getToken(cookies: string | null) {
  if (!cookies) return null;
  const parts = cookies.split(';').map((p) => p.trim());
  for (const name of [cookieName, fallbackCookieName]) {
    const match = parts.find((p) => p.startsWith(name + '='));
    if (match) {
      const token = match.slice(name.length + 1).trim();
      if (/^[a-f0-9]{64}$/.test(token)) return token;
    }
  }
  return null;
}

export function sessionCookie(token: string, age = sessionSeconds, req?: Request) {
  const proto = req?.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const isHttpLocal =
    (proto === 'http' || (req?.url && req.url.startsWith('http://'))) &&
    process.env.NODE_ENV !== 'production';
  if (isHttpLocal) {
    return `${fallbackCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}`;
  }
  return `${cookieName}=${token}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}`;
}

export function sessionFresh(session: Session, now = Date.now()) {
  const expiresAtMs = toTimestamp(session.expiresAt);
  const lastSeenAtMs = toTimestamp(session.lastSeenAt);
  return expiresAtMs > now && lastSeenAtMs > now - 30 * 60000;
}

export async function requireOwner(req?: Request, write = false): Promise<Session> {
  let request = req;
  if (!request) {
    const { headers } = await import('next/headers');
    request = new Request(process.env.APP_ORIGIN || 'https://hashdecode.com', {
      headers: await headers(),
    });
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
    if (!equal(request.headers.get('x-csrf-token') || '', session.csrf)) {
      throw new HttpError(403, 'CSRF', 'Refresh this page and try again.');
    }
  }

  await db
    .collection<Session>('sessions')
    .updateOne({ tokenHash: session.tokenHash }, { $set: { lastSeenAt: new Date() } });

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
        {
          _id: 'owner',
          credentialVersion: owner.credentialVersion,
          recoveryHashes: sha256(code),
        },
        { $pull: { recoveryHashes: sha256(code) } }
      );
    return result.modifiedCount === 1;
  }
  return false;
}

export async function issueSession(req: Request, owner: Owner) {
  const db = await getDb();
  const token = randomToken();
  const now = new Date();
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
  return { cookie: sessionCookie(token, sessionSeconds, req), session };
}

export async function audit(req: Request, action: string, target = '', detail = '') {
  try {
    await (await getDb()).collection('auditLogs').insertOne({
      action,
      target,
      detail: detail.slice(0, 300),
      requestId: crypto.randomUUID(),
      ipHash: ipHash(req),
      userAgent: (req.headers.get('user-agent') || '').slice(0, 160),
      createdAt: new Date(),
    });
  } catch { }
}

export function requireRecent(session: Session) {
  void session;
}
