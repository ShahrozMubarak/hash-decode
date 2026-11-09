import { origin } from '@/lib/meta';

export function GET() {
  const expires = new Date(Date.now() + 180 * 86400000).toISOString();
  const base = origin || 'https://hashdecode.com';
  return new Response(
    [
      'Contact: mailto:shaahrozdogar@gmail.com',
      `Contact: ${base}/contact`,
      `Expires: ${expires}`,
      `Canonical: ${base}/.well-known/security.txt`,
      'Preferred-Languages: en',
      '',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}
