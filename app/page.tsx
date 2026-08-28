'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Play,
  X,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from './context';
import ProductQuickView from './components/ProductQuickView';
import WatchBeforeBuyModal from './components/WatchBeforeBuyModal';

export const TOP_CATEGORIES = [
  { name: "Premium Panjabi", image: "/categories/cat1.jpg", count: "45 Items" },
  { name: "Polo Shirts", image: "/categories/cat2.jpg", count: "68 Items" },
  { name: "Graphic Tees", image: "/categories/cat3.jpg", count: "124 Items" },
  { name: "Casual Shirts", image: "/categories/cat4.jpg", count: "39 Items" },
  { name: "Chino Pants", image: "/categories/cat5.jpg", count: "52 Items" },
  { name: "Activewear", image: "/categories/cat6.jpg", count: "30 Items" },
  { name: "Winter Jackets", image: "/categories/cat7.jpg", count: "18 Items" },
  { name: "Premium Shoes", image: "/categories/cat8.jpg", count: "25 Items" },
  { name: "Accessories", image: "/categories/cat9.jpg", count: "14 Items" }
];

export const TSHIRT_PRODUCTS = [
  { id: 1, name: "SABR Contrast T-Shirt", price: "990", originalPrice: "1250", image: "/products/prod1.jpg", tag: "Hot", rating: "4.8", discount: "20%" },
  { id: 2, name: "TAWAKKUL Classic Tee", price: "890", originalPrice: "1100", image: "/products/prod2.jpg", tag: "Premium", rating: "4.9", discount: "19%" },
  { id: 3, name: "MUSAFIR Raglan Sleeve", price: "950", originalPrice: "1200", image: "/products/prod3.jpg", tag: "New", rating: "4.7", discount: "21%" },
  { id: 4, name: "Minimalist Combed Tee", price: "850", originalPrice: "990", image: "/products/prod4.jpg", tag: "Best Seller", rating: "5.0", discount: "14%" },
  { id: 5, name: "Vintage Wash Tee", price: "1050", originalPrice: "1350", image: "/products/prod5.jpg", tag: "Vintage", rating: "4.6", discount: "22%" },
  { id: 6, name: "Athletic Premium Tee", price: "990", originalPrice: "1250", image: "/products/prod6.jpg", tag: "Sports", rating: "4.9", discount: "20%" },
  { id: 7, name: "Urban Streetwear Tee", price: "1150", originalPrice: "1490", image: "/products/prod7.jpg", tag: "Trending", rating: "4.8", discount: "22%" },
  { id: 8, name: "Heritage Crewneck Tee", price: "950", originalPrice: "1190", image: "/products/prod8.jpg", tag: "Classic", rating: "4.7", discount: "20%" },
  { id: 9, name: "Luxe Combed Cotton Tee", price: "1200", originalPrice: "1500", image: "/products/prod9.jpg", tag: "Luxury", rating: "5.0", discount: "20%" }
];

export const TSHIRT_PRODUCTS_SHUFFLED_1 = [
  { id: 4, name: "Minimalist Combed Tee", price: "850", originalPrice: "990", image: "/products/prod4.jpg", tag: "Best Seller", rating: "5.0", discount: "14%" },
  { id: 1, name: "SABR Contrast T-Shirt", price: "990", originalPrice: "1250", image: "/products/prod1.jpg", tag: "Hot", rating: "4.8", discount: "20%" },
  { id: 9, name: "Luxe Combed Cotton Tee", price: "1200", originalPrice: "1500", image: "/products/prod9.jpg", tag: "Luxury", rating: "5.0", discount: "20%" },
  { id: 2, name: "TAWAKKUL Classic Tee", price: "890", originalPrice: "1100", image: "/products/prod2.jpg", tag: "Premium", rating: "4.9", discount: "19%" },
  { id: 7, name: "Urban Streetwear Tee", price: "1150", originalPrice: "1490", image: "/products/prod7.jpg", tag: "Trending", rating: "4.8", discount: "22%" },
  { id: 5, name: "Vintage Wash Tee", price: "1050", originalPrice: "1350", image: "/products/prod5.jpg", tag: "Vintage", rating: "4.6", discount: "22%" },
  { id: 3, name: "MUSAFIR Raglan Sleeve", price: "950", originalPrice: "1200", image: "/products/prod3.jpg", tag: "New", rating: "4.7", discount: "21%" },
  { id: 8, name: "Heritage Crewneck Tee", price: "950", originalPrice: "1190", image: "/products/prod8.jpg", tag: "Classic", rating: "4.7", discount: "20%" },
  { id: 6, name: "Athletic Premium Tee", price: "990", originalPrice: "1250", image: "/products/prod6.jpg", tag: "Sports", rating: "4.9", discount: "20%" }
];

