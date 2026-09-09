/**
 * Centralized API & Multi-Storefront Tenant Helper for Clothing App
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8088/api';
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
}

export function getImageBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || 'http://127.0.0.1:8088';
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
}

/**
 * Resolves active shop slug or custom domain from window location
 */
export function getActiveShopContext(): { slug?: string; domain?: string } {
  if (typeof window !== 'undefined') {
    // 1. Check URL query param ?shop=slug or ?shop_slug=slug
    const urlParams = new URLSearchParams(window.location.search);
    const queryShop = urlParams.get('shop') || urlParams.get('shop_slug');
    if (queryShop) {
      localStorage.setItem('active_shop_slug', queryShop);
      return { slug: queryShop };
    }

    const hostname = window.location.hostname;

    // 2. Check if local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const envSlug = process.env.NEXT_PUBLIC_SHOP_SLUG;
      if (envSlug) return { slug: envSlug };
      const stored = localStorage.getItem('active_shop_slug');
      if (stored) return { slug: stored };
      return { slug: '' };
    }

    // 3. Check Subdomain (e.g. sloor.yourdomain.com or sloor.localhost)
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      return { slug: parts[0], domain: hostname };
    }

    // 4. Custom Domain (e.g. sloor.com or www.sloor.com)
    return { domain: hostname };
  }

  return { slug: process.env.NEXT_PUBLIC_SHOP_SLUG || '' };
}

export function getActiveShopSlug(): string {
  const ctx = getActiveShopContext();
  return ctx.slug || '';
}

/**
 * Unified fetch wrapper that attaches X-Shop-Slug and X-Shop-Domain headers automatically
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}${cleanEndpoint}`;

  const { slug, domain } = getActiveShopContext();
  const headers = new Headers(options.headers || {});

  if (slug && !headers.has('X-Shop-Slug')) {
    headers.set('X-Shop-Slug', slug);
  }

  if (domain && !headers.has('X-Shop-Domain')) {
    headers.set('X-Shop-Domain', domain);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
