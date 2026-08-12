'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  User, 
  MapPin, 
  X, 
  Heart, 
  Plus, 
  Minus,
  Star,
  CheckCircle,
  Truck,
  Phone,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { useApp } from './context';
import { PRODUCTS } from './data';
import { 
  TSHIRT_PRODUCTS, 
  TSHIRT_PRODUCTS_SHUFFLED_1, 
  TSHIRT_PRODUCTS_SHUFFLED_2, 
  TSHIRT_PRODUCTS_SHUFFLED_3 
} from "./page";

// Helper lists to render header links
const NAV_ITEMS = [
  { name: 'MEN', target: 'all', columns: [['T-Shirts', 'Polo Shirts', 'Shirts'], ['Panjabi', 'Chinos', 'Denim'], ['Hoodies', 'Jackets', 'Accessories']] },
  { name: 'WOMEN', target: 'all', columns: [['T-Shirts', 'Tops', 'Tunics'], ['Casual Wear', 'Active Wear', 'New Arrivals'], ['Bags', 'Accessories', 'Gift Cards']] },
  { name: 'TEENS', target: 'all', columns: [['Graphic Tees', 'Oversized Tees', 'Polos'], ['Joggers', 'Denim', 'Shorts'], ['Trending Now', 'Essentials', 'Sale']] },
  { name: 'KIDS', target: 'kids', columns: [['Boys', 'Girls', 'Toddlers'], ['T-Shirts', 'Sets', 'Bottoms'], ['School Wear', 'Play Wear', 'Accessories']] },
  { name: 'SPORTS', target: 'jersey', columns: [['Football Jerseys', 'Fan Edition', 'Player Edition'], ['Argentina', 'Brazil', 'Club Jerseys'], ['Training Wear', 'Active Tees', 'Shorts']] }
];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    likedProducts,
    user,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    handleQuickAddToCart,
    handleToggleWishlist,
    handleRemoveFromCart,
    handleUpdateCartQty,
    systemConfig,
    isConfigLoading,
    resolveImageUrl
  } = useApp();

  const [showSearchSuggestions, setShowSearchSuggestions] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [isCheckoutSimulated, setIsCheckoutSimulated] = React.useState(false);
  const handleCategoryClick = (target: string) => {
    setActiveCategory(target);
    router.push(`/shop?category=${target}`);
  };
  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const shippingCost = cartSubtotal > 1500 || cartSubtotal === 0 ? 0 : 60;
  const cartTotal = cartSubtotal - discountAmount + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FABRILIFE10') {
      setDiscountPercent(10);
      alert('Promo code applied! You saved 10% off your purchase.');
    } else {
      alert('Invalid coupon code. Try "FABRILIFE10"');
    }
  };

  const handleCheckout = () => {
    setIsCheckoutSimulated(true);
    setTimeout(() => {
      setCart([]);
      setIsCheckoutSimulated(false);
      setIsCartOpen(false);
      setDiscountPercent(0);
      setPromoCode('');
      alert('Order placed successfully! Thank you for shopping with Fabrilife.');
    }, 2500);
  };

  const renderLogo = (isFooter = false) => {
    if (isConfigLoading || !systemConfig) {
      return (
        <div className={`h-8 w-28 rounded-md ${isFooter ? 'shimmer-effect' : 'shimmer-effect-light'}`} />
      );
    }
    if (systemConfig.logo) {
      return (
        <img 
          src={systemConfig.logo} 
          alt={systemConfig.title} 
          className="h-9 w-auto object-contain" 
        />
      );
    }
    const titleParts = systemConfig.title.split(' ');
    const firstPart = titleParts[0] || 'FABRI';
    const secondPart = titleParts.slice(1).join(' ') || 'LIFE';
    return (
      <>
        <svg viewBox="0 0 60 70" className="w-8 h-9 text-brand-orange group-hover:scale-105 transition-transform" fill="currentColor">
          <polygon points="5,38 35,8 45,18 15,48" />
          <polygon points="17,50 35,32 45,42 27,60" />
          <polygon points="29,66 39,56 39,66" />
        </svg>
        <div className="flex items-baseline text-2xl tracking-tighter">
          <span className={`font-extrabold ${isFooter ? 'text-white' : 'text-slate-950'}`}>{firstPart}</span>
          <span className={`font-light ${isFooter ? 'text-slate-300' : 'text-slate-500'}`}>{secondPart}</span>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner Message */}
      <div className="w-full bg-slate-950 text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-widest border-b border-slate-900 flex justify-center items-center gap-6">
        <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-amber-500" /> FREE SHIPPING ON ORDERS OVER BDT 1500!</span>
        <span className="hidden md:inline text-slate-500">•</span>
        <span className="hidden md:flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-amber-500" /> HOTLINE: {isConfigLoading || !systemConfig ? (
            <span className="h-3 w-24 shimmer-effect rounded inline-block" />
          ) : (
            systemConfig.phones[0]
          )}
        </span>
      </div>

      {/* Gorgeous Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex flex-col gap-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {renderLogo(false)}
          </Link>

           {/* Mega Menu Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-800">
            {NAV_ITEMS.map((nav) => (
              <div key={nav.name} className="relative group/nav py-2 cursor-pointer">
                <span 
                  onClick={() => handleCategoryClick(nav.target)}
                  className="hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {nav.name}
                </span>
                
                {/* Mega Dropdown Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3.5 w-[560px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 p-7 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 transform scale-95 translate-y-3 group-hover/nav:scale-100 group-hover/nav:translate-y-0 grid grid-cols-3 gap-6 z-50">
                  {nav.columns.map((col, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-4">
                      <h5 className="font-black text-[10px] text-slate-900 tracking-widest uppercase border-b-2 border-brand-orange/30 pb-1.5 self-start">
                        {cIdx === 0 ? 'Category' : cIdx === 1 ? 'Collections' : 'Trending'}
                      </h5>
                      <div className="flex flex-col gap-2.5">
                        {col.map((item) => (
                          <button
                            key={item}
                            onClick={() => handleCategoryClick(nav.target)}
                            className="text-left text-[11px] font-bold text-slate-500 hover:text-brand-orange transition-all duration-300 hover:translate-x-1.5 flex items-center gap-1.5 group/item cursor-pointer"
                          >
                            <span className="w-1 h-1 rounded-full bg-slate-350 bg-slate-300 group-hover/item:bg-brand-orange transition-colors" />
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Search bar */}
          <div className="flex-1 max-w-sm relative hidden md:block">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search premium apparel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-5">
            {/* Search Toggle for Mobile */}
            <button className="md:hidden flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer">
              <Search className="w-5.5 h-5.5 stroke-[1.5]" />
              <span className="text-[9px] font-bold tracking-wide uppercase text-slate-500">Search</span>
            </button>

            {/* Outlet Stores */}
            <Link
              href="/stores"
              aria-current={pathname === '/stores' ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer group ${pathname === '/stores' ? 'text-brand-orange' : 'text-slate-700 hover:text-brand-orange'}`}
            >
              <MapPin className="w-5.5 h-5.5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              <span className={`text-[9px] font-bold tracking-wide uppercase group-hover:text-slate-800 ${pathname === '/stores' ? 'text-brand-orange' : 'text-slate-500'}`}>Stores</span>
            </Link>

            {/* Profile */}
            <Link 
              href={user ? "/profile" : "/login"}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group text-center"
            >
              <User className="w-5.5 h-5.5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">
                {user ? user.name.split(' ')[0] : 'Profile'}
              </span>
            </Link>

            {/* Wishlist */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <div className="relative">
                <Heart className={`w-5.5 h-5.5 stroke-[1.5] group-hover:scale-105 transition-transform ${likedProducts.length > 0 ? 'fill-brand-orange text-brand-orange' : ''}`} />
                {likedProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-orange text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {likedProducts.length}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">Wishlist</span>
            </button>

            {/* Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <div className="relative">
                <ShoppingBag className="w-5.5 h-5.5 stroke-[1.5] group-hover:scale-105 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">Bag</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-2 pb-6 md:pt-4 md:pb-8 flex flex-col gap-3">
        {children}
      </main>

      {/* Gorgeous Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-900 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {renderLogo(true)}
            </div>
            <p className="text-slate-400 font-light leading-relaxed">
              Premium clothing e-commerce retail store. Experience the finest combed cotton fabrics, refined tailoring, and modern designs for your everyday lifestyle.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-2">
              {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social) => (
                <button
                  key={social}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-orange hover:text-brand-orange text-slate-400 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  title={social}
                >
                  <span className="text-[10px] font-bold">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Collections */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-brand-orange pl-3">
              Shop Collections
            </h4>
            <div className="flex flex-col gap-2.5 font-medium pl-3">
              {['Men Wear', 'Women Clothing', 'Teen Collection', 'Kids Playwear', 'Sports Jersey'].map((item) => (
                <button
                  key={item}
                  className="text-left hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-brand-orange pl-3">
              Customer Policies
            </h4>
            <div className="flex flex-col gap-2.5 font-medium pl-3">
              {['7-Day Free Exchange', 'Cash On Delivery terms', 'Refund & Returns Policy', 'Track Your Order', 'Help Center'].map((item) => (
                <button
                  key={item}
                  className="text-left hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter / Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-brand-orange pl-3">
              Contact & Updates
            </h4>
            <p className="text-xs text-slate-400 font-light pl-3">
              Subscribe to get special discount coupons, restock alerts, and seasonal launches!
            </p>
            
            {/* Newsletter Input */}
            <div className="flex pl-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-900 border border-slate-800 rounded-l-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-orange text-white placeholder-slate-500"
              />
              <button className="bg-brand-orange hover:bg-orange-600 text-slate-950 px-3 rounded-r-lg font-bold text-xs transition-colors cursor-pointer">
                JOIN
              </button>
            </div>
            
            {/* Contact Details */}
            <div className="flex flex-col gap-2 text-xs pl-3 mt-2 text-slate-400 font-light">
              {isConfigLoading || !systemConfig ? (
                <>
                  <div className="h-3 w-32 shimmer-effect rounded" />
                  <div className="h-3 w-40 shimmer-effect rounded" />
                  <div className="h-3 w-48 shimmer-effect rounded" />
                </>
              ) : (
                <>
                  {systemConfig.phones && systemConfig.phones.length > 0 && (
                    <span>Helpline: {systemConfig.phones.join(', ')}</span>
                  )}
                  {systemConfig.emails && systemConfig.emails.length > 0 && (
                    <span>Email: {systemConfig.emails.join(', ')}</span>
                  )}
                  {systemConfig.address && (
                    <span>Address: {systemConfig.address}</span>
                  )}
                  {systemConfig.google_map && (
                    <a 
                      href={systemConfig.google_map} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-brand-orange hover:text-orange-400 font-bold transition-colors mt-1"
                    >
                      <MapPin className="w-3.5 h-3.5" /> View Google Map
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <div>
            {isConfigLoading || !systemConfig ? (
              <div className="h-3.5 w-64 shimmer-effect rounded" />
            ) : (
              `© 2026 ${systemConfig.title}. All rights reserved. ${systemConfig.address || 'Dhaka, Bangladesh'}.`
            )}
          </div>
          
          {/* Payment Partners */}
          <div className="flex items-center gap-4 opacity-50 hover:opacity-85 transition-opacity duration-300">
            {['bKash', 'Nagad', 'Rocket', 'Visa', 'Mastercard'].map((pay) => (
              <span
                key={pay}
                className="bg-slate-900 border border-slate-800 text-[10px] font-black px-2 py-1 rounded text-white tracking-wider"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* Animated Right-Side Off-Canvas Wishlist Drawer */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isWishlistOpen ? 'visible' : 'invisible delay-300'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
            isWishlistOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsWishlistOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
            isWishlistOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="font-extrabold text-slate-900 tracking-tight">YOUR WISHLIST</span>
              <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {likedProducts.length}
              </span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {likedProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
                  <Heart className="w-8 h-8 text-slate-350" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Explore our collections and tap the heart icon on any product to save it here!
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer uppercase tracking-wider"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              likedProducts.map((likedId) => {
                const prod = [...TSHIRT_PRODUCTS, ...TSHIRT_PRODUCTS_SHUFFLED_1, ...TSHIRT_PRODUCTS_SHUFFLED_2, ...TSHIRT_PRODUCTS_SHUFFLED_3].find(
                  (p) => p.id.toString() === likedId
                );
                if (!prod) return null;

                return (
                  <div key={likedId} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 items-center">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-slate-200/60">
                      <img
                        src={resolveImageUrl(prod.image)}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info details */}
                    <div className="flex-1 flex flex-col gap-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                      <span className="text-xs font-black text-slate-900 mt-1">
                        BDT {prod.price}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          handleQuickAddToCart(prod);
                          handleToggleWishlist(likedId);
                          setIsWishlistOpen(false);
                        }}
                        className="bg-brand-orange hover:bg-orange-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 cursor-pointer whitespace-nowrap"
                      >
                        ADD TO BAG
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(likedId)}
                        className="text-slate-450 hover:text-red-550 hover:text-red-550 text-[10px] font-bold py-1 px-2.5 border border-slate-205 border-slate-200 hover:border-red-200 rounded-lg bg-white transition-all duration-300 cursor-pointer"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Animated Right-Side Off-Canvas Cart Drawer */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible delay-300'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
            isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsCartOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-orange" />
              <span className="font-extrabold text-slate-900 tracking-tight">YOUR SHOPPING BAG</span>
              <span className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Looks like you haven&apos;t added anything to your bag yet. Let&apos;s find some amazing style for you!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer uppercase tracking-wider"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="w-16 h-20 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-slate-200/60">
                    {item.image ? (
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: item.colorHex }}
                      />
                    )}
                    <span className="absolute top-1 left-1 bg-slate-900/65 backdrop-blur-xs text-white text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-widest z-10">
                      {item.size}
                    </span>
                    <div 
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-xs z-10"
                      style={{ backgroundColor: item.colorHex }}
                      title={item.colorName}
                    />
                  </div>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-all duration-300 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Size: {item.size}</span>
                        <span className="text-slate-300">•</span>
                        <span>Color: {item.colorName}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Qty selectors */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-55 text-slate-500 transition-colors cursor-pointer"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2.5 text-slate-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-55 text-slate-500 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">
                          BDT {item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer controls & summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (FABRILIFE10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 uppercase placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Apply
                </button>
              </form>

              {/* Pricing breakdown */}
              <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 border-b border-slate-200 pb-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900">BDT {cartSubtotal}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- BDT {discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="text-slate-900">
                    {shippingCost === 0 ? 'FREE' : `BDT ${shippingCost}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-sm font-black text-slate-900 py-1">
                <span>ESTIMATED TOTAL</span>
                <span className="text-lg text-brand-orange font-black">BDT {cartTotal}</span>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={isCheckoutSimulated}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isCheckoutSimulated ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>PROCESSING ORDER...</span>
                  </>
                ) : (
                  <>
                    <span>PROCEED TO CHECKOUT</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
