import { origin } from '@/lib/meta';
import { getDb } from '@/lib/db';
import { failure } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const site = await (await getDb()).collection('settings').findOne({ id: 'site' });
    const base = origin || 'https://hashdecode.com';
    const email = typeof site?.contactEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail) ? site.contactEmail : '';
    return new Response([...(email ? ['Contact: mailto:' + email] : []), 'Contact: ' + base + '/contact', 'Expires: ' + new Date(Date.now() + 180 * 86400000).toISOString(), 'Canonical: ' + base + '/.well-known/security.txt', 'Preferred-Languages: en', ''].join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  } catch (error) { return failure(error); }
}
