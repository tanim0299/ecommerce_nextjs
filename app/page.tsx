'use client';

import React, { useState, useEffect } from 'react';
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

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
}

const NAV_ITEMS = [
  { name: 'MEN', target: 'all', columns: [['T-Shirts', 'Polo Shirts', 'Shirts'], ['Panjabi', 'Chinos', 'Denim'], ['Hoodies', 'Jackets', 'Accessories']] },
  { name: 'WOMEN', target: 'all', columns: [['T-Shirts', 'Tops', 'Tunics'], ['Casual Wear', 'Active Wear', 'New Arrivals'], ['Bags', 'Accessories', 'Gift Cards']] },
  { name: 'TEENS', target: 'all', columns: [['Graphic Tees', 'Oversized Tees', 'Polos'], ['Joggers', 'Denim', 'Shorts'], ['Trending Now', 'Essentials', 'Sale']] },
  { name: 'KIDS', target: 'kids', columns: [['Boys', 'Girls', 'Toddlers'], ['T-Shirts', 'Sets', 'Bottoms'], ['School Wear', 'Play Wear', 'Accessories']] },
  { name: 'SPORTS', target: 'jersey', columns: [['Football Jerseys', 'Fan Edition', 'Player Edition'], ['Argentina', 'Brazil', 'Club Jerseys'], ['Training Wear', 'Active Tees', 'Shorts']] }
];

