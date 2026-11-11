import { connectDatabase } from './database.mjs';
// Explicit, insert-only migration. Canonical records always take precedence.
if (!process.argv.includes('--apply')) throw Error('Back up first, then run npm run migrate:legacy -- --apply. Existing canonical content is never overwritten.');
const { client, db } = await connectDatabase();
try {
  let inserted = 0;
  for await (const row of db.collection('studio_content').find({ kind: { $in: ['team', 'post'] } })) {
    const id = String(row.id || ''); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) continue;
    const now = new Date(); const status = ['published', 'deleted'].includes(row.status) ? row.status : 'draft';
    const data = row.kind === 'team'
      ? { id, name: String(row.title || ''), role: String(row.label || ''), bio: String(row.body || ''), image: String(row.image || ''), url: String(row.url || ''), skills: [], quote: '', position: 99, status, createdAt: row.createdAt || now, updatedAt: row.updatedAt || now }
      : { id, slug: id, kind: 'post', title: String(row.title || ''), label: String(row.label || ''), body: String(row.body || ''), url: String(row.url || ''), image: String(row.image || ''), status, publishAt: null, updated: Number(row.updated || now.getTime()), createdAt: row.createdAt || now, updatedAt: row.updatedAt || now };
    const collection = row.kind === 'team' ? 'founders' : 'posts';
    const result = await db.collection(collection).updateOne({ id }, { $setOnInsert: data }, { upsert: true }); inserted += result.upsertedCount;
  }
  const legacyPublic = await db.collection('settings').findOne({ id: 'public' });
  const legacyLinks = await db.collection('settings').findOne({ id: 'connections' });
  let copy = {}, links = {};
  try { copy = JSON.parse(legacyPublic?.value || '{}'); links = JSON.parse(legacyLinks?.value || '{}'); } catch { throw Error('Legacy settings JSON is invalid; review it before migrating.'); }
  if (legacyPublic || legacyLinks) await db.collection('settings').updateOne({ id: 'site' }, { $setOnInsert: { id: 'site', intro: typeof copy.intro === 'string' ? copy.intro : '', about: typeof copy.about === 'string' ? copy.about : '', whatsapp: typeof links.whatsapp === 'string' ? links.whatsapp : '', booking: typeof links.booking === 'string' ? links.booking : '', contactEmail: '', availability: 'Unavailable', createdAt: new Date(), updatedAt: new Date() } }, { upsert: true });
  // Fill missing structural fields only. Never replace existing biographies, images or names.
  for (const [name, fields] of [['founders', { skills: [], quote: '', position: 99, url: '', image: '', status: 'draft' }], ['posts', { publishAt: null, kind: 'post', image: '', url: '' }]]) {
    for (const [field, value] of Object.entries(fields)) await db.collection(name).updateMany({ [field]: { $exists: false } }, { $set: { [field]: value } });
  }
  for await (const row of db.collection('inquiries').find({ emailStatus: { $exists: false } })) {
    const emailStatus = row.mail === 'accepted' || row.mail === 'sent' ? 'sent' : row.mail === 'failed' ? 'failed' : 'skipped';
    await db.collection('inquiries').updateOne({ _id: row._id, emailStatus: { $exists: false } }, { $set: { emailStatus, emailError: '', emailSentAt: null } });
  }
  console.log(`Copied ${inserted} legacy content records. No source records were deleted. Review drafts and project types in the owner panel.`);
} finally { await client.close(); }
