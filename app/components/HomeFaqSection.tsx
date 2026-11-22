'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useApp } from '../context';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sl_no?: number;
}

const DEFAULT_HOME_FAQS: FaqItem[] = [
  {
    id: 1,
    question: 'Are all sneakers and shoes 100% authentic?',
    answer:
      'Yes, absolutely. Every pair of sneakers at SLOOR BD undergoes rigorous multi-point authenticity and craftsmanship checks before dispatch. We guarantee 100% genuine, premium-grade footwear.',
    sl_no: 1,
  },
  {
    id: 2,
    question: 'How long does delivery take inside and outside Dhaka?',
    answer:
      'Inside Dhaka, delivery takes 24 to 48 hours. Outside Dhaka, delivery takes 2 to 3 business days via trusted nationwide couriers with fast Cash on Delivery.',
    sl_no: 2,
  },
  {
    id: 3,
    question: 'Can I check the product before paying the delivery rider?',
    answer:
      'Yes! We provide double-boxed safe packaging and open-box checking support. You can inspect the product quality, finish, and size in front of the rider before completing your payment.',
    sl_no: 3,
  },
  {
    id: 4,
    question: 'What is your size exchange policy if the shoes do not fit?',
    answer:
      'We offer an easy 7-day hassle-free exchange policy. If the size does not fit, simply contact our WhatsApp support, and our team will arrange an instant replacement pair for you.',
    sl_no: 4,
  },
  {
    id: 5,
    question: 'What payment options are available?',
    answer:
      'We support Cash on Delivery (COD) everywhere in Bangladesh. You can also pay seamlessly via bKash, Nagad, Rocket, and Visa/Mastercard debit and credit cards.',
    sl_no: 5,
  },
];

export default function HomeFaqSection() {
  const { systemConfig } = useApp();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({ 1: true });
  const [isLoading, setIsLoading] = useState(true);

  // Derive brand name
  const rawBrand = systemConfig?.title || 'SLOOR BD';
  const brandName = rawBrand.includes('-')
    ? rawBrand.split('-')[0].trim()
    : rawBrand.split(' ')[0].trim();

  useEffect(() => {
    let isMounted = true;

    const fetchFaqs = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

        const res = await fetch(`${cleanUrl}/faqs`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data || json.result || [];
          if (Array.isArray(items) && items.length > 0) {
            const sorted = (items as FaqItem[]).sort((a, b) => (a.sl_no || 0) - (b.sl_no || 0));
            if (isMounted) {
              setFaqs(sorted);
              setOpenIds({ [sorted[0].id]: true });
              return;
            }
          }
        }
      } catch (err) {
        console.error('Failed to load global FAQs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Fallback data
      if (isMounted) {
        setFaqs(DEFAULT_HOME_FAQS);
        setIsLoading(false);
      }
    };

    fetchFaqs();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFaq = (id: number) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isLoading && faqs.length === 0) {
    return null;
  }

  return (
    <section id="faq-section" className="w-full py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Styled identically to Why Choose Us */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-normal mt-2.5 leading-relaxed">
            Everything you need to know about our luxury kicks, sizing, authentic quality, and delivery across Bangladesh.
          </p>
        </div>

        {/* FAQs Accordion Cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-slate-100 shimmer-effect rounded-2xl" />
            ))}
          </div>
        ) : (
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
                    className="w-full text-left px-4 sm:px-6 py-4 sm:py-4.5 flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-brand-orange text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        Q{index + 1}
                      </span>
                      <span className="font-bold text-xs sm:text-base text-slate-900 group-hover:text-brand-orange transition-colors">
                        {faq.question}
                      </span>
                    </div>
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-orange-100 text-brand-orange' : 'text-slate-400 group-hover:text-slate-700 bg-slate-50'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-5 pt-1 sm:pl-18 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-100/80">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
