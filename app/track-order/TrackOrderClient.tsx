'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  LoaderCircle,
  MapPin,
  Mail,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
} from 'lucide-react';

interface TrackingHistoryItem {
  status: string;
  date: string;
  time: string;
}

interface TrackingData {
  order_no: string;
  current_status: string;
  order_date?: string;
  order_time?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  shipping_address?: {
    address?: string;
    country?: string;
    division?: string;
    district?: string;
    upazila?: string;
  };
  payment_method?: string;
  coupon_code?: string | null;
  products?: TrackingProduct[];
  summary?: {
    subtotal?: number | string;
    discount_amount?: number | string;
    delivery_fee?: number | string;
    grand_total?: number | string;
  };
  history: TrackingHistoryItem[];
}

interface TrackingProduct {
  product_id: number;
  name: string;
  sku?: string;
  image?: string;
  variant_id?: number | null;
  variant?: string | null;
  variant_sku?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
}

interface TrackingResponse {
  status: string;
  message: string;
  data?: TrackingData;
}

const statusDetails: Record<string, { label: string; description: string }> = {
  pending: {
    label: 'Order placed',
    description: 'We have received your order and it is waiting for confirmation.',
  },
  confirmed: {
    label: 'Order confirmed',
    description: 'Your order has been confirmed and is ready for processing.',
  },
  processing: {
    label: 'Processing',
    description: 'Your items are being carefully checked and packed.',
  },
  shipped: {
    label: 'Shipped',
    description: 'Your parcel has left our facility and is on the way.',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    description: 'Your parcel is with the delivery partner and arriving soon.',
  },
  delivered: {
    label: 'Delivered',
    description: 'Your order has been delivered successfully.',
  },
  completed: {
    label: 'Completed',
    description: 'Your order has been completed successfully.',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order has been cancelled.',
  },
  returned: {
    label: 'Returned',
    description: 'This order has been returned.',
  },
};

const normalizeStatus = (status: string) => status.trim().toLowerCase().replace(/[\s-]+/g, '_');

const getStatusDetails = (status: string) => {
  const normalized = normalizeStatus(status);
  return statusDetails[normalized] || {
    label: normalized.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()),
    description: 'Your order status has been updated.',
  };
};

const getStatusIcon = (status: string) => {
  switch (normalizeStatus(status)) {
    case 'pending':
      return Clock3;
    case 'confirmed':
      return CheckCircle2;
    case 'processing':
      return Box;
    case 'shipped':
    case 'out_for_delivery':
      return Truck;
    case 'delivered':
    case 'completed':
      return PackageCheck;
    default:
      return PackageSearch;
  }
};

const formatMoney = (value?: number | string) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(
    Number.isFinite(amount) ? amount : 0,
  );
};

const formatPaymentMethod = (method?: string) => {
  if (!method) return 'Not specified';
  if (method.toLowerCase() === 'cod') return 'Cash on delivery';
  return method.replace(/[_-]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
};

const resolveTrackingImageUrl = (image?: string) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  try {
    return new URL(image, new URL(apiBaseUrl).origin).toString();
  } catch {
    return image;
  }
};

function TrackingProductImage({ product }: { product: TrackingProduct }) {
  const [hasError, setHasError] = React.useState(false);
  const imageUrl = resolveTrackingImageUrl(product.image);

  if (!imageUrl || hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-100 text-slate-300">
        <Box className="h-7 w-7" />
        <span className="text-[8px] font-black uppercase tracking-wider">No image</span>
      </div>
    );
  }

  return (
    // Product media comes from the order tracking API and may use its own host.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={product.name}
      onError={() => setHasError(true)}
      className="h-full w-full object-cover transition duration-300 group-hover/product:scale-105"
    />
  );
}

