'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import SafeHtml from '../../components/SafeHtml';

interface PageDetail {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PageListItem {
  id: number;
  title: string;
  slug: string;
}

export default function CustomPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = React.use(params);

  const [page, setPage] = useState<PageDetail | null>(null);
  const [allPages, setAllPages] = useState<PageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchPageData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        // Fetch current page detail
        const res = await fetch(`${cleanUrl}/pages/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Page not found.' : 'Failed to load page content.');
        }

        const json = await res.json();
        if (json.status_code === 200 && json.result) {
          setPage(json.result as PageDetail);
        } else if (json.status === 'success' && json.data) {
          setPage(json.data as PageDetail);
        } else {
          throw new Error('Invalid page response.');
        }

        // Fetch all pages list for sidebar
        const allRes = await fetch(`${cleanUrl}/pages`, { signal: controller.signal });
        if (allRes.ok) {
          const allJson = await allRes.json();
          const items = allJson.result || allJson.data || [];
          if (Array.isArray(items)) {
            setAllPages(items);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching page:', err);
        setError(err.message || 'Page unavailable.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPageData();

    return () => controller.abort();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in font-sans">
        <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-10 w-3/4 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-40 w-full bg-slate-100 rounded-2xl animate-pulse mt-6" />
          </div>
          <div className="lg:col-span-4 space-y-3">
            <div className="h-48 w-full bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Policy Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          {error || 'The requested page is currently unavailable or may have been updated.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-orange-600 shadow-orange-500/25"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 border-b border-slate-200/70 pb-3 flex-wrap">
        <Link href="/" className="hover:text-brand-orange transition-colors flex items-center gap-1 text-[11px] font-bold">
          <ArrowLeft className="w-3 h-3" />
          <span>HOME</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[11px] font-bold text-slate-400 uppercase">POLICIES & INFO</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="font-extrabold text-slate-900 truncate max-w-xs">{page.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Body */}
        <div className="lg:col-span-8 flex flex-col gap-5 bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-xs">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] font-black tracking-widest text-brand-orange uppercase">
              CUSTOMER POLICY & TRANSPARENCY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1 leading-tight">
              {page.title}
            </h1>
            {page.updated_at && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Policy Content */}
          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-4">
            {page.description ? (
              <SafeHtml
                html={page.description}
                className="[&>h2]:text-base [&>h2]:font-black [&>h2]:text-slate-900 [&>h2]:mt-5 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:leading-relaxed [&>p]:text-slate-600 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li]:text-slate-600 [&>strong]:text-slate-900"
              />
            ) : (
              <p className="text-slate-400 italic">No description provided for this policy page yet.</p>
            )}
          </div>

          {/* Assurance Footer Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 mt-4 border-t border-slate-100">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 gap-1">
              <Truck className="w-4 h-4 text-brand-orange" />
              <span className="text-[10px] font-black text-slate-900">Fast Delivery</span>
              <span className="text-[8.5px] text-slate-500">Across Bangladesh</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 gap-1">
              <RotateCcw className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-slate-900">7-Day Return</span>
              <span className="text-[8.5px] text-slate-500">Hassle Free</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-900">100% Genuine</span>
              <span className="text-[8.5px] text-slate-500">Quality Checked</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 border border-slate-100 gap-1">
              <Headphones className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-slate-900">Live Support</span>
              <span className="text-[8.5px] text-slate-500">7 Days a Week</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Policy Navigation & Assistance */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Other Policy Pages List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-l-2 border-brand-orange pl-2.5">
              Customer Policies
            </h3>
            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              {allPages.map((p) => {
                const isActive = p.slug === slug;
                return (
                  <Link
                    key={p.id}
                    href={`/pages/${p.slug}`}
                    className={`py-2.5 px-2.5 rounded-xl flex items-center justify-between font-bold transition-all ${
                      isActive
                        ? 'bg-orange-50/80 text-brand-orange shadow-2xs font-black'
                        : 'text-slate-600 hover:text-brand-orange hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{p.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-orange' : 'text-slate-300'}`} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-brand-orange">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight">Need Urgent Assistance?</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Have questions regarding your order, refund, or size exchange? Our support team is ready to assist you.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5 text-xs">
              <span className="font-bold text-amber-400">+880 1895-238135</span>
              <span className="text-[11px] text-slate-400">Available 9:00 AM - 10:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
