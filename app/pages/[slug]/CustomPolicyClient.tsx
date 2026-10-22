'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import SafeHtml from '../../components/SafeHtml';
import { useApp } from '../../context';

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

export default function CustomPolicyClient({ params }: { params?: Promise<{ slug: string }> }) {
  const { systemConfig } = useApp();
  const router = useRouter();
  const nextParams = useParams();

  let resolvedSlug = '';
  if (params) {
    try {
      const p = React.use(params);
      resolvedSlug = p?.slug || '';
    } catch {}
  }
  if (!resolvedSlug && nextParams?.slug) {
    resolvedSlug = nextParams.slug as string;
  }
  if (!resolvedSlug && typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const pIdx = parts.indexOf('pages');
    if (pIdx !== -1 && parts[pIdx + 1]) {
      resolvedSlug = decodeURIComponent(parts[pIdx + 1]);
    }
  }

  const slug = resolvedSlug;

  const [page, setPage] = useState<PageDetail | null>(null);
  const [allPages, setAllPages] = useState<PageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Horizontal Quick Tabs Scroll & Drag-by-hand state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Check scroll position for arrows
  const updateScrollIndicators = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > 4;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
  };

  useEffect(() => {
    updateScrollIndicators();
    window.addEventListener('resize', updateScrollIndicators);
    return () => window.removeEventListener('resize', updateScrollIndicators);
  }, [allPages]);

  // Auto-scroll the active tab into center view smoothly
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setTimeout(updateScrollIndicators, 350);
    }
  }, [slug, allPages]);

  // Mouse Drag-To-Scroll handlers (হাত দিয়ে টেনে ড্র্যাগ করা)
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setIsMouseDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollStartLeft(el.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const el = tabsContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.6;
    el.scrollLeft = scrollStartLeft - walk;
    setDragDistance(Math.abs(walk));
    updateScrollIndicators();
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  // Prevent link click navigation if user was dragging
  const handleLinkClick = (e: React.MouseEvent) => {
    if (dragDistance > 6) {
      e.preventDefault();
    }
  };

  // Mouse Wheel horizontal scroll support
  const handleWheel = (e: React.WheelEvent) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      updateScrollIndicators();
    }
  };

  // Arrow button clicks
  const handleScrollByButton = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollIndicators, 300);
  };

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

        // Fetch all pages list for tabs navigation
        const allRes = await fetch(`${cleanUrl}/pages`, { signal: controller.signal });
        if (allRes.ok) {
          const allJson = await allRes.json();
          const items = allJson.result || allJson.data || [];
          if (Array.isArray(items)) {
            setAllPages(items);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Error loading page content.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPageData();

    return () => controller.abort();
  }, [slug]);

  // Loading Skeleton State (Full Width Aligned)
  if (isLoading) {
    return (
      <div className="w-full py-4 font-sans animate-fade-in">
        <div className="h-4 w-32 bg-slate-200/80 rounded animate-pulse mb-3" />
        <div className="h-8 w-full max-w-sm bg-slate-200/60 rounded-lg animate-pulse mb-4" />
        <div className="w-full bg-white rounded-xl p-5 sm:p-8 border border-slate-200/70 shadow-2xs space-y-3">
          <div className="h-6 w-2/5 bg-slate-200/80 rounded animate-pulse" />
          <div className="h-px bg-slate-100 my-3" />
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !page) {
    return (
      <div className="w-full py-12 text-center font-sans animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-3 border border-orange-100">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 mb-5 leading-relaxed">
          {error || 'The requested page is currently unavailable.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-brand-orange px-4 py-2 text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-2 sm:py-4 font-sans">
      {/* Top Breadcrumb Navigation (Aligned with Header Logo) */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand-orange transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{page.title}</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Store</span>
        </Link>
      </div>

      {/* Horizontal Quick-Switch Tabs (Drag & Swipe Supported, Aligned with Header) */}
      {allPages.length > 1 && (
        <div className="relative mb-3.5 group/tabs select-none">
          {/* Left Scroll Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollByButton('left')}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-brand-orange hover:border-orange-300 transition-all cursor-pointer"
              title="Scroll Left"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Scroll Container with drag-to-scroll */}
          <div
            ref={tabsContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onScroll={updateScrollIndicators}
            className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x transition-colors ${
              isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {allPages.map((p) => {
              const isActive = p.slug === slug;
              return (
                <Link
                  key={p.id}
                  ref={isActive ? activeTabRef : null}
                  href={`/pages/${p.slug}`}
                  onClick={handleLinkClick}
                  draggable={false}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs transition-all shrink-0 font-medium select-none ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  {p.title}
                </Link>
              );
            })}
          </div>

          {/* Right Scroll Arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollByButton('right')}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-brand-orange hover:border-orange-300 transition-all cursor-pointer"
              title="Scroll Right"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Content Article (Container width aligned exactly with Header Logo & Actions) */}
      <article className="w-full bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 border border-slate-200/80 shadow-2xs">
        
        {/* Header */}
        <header className="border-b border-slate-100 pb-3.5 mb-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {page.title}
          </h1>

          {page.updated_at && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
              <Clock className="w-3 h-3" />
              <span>
                Updated {new Date(page.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </header>

        {/* Details Body */}
        <div className="overflow-hidden min-h-[50px]">
          {page.description && page.description.trim() !== '' ? (
            <SafeHtml
              html={page.description}
              className="policy-rich-text"
            />
          ) : (
            <div className="py-6 text-center text-slate-400">
              <FileText className="w-7 h-7 mx-auto text-slate-300 mb-1.5 stroke-[1.5]" />
              <p className="text-xs font-medium text-slate-500">No details have been added for this page yet.</p>
            </div>
          )}
        </div>

        {/* Clean Compact Support Note */}
        {(systemConfig?.phones?.length || systemConfig?.emails?.length) && (
          <footer className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Need help or have questions regarding this page?</span>
            
            <div className="flex items-center gap-3 font-medium text-slate-600">
              {systemConfig?.phones && systemConfig.phones.length > 0 && (
                <a
                  href={`tel:${systemConfig.phones[0].replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1 hover:text-brand-orange transition-colors"
                >
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{systemConfig.phones[0]}</span>
                </a>
              )}

              {systemConfig?.emails && systemConfig.emails.length > 0 && (
                <a
                  href={`mailto:${systemConfig.emails[0]}`}
                  className="inline-flex items-center gap-1 hover:text-brand-orange transition-colors"
                >
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{systemConfig.emails[0]}</span>
                </a>
              )}
            </div>
          </footer>
        )}

      </article>
    </div>
  );
}