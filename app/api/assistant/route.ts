import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProductItem {
  id: number;
  name: string;
  slug?: string;
  price: number;
  regular_price?: number;
  image?: string;
  stock_status?: string;
  stock_qty?: number;
  category?: string;
  brand?: string;
  item?: string;
  description?: string;
}

interface BackendAiConfig {
  is_enabled?: boolean;
  name?: string;
  role_title?: string;
  welcome_message?: string;
  system_persona?: string;
  api_key?: string;
  has_api_key?: boolean;
  quick_prompts?: string[];
  compiled_knowledge?: string;
  published_at?: string;
  last_trained_at?: string;
}

// In-memory cache for products & backend AI config (60s TTL for fast admin sync)
let cachedProducts: ProductItem[] = [];
let lastProductsFetchTime = 0;
let cachedAiConfig: BackendAiConfig | null = null;
let lastAiConfigFetchTime = 0;

function getApiBase(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/';
  return apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
}

async function getProductsCatalog(): Promise<ProductItem[]> {
  const now = Date.now();
  if (cachedProducts.length > 0 && now - lastProductsFetchTime < 180000) {
    return cachedProducts;
  }

  const cleanApi = getApiBase();
  try {
    const res = await fetch(`${cleanApi}products`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    const rawList = Array.isArray(json?.data) ? json.data : [];

    cachedProducts = rawList.map((p: any) => {
      const mainImage = (p.images && p.images[0]?.url) || (p.images && p.images[0]?.image) || p.image || (p.variants && p.variants.find((v: any) => v.image)?.image) || '';
      return {
        id: p.id,
        name: p.name || 'Product',
        slug: p.slug || String(p.id),
        price: Number(p.sale_price || p.price || 0),
        regular_price: Number(p.regular_price || 0),
        image: mainImage,
        stock_status: p.stock_status || (p.stock_qty > 0 ? 'in_stock' : 'out_of_stock'),
        stock_qty: Number(p.stock_qty || 0),
        category: p.category?.name || '',
        brand: p.brand?.name || '',
        item: p.item?.name || '',
        description: (p.description || '').replace(/<[^>]*>?/gm, ' ').slice(0, 200),
      };
    });
    lastProductsFetchTime = now;
  } catch (err) {
    console.error('Failed to fetch store products for assistant:', err);
  }

  return cachedProducts;
}

async function getAiConfig(): Promise<BackendAiConfig> {
  const now = Date.now();
  if (cachedAiConfig && now - lastAiConfigFetchTime < 60000) {
    return cachedAiConfig;
  }

  const cleanApi = getApiBase();
  try {
    const res = await fetch(`${cleanApi}ai-assistant/config`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        cachedAiConfig = json.data;
        lastAiConfigFetchTime = now;
        return cachedAiConfig!;
      }
    }
  } catch (err) {
    console.error('Failed to fetch backend AI assistant config:', err);
  }

  // Fallback defaults
  return {
    is_enabled: true,
    name: 'Sloor Assistant',
    role_title: 'AI Shopping Stylist',
    welcome_message: "Hello! 👋 I'm **Sloor Assistant**, your personal AI stylist and shopping advisor.\n\nTell me what you're looking for—like sneaker styles, budget, sizing, or questions about delivery & returns!",
    quick_prompts: [
      '🔥 Trending Sneakers',
      '💰 Shoes Under 3,500 BDT',
      '📏 Sizing Guide',
      '🚚 Delivery & Shipping Policy',
      '🔄 7-Day Return Policy',
    ],
  };
}

