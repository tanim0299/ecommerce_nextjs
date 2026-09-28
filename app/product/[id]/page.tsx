import ProductDetailClient from './ProductDetailClient';

export async function generateStaticParams() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const res = await fetch(`${cleanUrl}/products`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((p: any) => ({ id: String(p.id) }));
      }
    }
  } catch {
    // fallback if backend is not reachable at build time
  }
  return [{ id: '1' }];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProductDetailClient params={params} />;
}
