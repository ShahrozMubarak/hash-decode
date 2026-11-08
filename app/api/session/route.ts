import { quota, getClientIp } from '@/lib/abuse';
import { readSmall, sameOrigin } from '@/lib/studio-security';
import {
  issueSession,
  revokeSession,
  sessionCookie,
  verifyPassword,
  sessionValid,
} from '@/lib/owner-session';
import { recordAuditLog } from '@/lib/mongodb';

function isHttpsRequest(req: Request): boolean {
  try {
    const u = new URL(req.url);
    if (u.protocol === 'https:') return true;
    const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    return proto === 'https';
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const isSecure = isHttpsRequest(req);
  const reply = (status: number, error?: string, cookie?: string) =>
    Response.json(error ? { error } : { ok: true }, {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...(cookie ? { 'Set-Cookie': cookie } : {}),
      },
    });
  if (!sameOrigin(req)) return reply(403, 'Request denied.');
  let body: Record<string, unknown>;
  try {
    body = await readSmall(req);
  } catch {
    return reply(400, 'Invalid request.');
  }
  const authHeader = req.headers.get('authorization') || '';
  const directToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const ip = getClientIp(req);

  try {
    if (body.action === 'logout') {
      await revokeSession(req.headers.get('cookie'), directToken);
      await recordAuditLog({ action: 'owner_logout', actor: 'owner', ip });
      const headers = new Headers();
      headers.set('Cache-Control', 'no-store');
      headers.append('Set-Cookie', 'studio-session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
      headers.append('Set-Cookie', '__Host-studio-session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
      return Response.json({ ok: true }, { status: 200, headers });
    }
    if (body.action !== 'login') return reply(400, 'Invalid request.');
    if (!(await quota(req, 'owner-login', 8, 15 * 60 * 1000))) {
      await recordAuditLog({
        action: 'owner_login_throttled',
        actor: String(body.email || 'unknown'),
        ip,
        detail: 'Rate limit exceeded (8 attempts / 15m)',
      });
      return reply(429, 'Please try again in 15 minutes.');
    }
    if (!(await verifyPassword(body.password, body.email))) {
      await recordAuditLog({
        action: 'owner_login_failed',
        actor: String(body.email || 'unknown'),
        ip,
        detail: 'Invalid credentials',
      });
      return reply(401, 'Sign-in failed.');
    }
    const session = await issueSession(isSecure);
    await recordAuditLog({
      action: 'owner_login_success',
      actor: String(body.email || 'owner'),
      ip,
      detail: 'Authenticated owner session issued',
    });
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store');
    headers.append(
      'Set-Cookie',
      `studio-session=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=14400${isSecure ? '; Secure' : ''}`
    );
    if (isSecure) {
      headers.append(
        'Set-Cookie',
        `__Host-studio-session=${session.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=14400`
      );
    }
    return Response.json(
      { ok: true, token: session.token },
      {
        status: 200,
        headers,
      }
    );
  } catch {
    return reply(503, 'Sign-in is temporarily unavailable.');
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const directToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const ok = await sessionValid(req.headers.get('cookie'), directToken);
    return Response.json(
      { ok },
      { status: ok ? 200 : 401, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return Response.json(
      { error: 'Session check unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
