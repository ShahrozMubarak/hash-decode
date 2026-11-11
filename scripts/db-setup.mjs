import { connectDatabase, setup } from './database.mjs';
const { client, db } = await connectDatabase();
try { await setup(db); console.log('Indexes created. Existing data was not replaced.'); } finally { await client.close(); }
