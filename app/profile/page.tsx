'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import { useApp } from '../context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  // Load user data on mount. If not logged in, redirect to login
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    alert('Logged out successfully.');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-orange" />
      </div>
    );
  }

  return (
    <div className="w-full py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
        {/* Banner header */}
        <div className="bg-slate-950 p-8 text-white flex flex-col md:flex-row items-center gap-6 border-b border-slate-900">
          <div className="w-20 h-20 bg-brand-orange text-white rounded-full flex items-center justify-center text-3xl font-black tracking-tight border-4 border-slate-800 shadow-md">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase">
              Premium Club Member
            </span>
            <h2 className="text-2xl font-black text-white mt-2.5 tracking-tight">{user.name}</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Manage your delivery settings and track recent orders.</p>
          </div>
        </div>

        {/* Profile Grid Panel */}
        <div className="p-8 flex flex-col md:flex-row gap-8">
          {/* Details Column */}
          <div className="flex-1 flex flex-col gap-6">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest border-b border-slate-100 pb-2">
              Account Details
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-xs font-bold text-slate-800">{user.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Phone number</span>
                  <span className="text-xs font-bold text-slate-800">{user.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Shipping Address</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 leading-relaxed">{user.address}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full md:w-auto mt-4 px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-100 rounded-xl transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-start"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Orders Column */}
          <div className="flex-1 flex flex-col gap-6">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest border-b border-slate-100 pb-2">
              Recent Order History
            </h3>

            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs">#FL-2026-8910</span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5">Aug 12, 2026</span>
                  </div>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-black text-[9px] uppercase">
                    Processing
                  </span>
                </div>
                <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">1x Musafir Raglan Tee</span>
                  <span className="font-bold text-slate-900">BDT 950</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3 opacity-60">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-950 text-xs">#FL-2026-7852</span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5">Jun 24, 2026</span>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-black text-[9px] uppercase">
                    Delivered
                  </span>
                </div>
                <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">2x Combed Premium Polo</span>
                  <span className="font-bold text-slate-900">BDT 2,300</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
