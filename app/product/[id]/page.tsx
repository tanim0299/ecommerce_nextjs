import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id || '';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api/';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const imageBasePath = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || 'https://admin.sloor.bd/';
  const cleanImagePath = imageBasePath.endsWith('/') ? imageBasePath : `${imageBasePath}/`;

  let product: any = null;
  try {
    const res = await fetch(`${cleanUrl}/products/${encodeURIComponent(rawId)}`);
    if (res.ok) {
      const json = await res.json();
      product = json.data || json.result;
    }
  } catch (err) {
    console.error('Error fetching product for metadata:', err);
  }

  if (!product) {
    return {
      title: 'SLOOR BD | Luxury Footwear & Shoes',
      description: 'Explore authentic sneakers and luxury footwear at SLOOR BD.',
      openGraph: {
        title: 'SLOOR BD | Luxury Footwear & Shoes',
        description: 'Explore authentic sneakers and luxury footwear at SLOOR BD.',
        url: 'https://sloor.bd',
        images: [{ url: 'https://sloor.bd/favicon.png', width: 1200, height: 630, alt: 'SLOOR BD' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SLOOR BD | Luxury Footwear & Shoes',
        description: 'Explore authentic sneakers and luxury footwear at SLOOR BD.',
        images: ['https://sloor.bd/favicon.png'],
      },
    };
  }

  const name = product.name || 'Product';
  const price = product.sale_price || product.regular_price;
  const priceStr = price ? `BDT ${Number(price).toLocaleString('en-US')}` : '';
  const siteTitle = 'SLOOR BD';
  const seo = product.seo || {};
  const metaTitle = seo.title || `${name}${priceStr ? ` - ${priceStr}` : ''} | ${siteTitle}`;
  const cleanDesc = (product.description || '')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  const metaDesc =
    seo.description ||
    (cleanDesc
      ? `${cleanDesc}...`
      : `Buy authentic ${name} at SLOOR BD. Fast Cash on Delivery all over Bangladesh, 7-day easy exchange.`);

  const canonicalUrl = seo.canonical || `https://sloor.bd/product/${encodeURIComponent(product.slug || product.id)}`;

  // Find the primary product image (the user wants the product's first image in social share previews)
  let primaryImage = '';
  if (Array.isArray(product.images) && product.images.length > 0) {
    // Sort by sl_no or take the very first image
    const sorted = [...product.images].sort((a: any, b: any) => (Number(a.sl_no) || 999) - (Number(b.sl_no) || 999));
    const mainImg = product.images.find((img: any) => img.type?.toLowerCase() === 'main' && img.url);
    primaryImage = (mainImg || sorted[0] || product.images[0])?.url || '';
  }

  if (!primaryImage && Array.isArray(product.variants) && product.variants[0]?.image) {
    primaryImage = product.variants[0].image;
  }

  let absoluteImageUrl = 'https://sloor.bd/favicon.png';
  if (primaryImage) {
    if (primaryImage.startsWith('http://') || primaryImage.startsWith('https://')) {
      absoluteImageUrl = primaryImage;
    } else {
      const cleanPath = primaryImage.startsWith('/') ? primaryImage.slice(1) : primaryImage;
      absoluteImageUrl = `${cleanImagePath}${cleanPath}`;
    }
  }

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: canonicalUrl,
      siteName: 'SLOOR BD',
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          width: 1200,
          height: 1200,
          alt: seo.image_alt || `${name} - SLOOR BD`,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [absoluteImageUrl],
    },
  };
}

export async function generateStaticParams() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api/';
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
  } catch (err) {
    console.error('generateStaticParams error:', err);
  }
  return [{ id: '1' }, { id: 'new-balance-9060' }];
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProductDetailClient />
    </Suspense>
  );
}
