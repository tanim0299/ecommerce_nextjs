'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  Calendar,
  ArrowRight,
  BookOpen,
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
    <div className="min-h-screen bg-white pb-20 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-orange transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Blog</span>
        </nav>

        {/* Clean Narrow Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c07828]/10 text-[#c07828] text-[10px] sm:text-xs font-black uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            SLOOR Journal &amp; Guides
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Sneakers, Stories &amp; Culture
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
            Curated shoe care guides, streetwear outfit styling, size tips, and sneaker stories from SLOOR BD.
          </p>
        </div>

        {/* Filter Tabs & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          {/* Dynamic Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>All</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-slate-600'
                }`}
              >
                {blogs.length}
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.name}</span>
                {typeof cat.blogs_count === 'number' && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      selectedCategory === cat.slug
                        ? 'bg-white/25 text-white'
                        : 'bg-white text-slate-600'
                    }`}
                  >
                    {cat.blogs_count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Compact Clean Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-brand-orange focus:bg-white focus:ring-1 focus:ring-brand-orange"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter State Info */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-900">{filteredBlogs.length}</span> {filteredBlogs.length === 1 ? 'article' : 'articles'}
              {selectedCategory !== 'all' && (
                <span> in <span className="font-bold text-brand-orange">{categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</span></span>
              )}
              {searchQuery && (
                <span> matching &ldquo;<span className="text-slate-900 font-bold">{searchQuery}</span>&rdquo;</span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="font-bold text-brand-orange hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
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
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-brand-orange mb-2 shadow-inner">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        SLOOR BD Editorial
                      </span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  {blog.category && (
                    <span className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
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
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand-orange line-clamp-2">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>

                  {/* Summary */}
                  {blog.summary && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {blog.summary}
                    </p>
                  )}

                  {/* Footer Link */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
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
          <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">No Articles Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any articles matching your selected category or search keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