export const TSHIRT_PRODUCTS_SHUFFLED_2 = [
  { id: 7, name: "Urban Streetwear Tee", price: "1150", originalPrice: "1490", image: "/products/prod7.jpg", tag: "Trending", rating: "4.8", discount: "22%" },
  { id: 3, name: "MUSAFIR Raglan Sleeve", price: "950", originalPrice: "1200", image: "/products/prod3.jpg", tag: "New", rating: "4.7", discount: "21%" },
  { id: 8, name: "Heritage Crewneck Tee", price: "950", originalPrice: "1190", image: "/products/prod8.jpg", tag: "Classic", rating: "4.7", discount: "20%" },
  { id: 1, name: "SABR Contrast T-Shirt", price: "990", originalPrice: "1250", image: "/products/prod1.jpg", tag: "Hot", rating: "4.8", discount: "20%" },
  { id: 6, name: "Athletic Premium Tee", price: "990", originalPrice: "1250", image: "/products/prod6.jpg", tag: "Sports", rating: "4.9", discount: "20%" },
  { id: 9, name: "Luxe Combed Cotton Tee", price: "1200", originalPrice: "1500", image: "/products/prod9.jpg", tag: "Luxury", rating: "5.0", discount: "20%" },
  { id: 4, name: "Minimalist Combed Tee", price: "850", originalPrice: "990", image: "/products/prod4.jpg", tag: "Best Seller", rating: "5.0", discount: "14%" },
  { id: 5, name: "Vintage Wash Tee", price: "1050", originalPrice: "1350", image: "/products/prod5.jpg", tag: "Vintage", rating: "4.6", discount: "22%" },
  { id: 2, name: "TAWAKKUL Classic Tee", price: "890", originalPrice: "1100", image: "/products/prod2.jpg", tag: "Premium", rating: "4.9", discount: "19%" }
];

export const TSHIRT_PRODUCTS_SHUFFLED_3 = [
  { id: 2, name: "TAWAKKUL Classic Tee", price: "890", originalPrice: "1100", image: "/products/prod2.jpg", tag: "Premium", rating: "4.9", discount: "19%" },
  { id: 9, name: "Luxe Combed Cotton Tee", price: "1200", originalPrice: "1500", image: "/products/prod9.jpg", tag: "Luxury", rating: "5.0", discount: "20%" },
  { id: 5, name: "Vintage Wash Tee", price: "1050", originalPrice: "1350", image: "/products/prod5.jpg", tag: "Vintage", rating: "4.6", discount: "22%" },
  { id: 8, name: "Heritage Crewneck Tee", price: "950", originalPrice: "1190", image: "/products/prod8.jpg", tag: "Classic", rating: "4.7", discount: "20%" },
  { id: 1, name: "SABR Contrast T-Shirt", price: "990", originalPrice: "1250", image: "/products/prod1.jpg", tag: "Hot", rating: "4.8", discount: "20%" },
  { id: 7, name: "Urban Streetwear Tee", price: "1150", originalPrice: "1490", image: "/products/prod7.jpg", tag: "Trending", rating: "4.8", discount: "22%" },
  { id: 4, name: "Minimalist Combed Tee", price: "850", originalPrice: "990", image: "/products/prod4.jpg", tag: "Best Seller", rating: "5.0", discount: "14%" },
  { id: 6, name: "Athletic Premium Tee", price: "990", originalPrice: "1250", image: "/products/prod6.jpg", tag: "Sports", rating: "4.9", discount: "20%" },
  { id: 3, name: "MUSAFIR Raglan Sleeve", price: "950", originalPrice: "1200", image: "/products/prod3.jpg", tag: "New", rating: "4.7", discount: "21%" }
];

