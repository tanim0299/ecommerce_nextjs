'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../context';

interface WebsiteReview {
  id: number;
  reviewer_name: string;
  reviewer_image?: string | null;
  rating: number;
  review_text: string;
  source?: string | null;
  review_date?: string | null;
}

interface Props {
  /** When set, only reviews tagged to this product are shown. Otherwise homepage reviews. */
  productId?: number;
}

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="w-4 h-4" aria-label="Google">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CustomerReviewsShowcase({ productId }: Props) {
  const { resolveImageUrl } = useApp();
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
        const qs = productId ? `product_id=${productId}` : 'home=1';
        const res = await fetch(`${base}/website-reviews?${qs}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json.status === 'success' && Array.isArray(json.data)) {
          setReviews(json.data);
        }
      } catch (error) {
        console.error('Failed to load customer reviews:', error);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [productId]);

  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: 'smooth' });
  };

  return (
    <section id="customer-reviews-section" className="w-full my-2 sm:my-4">
      <div className="bg-gradient-to-b from-slate-50/80 to-white/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex items-end justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#c07828]">
              <GoogleG /> {productId ? 'Customers say about this product' : 'What our customers say'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{average.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${n <= Math.round(average) ? 'fill-[#f5b301] text-[#f5b301]' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">({reviews.length} reviews)</span>
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="hidden sm:flex gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous reviews"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:border-[#c07828] hover:text-[#c07828] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Next reviews"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:border-[#c07828] hover:text-[#c07828] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scroller}
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((r) => (
            <article
              key={r.id}
              className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31%] xl:w-[23.5%] bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-[#c07828]/40 transition-all duration-300 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                {r.reviewer_image ? (
                  <img
                    src={resolveImageUrl(r.reviewer_image)}
                    alt={r.reviewer_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#c07828] text-white font-bold flex items-center justify-center">
                    {r.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">{r.reviewer_name}</div>
                  <div className="text-[11px] text-slate-400">{formatDate(r.review_date)}</div>
                </div>
                {(r.source || 'google') === 'google' && <GoogleG />}
              </div>

              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= r.rating ? 'fill-[#f5b301] text-[#f5b301]' : 'text-slate-200'}`}
                  />
                ))}
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-6 whitespace-pre-line">
                {r.review_text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
