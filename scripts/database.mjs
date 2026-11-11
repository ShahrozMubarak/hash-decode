import { MongoClient } from 'mongodb';
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI, name = process.env.MONGODB_DB_NAME;
  const env = process.env.VERCEL_ENV || process.env.APP_ENV;
  const suffix = { production: '_prod', preview: '_preview', development: '_dev' }[env];
  if (!uri || !name || !suffix || !name.endsWith(suffix)) throw Error('Set MONGODB_URI, MONGODB_DB_NAME and APP_ENV; use an environment-specific _prod, _preview or _dev database.');
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
