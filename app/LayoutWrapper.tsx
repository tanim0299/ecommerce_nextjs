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
  PackageSearch,
  Smartphone,
  Menu,
  ChevronRight,
  ChevronDown,
  Mic
} from 'lucide-react';
import { useApp } from './context';

type WishlistPrice = number | string | null;

interface WishlistProduct {
  id: number;
  name?: string;
  slug?: string;
  sku?: string;
  sale_price?: WishlistPrice;
  regular_price?: WishlistPrice;
  discount_price?: WishlistPrice;
  has_variant?: boolean;
  images?: Array<{ url?: string; type?: string }>;
  variants?: Array<{ id: number; sku?: string }>;
  brand?: { name?: string } | null;
}

const wishlistNumericPrice = (value?: WishlistPrice) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatWishlistPrice = (value: number) => new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 2,
}).format(value);

function getDiceSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length < 2 || str2.length < 2) return 0;
  const getBigrams = (str: string) => {
    const bigrams = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
  };
  const b1 = getBigrams(str1);
  const b2 = getBigrams(str2);
  let intersection = 0;
  const used = new Set<number>();
  for (let i = 0; i < b1.length; i++) {
    for (let j = 0; j < b2.length; j++) {
      if (b1[i] === b2[j] && !used.has(j)) {
        intersection++;
        used.add(j);
        break;
      }
    }
  }
  return (2.0 * intersection) / (b1.length + b2.length);
}

function calculateSimilarity(productName: string, query: string): number {
  const normName = productName.toLowerCase().trim();
  const normQuery = query.toLowerCase().trim();
  if (!normName || !normQuery) return 0;
  if (normName.includes(normQuery)) return 1.0;
  
  const queryWords = normQuery.split(/\s+/).filter(Boolean);
  const nameWords = normName.split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return 0;
  
  let matchCount = 0;
  for (const qWord of queryWords) {
    let found = false;
    for (const nWord of nameWords) {
      if (nWord.includes(qWord) || qWord.includes(nWord)) {
        found = true;
        break;
      }
    }
    if (found) {
      matchCount++;
    } else {
      let maxWordSim = 0;
      for (const nWord of nameWords) {
        const sim = getDiceSimilarity(qWord, nWord);
        if (sim > maxWordSim) maxWordSim = sim;
      }
      matchCount += maxWordSim;
    }
  }
  return matchCount / queryWords.length;
}

