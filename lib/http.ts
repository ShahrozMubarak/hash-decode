import { randomUUID } from 'node:crypto';
import { ConfigurationError } from './db';

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
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
  console.error(JSON.stringify({ requestId, code, status, detail: error instanceof Error ? error.message : String(error) }));
  return Response.json(
    {
      ok: false,
      error: {
        code,
        message: known
          ? error.message
          : config
          ? 'Service configuration is incomplete. Check DEPLOY.md.'
          : 'The service is unavailable. Please try again.',
        requestId,
      },
    },
    { status, headers: privateHeaders }
  );
}

export function assertOrigin(req: Request) {
  const originHeader = req.headers.get('origin');
  if (!originHeader) return;

  let originUrl: URL;
  let targetUrl: URL;
  try {
    originUrl = new URL(originHeader);
    targetUrl = new URL(req.url);
  } catch {
    throw new HttpError(403, 'ORIGIN', 'Request denied.');
  }

  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim().toLowerCase();
  const hostHeader = req.headers.get('host')?.split(',')[0]?.trim().toLowerCase();
  const targetHost = targetUrl.host.toLowerCase();
  const originHost = originUrl.host.toLowerCase();

  const allowedHosts = new Set<string>(['hashdecode.com', 'www.hashdecode.com', 'localhost:3000', '127.0.0.1:3000']);
  if (targetHost) allowedHosts.add(targetHost);
  if (forwardedHost) allowedHosts.add(forwardedHost);
  if (hostHeader) allowedHosts.add(hostHeader);

  if (process.env.APP_ORIGIN) {
    try {
      allowedHosts.add(new URL(process.env.APP_ORIGIN).host.toLowerCase());
    } catch {}
  }
  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL.trim().toLowerCase());
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowedHosts.add(process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().toLowerCase());
  }

  const isVercelPreview = originHost.endsWith('.vercel.app') && (
    (forwardedHost && originHost === forwardedHost) ||
    (hostHeader && originHost === hostHeader) ||
    originHost.includes('hash-decode')
  );

  if (!allowedHosts.has(originHost) && !isVercelPreview) {
    throw new HttpError(403, 'ORIGIN', 'Request denied.');
  }
}

export async function readJson(req: Request, max = 20480): Promise<Record<string, unknown>> {
  if (!req.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(415, 'CONTENT_TYPE', 'Send a JSON request.');
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, 'INPUT', 'Missing request body.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, 'BODY_SIZE', 'This request is too large.');
    }
    chunks.push(value);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'INPUT', 'Invalid request body.');
  }
}
