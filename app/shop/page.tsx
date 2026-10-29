'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Eye,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useApp, getProductUrl } from '../context';
import { isProductMatch, getSearchRelevanceScore } from '../utils/searchRelevance';
import ProductQuickView from '../components/ProductQuickView';

type PriceValue = number | string | null;

interface Relation {
  id: number;
  name: string;
  slug?: string;
}

interface SubCategory extends Relation {
  description?: string | null;
  sl?: number;
  banner?: string | null;
  featured_image?: string | null;
  products_count?: number;
}

interface Category extends Relation {
  description?: string | null;
  sl?: number;
  banner?: string | null;
  products_count?: number;
  item?: Relation | null;
  sub_categories?: SubCategory[];
}

interface Item extends Relation {
  description?: string | null;
  sl?: number;
  banner?: string | null;
  categories?: Category[];
}

interface ProductImage {
  url?: string;
  type?: string;
}

interface VariantAttribute {
  attribute_id: number;
  attribute_name: string;
  value_id: number;
  value_name: string;
}

interface ProductVariant {
  id: number;
  sku?: string;
  attributes?: VariantAttribute[];
}

interface Product {
  id: number;
  name?: string;
  slug?: string;
  sku?: string;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  has_variant?: boolean;
  is_active?: boolean;
  images?: ProductImage[];
  item?: Relation | null;
  category?: Relation | null;
  sub_category?: Relation | null;
  brand?: Relation | null;
  variants?: ProductVariant[];
  stock_status?: string | null;
}

interface InferredSelection {
  itemId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
}

const normalizeSlug = (value?: string | null) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const numericPrice = (value?: PriceValue) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const productPrice = (product: Product) =>
  numericPrice(product.sale_price)
  ?? numericPrice(product.discount_price)
  ?? numericPrice(product.regular_price);

const formatPrice = (value: number) => new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 2,
}).format(value);

// Smart relevance search imported from ../utils/searchRelevance

