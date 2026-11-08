import { headers, cookies } from 'next/headers';
import { sessionValid } from './owner-session';

export async function adminAccess(request?: Request) {
  let directToken: string | null = null;
  let cookieHeader: string | null = null;

  if (request) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) directToken = authHeader.slice(7).trim();
    cookieHeader = request.headers.get('cookie');
  } else {
    try {
      const cookieStore = await cookies();
      const studioCookie = cookieStore.get('studio-session')?.value || cookieStore.get('__Host-studio-session')?.value;
      if (studioCookie && /^[a-f0-9]{64}$/.test(studioCookie)) {
        directToken = studioCookie;
      }
    } catch {}

    try {
      const h = await headers();
      const authHeader = h.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) directToken = authHeader.slice(7).trim();
      if (!cookieHeader) cookieHeader = h.get('cookie');
    } catch {}
  }
  return { allowed: await sessionValid(cookieHeader, directToken) };
}

export function bounded(value: unknown, max: number, min = 0) {
  if (typeof value !== 'string') {
    throw new Error('Check the required fields and their lengths.');
  }
  // Strip null bytes and dangerous control characters while preserving tabs and newlines
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (cleaned.length < min || cleaned.length > max) {
    throw new Error('Check the required fields and their lengths.');
  }
  return cleaned;
}

export function httpsUrl(value: unknown) {
  const s = bounded(value, 2048);
  if (!s) return '';
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    throw new Error('Enter a full HTTPS website address.');
  }
  if (u.protocol !== 'https:' || u.username || u.password) {
    throw new Error('Use an HTTPS address without embedded credentials.');
  }
  return u.href;
}

export function imageOrUrl(value: unknown) {
  if (typeof value !== 'string') return '';
  const s = value.trim();
  if (!s) return '';
  if (s.startsWith('data:image/')) {
    // Only allow safe raster image formats in data URLs (block data:image/svg+xml XSS vector)
    if (!/^data:image\/(jpeg|jpg|png|webp|gif|avif);base64,[A-Za-z0-9+/=\s]+$/i.test(s)) {
      throw new Error('Only JPEG, PNG, WebP, GIF or AVIF uploaded images are allowed.');
    }
    if (s.length > 5 * 1024 * 1024) {
      throw new Error('Uploaded image is too large (max 5MB).');
    }
    return s;
  }
  if (s.startsWith('/') && !s.includes('//') && !s.includes('..') && !/[<>"'\\]/.test(s)) {
    return s;
  }
  return httpsUrl(s);
}

const isLoopback = (host: string) =>
  host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '[::1]';

export function sameOrigin(req: Request) {
  const originHeader = req.headers.get('origin');
  if (!originHeader) return false;
  let originUrl: URL;
  let reqUrl: URL;
  try {
    originUrl = new URL(originHeader);
    reqUrl = new URL(req.url);
  } catch {
    return false;
  }
  if (originUrl.origin === reqUrl.origin) return true;

  const cleanHost = (h: string) => h.toLowerCase().replace(/^www\./, '');
  if (
    originUrl.protocol === reqUrl.protocol &&
    cleanHost(originUrl.host) === cleanHost(reqUrl.host)
  ) {
    return true;
  }

  // Handle reverse-proxy / TLS-termination / local dev port forwarding safely
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const hostHeader = req.headers.get('host')?.trim();
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();

  if (isLoopback(reqUrl.hostname)) {
    if (isLoopback(originUrl.hostname) && (originUrl.port === reqUrl.port || !reqUrl.port)) {
      return true;
    }
    if (forwardedHost && (originUrl.host === forwardedHost || cleanHost(originUrl.host) === cleanHost(forwardedHost))) return true;
    if (hostHeader && !isLoopback(hostHeader.split(':')[0]) && (originUrl.host === hostHeader || cleanHost(originUrl.host) === cleanHost(hostHeader))) return true;
  }

  if (
    (originUrl.host === reqUrl.host || cleanHost(originUrl.host) === cleanHost(reqUrl.host)) &&
    forwardedProto &&
    originUrl.protocol === `${forwardedProto}:`
  ) {
    return true;
  }

  return false;
}

function sanitizeJsonObject(obj: unknown): Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('Invalid request.');
  }
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype' || k.startsWith('$')) {
      continue;
    }
    clean[k] = v;
  }
  return clean;
}

export async function readSmall(req: Request) {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new Error('Expected a JSON request.');
  }
  const reader = req.body?.getReader();
  if (!reader) throw new Error('Missing request body.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 6 * 1024 * 1024) {
      await reader.cancel();
      throw new Error('Request is too large.');
    }
    chunks.push(value);
  }
  const data = new Uint8Array(size);
  let pos = 0;
  for (const c of chunks) {
    data.set(c, pos);
    pos += c.length;
  }
  const parsed = JSON.parse(new TextDecoder().decode(data));
  return sanitizeJsonObject(parsed);
}
