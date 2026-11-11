import { readJson, assertOrigin, ok, failure, HttpError } from '@/lib/http';
import { enforceLimit } from '@/lib/abuse';
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const d = await readJson(req);
    if (d.authorized !== true || typeof d.url !== 'string' || d.url.length > 2048) throw new HttpError(400, 'INPUT', 'Enter a public domain you own or have permission to check.');
    let url: URL;
    try { url = new URL(d.url.includes('://') ? d.url : 'https://' + d.url); }
    catch { throw new HttpError(400, 'INPUT', 'Enter a valid public domain.'); }
    const host = url.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || !/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) || /\.(localhost|local|test|invalid|internal|example|onion)$/.test(host)) throw new HttpError(400, 'INPUT', 'Enter a valid public domain.');
    await enforceLimit(req, 'observatory', 5);
    const response = await fetch('https://observatory-api.mdn.mozilla.net/api/v2/scan?host=' + encodeURIComponent(host), { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(18000) });
    if (!response.ok) throw new HttpError(502, 'PROVIDER', 'The external scanner could not complete this request.');
    const x = await response.json() as Record<string, unknown>;
    if (typeof x.grade !== 'string' || typeof x.score !== 'number') throw new HttpError(502, 'PROVIDER', 'The external scanner returned an incomplete result.');
    return ok({ host, grade: x.grade, score: x.score, passed: x.tests_passed, failed: x.tests_failed, total: x.tests_quantity, at: x.scanned_at, report: 'https://developer.mozilla.org/en-US/observatory/analyze?host=' + encodeURIComponent(host) });
  } catch (error) { return failure(error); }
}
