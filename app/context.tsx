'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  image: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  [key: string]: any;
}

export interface SystemConfig {
  title: string;
  logo: string;
  favicon: string;
  phones: string[];
  emails: string[];
  address: string;
  google_map: string;
}

export interface FlyingItem {
  id: string;
  image: string;
  startLeft: number;
  startTop: number;
  startWidth: number;
  startHeight: number;
  targetX: number;
  targetY: number;
  isFlying: boolean;
}

interface AppContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  likedProducts: string[];
  setLikedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  handleAddToCart: (item: CartItem, sourceCoords?: any) => void;
  handleQuickAddToCart: (prod: any, sourceCoords?: any) => void;
  handleToggleWishlist: (productId: string) => void;
  handleRemoveFromCart: (itemId: string) => void;
  handleUpdateCartQty: (itemId: string, qty: number) => void;
  systemConfig: SystemConfig | null;
  isConfigLoading: boolean;
  resolveImageUrl: (path: string) => string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isBagShaking: boolean;
  triggerBagShake: () => void;
  flyingItems: FlyingItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const resolveImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const urlObj = new URL(path);
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          const basePath = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || 'http://127.0.0.1:8088';
          const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
          return `${cleanBasePath}${urlObj.pathname}${urlObj.search}`;
        }
        return path;
      } catch (e) {
        return path;
      }
    }
    const basePath = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || 'http://127.0.0.1:8088';
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBasePath}${cleanPath}`;
  };

  // Fetch System Configuration
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/system-config`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            const data = { ...json.data };
            
            if (data.logo) data.logo = resolveImageUrl(data.logo);
            if (data.favicon) data.favicon = resolveImageUrl(data.favicon);

            setSystemConfig(data);
          }
        }
      } catch (error) {
        console.error('Failed to load system config:', error);
      } finally {
        setIsConfigLoading(false);
      }
    };
    fetchSystemConfig();
  }, []);

  // Update document title and favicon dynamically on client side
  useEffect(() => {
    if (systemConfig) {
      if (systemConfig.title) {
        document.title = systemConfig.title;
      }
      if (systemConfig.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = systemConfig.favicon;
      }
    }
  }, [systemConfig]);

  // Load state from localStorage on client mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch (e) {}
    }
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try { setLikedProducts(JSON.parse(storedWishlist)); } catch (e) {}
    }
  }, []);

  // Persist token
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Persist cart
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    if (likedProducts.length > 0) {
      localStorage.setItem('wishlist', JSON.stringify(likedProducts));
    } else {
      localStorage.removeItem('wishlist');
    }
  }, [likedProducts]);

  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isBagShaking, setIsBagShaking] = useState(false);

  const triggerBagShake = () => {
    setIsBagShaking(false);
    requestAnimationFrame(() => {
      setIsBagShaking(true);
      setTimeout(() => {
        setIsBagShaking(false);
      }, 900);
    });
  };

  const triggerFlyAnimation = (image: string, sourceCoords?: any) => {
    if (typeof window === 'undefined') return;

    let startLeft = window.innerWidth / 2 - 120;
    let startTop = window.innerHeight / 2 - 120;
    let startWidth = 240;
    let startHeight = 240;

    let foundImgEl: HTMLElement | null = null;

    // 1. If on product page, check for main product image
    const mainProdImg = document.getElementById('product-main-view-image');
    if (mainProdImg && mainProdImg.getBoundingClientRect().height > 50) {
      foundImgEl = mainProdImg as HTMLElement;
    }

    // 2. If quick view modal is open, check for quick view image
    const qvImg = document.getElementById('quick-view-product-image');
    if (!foundImgEl && qvImg && qvImg.getBoundingClientRect().height > 50) {
      foundImgEl = qvImg as HTMLElement;
    }

    // 3. If sourceCoords was passed and points to an element / event, check for clicked card image
    if (!foundImgEl && sourceCoords) {
      const target = sourceCoords.currentTarget || sourceCoords.target || (sourceCoords instanceof HTMLElement ? sourceCoords : null);
      if (target && typeof target.closest === 'function') {
        const container = target.closest('.group, .relative, article, div');
        const img = container ? container.querySelector('img') : null;
        if (img && img.getBoundingClientRect().height > 40) {
          foundImgEl = img as HTMLElement;
        }
      }
    }

    if (foundImgEl) {
      const r = foundImgEl.getBoundingClientRect();
      startLeft = r.left;
      startTop = r.top;
      startWidth = r.width;
      startHeight = r.height;
    } else if (sourceCoords && typeof sourceCoords.clientX === 'number') {
      startLeft = sourceCoords.clientX - 70;
      startTop = sourceCoords.clientY - 70;
      startWidth = 140;
      startHeight = 140;
    }

    let targetX = window.innerWidth - 30;
    let targetY = window.innerHeight / 2;

    const floatingBtn = document.getElementById('floating-cart-btn');
    const headerBtn = document.getElementById('header-cart-btn');
    const targetEl = floatingBtn || headerBtn;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const animId = Math.random().toString(36).substring(2, 9);
    const newItem: FlyingItem = {
      id: animId,
      image: image ? resolveImageUrl(image) : '',
      startLeft,
      startTop,
      startWidth,
      startHeight,
      targetX,
      targetY,
      isFlying: false,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    // Trigger flight on next animation frame
    requestAnimationFrame(() => {
      setTimeout(() => {
        setFlyingItems((prev) =>
          prev.map((item) => (item.id === animId ? { ...item, isFlying: true } : item))
        );
      }, 15);
    });

    // When item arrives at the bag, trigger shake and cleanup
    setTimeout(() => {
      triggerBagShake();
      setFlyingItems((prev) => prev.filter((item) => item.id !== animId));
    }, 780);
  };

  const handleAddToCart = (item: CartItem, sourceCoords?: any) => {
    triggerFlyAnimation(item.image, sourceCoords);

    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (i) => i.id === item.id || 
        (i.name === item.name && i.size === item.size && i.colorHex === item.colorHex)
      );

      if (itemIndex > -1) {
        const updated = [...prevCart];
        updated[itemIndex] = {
          ...updated[itemIndex],
          quantity: updated[itemIndex].quantity + (item.quantity || 1)
        };
        return updated;
      }

      return [...prevCart, item];
    });
  };

  const handleQuickAddToCart = (prod: any, sourceCoords?: any) => {
    if (prod.stock_status === 'out_of_stock') {
      showToast('This product is currently out of stock!', 'error');
      return;
    }
    const mainImage = prod.image || (prod.images && prod.images[0]?.url) || '';
    handleAddToCart({
      id: `${prod.id}-Black-M`,
      name: prod.name || 'Product',
      price: typeof prod.price === 'string' ? parseInt(prod.price, 10) : (prod.price || prod.sale_price || prod.regular_price || 0),
      size: 'M',
      colorName: 'Standard',
      colorHex: '#000000',
      quantity: 1,
      image: mainImage
    }, sourceCoords);
  };

  const handleToggleWishlist = (productId: string) => {
    setLikedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateCartQty = (itemId: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
  };

  return (
    <AppContext.Provider value={{
      cart, setCart,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
      likedProducts, setLikedProducts,
      user, setUser,
      token, setToken,
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      handleAddToCart,
      handleQuickAddToCart,
      handleToggleWishlist,
      handleRemoveFromCart,
      handleUpdateCartQty,
      systemConfig,
      isConfigLoading,
      resolveImageUrl,
      showToast,
      isBagShaking,
      triggerBagShake,
      flyingItems
    }}>
      {children}

      {/* Flying Product Image Animation Portal */}
      <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
        {flyingItems.map((item) => {
          const dx = item.targetX - (item.startLeft + item.startWidth / 2);
          const dy = item.targetY - (item.startTop + item.startHeight / 2);

          return (
            <div
              key={item.id}
              style={{
                position: 'fixed',
                left: `${item.startLeft}px`,
                top: `${item.startTop}px`,
                width: `${item.startWidth}px`,
                height: `${item.startHeight}px`,
                transform: item.isFlying
                  ? `translate3d(${dx}px, ${dy}px, 0) scale(0.06) rotate(-15deg)`
                  : `translate3d(0, 0, 0) scale(1) rotate(0deg)`,
                opacity: item.isFlying ? 0 : 0.95,
                transition: 'transform 780ms cubic-bezier(0.18, 0.9, 0.25, 1), opacity 780ms cubic-bezier(0.7, 0, 1, 1)',
                transformOrigin: 'center center',
              }}
              className="flex items-center justify-center pointer-events-none"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt="Product flying into bag"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                />
              ) : (
                <div className="w-20 h-20 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-2xl">
                  <ShoppingBag className="w-10 h-10" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Toast notifications */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in-right ${
              t.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
                : t.type === 'error'
                ? 'bg-rose-50/90 border-rose-100 text-rose-800'
                : 'bg-amber-50/90 border-amber-100 text-amber-800'
            }`}
          >
            <span className="text-xs font-bold leading-snug">{t.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const useAppContext = useApp;
