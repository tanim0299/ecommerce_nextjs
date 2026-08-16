'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../context';
import SafeHtml from '../../components/SafeHtml';

type PriceValue = number | string | null;

interface Relation {
  id: number;
  name: string;
}

interface Brand extends Relation {
  logo?: string | null;
}

interface ProductImage {
  url?: string;
  type?: string;
  sl_no?: number;
  variant_id?: number;
  variant_name?: string;
}

interface Specification {
  key?: string;
  title?: string;
  value?: string;
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
  name?: string;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  image?: string | null;
  sort_order?: number;
  attributes?: VariantAttribute[];
  stock_qty?: number;
  stock_status?: string;
}

interface ProductDetail {
  id: number;
  sku?: string;
  name?: string;
  description?: string | null;
  specification?: Specification[] | null;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  has_variant?: boolean;
  has_warranty?: boolean;
  is_active?: boolean;
  images?: ProductImage[];
  item?: Relation | null;
  category?: Relation | null;
  sub_category?: Relation | null;
  brand?: Brand | null;
  unit?: Relation | null;
  warranty?: string | null;
  variants?: ProductVariant[];
  stock_qty?: number;
  stock_status?: string;
}

interface AttributeGroup {
  id: number;
  name: string;
  values: Array<{ id: number; name: string }>;
}

