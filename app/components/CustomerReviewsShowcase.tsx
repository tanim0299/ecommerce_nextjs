'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Camera, ZoomIn, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context';
import ReviewScreenshotModal from './ReviewScreenshotModal';

interface WebsiteReview {
  id: number;
  reviewer_name: string;
  reviewer_image?: string | null;
  screenshots?: string[];
  rating: number;
  review_text: string;
  source?: string | null;
  review_date?: string | null;
  isProductTagged?: boolean;
}

interface Props {
  /** When set, reviews tagged to this product are shown first, complemented with general reviews. */
  productId?: number;
}

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="w-4 h-4 shrink-0" aria-label="Google">
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
  const [isHovered, setIsHovered] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Lightbox Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    reviewerName?: string;
    rating?: number;
    reviewDate?: string;
    reviewText?: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
        if (productId) {
          // Fetch product tagged reviews
          let tagged: WebsiteReview[] = [];
          try {
            const res = await fetch(`${base}/website-reviews?product_id=${productId}`);
            if (res.ok) {
              const json = await res.json();
              if (json.status === 'success' && Array.isArray(json.data)) {
                tagged = json.data.map((r: WebsiteReview) => ({ ...r, isProductTagged: true }));
              }
            }
          } catch (e) {
            console.error('Failed to load tagged reviews:', e);
          }

          // Fetch general reviews to make a complete carousel slider
          let general: WebsiteReview[] = [];
          try {
            const generalRes = await fetch(`${base}/website-reviews?home=1`);
            if (generalRes.ok) {
              const generalJson = await generalRes.json();
              if (generalJson.status === 'success' && Array.isArray(generalJson.data)) {
                general = generalJson.data;
              }
            }
          } catch (e) {
            console.error('Failed to load general reviews:', e);
          }

          // Combine tagged reviews first, then general reviews without duplication
          const seen = new Set(tagged.map((r) => r.id));
          const combined = [...tagged, ...general.filter((r) => !seen.has(r.id))];

          if (mounted) {
            setReviews(combined);
          }
        } else {
          const res = await fetch(`${base}/website-reviews?home=1`);
          if (res.ok) {
            const json = await res.json();
            if (mounted && json.status === 'success' && Array.isArray(json.data)) {
              setReviews(json.data);
            }
          }
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

  // Auto-sliding interval: slides reviews horizontally like a carousel
  useEffect(() => {
    if (reviews.length <= 1 || isHovered || modalState.isOpen) return;

    const timer = setInterval(() => {
      const el = scroller.current;
      if (!el) return;

      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const itemWidth = el.querySelector('article')?.clientWidth || 300;
        el.scrollBy({ left: itemWidth + 16, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [reviews.length, isHovered, modalState.isOpen]);

  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const itemWidth = el.querySelector('article')?.clientWidth || 300;
    el.scrollBy({ left: dir * (itemWidth + 16), behavior: 'smooth' });
  };

  const openLightbox = (review: WebsiteReview, initialIndex: number) => {
    if (!review.screenshots || review.screenshots.length === 0) return;
    setModalState({
      isOpen: true,
      images: review.screenshots,
      currentIndex: initialIndex,
      reviewerName: review.reviewer_name,
      rating: review.rating,
      reviewDate: formatDate(review.review_date),
      reviewText: review.review_text,
    });
  };

  const closeLightbox = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <section
      id="customer-reviews-section"
      className={`w-full ${productId ? 'my-4' : 'py-12 sm:py-16'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Homepage Section Header - Styled identically to Why Choose Us */}
      {!productId && (
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Customers Say About Us
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal mt-2.5 leading-relaxed">
            Real experiences, honest feedback, and verified parcel unboxings from our valued customers across Bangladesh.
          </p>
        </div>
      )}

      <div className="bg-gradient-to-b from-slate-50/90 to-white/95 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {productId ? (
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#c07828]">
                <GoogleG /> Real Customer Experiences &amp; Proofs
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{average.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${n <= Math.round(average) ? 'fill-[#f5b301] text-[#f5b301]' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-semibold">({reviews.length} authentic reviews)</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Feedback, parcel unboxing proofs, and verified buyer reviews for our footwear.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-2xs">
                <GoogleG />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Verified Reviews</span>
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
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  ({reviews.length} authentic reviews)
                </span>
              </div>
            </div>
          )}

          {reviews.length > 1 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 hidden sm:inline-block mr-1">
                Auto-sliding • Drag or tap arrows
              </span>
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous review"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:border-[#c07828] hover:text-[#c07828] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Next review"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:border-[#c07828] hover:text-[#c07828] flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel / Slider Container */}
        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-stretch"
        >
          {reviews.map((r) => {
            const screenshots = Array.isArray(r.screenshots) ? r.screenshots : [];
            const maxThumbs = 3;
            const extraCount = screenshots.length - maxThumbs;

            return (
              <article
                key={r.id}
                className="snap-start shrink-0 w-[86%] sm:w-[48%] lg:w-[32%] xl:w-[24.5%] bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-[#c07828]/50 transition-all duration-300 flex flex-col gap-3 group/card"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  {r.reviewer_image ? (
                    <img
                      src={resolveImageUrl(r.reviewer_image)}
                      alt={r.reviewer_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#c07828] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                      {r.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">{r.reviewer_name}</div>
                    <div className="text-[11px] text-slate-400">{formatDate(r.review_date)}</div>
                  </div>
                  {(r.source || 'google') === 'google' && <GoogleG />}
                </div>

                {/* Rating & Tag Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-[#f5b301] text-[#f5b301]' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{r.rating}.0</span>
                  </div>

                  {r.isProductTagged && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">
                  {r.review_text}
                </p>

                {/* Customer Proof Screenshots Thumbnails */}
                {screenshots.length > 0 && (
                  <div className="mt-auto pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1 text-slate-800">
                        <Camera className="w-3 h-3 text-[#c07828]" />
                        <span>Customer Proof ({screenshots.length})</span>
                      </span>
                      <span className="text-slate-400 font-normal">Click to zoom</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {screenshots.slice(0, maxThumbs).map((shot, idx) => {
                        const isLastWithMore = idx === maxThumbs - 1 && extraCount > 0;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => openLightbox(r, idx)}
                            title="Click to view full screenshot proof"
                            aria-label="View screenshot proof"
                            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group/thumb cursor-pointer hover:border-[#c07828] transition-all"
                          >
                            <img
                              src={resolveImageUrl(shot)}
                              alt={`Proof screenshot ${idx + 1}`}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                            {isLastWithMore && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold">
                                +{extraCount + 1}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <ReviewScreenshotModal
        isOpen={modalState.isOpen}
        onClose={closeLightbox}
        images={modalState.images}
        currentIndex={modalState.currentIndex}
        onChangeIndex={(newIdx) => setModalState((prev) => ({ ...prev, currentIndex: newIdx }))}
        reviewerName={modalState.reviewerName}
        rating={modalState.rating}
        reviewDate={modalState.reviewDate}
        reviewText={modalState.reviewText}
      />
    </section>
  );
}
