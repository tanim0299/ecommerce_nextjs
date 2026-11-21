'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Flame,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  ArrowRight,
  Eye,
  Heart,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp, getProductUrl } from '../../context';
import ProductQuickView from '../../components/ProductQuickView';

interface OfferProduct {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  regular_price: number | string;
  sale_price: number | string;
  discount_price: number | string;
  offer_price: number;
  offer_discount: number;
  offer_badge: string;
  original_price: number;
  stock_status?: string;
  has_variant?: boolean;
  images?: Array<{ url: string; type?: string }>;
  brand?: { name?: string; logo?: string } | null;
  category?: { name?: string; slug?: string } | null;
  variants?: any[];
}

interface OfferData {
  id: number;
  title: string;
  slug: string;
  banner?: string | null;
  mobile_banner?: string | null;
  discount_type: string;
  discount_value: number;
  badge_text?: string | null;
  discount_badge: string;
  start_date: string;
  end_date: string;
  start_date_formatted: string;
  end_date_formatted: string;
  is_live: boolean;
  is_upcoming: boolean;
  is_expired: boolean;
  status_key: string;
  status_label: string;
  description?: string | null;
  products_count: number;
  products?: OfferProduct[];
}

interface OfferCampaignClientProps {
  slug: string;
  initialOffer: OfferData | null;
}

