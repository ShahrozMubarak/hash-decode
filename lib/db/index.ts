import { MongoClient, type Db } from 'mongodb';

export class ConfigurationError extends Error {}
const state = globalThis as typeof globalThis & { hdMongo?: { key: string; promise: Promise<Db> } };
export function databaseConfig() {
  const uri = process.env.MONGODB_URI?.trim();
  const name = process.env.MONGODB_DB_NAME?.trim();
  const environment = process.env.VERCEL_ENV || process.env.APP_ENV;
  if (!uri || !name || !/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new ConfigurationError('Set MONGODB_URI and MONGODB_DB_NAME.');
  }
  if (!['production', 'preview', 'development'].includes(environment || '')) {
    throw new ConfigurationError('Set APP_ENV to production, preview or development.');
  }
  const suffix = environment === 'production' ? '_prod' : environment === 'preview' ? '_preview' : '_dev';
  if (!name.endsWith(suffix)) throw new ConfigurationError(`Database name must end with ${suffix}.`);
  return { uri, name };
}
export async function getDb(): Promise<Db> {
  const { uri, name } = databaseConfig();
  const key = uri + '\n' + name;
  if (!state.hdMongo || state.hdMongo.key !== key) {
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 6000, connectTimeoutMS: 6000, retryWrites: true, writeConcern: { w: 'majority' } });
    const promise = client.connect().then(() => client.db(name)).catch(async (error: unknown) => {
      if (state.hdMongo?.key === key) state.hdMongo = undefined;
      await client.close();
      throw error;
    });
    state.hdMongo = { key, promise };
  }
  return state.hdMongo.promise;
}