const numericPrice = (value?: PriceValue) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (value: number) => new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 2,
}).format(value);

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const {
    cart,
    handleAddToCart,
    handleUpdateCartQty,
    likedProducts,
    handleToggleWishlist,
    setIsCartOpen,
    resolveImageUrl,
  } = useApp();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');
      setProduct(null);

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const response = await fetch(`${cleanUrl}/products/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Product not found.' : 'Unable to load this product.');
        }

        const json = await response.json();
        if (json.status !== 'success' || !json.data) {
          throw new Error('Invalid product response.');
        }

        const data = json.data as ProductDetail;
        const sortedVariants = [...(data.variants ?? [])]
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const normalizedProduct = { ...data, variants: sortedVariants };
        const firstVariant = sortedVariants[0];
        const firstImage = data.images?.find(image => image.type?.toLocaleLowerCase() === 'main' && image.url)?.url
          || data.images?.find(image => image.type?.toLocaleLowerCase() === 'gallery' && image.url)?.url
          || data.images?.find(image => image.url)?.url
          || firstVariant?.image
          || '';

        setProduct(normalizedProduct);
        setSelectedImage(firstImage);
        setSelectedVariantId(firstVariant?.id ?? null);
        setSelectedAttributes(Object.fromEntries(
          (firstVariant?.attributes ?? []).map(attribute => [attribute.attribute_id, attribute.value_id])
        ));
        setQuantity(1);
        setActiveTab(data.description ? 'description' : 'specifications');
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load this product.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  const variants = useMemo(() => product?.variants ?? [], [product]);

  const selectedVariant = useMemo(
    () => variants.find(variant => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    const groups = new Map<number, AttributeGroup>();

    variants.forEach(variant => {
      (variant.attributes ?? []).forEach(attribute => {
        const group = groups.get(attribute.attribute_id) ?? {
          id: attribute.attribute_id,
          name: attribute.attribute_name,
          values: [],
        };

        if (!group.values.some(value => value.id === attribute.value_id)) {
          group.values.push({ id: attribute.value_id, name: attribute.value_name });
        }
        groups.set(attribute.attribute_id, group);
      });
    });

    return Array.from(groups.values());
  }, [variants]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const images = (product.images ?? [])
      .filter(image => image.type?.toLocaleLowerCase() === 'gallery')
      .map(image => ({
        url: image.url,
        label: product.name || 'Gallery image',
      }));

    const seen = new Set<string>();
    return images.filter((image): image is { url: string; label: string } => {
      if (!image.url || seen.has(image.url)) return false;
      seen.add(image.url);
      return true;
    });
  }, [product]);

  const salePrice = numericPrice(selectedVariant?.sale_price ?? product?.sale_price);
  const fallbackDiscountPrice = numericPrice(selectedVariant?.discount_price ?? product?.discount_price);
  const regularPrice = numericPrice(selectedVariant?.regular_price ?? product?.regular_price);
  const displayedPrice = salePrice ?? fallbackDiscountPrice ?? regularPrice;
  const hasDiscount = displayedPrice !== null && regularPrice !== null && regularPrice > displayedPrice;
  const savingAmount = hasDiscount ? regularPrice - displayedPrice : null;

  const colorAttribute = selectedVariant?.attributes?.find(attribute =>
    attribute.attribute_name.toLocaleLowerCase().includes('color')
  );
  const sizeAttribute = selectedVariant?.attributes?.find(attribute =>
    attribute.attribute_name.toLocaleLowerCase().includes('size')
  );
  const cartItemId = product
    ? `${product.id}-${selectedVariant?.id ?? 'default'}`
    : '';
  const selectedCartItem = cart.find(item => item.id === cartItemId);
  
  const isOutOfStock = selectedVariant 
    ? selectedVariant.stock_status === 'out_of_stock' 
    : product?.stock_status === 'out_of_stock';
  const displayedQuantity = selectedCartItem?.quantity ?? quantity;

  const selectAttribute = (attributeId: number, valueId: number) => {
    const nextSelection = { ...selectedAttributes, [attributeId]: valueId };
    let matchingVariant = variants.find(variant =>
      Object.entries(nextSelection).every(([selectedAttributeId, selectedValueId]) =>
        variant.attributes?.some(attribute =>
          attribute.attribute_id === Number(selectedAttributeId)
          && attribute.value_id === selectedValueId
        )
      )
    );

    if (!matchingVariant) {
      matchingVariant = variants.find(variant =>
        variant.attributes?.some(attribute =>
          attribute.attribute_id === attributeId && attribute.value_id === valueId
        )
      );
    }

    if (!matchingVariant) return;

    setSelectedVariantId(matchingVariant.id);
    setSelectedAttributes(Object.fromEntries(
      (matchingVariant.attributes ?? []).map(attribute => [attribute.attribute_id, attribute.value_id])
    ));
    if (matchingVariant.image) setSelectedImage(matchingVariant.image);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!product || selectedCartItem || displayedPrice === null) return;

    handleAddToCart({
      id: cartItemId,
      name: selectedVariant?.name
        ? `${product.name || 'Product'} - ${selectedVariant.name}`
        : (product.name || 'Product'),
      price: displayedPrice,
      size: sizeAttribute?.value_name || '',
      colorName: colorAttribute?.value_name || '',
      colorHex: '#111827',
      quantity,
      image: selectedImage ? resolveImageUrl(selectedImage) : '',
    });
    setIsCartOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[520px] grid-cols-1 gap-10 py-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-slate-100" />
        <div className="flex flex-col gap-5 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested product is unavailable.'}</p>
        <Link
          href="/"
          className="rounded-lg bg-brand-orange px-6 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-orange-600"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const specifications = (product.specification ?? []).filter(specification =>
    (specification.key || specification.title) && specification.value
  );
  const hasTabs = Boolean(product.description) || specifications.length > 0;
  const currentImage = selectedImage || galleryImages[0]?.url || '';

  return (
    <div className="flex w-full animate-slide-up flex-col gap-10 py-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/" className="transition-colors hover:text-slate-800">HOME</Link>
        {product.category?.name && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{product.category.name.toUpperCase()}</span>
          </>
        )}
        {product.sub_category?.name && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{product.sub_category.name.toUpperCase()}</span>
          </>
        )}
        {product.name && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="font-black text-slate-900">{product.name.toUpperCase()}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            {currentImage ? (
              <img
                src={resolveImageUrl(currentImage)}
                alt={product.name || 'Product'}
                className="h-full w-full object-contain p-3 md:p-5"
              />
            ) : (
              <span className="text-sm font-semibold text-slate-400">No image available</span>
            )}
          </div>

          {galleryImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map(image => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setSelectedImage(image.url)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition-all md:w-24 ${
                    currentImage === image.url
                      ? 'border-brand-orange ring-2 ring-brand-orange/20'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                  title={image.label}
                >
                  <img
                    src={resolveImageUrl(image.url)}
                    alt={image.label}
                    className="h-full w-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {product.brand?.logo && (
                <img
                  src={resolveImageUrl(product.brand.logo)}
                  alt={product.brand.name || 'Brand'}
                  className="h-7 w-auto object-contain"
                />
              )}
              {product.brand?.name && (
                <span className="rounded-md border border-brand-orange/20 bg-brand-orange/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  {product.brand.name}
                </span>
              )}
              {product.unit?.name && (
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Per {product.unit.name}
                </span>
              )}
              {isOutOfStock ? (
                <span className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600">
                  Out of Stock
                </span>
              ) : (
                <span className="rounded-md border border-emerald-250 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-650">
                  In Stock
                </span>
              )}
            </div>
            {product.name && (
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {product.name}
              </h1>
            )}
            {(selectedVariant?.sku || product.sku) && (
              <p className="text-xs text-slate-500">SKU: {selectedVariant?.sku || product.sku}</p>
            )}
          </div>

          {displayedPrice !== null && (
            <div className="flex flex-wrap items-baseline gap-3 border-y border-slate-200/60 py-4">
              {hasDiscount && regularPrice !== null && (
                <span className="text-sm font-semibold text-slate-400 line-through">
                  BDT {formatPrice(regularPrice)}
                </span>
              )}
              <span className="text-3xl font-black text-slate-950">
                BDT {formatPrice(displayedPrice)}
              </span>
              {savingAmount !== null && (
                <span className="rounded bg-rose-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700">
                  Save BDT {formatPrice(savingAmount)}
                </span>
              )}
            </div>
          )}

          {attributeGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Select {group.name}:{' '}
                <span className="text-slate-900">
                  {group.values.find(value => value.id === selectedAttributes[group.id])?.name}
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {group.values.map(value => {
                  const isSelected = selectedAttributes[group.id] === value.id;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => selectAttribute(group.id, value.id)}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black transition-all ${
                        isSelected
                          ? 'border-brand-orange bg-brand-orange text-white shadow-md'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {value.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {product.has_variant && variants.length > 0 && attributeGroups.length === 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Variant</span>
              <div className="flex flex-wrap gap-2">
                {variants.map(variant => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      if (variant.image) setSelectedImage(variant.image);
                    }}
                    className={`rounded-xl border px-4 py-3 text-xs font-black transition-all ${
                      selectedVariantId === variant.id
                        ? 'border-brand-orange bg-brand-orange text-white'
                        : 'border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {variant.name || variant.sku || `Variant ${variant.id}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  if (selectedCartItem) {
                    handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity - 1);
                  } else {
                    setQuantity(previous => Math.max(1, previous - 1));
                  }
                }}
                disabled={displayedQuantity <= 1}
                className="px-4 py-2 text-slate-500 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-black text-slate-900">{displayedQuantity}</span>
              <button
                type="button"
                onClick={() => {
                  if (selectedCartItem) {
                    handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity + 1);
                  } else {
                    setQuantity(previous => previous + 1);
                  }
                }}
                className="px-4 py-2 text-slate-500 transition-colors hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={Boolean(selectedCartItem) || displayedPrice === null || isOutOfStock}
              className={`flex h-12 min-w-[220px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black uppercase tracking-wider text-white transition-all ${
                selectedCartItem || displayedPrice === null || isOutOfStock
                  ? 'cursor-not-allowed bg-slate-450 opacity-60'
                  : 'bg-brand-orange shadow-lg hover:bg-orange-600 hover:shadow-xl'
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {isOutOfStock 
                ? 'Out of Stock' 
                : selectedCartItem 
                ? 'Already in Shopping Bag' 
                : 'Add to Shopping Bag'}
            </button>

            <button
              type="button"
              onClick={() => handleToggleWishlist(product.id.toString())}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                likedProducts.includes(product.id.toString())
                  ? 'border-rose-200 bg-rose-50 text-rose-500'
                  : 'border-slate-200 text-slate-400 hover:text-slate-800'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-5 w-5 ${likedProducts.includes(product.id.toString()) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {product.has_warranty && product.warranty && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-black text-slate-800">Warranty: </span>{product.warranty}
            </div>
          )}
        </div>
      </div>

      {hasTabs && (
        <div className="mt-2 border-t border-slate-200 pt-8">
          <div className="flex items-center gap-6 border-b border-slate-100">
            {product.description && (
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`border-b-2 pb-3 text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'description'
                    ? 'border-brand-orange text-slate-900'
                    : 'border-transparent text-slate-400'
                }`}
              >
                Description
              </button>
            )}
            {specifications.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('specifications')}
                className={`border-b-2 pb-3 text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'specifications'
                    ? 'border-brand-orange text-slate-900'
                    : 'border-transparent text-slate-400'
                }`}
              >
                Specifications
              </button>
            )}
          </div>

          <div className="py-6 text-sm leading-7 text-slate-600">
            {activeTab === 'description' && product.description && (
              <SafeHtml html={product.description} className="product-rich-text" />
            )}
            {activeTab === 'specifications' && specifications.length > 0 && (
              <dl className="max-w-2xl overflow-hidden rounded-xl border border-slate-100">
                {specifications.map((specification, index) => (
                  <div
                    key={`${specification.key || specification.title}-${index}`}
                    className="grid grid-cols-[minmax(120px,1fr)_2fr] gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                  >
                    <dt className="font-black text-slate-800">{specification.key || specification.title}</dt>
                    <dd>{specification.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
