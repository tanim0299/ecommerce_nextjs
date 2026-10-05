'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, X, Star, Zap, Check } from 'lucide-react';
import { useApp } from '../context';
import FacebookEmbedPlayer from './FacebookEmbedPlayer';

interface WatchBeforeBuyVideo {
  id: number;
  product_id: number;
  short_title: string;
  title: string;
  video_url?: string | null;
  video?: string | null;
  thumbnail?: string | null;
  platform?: string;
  sl_no?: number;
  product?: {
    id: number;
    name: string;
    slug?: string;
    sku?: string;
    sale_price: number;
    regular_price: number;
    discount_price?: number;
    image?: string | null;
  } | null;
}

interface QuickViewImage {
  url?: string;
  type?: string;
}

interface QuickViewAttribute {
  attribute_id: number;
  attribute_name: string;
  value_id: number;
  value_name: string;
}

interface QuickViewVariant {
  id: number;
  name?: string;
  sku?: string;
  sale_price?: number | string | null;
  regular_price?: number | string | null;
  discount_price?: number | string | null;
  image?: string | null;
  attributes?: QuickViewAttribute[];
  stock_qty?: number;
  stock_status?: string;
}

interface AttributeGroup {
  id: number;
  name: string;
  values: Array<{ id: number; name: string }>;
}

interface QuickViewProduct {
  id: number;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string | null;
  sale_price?: number | string | null;
  regular_price?: number | string | null;
  discount_price?: number | string | null;
  has_variant?: boolean;
  images?: QuickViewImage[];
  brand?: { name?: string } | null;
  category?: { name?: string } | null;
  sub_category?: { name?: string } | null;
  variants?: QuickViewVariant[];
  stock_qty?: number;
  stock_status?: string;
}

interface WatchBeforeBuyModalProps {
  video: WatchBeforeBuyVideo | null;
  onClose: () => void;
}

const numericPrice = (value?: number | string | null) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getYouTubeId = (url?: string | null) => {
  if (!url) return null;
  const str = url.trim();
  const shortsMatch = str.match(/shorts\/([a-zA-Z0-9_-]+)/i);
  if (shortsMatch) return shortsMatch[1];
  const watchMatch = str.match(/(?:v=|v\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];
  const generalMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]+)/i);
  return generalMatch ? generalMatch[1] : null;
};

const isFacebookUrl = (url?: string | null) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com');
};

const isDirectVideoFile = (url?: string | null) => {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.endsWith('.mov') || url.includes('/storage/');
};