interface SliderItem {
  id: number;
  sl: number;
  type?: 'image' | 'video';
  image?: string | null;
  video?: string | null;
  video_url?: string | null;
  short_title?: string | null;
  title?: string | null;
  description?: string | null;
  text_placement?: 'left' | 'center' | 'right' | string | null;
  url?: string | null;
}

interface ApiImage {
  url?: string;
}

interface ApiRelation {
  id?: number;
  name?: string;
}

interface ApiProduct {
  id: number;
  name?: string;
  sale_price?: number | string | null;
  regular_price?: number | string | null;
  discount_price?: number | string | null;
  is_active?: boolean;
  has_variant?: boolean;
  images?: ApiImage[];
  brand?: ApiRelation | null;
  category?: ApiRelation | null;
  sub_category?: ApiRelation | null;
  variants?: Array<{ id: number }>;
  stock_status?: string | null;
}

interface FeaturedSubCategory extends ApiRelation {
  id: number;
  sl?: number;
  featured_image?: string;
  banner?: string;
  products_count?: number;
}

interface HomeCategory extends ApiRelation {
  id: number;
  sl?: number;
  banner?: string | null;
  featured_image?: string | null;
  is_show_home_page?: boolean;
  home_page_title?: string;
  products_count?: number;
  item?: ApiRelation | null;
}

interface HomeSubCategory extends ApiRelation {
  id: number;
  sl?: number;
  sub_category_id?: number;
  sub_category?: ApiRelation | null;
  category?: ApiRelation | null;
  item?: ApiRelation | null;
  home_page_title?: string;
}

interface WatchBeforeBuyVideo {
  id: number;
  product_id: number;
  short_title: string;
  title: string;
  video_url?: string | null;
  video?: string | null;
  platform?: string;
  sl_no?: number;
  product?: {
    id: number;
    name: string;
    sku?: string;
    sale_price: number;
    regular_price: number;
    discount_price?: number;
    image?: string | null;
  } | null;
}

const normalizeName = (value?: string) => value?.trim().toLocaleLowerCase() || '';

const numericPrice = (value?: number | string | null) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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

const getYouTubeThumb = (url?: string | null) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

