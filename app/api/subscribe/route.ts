import {bounded,readSmall,sameOrigin} from '@/lib/studio-security';
import {quota} from '@/lib/abuse';
import {mailSubscriber} from '@/lib/notify';
import {getMongoDb} from '@/lib/mongodb';
import {getPlatformDb} from '@/lib/platform-db';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({error: 'Untrusted request.'}, {status: 403});
  try {
    const data = await readSmall(req);
    const email = bounded(data.email, 254, 3).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({error: 'Please enter a valid email address.'}, {status: 400});
    }

    if (!await quota(req, 'subscribe', 15)) {
      return Response.json({error: 'Please wait before subscribing again.'}, {status: 429});
    }

    // Save to local SQLite / D1
    try {
      const db = getPlatformDb();
      await db.prepare('CREATE TABLE IF NOT EXISTS subscribers (email text PRIMARY KEY NOT NULL, created integer NOT NULL)').run().catch(() => {});
      await db.prepare('INSERT OR REPLACE INTO subscribers (email, created) VALUES (?, ?)').bind(email, Date.now()).run();
    } catch (e) {
      console.warn('[Subscribers DB note]:', e);
    }

    // Save to MongoDB Atlas
    try {
      const mongo = await getMongoDb();
      if (mongo) {
        await mongo.collection('subscribers').updateOne(
          { email },
          { $set: { email, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('[Subscribers Mongo note]:', e);
    }

    // Send email notification to studio owner
    await mailSubscriber(email).catch(() => {});

    return Response.json({ok: true, message: 'Subscribed successfully.'}, {status: 200});
  } catch {
    return Response.json({error: 'Unable to subscribe. Please try again.'}, {status: 400});
  }
}
