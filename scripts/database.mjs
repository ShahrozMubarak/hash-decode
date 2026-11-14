import { MongoClient } from 'mongodb';
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB_NAME || 'hashdecode_dev';
  const env = process.env.VERCEL_ENV || process.env.APP_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  if (!uri) throw Error('Set MONGODB_URI in your environment or .env.local.');
  if (env === 'preview' && (name.endsWith('_prod') || !name.endsWith('_preview'))) {
    throw Error('Preview database cannot target production.');
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, writeConcern: { w: 'majority' } });
  await client.connect();
  return { client, db: client.db(name) };
}
export async function setup(db) {
  for (const name of ['inquiries', 'projects', 'founders', 'posts', 'settings', 'subscribers', 'chatMessages', 'adminUsers', 'sessions', 'auditLogs', 'rateLimits', 'clients', 'trackedProjects', 'updates', 'messages', 'approvals', 'portalSessions', 'magicLinks', 'mediaFiles']) {
    if (!(await db.listCollections({ name }).hasNext())) await db.createCollection(name);
  }
  for (const [name, key] of [['inquiries', 'id'], ['projects', 'slug'], ['founders', 'id'], ['posts', 'slug'], ['settings', 'id'], ['subscribers', 'email'], ['sessions', 'tokenHash'], ['rateLimits', 'key'], ['magicLinks', 'tokenHash']]) {
    await db.collection(name).createIndex({ [key]: 1 }, { unique: true });
  }
  await db.collection('posts').createIndex({ id: 1 }, { unique: true });
  for (const name of ['sessions', 'portalSessions', 'magicLinks', 'rateLimits']) await db.collection(name).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  for (const name of ['inquiries', 'auditLogs']) await db.collection(name).createIndex({ createdAt: -1 });
  await db.collection('posts').createIndex({ status: 1, publishAt: 1 });
  await db.collection('files.chunks').createIndex({ files_id: 1, n: 1 }, { unique: true });
  await db.collection('files.files').createIndex({ filename: 1, uploadDate: 1 });
}
