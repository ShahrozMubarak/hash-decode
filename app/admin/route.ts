export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const url = new URL(request.url);
  return Response.redirect(new URL('/shahroz' + url.search, url.origin), 308);
}
