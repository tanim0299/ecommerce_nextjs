'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  Copy,
  Printer,
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ArrowRight,
  Sparkles,
  Package,
  Calendar,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp, getProductUrl } from '../context';

interface OrderItem {
  id?: number;
  product_id?: number;
  variant_id?: number | null;
  name?: string;
  sku?: string;
  image?: string | null;
  quantity: number;
  price?: number | string;
  unit_price?: number | string;
  total_price?: number | string;
  size?: string | null;
  color?: string | null;
  product?: {
    id?: number;
    name?: string;
    sku?: string;
    image?: string;
    slug?: string;
  };
  variant?: {
    id?: number;
    name?: string;
    sku?: string;
    image?: string;
  };
}

interface OrderDetails {
  id?: number;
  order_no: string;
  current_status?: string;
  status?: string;
  order_status?: string;
  order_date?: string;
  order_time?: string;
  created_at?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  address?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string | null;
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
  subtotal?: number | string;
  sub_total?: number | string;
  discount_amount?: number | string;
  discount?: number | string;
  delivery_fee?: number | string;
  shipping_charge?: number | string;
  grand_total?: number | string;
  products?: OrderItem[];
  items?: OrderItem[];
  summary?: {
    subtotal?: number | string;
    discount_amount?: number | string;
    delivery_fee?: number | string;
    grand_total?: number | string;
  };
}

