import CustomPolicyClient from './CustomPolicyClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const res = await fetch(`${cleanUrl}/pages`);
    if (res.ok) {
      const json = await res.json();
      const items = json.result || json.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((p: any) => ({ slug: String(p.slug) }));
      }
    }
  } catch {
    // fallback if backend is not reachable at build time
  }
  return [{ slug: 'privacy-policy' }, { slug: 'terms-and-conditions' }];
}

export default async function CustomPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CustomPolicyClient params={params} />;
}
