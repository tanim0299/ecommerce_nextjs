export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  features: string[];
  defaultColorHex: string;
  graphicUrl?: string;
}

export const CATEGORIES: { id: string; name: string }[] = [];

export const PRODUCTS: Product[] = [];