// Built-in intelligent rule engine (works offline or as fallback when API key is not present)
function generateSmartReply(query: string, products: ProductItem[], config: BackendAiConfig): { reply: string; matchedProducts: ProductItem[]; suggestions: string[] } {
  const q = query.toLowerCase().trim();
  const botName = config.name || 'Sloor Assistant';

  // 1. Natural human greetings & introductions
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'salam' ||
    q === 'assalamu alaikum' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.startsWith('hey ') ||
    q.includes('good morning') ||
    q.includes('good evening') ||
    q.includes('how are you') ||
    q.includes('who are you') ||
    q.includes('what can you do')
  ) {
    return {
      reply: `Hello and welcome to SLOOR! 👋 I am **${botName}**, your personal shopping concierge and sizing stylist.\n\nI can help you explore our luxury footwear collection, find your perfect size, check delivery timelines across Bangladesh, or answer store policies. How can I assist you today?`,
      matchedProducts: products.slice(0, 2),
      suggestions: ['🔥 Trending Sneakers', '📏 Sizing Guide', '🚚 Delivery Rates', '💰 Under 3,500 BDT'],
    };
  }

  // 2. Shoe Sizing Guide
  if (q.includes('size') || q.includes('sizing') || q.includes('fit') || q.includes('measure') || q.includes('chart') || q.includes('dimension')) {
    return {
      reply: `Here is the official **SLOOR Footwear Sizing Chart** (EU Standard):\n\n• **EU 39:** 24.5 cm foot length\n• **EU 40:** 25.0 cm foot length\n• **EU 41:** 25.5 cm foot length\n• **EU 42:** 26.0 cm foot length\n• **EU 43:** 26.5 cm foot length\n• **EU 44:** 27.0 cm foot length\n• **EU 45:** 27.5 cm foot length\n\n💡 **Fitting Tip:** If you have wider feet or fall between two sizes, we recommend selecting **one size up** for the most comfortable stride. We also provide free size exchanges within 7 days!`,
      matchedProducts: products.slice(0, 3),
      suggestions: ['Show Available Sizes', '🔄 Return & Exchange Policy', '🔥 Popular Sneakers'],
    };
  }

  // 3. Delivery & Shipping
  if (q.includes('delivery') || q.includes('shipping') || q.includes('courier') || q.includes('charge') || q.includes('fee') || q.includes('dhaka') || q.includes('sylhet') || q.includes('chittagong')) {
    return {
      reply: `Here are our **Delivery Zones & Charges**:\n\n• **Inside Dhaka:** 24–48 hours (Standard charge: **70 BDT**)\n• **Outside Dhaka (Sylhet, Chittagong, etc.):** 2–4 business days (Standard charge: **130 BDT**)\n• **Free Shipping:** Applicable on all orders over **1,500 BDT**!\n\nAll orders include real-time courier tracking and Cash on Delivery (COD) service at your doorstep.`,
      matchedProducts: products.slice(0, 2),
      suggestions: ['7-Day Return Policy', 'Show Best Selling Sneakers', 'Visit Showroom'],
    };
  }

  // 4. Return, Exchange & Refund
  if (q.includes('return') || q.includes('exchange') || q.includes('refund') || q.includes('warranty') || q.includes('policy')) {
    return {
      reply: `Enjoy a **7-Day Hassle-Free Return & Exchange** guarantee!\n\n• You can request an exchange within **7 days** of package arrival.\n• Footwear must be unworn, undamaged, and in original packaging with intact tags.\n• Free size replacements are provided if stock is available.\n\nTo initiate an exchange, simply reach out to our support team with your order ID!`,
      matchedProducts: [],
      suggestions: ['Delivery Timelines', 'Authenticity Guarantee', 'Contact Support'],
    };
  }

  // 5. Store / Showroom / Location / Feni
  if (q.includes('store') || q.includes('outlet') || q.includes('location') || q.includes('address') || q.includes('showroom') || q.includes('feni') || q.includes('visit')) {
    return {
      reply: `You are warmly invited to visit our flagship retail showroom:\n\n📍 **SLOOR Flagship Store**\nAl-Mahmud Tower (2nd Floor), SSK Road, Feni, Bangladesh.\n⏰ **Hours:** 10:00 AM – 9:00 PM (Open 7 Days a Week)\n\nYou can also click the **Store Locator** link in the header navigation to view the live Google Map location!`,
      matchedProducts: [],
      suggestions: ['Store Hotline number', 'View latest arrivals', 'Check Sizing Guide'],
    };
  }

  // 6. Authenticity & Payment
  if (q.includes('authentic') || q.includes('genuine') || q.includes('original') || q.includes('fake') || q.includes('copy') || q.includes('payment') || q.includes('cod') || q.includes('bkash')) {
    return {
      reply: `Every pair at SLOOR is **100% Genuine and Individually Inspected** for premium sole durability, breathable stitching, and supreme ergonomics.\n\nWe accept **Cash on Delivery (COD)** nationwide, as well as bKash, Nagad, and major credit cards for your convenience!`,
      matchedProducts: products.slice(0, 3),
      suggestions: ['Trending Sneakers', 'Shoes under 3,000 BDT', 'Delivery Policy'],
    };
  }

  // 7. Contact & Support
  if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('email') || q.includes('support') || q.includes('hotline') || q.includes('whatsapp')) {
    return {
      reply: `Our customer concierge team is at your service 7 days a week:\n\n📞 **Hotline & WhatsApp Support:** Available via our website Contact page.\n📧 **Email:** support@sloor.bd\n\nFeel free to ask me any questions right here in chat as well!`,
      matchedProducts: [],
      suggestions: ['Delivery information', 'View all collections', 'Return Policy'],
    };
  }

  // 8. Budget extraction (e.g. "under 3000", "below 3500", "3000 tk")
  let budgetMax: number | null = null;
  const budgetMatch = q.match(/(?:under|below|less than|budget of?|within|up to|upto)\s*(?:bdt|tk|৳)?\s*(\d{3,6})/i)
    || q.match(/(\d{3,6})\s*(?:bdt|tk|taka)/i);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1] || budgetMatch[2], 10);
    if (!isNaN(val) && val > 0) budgetMax = val;
  }

  // 9. Semantic Product Scoring
  const keywords = q.split(/\s+/).filter(w => w.length > 2);
  const scoredProducts = products.map(p => {
    let score = 0;
    const pName = p.name.toLowerCase();
    const pCategory = p.category.toLowerCase();
    const pBrand = p.brand.toLowerCase();
    const pItem = p.item.toLowerCase();

    // Budget check
    if (budgetMax !== null) {
      if (p.price <= budgetMax) score += 35;
      else score -= 50;
    }

    // In-stock boost
    if (p.stock_status === 'in_stock') score += 15;

    // Keyword matching
    for (const kw of keywords) {
      if (pName.includes(kw)) score += 20;
      if (pCategory.includes(kw)) score += 15;
      if (pBrand.includes(kw)) score += 15;
      if (pItem.includes(kw)) score += 10;
    }

    if (q.includes('sneaker') && (pName.includes('campus') || pName.includes('trainer') || pItem.includes('sneaker'))) score += 20;
    if (q.includes('black') && pName.includes('black')) score += 25;
    if (q.includes('white') && pName.includes('white')) score += 25;
    if (q.includes('blue') && pName.includes('blue')) score += 25;
    if (q.includes('adidas') && (pName.includes('adidas') || pBrand.includes('adidas'))) score += 30;
    if (q.includes('nike') && (pName.includes('nike') || pBrand.includes('nike'))) score += 30;

    return { product: p, score };
  });

  scoredProducts.sort((a, b) => b.score - a.score);
  const matched = scoredProducts.filter(item => item.score > 10).slice(0, 3).map(i => i.product);

  if (matched.length > 0) {
    let intro = "Here are our top footwear recommendations curated for you:";
    if (budgetMax) {
      intro = `Here are the finest styles matching your budget of **${budgetMax.toLocaleString()} BDT**:`;
    } else if (q.includes('sneaker') || q.includes('shoe')) {
      intro = "Check out our most popular sneakers and footwear styles right now:";
    } else if (q.includes('black')) {
      intro = "Here are sleek black edition footwear styles available in our collection:";
    }

    return {
      reply: `${intro}\n\nYou can click on any product card below to view details, choose sizes, or add directly to your bag!`,
      matchedProducts: matched,
      suggestions: ['Shoes under 3,000 BDT', 'Do you offer free delivery?', 'What sizes are available?'],
    };
  }

  // Fallback general guidance
  return {
    reply: `I'd love to help you find the perfect pair! We offer premium sneakers, loafers, and lifestyle footwear crafted for comfort and style. Tell me what type of shoes you're looking for, your preferred color, size, or your budget!`,
    matchedProducts: products.slice(0, 2),
    suggestions: ['🔥 Trending Sneakers', '💰 Under 3,500 BDT', '🚚 Delivery Rates', '🔄 7-Day Return'],
  };
}

