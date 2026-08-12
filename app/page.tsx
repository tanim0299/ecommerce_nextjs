'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingBag, 
  User, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Star, 
  Truck, 
  Heart, 
  Info, 
  Plus, 
  Minus, 
  CheckCircle,
  Phone,
  HelpCircle,
  Smartphone,
  Check
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, Product, ProductColor } from './data';
import { useApp } from './context';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  image: string;
}

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
  image: string;
  url: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [isSlidersLoading, setIsSlidersLoading] = useState(true);

  const {
    likedProducts,
    searchQuery,
    handleQuickAddToCart,
    handleToggleWishlist,
    resolveImageUrl
  } = useApp();

  // Fetch dynamic sliders
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/sliders`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            const sortedSliders = json.data.sort((a: any, b: any) => (a.sl || 0) - (b.sl || 0));
            setSliders(sortedSliders);
          }
        }
      } catch (error) {
        console.error('Failed to load sliders:', error);
      } finally {
        setIsSlidersLoading(false);
      }
    };
    fetchSliders();
  }, []);

  // Search filter lists
  const filteredTshirts = TSHIRT_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredShuffled1 = TSHIRT_PRODUCTS_SHUFFLED_1.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredShuffled2 = TSHIRT_PRODUCTS_SHUFFLED_2.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredShuffled3 = TSHIRT_PRODUCTS_SHUFFLED_3.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasActiveSearch = searchQuery.trim().length > 0;
  const totalSearchMatches = filteredTshirts.length + filteredShuffled1.length + filteredShuffled2.length + filteredShuffled3.length;

  const renderProductCard = (prod: any, idx: number) => {
    const isLiked = likedProducts.includes(prod.id.toString());
    return (
      <div
        key={idx}
        className="min-w-[240px] md:min-w-[270px] flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-start flex flex-col group relative"
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
            className={`w-4 h-4 transition-all duration-300 ${
              isLiked 
                ? 'fill-rose-500 text-rose-500 scale-110' 
                : 'text-slate-600 group-hover/heart:text-rose-500'
            }`} 
          />
        </button>

        <Link href={`/product/${prod.id}`} className="flex flex-col flex-1">
          <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
            <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
              <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md shadow-sm">
                {prod.tag}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                {prod.discount} OFF
              </span>
            </div>

            <div className="absolute top-3.5 right-12 z-20 bg-white/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-white/20">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black text-slate-800">{prod.rating}</span>
            </div>

            <img
              src={resolveImageUrl(prod.image)}
              alt={prod.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleQuickAddToCart(prod);
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-500 cursor-pointer"
              >
                Add to Basket
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2 bg-white flex-1 justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                FABRILIFE PREMIUM
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-500 transition-colors duration-300 line-clamp-1">
                {prod.name}
              </h3>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-black text-slate-950">
                BDT {prod.price}
              </span>
              <span className="text-[11px] font-bold text-slate-400 line-through">
                BDT {prod.originalPrice}
              </span>
            </div>
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
      {hasActiveSearch ? (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">
              Search Results
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Found {totalSearchMatches} matching products for &quot;{searchQuery}&quot;
            </h2>
          </div>

          {totalSearchMatches === 0 ? (
            <div className="w-full bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  We couldn&apos;t find any items matching &quot;{searchQuery}&quot;. Check the spelling or try a different term!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
              {[...filteredTshirts, ...filteredShuffled1, ...filteredShuffled2, ...filteredShuffled3]
                .filter((prod, index, self) => self.findIndex(p => p.id === prod.id) === index)
                .map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Gorgeous Premium Hero Slider */}
          <section className="relative w-full aspect-[2.6/1] md:aspect-[3/1] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 group">
            {isSlidersLoading ? (
              <div className="w-full h-full shimmer-effect-light flex flex-col justify-center p-8 md:p-16 gap-3">
                <div className="h-3.5 w-24 bg-white/40 rounded-lg" />
                <div className="h-7 w-2/3 md:w-1/2 bg-white/40 rounded-xl" />
                <div className="h-4 w-3/4 md:w-2/5 bg-white/40 rounded-lg" />
                <div className="h-9 w-28 bg-white/40 rounded-xl mt-2" />
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
                    return (
                      <a
                        key={slide.id || idx}
                        href={slide.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                          isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                        }`}
                      >
                        <img
                          src={resolveImageUrl(slide.image)}
                          alt={`Promo Slide ${idx + 1}`}
                          className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                            isActive ? "scale-100" : "scale-105"
                          }`}
                        />
                      </a>
                    );
                  })}
                </div>

                {sliders.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/35 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/35 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {sliders.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                            idx === currentSlide ? "w-8 bg-amber-500" : "w-2.5 bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          {/* Top Categories Infinite Carousel */}
          <section id="categories-section" className="flex flex-col gap-6 w-full mt-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                Curated Collections
              </span>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
                TOP CATEGORIES <span className="text-amber-500">.</span>
              </h2>
            </div>

            <div
              id="category-slider"
              className="w-full overflow-x-auto flex gap-6 py-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...TOP_CATEGORIES, ...TOP_CATEGORIES, ...TOP_CATEGORIES].map((cat, idx) => (
                <div
                  key={idx}
                  className="w-[140px] md:w-[170px] shrink-0 aspect-[4/5] rounded-2xl overflow-hidden relative shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 snap-start group border border-slate-100 cursor-pointer"
                >
                  <img
                    src={resolveImageUrl(cat.image)}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[8px] font-black uppercase tracking-wider text-amber-400">
                      {cat.count}
                    </span>
                    <h4 className="text-xs md:text-sm font-black text-white leading-tight uppercase tracking-wide group-hover:text-amber-500 transition-colors">
                      {cat.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Premium Apparel Section: T-Shirts */}
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
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-1');
                    if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-1');
                    if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              id="product-slider-1"
              className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredTshirts.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>

          {/* Polo Shirts Section */}
          <section id="women-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                  Premium Apparel
                </span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  FEATURED POLO SHIRTS
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-2');
                    if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-2');
                    if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              id="product-slider-2"
              className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredShuffled1.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>

          {/* Casual Shirts Section */}
          <section id="teens-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                  Premium Apparel
                </span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  CASUAL SHIRTS & FITS
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-3');
                    if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-3');
                    if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              id="product-slider-3"
              className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredShuffled2.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>

          {/* Premium Bottoms / Chinos Section */}
          <section id="kids-section" className="flex flex-col gap-6 w-full mt-6">
            <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                  Premium Apparel
                </span>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  PREMIUM CHINO PANTS
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-4');
                    if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('product-slider-4');
                    if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              id="product-slider-4"
              className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredShuffled3.map((prod, idx) => renderProductCard(prod, idx))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
