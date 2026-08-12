'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Grid, 
  List,
  Star,
  Heart,
  ShoppingBag,
  Check
} from 'lucide-react';
import { useApp } from '../context';
import { 
  TSHIRT_PRODUCTS, 
  TSHIRT_PRODUCTS_SHUFFLED_1, 
  TSHIRT_PRODUCTS_SHUFFLED_2, 
  TSHIRT_PRODUCTS_SHUFFLED_3 
} from '../page';

// Combine all products from our mock data
const ALL_PRODUCTS = [
  ...TSHIRT_PRODUCTS,
  ...TSHIRT_PRODUCTS_SHUFFLED_1,
  ...TSHIRT_PRODUCTS_SHUFFLED_2,
  ...TSHIRT_PRODUCTS_SHUFFLED_3
].filter((prod, index, self) => self.findIndex(p => p.id === prod.id) === index)
.map(p => ({
  ...p,
  priceNum: parseInt(p.price, 10),
  originalPriceNum: parseInt(p.originalPrice, 10)
}));

// Sidebar category list
const SIDEBAR_CATEGORIES = [
  { slug: 'all', name: 'All Products' },
  { slug: 'panjabi', name: 'Premium Panjabi' },
  { slug: 'polo', name: 'Polo Shirts' },
  { slug: 'tshirts', name: 'T-Shirts' },
  { slug: 'shirts', name: 'Casual Shirts' },
  { slug: 'chinos', name: 'Chino Pants' },
  { slug: 'activewear', name: 'Activewear' },
  { slug: 'jackets', name: 'Winter Jackets' }
];

const FILTER_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const FILTER_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Blue', hex: '#1e3a8a' },
  { name: 'Olive', hex: '#3f6212' },
  { name: 'Red', hex: '#991b1b' },
  { name: 'Grey', hex: '#64748b' }
];

const CATEGORY_BANNERS: { [key: string]: string } = {
  all: '/tshirt-banner.jpg',
  tshirts: '/tshirt-banner.jpg',
  polo: '/tshirt-banner.jpg',
  panjabi: '/tshirt-banner.jpg',
  shirts: '/tshirt-banner.jpg',
  chinos: '/tshirt-banner.jpg',
  activewear: '/tshirt-banner.jpg',
  jackets: '/tshirt-banner.jpg'
};

