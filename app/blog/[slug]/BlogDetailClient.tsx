'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Check,
  MessageCircle,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import SafeHtml from '../../components/SafeHtml';

interface BlogDetail {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  image_alt?: string | null;
  summary?: string | null;
  content: string;
  read_time?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  published_at?: string | null;
  views_count?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  related?: Array<{
    id: number;
    title: string;
    slug: string;
    image?: string | null;
    image_alt?: string | null;
    summary?: string | null;
    read_time?: string | null;
    published_at?: string | null;
    category?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }>;
}

interface BlogDetailClientProps {
  slug: string;
  initialBlog?: BlogDetail | null;
}

export default function BlogDetailClient({
  slug,
  initialBlog = null,
}: BlogDetailClientProps) {
  const [blog, setBlog] = useState<BlogDetail | null>(initialBlog);
  const [loading, setLoading] = useState<boolean>(!initialBlog);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!initialBlog && slug) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
      const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      setLoading(true);
      fetch(`${cleanUrl}/blogs/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && (json.data || json.result)) {
            setBlog(json.data || json.result);
          }
        })
        .catch((err) => console.error('Error fetching blog:', err))
        .finally(() => setLoading(false));
    }
  }, [slug, initialBlog]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && blog) {
      const text = encodeURIComponent(`${blog.title}\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          <span className="text-sm font-semibold text-slate-600">Loading article...</span>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Article Not Found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The article you are looking for may have been moved or unpublished.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50/50 pb-24 pt-6 md:pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-orange transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/blog" className="hover:text-brand-orange transition-colors">
            Blog
          </Link>
          {blog.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-600">{blog.category.name}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-xs">{blog.title}</span>
        </nav>

        {/* Back Link */}
        <Link
          href="/blog"
          className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>All Articles</span>
        </Link>

        {/* Article Header */}
        <header className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
          {/* Category Pill & Read Time */}
          <div className="flex flex-wrap items-center gap-3">
            {blog.category && (
              <span className="rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-orange border border-orange-200">
                {blog.category.name}
              </span>
            )}
            {blog.read_time && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {blog.read_time}
              </span>
            )}
            {blog.published_at && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {blog.published_at}
              </span>
            )}
            {typeof blog.views_count === 'number' && blog.views_count > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                {blog.views_count} views
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl leading-tight">
            {blog.title}
          </h1>

          {/* Summary Excerpt */}
          {blog.summary && (
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {blog.summary}
            </p>
          )}

          {/* Author & Share Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 font-black text-white text-xs shadow-md">
                SLOOR
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">SLOOR Editorial Team</div>
                <div className="text-xs text-slate-500">Sneaker Enthusiasts &amp; Style Curators</div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Share:
              </span>
              <button
                onClick={handleShareWhatsApp}
                title="Share on WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                onClick={handleShareFacebook}
                title="Share on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                onClick={handleCopyLink}
                title="Copy article link"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.image && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-sm">
            <img
              src={blog.image}
              alt={blog.image_alt || blog.title}
              className="h-auto w-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Rich Article Content */}
        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-12 shadow-sm">
          <div className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-brand-orange prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-li:text-slate-700 prose-img:rounded-2xl prose-blockquote:border-l-brand-orange prose-blockquote:bg-orange-50/50 prose-blockquote:py-2 prose-blockquote:rounded-r-xl">
            <SafeHtml html={blog.content} />
          </div>

          {/* End of article tag / CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 sm:p-8 border border-orange-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Looking for your next pair?</span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Explore authentic premium sneakers at SLOOR BD
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Fast Cash on Delivery across Bangladesh with 7-Day easy size exchange guarantee.
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 rounded-xl bg-brand-orange px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors"
            >
              Shop Collection &rarr;
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {blog.related && blog.related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Related Articles &amp; Guides
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Keep reading to elevate your sneaker knowledge and styling.
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {blog.related.map((rel) => (
                <article
                  key={rel.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                >
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
                  >
                    {rel.image ? (
                      <img
                        src={rel.image}
                        alt={rel.image_alt || rel.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-stone-900 text-brand-orange p-4">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    {rel.category && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                        {rel.category.name}
                      </span>
                    )}
                    <h3 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-brand-orange transition-colors">
                      <Link href={`/blog/${rel.slug}`}>
                        {rel.title}
                      </Link>
                    </h3>
                    <div className="mt-auto pt-3 text-[11px] text-slate-400">
                      {rel.read_time || rel.published_at}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
