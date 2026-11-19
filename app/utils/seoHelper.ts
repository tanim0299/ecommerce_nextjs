/**
 * Centralized SEO & Head Meta Tag Manager for Client-Side Navigation
 * Updates document.title, meta description, canonical URL, OG tags, and robots index status
 */

export interface SeoPayload {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  isIndexable?: boolean;
}

export function updateHeadMeta({
  title,
  description,
  canonical,
  keywords,
  ogImage,
  ogType = 'website',
  isIndexable = true,
}: SeoPayload) {
  if (typeof document === 'undefined') return;

  if (title) {
    document.title = title;
    setMetaTag('og:title', title, 'property');
    setMetaTag('twitter:title', title, 'name');
  }

  if (description) {
    setMetaTag('description', description, 'name');
    setMetaTag('og:description', description, 'property');
    setMetaTag('twitter:description', description, 'name');
  }

  if (keywords) {
    setMetaTag('keywords', keywords, 'name');
  }

  if (canonical) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
    setMetaTag('og:url', canonical, 'property');
  }

  if (ogImage) {
    setMetaTag('og:image', ogImage, 'property');
    setMetaTag('twitter:image', ogImage, 'name');
  }

  setMetaTag('og:type', ogType, 'property');

  setMetaTag(
    'robots',
    isIndexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    'name'
  );
}

function setMetaTag(nameOrProperty: string, content: string, attr: 'name' | 'property' = 'name') {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attr}='${nameOrProperty}']`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, nameOrProperty);
    document.head.appendChild(meta);
  }
  meta.content = content;
}
