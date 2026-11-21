'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, ArrowRight, Flame } from 'lucide-react';
import { useApp } from '../context';

interface OffersListClientProps {
  initialOffers: any[];
}

export default function OffersListClient({ initialOffers }: OffersListClientProps) {
  const { resolveImageUrl } = useApp();
  const offers = initialOffers || [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-3">
            <Flame className="w-3.5 h-3.5 fill-current" />
            Special Deals &amp; Campaigns
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Exclusive Offers &amp; Flash Sales
          </h1>
          <p className="text-sm sm:text-base text-slate-500">
            Limited-time promotional discounts across curated footwear collections. Automatic savings applied at checkout.
          </p>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <Tag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Campaigns Right Now</h3>
            <p className="text-xs text-slate-500 mb-6">
              Our flash sales sell out fast. Stay tuned or check out our full sneaker collection.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-orange transition-colors"
            >
              Browse Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const bannerSrc = offer.banner ? resolveImageUrl(offer.banner) : '';

              return (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-amber-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Banner Header */}
                  <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden flex items-center justify-center">
                    {bannerSrc ? (
                      <img
                        src={bannerSrc}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/70 flex items-center justify-center p-6 text-center">
                        <span className="text-xl sm:text-2xl font-black text-white/90">
                          {offer.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                        {offer.badge_text || offer.discount_badge}
                      </span>
                      {offer.is_live && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-brand-orange transition-colors duration-200 line-clamp-1 mb-2">
                        {offer.title}
                      </h2>
                      {offer.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                          {offer.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {{ ...offer }.products_count || 0} Products
                      </span>
                      <span className="font-bold text-brand-orange inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        View Campaign <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
