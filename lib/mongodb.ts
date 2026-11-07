import { MongoClient, type Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export function sanitizeMongoUri(raw: string): string {
  let uri = (raw || '').trim();
  if (!uri) return '';
  // Strip enclosing or accidental angle brackets: <username>:<password> or <db_username>
  uri = uri.replace(/<([^>]+)>/g, '$1');
  // Strip any lingering leading bracket in credentials like :<secret@
  uri = uri.replace(/:<([^@]+)@/, ':$1@');
  return uri;
}

export function getMongoConfig() {
  const rawUri = process.env.MONGODB_URI || '';
  const uri = sanitizeMongoUri(rawUri);
  const dbName = (process.env.MONGODB_DB_NAME || 'hash_decode').trim().replace(/[<>]/g, '');
  const isConfigured = Boolean(uri && !uri.includes('db_username'));
  return { uri, dbName, isConfigured };
}

export async function getMongoDb(): Promise<Db | null> {
  const { uri, dbName } = getMongoConfig();
  if (!uri) return null;
  if (cachedDb) return cachedDb;

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3500,
      maxPoolSize: 10,
    });
    await client.connect();
    cachedClient = client;
    cachedDb = client.db(dbName);
    return cachedDb;
  } catch (err) {
    // Non-blocking warning: site functions flawlessly with local/D1 storage while reporting status to admin
    console.warn('[MongoDB Atlas] Note:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function saveInquiryToMongo(inquiry: {
  id: string;
  name: string;
  email: string;
  topic: string;
  budget?: string;
  brief: string;
  status: string;
  created: number;
  mail?: string;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    await db.collection('inquiries').updateOne(
      { id: inquiry.id },
      { $set: { ...inquiry, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    // Also save in orders collection for order/project request tracking
    await db.collection('orders').updateOne(
      { orderId: inquiry.id },
      {
        $set: {
          orderId: inquiry.id,
          customerName: inquiry.name,
          customerEmail: inquiry.email,
          serviceCategory: inquiry.topic,
          budgetTier: inquiry.budget || 'Not specified',
          requirements: inquiry.brief,
          status: inquiry.status === 'new' ? 'pending_review' : inquiry.status,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveInquiryToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function saveProjectToMongo(project: {
  slug: string;
  title: string;
  category: string;
  summary: string;
  challenge: string;
  solution: string;
  tech?: string;
  result?: string;
  url?: string;
  image?: string;
  art?: string;
  status: string;
  position?: number;
  kind?: string;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    await db.collection('projects').updateOne(
      { slug: project.slug },
      { $set: { ...project, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveProjectToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function saveOrderToMongo(order: {
  orderId: string;
  userId?: string;
  userEmail: string;
  title: string;
  amount?: number;
  currency?: string;
  status: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const db = await getMongoDb();
    if (!db) return false;
    const now = new Date();
    await db.collection('orders').updateOne(
      { orderId: order.orderId },
      { $set: { ...order, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    return true;
  } catch (e) {
    console.warn('[MongoDB Atlas] saveOrderToMongo failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

export async function getMongoSyncStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  dbName: string;
  inquiriesCount?: number;
  projectsCount?: number;
}> {
  const { isConfigured, dbName } = getMongoConfig();
  if (!isConfigured) {
    return { configured: false, connected: false, dbName };
  }
  try {
    const db = await getMongoDb();
    if (!db) return { configured: true, connected: false, dbName };
    const [inquiriesCount, projectsCount] = await Promise.all([
      db.collection('inquiries').countDocuments().catch(() => 0),
      db.collection('projects').countDocuments().catch(() => 0),
    ]);
    return { configured: true, connected: true, dbName, inquiriesCount, projectsCount };
  } catch {
    return { configured: true, connected: false, dbName };
  }
}

export async function getMongoInquiries(limit = 200) {
  try {
    const db = await getMongoDb();
    if (!db) return [];
    const list = await db.collection('inquiries').find().sort({ created: -1 }).limit(limit).toArray();
    return list.map((item: any) => ({
      id: item.id || String(item._id),
      name: item.name || 'Anonymous Visitor',
      email: item.email || '',
      topic: item.topic || 'Digital product',
      budget: item.budget || 'Still exploring',
      brief: item.brief || item.message || '',
      status: item.status || 'new',
      created: typeof item.created === 'number' ? item.created : (item.createdAt ? new Date(item.createdAt).getTime() : Date.now()),
      mail: item.mail || 'recorded'
    }));
  } catch {
    return [];
  }
}

