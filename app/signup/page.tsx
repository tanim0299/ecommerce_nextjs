'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, KeyRound } from 'lucide-react';
import { useApp } from '../context';
import CountryCodeSelector, { Country } from '../components/CountryCodeSelector';

export default function SignupPage() {
  const router = useRouter();
  const { user, setUser, setToken, showToast } = useApp();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email?: string; password?: string } | null>(null);

  // If user is already logged in, redirect to profile
  useEffect(() => {
    if (user && !credentials) {
      router.push('/profile');
    }
  }, [user, credentials, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!selectedCountry) {
      showToast('Please select a country code.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const fullPhone = `${selectedCountry.dialCode}${phone}`;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const res = await fetch(`${cleanUrl}/register-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setIsOtpSent(true);
        console.log('Registration OTP Code:', json.otp); // Frontend Console Log
        showToast('OTP sent successfully! Check browser console.', 'success');
      } else {
        setError(json.message || 'Failed to send OTP.');
        showToast(json.message || 'Failed to send OTP.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to the server. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the OTP verification code.', 'error');
      return;
    }
    if (!selectedCountry) {
      showToast('Please select a country code.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const fullPhone = `${selectedCountry.dialCode}${phone}`;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const res = await fetch(`${cleanUrl}/register-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: fullPhone, otp }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        localStorage.setItem('user', JSON.stringify(json.data));
        localStorage.setItem('token', json.token);
        setUser(json.data);
        setToken(json.token);
        showToast('Account registered successfully!', 'success');
        
        // Save the auto-generated credentials to show the user
        if (json.generated_credentials) {
          setCredentials(json.generated_credentials);
        } else {
          setTimeout(() => router.push('/profile'), 1500);
        }
      } else {
        setError(json.message || 'Invalid or expired OTP code.');
        showToast(json.message || 'Invalid or expired OTP code.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to the server. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
        {/* Banner header */}
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

        <div className="p-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold p-3 rounded-lg text-center mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold p-3 rounded-lg text-center mb-4">
              {successMessage}
            </div>
          )}

          {credentials ? (
            /* Show Auto-Generated Credentials */
            <div className="flex flex-col gap-4 bg-amber-50 border border-amber-100 rounded-xl p-5 text-slate-800">
              <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider">Registration Completed!</h3>
              <p className="text-xs leading-relaxed font-semibold">
                An account has been created for you. Since this is an OTP registration, we have auto-generated your login email and password.
              </p>
              
              <div className="flex flex-col gap-2 mt-2 bg-white rounded-lg border border-amber-150 p-4">
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Generated Email</span>
                  <span className="text-xs font-bold text-slate-900 select-all">{credentials.email}</span>
                </div>
                <div className="border-t border-slate-100 pt-2">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Generated Password</span>
                  <span className="text-xs font-bold text-slate-900 select-all">{credentials.password}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-amber-700 font-bold leading-normal">
                💡 Note: You can change these details (email/password) at any time inside your Profile settings.
              </p>

              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 rounded-lg text-xs uppercase mt-3 transition-colors cursor-pointer"
              >
                Go to Profile
              </button>
            </div>
          ) : !isOtpSent ? (
            /* Request OTP form */
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="flex items-center">
                  <CountryCodeSelector
                    selectedCountry={selectedCountry}
                    onChange={setSelectedCountry}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 border-l-0 rounded-r-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 h-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs uppercase tracking-wider mt-4 flex justify-center items-center disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Verify Phone via OTP'
                )}
              </button>
            </form>
          ) : (
            /* Verify OTP Form */
            <form onSubmit={handleVerifyAndSignup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Enter OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="6-Digit Verification Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs uppercase tracking-wider mt-4 flex justify-center items-center disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Complete Registration'
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mt-2 cursor-pointer hover:underline"
              >
                Go Back & Edit Info
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand-orange hover:underline font-bold"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
