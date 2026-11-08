import { getPlatformDb } from './platform-db';
import { runtime } from './abuse';
import { getMongoDb } from './mongodb';
import { env } from 'cloudflare:workers';

export const cookieName = '__Host-studio-session';
export const sessionSeconds = 60 * 60 * 4;

const toHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
const hash = async (text: string) =>
  toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
const configured = (value: string) => /^[a-f0-9]{32}:[a-f0-9]{64}$/.test(value);

// PBKDF2-SHA256 (100,000 iterations) of default development password, used ONLY when OWNER_PASSWORD_HASH is not set
const defaultCredential =
  '35baafa6101ebf7a02a22afdf1955b94:54b256c77338cc346c92f5c9cc0bbc2085989c8216673f04c2a19f391f7c5d4c';

let runtimeCustomCredential: string | null = null;

export function setCustomCredentialHash(newHash: string) {
  if (configured(newHash)) {
    runtimeCustomCredential = newHash;
  }
}

const credential = () => {
  if (
    typeof env !== 'undefined' &&
    env &&
    (env as Record<string, unknown>).OWNER_PASSWORD_HASH !== undefined
  ) {
    return String((env as Record<string, unknown>).OWNER_PASSWORD_HASH);
  }
  const custom = runtime('OWNER_PASSWORD_HASH');
  if (custom && configured(custom)) return custom;
  if (runtimeCustomCredential && configured(runtimeCustomCredential)) {
    return runtimeCustomCredential;
  }
  return defaultCredential;
};

export function getToken(cookies: string | null) {
  if (!cookies) return null;
  const parts = cookies.split(';').map((part) => part.trim());
  for (const name of [cookieName, 'studio-session']) {
    for (const part of parts) {
      if (part.startsWith(name + '=')) {
        const val = part.slice(name.length + 1).trim();
        if (val && /^[a-f0-9]{64}$/.test(val)) return val;
      }
    }
  }
  return null;
}

async function constantTimeEqualStrings(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([hash(a), hash(b)]);
  let diff = a.length ^ b.length;
  for (let i = 0; i < ha.length; i++) {
    diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  }
  return diff === 0;
}

export async function hashPasswordPbkdf2(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = toHex(saltBytes.buffer);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: saltBytes },
    key,
    256
  );
  return `${saltHex}:${toHex(derived)}`;
}

async function verifyPbkdf2(password: string, stored: string): Promise<boolean> {
  if (!configured(stored)) return false;
  try {
    const [salt, expected] = stored.split(':');
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        iterations: 100000,
        salt: Uint8Array.from(salt.match(/../g)!, (x) => parseInt(x, 16)),
      },
      key,
      256
    );
    const actual = toHex(derived);
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function verifyPassword(password: unknown, email?: unknown) {
  if (typeof password !== 'string' || password.length < 4 || password.length > 256) return false;

  // Validate owner email if provided and configured
  const configuredEmail = (runtime('ADMIN_EMAIL') || runtime('STUDIO_OWNER_EMAIL') || '')
    .trim()
    .toLowerCase();
  if (typeof email === 'string' && email.trim() && configuredEmail) {
    const input = email.trim().toLowerCase();
    const isOwner =
      input === configuredEmail ||
      input === 'shaahrozdogar@gmail.com' ||
      input === 'shahrozdogar@gmail.com';
    if (!isOwner) {
      return false;
    }
  }

  // If an explicit ADMIN_PASSWORD env variable is set (and OWNER_PASSWORD_HASH is not explicitly overriding in tests), verify in constant time
  const hasExplicitOwnerHash =
    typeof env !== 'undefined' &&
    env &&
    (env as Record<string, unknown>).OWNER_PASSWORD_HASH !== undefined;
  const directPass = runtime('ADMIN_PASSWORD');
  if (!hasExplicitOwnerHash && directPass && directPass.length >= 4) {
    if (await constantTimeEqualStrings(password, directPass)) {
      return true;
    }
  }

  // Check stored PBKDF2 credential (from env, custom rotation, or default PBKDF2 hash when unconfigured)
  const stored = credential();
  return verifyPbkdf2(password, stored);
}

export function sessionCookie(token: string, age: number, isSecure = true) {
  if (!isSecure) {
    return `studio-session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}`;
  }
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
}

async function getSigningSecret(): Promise<string> {
  const jwt = runtime('JWT_SECRET');
  if (jwt && jwt.length >= 16) return jwt;
  return credential();
}

async function createStatelessToken(secret: string, ttlSeconds = sessionSeconds): Promise<string> {
  const expSeconds = Math.floor(Date.now() / 1000) + ttlSeconds;
  const expHex = expSeconds.toString(16).padStart(8, '0');
  const nonceBytes = crypto.getRandomValues(new Uint8Array(12));
  const nonceHex = toHex(nonceBytes.buffer);
  const payload = expHex + nonceHex; // 32 hex chars
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sigHex = toHex(sigBuf).slice(0, 32); // 32 hex chars
  return payload + sigHex; // 64 hex chars total
}

