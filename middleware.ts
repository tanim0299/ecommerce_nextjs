import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const hostWithoutPort = hostname.split(':')[0];

  // 1. Check if shop is provided in query params (?shop=... or ?shop_slug=...)
  let shopSlug = url.searchParams.get('shop') || url.searchParams.get('shop_slug') || '';

  // 2. Extract subdomain or custom domain
  let shopDomain = '';
  if (!shopSlug && hostWithoutPort !== 'localhost' && hostWithoutPort !== '127.0.0.1') {
    const parts = hostWithoutPort.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      shopSlug = parts[0];
    } else {
      shopDomain = hostWithoutPort;
    }
  }

  // 3. Fallback to env variable
  if (!shopSlug && !shopDomain) {
    shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || '';
  }

  const requestHeaders = new Headers(request.headers);
  if (shopSlug) {
    requestHeaders.set('x-shop-slug', shopSlug);
  }
  if (shopDomain) {
    requestHeaders.set('x-shop-domain', shopDomain);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (shopSlug) {
    response.headers.set('x-shop-slug', shopSlug);
  }
  if (shopDomain) {
    response.headers.set('x-shop-domain', shopDomain);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files, images, favicon, api routes
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
