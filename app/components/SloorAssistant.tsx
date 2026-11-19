'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Bot,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useApp, getProductUrl } from '../context';

interface AssistantProduct {
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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: AssistantProduct[];
  suggestions?: string[];
  timestamp: string;
}

interface AssistantConfig {
  name: string;
  roleTitle: string;
  themeColor: string;
  headerBg: string;
  launcherText: string;
  welcomeMessage: string;
  quickPrompts: string[];
  isEnabled: boolean;
}

const DEFAULT_SUGGESTIONS = [
  '🔥 ট্রেন্ডিং স্নিকার্স',
  '💰 ৪,০০০ টাকার উপরে প্রিমিয়াম কালেকশন',
  '📏 সাইজ গাইড (Sizing Chart)',
  '🚚 ডেলিভারি চার্জ ও সময়সীমা',
  '🔄 ৭ দিনের রিটার্ন ও এক্সচেঞ্জ পলিসি',
];

export default function SloorAssistant() {
  const router = useRouter();
  const { resolveImageUrl, handleQuickAddToCart, showToast, systemConfig } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [assistantConfig, setAssistantConfig] = useState<AssistantConfig>({
    name: 'Sloor Assistant',
    roleTitle: 'AI Shopping Stylist',
    themeColor: '#ea580c',
    headerBg: '#020617',
    launcherText: 'Need advice? Ask Sloor AI',
    welcomeMessage: "Hello! 👋 I'm **Sloor Assistant**, your personal AI stylist and shopping advisor.\n\nTell me what you're looking for—like sneaker styles, budget, sizing, or questions about delivery & returns!",
    quickPrompts: DEFAULT_SUGGESTIONS,
    isEnabled: true,
  });

  // Helper to get clean API Base
  const getApiBase = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/';
    return apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
  };

  // Fetch backend-trained AI configuration & styling on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cleanApi = getApiBase();
        const res = await fetch(`${cleanApi}ai-assistant/config`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const cfg = json?.data;
          if (cfg) {
            const loadedPrompts = Array.isArray(cfg.quick_prompts) && cfg.quick_prompts.length > 0
              ? cfg.quick_prompts
              : DEFAULT_SUGGESTIONS;

            const newCfg: AssistantConfig = {
              name: cfg.name || 'Sloor Assistant',
              roleTitle: cfg.role_title || 'AI Shopping Stylist',
              themeColor: cfg.theme_color || '#ea580c',
              headerBg: cfg.header_bg || '#020617',
              launcherText: cfg.launcher_text || 'Need advice? Ask Sloor AI',
              welcomeMessage: cfg.welcome_message || "Hello! 👋 I'm **Sloor Assistant**, your personal AI stylist and shopping advisor.\n\nTell me what you're looking for—like sneaker styles, budget, sizing, or questions about delivery & returns!",
              quickPrompts: loadedPrompts,
              isEnabled: cfg.is_enabled ?? true,
            };

            setAssistantConfig(newCfg);

            // Set dynamic welcome message from backend
            setMessages([
              {
                id: 'welcome-1',
                role: 'assistant',
                content: newCfg.welcomeMessage,
                suggestions: newCfg.quickPrompts,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        }
      } catch (e) {
        console.warn('Could not load backend AI config, using defaults:', e);
        if (messages.length === 0) {
          setMessages([
            {
              id: 'welcome-1',
              role: 'assistant',
              content: "Hello! 👋 I'm **Sloor Assistant**, your personal AI stylist and shopping advisor.\n\nTell me what you're looking for—like sneaker styles, budget, sizing, or questions about delivery & returns!",
              suggestions: DEFAULT_SUGGESTIONS,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
    };

    fetchConfig();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const apiPayload = newHistory.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const cleanApi = getApiBase();
      const res = await fetch(`${cleanApi}ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiPayload }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = json?.data || json;

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Here is what I found for you:",
        products: Array.isArray(data.products) ? data.products : [],
        suggestions: Array.isArray(data.suggestions) && data.suggestions.length > 0 ? data.suggestions : assistantConfig.quickPrompts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Assistant request error:', err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: "I'm having a brief connection issue, but you can browse our full catalog anytime or check our top-rated collections below!",
        suggestions: ['🔥 Best-selling sneakers', '🚚 Delivery Policy'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: assistantConfig.welcomeMessage || "Chat refreshed! 👋 How can I help you discover the perfect footwear or apparel today?",
        suggestions: assistantConfig.quickPrompts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to format markdown-like text (bold, bullet points)
  const renderFormattedText = (txt: string) => {
    const parts = txt.split('\n');
    return parts.map((line, idx) => {
      // Bold text formatting **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          elements.push(line.substring(lastIndex, match.index));
        }
        elements.push(
          <strong key={`b-${match.index}`} className="font-bold text-slate-950">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        elements.push(line.substring(lastIndex));
      }

      return (
        <span key={idx} className="block leading-relaxed">
          {elements.length > 0 ? elements : line}
        </span>
      );
    });
  };

  // If both assistant is disabled and no systemConfig, hide
  if (!assistantConfig.isEnabled && !systemConfig) {
    return null;
  }

  const { themeColor, headerBg, launcherText, name, roleTitle } = assistantConfig;

  // WhatsApp connection info
  const rawPhone = systemConfig?.whatsapp_number || systemConfig?.phones?.[0] || '+8801895238135';
  const digits = rawPhone.replace(/\D/g, '');
  const waNumber = digits.startsWith('880') ? digits : (digits.startsWith('0') ? `88${digits}` : digits);
  const waUrl = `https://wa.me/${waNumber}`;

  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/product');

  return (
    <>
      {/* Floating Action Buttons */}
      <div className={`fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-none transition-all duration-300 ${isProductPage ? 'bottom-20 sm:bottom-20' : 'bottom-20 sm:bottom-6'}`}>
        {/* Floating WhatsApp Action Button (Above AI Assistant) */}
        {!isOpen && (
          <a
            id="sloor-whatsapp-float"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="pointer-events-auto relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
            title="Chat on WhatsApp"
          >
            {/* Animated online badge */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
            </span>

            {/* Hover Tooltip on desktop */}
            <span className="hidden sm:group-hover:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl items-center gap-1.5 pointer-events-none transition-all duration-200 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Chat on WhatsApp</span>
            </span>

            {/* WhatsApp SVG Icon */}
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 fill-white group-hover:scale-105 transition-transform duration-200"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.652c1.746.953 3.71 1.455 5.711 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.49-8.414Z" />
            </svg>
          </a>
        )}

        {/* Toggle Button for AI Assistant */}
        {assistantConfig.isEnabled && (
          <button
            id="sloor-ai-launcher"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              borderColor: isOpen ? '#334155' : `${themeColor}80`,
              boxShadow: isOpen ? '0 10px 25px rgba(0,0,0,0.3)' : `0 10px 25px -5px ${themeColor}40`,
            }}
            className={`pointer-events-auto flex items-center justify-center gap-2.5 rounded-full p-3.5 sm:px-5 sm:py-3.5 transition-all duration-300 cursor-pointer border active:scale-95 ${
              isOpen
                ? 'bg-slate-950 text-white hover:bg-black'
                : 'bg-slate-950 hover:bg-black text-white'
            }`}
            aria-label={isOpen ? `Close ${name}` : `Open ${name}`}
          >
            {isOpen ? (
              <ChevronDown className="w-6 h-6 text-slate-200 transition-transform duration-300" />
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <Sparkles className="w-5 h-5 animate-pulse" style={{ color: themeColor }} />
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 animate-ping"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
                <span className="hidden sm:inline font-bold text-xs tracking-wide uppercase">
                  {name}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Modern AI Chat Window */}
      {assistantConfig.isEnabled && isOpen && (
        <div className="fixed inset-x-3 bottom-[84px] sm:inset-auto sm:right-6 sm:bottom-24 z-50 sm:w-[420px] h-[82vh] max-h-[640px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div
            style={{ background: headerBg }}
            className="text-white p-4 flex items-center justify-between border-b border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                style={{ background: themeColor }}
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-colors"
              >
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">{name}</h3>
                  <span
                    style={{
                      backgroundColor: `${themeColor}25`,
                      color: themeColor,
                      borderColor: `${themeColor}40`,
                    }}
                    className="border text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md"
                  >
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">{roleTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((m) => {
              const isBot = m.role === 'assistant';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div className={`flex gap-2 max-w-[88%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    {isBot && (
                      <div
                        style={{
                          backgroundColor: `${themeColor}15`,
                          color: themeColor,
                          borderColor: `${themeColor}30`,
                        }}
                        className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      style={
                        isBot
                          ? {}
                          : { backgroundColor: themeColor, boxShadow: `0 4px 14px ${themeColor}30` }
                      }
                      className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
                          : 'text-white rounded-tr-sm font-medium'
                      }`}
                    >
                      {renderFormattedText(m.content)}

                      {/* Interactive Product Cards in Chat */}
                      {isBot && m.products && m.products.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Flame className="w-3 h-3" style={{ color: themeColor }} /> Recommended Footwear
                          </p>
                          {m.products.map((prod) => {
                            const prodImage = prod.image ? resolveImageUrl(prod.image) : '';
                            const prodUrl = getProductUrl(prod);
                            const isDiscounted = Boolean(prod.regular_price && prod.regular_price > prod.price);

                            return (
                              <div
                                key={prod.id}
                                className="bg-slate-50/90 hover:bg-white rounded-xl p-2 border border-slate-200 flex items-center gap-2.5 transition-all duration-200 hover:shadow-sm group"
                              >
                                {/* Thumbnail */}
                                <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  {prodImage ? (
                                    <img
                                      src={prodImage}
                                      alt={prod.name}
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        if (!target.dataset.triedLive && prod.image) {
                                          target.dataset.triedLive = 'true';
                                          const clean = prod.image.startsWith('/') ? prod.image : `/${prod.image}`;
                                          target.src = `https://admin.sloor.bd${clean}`;
                                        }
                                      }}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={prodUrl}
                                    onClick={() => setIsOpen(false)}
                                    className="font-bold text-xs text-slate-900 truncate block transition-colors hover:underline"
                                    style={{ color: '#0f172a' }}
                                  >
                                    {prod.name}
                                  </Link>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-extrabold text-xs text-slate-900">
                                      BDT {prod.price.toLocaleString()}
                                    </span>
                                    {isDiscounted && prod.regular_price && (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        BDT {prod.regular_price.toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 mt-1.5">
                                    <Link
                                      href={prodUrl}
                                      onClick={() => setIsOpen(false)}
                                      className="text-[10px] font-bold text-slate-600 hover:opacity-80 flex items-center gap-0.5"
                                    >
                                      View <ArrowRight className="w-2.5 h-2.5" />
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        handleQuickAddToCart({
                                          id: prod.id,
                                          name: prod.name,
                                          price: prod.price,
                                          image: prod.image || '',
                                          stock_status: prod.stock_status,
                                        }, e);
                                        showToast(`Added ${prod.name} to bag!`, 'success');
                                      }}
                                      style={{ backgroundColor: '#0f172a' }}
                                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = themeColor)}
                                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
                                      className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <ShoppingBag className="w-2.5 h-2.5" /> +Bag
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {isBot && m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-8 max-w-[85%]">
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          style={{
                            borderColor: '#e2e8f0',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = `${themeColor}60`;
                            e.currentTarget.style.color = themeColor;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#334155';
                          }}
                          className="bg-white text-slate-700 text-[10.5px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 border"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 mt-1 mx-8 font-medium">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Thinking / Typing state */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div
                  style={{
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                    borderColor: `${themeColor}30`,
                  }}
                  className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: themeColor }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: themeColor }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: themeColor }} />
                  <span className="text-[11px] text-slate-400 font-medium ml-1.5">
                    Consulting {name}...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 transition-all shadow-inner focus-within:ring-2 focus-within:ring-orange-500/20"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about shoes, sizes, delivery, returns..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1.5 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={
                  input.trim() && !isLoading
                    ? { backgroundColor: themeColor }
                    : { backgroundColor: '#e2e8f0', color: '#94a3b8' }
                }
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-white shadow-xs"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1 font-medium">
              <span>{name} • Live ERP Knowledge Synced</span>
              <span>100% Free &amp; Instant</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}