'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ProductRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const target = slug || id;

    if (target) {
      router.replace(`/product/${encodeURIComponent(target)}`);
    } else {
      router.replace('/shop');
    }
  }, [searchParams, router]);

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
