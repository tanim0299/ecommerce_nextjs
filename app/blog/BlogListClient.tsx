'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
  Tag,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  blogs_count?: number;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  image_alt?: string | null;
  summary?: string | null;
  read_time?: string | null;
  published_at?: string | null;
  views_count?: number;
  canonical_url?: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface BlogListClientProps {
  initialBlogs?: BlogPost[];
  initialCategories?: BlogCategory[];
}

export default function BlogListClient({
  initialBlogs = [],
  initialCategories = [],
}: BlogListClientProps) {
  const [blogs] = useState<BlogPost[]>(initialBlogs);
  const [categories] = useState<BlogCategory[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (!blog.category || blog.category.slug !== selectedCategory) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = blog.title?.toLowerCase().includes(query);
        const summaryMatch = blog.summary?.toLowerCase().includes(query);
        const categoryMatch = blog.category?.name?.toLowerCase().includes(query);
        return titleMatch || summaryMatch || categoryMatch;
      }

      return true;
    });
  }, [blogs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 md:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-orange transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900">Blog</span>
        </nav>

        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900 px-6 py-12 text-center sm:px-12 sm:py-16 md:py-20 shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SLOOR Journal &amp; Editorial</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Sneakers, Stories &amp; <span className="text-brand-orange">Culture</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300">
              Curated shoe maintenance guides, streetwear outfit inspiration, size guides, and authentic sneaker insights.
            </p>

            {/* Search Bar inside Hero */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sneaker care, style guides, sizing..."
                  className="w-full rounded-2xl border border-slate-700/60 bg-white/10 py-3.5 pl-12 pr-10 text-sm font-medium text-white placeholder-slate-400 backdrop-blur-md outline-none transition-all focus:border-brand-orange focus:bg-slate-900/90 focus:ring-2 focus:ring-brand-orange/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-950 text-white shadow-md shadow-slate-900/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>All Articles</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {blogs.length}
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-brand-orange text-white shadow-md shadow-orange-500/25'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.blogs_count === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    selectedCategory === cat.slug
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.blogs_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Articles Count & Active Filter Indicator */}
        <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="text-xs sm:text-sm font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredBlogs.length}</span> {filteredBlogs.length === 1 ? 'article' : 'articles'}
            {selectedCategory !== 'all' && (
              <span> in <span className="font-bold text-brand-orange">{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching &ldquo;<span className="text-slate-900 font-bold">{searchQuery}</span>&rdquo;</span>
            )}
          </div>

          {(selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-brand-orange hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Articles Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
              >
                {/* Cover Image */}
                <Link
                  href={`/blog/${blog.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
                >
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.image_alt || blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-stone-900 to-slate-950 p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-brand-orange mb-2 shadow-inner">
                        <BookOpen className="h-7 w-7" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        SLOOR BD Editorial
                      </span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  {blog.category && (
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow">
                      {blog.category.name}
                    </span>
                  )}
                </Link>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  {/* Meta Bar: Date & Read Time */}
                  <div className="mb-3 flex items-center gap-3 text-xs font-medium text-slate-500">
                    {blog.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {blog.published_at}
                      </span>
                    )}
                    {blog.read_time && (
                      <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {blog.read_time}
                      </span>
                    )}
                    {typeof blog.views_count === 'number' && blog.views_count > 0 && (
                      <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        {blog.views_count}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand-orange line-clamp-2">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>

                  {/* Summary */}
                  {blog.summary && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {blog.summary}
                    </p>
                  )}

                  {/* Footer Link */}
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange transition-transform group-hover:translate-x-1"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-16 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">No Articles Found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any articles matching your selected category or search keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
