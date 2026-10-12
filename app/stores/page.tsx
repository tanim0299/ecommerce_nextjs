'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StoresPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/contact');
  }, [router]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}