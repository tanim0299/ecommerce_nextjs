import type { Metadata } from 'next';
import CustomPolicyClient from './CustomPolicyClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let pageData: any = null;
  try {
    const res = await fetch(`${cleanUrl}/pages/${encodeURIComponent(slug)}`);
    if (res.ok) {
      const json = await res.json();
      pageData = json.data || json.result;
    }
  } catch (err) {
    console.error('Error fetching page metadata:', err);
  }

  const defaultCanonical = `https://sloor.bd/pages/${slug}`;
  if (!pageData) {
    return {
      title: 'SLOOR BD | Information & Policies',
      alternates: {
        canonical: defaultCanonical,
      },
    };
  }

  const title = pageData.meta_title || `${pageData.title} | SLOOR BD`;
  const description =
    pageData.meta_description ||
    (pageData.description
      ? pageData.description
          .replace(/<[^>]*>?/gm, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 160)
      : 'SLOOR BD official policy and customer information.');
  const canonicalUrl = pageData.canonical_url || defaultCanonical;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'SLOOR BD',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

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
