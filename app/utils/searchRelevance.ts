export interface SearchableItem {
  id: number | string;
  name?: string | null;
  slug?: string | null;
  sku?: string | null;
  brand?: { name?: string | null } | null;
  category?: { name?: string | null } | null;
  sub_category?: { name?: string | null } | null;
  variants?: Array<{ sku?: string | null; [key: string]: any }> | null;
  [key: string]: any;
}

function getBigrams(str: string): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.substring(i, i + 2));
  }
  return bigrams;
}

export function getDiceSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length < 2 || str2.length < 2) return 0;
  const b1 = getBigrams(str1);
  const b2 = getBigrams(str2);
  let intersection = 0;
  const used = new Set<number>();
  for (let i = 0; i < b1.length; i++) {
    for (let j = 0; j < b2.length; j++) {
      if (b1[i] === b2[j] && !used.has(j)) {
        intersection++;
        used.add(j);
        break;
      }
    }
  }
  return (2.0 * intersection) / (b1.length + b2.length);
}

// Clean and normalize strings: lowercase, remove non-alphanumeric chars, collapse spaces
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Calculates a weighted relevance score for a product given a user's search query.
 * Higher score = more relevant.
 * Returns 0 if the product should not be shown.
 */
export function getSearchRelevanceScore(product: SearchableItem, query: string): number {
  const normQuery = normalize(query);
  if (!normQuery) return 0;

  const queryWords = normQuery.split(' ').filter(Boolean);
  if (queryWords.length === 0) return 0;

  const rawName = product.name || '';
  const normName = normalize(rawName);
  const nameWords = normName.split(' ').filter(Boolean);

  const brandName = normalize(product.brand?.name || '');
  const categoryName = normalize(product.category?.name || '');
  const subCategoryName = normalize(product.sub_category?.name || '');
  const sku = normalize(product.sku || '');

  // 1. EXACT & PHRASE MATCHES (Highest Priority: 10,000 - 25,000 points)
  // -----------------------------------------------------------------
  // Exact name match
  if (normName === normQuery) {
    return 25000;
  }
  // SKU exact match
  if (sku && sku === normQuery) {
    return 22000;
  }
  // Variant SKU exact match
  if (product.variants && Array.isArray(product.variants)) {
    if (product.variants.some(v => v.sku && normalize(v.sku) === normQuery)) {
      return 20000;
    }
  }

  // Name starts with the exact query
  if (normName.startsWith(normQuery)) {
    return 18000;
  }

  // Name contains full query as a continuous phrase
  if (normName.includes(normQuery)) {
    const lengthPenalty = Math.max(0, normName.length - normQuery.length) * 5;
    return Math.max(12000, 15000 - lengthPenalty);
  }

  // 2. TOKEN-LEVEL MATCHING
  // -----------------------------------------------------------------
  let matchedQueryTokens = 0;
  let tokenScore = 0;

  for (const qWord of queryWords) {
    // A. Check exact word in product name
    if (nameWords.includes(qWord)) {
      matchedQueryTokens++;
      tokenScore += qWord.length >= 3 ? 600 : 350;
    }
    // B. Check word prefix in product name (e.g. "sam" matches "samba")
    else if (nameWords.some(nWord => nWord.startsWith(qWord))) {
      matchedQueryTokens++;
      tokenScore += 350;
    }
    // C. Check substring in product name
    else if (nameWords.some(nWord => nWord.includes(qWord))) {
      matchedQueryTokens++;
      tokenScore += 200;
    }
    // D. Check Brand, Category, SubCategory match
    else if (brandName.includes(qWord)) {
      matchedQueryTokens++;
      tokenScore += 400;
    } else if (categoryName.includes(qWord) || subCategoryName.includes(qWord)) {
      matchedQueryTokens++;
      tokenScore += 250;
    }
    // E. Fuzzy match with Dice similarity on name words (only for words >= 4 chars)
    else if (qWord.length >= 4) {
      let maxSim = 0;
      for (const nWord of nameWords) {
        if (nWord.length >= 4) {
          const sim = getDiceSimilarity(qWord, nWord);
          if (sim > maxSim) maxSim = sim;
        }
      }
      if (maxSim >= 0.75) {
        matchedQueryTokens += 0.8;
        tokenScore += 200;
      }
    }
  }

  // 3. MULTI-WORD QUERY DISCIPLINE (Threshold Filtering)
  // -----------------------------------------------------------------
  // If user searched for multiple words (e.g. "Adidas Samba OG Cloud White" = 5 words),
  // we do NOT match a shoe that only matches 1 word ("Adidas").
  const matchRatio = matchedQueryTokens / queryWords.length;

  if (queryWords.length === 1) {
    if (matchedQueryTokens < 0.8) return 0;
  } else if (queryWords.length === 2) {
    if (matchRatio < 0.5) return 0;
  } else {
    // For 3+ words, at least 60% of query words must match
    if (matchRatio < 0.6) return 0;
  }

  // Bonus for matching ALL query words
  if (matchRatio >= 0.99) {
    tokenScore += 4000;
  } else if (matchRatio >= 0.75) {
    tokenScore += 1800;
  }

  return tokenScore;
}

export function isProductMatch(product: SearchableItem, query: string): boolean {
  return getSearchRelevanceScore(product, query) > 0;
}

/**
 * Filter products by search query and sort them in descending order of relevance.
 */
export function filterAndSortByRelevance<T extends SearchableItem>(products: T[], query: string): T[] {
  const normQuery = normalize(query);
  if (!normQuery) return products;

  const scored: Array<{ product: T; score: number }> = [];

  for (const product of products) {
    const score = getSearchRelevanceScore(product, normQuery);
    if (score > 0) {
      scored.push({ product, score });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.map(item => item.product);
}
