'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Mail, 
  CreditCard, 
  Check, 
  ChevronRight,
  Plus,
  Tag
} from 'lucide-react';
import { useApp } from '../context';
import SearchableSelect from '../components/SearchableSelect';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart, user, token, showToast, resolveImageUrl, handleUpdateCartQty, handleRemoveFromCart } = useApp();

  const [isLoaded, setIsLoaded] = useState(false);

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

  // Dropdown states for shipping address
  const [countries, setCountries] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [upazilas, setUpazilas] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<string | number>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | number>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | number>('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string | number>('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Payment Method: Default is 'cod' (Cash On Delivery)
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
  
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect if cart is empty, only after client component has mounted and had time to load cart from localStorage
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

  // Load initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        // Fetch countries
        const countriesRes = await fetch(`${cleanUrl}/countries`);
        if (countriesRes.ok) {
          const countriesJson = await countriesRes.json();
          if (countriesJson.status === 'success' && Array.isArray(countriesJson.data)) {
            setCountries(countriesJson.data);
            
            // Try to detect user country by IP
            try {
              const ipRes = await fetch('https://ipapi.co/json/');
              if (ipRes.ok) {
                const ipJson = await ipRes.json();
                const detectedCode = ipJson.country_code || 'BD';
                const matchedCountry = countriesJson.data.find(
                  (c: any) => c.code?.toLowerCase() === detectedCode.toLowerCase()
                );
                if (matchedCountry) {
                  setSelectedCountryId(matchedCountry.id);
                } else {
                  const bd = countriesJson.data.find((c: any) => c.code?.toLowerCase() === 'bd');
                  if (bd) setSelectedCountryId(bd.id);
                }
              }
            } catch (ipError) {
              const bd = countriesJson.data.find((c: any) => c.code?.toLowerCase() === 'bd');
              if (bd) setSelectedCountryId(bd.id);
            }
          }
        }

        // Fetch divisions
        const divisionsRes = await fetch(`${cleanUrl}/divisions`);
        if (divisionsRes.ok) {
          const divisionsJson = await divisionsRes.json();
          if (divisionsJson.status === 'success' && Array.isArray(divisionsJson.data)) {
            setDivisions(divisionsJson.data);
          }
        }

        // Fetch delivery zones
        const zonesRes = await fetch(`${cleanUrl}/delivery-zones`);
        if (zonesRes.ok) {
          const zonesJson = await zonesRes.json();
          if (zonesJson.status === 'success' && Array.isArray(zonesJson.data)) {
            setDeliveryZones(zonesJson.data);
          }
        }
      } catch (e) {
        console.error('Failed to fetch initial checkout options:', e);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch districts when division changes
  useEffect(() => {
    if (!selectedDivisionId) {
      setDistricts([]);
      setSelectedDistrictId('');
      setUpazilas([]);
      setSelectedUpazilaId('');
      setDeliveryFee(null);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/districts?division_id=${selectedDivisionId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            setDistricts(json.data);
          }
        }
      } catch (e) {
        console.error('Failed to fetch districts:', e);
      }
    };
    fetchDistricts();
  }, [selectedDivisionId]);

  // Fetch upazilas and calculate delivery zone shipping cost when district changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setUpazilas([]);
      setSelectedUpazilaId('');
      setDeliveryFee(null);
      return;
    }

    const fetchUpazilas = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const res = await fetch(`${cleanUrl}/upazilas?district_id=${selectedDistrictId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            setUpazilas(json.data);
          }
        }
      } catch (e) {
        console.error('Failed to fetch upazilas:', e);
      }
    };
    fetchUpazilas();

    // Check matching delivery zone
    const matchedZone = deliveryZones.find(zone => {
      if (Array.isArray(zone.district_ids)) {
        return zone.district_ids.map(Number).includes(Number(selectedDistrictId));
      }
      return false;
    });

    if (matchedZone) {
      setDeliveryFee(Number(matchedZone.delivery_fee));
    } else {
      setDeliveryFee(null);
    }
  }, [selectedDistrictId, deliveryZones]);

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
            
            // Auto select default address
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

  // Look up shipping fee for saved address based on its district_id
  const selectedSavedAddr = savedAddresses.find(a => a.id === selectedAddressId);
  
  const matchedSavedZone = selectedSavedAddr && selectedSavedAddr.district_id
    ? deliveryZones.find(zone => Array.isArray(zone.district_ids) && zone.district_ids.map(Number).includes(Number(selectedSavedAddr.district_id)))
    : null;
    
  const matchedCustomZone = selectedDistrictId
    ? deliveryZones.find(zone => Array.isArray(zone.district_ids) && zone.district_ids.map(Number).includes(Number(selectedDistrictId)))
    : null;

  const activeZone = (user && addressMode === 'saved') ? matchedSavedZone : matchedCustomZone;
  const activeZoneName = activeZone ? activeZone.name : '';

  const savedAddressFee = matchedSavedZone ? matchedSavedZone.delivery_fee : null;

  const shippingCost = (user && addressMode === 'saved') 
    ? (savedAddressFee !== null ? Number(savedAddressFee) : null) 
    : deliveryFee;
  const total = subtotal - discountAmount + (shippingCost || 0);

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

    // Verification
    if (user && addressMode === 'saved') {
      if (!selectedAddressId) {
        showToast('Please select a shipping address.', 'error');
        return;
      }
    } else {
      if (!billingName || !billingPhone || !billingAddress) {
        showToast('Please fill in Name, Phone, and Shipping Address details.', 'error');
        return;
      }
      if (!selectedCountryId || !selectedDivisionId || !selectedDistrictId || !selectedUpazilaId) {
        showToast('Please select Country, Division, District, and Upazila.', 'error');
        return;
      }
    }

    if (shippingCost === null) {
      showToast('Please select your shipping location (Division & District) to calculate delivery charge.', 'error');
      return;
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

      const finalCountryId = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.country_id : selectedCountryId;
      const finalDivisionId = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.division_id : selectedDivisionId;
      const finalDistrictId = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.district_id : selectedDistrictId;
      const finalUpazilaId = (user && addressMode === 'saved' && selectedSavedAddr) ? selectedSavedAddr.upazila_id : selectedUpazilaId;

      const payload = {
        name: finalName,
        phone: finalPhone,
        email: finalEmail || null,
        address: finalAddress,
        country_id: finalCountryId ? Number(finalCountryId) : null,
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
        
        // Clear Cart
        setCart([]);
        localStorage.removeItem('cart');
      } else {
        showToast(json.message || 'Failed to place order. Please check input parameters.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error. Failed to send order placement request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="w-full py-12 max-w-3xl mx-auto px-4 animate-slide-up">
        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="bg-white border border-slate-150 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          
          {/* Printable Style Overlay */}
          <style>{`
            @media print {
              body {
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              header, footer, nav, button, .no-print {
                display: none !important;
                height: 0 !important;
                overflow: hidden !important;
              }
              #printable-invoice {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
              }
            }
          `}</style>

          {/* Success Checkmark Banner */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100 no-print">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Thank You For Your Order!</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Your order has been placed successfully and is being processed.</p>
          </div>

          {/* Brand Logo & Order Header */}
          <div className="flex justify-between items-start pt-8 pb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tighter">BELIEVERS</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Premium Apparel Store</p>
            </div>
            <div className="text-right">
              <span className="bg-slate-900 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase">
                INVOICE
              </span>
              <p className="text-xs font-black text-slate-800 mt-2.5">#{placedOrder.order_no}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                Date: {new Date(placedOrder.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-100 my-6 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shipping Details</span>
              <h4 className="font-extrabold text-slate-900">{placedOrder.name}</h4>
              <p className="text-slate-500 font-semibold">{placedOrder.phone}</p>
              {placedOrder.email && <p className="text-slate-450 font-medium">{placedOrder.email}</p>}
              <p className="text-slate-700 font-bold leading-relaxed mt-1">
                {placedOrder.address}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Payment Details</span>
              <p className="text-slate-700 font-bold">
                Method: <span className="uppercase text-brand-orange">{placedOrder.payment_method}</span>
              </p>
              <p className="text-slate-700 font-bold">
                Status: <span className="capitalize">{placedOrder.status}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-150 rounded-2xl overflow-hidden mt-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-black uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {placedOrder.items && placedOrder.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3.5">
                      <span className="block font-extrabold text-slate-800">{item.product?.name || 'Product'}</span>
                      {item.size || item.color ? (
                        <span className="text-[9px] text-slate-400 uppercase mt-0.5 block">
                          Size: {item.size} | Color: {item.color}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-900">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right">BDT {item.price}</td>
                    <td className="px-4 py-3.5 text-right text-slate-900 font-extrabold">
                      BDT {Number(item.price) * Number(item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end mt-6">
            <div className="w-full sm:w-64 flex flex-col gap-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-slate-900 font-extrabold">BDT {placedOrder.subtotal}</span>
              </div>
              {Number(placedOrder.discount_amount) > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>- BDT {placedOrder.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                <span className="text-slate-900 font-extrabold">BDT {placedOrder.delivery_fee}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-brand-orange text-base">BDT {placedOrder.grand_total}</span>
              </div>
            </div>
          </div>

          {/* Action buttons (no-print) */}
          <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-slate-100 justify-end no-print">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              Print Invoice / PDF
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand-orange/15"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>
    );
  }

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
              Shipping & Billing Address
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
                  Ship to a New Address
                </button>
              </div>
            )}

            {user && addressMode === 'saved' ? (
              /* LOGGED IN USER ADDRESS SELECTOR */
              <div className="flex flex-col gap-4">
                {isAddressesLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-orange" />
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-500">No saved addresses found.</p>
                    <button
                      onClick={() => {
                        setAddressMode('custom');
                      }}
                      className="mt-3 px-4 py-2 bg-brand-orange text-white font-bold text-[10px] uppercase rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      Enter Address Manually
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
              /* GUEST USER / CUSTOM ADDRESS BILLING FORM */
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. +8801712345678"
                        value={billingPhone}
                        onChange={(e) => setBillingPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Country Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Country</label>
                    <SearchableSelect
                      options={countries.map(c => ({ id: c.id, name: c.name }))}
                      value={selectedCountryId}
                      onChange={(val) => setSelectedCountryId(val)}
                      placeholder="Select Country"
                    />
                  </div>

                  {/* Division Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Division</label>
                    <SearchableSelect
                      options={divisions.map(d => ({ id: d.id, name: `${d.name} ${d.bn_name ? `(${d.bn_name})` : ''}` }))}
                      value={selectedDivisionId}
                      onChange={(val) => setSelectedDivisionId(val)}
                      placeholder="Select Division"
                      disabled={!selectedCountryId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* District Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">District</label>
                    <SearchableSelect
                      options={districts.map(d => ({ id: d.id, name: `${d.name} ${d.bn_name ? `(${d.bn_name})` : ''}` }))}
                      value={selectedDistrictId}
                      onChange={(val) => setSelectedDistrictId(val)}
                      placeholder="Select District"
                      disabled={!selectedDivisionId}
                    />
                  </div>

                  {/* Upazila Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Upazila</label>
                    <SearchableSelect
                      options={upazilas.map(u => ({ id: u.id, name: `${u.name} ${u.bn_name ? `(${u.bn_name})` : ''}` }))}
                      value={selectedUpazilaId}
                      onChange={(val) => setSelectedUpazilaId(val)}
                      placeholder="Select Upazila"
                      disabled={!selectedDistrictId}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Detailed Address (Street/House/Area)</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. House 42, Road 11, Banani"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 resize-none"
                  />
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
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
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
                <span>{shippingCost === 0 ? 'FREE' : `BDT ${shippingCost}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-slate-900 mb-6">
              <span>Grand Total</span>
              <span className="text-lg text-brand-orange">BDT {total}</span>
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
