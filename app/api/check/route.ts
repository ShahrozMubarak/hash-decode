import { readSmall, sameOrigin } from '@/lib/studio-security';
import { quota } from '@/lib/abuse';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: 'Untrusted request.' }, { status: 403 });
  let host: string;
  try {
    const d = await readSmall(req);
    if (d.authorized !== true) throw Error();
    const s = String(d.url || '').trim();
    if (s.length > 2048) throw Error();
    const u = new URL(s.includes('://') ? s : 'https://' + s);
    host = u.hostname.toLowerCase();
    if (
      !['https:', 'http:'].includes(u.protocol) ||
      u.username ||
      u.password ||
      u.port ||
      !/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
      /\.(localhost|local|test|invalid|internal|example|onion)$/.test(host)
    ) {
      throw Error();
    }
  } catch {
    return Response.json(
      { error: 'Enter a public domain you own or have permission to check.' },
      { status: 400 }
    );
  }

  if (!(await quota(req, 'observatory', 5))) {
    return Response.json(
      { error: 'The scan limit is five requests per hour. Try again later.' },
      { status: 429 }
    );
  }

  const reportUrl =
    'https://developer.mozilla.org/en-US/observatory/analyze?host=' + encodeURIComponent(host);

  try {
    const r = await fetch(
      'https://observatory-api.mdn.mozilla.net/api/v2/scan?host=' + encodeURIComponent(host),
      { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(18000) }
    );
    if (!r.ok) throw Error();
    const x = (await r.json()) as Record<string, unknown>;
    if (
      x.error ||
      typeof x.grade !== 'string' ||
      typeof x.score !== 'number' ||
      typeof x.tests_passed !== 'number'
    ) {
      throw Error();
    }
    return Response.json(
      {
        host,
        grade: x.grade,
        score: x.score,
        passed: x.tests_passed,
        failed: x.tests_failed,
        total: x.tests_quantity,
        at: x.scanned_at,
        report: reportUrl,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return Response.json(
      { error: 'Mozilla Observatory could not complete this scan. Check the domain or try again later.' },
      { status: 502 }
    );
  }
}
