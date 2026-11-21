'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export interface FaqItem {
  id: number;
  product_id?: number | null;
  question: string;
  answer: string;
  sl_no?: number;
}

interface ProductFaqSectionProps {
  productId: number;
  initialFaqs?: FaqItem[];
  productName?: string;
}

export default function ProductFaqSection({
  productId,
  initialFaqs,
  productName = 'this product',
}: ProductFaqSectionProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs || []);
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(!initialFaqs);

  useEffect(() => {
    if (initialFaqs && initialFaqs.length > 0) {
      setFaqs(initialFaqs);
      // Auto-open first FAQ for good UX
      setOpenIds({ [initialFaqs[0].id]: true });
      setIsLoading(false);
      return;
    }

    const fetchFaqs = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        // First try to fetch product specific FAQs
        const res = await fetch(`${cleanUrl}/faqs?product_id=${productId}`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data || json.result || [];
          if (Array.isArray(items) && items.length > 0) {
            setFaqs(items);
            setOpenIds({ [items[0].id]: true });
            setIsLoading(false);
            return;
          }
        }

        // Fallback: If no product specific FAQs, load global website FAQs
        const globalRes = await fetch(`${cleanUrl}/faqs`);
        if (globalRes.ok) {
          const globalJson = await globalRes.json();
          const globalItems = globalJson.data || globalJson.result || [];
          if (Array.isArray(globalItems) && globalItems.length > 0) {
            setFaqs(globalItems);
            setOpenIds({ [globalItems[0].id]: true });
          }
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [productId, initialFaqs]);

  const toggleFaq = (id: number) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="mt-8 border-t border-slate-200/70 pt-8">
        <div className="h-4 w-32 bg-slate-200 shimmer-effect rounded mb-2" />
        <div className="h-6 w-60 bg-slate-200 shimmer-effect rounded mb-6" />
        <div className="space-y-3">
          <div className="h-14 bg-slate-100 shimmer-effect rounded-2xl" />
          <div className="h-14 bg-slate-100 shimmer-effect rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-slate-200/70 pt-8" id="product-faqs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-[10.5px] font-black uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Questions &amp; Answers</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Common questions and answers regarding {productName}, sizing, quality, and delivery.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-semibold shrink-0">
          {faqs.length} {faqs.length === 1 ? 'Question' : 'Questions'}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = Boolean(openIds[faq.id]);
          return (
            <div
              key={faq.id || index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-orange-200/90 bg-orange-50/20 shadow-xs ring-1 ring-orange-400/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                className="w-full text-left px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-brand-orange text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    Q{index + 1}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-orange transition-colors">
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-orange-100 text-brand-orange' : 'text-slate-400 group-hover:text-slate-700 bg-slate-50'
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 pt-1 sm:pl-15 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-100/80">
                  <p className="whitespace-pre-line">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
