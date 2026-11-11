import { NextResponse, type NextRequest } from 'next/server';
// Nonce policy is report-only until real browser reports have been reviewed.
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; report-uri /api/csp-report`;
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  // Next reads the request CSP to apply the nonce to framework scripts.
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy-Report-Only', policy);
  if (/^\/(shahroz|admin|portal|api)(\/|$)/.test(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'no-store'); response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp|avif)$).*)'] };
