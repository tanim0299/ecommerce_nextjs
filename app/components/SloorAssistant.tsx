'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const { resolveImageUrl, handleQuickAddToCart, showToast } = useApp();

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

  // If disabled by admin, cleanly hide launcher
  if (!assistantConfig.isEnabled) {
    return null;
  }

  const { themeColor, headerBg, launcherText, name, roleTitle } = assistantConfig;

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        {/* Toggle Button */}
        <button
          id="sloor-ai-launcher"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            borderColor: isOpen ? '#334155' : `${themeColor}80`,
            boxShadow: isOpen ? '0 10px 25px rgba(0,0,0,0.3)' : `0 10px 25px -5px ${themeColor}40`,
          }}
          className={`flex items-center justify-center gap-2.5 rounded-full p-3.5 sm:px-5 sm:py-3.5 transition-all duration-300 cursor-pointer border active:scale-95 ${
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
      </div>

      {/* Modern AI Chat Window */}
      {isOpen && (
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