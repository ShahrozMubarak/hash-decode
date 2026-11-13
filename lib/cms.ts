import { getDb } from './db';
import { requireOwner } from './owner-session';
export interface Entry { id: string; kind: string; title: string; label: string; body: string; url: string; image: string; status: string; updated: number; }
export async function entries(kind = 'post', all = false): Promise<Entry[]> {
  try {
    if (all) await requireOwner();
    if (kind !== 'post') return [];
    const rows = await (await getDb()).collection<Entry>('posts').find(all ? { status: { $ne: 'deleted' } } : { status: 'published', $or: [{ publishAt: { $lte: new Date() } }, { publishAt: null }] }, { projection: { _id: 0 } }).sort({ updated: -1 }).toArray();
    return rows;
  } catch (err) {
    if (all) throw err;
    console.error('entries error:', err);
    return [];
  }
}
export interface SocialLinks { whatsapp: string; booking: string; instagram: string; facebook: string; youtube: string; tiktok: string; linkedin: string; }
export async function getLinks(): Promise<SocialLinks> {
  try {
    const row = await (await getDb()).collection('settings').findOne({ id: 'site' });
    return {
      whatsapp: typeof row?.whatsapp === 'string' ? row.whatsapp : '',
      booking: typeof row?.booking === 'string' ? row.booking : '',
      instagram: typeof row?.instagram === 'string' ? row.instagram : '',
      facebook: typeof row?.facebook === 'string' ? row.facebook : '',
      youtube: typeof row?.youtube === 'string' ? row.youtube : '',
      tiktok: typeof row?.tiktok === 'string' ? row.tiktok : '',
      linkedin: typeof row?.linkedin === 'string' ? row.linkedin : '',
    };
  } catch (err) {
    console.error('getLinks error:', err);
    return { whatsapp: '', booking: '', instagram: '', facebook: '', youtube: '', tiktok: '', linkedin: '' };
  }
}
