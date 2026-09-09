'use client';

import { getProductUrl, getCategoryUrl, getSubCategoryUrl } from '../../utils/slug';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Share2,
  Copy,
  Zap,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Flame,
  Play,
  Video as VideoIcon,
} from 'lucide-react';
import { useApp } from '../../context';
import { apiFetch } from '../../utils/api';
import SafeHtml from '../../components/SafeHtml';
import ProductReviews from '../../components/ProductReviews';
import ProductComments from '../../components/ProductComments';
import ProductQuickView from '../../components/ProductQuickView';

type PriceValue = number | string | null;

interface Relation {
  id: number;
  name: string;
}

interface Brand extends Relation {
  logo?: string | null;
}

interface ProductImage {
  url?: string;
  type?: string;
  sl_no?: number;
  variant_id?: number;
  variant_name?: string;
}

interface ProductVideo {
  id: number;
  short_title?: string;
  title?: string;
  video_url?: string | null;
  video?: string | null;
  platform?: string;
  sl_no?: number;
}

interface Specification {
  key?: string;
  title?: string;
  value?: string;
}

interface VariantAttribute {
  attribute_id: number;
  attribute_name: string;
  value_id: number;
  value_name: string;
}

interface ProductVariant {
  id: number;
  sku?: string;
  name?: string;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  image?: string | null;
  sort_order?: number;
  attributes?: VariantAttribute[];
  stock_qty?: number;
  stock_status?: string;
}

interface ProductDetail {
  id: number;
  sku?: string;
  name?: string;
  description?: string | null;
  specification?: Specification[] | null;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  has_variant?: boolean;
  has_warranty?: boolean;
  is_active?: boolean;
  images?: ProductImage[];
  videos?: ProductVideo[];
  item?: Relation | null;
  category?: Relation | null;
  sub_category?: Relation | null;
  brand?: Brand | null;
  unit?: Relation | null;
  warranty?: string | null;
  variants?: ProductVariant[];
  stock_qty?: number;
  stock_status?: string;
}

interface AttributeGroup {
  id: number;
  name: string;
  values: Array<{ id: number; name: string }>;
}

const numericPrice = (value?: PriceValue) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (value: number) => new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 0,
}).format(value);

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

const getYouTubeThumb = (url?: string | null) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const getEmbedPlayerUrl = (url?: string | null) => {
  if (!url) return '';
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
  }
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  }
  return url;
};