export default function OrderSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolveImageUrl, systemConfig } = useApp();

  const queryOrderNo = searchParams.get('order_no') || '';
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrderData = async () => {
      setIsLoading(true);
      setLoadError('');

      // 1. Try checking sessionStorage first for instantaneous load
      if (typeof window !== 'undefined') {
        try {
          const cached = sessionStorage.getItem('last_placed_order');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!queryOrderNo || parsed.order_no === queryOrderNo) {
              if (isMounted) {
                setOrder(parsed);
                setIsLoading(false);
              }
              return;
            }
          }
        } catch (e) {
          console.debug('Failed to parse cached order:', e);
        }
      }

      // 2. Fetch from backend tracking API if order_no is available
      if (queryOrderNo) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

          const res = await fetch(`${cleanUrl}/orders/track/${encodeURIComponent(queryOrderNo)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.status === 'success' && json.data && isMounted) {
              setOrder(json.data);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to fetch order details:', err);
        }
      }

      if (isMounted) {
        if (!queryOrderNo) {
          setLoadError('No order number specified.');
        } else {
          setLoadError('Unable to load order details at the moment.');
        }
        setIsLoading(false);
      }
    };

    loadOrderData();

    return () => {
      isMounted = false;
    };
  }, [queryOrderNo]);

  const handleCopyOrderNo = (orderNo: string) => {
    if (!orderNo) return;
    navigator.clipboard.writeText(orderNo);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Helper getters
  const orderNumber = order?.order_no || queryOrderNo || 'N/A';
  const customerName = order?.customer?.name || order?.name || 'Valued Customer';
  const customerPhone = order?.customer?.phone || order?.phone || '';
  const customerEmail = order?.customer?.email || order?.email || '';
  
  const customerAddress = order?.shipping_address?.address 
    || order?.address 
    || [
        order?.shipping_address?.upazila,
        order?.shipping_address?.district,
        order?.shipping_address?.division
      ].filter(Boolean).join(', ')
    || 'Address on file';

  const paymentMethod = order?.payment_method === 'cod' 
    ? 'Cash on Delivery (COD)' 
    : (order?.payment_method ? order.payment_method.replace(/_/g, ' ').toUpperCase() : 'Cash on Delivery (COD)');

  const orderStatus = order?.current_status || order?.order_status || order?.status || 'Pending';

  const orderItems: OrderItem[] = order?.products || order?.items || [];

  const subtotal = Number(order?.summary?.subtotal ?? order?.subtotal ?? order?.sub_total ?? 0);
  const discount = Number(order?.summary?.discount_amount ?? order?.discount_amount ?? order?.discount ?? 0);
  const deliveryFee = Number(order?.summary?.delivery_fee ?? order?.delivery_fee ?? order?.shipping_charge ?? 0);
  const grandTotal = Number(order?.summary?.grand_total ?? order?.grand_total ?? (subtotal - discount + deliveryFee));

  const orderDateFormatted = order?.order_date 
    ? `${order.order_date} ${order?.order_time || ''}`.trim()
    : order?.created_at 
      ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
            <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Loading Order Details</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Please wait while we verify your order information...</p>
        </div>
      </div>
    );
  }

  if (loadError && !order) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-slate-200 shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 text-amber-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Order Confirmation</h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            {loadError}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
            <button
              onClick={() => router.push('/track-order')}
              className="flex-1 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>Track Your Order</span>
            </button>
            <button
              onClick={() => router.push('/shop')}
              className="flex-1 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* ================================================================= */}
        {/* CELEBRATION HERO BANNER                                           */}
        {/* ================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-10 shadow-2xl shadow-emerald-950/15 mb-6 no-print">
          {/* Background Decorative Blur Circles */}
          <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-12 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5] text-emerald-200" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 text-emerald-100 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 border border-white/25">
                  <Sparkles className="w-3 h-3" />
                  Order Placed Successfully
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Thank You, {customerName.split(' ')[0]}!
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 leading-relaxed max-w-xl">
                  Your order has been received and is being prepared. We will contact you soon for confirmation and delivery dispatch.
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleCopyOrderNo(orderNumber)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition-all cursor-pointer select-none backdrop-blur-sm"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied ID' : 'Copy Order ID'}</span>
              </button>
              <Link
                href={`/track-order?order_no=${encodeURIComponent(orderNumber)}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-black transition-all shadow-lg cursor-pointer select-none"
              >
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Track Live</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN ORDER INVOICE CARD                                          */}
        {/* ================================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden print-invoice">

          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
            <div>
              {systemConfig?.logo ? (
                <img
                  src={resolveImageUrl(systemConfig.logo)}
                  alt={systemConfig.title || 'Brand Logo'}
                  className="h-10 w-auto max-w-[200px] object-contain"
                />
              ) : (
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {systemConfig?.title || 'SLOOR'}
                </h2>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Official Order Confirmation & Receipt
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-black tracking-wider px-3.5 py-1.5 rounded-lg uppercase shadow-sm">
                <span>INVOICE #{orderNumber}</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center sm:justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Placed Date: <strong className="text-slate-800">{orderDateFormatted}</strong></span>
              </p>
            </div>
          </div>

          {/* Customer & Delivery Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-150 my-6">
            
            {/* Delivery Address */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  Delivery Details
                </span>
                <h4 className="font-black text-sm text-slate-900">{customerName}</h4>
                <div className="mt-1 space-y-1 text-xs text-slate-600 font-semibold">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customerPhone || 'Not provided'}</span>
                  </p>
                  {customerEmail && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customerEmail}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold leading-relaxed shadow-2xs">
                {customerAddress}
              </div>
            </div>

            {/* Payment & Order Status */}
            <div className="flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                  Payment & Delivery Status
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Payment Method</span>
                    <span className="font-extrabold text-slate-900">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Current Status</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full capitalize text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Estimated Delivery</span>
                    <span className="font-bold text-slate-700">2 - 3 Business Days</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Please keep exact cash ready upon delivery. Our agent will contact you before dispatch.</span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ITEMS BREAKDOWN TABLE                                           */}
          {/* =============================================================== */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6">
            <div className="bg-slate-100/75 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ordered Products ({orderItems.length})</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5 text-center">Quantity</th>
                  <th className="px-4 py-3.5 text-right">Unit Price</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => {
                    const itemImg = item.product?.image || item.image || item.variant?.image;
                    const itemPrice = Number(item.unit_price ?? item.price ?? 0);
                    const itemQty = Number(item.quantity ?? 1);
                    const itemTotal = Number(item.total_price ?? (itemPrice * itemQty));
                    const itemName = item.product?.name || item.name || 'Product Item';
                    const itemLink = item.product?.slug ? getProductUrl(item.product) : null;

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                              {itemImg ? (
                                <img
                                  src={resolveImageUrl(itemImg)}
                                  alt={itemName}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              {itemLink ? (
                                <Link
                                  href={itemLink}
                                  className="block font-black text-slate-900 text-xs sm:text-sm hover:text-orange-600 transition-colors"
                                >
                                  {itemName}
                                </Link>
                              ) : (
                                <span className="block font-black text-slate-900 text-xs sm:text-sm">
                                  {itemName}
                                </span>
                              )}
                              {(item.size || item.color || item.variant?.name) && (
                                <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">
                                  {item.size ? `Size: ${item.size}` : ''}
                                  {item.size && item.color ? ' • ' : ''}
                                  {item.color ? `Color: ${item.color}` : ''}
                                  {!item.size && !item.color && item.variant?.name ? item.variant.name : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-900 font-black text-xs">
                          {itemQty}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                          ৳{itemPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-900 font-black">
                          ৳{itemTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-xs">
                      No item details found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =============================================================== */}
          {/* TOTALS SUMMARY                                                  */}
          {/* =============================================================== */}
          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-80 flex flex-col gap-2.5 text-xs font-semibold text-slate-600 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 font-extrabold">৳{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ৳{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delivery Charge</span>
                <span className="text-slate-900 font-extrabold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">Free</span>
                  ) : (
                    `৳${deliveryFee.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-sm font-black text-slate-950">
                <span>Grand Total</span>
                <span className="text-orange-600 text-lg font-black">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ACTION BUTTONS                                                  */}
          {/* =============================================================== */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 no-print">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>A representative will contact you shortly.</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/track-order?order_no=${encodeURIComponent(orderNumber)}`}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order</span>
              </Link>

              <Link
                href="/shop"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
