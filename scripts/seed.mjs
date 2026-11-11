import { connectDatabase, setup } from './database.mjs';
const { client, db } = await connectDatabase();
try {
  await setup(db);
  // Only neutral site copy; no invented founders, clients, projects or metrics.
  if (await db.collection('settings').countDocuments() === 0) {
    const now = new Date();
    await db.collection('settings').insertOne({ id: 'site', intro: 'Custom software, web platforms and security reviews for teams building their next release.', about: 'Hash Decode is a software and web-security studio.', contactEmail: '', availability: 'Unavailable', whatsapp: '', booking: '', createdAt: now, updatedAt: now });
    console.log('Inserted initial site settings.');
  } else console.log('Settings are not empty; no changes made.');
  console.log('Create real team, portfolio and blog records in the owner panel.');
} finally { await client.close(); }