// GET endpoint: returns public AI config to the frontend client
export async function GET() {
  const config = await getAiConfig();
  return NextResponse.json({
    success: true,
    data: {
      is_enabled: config.is_enabled ?? true,
      name: config.name || 'Sloor Assistant',
      role_title: config.role_title || 'AI Shopping Stylist',
      welcome_message: config.welcome_message || "Hello! 👋 I'm **Sloor Assistant**, your personal AI stylist and shopping advisor.",
      quick_prompts: config.quick_prompts || [
        '🔥 Trending Sneakers',
        '💰 Shoes Under 3,500 BDT',
        '📏 Sizing Guide',
        '🚚 Delivery & Shipping Policy',
        '🔄 7-Day Return Policy',
      ],
      published_at: config.published_at || null,
    },
  });
}

// POST endpoint: handles customer chat queries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const latestMessage = messages[messages.length - 1]?.content || '';

    // Load AI configuration trained from Laravel backend
    const aiConfig = await getAiConfig();

    // Check if assistant is disabled in backend
    if (aiConfig.is_enabled === false) {
      return NextResponse.json({
        success: false,
        reply: "The AI shopping assistant is currently offline for store maintenance. Please explore our catalog or contact support!",
        products: [],
        suggestions: ['Browse Catalog', 'Contact Support'],
      });
    }

    if (!latestMessage.trim()) {
      return NextResponse.json({
        success: true,
        reply: aiConfig.welcome_message || "Hello! How can I assist you with your shopping today?",
        products: [],
        suggestions: aiConfig.quick_prompts || ['Show Best Sellers', 'Shoes Under 3,000 BDT', 'Delivery info'],
      });
    }

    // Load store catalog
    const products = await getProductsCatalog();

    // Determine Gemini API key: backend config takes precedence, then .env.local
    const apiKey = (aiConfig.api_key && aiConfig.api_key.trim().length > 10)
      ? aiConfig.api_key.trim()
      : process.env.GEMINI_API_KEY;

    // If API Key is available, use Google Gemini with trained backend knowledge
    if (apiKey) {
      try {
        const compactCatalog = products.slice(0, 25).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          brand: p.brand,
          category: p.category,
          status: p.stock_status,
        }));

        const persona = aiConfig.system_persona || `You are ${aiConfig.name || 'Sloor Assistant'}, a warm, stylish, and knowledgeable AI shopping assistant for SLOOR.`;
        const trainedKnowledge = aiConfig.compiled_knowledge || 'Store policies: 7-Day Returns, Free Shipping over 1,500 BDT, Delivery: Dhaka 70 BDT, Outside Dhaka 130 BDT.';

        const systemInstruction = `
${persona}

--- LANGUAGE REQUIREMENT ---
IMPORTANT: Always reply in English only. Never output Bengali or other languages.

--- TRAINED STORE KNOWLEDGE (OFFICIAL BACKEND DATA) ---
${trainedKnowledge}

--- STORE CATALOG SUMMARY ---
${JSON.stringify(compactCatalog)}

--- RESPONSE GUIDELINES ---
1. Greet customers warmly and naturally if they say "hi", "hello", "hey", or ask who you are.
2. When answering questions regarding shoe sizing, delivery zones & fees, return & exchange policy, store location, or payments, ALWAYS use the official TRAINED STORE KNOWLEDGE provided above.
3. When the customer asks for footwear recommendations, colors, budget, or styles, recommend items from the catalog.
4. At the very end of your response, IF you recommend any products, append this exact token: <<<PRODUCTS:[id1,id2]>>> using up to 3 numeric IDs from the catalog.
5. If the question does NOT require product recommendations (e.g., sizing table, delivery rates, greeting), do NOT include the <<<PRODUCTS:[...]>>> token.
6. Keep answers elegant, concise, and structured (bullet points where helpful).
`;

        // Available models in 2026: gemini-3.5-flash-lite, gemini-3.5-flash
        const modelCandidates = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
        let geminiData: any = null;

        for (const model of modelCandidates) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const geminiRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: systemInstruction },
                      { text: `Conversation history:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nUser's latest message: ${latestMessage}` },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 600,
                },
              }),
            });

            if (geminiRes.ok) {
              geminiData = await geminiRes.json();
              if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
                break;
              }
            }
          } catch (modelErr) {
            console.warn(`Model ${model} attempt failed:`, modelErr);
          }
        }

        if (geminiData) {
          let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

          // Parse recommended IDs
          const idMatch = rawText.match(/<<<PRODUCTS:\[(.*?)\]>>>/);
          let recommendedIds: number[] = [];
          if (idMatch && idMatch[1]) {
            recommendedIds = idMatch[1].split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
            rawText = rawText.replace(/<<<PRODUCTS:\[(.*?)\]>>>/, '').trim();
          }

          const matchedProducts = products.filter(p => recommendedIds.includes(p.id));

          return NextResponse.json({
            success: true,
            reply: rawText,
            products: matchedProducts,
            suggestions: aiConfig.quick_prompts && aiConfig.quick_prompts.length > 0 ? aiConfig.quick_prompts.slice(0, 4) : ['Show more sneakers', 'Delivery time', 'Check return policy'],
          });
        }
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to smart engine:', geminiError);
      }
    }

    // Fallback: Built-in Smart Semantic Engine with trained knowledge
    const result = generateSmartReply(latestMessage, products, aiConfig);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      products: result.matchedProducts,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      {
        success: false,
        reply: "I encountered a momentary issue processing your request. Please try again or explore our catalog!",
        products: [],
        suggestions: ['Trending Sneakers', 'Delivery Policy'],
      },
      { status: 500 }
    );
  }
}