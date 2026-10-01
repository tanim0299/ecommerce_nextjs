import ProductDetailClient from './ProductDetailClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const res = await fetch(`${cleanUrl}/products`);
    if (res.ok) {
      const json = await res.json();
      const items = json.result || json.data || [];
      if (Array.isArray(items) && items.length > 0) {
        const params: { id: string }[] = [];
        items.forEach((p: any) => {
          if (p.slug) params.push({ id: String(p.slug) });
          if (p.id) params.push({ id: String(p.id) });
        });
        return params;
      }
    }
  } catch {
    // fallback if backend is not reachable at build time
  }
  return [{ id: '1' }, { id: 'new-balance-9060' }];
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
