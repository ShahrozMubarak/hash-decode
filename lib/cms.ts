import { getDb } from './db';
import { requireOwner } from './owner-session';
export interface Entry { id: string; kind: string; title: string; label: string; body: string; url: string; image: string; status: string; updated: number; }

export const defaultPosts: Entry[] = [
  {
    id: 'ownership-before-handover',
    kind: 'post',
    title: 'Before you take ownership of a web app',
    label: 'Delivery',
    body: 'Ask for a fresh install\n\nRun the project from its documentation in a new environment. Confirm database migrations, build commands and backups before the previous team leaves.\n\nWalk through the failure paths\n\nTry a failed submission, a lost connection and an expired login. The product should explain what happened and preserve the work a user can safely retry.\n\nFinish with an access inventory\n\nRecord who owns the domain, repository, mail sender and hosting account. Transfer ownership and rotate shared credentials before sign-off.',
    url: '',
    image: '',
    status: 'published',
    updated: 1700000000000,
  },
  {
    id: 'permission-tests',
    kind: 'post',
    title: 'Three permission checks for a new API',
    label: 'Security',
    body: 'Start without a session\n\nCall a private endpoint without signing in. Confirm that it returns a deliberate denial and no private fields.\n\nTry the same action as another user\n\nUse two test accounts with separate records. Change the record identifier and verify that account A cannot read or modify account B’s data.\n\nTest the write path separately\n\nA protected page does not protect its API. Repeat the tests against create, update and delete operations, and record the expected status for each.',
    url: '',
    image: '',
    status: 'published',
    updated: 1700000000000,
  },
  {
    id: 'mobile-performance',
    kind: 'post',
    title: 'A practical mobile launch check',
    label: 'Engineering',
    body: 'Start with the first screen\n\nLoad the page with a cold cache and a throttled connection. Identify which file delays the main headline or image.\n\nMake decoration optional\n\nGive canvases a static first frame, pause motion offscreen, and respect reduced-motion preferences. A visitor should be able to read and navigate before animation starts.\n\nMeasure the real journey\n\nTest a low-end handset, submit a brief and open a case study. Repeat after a release and compare measurements from the same device and network.',
    url: '',
    image: '',
    status: 'published',
    updated: 1700000000000,
  },
];

export async function entries(kind = 'post', all = false): Promise<Entry[]> {
  try {
    if (all) await requireOwner();
    if (kind !== 'post') return [];
    const rows = await (await getDb()).collection<Entry>('posts').find(all ? { status: { $ne: 'deleted' } } : { status: 'published', $or: [{ publishAt: { $lte: new Date() } }, { publishAt: null }] }, { projection: { _id: 0 } }).sort({ updated: -1 }).toArray();
    if (rows && rows.length > 0) return rows;
    return all ? [] : defaultPosts;
  } catch (err) {
    if (all) throw err;
    console.error('entries error:', err);
    return defaultPosts;
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
