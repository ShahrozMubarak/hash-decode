import { getDb } from '@/lib/db';
import { assertOrigin, readJson, failure, HttpError, privateHeaders } from '@/lib/http';
import { enforceLimit, ipHash } from '@/lib/abuse';
import { inquirySchema, humanTiming } from '@/lib/form-validation';
import { mailBrief } from '@/lib/notify';
import { revalidatePath } from 'next/cache';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const parsed = inquirySchema.safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, 'INPUT', 'Check your name, email and project details.');
    const { submissionId: id, startedAt, website: _w, ...fields } = parsed.data;
    void _w;
    if (!humanTiming(startedAt) || (fields.brief.match(/https?:\/\//gi) || []).length > 3) throw new HttpError(400, 'SPAM_CHECK', 'Please take a moment to review your details, then submit again.');
    await enforceLimit(req, 'inquiry', 5, 3600000, fields.email);
    const db = await getDb();
    const now = new Date();
    const row = { id, ...fields, status: 'new', createdAt: now, updatedAt: now, created: now.getTime(), ipHash: ipHash(req), userAgent: (req.headers.get('user-agent') || '').slice(0, 160), emailStatus: 'pending', emailError: '', emailSentAt: null };
    const saved = await db.collection('inquiries').findOneAndUpdate({ id }, { $setOnInsert: row }, { upsert: true, returnDocument: 'before' });
    if (saved && Object.entries(fields).some(([key, value]) => saved[key] !== value)) throw new HttpError(409, 'CONFLICT', 'Please refresh and try again.');
    if (!saved) {
      // Save first. A failed notification cannot erase the accepted inquiry.
      const mail = await mailBrief(row);
      try { await db.collection('inquiries').updateOne({ id }, { $set: { ...mail, updatedAt: new Date() } }); }
      catch { console.error(JSON.stringify({ requestId: id, code: 'EMAIL_STATUS_WRITE_FAILED' })); }
    }
    revalidatePath('/shahroz');
    return Response.json({ ok: true, data: { id }, reference: id.slice(0, 8).toUpperCase() }, { status: saved ? 200 : 201, headers: privateHeaders });
  } catch (error) { return failure(error); }
}
