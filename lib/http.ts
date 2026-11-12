import { randomUUID } from 'node:crypto';
import { ConfigurationError } from './db';
export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export const privateHeaders = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
export function ok(data: unknown, status = 200, extra: HeadersInit = {}) {
  return Response.json({ ok: true, data }, { status, headers: { ...privateHeaders, ...extra } });
}
export function failure(error: unknown) {
  const requestId = randomUUID();
  const known = error instanceof HttpError;
  const config = error instanceof ConfigurationError;
  const status = known ? error.status : 503;
  const code = known ? error.code : config ? 'CONFIGURATION' : 'UNAVAILABLE';
  const detail = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ requestId, code, status, detail }));
  return Response.json({ ok: false, error: { code, message: known ? error.message : config ? 'Service configuration is incomplete. Check DEPLOY.md.' : 'The service is unavailable. Please try again.', requestId } }, { status, headers: privateHeaders });
}
function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim().replace(/\/+$/, ''));
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}
function originVariants(origin: string): string[] {
  const url = new URL(origin);
  const variants = new Set<string>([url.origin]);
  if (url.hostname.startsWith('www.')) {
    const bare = new URL(url.origin);
    bare.hostname = url.hostname.slice(4);
    variants.add(bare.origin);
  } else if (url.hostname.includes('.')) {
    const www = new URL(url.origin);
    www.hostname = 'www.' + url.hostname;
    variants.add(www.origin);
  }
  return [...variants];
}
export function assertOrigin(req: Request) {
  const target = new URL(req.url);
  const host = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || req.headers.get('host') || target.host;
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || target.protocol.replace(':', '');
  const allowed = new Set<string>();
  const requestOrigin = normalizeOrigin(`${proto}://${host}`);
  if (requestOrigin) for (const variant of originVariants(requestOrigin)) allowed.add(variant);
  const configured = normalizeOrigin(process.env.APP_ORIGIN);
  if (configured) for (const variant of originVariants(configured)) allowed.add(variant);
  const origin = req.headers.get('origin');
  if (origin && !allowed.has(origin)) throw new HttpError(403, 'ORIGIN', 'Request denied.');
}
export async function readJson(req: Request, max = 20480): Promise<Record<string, unknown>> {
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415, 'CONTENT_TYPE', 'Send a JSON request.');
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, 'INPUT', 'Missing request body.');
  let size = 0; const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); throw new HttpError(413, 'BODY_SIZE', 'This request is too large.'); }
    chunks.push(value);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value as Record<string, unknown>;
  } catch { throw new HttpError(400, 'INPUT', 'Invalid request body.'); }
}
