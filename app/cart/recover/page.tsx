'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp, CartItem } from '../../context';
import { setCartToken } from '../../utils/cartSync';

function RecoverCart() {
  const router = useRouter();
  const params = useSearchParams();
  const { setCart } = useApp();
  const [error, setError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    const coupon = params.get('coupon');

    if (!token) {
      router.replace('/shop');
      return;
    }

    const restore = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
        const res = await fetch(`${base}/cart-recover/${encodeURIComponent(token)}`, {
          headers: { Accept: 'application/json' },
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.status !== 'success') {
          setError(json.message || 'This cart is no longer available.');
          setTimeout(() => router.replace('/shop'), 2500);
          return;
        }

        const recovered = (json.data?.items || []) as CartItem[];

        // Keep anything already in this browser's cart, add the recovered items on top.
        setCart((prev) => {
          const merged = [...prev];
          recovered.forEach((item) => {
            if (!merged.some((m) => m.id === item.id)) merged.push(item);
          });
          return merged;
        });

        // Continue tracking under the same cart, and carry the coupon over to checkout.
        setCartToken(token);
        try {
          if (coupon) localStorage.setItem('pending_coupon', coupon);
        } catch {
          // ignore
        }

        router.replace('/checkout');
      } catch {
        setError('Could not restore your cart. Please try again.');
        setTimeout(() => router.replace('/shop'), 2500);
      }
    };

    restore();
  }, [params, router, setCart]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
      {error ? (
        <p className="text-sm font-semibold text-slate-600">{error}</p>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Restoring your cart...</p>
        </>
      )}
    </div>
  );
}

export default function CartRecoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <RecoverCart />
    </Suspense>
  );
}
