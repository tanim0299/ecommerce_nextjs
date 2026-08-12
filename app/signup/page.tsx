'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Lock, Mail, Phone, MapPin } from 'lucide-react';
import { useApp } from '../context';

export default function SignupPage() {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, redirect to profile
  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      const registeredUser = {
        name: name,
        email: email,
        phone: phone,
        address: address || 'Not provided yet'
      };
      localStorage.setItem('user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      alert('Account registered and logged in successfully!');
      router.push('/');
    }, 1500);
  };

  return (
    <div className="w-full py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
        {/* Banner header with Brand Logo */}
        <div className="bg-slate-950 p-8 text-center text-white flex flex-col items-center gap-3">
          <svg viewBox="0 0 60 70" className="w-8 h-9 text-brand-orange" fill="currentColor">
            <polygon points="5,38 35,8 45,18 15,48" />
            <polygon points="17,50 35,32 45,42 27,60" />
            <polygon points="29,66 39,56 39,66" />
          </svg>
          <div className="flex items-center gap-1.5 text-xl tracking-tighter">
            <span className="font-extrabold text-white">FABRI</span>
            <span className="font-light text-slate-300">LIFE</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Create a new customer account to start shopping and tracking your orders.</p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleSignup} className="p-8 flex flex-col gap-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name *</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                placeholder="e.g. Tanim Rahman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email"
                required
                placeholder="e.g. tanim@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                placeholder="e.g. +880 1712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Delivery Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="e.g. House 42, Road 11, Banani, Dhaka"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs uppercase tracking-wider mt-2 flex justify-center items-center disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-xs text-slate-500 mt-2 font-medium">
            Already have an account?{' '}
            <Link 
              href="/login"
              className="text-brand-orange hover:underline font-bold"
            >
              Sign In instead
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
