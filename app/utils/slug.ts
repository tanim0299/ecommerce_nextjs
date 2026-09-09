export const slugify = (text?: string | null): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const getProductUrl = (product?: { id?: number | string; name?: string; slug?: string } | null): string => {
  if (!product) return '/';
  const slug = product.slug || slugify(product.name);
  return `/product/${encodeURIComponent(slug || product.id || '')}`;
};

export const getCategoryUrl = (category?: { id?: number | string; name?: string; slug?: string } | null, item?: { name?: string } | null): string => {
  if (!category) return '/shop';
  const catSlug = category.slug || slugify(category.name);
  const params = new URLSearchParams();
  if (item?.name) {
    params.set('item', slugify(item.name));
  }
  params.set('category', catSlug);
  return `/shop?${params.toString()}`;
};

export const getSubCategoryUrl = (subCategory?: { id?: number | string; name?: string; slug?: string } | null, category?: { name?: string } | null): string => {
  if (!subCategory) return '/shop';
  const subSlug = subCategory.slug || slugify(subCategory.name);
  const params = new URLSearchParams();
  if (category?.name) {
    params.set('category', slugify(category.name));
  }
  params.set('sub_category', subSlug);
  return `/shop?${params.toString()}`;
};

export const getItemUrl = (item?: { id?: number | string; name?: string; slug?: string } | null): string => {
  if (!item) return '/shop';
  const itemSlug = item.slug || slugify(item.name);
  return `/shop?item=${encodeURIComponent(itemSlug)}`;
};
