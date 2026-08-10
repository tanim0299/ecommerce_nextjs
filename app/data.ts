export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'jersey' | 'chino' | 'polo' | 'panjabi' | 'jeans' | 'kids' | 'accessories';
  type: 'jersey' | 'chino' | 'polo' | 'panjabi' | 'jeans' | 'kids' | 'belt' | 'wallet' | 'cap';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  features: string[];
  defaultColorHex: string;
  graphicUrl?: string; // e.g. 'ARGENTINA', 'BRAZIL', 'STRIPE', etc.
}

export const CATEGORIES = [
  { id: 'all', name: 'All Collections' },
  { id: 'jersey', name: 'Jerseys' },
  { id: 'polo', name: 'Polo Shirts' },
  { id: 'chino', name: 'Chino Pants' },
  { id: 'panjabi', name: 'Panjabi' },
  { id: 'jeans', name: 'Jeans' },
  { id: 'kids', name: 'Kids Wear' },
  { id: 'accessories', name: 'Accessories' }
];

export const PRODUCTS: Product[] = [
  // --- Jerseys ---
  {
    id: 'jersey-arg',
    name: 'Argentina Official Fan Jersey 2026',
    category: 'jersey',
    type: 'jersey',
    price: 1150,
    originalPrice: 1450,
    rating: 4.9,
    reviewsCount: 320,
    description: 'Celebrate your passion for Argentina with the official fan jersey. Crafted from breathable mesh polyester with heat-pressed crest and moisture-wicking technology.',
    colors: [
      { name: 'Sky Blue & White', hex: '#74acdf' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    features: ['100% Breathable Mesh Polyester', 'Moisture-wicking dry-fit fabric', 'Sublimated Argentina stripes', 'Official fan edition styling'],
    defaultColorHex: '#74acdf',
    graphicUrl: 'ARGENTINA'
  },
  {
    id: 'jersey-bra',
    name: 'Brazil Official Fan Jersey 2026',
    category: 'jersey',
    type: 'jersey',
    price: 1150,
    originalPrice: 1450,
    rating: 4.8,
    reviewsCount: 198,
    description: 'Support the Seleção with the classic yellow and green jersey. Lightweight honeycomb fabric engineered for maximum comfort on and off the field.',
    colors: [
      { name: 'Canary Yellow', hex: '#fed100' }
    ],
    sizes: ['M', 'L', 'XL'],
    features: ['Polyester honeycomb knit', 'Ribbed green trim cuffs and collar', 'Vibrant sublimated printing', 'Double-needle hemmed stitching'],
    defaultColorHex: '#fed100',
    graphicUrl: 'BRAZIL'
  },

  // --- Chino Pants ---
  {
    id: 'chino-khaki',
    name: 'Stretch Slim Fit Chino Pants - Khaki',
    category: 'chino',
    type: 'chino',
    price: 1250,
    originalPrice: 1650,
    rating: 4.7,
    reviewsCount: 114,
    description: 'Classic twill stretch chinos tailored for a perfect slim fit. Features side slash pockets, rear button pockets, and a sturdy metal zipper fly.',
    colors: [
      { name: 'Twill Khaki', hex: '#c5a059' },
      { name: 'Asphalt Grey', hex: '#4b5563' },
      { name: 'Carbon Black', hex: '#090e17' }
    ],
    sizes: ['30', '32', '34', '36'],
    features: ['98% Combed Cotton, 2% Spandex', 'Twilled stretch fabric', 'Premium branded buttons', 'Reinforced stitch points'],
    defaultColorHex: '#c5a059'
  },
  {
    id: 'chino-navy',
    name: 'Tailored Stretch Chinos - Royal Navy',
    category: 'chino',
    type: 'chino',
    price: 1250,
    originalPrice: 1650,
    rating: 4.8,
    reviewsCount: 93,
    description: 'Tailored navy chinos that seamlessly bridge casual and formal styles. Sturdy combed cotton twill weave with active flex stretch technology.',
    colors: [
      { name: 'Royal Navy', hex: '#014682' },
      { name: 'Carbon Black', hex: '#090e17' },
      { name: 'Olive Green', hex: '#3f4e3f' }
    ],
    sizes: ['30', '32', '34', '36'],
    features: ['Premium cotton twill', 'Flex stretch comfort band', 'Buttoned double welt pockets', 'Durable YKK zipper'],
    defaultColorHex: '#014682'
  },

  // --- Polo Shirts ---
  {
    id: 'polo-classic-navy',
    name: 'Classic Pique Polo Shirt - Navy',
    category: 'polo',
    type: 'polo',
    price: 990,
    originalPrice: 1250,
    rating: 4.8,
    reviewsCount: 421,
    description: 'Our top-selling signature pique polo. Crafted from premium combed cotton with a double lacoste knit pattern for maximum breathability.',
    colors: [
      { name: 'Royal Navy', hex: '#014682' },
      { name: 'Forest Green', hex: '#133b2b' },
      { name: 'Sunset Orange', hex: '#FC4943' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    features: ['100% Combed Cotton', 'Double Lacoste Pique', '220 GSM heavyweight knit', 'Ribbed collars and cuffs'],
    defaultColorHex: '#014682'
  },
  {
    id: 'polo-stripe-crimson',
    name: 'Contrast Tip Stripe Polo - Crimson',
    category: 'polo',
    type: 'polo',
    price: 1050,
    originalPrice: 1350,
    rating: 4.9,
    reviewsCount: 88,
    description: 'Stand out with contrast color stripes on the collar and sleeves. Ribbed cotton details and engraved brand buttons make this a casual essential.',
    colors: [
      { name: 'Crimson Red', hex: '#b31b1b' },
      { name: 'Carbon Black', hex: '#090e17' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['Premium pique cotton', 'Contrast tipping collar accents', 'Side vent slits', 'Embroidered chest shield'],
    defaultColorHex: '#b31b1b',
    graphicUrl: 'STRIPE'
  },

  // --- Panjabi ---
  {
    id: 'panjabi-white',
    name: 'Premium Slim Fit Cotton Panjabi - White',
    category: 'panjabi',
    type: 'panjabi',
    price: 1850,
    originalPrice: 2450,
    rating: 4.9,
    reviewsCount: 156,
    description: 'Tailored premium cotton Panjabi with standard band collar and detailed button embroidery. Designed for comfort during festivals or Friday prayers.',
    colors: [
      { name: 'Off White', hex: '#fbfbfb' }
    ],
    sizes: ['38', '40', '42', '44'],
    features: ['100% Fine Combed Cotton', 'Intricate placket embroidery details', 'Side slash pockets', 'Standard band collar styling'],
    defaultColorHex: '#fbfbfb'
  },
  {
    id: 'panjabi-navy',
    name: 'Embroidered Festival Panjabi - Royal Navy',
    category: 'panjabi',
    type: 'panjabi',
    price: 1950,
    originalPrice: 2650,
    rating: 4.8,
    reviewsCount: 112,
    description: 'Dignified royal navy Panjabi crafted from structured cotton blend. Detailed collar stitching and custom brass buttons provide a premium aesthetic.',
    colors: [
      { name: 'Royal Navy', hex: '#0a2540' },
      { name: 'Emerald Green', hex: '#0e3a2f' }
    ],
    sizes: ['38', '40', '42', '44'],
    features: ['Cotton linen premium blend', 'Engraved brass metal buttons', 'Tonal neck stitch lines', 'Loose comfortable traditional cut'],
    defaultColorHex: '#0a2540'
  },

  // --- Jeans ---
  {
    id: 'jeans-dark',
    name: 'Slim Fit Denim Jeans - Dark Indigo',
    category: 'jeans',
    type: 'jeans',
    price: 1450,
    originalPrice: 1950,
    rating: 4.7,
    reviewsCount: 204,
    description: 'Perfect slim fit dark wash denim jeans. Structured with subtle whisker details, five-pocket layout, and elasticated cotton blend stretch.',
    colors: [
      { name: 'Dark Indigo', hex: '#1c2e4a' }
    ],
    sizes: ['30', '32', '34', '36'],
    features: ['12 oz heavy stretch denim', 'Subtle washed whisker lines', 'Copper rivets reinforcement', 'Genuine leather brand patch'],
    defaultColorHex: '#1c2e4a'
  },
  {
    id: 'jeans-light',
    name: 'Vintage Wash Denim Jeans - Light Blue',
    category: 'jeans',
    type: 'jeans',
    price: 1450,
    originalPrice: 1950,
    rating: 4.8,
    reviewsCount: 145,
    description: 'Vintage faded light blue jeans crafted with combed cotton denim. Active flex stretch gives a comfortable everyday range of motion.',
    colors: [
      { name: 'Vintage Blue', hex: '#5b82a6' }
    ],
    sizes: ['30', '32', '34', '36'],
    features: ['Eco-friendly enzyme washed', 'Faded light tint panels', 'Active stretch denim weave', 'Reinforced pocket stitching'],
    defaultColorHex: '#5b82a6'
  },

  // --- Kids Wear ---
  {
    id: 'kids-tee-dino',
    name: 'Kids Graphic Tee - Dino Explorer',
    category: 'kids',
    type: 'kids',
    price: 390,
    originalPrice: 550,
    rating: 4.9,
    reviewsCount: 78,
    description: 'Fun and colorful graphic tee for kids featuring a friendly dinosaur illustration. Made with ultra-soft cotton fabric to protect sensitive skin.',
    colors: [
      { name: 'Sunny Yellow', hex: '#facc15' },
      { name: 'Sky Blue', hex: '#38bdf8' }
    ],
    sizes: ['4-5 Y', '6-7 Y', '8-9 Y'],
    features: ['100% Organic combed cotton', '160 GSM lightweight feel', 'Non-toxic eco print ink', 'Ribbed round neck stretch band'],
    defaultColorHex: '#facc15',
    graphicUrl: 'DINO'
  },
  {
    id: 'kids-tee-space',
    name: 'Kids Pattern Tee - Space Rocket',
    category: 'kids',
    type: 'kids',
    price: 390,
    originalPrice: 550,
    rating: 4.7,
    reviewsCount: 52,
    description: 'Rocket themed graphic t-shirt. Soft, silicon-washed fabric ensures it remains comfortable throughout active playtimes.',
    colors: [
      { name: 'Sky Blue', hex: '#38bdf8' },
      { name: 'Pitch Black', hex: '#090e17' }
    ],
    sizes: ['4-5 Y', '6-7 Y', '8-9 Y'],
    features: ['100% Ring-spun cotton', 'Soft-touch breathable water print', 'Pre-shrunk against hot drying', 'Side seam tagless comfort'],
    defaultColorHex: '#38bdf8',
    graphicUrl: 'ROCKET'
  },

  // --- Accessories ---
  {
    id: 'acc-belt-black',
    name: 'Full Grain Leather Belt - Onyx Black',
    category: 'accessories',
    type: 'belt',
    price: 890,
    originalPrice: 1250,
    rating: 4.8,
    reviewsCount: 167,
    description: 'Genuine full grain cowhide leather belt featuring a sleek brushed steel buckle. Designed to fit both formal trousers and casual denim pants.',
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Tan Brown', hex: '#5c4033' }
    ],
    sizes: ['32', '34', '36', '38'],
    features: ['100% Genuine Full-grain leather', 'Brushed steel metal prong buckle', 'Curved tail edge', 'Standard 1.5 inch width belt'],
    defaultColorHex: '#111111'
  },
  {
    id: 'acc-wallet-brown',
    name: 'Bi-fold Leather Wallet - Vintage Brown',
    category: 'accessories',
    type: 'wallet',
    price: 990,
    originalPrice: 1450,
    rating: 4.9,
    reviewsCount: 135,
    description: 'Handcrafted minimal bi-fold leather wallet with RFID blocking layer. Features standard card slots, dual cash pockets, and a transparent coin window.',
    colors: [
      { name: 'Vintage Brown', hex: '#5c4033' },
      { name: 'Pitch Black', hex: '#111111' }
    ],
    sizes: ['One Size'],
    features: ['Hand-finished grain leather', 'RFID blocking defense shielding', '6 card slots + cash sleeve', 'Slim format design'],
    defaultColorHex: '#5c4033'
  },
  {
    id: 'acc-cap-navy',
    name: 'Structured Baseball Cap - Royal Navy',
    category: 'accessories',
    type: 'cap',
    price: 490,
    originalPrice: 690,
    rating: 4.6,
    reviewsCount: 78,
    description: 'Premium structured 6-panel baseball cap. Features embroidered eyelets, a pre-curved visor, and a metal clamp strap adjuster for a customized fit.',
    colors: [
      { name: 'Royal Navy', hex: '#014682' },
      { name: 'Asphalt Grey', hex: '#4b5563' }
    ],
    sizes: ['One Size'],
    features: ['100% Twill cotton weave', 'Adjustable metal slider clamp', 'Stiffened crown backing', 'Embroidered ventilation holes'],
    defaultColorHex: '#014682'
  }
];
