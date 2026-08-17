'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  KeyRound, 
  Save, 
  Home as HomeIcon, 
  ShoppingBag, 
  Star, 
  Camera,
  Heart,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Check,
  PackageSearch,
  Copy
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
  created_at: string;
  updated_at: string;
  country_id?: number;
  division_id?: number;
  district_id?: number;
  upazila_id?: number;
  country?: { id: number; name: string; code: string };
  division?: { id: number; country_id: number; name: string; bn_name?: string };
  district?: { id: number; division_id: number; name: string; bn_name?: string };
  upazila?: { id: number; district_id: number; name: string; bn_name?: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, token, setToken, cart, likedProducts, showToast, resolveImageUrl } = useApp();

  // Tab State: 'overview' | 'personal-info' | 'change-password' | 'orders' | 'reviews' | 'addresses'
  const [activeTab, setActiveTab] = useState<'overview' | 'personal-info' | 'change-password' | 'orders' | 'reviews' | 'addresses'>('overview');

  // Personal Info Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar state
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Cropper Modal States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Address tab states
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDetails, setAddrDetails] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  
  // Address dropdown states
  const [countries, setCountries] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [upazilas, setUpazilas] = useState<any[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<string | number>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | number>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | number>('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string | number>('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileOrders, setProfileOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [copiedOrderNo, setCopiedOrderNo] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with user context
  useEffect(() => {
    if (!user && !localStorage.getItem('user')) {
      router.push('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      if (user.avatar) {
        setAvatar(resolveImageUrl(user.avatar));
      } else {
        const savedAvatar = localStorage.getItem('user_avatar');
        if (savedAvatar) setAvatar(savedAvatar);
      }
    }
  }, [user, router, resolveImageUrl]);

  // Fetch addresses and dropdown options when switching to addresses tab
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
      
      const fetchInitialFormOptions = async () => {
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
        } catch (e) {
          console.error('Failed to load address selection data:', e);
        }
      };
      fetchInitialFormOptions();
    }
  }, [activeTab]);

  // Fetch districts when division changes in profile
  useEffect(() => {
    if (!selectedDivisionId) {
      setDistricts([]);
      setSelectedDistrictId('');
      setUpazilas([]);
      setSelectedUpazilaId('');
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

  // Fetch upazilas when district changes in profile
  useEffect(() => {
    if (!selectedDistrictId) {
      setUpazilas([]);
      setSelectedUpazilaId('');
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
  }, [selectedDistrictId]);

  // Load real orders from backend supporting pagination layout
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchProfileOrders = async () => {
        setIsOrdersLoading(true);
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
          const res = await fetch(`${cleanUrl}/orders`, {
            headers: {
              'Authorization': `Bearer ${token || localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            const json = await res.json();
            if (json.status === 'success') {
              if (json.data && Array.isArray(json.data.data)) {
                setProfileOrders(json.data.data);
              } else if (Array.isArray(json.data)) {
                setProfileOrders(json.data);
              }
            }
          }
        } catch (e) {
          console.error('Failed to fetch orders:', e);
        } finally {
          setIsOrdersLoading(false);
        }
      };
      fetchProfileOrders();
    }
  }, [activeTab, token]);

  const handleViewOrderDetails = async (orderNo: string) => {
    setIsDetailLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const res = await fetch(`${cleanUrl}/orders/${orderNo}`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setSelectedOrderDetail(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch order details:', e);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCopyOrderNo = async (orderNo: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderNo);
      } else {
        const copyField = document.createElement('textarea');
        copyField.value = orderNo;
        copyField.style.position = 'fixed';
        copyField.style.opacity = '0';
        document.body.appendChild(copyField);
        copyField.select();
        document.execCommand('copy');
        copyField.remove();
      }

      setCopiedOrderNo(orderNo);
      showToast(`Order ID ${orderNo} copied.`, 'success');
      window.setTimeout(() => setCopiedOrderNo((current) => current === orderNo ? null : current), 1600);
    } catch {
      showToast('Unable to copy the order ID.', 'error');
    }
  };

  const fetchAddresses = async () => {
    setIsAddressLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      const res = await fetch(`${cleanUrl}/addresses`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setAddresses(json.data || []);
      } else {
        showToast(json.message || 'Failed to load addresses.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to address API.', 'error');
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      
      await fetch(`${cleanUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to contact server logout:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user_avatar');
      setUser(null);
      setToken(null);
      setIsLoading(false);
      showToast('Logged out successfully.', 'success');
      router.push('/');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      
      const payload = { name, email, phone, address };

      const res = await fetch(`${cleanUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        const mergedData = { ...json.data, avatar: user?.avatar || json.data.avatar };
        localStorage.setItem('user', JSON.stringify(mergedData));
        setUser(mergedData);
        showToast('Profile information updated successfully!', 'success');
      } else {
        setError(json.message || 'Failed to update profile.');
        showToast(json.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server. Please try again.');
      showToast('Failed to connect to the server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      
      const payload = { 
        name, 
        email, 
        phone, 
        address, 
        password: newPassword 
      };

      const res = await fetch(`${cleanUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password changed successfully!', 'success');
      } else {
        setError(json.message || 'Failed to update password.');
        showToast(json.message || 'Failed to update password.', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server. Please try again.');
      showToast('Failed to connect to the server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle || !addrName || !addrPhone || !addrDetails) {
      showToast('Please fill in Name, Phone, and Detailed Address.', 'error');
      return;
    }
    if (!selectedCountryId || !selectedDivisionId || !selectedDistrictId || !selectedUpazilaId) {
      showToast('Please select Country, Division, District, and Upazila.', 'error');
      return;
    }

    setIsAddressLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      
      const payload = {
        title: addrTitle,
        name: addrName,
        phone: addrPhone,
        address: addrDetails,
        is_default: addrIsDefault,
        country_id: selectedCountryId ? Number(selectedCountryId) : null,
        division_id: selectedDivisionId ? Number(selectedDivisionId) : null,
        district_id: selectedDistrictId ? Number(selectedDistrictId) : null,
        upazila_id: selectedUpazilaId ? Number(selectedUpazilaId) : null
      };

      const isEdit = editingAddressId !== null;
      const url = isEdit ? `${cleanUrl}/addresses/${editingAddressId}` : `${cleanUrl}/addresses`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(isEdit ? 'Address updated successfully!' : 'Address saved successfully.', 'success');
        setIsAddressFormOpen(false);
        setEditingAddressId(null);
        setAddrTitle('');
        setAddrName('');
        setAddrPhone('');
        setAddrDetails('');
        setAddrIsDefault(false);
        setSelectedCountryId('');
        setSelectedDivisionId('');
        setSelectedDistrictId('');
        setSelectedUpazilaId('');
        fetchAddresses();
      } else {
        showToast(json.message || 'Failed to save address.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving address details.', 'error');
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
    setAddrTitle('');
    setAddrName('');
    setAddrPhone('');
    setAddrDetails('');
    setAddrIsDefault(false);
    setSelectedCountryId('');
    setSelectedDivisionId('');
    setSelectedDistrictId('');
    setSelectedUpazilaId('');
  };

  const handleEditAddressClick = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddrTitle(addr.title);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrDetails(addr.address);
    setAddrIsDefault(addr.is_default);
    
    // Set selected dropdowns
    setSelectedCountryId(addr.country_id || '');
    setSelectedDivisionId(addr.division_id || '');
    setSelectedDistrictId(addr.district_id || '');
    setSelectedUpazilaId(addr.upazila_id || '');
    
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setIsAddressLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      const res = await fetch(`${cleanUrl}/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Address deleted successfully.', 'success');
        fetchAddresses();
      } else {
        showToast(json.message || 'Failed to delete address.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting address.', 'error');
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Initial file selection: Open Cropper modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropSrc(reader.result as string);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag-to-position handlers for image cropping viewport
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Perform cropping via Canvas & upload to backend
  const handleCropAndUpload = async () => {
    if (!imageRef.current || !cropSrc) return;
    setIsUploading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imageRef.current;
      const viewSize = 250; 
      const scale = zoom;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.translate(200, 200);
      ctx.scale(scale, scale);
      ctx.translate(offset.x / scale, offset.y / scale);

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const displayWidth = viewSize;
      const displayHeight = (imgHeight / imgWidth) * viewSize;

      ctx.drawImage(
        img,
        -displayWidth / 2,
        -displayHeight / 2,
        displayWidth,
        displayHeight
      );

      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Failed to crop image.', 'error');
          setIsUploading(false);
          return;
        }

        const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('image', croppedFile);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        const res = await fetch(`${cleanUrl}/profile/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token || localStorage.getItem('token')}`
          },
          body: formData
        });

        const json = await res.json();
        if (res.ok && json.status === 'success') {
          const newAvatarUrl = json.image_url;
          setAvatar(newAvatarUrl);
          
          const updatedUser = { ...user, avatar: newAvatarUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);

          showToast('Profile image uploaded successfully!', 'success');
          setIsCropModalOpen(false);
        } else {
          showToast(json.message || 'Failed to upload image.', 'error');
        }
        setIsUploading(false);
      }, 'image/jpeg', 0.9);

    } catch (err) {
      console.error(err);
      showToast('Error uploading image to server.', 'error');
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange" />
      </div>
    );
  }

  const mockReviews = [
    { id: 1, productName: 'SABR Contrast T-Shirt', rating: 5, date: 'July 24, 2026', comment: 'Quality of the fabric is top notch. Highly recommended.' },
    { id: 2, productName: 'TAWAKKUL Classic Tee', rating: 4, date: 'June 18, 2026', comment: 'Very comfortable for daily wear. Color fits perfectly.' }
  ];

  return (
    <div className="w-full py-8 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR: PROFILE CARD & MENU */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden p-6 flex flex-col items-center text-center">
            
            {/* Avatar upload */}
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-md mb-4 bg-slate-50 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-orange text-white flex items-center justify-center text-3xl font-black select-none">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs">
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </label>
            </div>

            <span className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase mb-2">
              Premium Member
            </span>
            <h2 className="text-base font-black text-slate-900 tracking-tight">{user.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wide truncate max-w-full mt-0.5">{user.email}</p>

            {/* Sidebar menu options */}
            <div className="w-full flex flex-col gap-1.5 mt-8 border-t border-slate-100 pt-6">
              <button
                onClick={() => { setActiveTab('overview'); setError(''); setSuccessMessage(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-brand-orange/15 text-brand-orange shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Dashboard Home</span>
              </button>

              <button
                onClick={() => { setActiveTab('personal-info'); setError(''); setSuccessMessage(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'personal-info'
                    ? 'bg-brand-orange/15 text-brand-orange shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal Info</span>
              </button>

              <button
                onClick={() => { setActiveTab('addresses'); setError(''); setSuccessMessage(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-brand-orange/15 text-brand-orange shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Shipping Addresses</span>
              </button>

              <button
                onClick={() => { setActiveTab('change-password'); setError(''); setSuccessMessage(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'change-password'
                    ? 'bg-brand-orange/15 text-brand-orange shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setError(''); setSuccessMessage(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-brand-orange/15 text-brand-orange shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order History</span>
              </button>

              <button
                onClick={() => { setActiveTab('reviews'); setError(''); setSuccessMessage(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-brand-orange/15 text-brand-orange shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Review History</span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer mt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL: TAB CONTENTS */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 min-h-[480px]">
            
            {/* Status alerts */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3.5 rounded-xl text-center mb-6">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold p-3.5 rounded-xl text-center mb-6">
                {successMessage}
              </div>
            )}

            {activeTab === 'overview' && (
              /* TAB 1: HOME/OVERVIEW */
              <div className="flex flex-col gap-8 animate-slide-up">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Here is a quick overview of your profile and recent activity.</p>
                </div>

                {/* Metric Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Total Orders</span>
                      <span className="text-base font-black text-slate-800">1 Order</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Wishlist</span>
                      <span className="text-base font-black text-slate-800">{likedProducts.length} Items</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wide">Active Bag</span>
                      <span className="text-base font-black text-slate-800">{cart.length} Items</span>
                    </div>
                  </div>
                </div>

                {/* Auto-generated Credentials Warning Card */}
                {user.email && user.email.includes('@believers.com') && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start">
                    <div className="bg-amber-100 text-amber-850 p-2 rounded-lg text-xs font-black uppercase tracking-wider self-start sm:self-auto flex-shrink-0">
                      Security alert
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">Using Auto-Generated Credentials</h4>
                      <p className="text-[11px] text-amber-700 font-semibold leading-relaxed mt-1">
                        Your account was registered via OTP. Your email is currently set to <span className="select-all font-black text-amber-950">{user.email}</span>. We highly recommend updating your email and setting a secure password in the tabs on the left.
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Details and mini recent orders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Primary Info</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 font-bold truncate">{user.email || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 font-bold">{user.phone || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 font-bold leading-normal truncate">{user.address || 'No shipping address specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Recent Order</h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 text-xs">#FL-2026-8910</span>
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-black text-[9px] uppercase">Processing</span>
                      </div>
                      <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold">1x Musafir Raglan Tee</span>
                        <span className="font-bold text-slate-900">BDT 950</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal-info' && (
              /* TAB 2: PERSONAL INFO */
              <div className="flex flex-col gap-6 animate-slide-up">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Keep your delivery details and contact information up to date.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 max-w-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Shipping Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-brand-orange hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase mt-3 transition-colors cursor-pointer flex justify-center items-center gap-2 self-start disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save Information
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              /* TAB 6: SHIPPING ADDRESSES CRUD */
              <div className="flex flex-col gap-6 animate-slide-up">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans tracking-tight">Shipping Addresses</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Manage multiple shipping destinations for fast checkout.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddrTitle('');
                      setAddrName(user.name || '');
                      setAddrPhone(user.phone || '');
                      setAddrDetails('');
                      setAddrIsDefault(addresses.length === 0);
                      setIsAddressFormOpen(true);
                    }}
                    className="px-4 py-2 bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand-orange/10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </button>
                </div>

                {isAddressFormOpen ? (
                  /* Create / Edit Address Form */
                  <form onSubmit={handleSaveAddress} className="flex flex-col gap-4 max-w-xl bg-slate-50 border border-slate-100 rounded-2xl p-6">
                    <h3 className="text-xs font-black uppercase text-slate-950 tracking-wider mb-2">
                      {editingAddressId ? 'Edit Address Details' : 'Add New Shipping Address'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Address Title (e.g. Home, Office)</label>
                        <input
                          type="text"
                          required
                          placeholder="Home"
                          value={addrTitle}
                          onChange={(e) => setAddrTitle(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Recipient Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tanim Rahman"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Contact Phone Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +8801712345678"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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
                        value={addrDetails}
                        onChange={(e) => setAddrDetails(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="addr-default"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange cursor-pointer border-slate-350"
                      />
                      <label htmlFor="addr-default" className="text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer">
                        Set as Default Shipping Address
                      </label>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={isAddressLoading}
                        className="px-5 py-2 bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isAddressLoading ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseAddressForm}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Addresses list */
                  <div className="flex flex-col gap-4">
                    {isAddressLoading && addresses.length === 0 ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3.5" />
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">No Address Saved</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Please click &apos;Add Address&apos; to create your first destination.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 shadow-sm transition-all hover:shadow-md relative ${
                              addr.is_default ? 'border-brand-orange/60 ring-1 ring-brand-orange/20' : 'border-slate-150'
                            }`}
                          >
                            {addr.is_default && (
                              <span className="absolute top-4 right-4 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shadow-sm select-none">
                                <Check className="w-2.5 h-2.5" />
                                Default
                              </span>
                            )}
                            
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{addr.title}</span>
                              <h4 className="text-xs font-extrabold text-slate-900">{addr.name}</h4>
                              <p className="text-xs text-slate-500 font-semibold">{addr.phone}</p>
                              <p className="text-xs text-slate-700 font-bold leading-normal mt-1">
                                {addr.address}
                                {(addr.upazila?.name || addr.district?.name) && (
                                  <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                                    {addr.upazila?.name && `${addr.upazila.name}, `}
                                    {addr.district?.name && `${addr.district.name}, `}
                                    {addr.division?.name && `${addr.division.name}, `}
                                    {addr.country?.name || ''}
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 border-t border-slate-100 pt-3.5">
                              <button
                                onClick={() => handleEditAddressClick(addr)}
                                className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-500 hover:text-rose-700 transition-colors cursor-pointer ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'change-password' && (
              /* TAB 3: CHANGE PASSWORD */
              <div className="flex flex-col gap-6 animate-slide-up">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Protect your account with a secure, custom password.</p>
                </div>

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-brand-orange hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase mt-3 transition-colors cursor-pointer flex justify-center items-center gap-2 self-start disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              /* TAB 4: ORDER HISTORY */
              <div className="flex flex-col gap-6 animate-slide-up">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Order History</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Track status and review purchase details of your current and past orders.</p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {isOrdersLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange" />
                    </div>
                  ) : profileOrders.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3.5" />
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">No Orders Found</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">You haven&apos;t placed any orders yet.</p>
                    </div>
                  ) : (
                    profileOrders.map((order) => (
                      <div key={order.id} className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-xs">Order ID: #{order.order_no}</span>
                              <button
                                type="button"
                                onClick={() => void handleCopyOrderNo(order.order_no)}
                                aria-label={`Copy order ID ${order.order_no}`}
                                title={copiedOrderNo === order.order_no ? 'Copied' : 'Copy order ID'}
                                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border transition-all ${
                                  copiedOrderNo === order.order_no
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                    : 'border-slate-200 bg-white text-slate-400 hover:border-orange-200 hover:text-brand-orange'
                                }`}
                              >
                                {copiedOrderNo === order.order_no ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                              Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wide ${
                            order.status === 'completed' || order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        {order.items && order.items.slice(0, 2).map((item: any) => (
                          <div key={item.id} className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs">
                            <div className="flex flex-col">
                              <span className="text-slate-850 font-bold">{item.product?.name || 'Product'} {item.size || item.color ? `(${[item.size, item.color].filter(Boolean).join(' / ')})` : ''}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5 font-semibold">Qty: {item.quantity} x BDT {item.price}</span>
                            </div>
                            <span className="font-extrabold text-slate-900">BDT {Number(item.price) * Number(item.quantity)}</span>
                          </div>
                        ))}
                        {order.items && order.items.length > 2 && (
                          <div className="text-[10px] text-slate-400 font-semibold italic text-right mt-1">
                            + {order.items.length - 2} more item(s)
                          </div>
                        )}
                        <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs font-black text-slate-900">
                          <span>Grand Total</span>
                          <span className="text-brand-orange">BDT {order.grand_total}</span>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 pt-2">
                          <button
                            onClick={() => router.push(`/track-order?order_no=${encodeURIComponent(order.order_no)}`)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-[9px] font-black uppercase text-orange-700 transition-colors hover:border-brand-orange hover:bg-orange-100"
                          >
                            <PackageSearch className="h-3.5 w-3.5" />
                            Track Order
                          </button>
                          <button
                            onClick={() => handleViewOrderDetails(order.order_no)}
                            disabled={isDetailLoading}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-[9px] uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isDetailLoading ? 'Loading...' : 'View Invoice & Details'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              /* TAB 5: REVIEW HISTORY */
              <div className="flex flex-col gap-6 animate-slide-up">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Review History</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Manage and view your feedback for items purchased.</p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {mockReviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-800 truncate">{rev.productName}</h4>
                        <span className="text-[9px] text-slate-400 font-bold">{rev.date}</span>
                      </div>
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 font-medium italic mt-0.5 leading-normal">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* CROPPER OVERLAY MODAL */}
      {isCropModalOpen && cropSrc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-150 flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Crop Profile Photo</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Drag to reposition, use slider to scale</p>
              </div>
              <button 
                onClick={() => { setIsCropModalOpen(false); setCropSrc(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex justify-center items-center bg-slate-900 relative">
              <div 
                className="relative w-64 h-64 overflow-hidden border-2 border-brand-orange rounded-xl shadow-lg cursor-move bg-slate-950 flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={cropSrc}
                  alt="Crop Target"
                  draggable={false}
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                />
                
                <div className="absolute inset-0 border border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/10"></div>
                  <div className="border-r border-b border-white/10"></div>
                  <div className="border-b border-white/10"></div>
                  <div className="border-r border-b border-white/10"></div>
                  <div className="border-r border-b border-white/10"></div>
                  <div className="border-b border-white/10"></div>
                  <div className="border-r border-white/10"></div>
                  <div className="border-r border-white/10"></div>
                  <div></div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex flex-col gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <Minus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
                <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setIsCropModalOpen(false); setCropSrc(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropAndUpload}
                  disabled={isUploading}
                  className="px-6 py-2 bg-brand-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Crop & Upload'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ORDER DETAIL POPUP MODAL */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-150 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Order Details</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">#{selectedOrderDetail.order_no}</p>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 flex-1 flex flex-col gap-5 text-xs">
              
              {/* Geolocation metadata status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shipping Address</span>
                  <h4 className="font-extrabold text-slate-900">{selectedOrderDetail.name}</h4>
                  <p className="text-slate-500 font-semibold">{selectedOrderDetail.phone}</p>
                  <p className="text-slate-700 font-medium leading-relaxed mt-1">
                    {selectedOrderDetail.address}
                    {selectedOrderDetail.upazila?.name && `, ${selectedOrderDetail.upazila.name}`}
                    {selectedOrderDetail.district?.name && `, ${selectedOrderDetail.district.name}`}
                    {selectedOrderDetail.division?.name && `, ${selectedOrderDetail.division.name}`}
                    {selectedOrderDetail.country?.name && `, ${selectedOrderDetail.country.name}`}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Order Status</span>
                  <p className="text-slate-700 font-bold">
                    Payment Method: <span className="uppercase text-brand-orange">{selectedOrderDetail.payment_method}</span>
                  </p>
                  <p className="text-slate-700 font-bold">
                    Order Status: <span className="capitalize">{selectedOrderDetail.status}</span>
                  </p>
                  <p className="text-slate-700 font-bold">
                    Placed Date: {new Date(selectedOrderDetail.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Items List Table */}
              <div className="border border-slate-150 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-black uppercase tracking-wider text-[9px]">
                      <th className="px-4 py-2.5">Item Description</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Price</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {selectedOrderDetail.items && selectedOrderDetail.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <span className="block font-extrabold text-slate-800">{item.product?.name || 'Product'}</span>
                          {(item.size || item.color) && (
                            <span className="text-[9px] text-slate-405 uppercase mt-0.5 block">
                              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' | ')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">BDT {item.price}</td>
                        <td className="px-4 py-3 text-right text-slate-900 font-extrabold">
                          BDT {Number(item.price) * Number(item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box */}
              <div className="flex justify-end pt-2">
                <div className="w-56 flex flex-col gap-2 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-extrabold">BDT {selectedOrderDetail.subtotal}</span>
                  </div>
                  {Number(selectedOrderDetail.discount_amount) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>- BDT {selectedOrderDetail.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Shipping Fee</span>
                    <span className="text-slate-900 font-extrabold">BDT {selectedOrderDetail.delivery_fee}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="text-brand-orange">BDT {selectedOrderDetail.grand_total}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50">
              <button
                onClick={() => {
                  const printWin = window.open('', '_blank');
                  if (printWin) {
                    printWin.document.write(`
                      <html>
                        <head>
                          <title>Invoice - ${selectedOrderDetail.order_no}</title>
                          <style>
                            body { font-family: sans-serif; padding: 40px; color: #333; }
                            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; background: #f9f9f9; padding: 20px; border-radius: 8px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                            th { background: #f4f4f4; }
                            .totals { display: flex; flex-direction: column; align-items: flex-end; margin-top: 30px; }
                            .total-row { display: flex; justify-content: space-between; width: 250px; margin-bottom: 8px; font-size: 14px; }
                            .grand-total { font-weight: bold; border-top: 1px solid #333; padding-top: 10px; font-size: 16px; color: #ff5a00; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div>
                              <h2>BELIEVERS</h2>
                              <p>Premium Apparel Store</p>
                            </div>
                            <div style="text-align: right;">
                              <h3>INVOICE</h3>
                              <p>Order No: #${selectedOrderDetail.order_no}</p>
                              <p>Date: ${new Date(selectedOrderDetail.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div class="grid">
                            <div>
                              <strong>Shipping Details:</strong>
                              <p>\${selectedOrderDetail.name}<br>\${selectedOrderDetail.phone}<br>\${selectedOrderDetail.address}<br>\${[selectedOrderDetail.upazila?.name, selectedOrderDetail.district?.name, selectedOrderDetail.division?.name, selectedOrderDetail.country?.name].filter(Boolean).join(', ')}</p>
                            </div>
                            <div>
                              <strong>Payment Details:</strong>
                              <p>Method: \${selectedOrderDetail.payment_method.toUpperCase()}<br>Status: \${selectedOrderDetail.status}</p>
                            </div>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              \${selectedOrderDetail.items.map((i) => \`
                                <tr>
                                  <td>\${i.product?.name || 'Product'} \${i.size || i.color ? \`(\${[i.size, i.color].filter(Boolean).join(' / ')})\` : ''}</td>
                                  <td style="text-align: center;">\${i.quantity}</td>
                                  <td style="text-align: right;">BDT \${i.price}</td>
                                  <td style="text-align: right;">BDT \${Number(i.price) * Number(i.quantity)}</td>
                                </tr>
                              \`).join('')}
                            </tbody>
                          </table>
                          <div class="totals">
                            <div class="total-row"><span>Subtotal:</span><strong>BDT \${selectedOrderDetail.subtotal}</strong></div>
                            \${Number(selectedOrderDetail.discount_amount) > 0 ? \`<div class="total-row" style="color: green;"><span>Discount:</span><strong>- BDT \${selectedOrderDetail.discount_amount}</strong></div>\` : ''}
                            <div class="total-row"><span>Shipping Fee:</span><strong>BDT \${selectedOrderDetail.delivery_fee}</strong></div>
                            <div class="total-row grand-total"><span>Grand Total:</span><strong>BDT \${selectedOrderDetail.grand_total}</strong></div>
                          </div>
                          <script>window.onload = function() { window.print(); window.close(); }</script>
                        </body>
                      </html>
                    `);
                    printWin.document.close();
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase rounded-xl transition-all cursor-pointer text-[10px]"
              >
                Print / Download PDF
              </button>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
