'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Navigation,
  Globe,
  Building2,
  Headphones,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context';
import SocialLinks from '../components/SocialLinks';

export default function ContactPage() {
  const { systemConfig, isConfigLoading } = useApp();
  
  // Contact Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 700);
  };

  // Extract map src from google_map if it's an iframe
  const getMapEmbedUrl = () => {
    if (!systemConfig) return null;
    
    if (systemConfig.google_map) {
      const srcMatch = systemConfig.google_map.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
      if (systemConfig.google_map.startsWith('http')) {
        return systemConfig.google_map;
      }
    }

    if (systemConfig.address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(systemConfig.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    return null;
  };

  const mapEmbedUrl = getMapEmbedUrl();
  const addressQuery = systemConfig?.address ? encodeURIComponent(systemConfig.address) : '';

  // Filter valid phone numbers and emails
  const validPhones = (systemConfig?.phones || []).filter(p => p.trim().length > 4);
  const validEmails = (systemConfig?.emails || []).filter(e => e.trim().includes('@'));

  return (
    <div className="w-full flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-12 border border-slate-900 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-amber-400 text-[10px] font-black uppercase tracking-wider w-fit">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Get In Touch
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans">
            Contact &amp; Customer Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Have questions about sizes, orders, or need style assistance? Our customer experience team is ready to help you every step of the way.
          </p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Address Card */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-brand-orange flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Store &amp; Office Location
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                {isConfigLoading ? (
                  <span className="inline-block w-48 h-4 shimmer-effect rounded" />
                ) : (
                  systemConfig?.address || 'Dhaka, Bangladesh'
                )}
              </p>
            </div>
          </div>
          {addressQuery && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${addressQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-orange-700 hover:underline pt-2 border-t border-slate-100"
            >
              <Navigation className="w-3.5 h-3.5" />
              Get Directions on Map &rarr;
            </a>
          )}
        </div>

        {/* Phone / Hotline Card */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Helpline &amp; Phone Support
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Available Saturday – Thursday (10:00 AM – 10:00 PM)
              </p>
              <div className="flex flex-col gap-1 mt-2.5">
                {isConfigLoading ? (
                  <span className="inline-block w-32 h-4 shimmer-effect rounded" />
                ) : validPhones.length > 0 ? (
                  validPhones.map((phone, idx) => (
                    <a
                      key={idx}
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="text-xs font-bold text-slate-800 hover:text-brand-orange transition-colors"
                    >
                      {phone}
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Contact hotline available soon</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" /> Instant support during office hours
          </div>
        </div>

        {/* Email Support Card */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group sm:col-span-2 lg:col-span-1">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Email Customer Care
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Send queries, invoice requests, or feedback
              </p>
              <div className="flex flex-col gap-1 mt-2.5">
                {isConfigLoading ? (
                  <span className="inline-block w-40 h-4 shimmer-effect rounded" />
                ) : validEmails.length > 0 ? (
                  validEmails.map((email, idx) => (
                    <a
                      key={idx}
                      href={`mailto:${email}`}
                      className="text-xs font-bold text-slate-800 hover:text-brand-orange transition-colors break-all"
                    >
                      {email}
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Support email available soon</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Typical response time: Within 24 hours
          </div>
        </div>
      </div>

      {/* Social Channels Strip */}
      {systemConfig?.social_links && systemConfig.social_links.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-brand-orange flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Official Social Channels
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Follow our official social profiles for daily style releases, customer stories, and direct messages.
              </p>
            </div>
          </div>
          <SocialLinks variant="light" itemClassName="w-10 h-10 rounded-xl" iconSizeClass="w-5 h-5" />
        </div>
      )}

      {/* Main Two-Column: Interactive Map & Contact Message Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-slate-150 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  Find Us On Google Maps
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Store Location
                </h2>
              </div>
              {addressQuery && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${addressQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-brand-orange text-white text-[11px] font-bold uppercase transition-colors shrink-0 w-fit"
                >
                  <Navigation className="w-3 h-3" /> Open in Google Maps
                </a>
              )}
            </div>

            {/* Map Frame Container */}
            <div className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner">
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  title="Store Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2">
                  <MapPin className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-semibold">Map coordinates not configured yet.</p>
                </div>
              )}
            </div>

            {/* Address summary banner under map */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 block">
                  {systemConfig?.title || 'E-Commerce Store'}
                </span>
                <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">
                  {systemConfig?.address || 'House 42, Road 11, Block D, Banani, Dhaka-1213'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Send Message Form */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-7 shadow-sm flex flex-col gap-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
                Send Us A Note
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Leave A Message
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Fill out the form below and our representative will get back to you shortly.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center flex flex-col items-center gap-2.5 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Thank you for reaching out. Our support representative has received your request and will contact you via email or phone.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 01711223344"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Question regarding product size"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your question or feedback here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-orange focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-orange hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}