async function verifyStatelessToken(token: string, secret: string): Promise<boolean> {
  if (!token || token.length !== 64 || !/^[a-f0-9]{64}$/.test(token)) return false;
  const payload = token.slice(0, 32);
  const expSeconds = parseInt(token.slice(0, 8), 16);
  if (isNaN(expSeconds) || expSeconds * 1000 <= Date.now()) return false;
  
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expectedSig = toHex(sigBuf).slice(0, 32);
    return constantTimeEqualStrings(token.slice(32, 64), expectedSig);
  } catch {
    return false;
  }
}

export async function issueSession(isSecure = true) {
  const secret = await getSigningSecret();
  const token = await createStatelessToken(secret, sessionSeconds);
  const tokenHash = await hash(token);
  const credHash = await hash(credential());
  const expires = Date.now() + sessionSeconds * 1000;
  const db = getPlatformDb();
  try {
    await db.batch([
      db.prepare('DELETE FROM owner_sessions WHERE expires<=?').bind(Date.now()),
      db
        .prepare('INSERT INTO owner_sessions(token_hash,credential_id,expires) VALUES(?,?,?)')
        .bind(tokenHash, credHash, expires),
    ]);
  } catch (e) {
    console.warn('[issueSession DB warning]:', e);
  }

  // Also persist session in MongoDB Atlas if configured
  try {
    const mongo = await getMongoDb();
    if (mongo) {
      await mongo.collection('owner_sessions').deleteMany({ expires: { $lte: Date.now() } });
      await mongo.collection('owner_sessions').updateOne(
        { token_hash: tokenHash },
        {
          $set: {
            token_hash: tokenHash,
            credential_id: credHash,
            expires,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
  } catch {}

  return { cookie: sessionCookie(token, sessionSeconds, isSecure), token };
}

export async function sessionValid(cookies: string | null, directToken?: string | null) {
  const token =
    directToken && /^[a-f0-9]{64}$/.test(directToken) ? directToken : getToken(cookies);
  const stored = credential();
  if (!token || !configured(stored)) return false;

  const tokenHash = await hash(token);
  const credHash = await hash(stored);
  const now = Date.now();

  // 1. Primary check in local platform DB
  try {
    const db = getPlatformDb();
    const row = await db
      .prepare(
        'SELECT expires,credential_id FROM owner_sessions WHERE token_hash=?'
      )
      .bind(tokenHash)
      .first<{ expires: number; credential_id: string }>();

    if (row) {
      return row.credential_id === credHash && row.expires > now;
    }
  } catch {}

  // 2. Fallback check in MongoDB Atlas (for multi-instance or serverless cold-start recovery)
  try {
    const mongo = await getMongoDb();
    if (mongo) {
      const doc = await mongo.collection('owner_sessions').findOne({
        token_hash: tokenHash,
      });
      if (doc) {
        return doc.credential_id === credHash && Number(doc.expires) > now;
      }
    }
  } catch {}

  // 3. Stateless signed token check (for serverless environments where local DB is ephemeral)
  try {
    const secret = await getSigningSecret();
    if (await verifyStatelessToken(token, secret)) {
      return true;
    }
  } catch {}

  return false;
}

export async function revokeSession(cookies: string | null, directToken?: string | null) {
  const token =
    directToken && /^[a-f0-9]{64}$/.test(directToken) ? directToken : getToken(cookies);
  if (token) {
    const tokenHash = await hash(token);
    const credHash = await hash(credential());
    try {
      const db = getPlatformDb();
      await db
        .prepare('INSERT OR REPLACE INTO owner_sessions(token_hash,credential_id,expires) VALUES(?,?,0)')
        .bind(tokenHash, credHash)
        .run();
    } catch {
      try {
        const db = getPlatformDb();
        await db.prepare('DELETE FROM owner_sessions WHERE token_hash=?').bind(tokenHash).run();
      } catch {}
    }
    try {
      const mongo = await getMongoDb();
      if (mongo) {
        await mongo.collection('owner_sessions').deleteOne({ token_hash: tokenHash });
      }
    } catch {}
  }
}

export async function revokeOtherSessions(cookies: string | null, directToken?: string | null) {
  const token =
    directToken && /^[a-f0-9]{64}$/.test(directToken) ? directToken : getToken(cookies);
  const keepHash = token ? await hash(token) : '';
  try {
    const db = getPlatformDb();
    if (keepHash) {
      await db.prepare('DELETE FROM owner_sessions WHERE token_hash!=?').bind(keepHash).run();
    } else {
      await db.prepare('DELETE FROM owner_sessions').run();
    }
  } catch {}
  try {
    const mongo = await getMongoDb();
    if (mongo) {
      if (keepHash) {
        await mongo.collection('owner_sessions').deleteMany({ token_hash: { $ne: keepHash } });
      } else {
        await mongo.collection('owner_sessions').deleteMany({});
      }
    }
  } catch {}
}
