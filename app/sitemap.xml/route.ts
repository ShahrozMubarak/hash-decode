import { entries } from '@/lib/cms';
import { origin } from '@/lib/meta';
import { listProjects } from '@/lib/studio-data';
import { failure } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    if (!origin) return new Response('Site origin is not configured.', { status: 503 });
    const [posts, projects] = await Promise.all([entries('post'), listProjects()]);
    const pages = ['/', '/portfolio', '/services', '/about', '/contact', '/blog', '/privacy', '/tools', '/tools/security-check', '/tools/estimate', ...posts.map(p => '/blog/' + encodeURIComponent(p.id)), ...projects.map(p => '/portfolio/' + encodeURIComponent(p.slug))];
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.map(path => '<url><loc>' + origin + path + '</loc></url>').join('') + '</urlset>', { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
  } catch (error) { return failure(error); }
}
