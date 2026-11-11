import { mkdir, writeFile, open } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BSON } from 'mongodb';
const { EJSON } = BSON;
import { connectDatabase } from './database.mjs';
const destination = process.argv[2];
if (!destination) throw Error('Usage: npm run backup -- /private/path/backup-folder');
const { client, db } = await connectDatabase();
try {
  const dir = resolve(destination); await mkdir(dir, { recursive: false, mode: 0o700 });
  const manifest = [];
  for await (const collection of db.listCollections()) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(collection.name)) throw Error('Unsupported collection name.');
    const file = await open(resolve(dir, collection.name + '.jsonl'), 'wx', 0o600);
    let count = 0;
    try { for await (const row of db.collection(collection.name).find()) { await file.write(EJSON.stringify(row, { relaxed: false }) + '\n'); count++; } } finally { await file.close(); }
    manifest.push({ collection: collection.name, count, indexes: await db.collection(collection.name).listIndexes().toArray() });
  }
  await writeFile(resolve(dir, 'manifest.json'), JSON.stringify({ database: db.databaseName, at: new Date().toISOString(), collections: manifest }, null, 2), { mode: 0o600, flag: 'wx' });
  console.log('Backup complete. Includes credentials and private data: encrypt and restrict access.');
} finally { await client.close(); }