const getEmbedPlayerUrl = (url?: string | null) => {
  if (!url) return '';
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
  }
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  }
  return url;
};

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [isSlidersLoading, setIsSlidersLoading] = useState(true);
  const [featuredSubCategories, setFeaturedSubCategories] = useState<FeaturedSubCategory[]>([]);
  const [homeCategories, setHomeCategories] = useState<HomeCategory[]>([]);
  const [homeSubCategories, setHomeSubCategories] = useState<HomeSubCategory[]>([]);
  const [watchVideos, setWatchVideos] = useState<WatchBeforeBuyVideo[]>([]);
  const [activeWatchVideo, setActiveWatchVideo] = useState<WatchBeforeBuyVideo | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);

  const {
    likedProducts,
    searchQuery,
    handleQuickAddToCart,
    handleToggleWishlist,
    resolveImageUrl
  } = useApp();

  // Fetch dynamic sliders, featured sub categories, and home categories
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/sliders`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            const sortedSliders = (json.data as SliderItem[])
              .sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setSliders(sortedSliders);
          }
        }
      } catch (error) {
        console.error('Failed to load sliders:', error);
      } finally {
        setIsSlidersLoading(false);
      }
    };
    const fetchFeaturedSubCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/featured-sub-categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            const sorted = (json.data as FeaturedSubCategory[])
              .sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setFeaturedSubCategories(sorted);
          }
        }
      } catch (error) {
        console.error('Failed to load featured sub categories:', error);
      }
    };
    const fetchHomeCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/home-categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            const sorted = (json.data as HomeCategory[])
              .sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setHomeCategories(sorted);
          }
        }
      } catch (error) {
        console.error('Failed to load home categories:', error);
      }
    };
    const fetchHomeSubCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/home-sub-categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            const sorted = (json.data as HomeSubCategory[])
              .sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setHomeSubCategories(sorted);
          }
        }
      } catch (error) {
        console.error('Failed to load home sub categories:', error);
      }
    };
    const fetchWatchVideos = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/watch-before-buy`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            setWatchVideos(json.data);
          }
        }
      } catch (error) {
        console.error('Failed to load watch before buy videos:', error);
      }
    };
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/products`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            setProducts(json.data.filter((product: ApiProduct) => product.is_active !== false));
          }
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsProductsLoading(false);
      }
    };
    fetchSliders();
    fetchWatchVideos();
    fetchFeaturedSubCategories();
    fetchHomeCategories();
    fetchHomeSubCategories();
    fetchProducts();
  }, []);

  const productsForCategory = (homeCat: HomeCategory) => {
    const categoryId = Number(homeCat.id);
    const categoryName = normalizeName(homeCat.name);

    return products.filter(product => {
      const productCategoryId = Number(product.category?.id);
      const idsMatch = Number.isFinite(categoryId)
        && Number.isFinite(productCategoryId)
        && categoryId === productCategoryId;
      const namesMatch = Boolean(categoryName)
        && categoryName === normalizeName(product.category?.name);

      return idsMatch || namesMatch;
    });
  };

  const productsForSubCategory = (homeCat: HomeSubCategory) => {
    const subCategoryId = Number(
      homeCat.sub_category_id ?? homeCat.sub_category?.id ?? homeCat.id
    );
    const subCategoryName = normalizeName(homeCat.sub_category?.name ?? homeCat.name);

    return products.filter(product => {
      const productSubCategoryId = Number(product.sub_category?.id);
      const idsMatch = Number.isFinite(subCategoryId)
        && Number.isFinite(productSubCategoryId)
        && subCategoryId === productSubCategoryId;
      const namesMatch = Boolean(subCategoryName)
        && subCategoryName === normalizeName(product.sub_category?.name);

      return idsMatch || namesMatch;
    });
  };

  const renderProductCard = (prod: ApiProduct, idx: number, isSliderCard = false) => {
    const isLiked = likedProducts.includes(prod.id.toString());
    const imageUrls = (prod.images ?? [])
      .map(image => image.url)
      .filter((url): url is string => Boolean(url));
    const [primaryImage, hoverImage] = imageUrls;
    const salePrice = numericPrice(prod.sale_price);
    const regularPrice = numericPrice(prod.regular_price);
    const displayedPrice = salePrice !== null
      ? salePrice
      : regularPrice;
    const hasDiscount = displayedPrice !== null
      && regularPrice !== null
      && regularPrice > displayedPrice;
    const savingAmount = hasDiscount ? regularPrice - displayedPrice : null;
    const hasVariants = Boolean(prod.has_variant || (prod.variants?.length ?? 0) > 0);

    return (
      <div
        key={prod.id || idx}
        className={`${isSliderCard
          ? 'w-[220px] sm:w-[240px] md:w-[270px] shrink-0 snap-start'
          : 'w-full min-w-0'
          } bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col group relative`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleToggleWishlist(prod.id.toString());
          }}
          className="absolute top-3.5 right-3.5 z-25 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow group/heart cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${isLiked
                ? 'fill-rose-500 text-rose-500 scale-110'
                : 'text-slate-600 group-hover/heart:text-rose-500'
              }`}
          />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setQuickViewProductId(prod.id);
          }}
          className="absolute right-12 top-3.5 z-30 flex h-8 items-center gap-1.5 rounded-full bg-slate-950/90 px-2.5 text-[9px] font-black uppercase tracking-wider text-white opacity-100 shadow-lg transition-all duration-300 hover:bg-brand-orange md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Quick view ${prod.name || 'product'}`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Quick View</span>
        </button>

        <Link href={`/product/${prod.id}`} className="flex flex-col flex-1">
          <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
            <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
              {savingAmount !== null && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                  BDT {savingAmount} OFF
                </span>
              )}
            </div>

            {prod.stock_status === 'out_of_stock' && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-30 pointer-events-none">
                <span className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-rose-600/90 text-white rounded-xl shadow-lg border border-rose-500/25">
                  Out of Stock
                </span>
              </div>
            )}

            {primaryImage && (
              <img
                src={resolveImageUrl(primaryImage)}
                alt={prod.name || 'Product'}
                className={`w-full h-full object-contain p-2 transition-all duration-500 group-hover:scale-[1.03] ${hoverImage ? 'group-hover:opacity-0' : ''} ${prod.stock_status === 'out_of_stock' ? 'opacity-50' : ''}`}
              />
            )}
            {hoverImage && (
              <img
                src={resolveImageUrl(hoverImage)}
                alt={prod.name ? `${prod.name} alternate view` : 'Product alternate view'}
                className={`absolute inset-0 w-full h-full object-contain p-2 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.03] ${prod.stock_status === 'out_of_stock' ? 'opacity-50' : ''}`}
              />
            )}

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (prod.stock_status === 'out_of_stock') return;
                  if (hasVariants) {
                    router.push(`/product/${prod.id}`);
                  } else {
                    handleQuickAddToCart({
                      ...prod,
                      price: displayedPrice ?? 0,
                      image: primaryImage ? resolveImageUrl(primaryImage) : ''
                    }, e);
                  }
                }}
                disabled={prod.stock_status === 'out_of_stock'}
                className={`w-full py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-500 cursor-pointer ${
                  prod.stock_status === 'out_of_stock'
                    ? 'bg-slate-400 cursor-not-allowed hover:bg-slate-400'
                    : 'bg-slate-950 hover:bg-amber-500 hover:text-slate-950'
                }`}
              >
                {prod.stock_status === 'out_of_stock' ? 'Out of Stock' : hasVariants ? 'Choose Options' : 'Add to Basket'}
              </button>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-1.5 bg-white flex-1 justify-between">
            <div className="flex flex-col gap-0.5">
              {prod.brand?.name && (
                <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-slate-400">
                  {prod.brand.name}
                </span>
              )}
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-500 transition-colors duration-300 line-clamp-1">
                {prod.name}
              </h3>
            </div>

            {displayedPrice !== null && (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                {hasDiscount && regularPrice !== null && (
                  <span className="text-[10px] font-bold text-slate-400 line-through">
                    BDT {regularPrice}
                  </span>
                )}
                <span className="text-xs font-black text-slate-950">
                  BDT {displayedPrice}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  };

  // Auto-play Slider
  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, sliders]);

  // Autoplay Category Slider (Endless/Infinite Scroll)
  useEffect(() => {
    const el = document.getElementById('category-slider');
    if (!el) return;

    const handleScroll = () => {
      const singleSetWidth = el.scrollWidth / 3;
      if (el.scrollLeft >= singleSetWidth * 2) {
        el.scrollLeft = el.scrollLeft - singleSetWidth;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft = el.scrollLeft + singleSetWidth;
      }
    };

    el.addEventListener('scroll', handleScroll);
    const interval = setInterval(() => {
      el.scrollBy({ left: 320, behavior: 'smooth' });
    }, 4000);

    return () => {
      clearInterval(interval);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <ProductQuickView
        productId={quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      {/* Watch Before Buy 2-Column Split Modal (Reels Player + Instant Buy) */}
      <WatchBeforeBuyModal
        video={activeWatchVideo}
        onClose={() => setActiveWatchVideo(null)}
      />

      <>
          {/* Gorgeous Premium Hero Slider (Edge to Edge Full Width) */}
          <section className="relative w-full aspect-[2/1] sm:aspect-[2.4/1] md:aspect-[2.8/1] lg:aspect-[3.2/1] min-h-[380px] sm:min-h-[460px] md:min-h-[540px] bg-slate-950 overflow-hidden group">
            {isSlidersLoading ? (
              <div className="w-full h-full shimmer-effect-light flex flex-col justify-center items-end p-8 md:p-16 gap-3">
                <div className="h-3.5 w-32 bg-white/40 rounded-lg" />
                <div className="h-10 w-2/3 md:w-1/2 bg-white/40 rounded-xl" />
                <div className="h-4 w-3/4 md:w-2/5 bg-white/40 rounded-lg" />
                <div className="h-10 w-36 bg-white/40 rounded-full mt-2" />
              </div>
            ) : sliders.length === 0 ? (
              <div className="w-full h-full bg-slate-950 flex items-center justify-center text-center p-6">
                <span className="text-slate-500 text-xs font-semibold">No promotional banners available.</span>
              </div>
            ) : (
              <>
                <div className="w-full h-full relative">
                  {sliders.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    const isVideo = slide.type === 'video' || !!slide.video || !!slide.video_url;
                    const hasTextOverlay = !!(slide.short_title || slide.title || slide.description);
                    const rawVideo = slide.video || slide.video_url || '';
                    const videoSrc = rawVideo ? resolveImageUrl(rawVideo) : '';

                    return (
                      <div
                        key={slide.id || idx}
                        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                          isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                        }`}
                      >
                        {/* Background Media */}
                        {isVideo && videoSrc ? (
                          <video
                            key={videoSrc}
                            src={videoSrc}
                            poster={slide.image ? resolveImageUrl(slide.image) : undefined}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                              isActive ? "scale-100" : "scale-105"
                            }`}
                          />
                        ) : slide.image ? (
                          <img
                            src={resolveImageUrl(slide.image)}
                            alt={slide.title || `Promo Slide ${idx + 1}`}
                            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                              isActive ? "scale-100" : "scale-105"
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900" />
                        )}

                        {/* Premium Luxury Typography & Placement-Aware Gradient Overlay */}
                        {hasTextOverlay && (() => {
                          const placement = slide.text_placement || 'right';
                          const isLeft = placement === 'left';
                          const isCenter = placement === 'center';

                          const overlayClass = isLeft
                            ? "bg-gradient-to-r from-black/90 via-black/45 to-transparent items-start text-left justify-center px-6 sm:px-12 md:px-20 lg:px-28"
                            : isCenter
                            ? "bg-black/55 backdrop-brightness-90 items-center text-center justify-center px-6 sm:px-12 md:px-20 lg:px-28"
                            : "bg-gradient-to-l from-black/90 via-black/45 to-transparent items-end text-right justify-center px-6 sm:px-12 md:px-20 lg:px-28";

                          const containerAlignClass = isLeft ? "items-start text-left" : isCenter ? "items-center text-center" : "items-end text-right";
                          const descAlignClass = isLeft ? "text-left" : isCenter ? "text-center" : "text-right";

                          return (
                            <div className={`absolute inset-0 flex flex-col py-6 z-10 ${overlayClass}`}>
                              <div className={`max-w-2xl flex flex-col gap-2 sm:gap-3.5 animate-slide-up ${containerAlignClass}`}>
                                {slide.short_title && (
                                  <div className="inline-block border-y border-white/80 py-1 px-4 text-white font-montserrat font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.35em] drop-shadow-md">
                                    {slide.short_title}
                                  </div>
                                )}
                                {slide.title && (
                                  <h2 className="font-montserrat text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.02] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-2xl">
                                    {slide.title}
                                  </h2>
                                )}
                                {slide.description && (
                                  <p className={`font-outfit text-xs sm:text-sm md:text-base text-slate-200/90 font-normal leading-relaxed max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${descAlignClass}`}>
                                    {slide.description}
                                  </p>
                                )}
                                {slide.url && (
                                  <a
                                    href={slide.url}
                                    target={slide.url.startsWith('http') ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    className="mt-2 sm:mt-3 inline-flex items-center justify-center px-8 sm:px-10 py-2.5 sm:py-3 rounded-full bg-[#c07828] hover:bg-[#a6641d] text-white font-montserrat font-extrabold text-xs sm:text-sm uppercase tracking-[0.15em] shadow-[0_8px_25px_rgba(192,120,40,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <span>SHOP NOW</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Clickable Full overlay if NO text overlay button was rendered */}
                        {!hasTextOverlay && slide.url && (
                          <a
                            href={slide.url}
                            target={slide.url.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="absolute inset-0 z-10 cursor-pointer"
                            title={slide.title || 'View Promotion'}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {sliders.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length)}
                      className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)}
                      className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {sliders.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${idx === currentSlide ? "w-8 bg-amber-500" : "w-2.5 bg-white/50"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          {/* Centered Main Page Sections Wrapper */}
          <div className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-6 md:gap-8 mt-4 md:mt-8">

          {/* Watch Before You Buy Section (Matching reference design) */}
          {watchVideos.length > 0 && (
            <section id="watch-before-buy-section" className="flex flex-col gap-4 w-full mt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Watch Before You Buy
                </h2>

                <div className="flex items-center gap-2">
                  <Link
                    href="/shop"
                    className="text-xs sm:text-sm font-bold text-brand-orange hover:text-orange-600 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('watch-videos-slider');
                        if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-800 bg-white text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('watch-videos-slider');
                        if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-800 bg-white text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div
                id="watch-videos-slider"
                className="w-full overflow-x-auto flex gap-4 sm:gap-5 py-3 scroll-smooth snap-x snap-mandatory no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {watchVideos.map((video, idx) => {
                  const rawSrc = video.video || video.video_url || '';
                  const videoSrc = rawSrc ? resolveImageUrl(rawSrc) : '';
                  const ytThumb = getYouTubeThumb(video.video_url);
                  const isUploadedVideo = !!video.video || (!video.video_url?.includes('youtube') && !video.video_url?.includes('facebook') && !video.video_url?.includes('tiktok') && !video.video_url?.includes('instagram'));

                  return (
                    <div
                      key={video.id || idx}
                      className="w-[200px] sm:w-[220px] md:w-[245px] shrink-0 bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col snap-start group cursor-pointer"
                      onClick={() => setActiveWatchVideo(video)}
                    >
                      {/* Top Reel Frame */}
                      <div className="w-full aspect-[9/14] rounded-xl overflow-hidden relative bg-slate-950 shadow-inner">
                        {ytThumb ? (
                          <img
                            src={ytThumb}
                            alt={video.title || 'Video Reel'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : isUploadedVideo && videoSrc ? (
                          <video
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : video.product?.image ? (
                          <img
                            src={resolveImageUrl(video.product.image)}
                            alt={video.title || 'Video Reel'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/30" />
                          </div>
                        )}

                        {/* Top Badge: Brand theme badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="bg-brand-orange text-white font-extrabold text-[9.5px] sm:text-[10px] px-2.5 py-0.5 rounded-md shadow-sm tracking-wide">
                            {video.short_title || "See it in action"}
                          </span>
                        </div>

                        {/* Center White Play Button Circle */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-11 h-11 rounded-full bg-white/95 text-slate-900 shadow-lg flex items-center justify-center group-hover:scale-115 group-hover:bg-white transition-all duration-300">
                            <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Product Name Below Video */}
                      <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 line-clamp-1 mt-3 mb-2.5 group-hover:text-brand-orange transition-colors text-left px-0.5">
                        {video.product?.name || video.title || video.short_title}
                      </h4>

                      {/* Two Action Buttons: Watch & Buy */}
                      <div className="flex items-center gap-2 w-full mt-auto pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveWatchVideo(video);
                          }}
                          className="flex-1 border border-slate-300 hover:border-slate-900 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch</span>
                        </button>

                        <Link
                          href={`/product/${video.product_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold py-2 px-3 rounded-full flex items-center justify-center transition-all hover:scale-102 active:scale-95 cursor-pointer text-center shadow-md shadow-brand-orange/20"
                        >
                          Buy
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Top Categories Infinite Carousel (Only visible if featuredSubCategories has data) */}
          {featuredSubCategories.length > 0 && (
            <section id="categories-section" className="flex flex-col gap-3 w-full mt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9.5px] md:text-[11px] font-black tracking-[0.2em] text-amber-500 uppercase">
                  Curated Collections
                </span>
                <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                  TOP CATEGORIES <span className="text-amber-500">.</span>
                </h2>
              </div>

              <div
                id="category-slider"
                className="w-full overflow-x-auto flex gap-3.5 py-1.5 scroll-smooth snap-x snap-mandatory no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredSubCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${(cat.name || '').toLowerCase()}`}
                    className="w-[125px] md:w-[155px] shrink-0 aspect-[4/5] rounded-xl overflow-hidden relative shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-start group border border-slate-100 cursor-pointer block"
                  >
                    <img
                      src={resolveImageUrl(cat.featured_image || cat.banner || '')}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-3">
                      <span className="text-[8px] font-black uppercase tracking-wider text-amber-400">
                        {cat.products_count ?? 0} Items
                      </span>
                      <h4 className="text-xs font-black text-white leading-tight uppercase tracking-wide group-hover:text-amber-500 transition-colors">
                        {cat.name}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Home Categories Sections (when categories have is_show_home_page = true) */}
          {homeCategories.map(homeCat => {
            const categoryProducts = productsForCategory(homeCat);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={`cat-${homeCat.id}`} className="flex flex-col gap-3 w-full mt-4">
                <div className="flex items-end justify-between border-b border-slate-200/60 pb-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9.5px] md:text-[11px] font-black tracking-[0.2em] text-brand-orange uppercase">
                      {homeCat.item?.name || 'Premium Apparel'}
                    </span>
                    <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      {homeCat.home_page_title || homeCat.name}
                      <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const el = document.getElementById(`home-cat-slider-${homeCat.id}`);
                        if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 hover:border-brand-orange bg-white text-slate-700 hover:text-brand-orange flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById(`home-cat-slider-${homeCat.id}`);
                        if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 hover:border-brand-orange bg-white text-slate-700 hover:text-brand-orange flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  id={`home-cat-slider-${homeCat.id}`}
                  className="w-full overflow-x-auto flex gap-3.5 py-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {isProductsLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="min-w-[210px] md:min-w-[240px] aspect-[3/4] rounded-2xl bg-slate-100 animate-pulse snap-start"
                      />
                    ))
                  ) : categoryProducts.length > 0 ? (
                    categoryProducts.map((product, idx) => renderProductCard(product, idx, true))
                  ) : (
                    <div className="w-full flex items-center justify-center py-6">
                      <span className="text-xs text-slate-400 font-semibold">No products available.</span>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {/* Dynamic Home Sub-Categories Sections */}
          {homeSubCategories.map(homeCat => {
            const categoryProducts = productsForSubCategory(homeCat);
            if (categoryProducts.length === 0) return null;

            return (
            <section key={`subcat-${homeCat.id}`} className="flex flex-col gap-3 w-full mt-4">
              <div className="flex items-end justify-between border-b border-slate-200/60 pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9.5px] md:text-[11px] font-black tracking-[0.2em] text-brand-orange uppercase">
                    {homeCat.category?.name || homeCat.item?.name || 'Premium Apparel'}
                  </span>
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    {homeCat.home_page_title || homeCat.name}
                    <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`home-slider-${homeCat.id}`);
                      if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                    }}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById(`home-slider-${homeCat.id}`);
                      if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-2xs hover:shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                id={`home-slider-${homeCat.id}`}
                className="w-full overflow-x-auto flex gap-3.5 py-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isProductsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="min-w-[210px] md:min-w-[240px] aspect-[3/4] rounded-2xl bg-slate-100 animate-pulse snap-start"
                    />
                  ))
                ) : categoryProducts.length > 0 ? (
                  categoryProducts.map((product, idx) => renderProductCard(product, idx, true))
                ) : (
                  <div className="w-full flex items-center justify-center py-6">
                    <span className="text-xs text-slate-400 font-semibold">No products available.</span>
                  </div>
                )}
              </div>
            </section>
            );
          })}

          {/* ========= STATIC PRODUCT SECTIONS (Commented Out) =========
          {/* Premium Apparel Section: T-Shirts */}
          {/*
          <section id="men-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                  Premium Apparel
                </span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  FABRILIFE PREMIUM T-SHIRTS
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const el = document.getElementById('product-slider-1'); if (el) el.scrollBy({ left: -340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { const el = document.getElementById('product-slider-1'); if (el) el.scrollBy({ left: 340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div id="product-slider-1" className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredTshirts.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>
          */}

          {/* Polo Shirts Section */}
          {/*
          <section id="women-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">Premium Apparel</span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">FEATURED POLO SHIRTS<span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /></h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const el = document.getElementById('product-slider-2'); if (el) el.scrollBy({ left: -340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { const el = document.getElementById('product-slider-2'); if (el) el.scrollBy({ left: 340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div id="product-slider-2" className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredShuffled1.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>
          */}

          {/* Casual Shirts Section */}
          {/*
          <section id="teens-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">Premium Apparel</span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">CASUAL SHIRTS & FITS<span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /></h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const el = document.getElementById('product-slider-3'); if (el) el.scrollBy({ left: -340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { const el = document.getElementById('product-slider-3'); if (el) el.scrollBy({ left: 340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div id="product-slider-3" className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredShuffled2.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>
          */}

          {/* Premium Chino Pants Section */}
          {/*
          <section id="kids-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">Premium Apparel</span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">PREMIUM CHINO PANTS<span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /></h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const el = document.getElementById('product-slider-4'); if (el) el.scrollBy({ left: -340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { const el = document.getElementById('product-slider-4'); if (el) el.scrollBy({ left: 340, behavior: 'smooth' }); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div id="product-slider-4" className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredShuffled3.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>
          */}
          {/* ========= END STATIC PRODUCT SECTIONS ========= */}
          </div>
        </>
      </>
  );
}