const NEW_ARRIVALS = [
  { id: 'na-1', name: 'Wave Art Printed Tee', price: 950, image: '/products/na-1.png' },
  { id: 'na-2', name: 'Athletic Striped Tee', price: 990, image: '/products/na-2.png' },
  { id: 'na-3', name: 'Forest Silhouette Tee', price: 950, image: '/products/na-3.png' },
  { id: 'na-4', name: 'Steel Blue Active Polo', price: 1050, image: '/products/na-4.png' },
  { id: 'na-5', name: 'Colorblock Pique Polo', price: 1150, image: '/products/na-5.png' },
  { id: 'na-6', name: 'Maroon Raglan Tee', price: 890, image: '/products/na-6.png' },
  { id: 'na-7', name: 'Premium Solid Grey Tee', price: 990, image: '/products/na-7.png' },
  { id: 'na-8', name: 'Green Raglan Longsleeve', price: 1190, image: '/products/na-8.png' }
];
const TOP_CATEGORIES = [
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

const TSHIRT_PRODUCTS = [
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

const TSHIRT_PRODUCTS_SHUFFLED_1 = [
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

const TSHIRT_PRODUCTS_SHUFFLED_2 = [
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

const TSHIRT_PRODUCTS_SHUFFLED_3 = [
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

const HERO_SLIDES = [
  {
    image: "/slide1.jpg",
    title: "ELEVATE YOUR MODEST STYLE",
    subtitle: "Simple. Classy. Modest. A complete premium look for every special moment.",
    badge: "Panjabi Combo"
  },
  {
    image: "/slide2.jpg",
    title: "REFINED MODESTY 2026",
    subtitle: "Elegant cuts, comfortable fabric, and timeless modest style for every occasion.",
    badge: "Believers Collection"
  },
  {
    image: "/slide3.jpg",
    title: "STYLE IN MOTION",
    subtitle: "Built for everyday movement with effortless comfort and athletic design.",
    badge: "Premium Footwear"
  }
];

export default function Home() {
  // Navigation & Page State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0);
  
  // Cart & Ordering State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckoutSimulated, setIsCheckoutSimulated] = useState(false);

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailColor, setDetailColor] = useState<ProductColor | null>(null);
  const [detailSize, setDetailSize] = useState('M');
  const [detailQuantity, setDetailQuantity] = useState(1);

  // Track Order State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);

  // Carousel Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [cardColors, setCardColors] = useState<{ [productId: string]: ProductColor }>({});

  // Auto-play Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  // Autoplay Category Slider (Endless/Infinite Scroll)
  useEffect(() => {
    const el = document.getElementById('category-slider');
    if (!el) return;

    const handleScroll = () => {
      // Each card is min-w-[250px] or [280px], plus gap-5 (20px) or gap-6 (24px)
      // We can find the exact single set width by dividing the total scroll width by 3
      const singleSetWidth = el.scrollWidth / 3;

      if (el.scrollLeft >= singleSetWidth * 2) {
        // Jump back to the first duplicate set seamlessly
        el.scrollLeft = el.scrollLeft - singleSetWidth;
      } else if (el.scrollLeft <= 0) {
        // Jump forward to the second duplicate set seamlessly
        el.scrollLeft = el.scrollLeft + singleSetWidth;
      }
    };

    el.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      el.scrollBy({ left: 320, behavior: 'smooth' });
    }, 3500);

    return () => {
      clearInterval(interval);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Autoplay Product Slider (Endless/Infinite Scroll)
  useEffect(() => {
    const el = document.getElementById('product-slider');
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
    }, 4500);

    return () => {
      clearInterval(interval);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Autoplay Product Slider 2 (Endless/Infinite Scroll)
  useEffect(() => {
    const el = document.getElementById('product-slider-2');
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
    }, 4200);

    return () => {
      clearInterval(interval);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Autoplay Product Slider 3 (Endless/Infinite Scroll)
  useEffect(() => {
    const el = document.getElementById('product-slider-3');
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
    }, 4600);

    return () => {
      clearInterval(interval);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Autoplay Product Slider 4 (Endless/Infinite Scroll)
  useEffect(() => {
    const el = document.getElementById('product-slider-4');
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

  const handleCardColorHover = (productId: string, color: ProductColor) => {
    setCardColors(prev => ({ ...prev, [productId]: color }));
  };

  const handleAddToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.id === item.id || 
        (i.name === item.name && i.size === item.size && i.colorHex === item.colorHex)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prevCart, item];
    });
  };

  const handleDetailAddToCart = () => {
    if (!selectedProduct || !detailColor) return;
    handleAddToCart({
      id: `${selectedProduct.id}-${detailColor.name}-${detailSize}`,
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: detailSize,
      colorName: detailColor.name,
      colorHex: detailColor.hex,
      quantity: detailQuantity
    });
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateCartQty = (itemId: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FABRILIFE10') {
      setDiscountPercent(10);
      alert('Promo code applied! You saved 10% off your purchase.');
    } else {
      alert('Invalid coupon code. Try "FABRILIFE10"');
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const shippingCost = cartSubtotal > 1500 || cartSubtotal === 0 ? 0 : 60;
  const cartTotal = cartSubtotal - discountAmount + shippingCost;

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

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    const statuses = [
      'Order Confirmed - Pending Quality Inspection',
      'Fabric Sourcing & Printing in Progress',
      'Packed & Handed Over to Delivery Partner',
      'Out for Delivery - ETA Today'
    ];
    const index = Math.abs(trackingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % statuses.length;
    setTrackingStatus(statuses[index]);
  };

  const toggleLike = (prodId: string) => {
    setLikedProducts(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  // Render SVG Apparel Preview Canvas
  const renderSVGApparel = (type: string, hexColor: string, graphicKey?: string) => {
    const isDark = hexColor === '#090e17' || hexColor === '#133b2b' || hexColor === '#0a2540' || hexColor === '#111111' || hexColor === '#1c2e4a';
    
    switch (type) {
      case 'jersey':
        if (graphicKey === 'ARGENTINA') {
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Argentina Blue/White vertical stripes base */}
              <path d="M 22,25 L 35,15 L 65,15 L 78,25 L 70,36 L 66,32 L 66,90 L 34,90 L 34,32 L 30,36 Z" fill="#74acdf" />
              {/* White stripes */}
              <rect x="42" y="15" width="6" height="75" fill="#ffffff" />
              <rect x="52" y="15" width="6" height="75" fill="#ffffff" />
              <rect x="30" y="15" width="4" height="25" fill="#ffffff" />
              <rect x="66" y="15" width="4" height="25" fill="#ffffff" />
              {/* Neck V outline */}
              <path d="M 38,17 C 42,20 58,20 62,17" stroke="#000" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
              {/* Shield logo */}
              <circle cx="45" cy="28" r="2.5" fill="#eab308" />
            </svg>
          );
        } else { // BRAZIL
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Brazil Yellow body */}
              <path d="M 22,25 L 35,15 L 65,15 L 78,25 L 70,36 L 66,32 L 66,90 L 34,90 L 34,32 L 30,36 Z" fill="#fed100" />
              {/* Green Neck collar and cuffs tipping */}
              <path d="M 35,15 L 43,15 L 43,22 L 35,15" fill="#0e7138" />
              <path d="M 65,15 L 57,15 L 57,22 L 65,15" fill="#0e7138" />
              <path d="M 22,25 L 26,29" stroke="#0e7138" strokeWidth="2.5" />
              <path d="M 78,25 L 74,29" stroke="#0e7138" strokeWidth="2.5" />
              <path d="M 38,17 C 42,20 58,20 62,17" stroke="#0e7138" strokeWidth="1.5" fill="none" />
              {/* Crest */}
              <circle cx="45" cy="28" r="2.5" fill="#014682" />
            </svg>
          );
        }
      case 'chino':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            <path d="M 32,10 L 68,10 L 72,16 L 76,92 L 62,92 L 50,42 L 38,92 L 24,92 L 28,16 Z" fill="currentColor" />
            <path d="M 32,16 L 68,16" stroke="#000" strokeWidth="1.5" strokeOpacity="0.12" fill="none" />
            <path d="M 50,10 L 50,42" stroke="#000" strokeWidth="1" strokeOpacity="0.1" fill="none" />
            <path d="M 36,25 L 42,25" stroke="#000" strokeWidth="1" strokeOpacity="0.15" fill="none" />
            <path d="M 64,25 L 58,25" stroke="#000" strokeWidth="1" strokeOpacity="0.15" fill="none" />
          </svg>
        );
      case 'panjabi':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            {/* Long Traditional Panjabi tunic design */}
            <path d="M 24,20 L 36,12 L 64,12 L 76,20 L 70,36 L 66,32 L 66,95 L 34,95 L 34,32 L 30,36 Z" fill="currentColor" />
            {/* Side slash cuts */}
            <path d="M 34,68 L 34,95 M 66,68 L 66,95" stroke="#000" strokeWidth="1" strokeOpacity="0.1" fill="none" />
            {/* Band collar */}
            <rect x="42" y="12" width="16" height="3" fill="#000" fillOpacity="0.08" />
            <path d="M 42,15 L 58,15" stroke="#000" strokeWidth="1" strokeOpacity="0.15" />
            {/* Button Placket */}
            <path d="M 50,15 L 50,40" stroke="#000" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
            <circle cx="50" cy="22" r="0.8" fill="#eab308" />
            <circle cx="50" cy="28" r="0.8" fill="#eab308" />
            <circle cx="50" cy="34" r="0.8" fill="#eab308" />
          </svg>
        );
      case 'jeans':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            {/* Structured jeans with wash textures */}
            <path d="M 32,10 L 68,10 L 72,16 L 76,92 L 62,92 L 50,44 L 38,92 L 24,92 L 28,16 Z" fill="currentColor" />
            {/* Denim stitching outlines */}
            <path d="M 32,16 L 68,16" stroke="#c2410c" strokeWidth="1" strokeOpacity="0.3" fill="none" />
            <path d="M 50,10 L 50,44" stroke="#c2410c" strokeWidth="0.8" strokeOpacity="0.25" fill="none" />
            <path d="M 30,22 C 34,22 36,16 36,16 M 70,22 C 66,22 64,16 64,16" stroke="#c2410c" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          </svg>
        );
      case 'kids':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            {/* Small T-shirt for kids */}
            <path d="M 24,28 L 36,18 L 64,18 L 76,28 L 70,38 L 66,34 L 66,88 L 34,88 L 34,34 L 30,38 Z" fill="currentColor" />
            <circle cx="50" cy="20" r="12" fill="none" stroke="#000" strokeWidth="1" strokeOpacity="0.1" clipPath="url(#kids-collar)" />
            {/* Cute prints */}
            {graphicKey === 'DINO' && (
              <text x="50" y="56" fontSize="12" textAnchor="middle" filter="grayscale(20%)">ðŸ¦–</text>
            )}
            {graphicKey === 'ROCKET' && (
              <text x="50" y="56" fontSize="12" textAnchor="middle">ðŸš€</text>
            )}
          </svg>
        );
      case 'belt':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            {/* Rolled Leather Belt shape */}
            <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="6" />
            <circle cx="50" cy="50" r="23" fill="none" stroke="currentColor" strokeWidth="5.5" strokeOpacity="0.85" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="5" strokeOpacity="0.7" />
            {/* Metal buckle */}
            <rect x="42" y="10" width="16" height="12" rx="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <line x1="50" y1="10" x2="50" y2="22" stroke="#1e293b" strokeWidth="2" />
          </svg>
        );
      case 'wallet':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            {/* Bi-fold Leather Wallet */}
            <rect x="20" y="30" width="60" height="40" rx="3" fill="currentColor" />
            {/* Fold line stitching */}
            <line x1="50" y1="30" x2="50" y2="70" stroke="#000" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="2,2" />
            <rect x="23" y="33" width="54" height="34" rx="2" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="1.5,1.5" />
            {/* Gold brand logo badge */}
            <circle cx="34" cy="50" r="2.5" fill="#eab308" fillOpacity="0.6" />
          </svg>
        );
      case 'cap':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            {/* Baseball Cap shape */}
            {/* Crown dome */}
            <path d="M 22,58 C 22,25 78,25 78,58 Z" fill="currentColor" />
            {/* Visor / Peak */}
            <path d="M 64,55 C 75,56 86,63 92,72 C 80,74 68,68 64,55" fill="currentColor" fillOpacity="0.9" />
            {/* Panel seams */}
            <path d="M 50,28 L 50,58 M 50,28 C 40,38 34,48 34,58 M 50,28 C 60,38 66,48 66,58" stroke="#000" strokeWidth="0.8" strokeOpacity="0.12" fill="none" />
            {/* Crown button */}
            <circle cx="50" cy="27" r="2" fill="currentColor" />
          </svg>
        );
      default: // polo
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" style={{ color: hexColor }}>
            <path d="M 22,25 L 35,16 L 41,18 L 44,13 L 56,13 L 59,18 L 65,16 L 78,25 L 70,36 L 66,32 L 66,90 L 34,90 L 34,32 L 30,36 Z" fill="currentColor" />
            <path d="M 22,25 L 30,36 M 78,25 L 70,36" stroke="#000" strokeWidth="1" strokeOpacity="0.1" fill="none" />
            <path d="M 41,18 L 50,26 L 59,18" stroke="#000" strokeWidth="1" strokeOpacity="0.15" fill="none" />
            <path d="M 50,26 L 50,34" stroke="#000" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
            <circle cx="50" cy="20" r="0.8" fill="#000" fillOpacity="0.2" />
            <circle cx="50" cy="23" r="0.8" fill="#000" fillOpacity="0.2" />
            {graphicKey === 'STRIPE' && (
              <>
                <line x1="22" y1="26.5" x2="29" y2="35.5" stroke="#ffffff" strokeWidth="1" />
                <line x1="78" y1="26.5" x2="71" y2="35.5" stroke="#ffffff" strokeWidth="1" />
                <path d="M 44,14 L 56,14" stroke="#ffffff" strokeWidth="0.8" />
              </>
            )}
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-brand-navy flex flex-col font-sans">
      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
          
          {/* Logo & Category Menu Group */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Logo */}
            <div 
              onClick={() => setActiveCategory('all')} 
              className="flex items-center gap-2 cursor-pointer group"
            >
              {/* Origami Folded F Logo Icon */}
              <svg viewBox="0 0 60 70" className="w-8 h-9 text-slate-900" fill="currentColor">
                {/* Top bar (rotated rect) */}
                <polygon points="5,38 35,8 45,18 15,48" />
                {/* Middle bar */}
                <polygon points="17,50 35,32 45,42 27,60" />
                {/* Bottom triangle */}
                <polygon points="29,66 39,56 39,66" />
              </svg>
              {/* Text logo */}
              <div className="flex items-baseline text-2xl tracking-tighter">
                <span className="font-extrabold text-slate-950">FABRI</span>
                <span className="font-light text-slate-800">LIFE</span>
              </div>
            </div>

            {/* Logo-Adjacent Category Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700 tracking-wide">
              {NAV_ITEMS.map((link) => (
                <div key={link.name} className="group relative py-3 -my-3">
                  <button
                    onClick={() => {
                      setActiveCategory(link.target);
                      const el = document.getElementById(`${link.target}-section`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 hover:text-brand-orange transition-colors cursor-pointer"
                  >
                    {link.name}
                    <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 translate-y-2 rounded-b-xl border border-slate-200 bg-white p-6 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-sm font-black text-brand-navy">SHOP {link.name}</span>
                      <span className="text-[10px] font-bold text-brand-orange">VIEW ALL</span>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {link.columns.map((column, columnIndex) => (
                        <div key={columnIndex} className="flex flex-col gap-2.5">
                          {column.map((item) => (
                            <button
                              key={item}
                              onClick={() => setActiveCategory(link.target)}
                              className="text-left text-[11px] font-semibold text-slate-500 transition-colors hover:text-brand-orange"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Central-Right Search Bar */}
          <div className="flex-1 max-w-sm relative">
            <div className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                placeholder="Search"
                className="w-full pl-3 pr-10 py-2 rounded focus:outline-none focus:ring-1 focus:ring-slate-300 bg-slate-100/70 text-slate-700 text-xs sm:text-sm placeholder-slate-400 font-medium"
              />
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Suggestions Box */}
            {showSearchSuggestions && (
              <div className="absolute top-[46px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2.5 z-50 animate-zoom-in">
                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 pb-1 mb-1 border-b border-slate-100">
                  Search Recommendations
                </div>
                <div className="flex flex-col gap-1">
                  {['Argentina Jersey', 'Slim Fit Chinos', 'Premium Pique Polo', 'Cotton Panjabi', 'Leather Belts'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSearchQuery(item);
                        setShowSearchSuggestions(false);
                      }}
                      className="text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Far-Right Labeled Action Buttons */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Stores */}
            <button 
              onClick={() => alert("Store Locator: We have outlets in Uttara, Banani, and Mirpur, Dhaka!")}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <MapPin className="w-5.5 h-5.5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">Stores</span>
            </button>

            {/* Profile */}
            <button 
              onClick={() => alert("Customer Account Login / Registration portal simulated.")}
              className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <User className="w-5.5 h-5.5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-bold tracking-wide uppercase text-slate-500 group-hover:text-slate-800">Profile</span>
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => alert(`Wishlisted items count: ${likedProducts.length}`)}
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
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-2 pb-6 md:pt-4 md:pb-8 flex flex-col gap-3">
        {/* Gorgeous Premium Hero Slider */}
        <section className="relative w-full aspect-[2.6/1] md:aspect-[3/1] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 group">
          {/* Slides Container */}
          <div className="w-full h-full relative">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                    isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                  }`}
                >
                  {/* Slide Image */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                      isActive ? "scale-100" : "scale-105"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/35 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/35 hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Indicators / Progress Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentSlide ? "w-8 bg-amber-500" : "w-2 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Premium Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
            <div
              key={currentSlide}
              className="h-full bg-amber-500 animate-slide-progress"
              style={{ animationDuration: "5000ms" }}
            />
          </div>
        </section>

        {/* Top Categories Section */}
        <section className="flex flex-col gap-6 w-full mt-1 md:mt-2">
          {/* Gorgeous Section Title Design */}
          <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                Curated Collections
              </span>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                TOP CATEGORIES
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              </h2>
            </div>
            
            {/* Carousel Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const el = document.getElementById('category-slider');
                  if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                }}
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('category-slider');
                  if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                }}
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel Slider Cards Container */}
          <div 
            id="category-slider"
            className="w-full overflow-x-auto flex gap-5 md:gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[...TOP_CATEGORIES, ...TOP_CATEGORIES, ...TOP_CATEGORIES].map((cat, idx) => (
              <div
                key={idx}
                className="min-w-[250px] md:min-w-[280px] flex-1 relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl bg-slate-900 group aspect-[4/5] cursor-pointer transition-all duration-500 hover:-translate-y-2 snap-start border border-slate-200/50 hover:border-amber-500/50"
              >
                {/* Category Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 transition-opacity duration-300" />
                
                {/* Category Info */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 text-white z-10">
                  <span className="text-[10px] md:text-xs text-amber-400 font-bold uppercase tracking-wider mb-1.5">
                    {cat.count}
                  </span>
                  <h3 className="text-base md:text-xl font-black tracking-tight leading-tight group-hover:text-amber-400 transition-colors duration-300">
                    {cat.name}
                  </h3>
                  <div className="h-0.5 w-0 group-hover:w-full bg-amber-400 transition-all duration-500 mt-2.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured T-Shirt Category Banner */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100/60 group mt-2">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img
            src="/tshirt-banner.jpg"
            alt="T-Shirt Quality in Every Thread"
            className="w-full h-auto object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.02]"
          />
        </section>

        {/* Trending Products Carousel Section */}
        <section className="flex flex-col gap-6 w-full mt-2">
          {/* Section Header */}
          <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                Premium Apparel
              </span>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                TRENDING T-SHIRTS
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              </h2>
            </div>
            
            {/* Slider Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const el = document.getElementById('product-slider');
                  if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                }}
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('product-slider');
                  if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                }}
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-200 hover:border-amber-500 bg-white text-slate-700 hover:text-amber-500 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Product Slider Container */}
          <div
            id="product-slider"
            className="w-full overflow-x-auto flex gap-6 py-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[...TSHIRT_PRODUCTS, ...TSHIRT_PRODUCTS, ...TSHIRT_PRODUCTS].map((prod, idx) => (
              <div
                key={idx}
                className="min-w-[240px] md:min-w-[270px] flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-start flex flex-col group relative"
              >
                {/* Product Image Area */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md shadow-sm">
                      {prod.tag}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                      {prod.discount} OFF
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3.5 right-3.5 z-20 bg-white/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-white/20">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-slate-800">{prod.rating}</span>
                  </div>

                  {/* Image */}
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Elegant Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 z-20">
                    <button
                      onClick={() => alert(`${prod.name} has been added to cart!`)}
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
              </div>
            ))}
          </div>
        </section>

        {/* Duplicated Section 2: Polo Shirts */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100/60 group mt-4">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img
            src="/tshirt-banner.jpg"
            alt="Polo Campaign Banner"
            className="w-full h-auto object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.02]"
          />
        </section>

        <section className="flex flex-col gap-6 w-full mt-2">
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
            {[...TSHIRT_PRODUCTS_SHUFFLED_1, ...TSHIRT_PRODUCTS_SHUFFLED_1, ...TSHIRT_PRODUCTS_SHUFFLED_1].map((prod, idx) => (
              <div
                key={idx}
                className="min-w-[240px] md:min-w-[270px] flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-start flex flex-col group relative"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                  <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md shadow-sm">
                      {prod.tag}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                      {prod.discount} OFF
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 z-20 bg-white/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-white/20">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-slate-800">{prod.rating}</span>
                  </div>

                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 z-20">
                    <button
                      onClick={() => alert(`${prod.name} has been added to cart!`)}
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
              </div>
            ))}
          </div>
        </section>

        {/* Duplicated Section 3: Graphic Tees */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100/60 group mt-4">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img
            src="/tshirt-banner.jpg"
            alt="Graphic Tees Campaign Banner"
            className="w-full h-auto object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.02]"
          />
        </section>

        <section className="flex flex-col gap-6 w-full mt-2">
          <div className="flex items-end justify-between border-b border-slate-200/60 pb-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                Premium Apparel
              </span>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                TRENDING GRAPHIC TEES
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
            {[...TSHIRT_PRODUCTS_SHUFFLED_2, ...TSHIRT_PRODUCTS_SHUFFLED_2, ...TSHIRT_PRODUCTS_SHUFFLED_2].map((prod, idx) => (
              <div
                key={idx}
                className="min-w-[240px] md:min-w-[270px] flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-start flex flex-col group relative"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                  <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md shadow-sm">
                      {prod.tag}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                      {prod.discount} OFF
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 z-20 bg-white/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-white/20">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-slate-800">{prod.rating}</span>
                  </div>

                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 z-20">
                    <button
                      onClick={() => alert(`${prod.name} has been added to cart!`)}
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
              </div>
            ))}
          </div>
        </section>

        {/* Duplicated Section 4: Casual Shirts */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100/60 group mt-4">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img
            src="/tshirt-banner.jpg"
            alt="Casual Shirts Campaign Banner"
            className="w-full h-auto object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.02]"
          />
        </section>

        <section className="flex flex-col gap-6 w-full mt-2">
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
            {[...TSHIRT_PRODUCTS_SHUFFLED_3, ...TSHIRT_PRODUCTS_SHUFFLED_3, ...TSHIRT_PRODUCTS_SHUFFLED_3].map((prod, idx) => (
              <div
                key={idx}
                className="min-w-[240px] md:min-w-[270px] flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-amber-500/40 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 snap-start flex flex-col group relative"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                  <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-md shadow-sm">
                      {prod.tag}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md shadow-sm">
                      {prod.discount} OFF
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 z-20 bg-white/70 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-white/20">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-slate-800">{prod.rating}</span>
                  </div>

                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4 z-20">
                    <button
                      onClick={() => alert(`${prod.name} has been added to cart!`)}
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
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Gorgeous Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-900 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 60 70" className="w-8 h-9 text-amber-500" fill="currentColor">
                <polygon points="5,38 35,8 45,18 15,48" />
                <polygon points="17,50 35,32 45,42 27,60" />
                <polygon points="29,66 39,56 39,66" />
              </svg>
              <div className="flex items-baseline text-2xl tracking-tighter">
                <span className="font-extrabold text-white">FABRI</span>
                <span className="font-light text-slate-300">LIFE</span>
              </div>
            </div>
            <p className="text-slate-400 font-light leading-relaxed">
              Bangladesh&apos;s premium clothing e-commerce retail store. Experience the finest combed cotton fabrics, refined tailoring, and modern designs for your everyday lifestyle.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-2">
              {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social) => (
                <button
                  key={social}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-500 text-slate-400 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  title={social}
                >
                  <span className="text-[10px] font-bold">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Collections */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-amber-500 pl-3">
              Shop Collections
            </h4>
            <div className="flex flex-col gap-2.5 font-medium pl-3">
              {['Men Wear', 'Women Clothing', 'Teen Collection', 'Kids Playwear', 'Sports Jersey'].map((item) => (
                <button
                  key={item}
                  className="text-left hover:text-amber-500 transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-amber-500 pl-3">
              Customer Policies
            </h4>
            <div className="flex flex-col gap-2.5 font-medium pl-3">
              {['7-Day Free Exchange', 'Cash On Delivery terms', 'Refund & Returns Policy', 'Track Your Order', 'Help Center'].map((item) => (
                <button
                  key={item}
                  className="text-left hover:text-amber-500 transform hover:translate-x-1 transition-all duration-300 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter / Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-black text-white uppercase tracking-wider text-xs border-l-2 border-amber-500 pl-3">
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
                className="w-full bg-slate-900 border border-slate-800 rounded-l-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white placeholder-slate-500"
              />
              <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 rounded-r-lg font-bold text-xs transition-colors cursor-pointer">
                JOIN
              </button>
            </div>
            
            {/* Contact Details */}
            <div className="flex flex-col gap-1 text-xs pl-3 mt-2 text-slate-400 font-light">
              <span>Helpline: +880 9612 000 000</span>
              <span>Email: support@fabrilife.com</span>
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <div>
            © 2026 Fabrilife, Inc. All rights reserved. Dhaka, Bangladesh.
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
    </div>
  );
}
