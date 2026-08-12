'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus,
  Check,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context';
import { 
  TSHIRT_PRODUCTS, 
  TSHIRT_PRODUCTS_SHUFFLED_1, 
  TSHIRT_PRODUCTS_SHUFFLED_2, 
  TSHIRT_PRODUCTS_SHUFFLED_3 
} from '../../page';

// Mock color options for premium feel
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Olive Green', hex: '#3f6212' },
  { name: 'Burgundy', hex: '#991b1b' }
];

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

// CSS filters to simulate multiple color mockups dynamically
const MOCKUP_FILTERS = [
  { name: 'Original', filterClass: '' },
  { name: 'Classic Sepia', filterClass: 'sepia contrast-125' },
  { name: 'Warm Hue', filterClass: 'hue-rotate-60 brightness-110' },
  { name: 'Cool Slate', filterClass: 'hue-rotate-180 saturate-150' }
];

const ZOOM_LEVEL = 3;
const ZOOM_LENS_SIZE = 176;

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { 
    cart, 
    handleAddToCart, 
    handleUpdateCartQty,
    handleQuickAddToCart,
    likedProducts, 
    handleToggleWishlist, 
    setIsCartOpen,
    resolveImageUrl
  } = useApp();

  // Find the product dynamically from all lists
  const allProds = [
    ...TSHIRT_PRODUCTS, 
    ...TSHIRT_PRODUCTS_SHUFFLED_1, 
    ...TSHIRT_PRODUCTS_SHUFFLED_2, 
    ...TSHIRT_PRODUCTS_SHUFFLED_3
  ].filter((prod, index, self) => self.findIndex(p => p.id === prod.id) === index);

  const product = allProds.find(p => p.id.toString() === id);

  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedMockupIdx, setSelectedMockupIdx] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Sync state if id changes
  useEffect(() => {
    setSelectedMockupIdx(0);
    setQuantity(1);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link 
          href="/" 
          className="bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs py-2 px-6 rounded-lg uppercase tracking-wider transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const discountVal = typeof product.price === 'string' ? parseInt(product.price, 10) : product.price;
  const selectedCartItemId = `${product.id}-${selectedColor.name}-${selectedSize}`;
  const selectedCartItem = cart.find((item) => item.id === selectedCartItemId);
  const displayedQuantity = selectedCartItem?.quantity ?? quantity;

  const handleAdd = () => {
    if (selectedCartItem) return;

    handleAddToCart({
      id: selectedCartItemId,
      name: product.name,
      price: discountVal,
      size: selectedSize,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity: displayedQuantity,
      image: product.image
    });
    setIsCartOpen(true);
  };

  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    setZoomPosition({
      x: Math.min(bounds.width, Math.max(0, event.clientX - bounds.left)),
      y: Math.min(bounds.height, Math.max(0, event.clientY - bounds.top)),
      width: bounds.width,
      height: bounds.height
    });
  };

  // Filter 4 related products
  const relatedProducts = allProds.filter(p => p.id.toString() !== id).slice(0, 4);

  return (
    <div className="w-full py-6 flex flex-col gap-8 animate-slide-up">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/" className="hover:text-slate-800 transition-colors">HOME</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-slate-800 transition-colors">T-SHIRTS</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 uppercase font-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Product Images Preview */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className="w-full aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative cursor-zoom-in"
            onMouseEnter={(event) => {
              handleZoomMove(event);
              setIsZooming(true);
            }}
            onMouseMove={handleZoomMove}
            onMouseLeave={() => setIsZooming(false)}
          >
            <img 
              src={resolveImageUrl(product.image)} 
              alt={product.name} 
              className={`w-full h-full object-cover ${MOCKUP_FILTERS[selectedMockupIdx].filterClass}`}
            />
            {isZooming && (
              <div
                className="pointer-events-none absolute z-30 hidden h-44 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white bg-white shadow-2xl md:block"
                style={{ left: zoomPosition.x, top: zoomPosition.y }}
                aria-hidden="true"
              >
                <img
                  src={resolveImageUrl(product.image)}
                  alt=""
                  className={`pointer-events-none absolute max-w-none object-cover ${MOCKUP_FILTERS[selectedMockupIdx].filterClass}`}
                  style={{
                    width: zoomPosition.width * ZOOM_LEVEL,
                    height: zoomPosition.height * ZOOM_LEVEL,
                    left: (ZOOM_LENS_SIZE / 2) - (zoomPosition.x * ZOOM_LEVEL),
                    top: (ZOOM_LENS_SIZE / 2) - (zoomPosition.y * ZOOM_LEVEL)
                  }}
                />
              </div>
            )}
            {product.tag && (
              <span className="absolute top-4 left-4 z-20 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider shadow-md">
                {product.tag}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 gap-4">
            {MOCKUP_FILTERS.map((mock, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedMockupIdx(idx)}
                className={`aspect-square rounded-xl overflow-hidden bg-slate-50 border transition-all duration-300 relative group cursor-pointer ${
                  idx === selectedMockupIdx 
                    ? 'border-brand-orange shadow-md ring-2 ring-brand-orange/20 scale-102' 
                    : 'border-slate-150 border-slate-100 hover:border-slate-300'
                }`}
              >
                <img 
                  src={resolveImageUrl(product.image)} 
                  alt={`${product.name} preview`} 
                  className={`w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity ${mock.filterClass}`}
                />
                <span className="absolute bottom-1 left-1 right-1 text-[8px] font-black bg-slate-900/75 text-white px-1 py-0.5 rounded text-center truncate uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {mock.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Configurations */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-md uppercase">
                Premium Apparel
              </span>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-slate-800">{product.rating}</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">{product.name}</h1>
            <p className="text-xs text-slate-500">Product SKU: FL-TS-{product.id}-PREM</p>
          </div>

          {/* Price details */}
          <div className="flex items-baseline gap-4 border-y border-slate-150/60 py-4">
            <span className="text-3xl font-black text-slate-950">BDT {product.price}</span>
            <span className="text-sm font-semibold text-slate-400 line-through">BDT {product.originalPrice}</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              {product.discount} OFF
            </span>
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Select Color: <span className="text-slate-800 font-extrabold">{selectedColor.name}</span>
            </span>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((col) => {
                const isActive = col.name === selectedColor.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                      isActive ? 'border-brand-orange scale-105 ring-4 ring-brand-orange/10' : 'border-slate-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isActive && (
                      <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Select Size: <span className="text-slate-800 font-extrabold">{selectedSize}</span></span>
              <button onClick={() => alert("Size Chart: Standard Regular Fit")} className="text-brand-orange hover:underline cursor-pointer">
                Size Chart
              </button>
            </div>
            <div className="flex items-center gap-2">
              {SIZE_OPTIONS.map((sz) => {
                const isActive = sz === selectedSize;
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-11 h-11 border text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                      isActive 
                        ? 'border-brand-orange bg-brand-orange text-white shadow-md' 
                        : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-white'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qty and CTA */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden h-12">
              <button
                onClick={() => {
                  if (selectedCartItem) {
                    handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity - 1);
                    return;
                  }
                  setQuantity(prev => Math.max(1, prev - 1));
                }}
                className="px-4 py-2 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                disabled={displayedQuantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black px-2 text-slate-900 w-10 text-center">
                {displayedQuantity}
              </span>
              <button
                onClick={() => {
                  if (selectedCartItem) {
                    handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity + 1);
                    return;
                  }
                  setQuantity(prev => prev + 1);
                }}
                className="px-4 py-2 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={Boolean(selectedCartItem)}
              className={`flex-1 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 h-12 ${
                selectedCartItem
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-orange hover:bg-orange-600 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {selectedCartItem ? 'Already in Shopping Bag' : 'Add to Shopping Bag'}
            </button>

            <button
              onClick={() => handleToggleWishlist(product.id.toString())}
              className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                likedProducts.includes(product.id.toString())
                  ? 'border-rose-200 bg-rose-50 text-rose-500'
                  : 'border-slate-200 text-slate-400 hover:text-slate-800'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Delivery & Policies Details */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600 mt-2">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-slate-800 text-[11px] uppercase tracking-wide">Free Shipping</span>
                <span className="text-slate-450 text-[10px] font-medium">Free express shipping on all orders over BDT 1500!</span>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-slate-800 text-[11px] uppercase tracking-wide">7 Days Return policy</span>
                <span className="text-slate-450 text-[10px] font-medium">Hassle-free sizing exchanges and standard refund guarantees.</span>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-black text-slate-800 text-[11px] uppercase tracking-wide">100% Genuine Fabrics</span>
                <span className="text-slate-450 text-[10px] font-medium">Crafted from top grade combed cotton (200 GSM) for regular use.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs description */}
      <div className="border-t border-slate-150 pt-8 mt-4">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-3">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-black uppercase tracking-wider pb-3 -mb-3.5 border-b-2 transition-all cursor-pointer ${
                activeTab === tab ? 'border-brand-orange text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-6 text-xs leading-relaxed text-slate-600">
          {activeTab === 'description' && (
            <div className="flex flex-col gap-4">
              <p>
                Experience premium comfort with our signature {product.name}. Designed for everyday wear, this piece is crafted from 100% combed cotton, rendering it incredibly soft, lightweight, and breathable even in humid climates.
              </p>
              <p>
                Features double-needle stitching on the neckband, sleeves, and hem for superior durability. Pre-shrunk to minimize shrinkage after washing, ensuring your favorite fits last.
              </p>
            </div>
          )}
          {activeTab === 'specifications' && (
            <div className="grid grid-cols-2 gap-4 max-w-md font-bold text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg">GSM: 200 Heavy Cotton</div>
              <div className="bg-slate-50 p-3 rounded-lg">Fabric: 100% Combed Cotton</div>
              <div className="bg-slate-50 p-3 rounded-lg">Fit: Regular European Fit</div>
              <div className="bg-slate-50 p-3 rounded-lg">Wash: Machine Pre-washed</div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-slate-800">Tanim Rahman</span>
                  <div className="flex text-amber-500"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                </div>
                <p className="text-slate-500 font-medium">Outstanding quality. The fabric feels really soft and thick, fit is perfect. Highly recommend!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Related Products Grid */}
      <section className="flex flex-col gap-6 w-full border-t border-slate-150 pt-12 mt-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
            Curated Recommendations
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            YOU MAY ALSO LIKE <span className="text-amber-500">.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((prod, idx) => {
            const isLiked = likedProducts.includes(prod.id.toString());
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col group relative"
              >
                {/* Wishlist Button */}
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
                      src={resolveImageUrl(prod.image)}
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

                  {/* Details Area */}
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
      </section>
    </div>
  );
}
