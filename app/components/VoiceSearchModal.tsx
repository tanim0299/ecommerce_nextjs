'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  X,
  Search,
  Sparkles,
  RotateCcw,
  Volume2,
  Check,
  AlertCircle,
  Globe,
} from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function VoiceSearchModal({
  isOpen,
  onClose,
  onSearch,
  initialQuery = '',
}: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState<'en-US' | 'bn-BD'>('en-US');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTextRef = useRef('');
  const isClosingRef = useRef(false);

  // Keep fullTextRef in sync
  useEffect(() => {
    fullTextRef.current = (transcript + (interimText ? ' ' + interimText : '')).trim();
  }, [transcript, interimText]);

  // Clean silence timer
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Trigger search with final text
  const completeAndSearch = useCallback(
    (textToSearch?: string) => {
      const query = (textToSearch !== undefined ? textToSearch : fullTextRef.current).trim();
      clearSilenceTimer();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      setIsListening(false);

      if (query) {
        setIsSearching(true);
        setTimeout(() => {
          onSearch(query);
          onClose();
        }, 400);
      }
    },
    [onSearch, onClose]
  );

  // Start speech recognition
  const startListening = useCallback(
    (targetLang = language) => {
      clearSilenceTimer();
      setError(null);
      setTranscript('');
      setInterimText('');
      setIsSearching(false);
      isClosingRef.current = false;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
        return;
      }

      setIsSupported(true);

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = targetLang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentFinal = '';
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += piece + ' ';
            } else {
              currentInterim += piece;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim()));
          }
          setInterimText(currentInterim.trim());

          const combined = (
            (transcript ? transcript + ' ' : '') +
            (currentFinal ? currentFinal + ' ' : '') +
            currentInterim
          ).trim();

          fullTextRef.current = combined;

          // Automatic stop on silence: reset timer to 1800ms
          clearSilenceTimer();
          if (combined.length > 0) {
            silenceTimerRef.current = setTimeout(() => {
              // User paused/stopped speaking for 1.8 seconds => auto submit!
              completeAndSearch(combined);
            }, 1800);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error event:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Microphone access was denied. Please allow microphone access in your browser address bar.');
            setIsListening(false);
          } else if (event.error === 'no-speech') {
            // Keep waiting unless we already have full transcript
            if (!fullTextRef.current) {
              // Still listening
            }
          } else if (event.error !== 'aborted') {
            setError(`Recognition issue (${event.error}). Please click restart or type your query.`);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // If we had recognized speech and modal is still open, auto-search
          if (!isClosingRef.current && fullTextRef.current.trim().length > 0) {
            completeAndSearch(fullTextRef.current);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        setError('Could not access microphone. Please check permissions and try again.');
        setIsListening(false);
      }
    },
    [language, completeAndSearch, transcript]
  );

  // Stop listening manually
  const stopListening = () => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  // Close and cleanup
  const handleClose = () => {
    isClosingRef.current = true;
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    onClose();
  };

  // Auto-start when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript(initialQuery || '');
      setInterimText('');
      setError(null);
      setIsSearching(false);
      // Small timeout to allow modal mount animation
      const timer = setTimeout(() => {
        startListening(language);
      }, 150);
      return () => {
        clearTimeout(timer);
        clearSilenceTimer();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }
      };
    } else {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen]);

  // Handle language switch
  const handleLanguageChange = (lang: 'en-US' | 'bn-BD') => {
    setLanguage(lang);
    if (isListening) {
      startListening(lang);
    }
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter' && fullTextRef.current.trim()) {
        completeAndSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, completeAndSearch]);

  if (!isOpen) return null;

  const currentPreview = (transcript + (interimText ? ' ' + interimText : '')).trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-150 overflow-hidden transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                Voice Search
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Speak naturally to search collections &amp; apparel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('en-US')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                  language === 'en-US'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('bn-BD')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                  language === 'bn-BD'
                    ? 'bg-brand-orange text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-6">
          {/* Animated Microphone Section */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing Ripple Rings when listening */}
            {isListening && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-orange-500/15 animate-ping" />
                <span className="absolute w-36 h-36 rounded-full bg-orange-500/10 animate-pulse" />
              </>
            )}

            {/* Mic Center Button */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                isSearching
                  ? 'bg-emerald-500 text-white scale-95 shadow-emerald-500/30'
                  : isListening
                  ? 'bg-gradient-to-tr from-brand-orange to-amber-500 text-white shadow-orange-500/40 scale-105'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title={isListening ? 'Click to pause' : 'Click to start listening'}
            >
              {isSearching ? (
                <Search className="w-8 h-8 animate-spin" />
              ) : isListening ? (
                <Mic className="w-9 h-9 animate-pulse" />
              ) : (
                <MicOff className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Sound Wave Equalizer Bars */}
          <div className="flex items-center justify-center gap-1.5 h-6">
            {[40, 75, 100, 60, 90, 50, 80, 45].map((height, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full bg-brand-orange transition-all duration-150 ${
                  isListening ? 'opacity-100 animate-pulse' : 'opacity-25 h-1.5'
                }`}
                style={{
                  height: isListening ? `${height}%` : '6px',
                  animationDelay: `${idx * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                isSearching
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isListening
                  ? 'bg-orange-50 text-brand-orange border border-orange-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSearching
                    ? 'bg-emerald-500'
                    : isListening
                    ? 'bg-brand-orange animate-ping'
                    : 'bg-slate-400'
                }`}
              />
              {isSearching
                ? 'Searching Now...'
                : isListening
                ? language === 'bn-BD'
                  ? 'রেকর্ড হচ্ছে... বলুন'
                  : 'Listening... Speak now'
                : 'Listening paused'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'bn-BD'
                ? 'কথা বলা শেষ হলে স্বয়ংক্রিয়ভাবে সার্চ হবে, অথবা নিচের বাটনে চাপ দিন'
                : 'Stops automatically when you finish speaking, or tap Stop & Search'}
            </span>
          </div>

          {/* Live Preview Card with Real-time Typing Effect */}
          <div className="w-full min-h-[96px] bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative shadow-inner">
            {currentPreview ? (
              <div className="flex items-center justify-center flex-wrap gap-1 text-slate-900 font-black text-base sm:text-xl tracking-tight leading-snug">
                <span>&ldquo;{currentPreview}&rdquo;</span>
                {isListening && (
                  <span className="inline-block w-2 h-5 bg-brand-orange rounded-xs animate-pulse ml-0.5" />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <Volume2 className="w-5 h-5 opacity-40 animate-pulse" />
                <p className="text-xs font-semibold">
                  {language === 'bn-BD'
                    ? 'প্রোডাক্টের নাম, সাইজ বা ক্যাটাগরি বলুন (যেমন: ব্ল্যাক পোলো, হুডি, টি-শার্ট)'
                    : 'Say a product name, style, or color (e.g. "Oversized T-shirt", "Black Polo")'}
                </p>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-left text-xs text-rose-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => startListening()}
                  className="mt-1.5 text-[11px] font-black uppercase text-rose-800 underline hover:text-rose-950 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Fallback Text Input if Speech Not Supported */}
          {!isSupported && (
            <div className="w-full flex gap-2">
              <input
                type="text"
                placeholder="Type your search here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && transcript.trim()) {
                    completeAndSearch(transcript);
                  }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-orange"
                autoFocus
              />
              <button
                type="button"
                onClick={() => completeAndSearch(transcript)}
                className="px-4 py-2 bg-brand-orange text-white rounded-xl text-xs font-black uppercase hover:bg-orange-600 cursor-pointer"
              >
                Search
              </button>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="w-full flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Retry / Reset Button */}
            <button
              type="button"
              onClick={() => startListening()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer bg-white"
              title="Restart recording"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn-BD' ? 'আবার বলুন' : 'Reset'}</span>
            </button>

            {/* Right Group: Cancel & Stop/Search */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'bn-BD' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={!currentPreview}
                onClick={() => completeAndSearch(currentPreview)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-brand-orange text-white text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'bn-BD'
                    ? 'স্টপ ও সার্চ করুন'
                    : 'Stop & Search'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
