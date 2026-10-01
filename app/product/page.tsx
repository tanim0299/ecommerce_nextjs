'use client';

import React, { Suspense } from 'react';
import ProductDetailClient from './[id]/ProductDetailClient';

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 py-4">
        <div className="grid min-h-[460px] grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="aspect-square w-full shimmer-effect-light rounded-2xl" />
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 py-1">
            <div className="h-8 w-3/4 shimmer-effect-light rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <ProductDetailClient />
    </Suspense>
  );
}