function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { likedProducts, handleToggleWishlist, handleQuickAddToCart } = useApp();

  // Selected filters in state
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  // Sync category changes from query params
  React.useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Handle Category click
  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    const params = new URLSearchParams(window.location.search);
    params.set('category', slug);
    router.replace(`/shop?${params.toString()}`);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    let result = [...ALL_PRODUCTS];

    // Filter by Category
    if (selectedCategory !== 'all') {
      // Map general targets to tags or naming conventions
      result = result.filter(prod => {
        const cat = selectedCategory.toLowerCase();
        if (cat === 'tshirts') return prod.name.toLowerCase().includes('t-shirt') || prod.name.toLowerCase().includes('tee');
        if (cat === 'polo') return prod.name.toLowerCase().includes('polo');
        if (cat === 'panjabi') return prod.name.toLowerCase().includes('panjabi');
        if (cat === 'shirts') return prod.name.toLowerCase().includes('shirt') && !prod.name.toLowerCase().includes('t-shirt');
        return true;
      });
    }

    // Filter by Price
    result = result.filter(prod => prod.priceNum >= minPrice && prod.priceNum <= maxPrice);

    // Filter by Colors (simulated)
    if (selectedColors.length > 0) {
      // Randomly display matching items for interactive feel since database is dummy
      result = result.filter((_, idx) => (idx % 3) !== 0);
    }

    // Filter by Sizes (simulated)
    if (selectedSizes.length > 0) {
      result = result.filter((_, idx) => (idx % 2) === 0);
    }

    // Sort logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.priceNum - b.priceNum);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.priceNum - a.priceNum);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    return result;
  }, [selectedCategory, minPrice, maxPrice, selectedSizes, selectedColors, sortBy]);

  return (
    <div className="w-full py-6 flex flex-col gap-6 animate-slide-up">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-slate-800 transition-colors">Category</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 uppercase font-black">
          {SIDEBAR_CATEGORIES.find(c => c.slug === selectedCategory)?.name || 'Products'}
        </span>
      </div>

      {/* Main Page Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sidebar Filters */}
        <aside className="lg:col-span-3 flex flex-col gap-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sticky top-28">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
              Filter Options
            </h3>
            {(selectedCategory !== 'all' || minPrice !== 0 || maxPrice !== 2000 || selectedSizes.length > 0 || selectedColors.length > 0) && (
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setMinPrice(0);
                  setMaxPrice(2000);
                  setSelectedSizes([]);
                  setSelectedColors([]);
                  router.replace('/shop');
                }} 
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-brand-orange pl-2">
              Categories
            </h4>
            <div className="flex flex-col gap-1.5 pl-2">
              {SIDEBAR_CATEGORIES.map((cat) => {
                const isActive = cat.slug === selectedCategory;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-left text-xs font-bold py-1 transition-all flex items-center justify-between group cursor-pointer ${
                      isActive ? 'text-brand-orange translate-x-1.5' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-brand-orange/10 text-brand-orange' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                    }`}>
                      {cat.slug === 'all' ? ALL_PRODUCTS.length : Math.floor(Math.random() * 20) + 12}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-brand-orange pl-2">
                Price Range
              </h4>
              <span className="text-[11px] font-extrabold text-brand-orange">BDT {minPrice} - {maxPrice}</span>
            </div>
            <div className="px-2 flex flex-col gap-4">
              {/* Range Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Min Price</span>
                  <input
                    type="number"
                    min="0"
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <span className="text-slate-400 font-bold mt-4">-</span>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Max Price</span>
                  <input
                    type="number"
                    min={minPrice}
                    max="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              {/* Slider for quick range max */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase">Quick Max Limit</span>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
              </div>
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-brand-orange pl-2">
              Filter by Size
            </h4>
            <div className="flex flex-wrap gap-2 pl-2">
              {FILTER_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`px-3 py-1.5 border text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-brand-orange bg-brand-orange text-white shadow-xs' 
                        : 'border-slate-200 text-slate-600 bg-white hover:border-slate-350'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-brand-orange pl-2">
              Filter by Color
            </h4>
            <div className="flex items-center gap-3 pl-2">
              {FILTER_COLORS.map((col) => {
                const isSelected = selectedColors.includes(col.name);
                return (
                  <button
                    key={col.name}
                    onClick={() => handleColorToggle(col.name)}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                      isSelected ? 'border-brand-orange scale-105 ring-2 ring-brand-orange/10' : 'border-slate-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Catalog Grid */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {SIDEBAR_CATEGORIES.find(c => c.slug === selectedCategory)?.name || 'Products'}
              </h2>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {filteredProducts.length} premium products found
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer border-none"
                >
                  <option value="featured">Featured Product</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Banner */}
          <div className="w-full h-24 md:h-32 rounded-2xl overflow-hidden shadow-xs border border-slate-100/60 relative group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img
              src={CATEGORY_BANNERS[selectedCategory] || '/tshirt-banner.jpg'}
              alt={`${selectedCategory} banner`}
              className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.02]"
            />
          </div>

          {/* Empty Results Fallback */}
          {filteredProducts.length === 0 ? (
            <div className="w-full bg-white rounded-2xl border border-slate-100 p-16 text-center flex flex-col items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
                <SlidersHorizontal className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No products match your filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  Try adjusting your price range, toggling other sizes, or clearing filters to find what you want!
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setMinPrice(0);
                  setMaxPrice(2000);
                  setSelectedSizes([]);
                  setSelectedColors([]);
                }}
                className="bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs py-2 px-6 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Product grid view */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((prod, idx) => {
                const isLiked = likedProducts.includes(prod.id.toString());
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col group relative"
                  >
                    {/* Wishlist button */}
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
                      {/* Product Thumbnail */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 flex items-center justify-center">
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
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Quick Add Overlay */}
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

                      {/* Details Content */}
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
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopListingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopCatalogContent />
    </React.Suspense>
  );
}
