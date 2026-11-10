'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context';

export interface WhyChooseUsItem {
  id: number;
  title: string;
  sub_title?: string | null;
  icon?: string | null;
  image?: string | null;
  sl_no?: number;
}

const STAR_COLORS = [
  '#d9653b', // 01: Terracotta / Coral Orange (matches screenshot)
  '#d49b35', // 02: Warm Golden Mustard (matches screenshot)
  '#6e947c', // 03: Muted Sage Green (matches screenshot)
  '#537895', // 04: Slate Denim Blue
];

const DEFAULT_FALLBACK_PERKS: WhyChooseUsItem[] = [
  {
    id: 1,
    title: '100% Premium Grade Kicks',
    sub_title: 'Finest tumbled calfskin, exact silhouette & artisan stitch craft for street elegance.',
    image: '/why-choose-us/perk1.jpg',
    sl_no: 1,
  },
  {
    id: 2,
    title: 'Double-Boxed Safe Delivery',
    sub_title: 'Shoe box damage protection with nationwide cash on delivery right to your doorstep.',
    image: '/why-choose-us/perk2.jpg',
    sl_no: 2,
  },
  {
    id: 3,
    title: 'All-Day Cushioning & Grip',
    sub_title: 'Ergonomic footbed designed for supreme comfort, arch support & anti-slip traction.',
    image: '/why-choose-us/perk3.jpg',
    sl_no: 3,
  },
];

function StarBadge({ number, color }: { number: string; color: string }) {
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center filter drop-shadow-md">
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color }}>
        <polygon
          points="50,4 63,38 98,38 70,60 80,94 50,73 20,94 30,60 2,38 37,38"
          fill="currentColor"
        />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize="26"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5px"
        >
          {number}
        </text>
      </svg>
    </div>
  );
}

export default function WhyChooseUs() {
  const { resolveImageUrl, systemConfig } = useApp();
  const [items, setItems] = useState<WhyChooseUsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchWhyChooseUs = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/why-choose-us`);

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
            const sorted = (json.data as WhyChooseUsItem[]).sort(
              (a, b) => (a.sl_no || 0) - (b.sl_no || 0)
            );
            if (isMounted) setItems(sorted);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load Why Choose Us items:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Fallback data
      if (isMounted) {
        setItems(DEFAULT_FALLBACK_PERKS);
        setIsLoading(false);
      }
    };

    fetchWhyChooseUs();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && items.length === 0) {
    return null;
  }

  // Derive display brand title
  const rawBrand = systemConfig?.title || 'SLOOR';
  const brandName = rawBrand.includes('-')
    ? rawBrand.split('-')[0].trim()
    : rawBrand.split(' ')[0].trim();

  return (
    <section id="why-choose-us-section" className="w-full py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose {brandName}?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal mt-2.5 leading-relaxed">
            Premium luxury kicks engineered for street style, high durability, and all-day comfort.
          </p>
        </div>

        {/* Circular Cards Grid */}
        <div
          className={`grid gap-8 sm:gap-10 lg:gap-12 ${
            items.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
              : items.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center animate-pulse">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-full bg-slate-200 mb-5" />
                  <div className="h-5 w-40 bg-slate-200 rounded-md mb-2" />
                  <div className="h-3 w-56 bg-slate-100 rounded-md" />
                </div>
              ))
            : items.map((item, index) => {
                const stepNumber = String(item.sl_no ?? index + 1).padStart(2, '0');
                const badgeColor = STAR_COLORS[index % STAR_COLORS.length];
                const imageSrc = item.image
                  ? resolveImageUrl(item.image)
                  : DEFAULT_FALLBACK_PERKS[index % DEFAULT_FALLBACK_PERKS.length]?.image || '/why-choose-us/perk1.jpg';

                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center text-center group transition-all duration-300"
                  >
                    {/* Circle Image with Overlapping Star Badge */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 mx-auto mb-5">
                      {/* Top-Left Star Badge */}
                      <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 z-20 transition-transform duration-300 group-hover:scale-110">
                        <StarBadge number={stepNumber} color={badgeColor} />
                      </div>

                      {/* Circular Frame */}
                      <div className="w-full h-full rounded-full overflow-hidden shadow-md ring-4 ring-white border border-slate-200/90 bg-slate-50 transition-all duration-500 group-hover:shadow-xl group-hover:border-[#c07828]/40">
                        <img
                          src={imageSrc}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Content below Circle */}
                    <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight mb-2 group-hover:text-[#c07828] transition-colors duration-200">
                      {item.title}
                    </h3>
                    {item.sub_title && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xs sm:max-w-sm">
                        {item.sub_title}
                      </p>
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
