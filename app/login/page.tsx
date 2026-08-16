'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Phone, KeyRound } from 'lucide-react';
import { useApp } from '../context';
import CountryCodeSelector, { Country } from '../components/CountryCodeSelector';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser, setToken, showToast } = useApp();
  
  // Tab control: 'password' or 'otp'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Sub-tab for Password login: 'email' or 'phone'
  const [passwordLoginSubTab, setPasswordLoginSubTab] = useState<'email' | 'phone'>('email');
  
  // Form states
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [password, setPassword] = useState('');
  
  const [otpPhone, setOtpPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // Country selectors
  const [passLoginCountry, setPassLoginCountry] = useState<Country | null>(null);
  const [otpLoginCountry, setOtpLoginCountry] = useState<Country | null>(null);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, redirect to profile
  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    let finalLoginStr = '';
    if (passwordLoginSubTab === 'email') {
      if (!emailInput || !password) {
        showToast('Please fill in all fields.', 'error');
        return;
      }
      finalLoginStr = emailInput;
    } else {
      if (!phoneInput || !password) {
        showToast('Please fill in all fields.', 'error');
        return;
      }
      if (!passLoginCountry) {
        showToast('Please select a country code.', 'error');
        return;
      }
      finalLoginStr = `${passLoginCountry.dialCode}${phoneInput}`;
    }

    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const res = await fetch(`${cleanUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: finalLoginStr, password }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        localStorage.setItem('user', JSON.stringify(json.data));
        localStorage.setItem('token', json.token);
        setUser(json.data);
        setToken(json.token);
        showToast('Logged in successfully!', 'success');
        setTimeout(() => router.push('/profile'), 1000);
      } else {
        setError(json.message || 'Invalid credentials.');
        showToast(json.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to the server. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpPhone) {
      showToast('Please enter your phone number.', 'error');
      return;
    }
    if (!otpLoginCountry) {
      showToast('Please select a country code.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const fullPhone = `${otpLoginCountry.dialCode}${otpPhone}`;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const res = await fetch(`${cleanUrl}/login-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setIsOtpSent(true);
        console.log('Login OTP Code:', json.otp); // Frontend Console Log
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the OTP code.', 'error');
      return;
    }
    if (!otpLoginCountry) {
      showToast('Please select a country code.', 'error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const fullPhone = `${otpLoginCountry.dialCode}${otpPhone}`;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const res = await fetch(`${cleanUrl}/login-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp }),
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        localStorage.setItem('user', JSON.stringify(json.data));
        localStorage.setItem('token', json.token);
        setUser(json.data);
        setToken(json.token);
        showToast('Logged in successfully!', 'success');
        setTimeout(() => router.push('/profile'), 1000);
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
          <p className="text-xs text-slate-400 font-medium">Welcome back! Sign in to access your orders and settings.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => {
              setLoginMethod('password');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
              loginMethod === 'password'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Password Login
          </button>
          <button
            onClick={() => {
              setLoginMethod('otp');
              setError('');
              setSuccessMessage('');
              setIsOtpSent(false);
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
              loginMethod === 'otp'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            OTP Login
          </button>
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

          {loginMethod === 'password' ? (
            /* Password Login Form */
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
              {/* Secondary sub-tab selector inside password login */}
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 self-start">
                <button
                  type="button"
                  onClick={() => setPasswordLoginSubTab('email')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                    passwordLoginSubTab === 'email'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordLoginSubTab('phone')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer ${
                    passwordLoginSubTab === 'phone'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Phone
                </button>
              </div>

              {passwordLoginSubTab === 'email' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="flex items-center">
                    <CountryCodeSelector
                      selectedCountry={passLoginCountry}
                      onChange={setPassLoginCountry}
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1712345678"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 border-l-0 rounded-r-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 h-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset is managed in the profile after login.")}
                    className="text-[10px] font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
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
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            /* OTP Login Form */
            <div className="flex flex-col gap-5">
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <div className="flex items-center">
                      <CountryCodeSelector
                        selectedCountry={otpLoginCountry}
                        onChange={setOtpLoginCountry}
                      />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1712345678"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 border-l-0 rounded-r-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800 h-full"
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
                      'Send OTP Code'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-orange text-slate-800"
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
                      'Verify & Login'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mt-2 cursor-pointer hover:underline"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-brand-orange hover:underline font-bold"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