export default function OfferCampaignClient({
  slug,
  initialOffer,
}: OfferCampaignClientProps) {
  const router = useRouter();
  const [offer, setOffer] = useState<OfferData | null>(initialOffer);
  const [loading, setLoading] = useState(!initialOffer);
  const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);

  const {
    likedProducts,
    handleToggleWishlist,
    handleAddToCart,
    resolveImageUrl,
    showToast,
  } = useApp();

  // Fetch campaign if not initially provided
  useEffect(() => {
    if (!initialOffer) {
      const fetchOffer = async () => {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
          const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
          const res = await fetch(`${cleanUrl}/offers/${encodeURIComponent(slug)}`);
          if (res.ok) {
            const json = await res.json();
            const data = json.data || json.result;
            if (data) {
              setOffer(data);
            }
          }
        } catch (err) {
          console.error('Failed to load offer:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOffer();
    }
  }, [slug, initialOffer]);

  // Persist active offer in sessionStorage so checkout can link offer_id
  useEffect(() => {
    if (offer && offer.is_live && typeof window !== 'undefined') {
      sessionStorage.setItem('active_offer_id', String(offer.id));
      sessionStorage.setItem('active_offer_title', offer.title);
    }
  }, [offer]);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    if (!offer?.end_date) return;

    const targetTime = new Date(offer.end_date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [offer?.end_date]);

  const handleCampaignAddToCart = (product: OfferProduct, e?: React.MouseEvent) => {
    if (product.stock_status === 'out_of_stock') {
      showToast('This item is currently out of stock.', 'error');
      return;
    }

    const hasVariants = Boolean(product.has_variant || (product.variants?.length ?? 0) > 0);
    if (hasVariants) {
      router.push(getProductUrl(product));
      return;
    }

    const primaryImg = product.images?.[0]?.url ? resolveImageUrl(product.images[0].url) : '';
    const offerPrice = product.offer_price || Number(product.sale_price) || 0;

    // Add item to cart with offer price and offer_id
    handleAddToCart({
      id: `${product.id}-default`,
      name: product.name,
      price: offerPrice,
      size: 'Standard',
      colorName: 'Default',
      colorHex: '#000000',
      quantity: 1,
      image: primaryImg,
      offer_id: offer?.id,
    } as any, e);

    if (typeof window !== 'undefined' && offer?.id) {
      sessionStorage.setItem('active_offer_id', String(offer.id));
    }

    showToast(`Added to basket with ${product.offer_badge || 'Offer Discount'}!`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 py-20 px-4">
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
          <div className="w-14 h-14 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">
          Loading Offer Campaign...
        </p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
          <Tag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Campaign Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          This promotional campaign may have ended or is no longer available. Explore our fresh collection in the store.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-orange transition-colors"
        >
          Explore All Sneakers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const products = offer.products || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Offers</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
            {{ ...offer }.title}
          </span>
        </nav>
      </div>

      {/* Campaign Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-950 text-white min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-12">
          {/* Background Image / Gradient */}
          {offer.banner ? (
            <>
              <picture className="absolute inset-0 w-full h-full">
                {offer.mobile_banner && (
                  <source media="(max-width: 640px)" srcSet={resolveImageUrl(offer.mobile_banner)} />
                )}
                <img
                  src={resolveImageUrl(offer.banner)}
                  alt={offer.title}
                  className="w-full h-full object-cover object-center opacity-60"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/60">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}

          {/* Foreground Campaign Info */}
          <div className="relative z-10 max-w-3xl flex flex-col items-start gap-4">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {offer.badge_text || offer.discount_badge}
              </span>
              {offer.is_live && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Campaign
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {offer.title}
            </h1>

            {/* Description */}
            {offer.description && (
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
                {offer.description}
              </p>
            )}

            {/* Countdown Timer Block */}
            <div className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 mt-2 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>{timeLeft.isEnded ? 'Campaign Ended' : 'Hurry! Offer Ends In:'}</span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Ends: {offer.end_date_formatted}
                </span>
              </div>

              {!timeLeft.isEnded ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-white/10 rounded-xl w-14 sm:w-16 py-2">
                    <span className="text-lg sm:text-2xl font-black text-white tabular-nums">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Days</span>
                  </div>
                  <span className="text-xl font-bold text-amber-500">:</span>
                  <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-white/10 rounded-xl w-14 sm:w-16 py-2">
                    <span className="text-lg sm:text-2xl font-black text-white tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hours</span>
                  </div>
                  <span className="text-xl font-bold text-amber-500">:</span>
                  <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-white/10 rounded-xl w-14 sm:w-16 py-2">
                    <span className="text-lg sm:text-2xl font-black text-white tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mins</span>
                  </div>
                  <span className="text-xl font-bold text-amber-500">:</span>
                  <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-white/10 rounded-xl w-14 sm:w-16 py-2">
                    <span className="text-lg sm:text-2xl font-black text-amber-400 tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Secs</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-bold text-rose-400">
                  This offer campaign has expired. Products will be sold at standard rates.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-900 tracking-wider">{offer.discount_badge}</div>
              <div className="text-[11px] text-slate-500">Auto applied at order</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-900 tracking-wider">Cash on Delivery</div>
              <div className="text-[11px] text-slate-500">All across Bangladesh</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-900 tracking-wider">1:1 Master Quality</div>
              <div className="text-[11px] text-slate-500">100% verified materials</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-slate-900 tracking-wider">Easy Exchange</div>
              <div className="text-[11px] text-slate-500">Hassle-free size swaps</div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Products Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Campaign Products
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-500/25">
                {products.length} Items on Sale
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Prices shown below already include the campaign discount. Click to view sizes and add to basket.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Tag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Products Currently Assigned</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back shortly or browse our current catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((prod) => {
              const isLiked = likedProducts.includes(prod.id.toString());
              const imageUrls = (prod.images ?? [])
                .map((img) => img.url)
                .filter((url): url is string => Boolean(url));
              const [primaryImage, hoverImage] = imageUrls;
              const hasVariants = Boolean(prod.has_variant || (prod.variants?.length ?? 0) > 0);
              const originalPrice = prod.original_price || Number(prod.sale_price) || 0;
              const offerPrice = prod.offer_price || originalPrice;
              const saveAmount = prod.offer_discount || Math.max(0, originalPrice - offerPrice);

              return (
                <div
                  key={prod.id}
                  className="w-full bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-amber-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleToggleWishlist(prod.id.toString());
                    }}
                    className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-25 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                        isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600 hover:text-rose-500'
                      }`}
                    />
                  </button>

                  {/* Quick View Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setQuickViewProductId(prod.id);
                    }}
                    className="absolute right-10.5 top-2.5 sm:right-12 sm:top-3.5 z-30 flex h-7 w-7 sm:h-8 sm:w-auto items-center justify-center gap-1.5 rounded-full bg-slate-950/85 sm:px-2.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-brand-orange md:opacity-0 md:group-hover:opacity-100"
                    title="Quick Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Quick View</span>
                  </button>

                  {/* Product Card Image Link */}
                  <Link href={getProductUrl(prod)} className="flex flex-col flex-1">
                    <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                      {/* Discount Badges Top-Left */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-20 flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-sm">
                          {prod.offer_badge || 'OFFER DEAL'}
                        </span>
                        {saveAmount > 0 && (
                          <span className="px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold bg-amber-500 text-slate-950 rounded shadow-xs">
                            SAVE ৳{Math.round(saveAmount).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {prod.stock_status === 'out_of_stock' && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30 pointer-events-none">
                          <span className="px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white rounded-xl shadow-lg border border-rose-400">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {primaryImage ? (
                        <img
                          src={resolveImageUrl(primaryImage)}
                          alt={prod.name}
                          className={`w-full h-full object-contain p-2.5 sm:p-3 transition-all duration-500 group-hover:scale-[1.04] ${
                            hoverImage ? 'group-hover:opacity-0' : ''
                          } ${prod.stock_status === 'out_of_stock' ? 'opacity-50' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                          No Image
                        </div>
                      )}

                      {hoverImage && (
                        <img
                          src={resolveImageUrl(hoverImage)}
                          alt={`${prod.name} alternate view`}
                          className={`absolute inset-0 w-full h-full object-contain p-2.5 sm:p-3 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.04] ${
                            prod.stock_status === 'out_of_stock' ? 'opacity-50' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* Product Details Bottom */}
                    <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-white">
                      <div>
                        {prod.brand?.name && (
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                            {prod.brand.name}
                          </div>
                        )}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-orange transition-colors duration-200 line-clamp-1">
                          {prod.name}
                        </h3>
                      </div>

                      {/* Pricing Block */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-baseline justify-between gap-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-rose-600 tabular-nums">
                            ৳{Math.round(offerPrice).toLocaleString()}
                          </span>
                          {originalPrice > offerPrice && (
                            <span className="text-[11px] sm:text-xs text-slate-400 line-through tabular-nums">
                              ৳{Math.round(originalPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Offer
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Action Button */}
                  <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0 bg-white">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCampaignAddToCart(prod, e);
                      }}
                      disabled={prod.stock_status === 'out_of_stock'}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all duration-300 cursor-pointer ${
                        prod.stock_status === 'out_of_stock'
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-950 text-white hover:bg-brand-orange hover:shadow-md active:scale-[0.98]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{prod.stock_status === 'out_of_stock' ? 'Sold Out' : hasVariants ? 'Select Options' : 'Add to Basket'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      {quickViewProductId && (
        <ProductQuickView
          productId={quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
        />
      )}
    </div>
  );
}
