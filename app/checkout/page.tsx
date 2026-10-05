'use client';
import { trackMetaEvent } from '../utils/pixel';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag,
  Copy,
  Printer,
  Truck,
  ArrowRight,
  ExternalLink, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Mail, 
  CreditCard, 
  Check, 
  ChevronRight,
  Plus,
  Tag,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context';

interface AddressItem {
  id: number;
  customer_id: number;
  title: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
  country_id?: number;
  division_id?: number;
  district_id?: number;
  upazila_id?: number;
  country?: { name: string; code: string };
  division?: { name: string; bn_name?: string };
  district?: { name: string; bn_name?: string };
  upazila?: { name: string; bn_name?: string };
}

interface GeoEntity {
  id: number;
  name: string;
  bn_name?: string;
  division_id?: number;
  district_id?: number;
  country_id?: number;
}

interface DeliveryZone {
  id: number;
  name: string;
  delivery_fee: number | string;
  district_ids: number[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart, user, token, showToast, resolveImageUrl, handleUpdateCartQty, handleRemoveFromCart, systemConfig } = useApp();

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (cart && cart.length > 0) {
      try {
        const cartSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        trackMetaEvent('InitiateCheckout', {
          value: cartSubtotal,
          currency: 'BDT',
          num_items: cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
          content_ids: cart.map(i => i.id)
        });
      } catch (e) {
        console.debug('InitiateCheckout tracking error:', e);
      }
    }
  }, []);


  // Guest billing state (for non-logged in users)
  const [billingName, setBillingName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const [addressMode, setAddressMode] = useState<'saved' | 'custom'>('saved');

  // Logged in user address selection
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);

  // Geo datasets for auto-detection
  const [countries, setCountries] = useState<GeoEntity[]>([]);
  const [divisions, setDivisions] = useState<GeoEntity[]>([]);
  const [districts, setDistricts] = useState<GeoEntity[]>([]);
  const [upazilas, setUpazilas] = useState<GeoEntity[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Detected location state
  const [detectedCountryId, setDetectedCountryId] = useState<number | null>(1); // Default Bangladesh
  const [detectedDivisionId, setDetectedDivisionId] = useState<number | null>(null);
  const [detectedDistrictId, setDetectedDistrictId] = useState<number | null>(null);
  const [detectedUpazilaId, setDetectedUpazilaId] = useState<number | null>(null);
  const [detectedLabels, setDetectedLabels] = useState<{
    upazila?: string;
    district?: string;
    division?: string;
  }>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Payment Method: Default is 'cod' (Cash On Delivery)
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
  
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedOrderNo, setCopiedOrderNo] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (isLoaded) {
      const storedCart = localStorage.getItem('cart');
      const cartItems = storedCart ? JSON.parse(storedCart) : [];
      if (cartItems.length === 0 && cart.length === 0) {
        showToast('Your shopping bag is empty.', 'info');
        router.push('/');
      }
    }
  }, [isLoaded, cart, router]);

  // Load geo datasets in background for smart auto-detection
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        const [countriesRes, divisionsRes, districtsRes, upazilasRes, zonesRes] = await Promise.all([
          fetch(`${cleanUrl}/countries`).catch(() => null),
          fetch(`${cleanUrl}/divisions`).catch(() => null),
          fetch(`${cleanUrl}/districts`).catch(() => null),
          fetch(`${cleanUrl}/upazilas`).catch(() => null),
          fetch(`${cleanUrl}/delivery-zones`).catch(() => null),
        ]);

        if (countriesRes?.ok) {
          const json = await countriesRes.json();
          if (json.status === 'success' && Array.isArray(json.data)) setCountries(json.data);
        }
        if (divisionsRes?.ok) {
          const json = await divisionsRes.json();
          if (json.status === 'success' && Array.isArray(json.data)) setDivisions(json.data);
        }
        if (districtsRes?.ok) {
          const json = await districtsRes.json();
          if (json.status === 'success' && Array.isArray(json.data)) setDistricts(json.data);
        }
        if (upazilasRes?.ok) {
          const json = await upazilasRes.json();
          if (json.status === 'success' && Array.isArray(json.data)) setUpazilas(json.data);
        }
        if (zonesRes?.ok) {
          const json = await zonesRes.json();
          if (json.status === 'success' && Array.isArray(json.data)) setDeliveryZones(json.data);
        }
      } catch (e) {
        console.error('Failed to load geo datasets for auto-detection:', e);
      }
    };
    fetchGeoData();
  }, []);

  // Smart Auto-detect location whenever billingAddress changes
  useEffect(() => {
    if (!billingAddress || !billingAddress.trim()) {
      setDetectedDivisionId(null);
      setDetectedDistrictId(null);
      setDetectedUpazilaId(null);
      setDetectedLabels({});
      return;
    }

    const norm = billingAddress.toLowerCase().replace(/[,.-]/g, ' ');
    const words = norm.split(/\s+/).filter(Boolean);

    let matchedUpazila: GeoEntity | null = null;
    let matchedDistrict: GeoEntity | null = null;
    let matchedDivision: GeoEntity | null = null;

    // 1. Check Upazila match (longer names checked first)
    const sortedUpazilas = [...upazilas].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
    for (const u of sortedUpazilas) {
      const uName = (u.name || '').toLowerCase().trim();
      const uBnName = (u.bn_name || '').trim();
      if (uName && uName.length >= 3 && (norm.includes(uName) || words.includes(uName))) {
        matchedUpazila = u;
        break;
      }
      if (uBnName && uBnName.length >= 2 && billingAddress.includes(uBnName)) {
        matchedUpazila = u;
        break;
      }
    }

    // If upazila matched, find its district
    if (matchedUpazila && matchedUpazila.district_id) {
      matchedDistrict = districts.find(d => d.id === matchedUpazila?.district_id) || null;
    }

    // 2. Check District match directly
    if (!matchedDistrict) {
      const sortedDistricts = [...districts].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));
      for (const d of sortedDistricts) {
        const dName = (d.name || '').toLowerCase().trim();
        const dBnName = (d.bn_name || '').trim();
        if (dName && dName.length >= 3 && (norm.includes(dName) || words.includes(dName))) {
          matchedDistrict = d;
          break;
        }
        if (dBnName && dBnName.length >= 2 && billingAddress.includes(dBnName)) {
          matchedDistrict = d;
          break;
        }
      }
    }

    // 3. Known famous Dhaka neighborhoods/sub-areas -> auto map to Dhaka district
    const dhakaAreas = [
      'dhanmondi', 'mirpur', 'gulshan', 'banani', 'uttara', 'motijheel', 'mohammadpur',
      'badda', 'bashundhara', 'rampura', 'jatrabari', 'old dhaka', 'puran dhaka', 'farmgate',
      'mohakhali', 'lalbagh', 'tejgaon', 'khilgaon', 'malibagh', 'shantinagar', 'pallabi',
      'kafrul', 'cantonment', 'wari', 'keraniganj', 'savar', 'dhamrai', 'ashulia', 'tongie', 'bawnia',
      'ধানমন্ডি', 'মিরপুর', 'গুলশান', 'বনানী', 'উত্তরা', 'মতিঝিল', 'মোহাম্মদপুর', 'বাড্ডা',
      'বসুন্ধরা', 'রামপুরা', 'যাত্রাবাড়ী', 'ফার্মগেট', 'মহাখালী', 'লালবাগ', 'তেজগাঁও', 'খিলগাঁও'
    ];
    if (!matchedDistrict) {
      for (const area of dhakaAreas) {
        if (norm.includes(area) || billingAddress.includes(area)) {
          matchedDistrict = districts.find(d => (d.name || '').toLowerCase() === 'dhaka') || null;
          // Also set as upazila label if suitable
          if (!matchedUpazila) {
            const foundThana = upazilas.find(u => (u.name || '').toLowerCase().includes(area));
            if (foundThana) matchedUpazila = foundThana;
          }
          break;
        }
      }
    }

    // 4. If district matched, find its division
    if (matchedDistrict && matchedDistrict.division_id) {
      matchedDivision = divisions.find(div => div.id === matchedDistrict?.division_id) || null;
    }

    // 5. If no division yet, match division directly
    if (!matchedDivision) {
      for (const div of divisions) {
        const divName = (div.name || '').toLowerCase().trim();
        const divBnName = (div.bn_name || '').trim();
        if (divName && divName.length >= 3 && (norm.includes(divName) || words.includes(divName))) {
          matchedDivision = div;
          break;
        }
        if (divBnName && divBnName.length >= 2 && billingAddress.includes(divBnName)) {
          matchedDivision = div;
          break;
        }
      }
    }

    // Set state
    setDetectedUpazilaId(matchedUpazila ? matchedUpazila.id : null);
    setDetectedDistrictId(matchedDistrict ? matchedDistrict.id : null);
    setDetectedDivisionId(matchedDivision ? matchedDivision.id : (matchedDistrict?.division_id || null));

    setDetectedLabels({
      upazila: matchedUpazila?.name,
      district: matchedDistrict?.name,
      division: matchedDivision?.name,
    });
  }, [billingAddress, upazilas, districts, divisions]);

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (user && token) {
      const fetchAddresses = async () => {
        setIsAddressesLoading(true);
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
          const res = await fetch(`${cleanUrl}/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (res.ok && json.status === 'success') {
            const list = json.data || [];
            setSavedAddresses(list);
            
            const defaultAddr = list.find((a: AddressItem) => a.is_default);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            } else if (list.length > 0) {
              setSelectedAddressId(list[0].id);
            }
          }
        } catch (e) {
          console.error('Failed to load billing addresses:', e);
        } finally {
          setIsAddressesLoading(false);
        }
      };
      fetchAddresses();
    }
  }, [user, token]);

  // Auto fill details if user is logged in
  useEffect(() => {
    if (user) {
      if (user.name) setBillingName(user.name);
      if (user.phone) setBillingPhone(user.phone);
      if (user.email) setBillingEmail(user.email);
    }
  }, [user]);

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  // Delivery zone resolution
  const selectedSavedAddr = savedAddresses.find(a => a.id === selectedAddressId);
  
  const effectiveDistrictId = (user && addressMode === 'saved' && selectedSavedAddr)
    ? selectedSavedAddr.district_id
    : detectedDistrictId;

  const matchedZone = useMemo(() => {
    if (effectiveDistrictId && deliveryZones.length > 0) {
      const directMatch = deliveryZones.find(zone =>
        Array.isArray(zone.district_ids) && zone.district_ids.map(Number).includes(Number(effectiveDistrictId))
      );
      if (directMatch) return directMatch;
    }

    // Default fallback zone based on district name or default first zone
    if (deliveryZones.length > 0) {
      if (detectedLabels.district?.toLowerCase() === 'dhaka') {
        return deliveryZones.find(z => z.name.toLowerCase().includes('inside dhaka')) || deliveryZones[0];
      }
      if (detectedLabels.district && detectedLabels.district.toLowerCase() !== 'dhaka') {
        return deliveryZones.find(z => z.name.toLowerCase().includes('outside dhaka')) || deliveryZones[deliveryZones.length - 1];
      }
      return deliveryZones[0];
    }
    return null;
  }, [effectiveDistrictId, deliveryZones, detectedLabels.district]);

  const activeZoneName = matchedZone ? matchedZone.name : (detectedLabels.district ? (detectedLabels.district.toLowerCase() === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka') : 'Standard Delivery');

  // Use exact backend delivery zone fee
  const baseDeliveryFee = matchedZone 
    ? Number(matchedZone.delivery_fee) 
    : (detectedLabels.district ? (detectedLabels.district.toLowerCase() === 'dhaka' ? 80 : 180) : 80);
  const shippingCost = cart.length === 0 ? 0 : baseDeliveryFee;
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'FABRILIFE10') {
      setDiscountPercent(10);
      showToast('Promo code applied! 10% discount added.', 'success');
    } else {
      showToast('Invalid coupon code. Try "FABRILIFE10"', 'error');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (user && addressMode === 'saved') {
      if (!selectedAddressId) {
        showToast('Please select a shipping address.', 'error');
        return;
      }
    } else {
      if (!billingName.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      if (!billingPhone.trim()) {
        showToast('Please enter your phone number.', 'error');
        return;
      }
      if (!billingAddress.trim()) {
        showToast('Please enter your delivery address.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    showToast('Placing your order, please wait...', 'info');

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      // Map cart items for API payload format
      const itemsPayload = cart.map(item => {
        const parts = item.id.split('-');
        const product_id = parseInt(parts[0], 10);
        const variant_id = (parts[1] && parts[1] !== 'default') ? parseInt(parts[1], 10) : null;
        return {
          product_id,
          variant_id,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          color: item.colorName || null
        };
      });

      // Prepare billing fields
      const finalName = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.name : billingName;
      const finalPhone = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.phone : billingPhone;
      const finalEmail = (user && addressMode === 'saved') ? (user.email || '') : billingEmail;
      const finalAddress = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.address : billingAddress;

      const finalCountryId = (user && addressMode === 'saved' && selectedSavedAddr) 
        ? selectedSavedAddr.country_id 
        : (detectedCountryId || 1);

      const finalDivisionId = (user && addressMode === 'saved' && selectedSavedAddr) 
        ? selectedSavedAddr.division_id 
        : detectedDivisionId;

      const finalDistrictId = (user && addressMode === 'saved' && selectedSavedAddr) 
        ? selectedSavedAddr.district_id 
        : detectedDistrictId;

      const finalUpazilaId = (user && addressMode === 'saved' && selectedSavedAddr) 
        ? selectedSavedAddr.upazila_id 
        : detectedUpazilaId;

      const payload = {
        name: finalName,
        phone: finalPhone,
        email: finalEmail || null,
        address: finalAddress,
        country_id: finalCountryId ? Number(finalCountryId) : 1,
        division_id: finalDivisionId ? Number(finalDivisionId) : null,
        district_id: finalDistrictId ? Number(finalDistrictId) : null,
        upazila_id: finalUpazilaId ? Number(finalUpazilaId) : null,
        payment_method: paymentMethod,
        coupon_code: couponCode ? couponCode.trim() : null,
        items: itemsPayload
      };

      const res = await fetch(`${cleanUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Order placed successfully!', 'success');
        setPlacedOrder(json.data);

        // Meta Pixel & CAPI Deduplicated Purchase Event
        try {
          trackMetaEvent('Purchase', {
            value: Number(json.data?.grand_total || 0),
            currency: 'BDT',
            content_ids: itemsPayload.map(i => String(i.product_id)),
            num_items: itemsPayload.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0),
            order_id: String(json.data?.order_no || '')
          }, {
            eventID: String(json.data?.order_no || '')
          });
        } catch (e) {
          console.debug('Purchase tracking error:', e);
        }

        // Clear Cart
        setCart([]);
        localStorage.removeItem('cart');
      } else {
        showToast(json.message || 'Failed to place order. Please check input details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error. Failed to send order placement request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // INVOICE / ORDER SUCCESS SCREEN
  // -------------------------------------------------------------
  if (placedOrder) {
    const handleCopyOrderId = () => {
      if (placedOrder?.order_no) {
        navigator.clipboard.writeText(placedOrder.order_no);
        setCopiedOrderNo(true);
        showToast('Order ID copied to clipboard!', 'success');
        setTimeout(() => setCopiedOrderNo(false), 2500);
      }
    };

    return (
      <div className="w-full py-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Hero Banner - Clear message "Your order is placed" */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden no-print">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <span className="inline-block bg-white/20 text-emerald-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1 border border-white/20">
                  Order Confirmed
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Your order is placed!
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
                  Thank you for shopping with us. Your order has been placed successfully and is being prepared.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-all cursor-pointer select-none"
              >
                {copiedOrderNo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOrderNo ? 'Copied ID' : 'Copy ID'}</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/track-order')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black transition-all shadow-md cursor-pointer select-none"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Confirmation Receipt */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden print-invoice">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
            <div>
              {systemConfig?.logo ? (
                <img src={systemConfig.logo} alt={systemConfig.title || 'Logo'} className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{systemConfig?.title || 'CLOTHING STORE'}</h2>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Official Order Confirmation Receipt</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">
                RECEIPT #{placedOrder.order_no}
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-2">
                Placed Date: <span className="text-slate-800 font-bold">{new Date(placedOrder.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-100 my-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                Delivery Address
              </span>
              <h4 className="font-extrabold text-sm text-slate-900">{placedOrder.name}</h4>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {placedOrder.phone}
              </p>
              {placedOrder.email && (
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {placedOrder.email}
                </p>
              )}
              <p className="text-xs text-slate-700 font-semibold leading-relaxed mt-1.5 bg-white p-2.5 rounded-lg border border-slate-100">
                {placedOrder.address}
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand-orange" />
                  Payment & Delivery Status
                </span>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Payment Method</span>
                    <span className="font-extrabold text-slate-900 uppercase">
                      {placedOrder.payment_method === 'cod' ? 'Cash on Delivery (COD)' : (placedOrder.payment_method || 'Cash on Delivery')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Order Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 capitalize bg-amber-50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {placedOrder.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Estimated Delivery</span>
                    <span className="font-bold text-slate-700">2-3 Business Days</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-medium">
                💡 Please keep the exact amount ready in cash upon delivery. Our representative will contact you before dispatch.
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3.5">Item Details</th>
                  <th className="px-4 py-3.5 text-center">Qty</th>
                  <th className="px-4 py-3.5 text-right">Price</th>
                  <th className="px-4 py-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {placedOrder.items && placedOrder.items.map((item: any, idx: number) => {
                  const itemImg = item.product?.image || item.image;
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {itemImg && (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <img src={resolveImageUrl(itemImg)} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <span className="block font-extrabold text-slate-900 text-xs sm:text-sm">
                              {item.product?.name || item.name || 'Product Item'}
                            </span>
                            {(item.size || item.color) && (
                              <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">
                                {item.size ? 'Size: ' + item.size : ''} {item.size && item.color ? '| ' : ''} {item.color ? 'Color: ' + item.color : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-900 font-bold">{item.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-600">BDT {item.price}</td>
                      <td className="px-4 py-3.5 text-right text-slate-900 font-black">
                        BDT {Number(item.price) * Number(item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-72 flex flex-col gap-2.5 text-xs font-semibold text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-150">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-slate-900 font-extrabold">BDT {placedOrder.subtotal}</span>
              </div>
              {Number(placedOrder.discount_amount) > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- BDT {placedOrder.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Shipping / Delivery Fee</span>
                <span className="text-slate-900 font-extrabold">
                  {Number(placedOrder.delivery_fee) === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    'BDT ' + placedOrder.delivery_fee
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-sm font-black text-slate-950">
                <span>Grand Total</span>
                <span className="text-brand-orange text-base font-black">BDT {placedOrder.grand_total}</span>
              </div>
            </div>
          </div>

          {/* Action buttons (hidden when printing) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 no-print">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <span>Order Reference: <strong className="text-slate-700">#{placedOrder.order_no}</strong></span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-slate-200 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-brand-orange/20"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CHECKOUT FORM SCREEN
  // -------------------------------------------------------------
  return (
    <div className="w-full py-8 max-w-7xl mx-auto px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
        <span>HOME</span>
        <ChevronRight className="h-3 w-3" />
        <span>SHOPPING BAG</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-black text-slate-900">CHECKOUT</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BILLING & PAYMENT INFORMATION */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Billing & Shipping Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-black uppercase text-slate-950 tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-brand-orange" />
              Shipping &amp; Billing Address
            </h2>

            {user && (
              <div className="flex gap-4 border-b border-slate-100 pb-3 mb-4">
                <button
                  type="button"
                  onClick={() => setAddressMode('saved')}
                  className={`text-xs font-black uppercase tracking-wider pb-1.5 border-b-2 transition-all cursor-pointer ${
                    addressMode === 'saved'
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-slate-400 hover:text-slate-650'
                  }`}
                >
                  Saved Addresses
                </button>
                <button
                  type="button"
                  onClick={() => setAddressMode('custom')}
                  className={`text-xs font-black uppercase tracking-wider pb-1.5 border-b-2 transition-all cursor-pointer ${
                    addressMode === 'custom'
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-slate-400 hover:text-slate-650'
                  }`}
                >
                  Add / Custom Address
                </button>
              </div>
            )}

            {user && addressMode === 'saved' ? (
              /* LOGGED IN SAVED ADDRESSES */
              <div>
                {isAddressesLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading saved addresses...</div>
                ) : savedAddresses.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center gap-3">
                    <p className="text-xs text-slate-500 font-semibold">No saved addresses found.</p>
                    <button
                      type="button"
                      onClick={() => setAddressMode('custom')}
                      className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg uppercase"
                    >
                      Enter Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/20 shadow-md'
                            : 'border-slate-150 bg-white hover:border-slate-350'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{addr.title}</span>
                          {selectedAddressId === addr.id && (
                            <span className="w-4 h-4 bg-brand-orange text-white rounded-full flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900">{addr.name}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{addr.phone}</p>
                        <p className="text-xs text-slate-700 font-bold leading-normal mt-1 max-w-full">
                          {addr.address}
                          {(addr.upazila?.name || addr.district?.name) && (
                            <span className="block text-[10px] text-slate-400 font-bold mt-1">
                              {addr.upazila?.name && `${addr.upazila.name}, `}
                              {addr.district?.name && `${addr.district.name}, `}
                              {addr.division?.name && `${addr.division.name}, `}
                              {addr.country?.name || ''}
                            </span>
                          )}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* STREAMLINED CUSTOM / GUEST BILLING FORM */
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tanim Rahman"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01712345678"
                        value={billingPhone}
                        onChange={(e) => setBillingPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address Field with Smart Auto-detection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Full Delivery Address
                    </label>
                    <span className="text-[9px] font-bold text-slate-400">
                      Include house/road, area &amp; district
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. House 42, Road 11, Dhanmondi, Dhaka (বা আপনার সম্পূর্ণ ঠিকানা লিখুন)"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 leading-relaxed transition-colors"
                    />
                  </div>

                  {/* Auto-detected location indicator badge */}
                  {billingAddress.trim().length > 0 && (
                    <div className="mt-1">
                      {detectedLabels.district || detectedLabels.upazila ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/70 rounded-lg text-emerald-800 text-[11px] font-bold animate-fadeIn">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">
                            Location: <span className="font-extrabold">{detectedLabels.upazila ? `${detectedLabels.upazila}, ` : ''}{detectedLabels.district}</span>
                            {detectedLabels.division && detectedLabels.division !== detectedLabels.district && ` (${detectedLabels.division} Division)`}
                          </span>
                          <span className="ml-auto text-[10px] uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded font-black whitespace-nowrap">
                            {activeZoneName} (৳{shippingCost})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200/80 rounded-lg text-slate-600 text-[10.5px] font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                          <span>Type your district or area (e.g. Dhaka, Chittagong, Sylhet) to auto-detect delivery zone.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-black uppercase text-slate-950 tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-brand-orange" />
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/20 shadow-md'
                    : 'border-slate-150 bg-white hover:border-slate-350'
                }`}
              >
                <div className="w-4 h-4 border border-brand-orange rounded-full flex items-center justify-center flex-shrink-0">
                  {paymentMethod === 'cod' && (
                    <div className="w-2.5 h-2.5 bg-brand-orange rounded-full" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-900 uppercase">Cash on Delivery</span>
                  <span className="block text-[9px] text-slate-400 font-bold mt-0.5">Pay with cash upon delivery</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl sticky top-24">
            <h2 className="text-sm font-black uppercase text-slate-950 tracking-wider mb-5 flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShoppingBag className="w-4 h-4 text-brand-orange" />
              Order Summary
            </h2>

            {/* Cart Items List */}
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2 mb-6 border-b border-slate-100 pb-5">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">
                        Size: {item.size} | Color: {item.colorName}
                      </span>
                      {/* Quantity Controller Buttons */}
                      <div className="flex items-center gap-1.5 border border-slate-200 rounded bg-slate-50 overflow-hidden ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              handleUpdateCartQty(item.id, item.quantity - 1);
                            } else {
                              handleRemoveFromCart(item.id);
                            }
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-black text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-black text-slate-800 w-3 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                          className="px-1.5 py-0.5 text-[10px] font-black text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 flex-shrink-0">
                    BDT {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code section */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>

            {/* Summary details */}
            <div className="flex flex-col gap-2.5 text-xs border-b border-slate-100 pb-5 mb-5">
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>Subtotal</span>
                <span>BDT {subtotal}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon Discount ({discountPercent}%)</span>
                  <span>- BDT {discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>
                  Shipping Cost{' '}
                  {activeZoneName && (
                    <span className="text-[10px] text-slate-400 font-bold lowercase italic">
                      ({activeZoneName})
                    </span>
                  )}
                </span>
                <span className={shippingCost === 0 ? 'text-emerald-600 font-bold' : ''}>
                  {shippingCost === 0 ? 'FREE' : `BDT ${shippingCost}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-slate-900 mb-6">
              <span>Grand Total</span>
              <span className="text-lg text-brand-orange font-extrabold">BDT {total}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs uppercase tracking-wider flex justify-center items-center gap-2 disabled:bg-slate-350 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
