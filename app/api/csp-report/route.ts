import { enforceLimit } from '@/lib/abuse';
import { failure, HttpError } from '@/lib/http';
export async function POST(req: Request) {
  try {
    await enforceLimit(req, 'csp-report', 20, 60000);
    // Reports are attacker-controlled: bound the stream, never log bodies or URLs.
    const reader = req.body?.getReader(); let size = 0;
    if (reader) for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 20480) { await reader.cancel(); throw new HttpError(413, 'BODY_SIZE', 'Report too large.'); } }
    console.info(JSON.stringify({ event: 'csp_report', requestId: crypto.randomUUID() }));
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
