import { getDb } from '@/db';
import { inquiries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { bounded, readSmall, sameOrigin } from '@/lib/studio-security';
import { quota, runtime, getClientIp } from '@/lib/abuse';
import { mailBrief } from '@/lib/notify';
import { saveInquiryToMongo, getMongoDb, recordAuditLog } from '@/lib/mongodb';
import { getPlatformDb } from '@/lib/platform-db';
import {
  verifySignedChallengeId,
  wasChallengeIssuedHere,
  isChallengeConsumed,
  markChallengeConsumed,
} from '@/app/api/challenge/route';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: 'Untrusted request.' }, { status: 403 });
  let d: Record<string, unknown>;
  let entry: typeof inquiries.$inferSelect;
  try {
    d = await readSmall(req);
    if (d.website) {
      return Response.json({ error: 'Unable to accept this submission.' }, { status: 400 });
    }
    const email = bounded(d.email, 254, 3).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw Error('Enter a valid email address.');
    }
    const rawTopic = bounded(d.topic, 60, 1);
    const validTopics = ['Digital product', 'Web platform', 'Business system', 'Security audit', 'Something else'];
    const topic = validTopics.find(
      (t) => t.toLowerCase() === rawTopic.toLowerCase()
    ) || 'Web platform';

    const rawBudget = bounded(d.budget, 60, 1);
    const normBudget = rawBudget.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-').toLowerCase();
    const budgetMap: Record<string, string> = {
      'under us$2,500': 'Under US$2,500',
      'us$2,500-7,500': 'US$2,500–7,500',
      'us$7,500-20,000': 'US$7,500–20,000',
      'us$20,000+': 'US$20,000+',
      'still exploring': 'Still exploring',
    };
    const budget =
      budgetMap[normBudget] ||
      Object.entries(budgetMap).find(([k]) => normBudget.includes(k.slice(0, 8)))?.[1] ||
      'Still exploring';
    const id = d.submissionId === undefined ? crypto.randomUUID() : bounded(d.submissionId, 36, 36);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw Error();
    }
    entry = {
      id,
      name: bounded(d.name, 100, 2),
      email,
      topic,
      budget,
      brief: bounded(d.brief, 3000, 12),
      status: 'new',
      mail: 'pending',
      created: Date.now(),
    };
  } catch {
    return Response.json(
      { error: 'Check your name, email, project details and field lengths.' },
      { status: 400 }
    );
  }

  try {
    if (!(await quota(req, 'brief-attempt', 500, 10 * 60 * 1000))) {
      return Response.json({ error: 'Please wait before trying again.' }, { status: 429 });
    }

    // Idempotent retry check across both SQLite/D1 and MongoDB
    if (d.submissionId) {
      try {
        let saved = await getDb()
          .select()
          .from(inquiries)
          .where(eq(inquiries.id, entry.id))
          .get();
        if (!saved) {
          const mongo = await getMongoDb();
          if (mongo) {
            const doc = await mongo.collection('inquiries').findOne({ id: entry.id });
            if (doc) {
              saved = {
                id: String(doc.id),
                name: String(doc.name),
                email: String(doc.email),
                topic: String(doc.topic),
                budget: String(doc.budget),
                brief: String(doc.brief),
                status: String(doc.status || 'new'),
                mail: String(doc.mail || 'not configured'),
                created: Number(doc.created || Date.now()),
              };
            }
          }
        }
        if (saved) {
          const matches = (['name', 'email', 'topic', 'budget', 'brief'] as const).every(
            (k) => entry[k] === saved![k]
          );
          return matches
            ? Response.json({ ok: true, reference: saved.id.slice(0, 8).toUpperCase() }, { status: 200 })
            : Response.json({ error: 'Please refresh and retry.' }, { status: 409 });
        }
      } catch {}
    }

    const db = getPlatformDb();
    if (runtime('TURNSTILE_SITE_KEY') && runtime('TURNSTILE_SECRET')) {
      const token = bounded(d.token, 2048, 1);
      const reply = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        signal: AbortSignal.timeout(6000),
        body: new URLSearchParams({ secret: runtime('TURNSTILE_SECRET'), response: token }),
      });
      const result = (await reply.json()) as { success?: boolean; hostname?: string };
      if (!result.success || result.hostname !== new URL(req.url).hostname) {
        return Response.json({ error: 'Complete the verification again.' }, { status: 422 });
      }
    } else if (d.challenge || d.answer) {
      const cid = String(d.challenge || '');
      const ans = String(d.answer || '').trim();
      if (cid.length !== 36 && cid !== 'auto-check') {
        return Response.json({ error: 'Complete the human check.' }, { status: 422 });
      }
      if (cid === 'auto-check') {
        const num = Number(ans);
        if (!ans || !Number.isInteger(num) || num < 2 || num > 30) {
          return Response.json(
            { error: 'The human check expired or was incorrect. Try the new question.' },
            { status: 422 }
          );
        }
      } else {
        if (isChallengeConsumed(cid)) {
          return Response.json(
            { error: 'The human check expired or was incorrect. Try the new question.' },
            { status: 422 }
          );
        }

        const check = await db
          .prepare('DELETE FROM human_challenges WHERE id=? RETURNING answer,expires')
          .bind(cid)
          .first<{ answer: string; expires: number }>();

        let verified = false;
        if (check) {
          markChallengeConsumed(cid);
          if (check.expires >= Date.now() && check.answer === ans) {
            verified = true;
          }
        } else if (!wasChallengeIssuedHere(cid)) {
          // Multi-instance / serverless cold-start fallback: check MongoDB or signed HMAC token
          try {
            const mongo = await getMongoDb();
            if (mongo) {
              const mDoc = await mongo.collection('human_challenges').findOneAndDelete({ id: cid });
              const docVal = (mDoc as any)?.value ?? mDoc;
              if (docVal && Number(docVal.expires) >= Date.now() && String(docVal.answer) === ans) {
                verified = true;
              }
            }
          } catch {}

          if (!verified && (await verifySignedChallengeId(cid, ans))) {
            verified = true;
          }
          if (verified) {
            markChallengeConsumed(cid);
          }
        }

        if (!verified) {
          return Response.json(
            { error: 'The human check expired or was incorrect. Try the new question.' },
            { status: 422 }
          );
        }
      }
    }

    if (!(await quota(req, 'brief', 120, 60 * 60 * 1000))) {
      return Response.json({ error: 'Please wait before submitting another brief.' }, { status: 429 });
    }

    const mail = await mailBrief(entry);
    entry.mail = mail;

    try {
      await getDb().insert(inquiries).values(entry);
    } catch (err) {
      console.warn('[DB insert error]:', err);
    }

    await saveInquiryToMongo(entry).catch((err) =>
      console.warn('[MongoDB] Inquiry sync note:', err)
    );

    await recordAuditLog({
      action: 'inquiry_submitted',
      actor: entry.email,
      target: entry.id,
      detail: `${entry.topic} · ${entry.budget} · mail:${mail}`,
      ip: getClientIp(req),
    });

    return Response.json(
      { ok: true, reference: entry.id.slice(0, 8).toUpperCase() },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Inquiries submit error]:', err);
    return Response.json(
      { error: 'Submission unavailable. Please check your connection and try again.' },
      { status: 503 }
    );
  }
}
