import type { Metadata } from 'next';
import OfferCampaignClient from './OfferCampaignClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let offerData: any = null;
  try {
    const res = await fetch(`${cleanUrl}/offers/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      offerData = json.data || json.result;
    }
  } catch (err) {
    console.error('Error fetching offer metadata:', err);
  }

  const defaultCanonical = `https://sloor.bd/offers/${slug}`;
  if (!offerData) {
    return {
      title: 'Special Offer & Flash Sale | SLOOR BD',
      alternates: {
        canonical: defaultCanonical,
      },
    };
  }

  const title = `${offerData.title} | SLOOR BD Flash Sale`;
  const description =
    offerData.description ||
    `Special promotional campaign ${offerData.title} at SLOOR BD. Get ${offerData.discount_badge || 'discount'} on selected sneakers with fast Cash on Delivery across Bangladesh.`;

  const canonicalUrl = defaultCanonical;
  const images = offerData.banner ? [offerData.banner] : [];

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
      type: 'website',
      images,
    },
    twitter: {
      card: offerData.banner ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  };
}

export async function generateStaticParams() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
    const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const res = await fetch(`${cleanUrl}/offers`);
    if (res.ok) {
      const json = await res.json();
      const items = json.result || json.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((o: any) => ({ slug: String(o.slug) }));
      }
    }
  } catch {
    // fallback if backend is not reachable at build time
  }
  return [
    { slug: 'mega-flash-sale' },
  ];
}

export default async function OfferCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let initialOffer: any = null;
  try {
    const res = await fetch(`${cleanUrl}/offers/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      initialOffer = json.data || json.result;
    }
  } catch (err) {
    console.error('Error fetching offer campaign details:', err);
  }

  return (
    <OfferCampaignClient
      slug={slug}
      initialOffer={initialOffer}
    />
  );
}
