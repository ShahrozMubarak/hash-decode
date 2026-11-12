import { MongoClient, type Db, type MongoClientOptions } from 'mongodb';
import { currentRequestDbContext } from './request-context';

export class ConfigurationError extends Error {}
const state = globalThis as typeof globalThis & { hdMongo?: { key: string; promise: Promise<Db> } };
const clientOptions: MongoClientOptions = { maxPoolSize: 5, serverSelectionTimeoutMS: 6000, connectTimeoutMS: 6000, retryWrites: true, writeConcern: { w: 'majority' } };

export function sanitizeMongoUri(raw: string): string {
  let uri = (raw || '').trim();
  if (!uri) return '';
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  uri = uri.replace(/<([^>]+)>/g, '$1');
  uri = uri.replace(/:<([^@]+)@/, ':$1@');
  return uri;
}

export function databaseConfig() {
  const rawUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    (process.env.DATABASE_URL?.startsWith('mongodb') ? process.env.DATABASE_URL : '');
  const uri = sanitizeMongoUri(rawUri || '');

  let name = (process.env.MONGODB_DB_NAME || '').trim().replace(/[<>"]/g, '');
  if (!name && uri) {
    try {
      const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
      if (match && match[1]) {
        name = match[1].trim();
      }
    } catch {}
  }
  if (!name) {
    throw new ConfigurationError('Set MONGODB_DB_NAME or include a database name in MONGODB_URI.');
  }

  const environment = process.env.VERCEL_ENV || process.env.APP_ENV;
  const suffix = environment === 'production' ? '_prod' : environment === 'preview' ? '_preview' : environment === 'development' ? '_dev' : '';
  if (!suffix) {
    throw new ConfigurationError('Set APP_ENV to production, preview, or development.');
  }
  if (!name.endsWith(suffix)) {
    throw new ConfigurationError(`Database name must end in ${suffix} for the ${environment} environment.`);
  }

  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new ConfigurationError('Set MONGODB_URI.');
  }

  return { uri, name };
}

export async function getDb(): Promise<Db> {
  const { uri, name } = databaseConfig();
  const key = uri + '\n' + name;
  const request = currentRequestDbContext();
  if (request) {
    // Worker runtime: sockets created during one request cannot be reused by
    // another, so keep one client per request and close it with that request.
    let pending = request.clients.get(key);
    if (!pending) {
      const client = new MongoClient(uri, clientOptions);
      pending = client.connect().then(() => client).catch(async (error: unknown) => {
        request.clients.delete(key);
        await client.close().catch(() => undefined);
        throw error;
      });
      request.clients.set(key, pending);
    }
    return (await pending).db(name);
  }
  // Node/serverless (`next start`, Vercel) reuses the process, so a cached
  // client is safe and avoids a new connection for every request.
  if (!state.hdMongo || state.hdMongo.key !== key) {
    const client = new MongoClient(uri, clientOptions);
    const promise = client.connect().then(() => client.db(name)).catch(async (error: unknown) => {
      if (state.hdMongo?.key === key) state.hdMongo = undefined;
      await client.close();
      throw error;
    });
    state.hdMongo = { key, promise };
  }
  return state.hdMongo.promise;
}