function isProductMatch(product: WishlistProduct, query: string): boolean {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return false;
  
  // 1. Check SKU match
  if (product.sku && product.sku.toLowerCase().includes(normQuery)) return true;
  if (product.variants && product.variants.some(v => v.sku && v.sku.toLowerCase().includes(normQuery))) return true;
  
  // 2. Check Name similarity (>= 40% similarity)
  if (product.name) {
    const similarity = calculateSimilarity(product.name, normQuery);
    if (similarity >= 0.40) return true;
  }
  
  return false;
}


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
    resolveImageUrl,
    isBagShaking
  } = useApp();

  const [showSearchSuggestions, setShowSearchSuggestions] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [isCheckoutSimulated, setIsCheckoutSimulated] = React.useState(false);
  const [apiItems, setApiItems] = React.useState<any[]>([]);
  const [apiCategories, setApiCategories] = React.useState<any[]>([]);
  const [apiSubCategories, setApiSubCategories] = React.useState<any[]>([]);
  const [apiPages, setApiPages] = React.useState<any[]>([]);
  const [apiProducts, setApiProducts] = React.useState<WishlistProduct[]>([]);
  const [isWishlistProductsLoading, setIsWishlistProductsLoading] = React.useState(true);

  const desktopSearchRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchRef = React.useRef<HTMLDivElement>(null);
  const drawerSearchRef = React.useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = React.useState(false);
  const [headerAvatar, setHeaderAvatar] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      if (user.avatar) {
        setHeaderAvatar(resolveImageUrl(user.avatar));
      } else {
        setHeaderAvatar(localStorage.getItem('user_avatar'));
      }
    } else {
      setHeaderAvatar(null);
    }
  }, [user, resolveImageUrl]);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setSearchQuery(transcript);
        setShowSearchSuggestions(true);
        handleSearchSubmit(transcript);
      }
    };

    recognition.start();
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<{[key: number]: boolean}>({});
  const [expandedCategories, setExpandedCategories] = React.useState<{[key: number]: boolean}>({});

  const toggleExpandedItem = (id: number) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) &&
        (drawerSearchRef.current && !drawerSearchRef.current.contains(event.target as Node))
      ) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dynamically update document title and favicon based on systemConfig and current page
  React.useEffect(() => {
    const siteTitle = systemConfig?.title || 'SLOOR';
    
    const pageTitles: Record<string, string> = {
      '/': `${siteTitle} | Affordable Luxury & Style`,
      '/shop': `Shop Collections | ${siteTitle}`,
      '/login': `Sign In | ${siteTitle}`,
      '/signup': `Create Account | ${siteTitle}`,
      '/checkout': `Secure Checkout | ${siteTitle}`,
      '/profile': `My Profile | ${siteTitle}`,
      '/track-order': `Track Order | ${siteTitle}`,
      '/stores': `Store Outlets | ${siteTitle}`,
      '/contact': `Contact Us | ${siteTitle}`,
      '/about': `About Us | ${siteTitle}`,
      '/privacy-policy': `Privacy Policy | ${siteTitle}`,
      '/terms': `Terms & Conditions | ${siteTitle}`,
    };

    let title = pageTitles[pathname];
    if (!title) {
      if (pathname.startsWith('/product/')) {
        title = `Product Details | ${siteTitle}`;
      } else {
        const routeName = pathname.replace(/^\//, '').replace(/-/g, ' ');
        const formattedName = routeName.charAt(0).toUpperCase() + routeName.slice(1);
        title = `${formattedName} | ${siteTitle}`;
      }
    }

    document.title = title;

    if (systemConfig?.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = systemConfig.favicon;
    }
  }, [pathname, systemConfig]);

  const matchedSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return apiProducts.filter(product => isProductMatch(product, searchQuery)).slice(0, 10);
  }, [apiProducts, searchQuery]);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      setShowSearchSuggestions(false);
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const renderSearchSuggestions = () => {
    if (!showSearchSuggestions || !searchQuery.trim()) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-150 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden z-50 max-h-[380px] overflow-y-auto animate-slide-up">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Products found ({matchedSuggestions.length})</span>
          {matchedSuggestions.length > 0 && (
            <span className="text-[9px] font-semibold text-slate-400">Press Enter to see all</span>
          )}
        </div>
        {matchedSuggestions.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs font-semibold text-slate-500">
            No products found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="flex flex-col">
            {matchedSuggestions.map((prod) => {
              const mainImage = prod.images?.[0]?.url || '';
              const salePrice = wishlistNumericPrice(prod.sale_price) ?? wishlistNumericPrice(prod.discount_price) ?? wishlistNumericPrice(prod.regular_price);
              const regularPrice = wishlistNumericPrice(prod.regular_price);
              const hasDiscount = salePrice && regularPrice && regularPrice > salePrice;
              return (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug || prod.id}`}
                  onClick={() => {
                    setShowSearchSuggestions(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img 
                      src={mainImage ? resolveImageUrl(mainImage) : '/placeholder.jpg'} 
                      alt={prod.name || ''} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-orange transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                      SKU: {prod.sku || prod.variants?.[0]?.sku || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {salePrice !== null && (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-slate-900">BDT {salePrice}</span>
                        {hasDiscount && (
                          <span className="text-[9px] font-bold text-slate-400 line-through">BDT {regularPrice}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  const toggleExpandedCategory = (id: number) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    const fetchApiItems = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/items`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            // Sort by sl
            const sorted = [...json.data].sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setApiItems(sorted);
          }
        }
      } catch (e) {
        console.error('Failed to fetch items from API:', e);
      }
    };
    const fetchApiCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            // Sort by sl
            const sorted = [...json.data].sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setApiCategories(sorted);
          }
        }
      } catch (e) {
        console.error('Failed to fetch categories from API:', e);
      }
    };
    const fetchApiSubCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/sub-categories`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            // Sort by sl
            const sorted = [...json.data].sort((a, b) => (a.sl || 0) - (b.sl || 0));
            setApiSubCategories(sorted);
          }
        }
      } catch (e) {
        console.error('Failed to fetch sub-categories from API:', e);
      }
    };
    const fetchApiProducts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/products`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            setApiProducts(json.data as WishlistProduct[]);
          }
        }
      } catch (e) {
        console.error('Failed to fetch wishlist products from API:', e);
      } finally {
        setIsWishlistProductsLoading(false);
      }
    };
    const fetchApiPages = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/pages`);
        if (res.ok) {
          const json = await res.json();
          const items = json.result || json.data || [];
          if (Array.isArray(items)) {
            setApiPages(items);
          }
        }
      } catch (e) {
        console.error('Failed to fetch pages from API:', e);
      }
    };
    fetchApiItems();
    fetchApiCategories();
    fetchApiSubCategories();
    fetchApiProducts();
    fetchApiPages();
  }, []);

  const wishlistProducts = likedProducts
    .map(likedId => apiProducts.find(product => product.id.toString() === likedId))
    .filter((product): product is WishlistProduct => Boolean(product));

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
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const renderLogo = (isFooter = false) => {
    if (isConfigLoading || !systemConfig) {
      return (
        <div className={`h-10 sm:h-12 w-32 sm:w-44 rounded-md ${isFooter ? 'shimmer-effect' : 'shimmer-effect-light'}`} />
      );
    }
    if (systemConfig.logo) {
      return (
        <img 
          src={systemConfig.logo} 
          alt={systemConfig.title} 
          className={isFooter 
            ? "h-12 sm:h-14 md:h-16 w-auto max-w-[240px] md:max-w-[280px] object-contain transition-all" 
            : "h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[200px] sm:max-w-[260px] md:max-w-[300px] object-contain transition-all"
          } 
        />
      );
    }
    const titleParts = systemConfig.title.split(' ');
    const firstPart = titleParts[0] || 'FABRI';
    const secondPart = titleParts.slice(1).join(' ') || 'LIFE';
    return (
      <>
        <svg viewBox="0 0 60 70" className="w-7 h-8 text-brand-orange group-hover:scale-105 transition-transform" fill="currentColor">
          <polygon points="5,38 35,8 45,18 15,48" />
          <polygon points="17,50 35,32 45,42 27,60" />
          <polygon points="29,66 39,56 39,66" />
        </svg>
        <div className="flex items-baseline text-2xl tracking-tight">
          <span className={`font-extrabold ${isFooter ? 'text-white' : 'text-slate-950'}`}>{firstPart}</span>
          <span className={`font-light ${isFooter ? 'text-slate-300' : 'text-slate-500'}`}>{secondPart}</span>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner Message */}
      <div className="w-full bg-slate-950 text-white py-1 px-4 text-center text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-900 flex justify-center items-center gap-4">
        <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-amber-500" /> FREE SHIPPING ON ORDERS OVER BDT 1500!</span>
        <span className="hidden md:inline text-slate-600">•</span>
        <span className="hidden md:flex items-center gap-1">
          <Phone className="w-3 h-3 text-amber-500" /> HOTLINE: {isConfigLoading || !systemConfig ? (
            <span className="h-2.5 w-20 shimmer-effect rounded inline-block" />
          ) : (
            systemConfig.phones[0]
          )}
        </span>
      </div>

      {/* Gorgeous Compact Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-150 px-4 sm:px-6 py-2 flex flex-col gap-1.5 shadow-xs">
        {/* First Row: Logo, Search, Actions */}
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center text-slate-700 hover:text-brand-orange p-1 transition-colors cursor-pointer"
              title="Menu"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              {renderLogo(false)}
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl relative hidden md:block" ref={desktopSearchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search premium apparel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-9 py-1.5 text-[11px] font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-all"
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                title="Search by voice"
              >
                <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </button>
              {renderSearchSuggestions()}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Search Toggle for Mobile */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
              <span className="text-[8.5px] font-bold tracking-wide uppercase text-slate-500">Search</span>
            </button>

            {/* Outlet Stores */}
            <Link
              href="/stores"
              aria-current={pathname === '/stores' ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer group ${pathname === '/stores' ? 'text-brand-orange' : 'text-slate-700 hover:text-brand-orange'}`}
            >
              <MapPin className="w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              <span className={`text-[8.5px] font-bold tracking-wide uppercase group-hover:text-slate-800 ${pathname === '/stores' ? 'text-brand-orange' : 'text-slate-500'}`}>Stores</span>
            </Link>

            {/* Profile */}
            <Link 
              href={user ? "/profile" : "/login"}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group text-center"
            >
              {headerAvatar ? (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform flex items-center justify-center bg-slate-100 flex-shrink-0">
                  <img 
                    src={headerAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <User className="w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              )}
              <span className="text-[8.5px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">
                {user ? user.name.split(' ')[0] : 'Profile'}
              </span>
            </Link>

            {/* Wishlist */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <div className="relative">
                <Heart className={`w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform ${likedProducts.length > 0 ? 'fill-brand-orange text-brand-orange' : ''}`} />
                {likedProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-orange text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {likedProducts.length}
                  </span>
                )}
              </div>
              <span className="text-[8.5px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">Wishlist</span>
            </button>

            {/* Bag */}
            <button
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className={`flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-all cursor-pointer group ${
                isBagShaking ? 'animate-cart-shake text-brand-orange scale-105' : ''
              }`}
            >
              <div className="relative">
                <ShoppingBag className={`w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform ${
                  isBagShaking ? 'text-brand-orange scale-110' : ''
                }`} />
                {cart.length > 0 && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-orange text-white text-[8px] font-bold rounded-full flex items-center justify-center transition-all ${
                    isBagShaking ? 'animate-bounce ring-2 ring-orange-300' : ''
                  }`}>
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </div>
              <span className={`text-[8.5px] font-bold tracking-wide uppercase group-hover:text-slate-800 ${
                isBagShaking ? 'text-brand-orange font-black' : 'text-slate-500'
              }`}>Bag</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Row (Toggled) */}
        {isMobileSearchOpen && (
          <div className="w-full md:hidden px-2 pb-1 bg-white" ref={mobileSearchRef}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                title="Search by voice"
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </button>
              {renderSearchSuggestions()}
            </div>
          </div>
        )}

        {/* Second Row: Mega Menu Navigation Centered */}
        <div className="w-full hidden lg:flex justify-center border-t border-slate-100 pt-1">
          <nav className="flex items-center gap-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
            {apiItems
              .filter((item) => item.is_show_header == 1 || item.is_show_header === true)
              .map((item) => {
                const itemCategories = apiCategories.filter(
                  (cat) => cat.item?.id === item.id && (cat.is_show_header == 1 || cat.is_show_header === true)
                );
                
                const hasAnySubCategories = itemCategories.some((cat) =>
                  apiSubCategories.some(
                    (sub) =>
                      sub.category?.id === cat.id &&
                      sub.item?.id === item.id &&
                      (sub.is_show_header == 1 || sub.is_show_header === true)
                  )
                );

                return (
                  <div key={item.id} className="relative group/nav py-1.5 cursor-pointer">
                    <span 
                      onClick={() => handleCategoryClick(item.slug || (item.name || '').toLowerCase())}
                      className="hover:text-brand-orange transition-colors flex items-center gap-1 group-hover/nav:text-brand-orange"
                    >
                      <span>{item.name}</span>
                      {itemCategories.length > 0 && (
                        <ChevronDown className="w-3 h-3 text-slate-400 group-hover/nav:text-brand-orange group-hover/nav:rotate-180 transition-transform duration-300 stroke-[2.5]" />
                      )}
                    </span>
                    
                    {itemCategories.length > 0 && (
                      !hasAnySubCategories ? (
                        /* Case 1: Simple Elegant List Dropdown */
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] border border-slate-100/90 py-2 px-1.5 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 transform scale-95 translate-y-1.5 group-hover/nav:scale-100 group-hover/nav:translate-y-0 flex flex-col min-w-[170px] z-50">
                          {itemCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleCategoryClick(cat.slug || (cat.name || '').toLowerCase())}
                              className="flex items-center justify-between px-3.5 py-2 text-left text-[11px] font-bold text-slate-700 hover:text-brand-orange hover:bg-slate-50/80 rounded-lg transition-all duration-200 cursor-pointer group/cat"
                            >
                              <span>{cat.name}</span>
                              <ChevronRight className="w-3 h-3 text-slate-300 group-hover/cat:text-brand-orange group-hover/cat:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Case 2: Multi-Column Mega Menu */
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 p-6 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 transform scale-95 translate-y-3 group-hover/nav:scale-100 group-hover/nav:translate-y-0 flex gap-8 z-50 min-w-[200px]">
                          {itemCategories.map((cat) => {
                            const catSubCategories = apiSubCategories
                              .filter((sub) => sub.category?.id === cat.id && sub.item?.id === item.id && (sub.is_show_header == 1 || sub.is_show_header === true))
                              .sort((a, b) => (a.sl || 0) - (b.sl || 0));

                            return (
                              <div key={cat.id} className="flex flex-col gap-3 min-w-[130px]">
                                <h5 
                                  onClick={() => handleCategoryClick(cat.slug || (cat.name || '').toLowerCase())}
                                  className="font-black text-[10.5px] text-slate-900 tracking-widest uppercase border-b-2 border-brand-orange/30 pb-1.5 self-start hover:text-brand-orange transition-colors cursor-pointer"
                                >
                                  {cat.name}
                                </h5>
                                {catSubCategories.length > 0 && (
                                  <div className="flex flex-col gap-2">
                                    {catSubCategories.map((sub: any) => (
                                      <button
                                        key={sub.id}
                                        onClick={() => handleCategoryClick(sub.slug || (sub.name || '').toLowerCase())}
                                        className="text-left text-[11px] font-bold text-slate-500 hover:text-brand-orange transition-all duration-200 hover:translate-x-1 flex items-center gap-1.5 group/item cursor-pointer"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-slate-300 group-hover/item:bg-brand-orange transition-colors" />
                                        {sub.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            <Link
              href="/track-order"
              aria-current={pathname === '/track-order' ? 'page' : undefined}
              className={`flex items-center gap-1.5 py-1.5 transition-colors ${
                pathname === '/track-order' ? 'text-brand-orange' : 'hover:text-brand-orange'
              }`}
            >
              <PackageSearch className="h-3.5 w-3.5" />
              Track Order
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className={`flex-1 w-full flex flex-col ${pathname === '/' ? 'pb-6 md:pb-8' : 'max-w-7xl mx-auto px-4 pt-2 pb-6 md:pt-4 md:pb-8 gap-3'}`}>
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
            <div className="flex flex-col gap-2.5 font-medium pl-3 text-xs">
              {apiItems && apiItems.length > 0 ? (
                apiItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop?item=${item.slug || encodeURIComponent((item.name || '').toLowerCase())}`}
                    className="text-left text-slate-300 hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                ['Sneakers', 'Slides', "Men's Outfit", 'Watches', 'Accessories'].map((item) => (
                  <Link
                    key={item}
                    href={`/shop?item=${encodeURIComponent(item.toLowerCase())}`}
                    className="text-left text-slate-300 hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {item}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-brand-orange pl-3">
              Customer Policies
            </h4>
            <div className="flex flex-col gap-2.5 font-medium pl-3 text-xs">
              {apiPages && apiPages.length > 0 ? (
                apiPages.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/pages/${p.slug}`}
                    className="text-left text-slate-300 hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {p.title}
                  </Link>
                ))
              ) : (
                ['7-Day Free Exchange', 'Cash On Delivery terms', 'Refund & Returns Policy'].map((item) => (
                  <Link
                    key={item}
                    href={`/pages/${encodeURIComponent(item.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`}
                    className="text-left text-slate-300 hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                  >
                    {item}
                  </Link>
                ))
              )}
              <Link href="/track-order" className="text-left text-slate-300 hover:text-brand-orange transform hover:translate-x-1 transition-all duration-300 cursor-pointer">
                Track Your Order
              </Link>
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

      {/* Fixed Floating Cart Button on Right Side */}
      <button
        id="floating-cart-btn"
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Open Shopping Bag"
        title="Open Shopping Bag"
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center bg-slate-950/95 hover:bg-black text-white py-3.5 px-3 rounded-l-2xl shadow-2xl border-l border-y border-white/15 backdrop-blur-md transition-all duration-300 hover:-translate-x-1.5 hover:shadow-orange-500/20 group cursor-pointer ${
          isCartOpen ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100'
        } ${isBagShaking ? 'animate-cart-shake ring-4 ring-brand-orange/60 shadow-[0_0_35px_rgba(249,115,22,0.65)] !bg-slate-900' : ''}`}
      >
        {/* Shopping Bag Icon with animated count badge */}
        <div className="relative mb-1 flex items-center justify-center">
          <ShoppingBag className={`w-5.5 h-5.5 text-brand-orange group-hover:scale-110 transition-transform duration-200 stroke-[2] ${
            isBagShaking ? 'scale-125' : ''
          }`} />
          {cart.length > 0 && (
            <span className={`absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-brand-orange text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950 transition-all ${
              isBagShaking ? 'animate-bounce ring-orange-300 scale-110' : ''
            }`}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>

        {/* Text / Item counter */}
        <span className={`text-[10px] font-extrabold tracking-wider uppercase leading-tight transition-colors ${
          isBagShaking ? 'text-brand-orange' : 'text-slate-200 group-hover:text-white'
        }`}>
          {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'ITEM' : 'ITEMS'}
        </span>

        {/* Price Subtotal Pill */}
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-black tracking-tight shadow-xs whitespace-nowrap group-hover:brightness-110 transition-all">
          ৳{cartSubtotal}
        </span>
      </button>

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
            {isWishlistProductsLoading && likedProducts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: Math.min(likedProducts.length, 4) }).map((_, index) => (
                  <div key={index} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="h-20 w-16 animate-pulse rounded-lg bg-slate-200" />
                    <div className="flex flex-1 flex-col gap-2 py-1">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="mt-auto h-3 w-20 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : likedProducts.length === 0 ? (
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
              wishlistProducts.map((prod) => {
                const likedId = prod.id.toString();
                const galleryImages = (prod.images ?? [])
                  .filter(image => image.type?.toLocaleLowerCase() === 'gallery' && image.url)
                  .map(image => image.url as string);
                const image = galleryImages[0] || prod.images?.find(item => item.url)?.url || '';
                const salePrice = wishlistNumericPrice(prod.sale_price)
                  ?? wishlistNumericPrice(prod.discount_price)
                  ?? wishlistNumericPrice(prod.regular_price);
                const regularPrice = wishlistNumericPrice(prod.regular_price);
                const hasDiscount = salePrice !== null && regularPrice !== null && regularPrice > salePrice;
                const hasVariants = Boolean(prod.has_variant || (prod.variants?.length ?? 0) > 0);

                return (
                  <div key={likedId} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 items-center">
                    {/* Thumbnail */}
                    <Link
                      href={`/product/${prod.slug || prod.id}`}
                      onClick={() => setIsWishlistOpen(false)}
                      className="w-16 h-20 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-slate-200/60"
                    >
                      {image && (
                        <img
                          src={resolveImageUrl(image)}
                          alt={prod.name || 'Product'}
                          className="w-full h-full object-contain p-1"
                        />
                      )}
                    </Link>

                    {/* Info details */}
                    <div className="flex-1 flex flex-col gap-1">
                      {prod.brand?.name && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">{prod.brand.name}</span>
                      )}
                      <Link
                        href={`/product/${prod.slug || prod.id}`}
                        onClick={() => setIsWishlistOpen(false)}
                        className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-brand-orange"
                      >
                        {prod.name}
                      </Link>
                      {salePrice !== null && (
                        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                          {hasDiscount && regularPrice !== null && (
                            <span className="text-[9px] font-bold text-slate-400 line-through">BDT {formatWishlistPrice(regularPrice)}</span>
                          )}
                          <span className="text-xs font-black text-slate-900">BDT {formatWishlistPrice(salePrice)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          if (hasVariants) {
                            setIsWishlistOpen(false);
                            router.push(`/product/${prod.slug || prod.id}`);
                          } else {
                            handleQuickAddToCart({
                              ...prod,
                              price: salePrice ?? 0,
                              image: image ? resolveImageUrl(image) : '',
                            }, e);
                            handleToggleWishlist(likedId);
                            setIsWishlistOpen(false);
                          }
                        }}
                        className="bg-brand-orange hover:bg-orange-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 cursor-pointer whitespace-nowrap"
                      >
                        {hasVariants ? 'CHOOSE OPTIONS' : 'ADD TO BAG'}
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
      {/* Mobile Off-Canvas Menu Drawer (Left Side) */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible delay-300'}`}>
        {/* Backdrop overlay */}
        <div 
          className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer container (slides from left) */}
        <div className={`absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              {systemConfig?.logo ? (
                <img src={systemConfig.logo} alt={systemConfig.title} className="h-10 w-auto max-w-[170px] object-contain" />
              ) : (
                <span className="font-extrabold text-slate-950 text-base tracking-tighter">{systemConfig?.title || 'BELIEVERS'}</span>
              )}
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-400 hover:text-slate-950 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable List) */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Search input for mobile inside drawer */}
            <div className="relative w-full" ref={drawerSearchRef}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search premium apparel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-all"
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
                title="Search by voice"
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </button>
              {renderSearchSuggestions()}
            </div>

            {/* Menu Items Accordion */}
            <div className="flex flex-col gap-2.5 mt-2">
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-black uppercase tracking-wide transition-colors ${
                  pathname === '/track-order'
                    ? 'border-orange-200 bg-orange-50 text-brand-orange'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-orange-200 hover:text-brand-orange'
                }`}
              >
                <PackageSearch className="h-5 w-5" />
                Track Order
              </Link>
              {apiItems
                .filter((item) => item.is_show_header == 1 || item.is_show_header === true)
                .map((item) => {
                  const itemCategories = apiCategories.filter(
                    (cat) => cat.item?.id === item.id && (cat.is_show_header == 1 || cat.is_show_header === true)
                  );
                  const isItemExpanded = expandedItems[item.id] || false;

                  return (
                    <div key={item.id} className="border-b border-slate-100 pb-2.5">
                      {/* Item Header */}
                      <div className="flex justify-between items-center py-1.5">
                        <button
                          onClick={() => {
                            handleCategoryClick(item.slug || (item.name || '').toLowerCase());
                            setIsMobileMenuOpen(false);
                          }}
                          className="text-left font-black text-sm text-slate-800 hover:text-brand-orange uppercase tracking-wide cursor-pointer flex-1"
                        >
                          {item.name}
                        </button>
                        {itemCategories.length > 0 && (
                          <button
                            onClick={() => toggleExpandedItem(item.id)}
                            className="p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-800 cursor-pointer"
                          >
                            {isItemExpanded ? (
                              <ChevronDown className="w-4 h-4 stroke-[2]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 stroke-[2]" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Categories (Accordion item content) */}
                      {isItemExpanded && itemCategories.length > 0 && (
                        <div className="pl-3 mt-1.5 flex flex-col gap-2 border-l border-slate-200">
                          {itemCategories.map((cat) => {
                            const catSubCategories = apiSubCategories.filter(
                              (sub) => sub.category?.id === cat.id && sub.item?.id === item.id && (sub.is_show_header == 1 || sub.is_show_header === true)
                            ).sort((a, b) => (a.sl || 0) - (b.sl || 0));
                            const isCatExpanded = expandedCategories[cat.id] || false;

                            return (
                              <div key={cat.id} className="flex flex-col">
                                <div className="flex justify-between items-center py-1">
                                  <button
                                    onClick={() => {
                                      handleCategoryClick(cat.slug || (cat.name || '').toLowerCase());
                                      setIsMobileMenuOpen(false);
                                    }}
                                    className="text-left font-bold text-xs text-slate-600 hover:text-brand-orange uppercase tracking-wide cursor-pointer flex-1"
                                  >
                                    {cat.name}
                                  </button>
                                  {catSubCategories.length > 0 && (
                                    <button
                                      onClick={() => toggleExpandedCategory(cat.id)}
                                      className="p-1 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                                    >
                                      {isCatExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Subcategories */}
                                {isCatExpanded && catSubCategories.length > 0 && (
                                  <div className="pl-3 mt-1 flex flex-col gap-1.5 border-l border-slate-200">
                                    {catSubCategories.map((sub) => (
                                      <button
                                        key={sub.id}
                                        onClick={() => {
                                          handleCategoryClick(sub.slug || (sub.name || '').toLowerCase());
                                          setIsMobileMenuOpen(false);
                                        }}
                                        className="text-left font-semibold text-[11px] text-slate-500 hover:text-brand-orange transition-colors py-0.5 cursor-pointer"
                                      >
                                        {"• "}{sub.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
