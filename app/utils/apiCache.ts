/**
 * Global In-Memory API Cache & Request Deduplication
 *
 * 1. Request Deduplication: If multiple components request the same URL simultaneously
 *    (e.g., LayoutWrapper and Shop Page), only ONE network request is made.
 * 2. In-Memory Caching: Cached for 5 minutes by default, allowing instant (0ms) page
 *    transitions without flashing loading skeletons.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export async function fetchWithCache<T = any>(
  url: string,
  options?: RequestInit,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();

  // Only cache GET requests
  if (method !== 'GET') {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  }

  const cacheKey = url;
  const now = Date.now();

  // 1. Check existing memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  // 2. Check if the exact same request is already in-flight
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  // 3. Initiate request with deduplication
  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
      return data as T;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export function clearApiCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
}
