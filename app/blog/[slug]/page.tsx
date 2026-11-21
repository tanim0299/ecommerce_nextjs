import type { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let blogData: any = null;
  try {
    const res = await fetch(`${cleanUrl}/blogs/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      blogData = json.data || json.result;
    }
  } catch (err) {
    console.error('Error fetching blog metadata:', err);
  }

  const defaultCanonical = `https://sloor.bd/blog/${slug}`;
  if (!blogData) {
    return {
      title: 'Blog Article | SLOOR BD',
      alternates: {
        canonical: defaultCanonical,
      },
    };
  }

  const title = blogData.meta_title || `${blogData.title} | SLOOR BD`;
  const description =
    blogData.meta_description ||
    blogData.summary ||
    (blogData.content
      ? blogData.content
          .replace(/<[^>]*>?/gm, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 160)
      : 'Read this article on SLOOR BD.');

  const canonicalUrl = blogData.canonical_url || defaultCanonical;
  const images = blogData.image ? [blogData.image] : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'SLOOR BD',
      type: 'article',
      images,
      publishedTime: blogData.published_at_iso,
    },
    twitter: {
      card: blogData.image ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  };
}

export async function generateStaticParams() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
    const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const res = await fetch(`${cleanUrl}/blogs?limit=50`);
    if (res.ok) {
      const json = await res.json();
      const items = json.result || json.data || [];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((b: any) => ({ slug: String(b.slug) }));
      }
    }
  } catch {
    // fallback if backend is not reachable at build time
  }
  return [
    { slug: 'how-to-clean-maintain-suede-sneakers-bangladesh' },
    { slug: 'top-5-sneaker-styling-rules-every-guy-should-know' },
    { slug: 'sneaker-sizing-guide-how-to-find-perfect-fit-online' },
  ];
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let initialBlog: any = null;
  try {
    const res = await fetch(`${cleanUrl}/blogs/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      initialBlog = json.data || json.result;
    }
  } catch (err) {
    console.error('Error fetching blog details:', err);
  }

  return (
    <BlogDetailClient
      slug={slug}
      initialBlog={initialBlog}
    />
  );
}
