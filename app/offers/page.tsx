import type { Metadata } from 'next';
import OffersListClient from './OffersListClient';

export const metadata: Metadata = {
  title: 'Special Offers & Flash Sales | SLOOR BD',
  description: 'Explore limited-time flash sales and promotional discount campaigns on premium sneakers at SLOOR BD.',
  alternates: {
    canonical: 'https://sloor.bd/offers',
  },
};

export default async function OffersIndexPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let offers: any[] = [];
  try {
    const res = await fetch(`${cleanUrl}/offers`);
    if (res.ok) {
      const json = await res.json();
      offers = json.result || json.data || [];
    }
  } catch (err) {
    console.error('Error fetching offers list:', err);
  }

  return <OffersListClient initialOffers={offers} />;
}