const getColorHex = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (lower.includes('blue') || lower.includes('navy') || lower.includes('ocean')) return '#2563eb';
  if (lower.includes('red') || lower.includes('crimson') || lower.includes('ruby')) return '#dc2626';
  if (lower.includes('black') || lower.includes('midnight') || lower.includes('space') || lower.includes('dark')) return '#0f172a';
  if (lower.includes('white') || lower.includes('starlight')) return '#f1f5f9';
  if (lower.includes('orange') || lower.includes('amber') || lower.includes('desert')) return '#ea580c';
  if (lower.includes('green') || lower.includes('olive') || lower.includes('emerald')) return '#16a34a';
  if (lower.includes('purple') || lower.includes('violet')) return '#7c3aed';
  if (lower.includes('pink') || lower.includes('rose')) return '#db2777';
  if (lower.includes('gold') || lower.includes('yellow')) return '#eab308';
  if (lower.includes('silver') || lower.includes('grey') || lower.includes('gray') || lower.includes('titanium')) return '#94a3b8';
  return '#475569';
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const {
    cart,
    handleAddToCart,
    handleQuickAddToCart,
    handleUpdateCartQty,
    likedProducts,
    handleToggleWishlist,
    setIsCartOpen,
    resolveImageUrl,
  } = useApp();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'video' | 'image'>('image');
  const [selectedVideo, setSelectedVideo] = useState<ProductVideo | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'comments'>('description');
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isCopiedSku, setIsCopiedSku] = useState(false);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainBuyBtnRef = useRef<HTMLButtonElement | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      thumbnailContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleThumbnailWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (thumbnailContainerRef.current && e.deltaY !== 0) {
      e.preventDefault();
      thumbnailContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (mainBuyBtnRef.current) {
        const rect = mainBuyBtnRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');
      setProduct(null);

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const response = await apiFetch(`products/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Product not found.' : 'Unable to load this product.');
        }

        const json = await response.json();
        if (json.status !== 'success' || !json.data) {
          throw new Error('Invalid product response.');
        }

        const data = json.data as ProductDetail;
        const sortedVariants = [...(data.variants ?? [])]
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const normalizedProduct = { ...data, variants: sortedVariants };
        const firstVariant = sortedVariants[0];
        const firstImage = data.images?.find(image => image.type?.toLocaleLowerCase() === 'main' && image.url)?.url
          || data.images?.find(image => image.type?.toLocaleLowerCase() === 'gallery' && image.url)?.url
          || data.images?.find(image => image.url)?.url
          || firstVariant?.image
          || '';

        const specList = (data.specification ?? []).filter(s => (s.key || s.title) && s.value);
        if (data.description) {
          setActiveTab('description');
        } else if (specList.length > 0) {
          setActiveTab('specifications');
        } else {
          setActiveTab('reviews');
        }

        setProduct(normalizedProduct);
        setSelectedImage(firstImage);

        // Check if product has videos -> prioritize video first!
        if (data.videos && data.videos.length > 0) {
          setSelectedMediaType('video');
          setSelectedVideo(data.videos[0]);
        } else {
          setSelectedMediaType('image');
          setSelectedVideo(null);
        }

        setSelectedVariantId(firstVariant?.id ?? null);
        setSelectedAttributes(Object.fromEntries(
          (firstVariant?.attributes ?? []).map(attribute => [attribute.attribute_id, attribute.value_id])
        ));
        setQuantity(1);

        // Fetch related products
        try {
          const allRes = await fetch(`${cleanUrl}/products`);
          if (allRes.ok) {
            const allJson = await allRes.json();
            if (allJson.status === 'success' && Array.isArray(allJson.data)) {
              const others = allJson.data.filter((p: any) => p.id !== data.id);
              const related = others.filter((p: any) => 
                (data.sub_category?.id && p.sub_category?.id === data.sub_category.id) ||
                (data.category?.id && p.category?.id === data.category.id)
              );
              setRelatedProducts(related.length > 0 ? related.slice(0, 4) : others.slice(0, 4));
            }
          }
        } catch (e) {
          console.error('Failed to fetch related products:', e);
        }
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load this product.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  const variants = useMemo(() => product?.variants ?? [], [product]);

  const selectedVariant = useMemo(
    () => variants.find(variant => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    const groups = new Map<number, AttributeGroup>();

    variants.forEach(variant => {
      (variant.attributes ?? []).forEach(attribute => {
        const group = groups.get(attribute.attribute_id) ?? {
          id: attribute.attribute_id,
          name: attribute.attribute_name,
          values: [],
        };

        if (!group.values.some(value => value.id === attribute.value_id)) {
          group.values.push({ id: attribute.value_id, name: attribute.value_name });
        }
        groups.set(attribute.attribute_id, group);
      });
    });

    return Array.from(groups.values());
  }, [variants]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const images = (product.images ?? [])
      .filter(image => {
        if (!image.url) return false;
        if (image.variant_id) return false;
        if (image.type?.toLocaleLowerCase() === 'variant') return false;
        return true;
      })
      .map(image => ({
        url: image.url,
        label: product.name || 'Gallery image',
      }));

    const seen = new Set<string>();
    return images.filter((image): image is { url: string; label: string } => {
      if (!image.url || seen.has(image.url)) return false;
      seen.add(image.url);
      return true;
    });
  }, [product]);

  const salePrice = numericPrice(selectedVariant?.sale_price ?? product?.sale_price);
  const fallbackDiscountPrice = numericPrice(selectedVariant?.discount_price ?? product?.discount_price);
  const regularPrice = numericPrice(selectedVariant?.regular_price ?? product?.regular_price);
  const displayedPrice = salePrice ?? fallbackDiscountPrice ?? regularPrice;
  const hasDiscount = displayedPrice !== null && regularPrice !== null && regularPrice > displayedPrice;
  const savingAmount = hasDiscount ? regularPrice - displayedPrice : null;
  const discountPercentage = hasDiscount && regularPrice ? Math.round(((regularPrice - displayedPrice) / regularPrice) * 100) : null;

  const colorAttribute = selectedVariant?.attributes?.find(attribute =>
    attribute.attribute_name.toLocaleLowerCase().includes('color')
  );
  const sizeAttribute = selectedVariant?.attributes?.find(attribute =>
    attribute.attribute_name.toLocaleLowerCase().includes('size')
  );
  const cartItemId = product
    ? `${product.id}-${selectedVariant?.id ?? 'default'}`
    : '';
  const selectedCartItem = cart.find(item => item.id === cartItemId);
  
  const isOutOfStock = selectedVariant 
    ? selectedVariant.stock_status === 'out_of_stock' 
    : product?.stock_status === 'out_of_stock';
  const displayedQuantity = selectedCartItem?.quantity ?? quantity;

  const selectAttribute = (attributeId: number, valueId: number) => {
    const nextSelection = { ...selectedAttributes, [attributeId]: valueId };
    let matchingVariant = variants.find(variant =>
      Object.entries(nextSelection).every(([selectedAttributeId, selectedValueId]) =>
        variant.attributes?.some(attribute =>
          attribute.attribute_id === Number(selectedAttributeId)
          && attribute.value_id === selectedValueId
        )
      )
    );

    if (!matchingVariant) {
      matchingVariant = variants.find(variant =>
        variant.attributes?.some(attribute =>
          attribute.attribute_id === attributeId && attribute.value_id === valueId
        )
      );
    }

    if (!matchingVariant) return;

    setSelectedVariantId(matchingVariant.id);
    setSelectedAttributes(Object.fromEntries(
      (matchingVariant.attributes ?? []).map(attribute => [attribute.attribute_id, attribute.value_id])
    ));
    if (matchingVariant.image) {
      setSelectedImage(matchingVariant.image);
      setSelectedMediaType('image');
    }
    setQuantity(1);
  };

  const handleAdd = (e?: React.MouseEvent) => {
    if (!product || selectedCartItem || displayedPrice === null || isOutOfStock) return;

    handleAddToCart({
      id: cartItemId,
      name: selectedVariant?.name
        ? `${product.name || 'Product'} - ${selectedVariant.name}`
        : (product.name || 'Product'),
      price: displayedPrice,
      size: sizeAttribute?.value_name || '',
      colorName: colorAttribute?.value_name || '',
      colorHex: '#111827',
      quantity,
      image: selectedImage ? resolveImageUrl(selectedImage) : '',
    }, e);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (!product || displayedPrice === null || isOutOfStock) return;
    if (!selectedCartItem) {
      handleAddToCart({
        id: cartItemId,
        name: selectedVariant?.name
          ? `${product.name || 'Product'} - ${selectedVariant.name}`
          : (product.name || 'Product'),
        price: displayedPrice,
        size: sizeAttribute?.value_name || '',
        colorName: colorAttribute?.value_name || '',
        colorHex: '#111827',
        quantity,
        image: selectedImage ? resolveImageUrl(selectedImage) : '',
      }, e);
    }
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handleCopySku = () => {
    const sku = selectedVariant?.sku || product?.sku;
    if (sku) {
      navigator.clipboard.writeText(sku);
      setIsCopiedSku(true);
      setTimeout(() => setIsCopiedSku(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopiedUrl(true);
      setTimeout(() => setIsCopiedUrl(false), 2000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const specifications = useMemo(() => (product?.specification ?? []).filter(specification =>
    (specification.key || specification.title) && specification.value
  ), [product?.specification]);

  const availableTabs = useMemo(() => {
    const list: Array<{ id: 'description' | 'specifications' | 'reviews' | 'comments'; label: string; count?: number }> = [];
    if (product?.description) {
      list.push({ id: 'description', label: 'Description' });
    }
    if (specifications.length > 0) {
      list.push({ id: 'specifications', label: 'Specifications', count: specifications.length });
    }
    list.push({ id: 'reviews', label: 'Reviews', count: reviewCount });
    list.push({ id: 'comments', label: 'Comments', count: commentCount });
    return list;
  }, [product?.description, specifications.length, reviewCount, commentCount]);

  const currentTab = useMemo(() => {
    if (availableTabs.some(tab => tab.id === activeTab)) {
      return activeTab;
    }
    return availableTabs[0]?.id || 'description';
  }, [activeTab, availableTabs]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 py-4">
        <div className="grid min-h-[460px] grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="aspect-square w-full shimmer-effect-light rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-16 h-16 shimmer-effect-light rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-4 py-1">
            <div className="h-5 w-28 shimmer-effect-light rounded-full" />
            <div className="h-8 w-3/4 shimmer-effect-light rounded-xl" />
            <div className="h-6 w-36 shimmer-effect-light rounded-lg" />
            <div className="h-20 w-full shimmer-effect-light rounded-xl" />
            <div className="h-10 w-full shimmer-effect-light rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Product Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">{error || 'The requested product is currently unavailable or has been relocated.'}</p>
        <Link
          href="/"
          className="rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand-orange hover:shadow-orange-500/20"
        >
          Explore All Apparel
        </Link>
      </div>
    );
  }

  const isLiked = likedProducts.includes(product.id.toString());
  const currentImage = selectedImage || product.images?.[0]?.url || selectedVariant?.image || '';

  return (
    <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 py-3 flex flex-col gap-6 animate-slide-up">
      {/* Top Breadcrumb & Share Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-brand-orange transition-colors">
            <ArrowLeft className="w-3 h-3" />
            <span>HOME</span>
          </Link>
          {product.category?.name && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <Link href={getCategoryUrl(product.category, product.item)} className="hover:text-brand-orange transition-colors">
                {product.category.name.toUpperCase()}
              </Link>
            </>
          )}
          {product.sub_category?.name && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <Link href={getSubCategoryUrl(product.sub_category, product.category)} className="hover:text-brand-orange transition-colors">
                {product.sub_category.name.toUpperCase()}
              </Link>
            </>
          )}
          {product.name && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="font-extrabold text-slate-900 truncate max-w-[180px] sm:max-w-xs">{product.name.toUpperCase()}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-[11px] font-bold transition-all shadow-xs"
          title="Share product link"
        >
          <Share2 className="w-3 h-3 text-slate-500" />
          <span className="hidden sm:inline">{isCopiedUrl ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column: Media Showcase (Video or Image) */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div
            className={`relative flex aspect-square max-h-[440px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-slate-100/40 p-2 sm:p-3 backdrop-blur-sm shadow-xs select-none ${
              selectedMediaType === 'image' ? 'group cursor-crosshair' : 'bg-black'
            }`}
            onMouseEnter={() => { if (selectedMediaType === 'image') setIsZoomed(true); }}
            onMouseLeave={() => { if (selectedMediaType === 'image') setIsZoomed(false); }}
            onMouseMove={selectedMediaType === 'image' ? handleMouseMove : undefined}
          >
            {/* Top Badges (Compact Single Row) */}
            <div className="absolute top-2.5 left-2.5 z-20 flex flex-row items-center gap-1.5 pointer-events-none max-w-[calc(100%-60px)] flex-wrap">
              {discountPercentage !== null && discountPercentage > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[8.5px] font-black uppercase tracking-wider rounded-md shadow-xs shrink-0">
                  <Flame className="w-2.5 h-2.5 fill-white" />
                  {discountPercentage}% OFF
                </span>
              )}
              {isOutOfStock ? (
                <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-xs text-white text-[8.5px] font-bold uppercase tracking-wider rounded-md shrink-0">
                  Out of Stock
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-500/95 backdrop-blur-xs text-white text-[8.5px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                  In Stock
                </span>
              )}
              {selectedMediaType === 'video' && selectedVideo && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-orange text-white text-[8.5px] font-black uppercase tracking-wider rounded-md shadow-xs shrink-0 truncate max-w-[150px]">
                  <Play className="w-2 h-2 fill-current shrink-0" />
                  <span className="truncate">{selectedVideo.short_title || 'Video Reel'}</span>
                </span>
              )}
            </div>

            {/* Top Right Wishlist Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWishlist(product.id.toString());
              }}
              className="absolute top-3 right-3 z-20 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xs hover:scale-105 active:scale-95 transition-all text-slate-700 hover:text-rose-500 cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
            </button>

            {/* Media Content: Video Player or Zoomable Image */}
            {selectedMediaType === 'video' && selectedVideo ? (
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black rounded-xl">
                {selectedVideo.video && (selectedVideo.video.endsWith('.mp4') || selectedVideo.video.endsWith('.webm') || selectedVideo.video.includes('/storage/')) ? (
                  <video
                    src={resolveImageUrl(selectedVideo.video)}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : selectedVideo.video_url?.includes('youtube') || selectedVideo.video_url?.includes('youtu.be') ? (
                  <iframe
                    src={getEmbedPlayerUrl(selectedVideo.video_url)}
                    className="w-full h-full border-0 absolute inset-0 rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedVideo.video ? (
                  <video
                    src={resolveImageUrl(selectedVideo.video)}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={getEmbedPlayerUrl(selectedVideo.video_url)}
                    className="w-full h-full border-0 absolute inset-0 rounded-xl"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                )}
              </div>
            ) : currentImage ? (
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                <img
                  id="product-main-view-image"
                  src={resolveImageUrl(currentImage)}
                  alt={product.name || 'Product'}
                  className={`h-full w-full object-contain transition-transform duration-300 ease-out will-change-transform ${
                    isZoomed ? 'scale-[1.7]' : 'scale-100'
                  }`}
                  style={
                    isZoomed
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }
                      : undefined
                  }
                />
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400">No image available</span>
            )}
          </div>

          {/* Gallery & Video Thumbnails Carousel with Controls */}
          {((product.videos && product.videos.length > 0) || galleryImages.length > 1) && (
            <div className="relative group/thumbs w-full mt-1">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollThumbnails('left')}
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-brand-orange hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Scrollable Thumbnails Container */}
              <div
                ref={thumbnailContainerRef}
                onWheel={handleThumbnailWheel}
                className="flex gap-2 overflow-x-auto py-1 px-1 scroll-smooth no-scrollbar select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* 1. Video Thumbnail (if product has videos) */}
                {product.videos && product.videos.map((vid, vIdx) => {
                  const isCurrent = selectedMediaType === 'video' && selectedVideo?.id === vid.id;
                  const thumb = getYouTubeThumb(vid.video_url) || currentImage || '';
                  return (
                    <button
                      key={`vid-${vid.id || vIdx}`}
                      type="button"
                      onClick={() => {
                        setSelectedMediaType('video');
                        setSelectedVideo(vid);
                      }}
                      className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-950 transition-all p-0.5 cursor-pointer group/vid-thumb ${
                        isCurrent
                          ? 'border-brand-orange ring-2 ring-brand-orange/30 shadow-xs scale-105'
                          : 'border-slate-200/80 hover:border-brand-orange/60 opacity-85 hover:opacity-100'
                      }`}
                      title={vid.short_title || 'Watch Video'}
                    >
                      {thumb && (
                        <img
                          src={resolveImageUrl(thumb)}
                          alt="Video thumbnail"
                          className="h-full w-full object-cover rounded-lg opacity-60 group-hover/vid-thumb:opacity-85 transition-opacity pointer-events-none"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-md">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                        <span className="text-[7.5px] font-black uppercase tracking-wider text-white bg-black/70 px-1 rounded">
                          Video
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* 2. Gallery Image Thumbnails */}
                {galleryImages.map((image, index) => {
                  const isCurrent = selectedMediaType === 'image' && currentImage === image.url;
                  return (
                    <button
                      key={image.url || index}
                      type="button"
                      onClick={() => {
                        setSelectedMediaType('image');
                        setSelectedImage(image.url);
                      }}
                      className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-all p-1 cursor-pointer ${
                        isCurrent
                          ? 'border-brand-orange ring-2 ring-brand-orange/20 shadow-xs scale-105'
                          : 'border-slate-200/80 hover:border-slate-400 opacity-75 hover:opacity-100'
                      }`}
                      title={image.label}
                    >
                      <img
                        src={resolveImageUrl(image.url)}
                        alt={image.label}
                        className="h-full w-full object-contain rounded-lg pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollThumbnails('right')}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-brand-orange hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Product Info, Options & Purchase Actions */}
        <div className="flex flex-col gap-3.5 lg:col-span-7">
          {/* Header Metadata */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {product.brand?.name && (
                <span className="rounded-md border border-brand-orange/30 bg-orange-50/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  {product.brand.name}
                </span>
              )}
              {product.unit?.name && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Per {product.unit.name}
                </span>
              )}
            </div>

            {/* Title */}
            {product.name && (
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 leading-snug mt-0.5">
                {product.name}
              </h1>
            )}

            {/* SKU with Copy Option */}
            {(selectedVariant?.sku || product.sku) && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <span>SKU: {selectedVariant?.sku || product.sku}</span>
                <button
                  type="button"
                  onClick={handleCopySku}
                  className="p-0.5 text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                  title="Copy SKU"
                >
                  {isCopiedSku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>

          {/* Pricing Luxury Container */}
          {displayedPrice !== null && (
            <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white px-4 py-2.5 flex flex-col gap-1 shadow-2xs">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  BDT {formatPrice(displayedPrice)}
                </span>
                {hasDiscount && regularPrice !== null && (
                  <span className="text-sm font-bold text-slate-400 line-through">
                    BDT {formatPrice(regularPrice)}
                  </span>
                )}
                {savingAmount !== null && (
                  <span className="rounded-md bg-rose-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    Save BDT {formatPrice(savingAmount)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Attribute & Variant Selectors */}
          <div className="flex flex-col gap-3">
            {attributeGroups.map(group => {
              const isColorGroup = group.name.toLowerCase().includes('color');
              const selectedValueName = group.values.find(value => value.id === selectedAttributes[group.id])?.name;

              return (
                <div key={group.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      {group.name}:{' '}
                      <span className="font-extrabold text-slate-900 ml-1">
                        {selectedValueName || 'Choose'}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {group.values.map(value => {
                      const isSelected = selectedAttributes[group.id] === value.id;
                      const colorHex = isColorGroup ? getColorHex(value.name) : '';

                      if (isColorGroup) {
                        return (
                          <button
                            key={value.id}
                            type="button"
                            onClick={() => selectAttribute(group.id, value.id)}
                            className={`group relative flex min-h-[36px] items-center gap-2 rounded-xl border px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'border-brand-orange bg-orange-50/80 text-brand-orange shadow-xs ring-2 ring-brand-orange/20 scale-[1.02]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: colorHex }}
                            >
                              {isSelected && (
                                <Check className="h-2 w-2 stroke-[3] text-white drop-shadow-xs" />
                              )}
                            </span>
                            <span>{value.name}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => selectAttribute(group.id, value.id)}
                          className={`relative flex min-h-[36px] items-center justify-center rounded-xl border px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-950 bg-slate-950 text-white shadow-sm ring-2 ring-slate-950/10 scale-[1.02]'
                              : 'border-slate-200/90 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          {isSelected && (
                            <span className="mr-1.5 flex h-1.5 w-1.5 rounded-full bg-brand-orange" />
                          )}
                          <span>{value.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {product.has_variant && variants.length > 0 && attributeGroups.length === 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Select Variant</span>
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => {
                    const isSelected = selectedVariantId === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          if (variant.image) setSelectedImage(variant.image);
                        }}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-950 bg-slate-950 text-white shadow-sm ring-2 ring-slate-950/10'
                            : 'border-slate-200/90 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        {variant.name || variant.sku || `Variant ${variant.id}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Primary Call-To-Action Bar */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quantity Counter */}
              <div className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCartItem) {
                      handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity - 1);
                    } else {
                      setQuantity(previous => Math.max(1, previous - 1));
                    }
                  }}
                  disabled={displayedQuantity <= 1 || isOutOfStock}
                  className="px-3 sm:px-3.5 py-1.5 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 sm:w-9 text-center text-xs font-black text-slate-900">{displayedQuantity}</span>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (selectedCartItem) {
                      handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity + 1);
                    } else {
                      setQuantity(previous => previous + 1);
                    }
                  }}
                  className="px-3 sm:px-3.5 py-1.5 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Add to Shopping Bag Button */}
              <button
                ref={mainBuyBtnRef}
                type="button"
                onClick={handleAdd}
                disabled={Boolean(selectedCartItem) || displayedPrice === null || isOutOfStock}
                className={`flex h-11 flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl px-3 sm:px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-[0.99] ${
                  selectedCartItem
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-none cursor-default'
                    : displayedPrice === null || isOutOfStock
                    ? 'cursor-not-allowed bg-slate-200 text-slate-400 border border-slate-300 shadow-none'
                    : 'bg-brand-orange text-white hover:bg-orange-600 shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01]'
                }`}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isOutOfStock 
                    ? 'Out of Stock' 
                    : selectedCartItem 
                    ? 'In Shopping Bag' 
                    : 'Add to Bag'}
                </span>
              </button>

              {/* Instant Buy Now Button (Side by Side next to Add to Bag) */}
              {!isOutOfStock && displayedPrice !== null && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex h-11 flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="truncate">Buy Now</span>
                </button>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => handleToggleWishlist(product.id.toString())}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isLiked
                    ? 'border-rose-300 bg-rose-50 text-rose-500 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4.5 w-4.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Assurance & Trust Badges */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 gap-0.5">
              <Truck className="w-4 h-4 text-brand-orange" />
              <span className="text-[10px] font-black text-slate-900">Free Shipping</span>
              <span className="text-[8.5px] text-slate-500">Over 1500৳</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 gap-0.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-slate-900">Fast Delivery</span>
              <span className="text-[8.5px] text-slate-500">2-3 Days</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 gap-0.5">
              <RotateCcw className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-slate-900">7-Day Return</span>
              <span className="text-[8.5px] text-slate-500">Exchange</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 gap-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-900">100% Genuine</span>
              <span className="text-[8.5px] text-slate-500">Authentic</span>
            </div>
          </div>

          {/* Warranty Info */}
          {product.has_warranty && product.warranty && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] font-semibold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span><strong>Official Warranty:</strong> {product.warranty}</span>
            </div>
          )}
        </div>
      </div>

      {/* Segmented Tabs Section (Description, Specs, Reviews, Comments) */}
      <div className="mt-4 border-t border-slate-200/80 pt-4">
        <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 overflow-x-auto scrollbar-none">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentTab === tab.id
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  currentTab === tab.id ? 'bg-white/20 text-white' : 'bg-orange-100 text-brand-orange'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="py-4 text-xs leading-relaxed text-slate-700 min-h-[140px]">
          {currentTab === 'description' && product.description && (
            <div className="max-w-4xl bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs">
              <SafeHtml html={product.description} className="product-rich-text" />
            </div>
          )}
          {currentTab === 'specifications' && specifications.length > 0 && (
            <div className="max-w-3xl overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 font-black text-[10px] uppercase tracking-wider text-slate-700">
                Technical Specifications
              </div>
              <dl>
                {specifications.map((specification, index) => (
                  <div
                    key={`${specification.key || specification.title}-${index}`}
                    className={`grid grid-cols-[minmax(120px,1fr)_2fr] gap-3 px-4 py-2 border-b border-slate-100 last:border-b-0 text-xs ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <dt className="font-bold text-slate-900">{specification.key || specification.title}</dt>
                    <dd className="text-slate-600 font-medium">{specification.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {currentTab === 'reviews' && (
            <ProductReviews
              productId={product.id}
              onReviewStatsUpdate={(count) => setReviewCount(count)}
            />
          )}
          {currentTab === 'comments' && (
            <ProductComments
              productId={product.id}
              onCommentCountUpdate={(count) => setCommentCount(count)}
            />
          )}
        </div>
      </div>

      {/* Recommended / Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-4 border-t border-slate-200/80 pt-6 mb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">CURATED SELECTION</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">You May Also Like</h3>
            </div>
            <Link href="/shop" className="text-xs font-bold text-slate-600 hover:text-brand-orange flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((relProd) => {
              const relImage = relProd.images?.[0]?.url || relProd.variants?.[0]?.image || '';
              const relPrice = numericPrice(relProd.sale_price) ?? numericPrice(relProd.regular_price) ?? 0;
              const relRegularPrice = numericPrice(relProd.regular_price);
              const relHasDiscount = relRegularPrice !== null && relRegularPrice > relPrice;

              return (
                <div
                  key={relProd.id}
                  className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-brand-orange/40 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col group relative"
                >
                  <Link href={getProductUrl(relProd)} className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                    {relImage ? (
                      <img
                        src={resolveImageUrl(relImage)}
                        alt={relProd.name || 'Product'}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No Image</span>
                    )}
                  </Link>

                  <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                    <div>
                      <span className="text-[8.5px] font-black text-brand-orange uppercase tracking-widest">{relProd.category?.name || 'APPAREL'}</span>
                      <Link href={getProductUrl(relProd)} className="block text-xs font-bold text-slate-900 hover:text-brand-orange truncate mt-0.5">
                        {relProd.name}
                      </Link>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <div>
                        <span className="text-xs font-black text-slate-950">BDT {formatPrice(relPrice)}</span>
                        {relHasDiscount && relRegularPrice && (
                          <span className="ml-1 text-[9.5px] font-semibold text-slate-400 line-through">BDT {formatPrice(relRegularPrice)}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleQuickAddToCart({
                            id: relProd.id,
                            name: relProd.name,
                            price: relPrice,
                            image: relImage ? resolveImageUrl(relImage) : ''
                          }, e);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-brand-orange text-slate-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Purchase Bar (On Scroll) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 transform ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              {currentImage && (
                <img
                  src={resolveImageUrl(currentImage)}
                  alt={product.name || ''}
                  className="w-full h-full object-contain p-0.5"
                />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{product.name}</h4>
              <p className="text-[10.5px] font-bold text-brand-orange">
                BDT {displayedPrice ? formatPrice(displayedPrice) : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={Boolean(selectedCartItem) || displayedPrice === null || isOutOfStock}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                selectedCartItem || isOutOfStock
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-brand-orange hover:bg-orange-600 shadow-orange-500/25'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isOutOfStock ? 'Out of Stock' : selectedCartItem ? 'In Bag' : 'Add to Bag'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {quickViewProductId && (
        <ProductQuickView
          productId={quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
        />
      )}
    </div>
  );
}
