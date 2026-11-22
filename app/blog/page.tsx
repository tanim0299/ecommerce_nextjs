import type { Metadata } from 'next';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Sneaker Blog, Styling Guides & Drops | SLOOR BD',
  description: 'Explore expert sneaker care guides, streetwear styling tips, shoe size charts, and the latest footwear trends from SLOOR BD.',
  alternates: {
    canonical: 'https://sloor.bd/blog',
  },
  openGraph: {
    title: 'Sneaker Blog, Styling Guides & Drops | SLOOR BD',
    description: 'Explore expert sneaker care guides, streetwear styling tips, shoe size charts, and the latest footwear trends from SLOOR BD.',
    url: 'https://sloor.bd/blog',
    siteName: 'SLOOR BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sneaker Blog, Styling Guides & Drops | SLOOR BD',
    description: 'Explore expert sneaker care guides, streetwear styling tips, shoe size charts, and the latest footwear trends from SLOOR BD.',
  },
};

export default async function BlogPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let initialBlogs: any[] = [];
  let initialCategories: any[] = [];

  try {
    const [blogsRes, catsRes] = await Promise.all([
      fetch(`${cleanUrl}/blogs?limit=50`),
      fetch(`${cleanUrl}/blog-categories`),
    ]);

    if (blogsRes.ok) {
      const blogsJson = await blogsRes.json();
      initialBlogs = blogsJson.data || blogsJson.result || [];
    }

    if (catsRes.ok) {
      const catsJson = await catsRes.json();
      initialCategories = catsJson.data || catsJson.result || [];
    }
  } catch (err) {
    console.error('Error prefetching blogs:', err);
  }

  return (
    <BlogListClient
      initialBlogs={initialBlogs}
      initialCategories={initialCategories}
    />
  );
}
