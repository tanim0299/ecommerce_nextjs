'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  handleAddToCart: (item: CartItem) => void;
  handleQuickAddToCart: (prod: any) => void;
  handleToggleWishlist: (productId: string) => void;
  handleRemoveFromCart: (itemId: string) => void;
  handleUpdateCartQty: (itemId: string, qty: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Load state from localStorage on client mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
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

  const handleAddToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const itemAlreadyExists = prevCart.some(
        (i) => i.id === item.id || 
        (i.name === item.name && i.size === item.size && i.colorHex === item.colorHex)
      );

      if (itemAlreadyExists) return prevCart;

      return [...prevCart, item];
    });
  };

  const handleQuickAddToCart = (prod: any) => {
    handleAddToCart({
      id: `${prod.id}-Black-M`,
      name: prod.name,
      price: typeof prod.price === 'string' ? parseInt(prod.price, 10) : prod.price,
      size: 'M',
      colorName: 'Black',
      colorHex: '#000000',
      quantity: 1,
      image: prod.image || ''
    });
    setIsCartOpen(true);
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
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      handleAddToCart,
      handleQuickAddToCart,
      handleToggleWishlist,
      handleRemoveFromCart,
      handleUpdateCartQty
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
