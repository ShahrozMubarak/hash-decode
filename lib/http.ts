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
export function assertOrigin(req: Request) {
  const target = new URL(req.url);
  const expected = process.env.APP_ORIGIN || target.origin;
  if (req.headers.get('origin') !== expected || target.origin !== expected || (req.headers.get('host') && req.headers.get('host') !== target.host)) {
    throw new HttpError(403, 'ORIGIN', 'Request denied.');
  }
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
