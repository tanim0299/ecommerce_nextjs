'use client';

import React, { Suspense } from 'react';
import OrderSuccessClient from './OrderSuccessClient';

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading order confirmation...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
