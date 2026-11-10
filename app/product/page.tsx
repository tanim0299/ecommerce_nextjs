'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductDetailClient from './[id]/ProductDetailClient';

function ProductRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // When the server rewrites an unknown /product/<slug> URL (a product added after the
  // static build) to this page, the slug is only in the browser pathname.
  const [pathSlug, setPathSlug] = useState<string | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('product');
    const fromPath = idx !== -1 && parts[idx + 1] ? decodeURIComponent(parts[idx + 1]) : '';
    if (fromPath) {
      setPathSlug(fromPath);
      return;
    }

    const target = searchParams.get('slug') || searchParams.get('id');
    if (target) {
      router.replace(`/product/${encodeURIComponent(target)}`);
    } else {
      router.replace('/shop');
    }
  }, [searchParams, router]);

  if (pathSlug) return <ProductDetailClient />;

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 py-12 min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Redirecting to product...</p>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 py-12 min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductRedirectHandler />
    </Suspense>
  );
}