function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    likedProducts,
    handleToggleWishlist,
    handleQuickAddToCart,
    resolveImageUrl,
  } = useApp();

  const itemQuery = searchParams.get('item') || searchParams.get('category') || 'all';
  const queryCategoryId = Number(searchParams.get('category_id')) || null;
  const querySubCategoryId = Number(searchParams.get('sub_category_id')) || null;

  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inferredSelection, setInferredSelection] = useState<InferredSelection>({
    itemId: null,
    categoryId: null,
    subCategoryId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [quickViewProductId, setQuickViewProductId] = useState<number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCatalog = async () => {
      setIsLoading(true);
      setError('');

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const [itemsResponse, categoriesResponse, productsResponse] = await Promise.all([
          fetch(`${cleanUrl}/items`, { signal: controller.signal }),
          fetch(`${cleanUrl}/categories`, { signal: controller.signal }),
          fetch(`${cleanUrl}/products`, { signal: controller.signal }),
        ]);

        if (!itemsResponse.ok || !categoriesResponse.ok || !productsResponse.ok) {
          throw new Error('Unable to load the shop catalog.');
        }

        const [itemsJson, categoriesJson, productsJson] = await Promise.all([
          itemsResponse.json(),
          categoriesResponse.json(),
          productsResponse.json(),
        ]);

        if (!Array.isArray(itemsJson.data) || !Array.isArray(categoriesJson.data) || !Array.isArray(productsJson.data)) {
          throw new Error('Invalid catalog response.');
        }

        const items = (itemsJson.data as Item[]).sort((a, b) => (a.sl ?? 0) - (b.sl ?? 0));
        const allCategories = (categoriesJson.data as Category[])
          .sort((a, b) => (a.sl ?? 0) - (b.sl ?? 0));
        const querySlug = normalizeSlug(itemQuery);
        let resolvedItem = itemQuery === 'all'
          ? null
          : items.find(candidate =>
            candidate.slug === itemQuery || candidate.id.toString() === itemQuery || normalizeSlug(candidate.name) === querySlug || normalizeSlug(candidate.slug) === querySlug
          ) ?? null;
        let inferredCategoryId: number | null = null;
        let inferredSubCategoryId: number | null = null;

        if (!resolvedItem && itemQuery !== 'all') {
          const matchedCategory = allCategories.find(category => normalizeSlug(category.slug) === querySlug || normalizeSlug(category.name) === querySlug);
          const categoryWithMatchedSubCategory = allCategories.find(category =>
            category.sub_categories?.some(subCategory => normalizeSlug(subCategory.slug) === querySlug || normalizeSlug(subCategory.name) === querySlug)
          );

          if (matchedCategory?.item) {
            resolvedItem = items.find(candidate => candidate.id === matchedCategory.item?.id) ?? matchedCategory.item;
            inferredCategoryId = matchedCategory.id;
          } else if (categoryWithMatchedSubCategory?.item) {
            resolvedItem = items.find(candidate => candidate.id === categoryWithMatchedSubCategory.item?.id)
              ?? categoryWithMatchedSubCategory.item;
            inferredCategoryId = categoryWithMatchedSubCategory.id;
            inferredSubCategoryId = categoryWithMatchedSubCategory.sub_categories
              ?.find(subCategory => normalizeSlug(subCategory.slug) === querySlug || normalizeSlug(subCategory.name) === querySlug)?.id ?? null;
          }
        }

        if (!resolvedItem && itemQuery !== 'all') {
          throw new Error('Item not found.');
        }

        let itemDetail: Item | null = resolvedItem;
        if (resolvedItem) {
          const itemResponse = await fetch(`${cleanUrl}/items/${resolvedItem.id}`, {
            signal: controller.signal,
          });
          if (!itemResponse.ok) throw new Error('Item not found.');
          const itemJson = await itemResponse.json();
          if (itemJson.status !== 'success' || !itemJson.data) throw new Error('Item not found.');
          itemDetail = itemJson.data as Item;
        }

        const itemCategories = resolvedItem
          ? allCategories.filter(category => category.item?.id === resolvedItem?.id)
          : allCategories;

        setItem(itemDetail);
        setCategories(itemCategories);
        setProducts((productsJson.data as Product[]).filter(product => product.is_active !== false));
        setInferredSelection({
          itemId: resolvedItem?.id ?? null,
          categoryId: inferredCategoryId,
          subCategoryId: inferredSubCategoryId,
        });
        setMinPrice(0);
        setMaxPrice(null);
        setSelectedSizes([]);
        setSelectedColors([]);
      } catch (catalogError) {
        if (catalogError instanceof DOMException && catalogError.name === 'AbortError') return;
        setItem(null);
        setCategories([]);
        setProducts([]);
        setError(catalogError instanceof Error ? catalogError.message : 'Unable to load the shop catalog.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchCatalog();
    return () => controller.abort();
  }, [itemQuery]);

  const selectedCategoryId = queryCategoryId ?? inferredSelection.categoryId;
  const selectedSubCategoryId = querySubCategoryId ?? inferredSelection.subCategoryId;
  const selectedCategory = categories.find(category => category.id === selectedCategoryId) ?? null;
  const selectedSubCategory = selectedCategory?.sub_categories
    ?.find(subCategory => subCategory.id === selectedSubCategoryId) ?? null;

  const itemProducts = useMemo(() => products.filter(product =>
    inferredSelection.itemId === null || product.item?.id === inferredSelection.itemId
  ), [inferredSelection.itemId, products]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    itemProducts.forEach(product => product.variants?.forEach(variant =>
      variant.attributes?.forEach(attribute => {
        if (attribute.attribute_name.toLocaleLowerCase().includes('size')) sizes.add(attribute.value_name);
      })
    ));
    return Array.from(sizes);
  }, [itemProducts]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    itemProducts.forEach(product => product.variants?.forEach(variant =>
      variant.attributes?.forEach(attribute => {
        if (attribute.attribute_name.toLocaleLowerCase().includes('color')) colors.add(attribute.value_name);
      })
    ));
    return Array.from(colors);
  }, [itemProducts]);

  const availableMaxPrice = useMemo(() => Math.max(
    0,
    ...itemProducts.map(product => productPrice(product) ?? 0)
  ), [itemProducts]);

  const searchQueryParam = searchParams.get('search') || '';

  const filteredProducts = useMemo(() => {
    const result = itemProducts.filter(product => {
      if (searchQueryParam && !isProductMatch(product, searchQueryParam)) return false;
      if (selectedCategoryId && product.category?.id !== selectedCategoryId) return false;
      if (selectedSubCategoryId && product.sub_category?.id !== selectedSubCategoryId) return false;

      const price = productPrice(product);
      if (price === null || price < minPrice || (maxPrice !== null && price > maxPrice)) return false;

      if (selectedSizes.length > 0) {
        const hasSize = product.variants?.some(variant => variant.attributes?.some(attribute =>
          attribute.attribute_name.toLocaleLowerCase().includes('size')
          && selectedSizes.includes(attribute.value_name)
        ));
        if (!hasSize) return false;
      }

      if (selectedColors.length > 0) {
        const hasColor = product.variants?.some(variant => variant.attributes?.some(attribute =>
          attribute.attribute_name.toLocaleLowerCase().includes('color')
          && selectedColors.includes(attribute.value_name)
        ));
        if (!hasColor) return false;
      }

      return true;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => (productPrice(a) ?? 0) - (productPrice(b) ?? 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (productPrice(b) ?? 0) - (productPrice(a) ?? 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (searchQueryParam) {
      // Relevance descending sort: Best matching items appear at the very top
      result.sort((a, b) => {
        const scoreA = getSearchRelevanceScore(a, searchQueryParam);
        const scoreB = getSearchRelevanceScore(b, searchQueryParam);
        return scoreB - scoreA;
      });
    }

    return result;
  }, [itemProducts, maxPrice, minPrice, selectedCategoryId, selectedColors, selectedSizes, selectedSubCategoryId, sortBy, searchQueryParam]);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Reset pagination when any filter or sort changes
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategoryId, selectedSubCategoryId, minPrice, maxPrice, selectedSizes, selectedColors, searchQueryParam, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryId) count++;
    if (selectedSubCategoryId) count++;
    if (minPrice > 0 || maxPrice !== null) count++;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (selectedColors.length > 0) count += selectedColors.length;
    return count;
  }, [selectedCategoryId, selectedSubCategoryId, minPrice, maxPrice, selectedSizes, selectedColors]);

  const updateCatalogSelection = (categoryId?: number, subCategoryId?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (item) params.set('category', normalizeSlug(item.name));

    if (categoryId) params.set('category_id', categoryId.toString());
    else params.delete('category_id');

    if (subCategoryId) params.set('sub_category_id', subCategoryId.toString());
    else params.delete('sub_category_id');

    router.replace(`/shop?${params.toString()}`);
  };

  const toggleValue = (
    value: string,
    selectedValues: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(selectedValues.includes(value)
      ? selectedValues.filter(selected => selected !== value)
      : [...selectedValues, value]);
  };

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('category_id');
    params.delete('sub_category_id');
    router.replace(`/shop?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(
    selectedCategoryId
    || selectedSubCategoryId
    || minPrice > 0
    || maxPrice !== null
    || selectedSizes.length
    || selectedColors.length
    || searchQueryParam
  );

  const renderFilterContent = (isMobile = false) => (
    <div className="flex flex-col gap-4">
      <nav className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            updateCatalogSelection();
            if (isMobile) setIsMobileFilterOpen(false);
          }}
          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black transition-all cursor-pointer ${
            !selectedCategoryId ? 'bg-brand-orange text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>All {item?.name || ''} Products</span>
          <span className={`text-[11px] ${!selectedCategoryId ? 'text-white/90' : 'text-slate-400'}`}>
            {itemProducts.length}
          </span>
        </button>

        {categories.map(category => (
          <div key={category.id} className="flex flex-col">
            <button
              type="button"
              onClick={() => {
                updateCatalogSelection(category.id);
                if (isMobile && (!category.sub_categories || category.sub_categories.length === 0)) {
                  setIsMobileFilterOpen(false);
                }
              }}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all cursor-pointer ${
                selectedCategoryId === category.id && !selectedSubCategoryId
                  ? 'bg-brand-orange text-white shadow-sm font-black'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{category.name}</span>
              {category.products_count !== undefined && (
                <span className={`text-[11px] ${selectedCategoryId === category.id && !selectedSubCategoryId ? 'text-white/90' : 'text-slate-400'}`}>
                  {category.products_count}
                </span>
              )}
            </button>

            {(category.sub_categories ?? []).length > 0 && (
              <div className="ml-3 my-0.5 flex flex-col border-l-2 border-slate-100 pl-3 gap-0.5">
                {(category.sub_categories ?? [])
                  .sort((a, b) => (a.sl ?? 0) - (b.sl ?? 0))
                  .map(subCategory => (
                    <button
                      key={subCategory.id}
                      type="button"
                      onClick={() => {
                        updateCatalogSelection(category.id, subCategory.id);
                        if (isMobile) setIsMobileFilterOpen(false);
                      }}
                      className={`flex items-center justify-between py-1 px-2 rounded-lg text-left text-[11px] font-semibold transition-colors cursor-pointer ${
                        selectedSubCategoryId === subCategory.id
                          ? 'bg-brand-orange/10 text-brand-orange font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <span>{subCategory.name}</span>
                      {subCategory.products_count !== undefined && (
                        <span className="text-[10px] text-slate-400">{subCategory.products_count}</span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Price Range */}
      <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3.5">
        <h4 className="border-l-2 border-brand-orange pl-2 text-xs font-black uppercase tracking-widest text-slate-900">
          Price Range (BDT)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-[9px] font-black uppercase text-slate-400">
            Min Price
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={event => setMinPrice(Math.max(0, Number(event.target.value) || 0))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-orange"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] font-black uppercase text-slate-400">
            Max Price
            <input
              type="number"
              min={minPrice}
              placeholder={availableMaxPrice ? Math.ceil(availableMaxPrice).toString() : 'Any'}
              value={maxPrice ?? ''}
              onChange={event => setMaxPrice(event.target.value ? Math.max(minPrice, Number(event.target.value)) : null)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-orange"
            />
          </label>
        </div>
      </div>

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3.5">
          <div className="flex items-center justify-between">
            <h4 className="border-l-2 border-brand-orange pl-2 text-xs font-black uppercase tracking-widest text-slate-900">
              Sizes
            </h4>
            {selectedSizes.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSizes([])}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleValue(size, selectedSizes, setSelectedSizes)}
                  className={`rounded-lg border px-3 py-1.5 text-[10.5px] font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-orange bg-brand-orange text-white shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      {availableColors.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3.5">
          <div className="flex items-center justify-between">
            <h4 className="border-l-2 border-brand-orange pl-2 text-xs font-black uppercase tracking-widest text-slate-900">
              Colors
            </h4>
            {selectedColors.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedColors([])}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableColors.map(color => {
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleValue(color, selectedColors, setSelectedColors)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10.5px] font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-orange bg-brand-orange text-white shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid min-h-[520px] grid-cols-1 gap-8 py-8 lg:grid-cols-12">
        <div className="hidden lg:block h-96 animate-pulse rounded-2xl bg-slate-100 lg:col-span-3" />
        <div className="grid grid-cols-2 gap-4 lg:col-span-9 md:grid-cols-3 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-black text-slate-900">Item Not Found</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link href="/" className="rounded-lg bg-brand-orange px-6 py-2 text-xs font-bold uppercase text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const pageTitle = searchQueryParam 
    ? `Search Results for "${searchQueryParam}"`
    : (selectedSubCategory?.name || selectedCategory?.name || item?.name || 'All Products');
  const pageDescription = searchQueryParam
    ? `Showing matching items for "${searchQueryParam}"`
    : (selectedSubCategory?.description || selectedCategory?.description || item?.description);
  const banner = selectedSubCategoryId
    ? selectedSubCategory?.banner
    : selectedCategoryId
      ? selectedCategory?.banner
      : item?.banner;

  return (
    <div className="flex w-full animate-slide-up flex-col gap-4 py-3">
      <ProductQuickView
        productId={quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-400">
        <Link href="/" className="transition-colors hover:text-slate-800">Home</Link>
        <ChevronRight className="h-3 w-3" />
        {item?.name && <span>{item.name}</span>}
        {selectedCategory?.name && (
          <><ChevronRight className="h-3 w-3" /><span>{selectedCategory.name}</span></>
        )}
        {selectedSubCategory?.name && (
          <><ChevronRight className="h-3 w-3" /><span className="font-black text-slate-900">{selectedSubCategory.name}</span></>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Desktop Sidebar (Only visible on lg+ screens) */}
        <aside className="hidden lg:flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs lg:sticky lg:top-24 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-brand-orange" />
              Categories & Filters
            </h3>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer">
                Clear All
              </button>
            )}
          </div>

          {renderFilterContent(false)}
        </aside>

        {/* Mobile Filter Off-Canvas Drawer (Left Slide-in) */}
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${
            isMobileFilterOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
              isMobileFilterOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Off-canvas panel (Left to Right) */}
          <div
            className={`fixed inset-y-0 left-0 w-[85%] max-w-[340px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
              isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/90">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-brand-orange" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer mr-1"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 no-scrollbar">
              {renderFilterContent(true)}
            </div>

            {/* Sticky Drawer Bottom Footer */}
            <div className="border-t border-slate-100 p-4 bg-white flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-[2] py-3 rounded-xl bg-brand-orange hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-orange/25 transition-all cursor-pointer active:scale-95 text-center"
              >
                Show ({filteredProducts.length}) Results
              </button>
            </div>
          </div>
        </div>

        {/* Main Product Catalog Section */}
        <main className="flex flex-col gap-6 lg:col-span-9">
          {/* Top Bar with Title, Sort, and Mobile Filter Button */}
          <div className="flex flex-col justify-between gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-sm sm:flex-row sm:items-center">
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">{pageTitle}</h1>
              {pageDescription && <p className="mt-0.5 text-xs text-slate-500">{pageDescription}</p>}
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {filteredProducts.length} products found
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Button: only visible on mobile & tablet (< lg) */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-orange text-slate-800 font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-brand-orange" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort By Dropdown */}
              <div className="flex-1 sm:flex-initial flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value)}
                  className="w-full cursor-pointer border-none bg-transparent text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {banner && (
            <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-slate-100 md:h-40">
              <img src={resolveImageUrl(banner)} alt={pageTitle} className="h-full w-full object-cover" />
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white p-16 text-center shadow-sm">
              <SlidersHorizontal className="h-10 w-10 text-slate-300" />
              <div>
                <h3 className="text-base font-bold text-slate-900">No products match your filters</h3>
                <p className="mt-1 text-xs text-slate-500">Select another category or clear the active filters.</p>
              </div>
              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} className="rounded-lg bg-brand-orange px-6 py-2 text-xs font-bold uppercase text-white cursor-pointer">
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
                {filteredProducts.slice(0, visibleCount).map(product => {
                  const galleryImages = (product.images ?? [])
                    .filter(image => image.type?.toLocaleLowerCase() === 'gallery' && image.url)
                    .map(image => image.url as string);
                  const fallbackImage = product.images?.find(image => image.url)?.url;
                  const primaryImage = galleryImages[0] || fallbackImage;
                  const hoverImage = galleryImages[1];
                  const price = productPrice(product);
                  const regularPrice = numericPrice(product.regular_price);
                  const hasDiscount = price !== null && regularPrice !== null && regularPrice > price;
                  const isLiked = likedProducts.includes(product.id.toString());

                  return (
                    <article
                      key={product.id}
                      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(product.id.toString())}
                        className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm cursor-pointer"
                        aria-label="Toggle wishlist"
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickViewProductId(product.id)}
                        className="absolute right-12 top-3 z-30 flex h-8 items-center gap-1.5 rounded-full bg-slate-950/90 px-2.5 text-[9px] font-black uppercase tracking-wider text-white opacity-100 shadow-lg transition-all duration-300 hover:bg-brand-orange md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                        aria-label={`Quick view ${product.name || 'product'}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Quick View</span>
                      </button>

                      <Link href={getProductUrl(product)} className="flex flex-1 flex-col">
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-50">
                          {regularPrice !== null && price !== null && regularPrice > price && (
                            <span className="absolute left-3 top-3 z-20 rounded-md bg-rose-500 px-2 py-1 text-[9px] font-black text-white">
                              BDT {formatPrice(regularPrice - price)} OFF
                            </span>
                          )}
                          {product.stock_status === 'out_of_stock' && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-30 pointer-events-none">
                              <span className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-rose-600/90 text-white rounded-xl shadow-lg border border-rose-500/25">
                                Out of Stock
                              </span>
                            </div>
                          )}
                          {primaryImage && (
                            <img
                              src={resolveImageUrl(primaryImage)}
                              alt={product.name || 'Product'}
                              loading="lazy"
                              decoding="async"
                              className={`h-full w-full object-contain p-2 transition-all duration-500 group-hover:scale-[1.03] ${hoverImage ? 'group-hover:opacity-0' : ''} ${product.stock_status === 'out_of_stock' ? 'opacity-50' : ''}`}
                            />
                          )}
                          {hoverImage && (
                            <img
                              src={resolveImageUrl(hoverImage)}
                              alt={product.name ? `${product.name} alternate view` : 'Alternate product view'}
                              loading="lazy"
                              decoding="async"
                              className={`absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100 ${product.stock_status === 'out_of_stock' ? 'opacity-50' : ''}`}
                            />
                          )}

                          <div className="absolute inset-0 z-20 flex items-end bg-black/10 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={event => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (product.stock_status === 'out_of_stock') return;
                                if (product.has_variant || (product.variants?.length ?? 0) > 0) {
                                  router.push(getProductUrl(product));
                                } else {
                                  handleQuickAddToCart({
                                    ...product,
                                    price: price ?? 0,
                                    image: primaryImage ? resolveImageUrl(primaryImage) : '',
                                  }, event);
                                }
                              }}
                              disabled={product.stock_status === 'out_of_stock'}
                              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase text-white cursor-pointer ${
                                product.stock_status === 'out_of_stock'
                                  ? 'bg-slate-400 cursor-not-allowed hover:bg-slate-400'
                                  : 'bg-slate-950 hover:bg-brand-orange'
                              }`}
                            >
                              <ShoppingBag className="h-4 w-4" />
                              {product.stock_status === 'out_of_stock' ? 'Out of Stock' : (product.has_variant || (product.variants?.length ?? 0) > 0 ? 'Choose Options' : 'Add to Basket')}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-1.5 p-3 sm:p-4">
                          <div>
                            {product.brand?.name && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                {product.brand.name}
                              </span>
                            )}
                            <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                              {product.name}
                            </h3>
                          </div>

                          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                            {price !== null && (
                              <div className="flex flex-wrap items-baseline gap-1.5">
                                <span className="text-xs sm:text-sm font-black text-slate-950">
                                  BDT {formatPrice(price)}
                                </span>
                                {hasDiscount && regularPrice !== null && (
                                  <span className="text-[10px] font-bold text-slate-400 line-through">
                                    BDT {formatPrice(regularPrice)}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Mobile Quick Add To Basket Button */}
                            <button
                              type="button"
                              onClick={event => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (product.stock_status === 'out_of_stock') return;
                                if (product.has_variant || (product.variants?.length ?? 0) > 0) {
                                  router.push(getProductUrl(product));
                                } else {
                                  handleQuickAddToCart({
                                    ...product,
                                    price: price ?? 0,
                                    image: primaryImage ? resolveImageUrl(primaryImage) : '',
                                  }, event);
                                }
                              }}
                              disabled={product.stock_status === 'out_of_stock'}
                              className="sm:hidden w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-brand-orange active:scale-90 transition-all shrink-0 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shadow-2xs ml-auto"
                              aria-label="Add to cart"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              {/* Load More Button if more products exist */}
              {filteredProducts.length > visibleCount && (
                <div className="flex flex-col items-center justify-center gap-2 pt-6 pb-2">
                  <span className="text-xs text-slate-400 font-semibold">
                    Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products
                  </span>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 16)}
                    className="px-8 py-3 rounded-full bg-slate-950 hover:bg-brand-orange text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopListingPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    }>
      <ShopCatalogContent />
    </React.Suspense>
  );
}