export default function TrackOrderClient({ initialOrderNo = '' }: { initialOrderNo?: string }) {
  const [orderNo, setOrderNo] = React.useState(initialOrderNo);
  const [tracking, setTracking] = React.useState<TrackingData | null>(null);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const autoLoadedOrderRef = React.useRef('');

  const trackOrder = React.useCallback(async (requestedOrderNo: string) => {
    const cleanOrderNo = requestedOrderNo.trim();
    if (!cleanOrderNo) {
      setTracking(null);
      setError('Please enter your order number.');
      return;
    }

    setOrderNo(cleanOrderNo);
    setIsLoading(true);
    setTracking(null);
    setError('');

    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.set('order_no', cleanOrderNo);
    window.history.replaceState(null, '', pageUrl);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanApiUrl = apiBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanApiUrl}/orders/track/${encodeURIComponent(cleanOrderNo)}`, {
        headers: { Accept: 'application/json' },
      });

      let result: TrackingResponse | null = null;
      try {
        result = (await response.json()) as TrackingResponse;
      } catch {
        result = null;
      }

      if (!response.ok || result?.status !== 'success' || !result.data) {
        throw new Error(result?.message || 'We could not find an order with that number.');
      }

      setOrderNo(result.data.order_no || cleanOrderNo);
      setTracking({
        ...result.data,
        products: Array.isArray(result.data.products) ? result.data.products : [],
        history: Array.isArray(result.data.history) ? result.data.history : [],
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load tracking right now. Please try again shortly.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialOrderNo || autoLoadedOrderRef.current === initialOrderNo) return;
    autoLoadedOrderRef.current = initialOrderNo;
    // The query parameter represents an explicit order selected from the customer profile.
    void trackOrder(initialOrderNo);
  }, [initialOrderNo, trackOrder]);

  const handleTrackOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void trackOrder(orderNo);
  };

  const currentStatus = tracking ? getStatusDetails(tracking.current_status) : null;
  const isException = tracking
    ? ['cancelled', 'returned'].includes(normalizeStatus(tracking.current_status))
    : false;
  const shippingLocation = tracking?.shipping_address
    ? [
        tracking.shipping_address.upazila,
        tracking.shipping_address.district,
        tracking.shipping_address.division,
        tracking.shipping_address.country,
      ].filter((value, index, locations) => value && locations.indexOf(value) === index)
    : [];

  return (
    <div className="-mx-4 -mt-2 min-h-screen bg-[#f6f6f4] md:-mt-4">
      <section className="border-b border-slate-200 bg-white px-4 py-10 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white">
            <PackageSearch className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Track your order</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your order number for a complete order and delivery update.</p>

          <form onSubmit={handleTrackOrder} className="mx-auto mt-7 flex max-w-xl flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Order number</span>
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderNo}
                onChange={(event) => {
                  setOrderNo(event.target.value);
                  if (error) setError('');
                }}
                placeholder="Order number"
                autoComplete="off"
                spellCheck={false}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-sm outline-none transition placeholder:normal-case placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-xs font-black uppercase tracking-wider text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Checking</> : <>Track order <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-7 md:px-6 md:py-10">
        {error && (
          <div role="alert" className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Tracking information unavailable</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{error}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Check the number in your confirmation message and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {tracking && currentStatus && (
          <div className="animate-slide-up space-y-6">
            {/* Invoice-style order summary */}
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <header className="flex flex-col gap-5 border-b border-slate-200 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600">Order summary</p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">#{tracking.order_no}</h2>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${isException ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isException ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {currentStatus.label}
                  </span>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {[tracking.order_date, tracking.order_time].filter(Boolean).join(' · ') || 'Order date unavailable'}
                  </p>
                </div>
              </header>

              <div className="grid border-b border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
                <div className="border-b border-slate-100 p-5 md:border-b-0 md:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Billed to</p>
                  <p className="mt-3 text-sm font-black text-slate-900">{tracking.customer?.name || 'Customer'}</p>
                  {tracking.customer?.phone && <a href={`tel:${tracking.customer.phone}`} className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 hover:text-orange-600"><Smartphone className="h-3.5 w-3.5" />{tracking.customer.phone}</a>}
                  {tracking.customer?.email && <a href={`mailto:${tracking.customer.email}`} className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-slate-500 hover:text-orange-600"><Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{tracking.customer.email}</span></a>}
                </div>
                <div className="border-b border-slate-100 p-5 md:border-b-0 md:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Ship to</p>
                  <p className="mt-3 text-xs font-bold leading-5 text-slate-800">{tracking.shipping_address?.address || 'Address unavailable'}</p>
                  {shippingLocation.length > 0 && <p className="mt-1 text-xs leading-5 text-slate-500">{shippingLocation.join(', ')}</p>}
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Payment</p>
                  <div className="mt-3 flex items-center gap-2 text-sm font-black text-slate-900"><CreditCard className="h-4 w-4 text-slate-400" />{formatPaymentMethod(tracking.payment_method)}</div>
                  <p className="mt-2 text-xs text-slate-500">Coupon: <span className="font-bold text-slate-700">{tracking.coupon_code || 'Not applied'}</span></p>
                </div>
              </div>

              <div className="px-5 py-2 md:px-8 md:py-3">
                <div className="hidden grid-cols-[1fr_100px_70px_110px] gap-4 border-b border-slate-200 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 md:grid">
                  <span>Item</span><span className="text-right">Price</span><span className="text-center">Qty</span><span className="text-right">Total</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {tracking.products?.map((product, index) => (
                    <div key={`${product.product_id}-${product.variant_id ?? 'base'}-${index}`} className="grid gap-4 py-5 md:grid-cols-[1fr_100px_70px_110px] md:items-center">
                      <div className="flex min-w-0 gap-3">
                        <Link href={`/product/${product.product_id}`} className="group/product flex h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <TrackingProductImage key={`${product.product_id}-${product.variant_id ?? 'base'}-${product.image ?? 'none'}`} product={product} />
                        </Link>
                        <div className="min-w-0 py-0.5">
                          <Link href={`/product/${product.product_id}`} className="line-clamp-2 text-sm font-black text-slate-900 hover:text-orange-600">{product.name}</Link>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{product.variant_sku || product.sku || 'N/A'}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {product.variant && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">{product.variant}</span>}
                            {!product.variant && product.color && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">{product.color}</span>}
                            {!product.variant && product.size && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">Size {product.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs md:block md:text-right"><span className="font-bold text-slate-400 md:hidden">Unit price</span><span className="font-bold text-slate-700">BDT {formatMoney(product.unit_price)}</span></div>
                      <div className="flex justify-between text-xs md:block md:text-center"><span className="font-bold text-slate-400 md:hidden">Quantity</span><span className="font-black text-slate-700">{product.quantity}</span></div>
                      <div className="flex justify-between text-sm md:block md:text-right"><span className="font-bold text-slate-400 md:hidden">Total</span><span className="font-black text-slate-950">BDT {formatMoney(product.line_total)}</span></div>
                    </div>
                  ))}
                  {!tracking.products?.length && <p className="py-8 text-center text-sm text-slate-500">No item details are available.</p>}
                </div>
              </div>

              {tracking.summary && (
                <footer className="flex justify-end border-t border-slate-200 bg-slate-50/70 p-5 md:px-8 md:py-6">
                  <dl className="w-full space-y-2.5 text-sm sm:w-72">
                    <div className="flex justify-between text-slate-500"><dt>Subtotal</dt><dd className="font-bold text-slate-800">BDT {formatMoney(tracking.summary.subtotal)}</dd></div>
                    <div className="flex justify-between text-slate-500"><dt>Discount</dt><dd className="font-bold text-emerald-600">− BDT {formatMoney(tracking.summary.discount_amount)}</dd></div>
                    <div className="flex justify-between text-slate-500"><dt>Delivery fee</dt><dd className="font-bold text-slate-800">BDT {formatMoney(tracking.summary.delivery_fee)}</dd></div>
                    <div className="flex items-end justify-between border-t border-slate-200 pt-3"><dt className="font-black text-slate-950">Grand total</dt><dd className="text-xl font-black tracking-tight text-slate-950">BDT {formatMoney(tracking.summary.grand_total)}</dd></div>
                  </dl>
                </footer>
              )}
            </article>

            {/* Tracking follows the invoice */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-8">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Shipment progress</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">Order tracking</h3>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-black text-slate-900">{currentStatus.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{currentStatus.description}</p>
                </div>
              </div>

              {tracking.history.length > 0 ? (
                <ol className="mt-7 flex flex-col md:flex-row">
                  {tracking.history.map((item, index) => {
                    const details = getStatusDetails(item.status);
                    const StatusIcon = getStatusIcon(item.status);
                    const isLatest = index === tracking.history.length - 1;
                    const isLast = index === tracking.history.length - 1;
                    return (
                      <li key={`${item.status}-${item.date}-${item.time}-${index}`} className="relative flex flex-1 gap-4 pb-7 last:pb-0 md:block md:pb-0 md:pr-3">
                        {!isLast && <><span className="absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 bg-slate-200 md:hidden" /><span className="absolute left-9 right-0 top-[17px] hidden h-0.5 bg-slate-200 md:block" /></>}
                        <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${isLatest ? isException ? 'border-red-500 bg-red-500 text-white' : 'border-orange-500 bg-orange-500 text-white' : 'border-slate-950 bg-slate-950 text-white'}`}>
                          {isLatest ? <StatusIcon className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </span>
                        <div className="pt-0.5 md:mt-3 md:pr-3">
                          <h4 className={`text-xs font-black ${isLatest ? 'text-orange-600' : 'text-slate-900'}`}>{details.label}</h4>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">{item.date}</p>
                          <p className="text-[10px] text-slate-400">{item.time}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-7 text-center"><Clock3 className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-2 text-sm font-bold text-slate-600">Tracking history will appear here soon.</p></div>
              )}
            </section>
          </div>
        )}

        {!tracking && !error && !isLoading && (
          <div className="mx-auto grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
            {[
              { icon: Search, title: 'Enter order ID', text: 'Use the order number from your confirmation message.' },
              { icon: ShieldCheck, title: 'Secure lookup', text: 'Your order information stays private and protected.' },
              { icon: MapPin, title: 'Follow the journey', text: 'See every update from confirmation to delivery.' },
            ].map(({ icon: FeatureIcon, title, text }) => (
              <div key={title} className="bg-white p-5 text-center">
                <FeatureIcon className="mx-auto h-5 w-5 text-slate-400" />
                <h2 className="mt-3 text-xs font-black text-slate-900">{title}</h2>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-1 pt-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
              <Headphones className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900">Need help with your order?</p>
              <p className="mt-0.5 text-xs text-slate-500">Our support team is ready to assist you.</p>
            </div>
          </div>
          <Link href="/" className="text-xs font-black uppercase tracking-wider text-slate-700 transition hover:text-orange-600">
            Continue shopping <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
