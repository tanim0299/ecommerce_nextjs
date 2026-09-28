import { Suspense } from 'react';
import TrackOrderClient from './TrackOrderClient';

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
