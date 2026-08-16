'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useApp } from '../context';
import SafeHtml from './SafeHtml';

type PriceValue = number | string | null;

interface QuickViewImage {
  url?: string;
  type?: string;
}

interface QuickViewAttribute {
  attribute_id: number;
  attribute_name: string;
  value_id: number;
  value_name: string;
}

interface QuickViewVariant {
  id: number;
  name?: string;
  sku?: string;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  image?: string | null;
  attributes?: QuickViewAttribute[];
}

interface AttributeGroup {
  id: number;
  name: string;
  values: Array<{ id: number; name: string }>;
}

interface QuickViewProduct {
  id: number;
  name?: string;
  description?: string | null;
  sale_price?: PriceValue;
  regular_price?: PriceValue;
  discount_price?: PriceValue;
  has_variant?: boolean;
  images?: QuickViewImage[];
  brand?: { name?: string } | null;
  category?: { name?: string } | null;
  sub_category?: { name?: string } | null;
  variants?: QuickViewVariant[];
}

interface ProductQuickViewProps {
  productId: number | null;
  onClose: () => void;
}

const numericPrice = (value?: PriceValue) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatPrice = (value: number) => new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 2,
}).format(value);

export default function ProductQuickView({ productId, onClose }: ProductQuickViewProps) {
  const {
    cart,
    handleAddToCart,
    handleUpdateCartQty,
    setIsCartOpen,
    resolveImageUrl,
  } = useApp();
  const [product, setProduct] = useState<QuickViewProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
  const [variantImage, setVariantImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId === null) return;
    const controller = new AbortController();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);

    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');
      setProduct(null);
      setSelectedImageIndex(0);

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const response = await fetch(`${cleanUrl}/products/${productId}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load product details.');
        const json = await response.json();
        if (json.status !== 'success' || !json.data) throw new Error('Product details are unavailable.');
        const data = json.data as QuickViewProduct;
        const firstVariant = data.variants?.[0];
        setProduct(data);
        setSelectedVariantId(firstVariant?.id ?? null);
        setSelectedAttributes(Object.fromEntries(
          (firstVariant?.attributes ?? []).map(attribute => [attribute.attribute_id, attribute.value_id])
        ));
        setVariantImage(firstVariant?.image || '');
        setQuantity(1);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load product details.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => {
      controller.abort();
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, productId]);

  const images = useMemo(() => {
    if (!product) return [];
    const gallery = (product.images ?? [])
      .filter(image => ['main', 'gallery'].includes(image.type?.toLocaleLowerCase() || '') && image.url)
      .map(image => image.url as string);
    const fallback = product.images?.find(image => image.url)?.url;
    return gallery.length > 0 ? Array.from(new Set(gallery)) : (fallback ? [fallback] : []);
  }, [product]);

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const selectedVariant = useMemo(
    () => variants.find(variant => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const attributeGroups = useMemo<AttributeGroup[]>(() => {
    const groups = new Map<number, AttributeGroup>();
    variants.forEach(variant => variant.attributes?.forEach(attribute => {
      const group = groups.get(attribute.attribute_id) ?? {
        id: attribute.attribute_id,
        name: attribute.attribute_name,
        values: [],
      };
      if (!group.values.some(value => value.id === attribute.value_id)) {
        group.values.push({ id: attribute.value_id, name: attribute.value_name });
      }
      groups.set(attribute.attribute_id, group);
    }));
    return Array.from(groups.values());
  }, [variants]);

  if (productId === null) return null;

  const salePrice = numericPrice(selectedVariant?.sale_price ?? product?.sale_price)
    ?? numericPrice(selectedVariant?.discount_price ?? product?.discount_price)
    ?? numericPrice(selectedVariant?.regular_price ?? product?.regular_price);
  const regularPrice = numericPrice(selectedVariant?.regular_price ?? product?.regular_price);
  const hasDiscount = salePrice !== null && regularPrice !== null && regularPrice > salePrice;
  const hasVariants = Boolean(product?.has_variant || (product?.variants?.length ?? 0) > 0);
  const currentImage = variantImage || images[selectedImageIndex];
  const colorAttribute = selectedVariant?.attributes?.find(attribute =>
    attribute.attribute_name.toLocaleLowerCase().includes('color')
  );
  const sizeAttribute = selectedVariant?.attributes?.find(attribute =>
    attribute.attribute_name.toLocaleLowerCase().includes('size')
  );
  const cartItemId = product ? `${product.id}-${selectedVariant?.id ?? 'default'}` : '';
  const selectedCartItem = cart.find(item => item.id === cartItemId);
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
      matchingVariant = variants.find(variant => variant.attributes?.some(attribute =>
        attribute.attribute_id === attributeId && attribute.value_id === valueId
      ));
    }
    if (!matchingVariant) return;

    setSelectedVariantId(matchingVariant.id);
    setSelectedAttributes(Object.fromEntries(
      (matchingVariant.attributes ?? []).map(attribute => [attribute.attribute_id, attribute.value_id])
    ));
    setVariantImage(matchingVariant.image || '');
    setQuantity(1);
  };

  const addToBasket = () => {
    if (!product || salePrice === null || selectedCartItem) return;
    handleAddToCart({
      id: cartItemId,
      name: selectedVariant?.name
        ? `${product.name || 'Product'} - ${selectedVariant.name}`
        : (product.name || 'Product'),
      price: salePrice,
      size: sizeAttribute?.value_name || '',
      colorName: colorAttribute?.value_name || '',
      colorHex: '#111827',
      quantity,
      image: currentImage ? resolveImageUrl(currentImage) : '',
    });
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm animate-quick-view-backdrop sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Product quick view"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl animate-quick-view-modal">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-lg transition-transform hover:scale-105 hover:text-slate-950"
          aria-label="Close quick view"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-2">
            <div className="animate-pulse bg-slate-100" />
            <div className="flex flex-col gap-5 p-8">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-4/5 animate-pulse rounded bg-slate-100" />
              <div className="h-7 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-24 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-bold text-slate-700">{error || 'Product details are unavailable.'}</p>
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-950 px-5 py-2 text-xs font-bold text-white">Close</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex min-h-[360px] flex-col bg-slate-50 p-5 md:min-h-[540px]">
              <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl">
                {currentImage ? (
                  <img src={resolveImageUrl(currentImage)} alt={product.name || 'Product'} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-sm font-semibold text-slate-400">No image available</span>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setVariantImage('');
                        setSelectedImageIndex(index => (index - 1 + images.length) % images.length);
                      }}
                      className="absolute left-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVariantImage('');
                        setSelectedImageIndex(index => (index + 1) % images.length);
                      }}
                      className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      onClick={() => {
                        setVariantImage('');
                        setSelectedImageIndex(index);
                      }}
                      className={`h-2 rounded-full transition-all ${!variantImage && index === selectedImageIndex ? 'w-7 bg-brand-orange' : 'w-2 bg-slate-300'}`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.brand?.name && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange">{product.brand.name}</span>}
                {product.sub_category?.name && <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase text-slate-500">{product.sub_category.name}</span>}
              </div>
              <h2 className="text-2xl font-black leading-tight text-slate-900">{product.name}</h2>

              {salePrice !== null && (
                <div className="mt-5 flex flex-wrap items-baseline gap-3 border-y border-slate-100 py-4">
                  {hasDiscount && regularPrice !== null && <span className="text-sm font-bold text-slate-400 line-through">BDT {formatPrice(regularPrice)}</span>}
                  <span className="text-2xl font-black text-slate-950">BDT {formatPrice(salePrice)}</span>
                  {hasDiscount && regularPrice !== null && (
                    <span className="rounded bg-rose-100 px-2 py-1 text-[10px] font-black text-rose-600">SAVE BDT {formatPrice(regularPrice - salePrice)}</span>
                  )}
                </div>
              )}

              {product.description && (
                <SafeHtml
                  html={product.description}
                  className="product-rich-text product-rich-text--compact mt-5 text-sm leading-6 text-slate-600"
                />
              )}

              {hasVariants && attributeGroups.map(group => (
                <div key={group.id} className="mt-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Select {group.name}:{' '}
                    <span className="text-slate-900">
                      {group.values.find(value => value.id === selectedAttributes[group.id])?.name}
                    </span>
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.values.map(value => {
                      const isSelected = selectedAttributes[group.id] === value.id;
                      return (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() => selectAttribute(group.id, value.id)}
                          className={`flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-black transition-colors ${
                            isSelected
                              ? 'border-brand-orange bg-brand-orange text-white'
                              : 'border-slate-200 text-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}{value.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {hasVariants && attributeGroups.length === 0 && (
                <div className="mt-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Option</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variants.map(variant => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setVariantImage(variant.image || '');
                          setQuantity(1);
                        }}
                        className={`rounded-lg border px-3 py-2 text-[10px] font-black ${
                          selectedVariantId === variant.id
                            ? 'border-brand-orange bg-brand-orange text-white'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {variant.name || variant.sku || `Option ${variant.id}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-7">
                <div className="flex gap-3">
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
                      className="px-3 text-slate-500 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-black text-slate-900">{displayedQuantity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCartItem) {
                          handleUpdateCartQty(selectedCartItem.id, selectedCartItem.quantity + 1);
                        } else {
                          setQuantity(previous => previous + 1);
                        }
                      }}
                      className="px-3 text-slate-500"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addToBasket}
                    disabled={salePrice === null || Boolean(selectedCartItem)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {selectedCartItem ? 'Already in Basket' : 'Add to Basket'}
                  </button>
                </div>
                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-xs font-black uppercase tracking-wider text-slate-700 hover:border-slate-400"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
