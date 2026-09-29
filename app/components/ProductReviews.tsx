'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context';

interface ReviewItem {
  id: number;
  product_id: number;
  user_id?: number | null;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  review: string | null;
  is_approved?: boolean;
  created_at: string;
  created_at_human: string;
  is_owner: boolean;
}

interface RatingBreakdown {
  count: number;
  percentage: number;
}

interface ProductReviewsProps {
  productId: number;
  onReviewStatsUpdate?: (count: number, avg: number) => void;
}

// Robust Avatar component with graceful image error handling and initial avatar fallback
function UserAvatar({ name, image, size = 'w-10 h-10', textSize = 'text-sm' }: { name: string; image?: string | null; size?: string; textSize?: string }) {
  const { resolveImageUrl } = useApp();
  const [hasError, setHasError] = useState(false);

  const initial = (name || 'C').trim().charAt(0).toUpperCase();
  const resolvedUrl = image ? resolveImageUrl(image) : null;

  if (resolvedUrl && !hasError) {
    return (
      <img
        src={resolvedUrl}
        alt={name || 'User'}
        onError={() => setHasError(true)}
        className={`${size} rounded-full object-cover border border-slate-200 shadow-sm shrink-0`}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black ${textSize} shadow-sm shrink-0`}>
      {initial}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  5: '5 - Excellent',
  4: '4 - Very Good',
  3: '3 - Good',
  2: '2 - Fair',
  1: '1 - Poor',
};

export default function ProductReviews({ productId, onReviewStatsUpdate }: ProductReviewsProps) {
  const { user, token, showToast } = useApp();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<Record<number, RatingBreakdown>>({});
  const [userReview, setUserReview] = useState<ReviewItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewInput, setReviewInput] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestContact, setGuestContact] = useState<string>('');

  const getApiBaseUrl = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    return apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  };

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${getApiBaseUrl()}/products/${productId}/reviews`, {
        headers,
      });

      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();

      if (data.status === 'success' && data.data) {
        setReviews(data.data.reviews || []);
        setAverageRating(data.data.average_rating || 0);
        setTotalReviews(data.data.total_reviews || 0);
        setBreakdown(data.data.breakdown || {});
        setUserReview(data.data.user_review || null);

        if (data.data.user_review) {
          setRatingInput(data.data.user_review.rating);
          setReviewInput(data.data.user_review.review || '');
        }

        if (onReviewStatsUpdate) {
          onReviewStatsUpdate(data.data.total_reviews || 0, data.data.average_rating || 0);
        }
      }
    } catch (err) {
      console.error('Reviews load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, token, onReviewStatsUpdate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleOpenForm = () => {
    if (userReview) {
      setRatingInput(userReview.rating);
      setReviewInput(userReview.review || '');
    } else {
      setRatingInput(5);
      setReviewInput('');
      setGuestName('');
      setGuestContact('');
    }
    setShowForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && !guestName.trim()) {
      showToast('Please provide your name', 'error');
      return;
    }

    if (ratingInput < 1 || ratingInput > 5) {
      showToast('Please select a star rating (1 to 5)', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload: Record<string, any> = {
        rating: ratingInput,
        review: reviewInput.trim() || null,
      };

      if (!user) {
        payload.customer_name = guestName.trim();
        if (guestContact.trim()) {
          if (guestContact.includes('@')) {
            payload.customer_email = guestContact.trim();
          } else {
            payload.customer_phone = guestContact.trim();
          }
        }
      }

      const res = await fetch(`${getApiBaseUrl()}/products/${productId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit review');
      }

      showToast(json.message || 'Thank you! Your review has been submitted and is pending admin approval.', 'success');
      setShowForm(false);
      setGuestName('');
      setGuestContact('');
      setReviewInput('');
      fetchReviews();
    } catch (err: any) {
      showToast(err.message || 'Error submitting review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!token || !confirm('Are you sure you want to delete your review?')) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${getApiBaseUrl()}/products/${productId}/reviews`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete review');
      showToast('Review deleted successfully', 'info');
      setUserReview(null);
      setRatingInput(5);
      setReviewInput('');
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      showToast(err.message || 'Error deleting review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, max: number = 5, size: string = 'text-amber-400 text-sm') => {
    const stars = [];
    for (let i = 1; i <= max; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className={`${size} text-amber-400`}>★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className={`${size} text-amber-400`}>★</span>);
      } else {
        stars.push(<span key={i} className={`${size} text-slate-200`}>★</span>);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  return (
    <div className="space-y-8">
      {/* 1. Rating Summary Header Card */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Score */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 5.0</span>
            </div>
            <div className="my-2">
              {renderStars(averageRating, 5, 'text-amber-400 text-xl')}
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
            </p>

            {/* User status alert if pending approval */}
            {userReview && !userReview.is_approved && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1.5">
                <span>⏳ Your review is pending admin approval</span>
              </div>
            )}

            {/* Action button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleOpenForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-brand-orange hover:from-orange-600 hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {userReview ? '✎ Edit Your Review' : '+ Write a Review'}
              </button>
            </div>
          </div>

          {/* Right Breakdown Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const data = breakdown[star] || { count: 0, percentage: 0 };
              return (
                <div key={star} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="w-12 flex items-center gap-1">
                    {star} <span className="text-amber-400">★</span>
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-slate-400 font-mono text-[11px]">
                    {data.count} ({data.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Collapsible Review Form */}
        {showForm && (
          <div className="mt-8 pt-8 border-t border-slate-100 animate-fadeIn">
            <form onSubmit={handleSubmitReview} className="max-w-2xl bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  {userReview ? 'Edit Your Review' : 'Write a Product Review'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Guest Information Fields if not logged in */}
              {!user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email or Phone <span className="text-slate-400 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={guestContact}
                      onChange={(e) => setGuestContact(e.target.value)}
                      placeholder="e.g. 01700000000 or email"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Interactive Star Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || ratingInput) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`${star} Star`}
                      >
                        <span className={`text-3xl ${isFilled ? 'text-amber-400' : 'text-slate-200'}`}>
                          ★
                        </span>
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-black text-brand-orange bg-orange-100/70 px-2.5 py-1 rounded-lg">
                    {RATING_LABELS[hoverRating || ratingInput]}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Review Details <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  rows={3}
                  placeholder="Tell us about the fabric quality, comfort, sizing, and your overall experience..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-2">
                <span>ℹ️ Note: Submitted reviews will appear on the store after quick moderation by the admin.</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {userReview ? (
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    disabled={isSubmitting}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Delete this review
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : userReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 3. Single Unified Customer Reviews Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            Customer Reviews ({totalReviews})
          </h4>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-5 md:p-6 rounded-2xl border transition-all ${
                  rev.is_owner
                    ? 'bg-orange-50/40 border-orange-200/80 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={rev.user_name} image={rev.user_avatar} />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs md:text-sm font-black text-slate-900">
                          {rev.user_name}
                        </span>
                        {rev.is_owner && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-orange text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                            Your Review
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                          ✓ Verified Buyer
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {rev.created_at_human}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderStars(rev.rating, 5, 'text-amber-400 text-xs md:text-sm')}

                    {rev.is_owner && (
                      <button
                        type="button"
                        onClick={handleOpenForm}
                        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-brand-orange rounded-lg border border-slate-200 hover:border-brand-orange bg-white transition-all ml-2 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {rev.review && (
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed pl-0 md:pl-[52px] font-medium">
                    {rev.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
