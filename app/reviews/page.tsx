'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, MessageSquareQuote, Camera, ZoomIn, ShoppingBag } from 'lucide-react';
import { useApp, getProductUrl } from '../context';
import ReviewScreenshotModal from '../components/ReviewScreenshotModal';

interface ReviewProduct {
  id: number;
  name: string;
  slug?: string;
  sale_price?: number;
  image?: string | null;
}

interface WebsiteReview {
  id: number;
  reviewer_name: string;
  reviewer_image?: string | null;
  screenshots?: string[];
  rating: number;
  review_text: string;
  source?: string | null;
  review_date?: string | null;
  products?: ReviewProduct[];
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

function Stars({ value, className = 'w-4 h-4' }: { value: number; className?: string }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= value ? 'fill-[#f5b301] text-[#f5b301]' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { resolveImageUrl } = useApp();
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number>(0);
  const [photosOnly, setPhotosOnly] = useState<boolean>(false);

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
        const res = await fetch(`${base}/website-reviews`);
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.status === 'success' && Array.isArray(json.data)) {
            setReviews(json.data);
          }
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const average = useMemo(
    () => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0),
    [reviews]
  );

  const breakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
      }),
    [reviews]
  );

  const withPhotosCount = useMemo(
    () => reviews.filter((r) => Array.isArray(r.screenshots) && r.screenshots.length > 0).length,
    [reviews]
  );

  const visible = useMemo(() => {
    return reviews.filter((r) => {
      if (starFilter && r.rating !== starFilter) return false;
      if (photosOnly && (!Array.isArray(r.screenshots) || r.screenshots.length === 0)) return false;
      return true;
    });
  }, [reviews, starFilter, photosOnly]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c07828]/10 text-[#c07828] text-[10px] sm:text-xs font-black uppercase tracking-wider">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          Customer Reviews & Proofs
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          What Our Customers Say
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Authentic customer feedback, unboxing proofs, and real delivery conversations from people who love our kicks.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">No reviews yet.</div>
      ) : (
        <>
          {/* Summary Banner */}
          <div className="bg-gradient-to-b from-slate-50/90 to-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-8 grid grid-cols-1 md:grid-cols-[230px_1fr] gap-6 md:gap-10 items-center shadow-xs">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="text-5xl font-black text-slate-900">{average.toFixed(1)}</div>
              <Stars value={Math.round(average)} className="w-5 h-5" />
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <GoogleG /> Based on {reviews.length} review{reviews.length > 1 ? 's' : ''}
              </div>

              {withPhotosCount > 0 && (
                <button
                  type="button"
                  onClick={() => setPhotosOnly(!photosOnly)}
                  className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    photosOnly
                      ? 'bg-[#c07828] text-white shadow-sm'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-[#c07828] shrink-0" />
                  <span>{photosOnly ? 'Showing' : 'Filter:'} {withPhotosCount} With Photos</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {breakdown.map((b) => (
                <button
                  key={b.star}
                  type="button"
                  onClick={() => setStarFilter(starFilter === b.star ? 0 : b.star)}
                  className={`flex items-center gap-3 text-xs rounded-lg px-2 py-1 transition-colors cursor-pointer ${
                    starFilter === b.star ? 'bg-[#c07828]/15 ring-1 ring-[#c07828]/30 font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="w-10 flex items-center gap-1 font-bold text-slate-700 shrink-0">
                    {b.star} <Star className="w-3 h-3 fill-[#f5b301] text-[#f5b301]" />
                  </span>
                  <span className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <span className="block h-full bg-[#f5b301] rounded-full" style={{ width: `${b.pct}%` }} />
                  </span>
                  <span className="w-8 text-right text-slate-500 font-medium">{b.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Status Bar */}
          {(starFilter > 0 || photosOnly) && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Active filters:</span>
                {starFilter > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-bold">
                    {starFilter} Stars
                  </span>
                )}
                {photosOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100/70 border border-amber-300 text-amber-900 font-bold">
                    <Camera className="w-3 h-3" /> With Photos / Proofs
                  </span>
                )}
                <span className="text-slate-500">({visible.length} results)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStarFilter(0);
                  setPhotosOnly(false);
                }}
                className="text-[#c07828] font-bold hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}

          {/* Review cards */}
          {visible.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200/80">
              No reviews match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {visible.map((r) => {
                const screenshots = Array.isArray(r.screenshots) ? r.screenshots : [];
                const maxThumbs = 3;
                const extraCount = screenshots.length - maxThumbs;

                return (
                  <article
                    key={r.id}
                    className="h-full bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-[#c07828]/40 transition-all duration-300 flex flex-col gap-3.5 group/card"
                  >
                    {/* Reviewer Header */}
                    <div className="flex items-center gap-3">
                      {r.reviewer_image ? (
                        <img
                          src={resolveImageUrl(r.reviewer_image)}
                          alt={r.reviewer_name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#c07828] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                          {r.reviewer_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate">{r.reviewer_name}</div>
                        <div className="text-[11px] text-slate-400">{formatDate(r.review_date)}</div>
                      </div>
                      {(r.source || 'google') === 'google' && <GoogleG />}
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} />
                      <span className="text-[11px] font-bold text-slate-500">{r.rating}.0</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
                      {r.review_text}
                    </p>

                    {/* Screenshots / Proof Gallery */}
                    {screenshots.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
                          <span className="flex items-center gap-1.5 text-slate-800">
                            <Camera className="w-3.5 h-3.5 text-[#c07828]" />
                            <span>Customer Proof ({screenshots.length})</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Click to zoom</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {screenshots.slice(0, maxThumbs).map((shot, idx) => {
                            const isLastWithMore = idx === maxThumbs - 1 && extraCount > 0;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => openLightbox(r, idx)}
                                title="Click to view screenshot"
                                aria-label="View screenshot proof"
                                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group/thumb cursor-pointer hover:border-[#c07828] transition-all shadow-2xs"
                              >
                                <img
                                  src={resolveImageUrl(shot)}
                                  alt={`Proof screenshot ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                                </div>
                                {isLastWithMore && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-black">
                                    +{extraCount + 1}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tagged Products Footer */}
                    {r.products && r.products.length > 0 && (
                      <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <ShoppingBag className="w-3 h-3" />
                          <span>Tagged Product{r.products.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.products.map((p) => (
                            <Link
                              key={p.id}
                              href={getProductUrl({ id: p.id, name: p.name })}
                              title={p.name}
                              className="flex items-center gap-2 p-1 pr-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-[#c07828]/5 hover:border-[#c07828] transition-all text-slate-700 group/tag max-w-full"
                            >
                              <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                                {p.image ? (
                                  <img
                                    src={resolveImageUrl(p.image)}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                    P
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold truncate max-w-[150px] group-hover/tag:text-[#c07828]">
                                {p.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

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
    </div>
  );
}
