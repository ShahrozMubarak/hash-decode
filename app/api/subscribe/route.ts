import { getDb } from '@/lib/db';
import { assertOrigin, readJson, ok, failure, HttpError } from '@/lib/http';
import { enforceLimit, ipHash } from '@/lib/abuse';
import { subscriberSchema, humanTiming } from '@/lib/form-validation';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const parsed = subscriberSchema.safeParse(await readJson(req));
    if (!parsed.success || !humanTiming(parsed.data.startedAt)) throw new HttpError(400, 'INPUT', 'Check your email and take a moment before submitting.');
    const { email } = parsed.data;
    await enforceLimit(req, 'subscribe', 5, 3600000, email);
    const now = new Date();
    await (await getDb()).collection('subscribers').updateOne({ email }, { $setOnInsert: { email, status: 'active', createdAt: now, updatedAt: now, ipHash: ipHash(req), userAgent: (req.headers.get('user-agent') || '').slice(0, 160) } }, { upsert: true });
    return ok({ message: 'Your subscription request has been received.' });
  } catch (error) { return failure(error); }
}
