'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Truck,
  RefreshCw,
  ShieldCheck,
  Award,
  Heart,
  Headphones,
  Zap,
  CheckCircle,
  Package,
  Clock,
  CreditCard,
  Flame,
} from 'lucide-react';
import { useApp } from '../context';

export interface WhyChooseUsItem {
  id: number;
  title: string;
  sub_title?: string | null;
  icon?: string | null;
  image?: string | null;
  sl_no?: number;
}

const DEFAULT_FALLBACK_PERKS: WhyChooseUsItem[] = [
  {
    id: 1,
    title: '100% Premium Grade Kicks',
    sub_title: 'Finest materials, exact silhouette & premium craft finish',
    icon: 'sparkles',
    sl_no: 1,
  },
  {
    id: 2,
    title: 'Double-Boxed Safe Delivery',
    sub_title: 'Shoe box damage protection with nationwide Cash on Delivery',
    icon: 'package',
    sl_no: 2,
  },
  {
    id: 3,
    title: '7-Day Size Exchange',
    sub_title: 'Size not fitting? Instant hassle-free replacement support',
    icon: 'refresh-cw',
    sl_no: 3,
  },
  {
    id: 4,
    title: 'All-Day Cushioning & Grip',
    sub_title: 'Ergonomic insole designed for ultimate comfort & anti-slip traction',
    icon: 'shield-check',
    sl_no: 4,
  },
];

export default function WhyChooseUs() {
  const { resolveImageUrl } = useApp();
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

      // Fallback
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

  const renderIcon = (iconName?: string | null, customImg?: string | null) => {
    if (customImg) {
      return (
        <img
          src={resolveImageUrl(customImg)}
          alt="Perk Badge"
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
        />
      );
    }

    const key = (iconName || 'sparkles').toLowerCase().trim();

    switch (key) {
      case 'truck':
      case 'delivery':
        return <Truck className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'shield-check':
      case 'shield':
      case 'security':
        return <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'refresh-cw':
      case 'refresh':
      case 'rotate':
      case 'exchange':
        return <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'award':
      case 'quality':
      case 'star':
        return <Award className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'heart':
        return <Heart className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'headphones':
      case 'support':
        return <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'zap':
      case 'lightning':
        return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'check-circle':
      case 'check':
        return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'package':
      case 'box':
        return <Package className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'clock':
        return <Clock className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'credit-card':
      case 'payment':
        return <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'flame':
      case 'hot':
        return <Flame className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <section id="why-choose-us-section" className="w-full my-2 sm:my-4">
      <div className="bg-gradient-to-b from-slate-50/80 to-white/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 flex flex-col items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c07828]/10 text-[#c07828] text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#c07828]" />
            Why Choose Sloor Kicks
          </span>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Crafted For Streetwear & All-Day Comfort
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Premium grade footwear, true-to-fit comfort, and worry-free double-boxed shipping.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-start gap-3.5 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                    <div className="h-3 w-full bg-slate-100 rounded-md" />
                  </div>
                </div>
              ))
            : items.map((item) => (
                <div
                  key={item.id}
                  className="group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-100/90 hover:border-[#c07828]/40 hover:shadow-md transition-all duration-300 flex items-start gap-3.5 sm:gap-4 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c07828] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#c07828]/10 text-[#c07828] group-hover:bg-[#c07828] group-hover:text-white flex items-center justify-center shrink-0 shadow-xs transition-all duration-300 group-hover:scale-105">
                    {renderIcon(item.icon, item.image)}
                  </div>

                  <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 min-w-0">
                    <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-[#c07828] transition-colors duration-200 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.sub_title && (
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.sub_title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