const getEmbedPlayerUrl = (url?: string | null) => {
  if (!url) return '';
  let cleanUrl = url.trim();

  const iframeSrcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    cleanUrl = iframeSrcMatch[1];
  }

  const ytId = getYouTubeId(cleanUrl);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
  }

  if (isFacebookUrl(cleanUrl)) {
    if (cleanUrl.includes('facebook.com/plugins/video.php')) {
      let enhanced = cleanUrl;
      const sep = enhanced.includes('?') ? '&' : '?';
      if (!enhanced.includes('autoplay=')) enhanced += `${sep}autoplay=true`;
      if (!enhanced.includes('muted=') && !enhanced.includes('mute=')) enhanced += '&muted=true';
      return enhanced;
    }
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&autoplay=true&muted=true`;
  }

  if (cleanUrl.includes('tiktok.com')) {
    const videoIdMatch = cleanUrl.match(/\/video\/(\d+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
    }
  }

  return cleanUrl;
};

const getColorHex = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (lower.includes('blue') || lower.includes('navy')) return '#1e3a8a';
  if (lower.includes('red') || lower.includes('crimson') || lower.includes('maroon')) return '#991b1b';
  if (lower.includes('black')) return '#0f172a';
  if (lower.includes('white') || lower.includes('off white')) return '#f8fafc';
  if (lower.includes('green') || lower.includes('olive')) return '#166534';
  if (lower.includes('pink')) return '#ec4899';
  if (lower.includes('beige') || lower.includes('khaki')) return '#d4b996';
  if (lower.includes('yellow') || lower.includes('mustard')) return '#eab308';
  if (lower.includes('grey') || lower.includes('gray') || lower.includes('charcoal')) return '#64748b';
  if (lower.includes('brown')) return '#78350f';
  return '#475569';
};

export default function WatchBeforeBuyModal({ video, onClose }: WatchBeforeBuyModalProps) {
  const router = useRouter();
  const {
    cart,
    handleAddToCart,
    handleUpdateCartQty,
    resolveImageUrl,
  } = useApp();

  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);

  const productId = video?.product_id ?? null;

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);

    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const response = await fetch(`${cleanUrl}/products/${productId}`, { signal: controller.signal });
        if (response.ok) {
          const json = await response.json();
          if (json.status === 'success' && json.data) {
            const data = json.data as QuickViewProduct;
            setProduct(data);
            const firstVariant = data.variants?.[0];
            setSelectedVariantId(firstVariant?.id ?? null);
            setSelectedAttributes(Object.fromEntries(
              (firstVariant?.attributes ?? []).map(attr => [attr.attribute_id, attr.value_id])
            ));
            setQuantity(1);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to load product details for modal:', err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProductDetails();

    return () => {
      controller.abort();
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [productId, onClose]);

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const selectedVariant = useMemo(
    () => variants.find(variant => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    const groups = new Map<number, AttributeGroup>();
    variants.forEach(variant => variant.attributes?.forEach(attribute => {
      const group = groups.get(attribute.attribute_id) ?? {
        id: attribute.attribute_id,
        name: attribute.attribute_name,
        values: [],
      };
      if (!group.values.some(value => value.id === attribute.value_id)) {
        group.values.push({ id: attribute.value_id, name: attribute.value_name });
      }
      groups.set(attribute.attribute_id, group);
    }));
    return Array.from(groups.values());
  }, [variants]);

  if (!video) return null;

  const salePrice = numericPrice(selectedVariant?.sale_price ?? product?.sale_price)
    ?? numericPrice(selectedVariant?.discount_price ?? product?.discount_price)
    ?? numericPrice(selectedVariant?.regular_price ?? product?.regular_price)
    ?? (video.product?.sale_price || 0);

  const regularPrice = numericPrice(selectedVariant?.regular_price ?? product?.regular_price)
    ?? (video.product?.regular_price || salePrice);

  const hasDiscount = salePrice !== null && regularPrice !== null && regularPrice > salePrice;
  const savings = hasDiscount ? regularPrice - salePrice : 0;
  const discountPercent = hasDiscount ? Math.round((savings / regularPrice) * 100) : 0;

  const colorAttribute = selectedVariant?.attributes?.find(attr =>
    attr.attribute_name.toLowerCase().includes('color')
  );
  const sizeAttribute = selectedVariant?.attributes?.find(attr =>
    attr.attribute_name.toLowerCase().includes('size')
  );

  const cartItemId = product ? `${product.id}-${selectedVariant?.id ?? 'default'}` : `${video.product_id}-default`;
  const selectedCartItem = cart.find(item => item.id === cartItemId);
  const currentImage = selectedVariant?.image || (product?.images && product.images[0]?.url) || video.product?.image || '';

  // Calculate out of stock status exactly like details page
  const isOutOfStock = selectedVariant 
    ? (selectedVariant.stock_status === 'out_of_stock' || (typeof selectedVariant.stock_qty === 'number' && selectedVariant.stock_qty <= 0))
    : (product?.stock_status === 'out_of_stock' || (typeof product?.stock_qty === 'number' && product.stock_qty <= 0));

  const displayedQuantity = selectedCartItem?.quantity ?? quantity;

  const selectAttribute = (attributeId: number, valueId: number) => {
    const nextSelection = { ...selectedAttributes, [attributeId]: valueId };
    let matchingVariant = variants.find(variant =>
      Object.entries(nextSelection).every(([selectedAttrId, selectedValId]) =>
        variant.attributes?.some(attr =>
          attr.attribute_id === Number(selectedAttrId) && attr.value_id === selectedValId
        )
      )
    );

    if (!matchingVariant) {
      matchingVariant = variants.find(variant => variant.attributes?.some(attr =>
        attr.attribute_id === attributeId && attr.value_id === valueId
      ));
    }
    if (!matchingVariant) return;

    setSelectedVariantId(matchingVariant.id);
    setSelectedAttributes(Object.fromEntries(
      (matchingVariant.attributes ?? []).map(attr => [attr.attribute_id, attr.value_id])
    ));
    setQuantity(1);
  };

  const handleAddToCartClick = (e?: React.MouseEvent) => {
    if (salePrice === null || isOutOfStock || selectedCartItem) return;
    handleAddToCart({
      id: cartItemId,
      name: selectedVariant?.name
        ? `${product?.name || video.title || 'Product'} - ${selectedVariant.name}`
        : (product?.name || video.title || 'Product'),
      price: salePrice,
      size: sizeAttribute?.value_name || '',
      colorName: colorAttribute?.value_name || '',
      colorHex: colorAttribute ? getColorHex(colorAttribute.value_name) : '#111827',
      quantity,
      image: currentImage ? resolveImageUrl(currentImage) : '',
    }, e);
  };

  const handleBuyNowClick = (e?: React.MouseEvent) => {
    if (isOutOfStock || salePrice === null) return;
    if (!selectedCartItem) {
      handleAddToCartClick(e);
    }
    onClose();
    router.push('/checkout');
  };

  const ytId = getYouTubeId(video.video_url);
  const isFb = isFacebookUrl(video.video_url);
  const isDirectFile = (video.video && isDirectVideoFile(video.video)) || isDirectVideoFile(video.video_url);
  const fileSrc = video.video ? resolveImageUrl(video.video) : (isDirectVideoFile(video.video_url) ? resolveImageUrl(video.video_url!) : '');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: HD Vertical Reel Video Player */}
        <div className="w-full md:w-[48%] bg-black flex items-center justify-center relative overflow-hidden aspect-[9/14] md:aspect-auto md:min-h-[560px]">
          {ytId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&controls=1`}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isFb ? (
            <FacebookEmbedPlayer
              url={video.video_url || ''}
              autoplay={true}
              className="absolute inset-0"
            />
          ) : isDirectFile && fileSrc ? (
            <video
              src={fileSrc}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <iframe
              src={getEmbedPlayerUrl(video.video_url)}
              className="w-full h-full border-0 absolute inset-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          )}

          {/* Top Badge Overlay on Video */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="bg-brand-orange text-white font-extrabold text-[10px] px-3 py-1 rounded-md shadow-md uppercase tracking-wider">
              {video.short_title || "Watch before buy"}
            </span>
          </div>
        </div>

        {/* Right Column: Instant Purchase & Product Details Drawer */}
        <div className="w-full md:w-[52%] bg-white p-5 sm:p-6 md:p-7 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[88vh]">
          <div className="flex flex-col gap-3.5">
            {/* Top Bar: Breadcrumb + Close Button */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[80%] uppercase tracking-wider">
                Home {product?.category?.name ? ` / ${product.category.name}` : ''} {product?.sub_category?.name ? ` / ${product.sub_category.name}` : ''}
              </span>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Title */}
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                {product?.name || video.product?.name || video.title || video.short_title}
              </h2>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-500">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-700 ml-1">0.0 (0 Reviews)</span>
                </div>
                <span className="text-slate-300">|</span>
                
                {/* Dynamic Real Stock Status Badge */}
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10.5px] border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10.5px] border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    In Stock
                  </span>
                )}

                {product?.sku && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-[11px] text-slate-400">SKU: {product.sku}</span>
                  </>
                )}
              </div>
            </div>

            {/* Pricing Area */}
            <div className="flex items-baseline gap-2.5 py-1">
              <span className="text-2xl sm:text-3xl font-black text-brand-orange tracking-tight">
                ৳{salePrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-slate-400 line-through font-semibold">
                    ৳{regularPrice}
                  </span>
                  <span className="bg-orange-50 text-brand-orange font-black text-xs px-2.5 py-0.5 rounded-md border border-orange-200">
                    Save ৳{savings} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>

            <hr className="border-slate-100 my-0.5" />

            {/* Attribute Selectors (Color & Size) */}
            {attributeGroups.map(group => {
              const isColor = group.name.toLowerCase().includes('color');
              const selectedValueId = selectedAttributes[group.id];

              return (
                <div key={group.id} className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Select {group.name}: <span className="text-brand-orange">*</span>
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {group.values.map(val => {
                      const isSelected = selectedValueId === val.id;
                      if (isColor) {
                        const hex = getColorHex(val.name);
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => selectAttribute(group.id, val.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'border-brand-orange bg-orange-50/80 text-brand-orange shadow-xs ring-1 ring-brand-orange/30'
                                : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span>{val.name}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => selectAttribute(group.id, val.id)}
                          className={`min-w-[42px] px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-orange bg-brand-orange text-white shadow-xs'
                              : 'border-slate-200 hover:border-slate-900 text-slate-800 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {val.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quantity Selector */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-xs font-bold text-slate-800">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-full w-28 h-9 bg-slate-50/60 p-1">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (selectedCartItem) {
                      handleUpdateCartQty(selectedCartItem.id, Math.max(1, selectedCartItem.quantity - 1));
                    } else {
                      setQuantity(Math.max(1, quantity - 1));
                    }
                  }}
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="flex-1 text-center font-bold text-xs text-slate-900">
                  {displayedQuantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (selectedCartItem) {
                      handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity + 1);
                    } else {
                      setQuantity(quantity + 1);
                    }
                  }}
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={Boolean(selectedCartItem) || salePrice === null || isOutOfStock}
              className={`flex-1 font-black text-xs sm:text-sm py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  : selectedCartItem
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                  : 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white cursor-pointer active:scale-95 shadow-sm'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isOutOfStock
                  ? 'Out of Stock'
                  : selectedCartItem
                  ? 'In Shopping Bag'
                  : 'Add to Cart'}
              </span>
            </button>

            {!isOutOfStock && !selectedCartItem && salePrice !== null && (
              <button
                type="button"
                onClick={handleBuyNowClick}
                className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-black text-xs sm:text-sm py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(249,115,22,0.35)] hover:scale-102 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
