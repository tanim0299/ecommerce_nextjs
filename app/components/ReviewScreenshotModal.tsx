'use client';

import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Star, ZoomIn } from 'lucide-react';
import { useApp } from '../context';

interface ReviewScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  reviewerName?: string;
  rating?: number;
  reviewDate?: string | null;
  reviewText?: string;
}

export default function ReviewScreenshotModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onChangeIndex,
  reviewerName,
  rating,
  reviewDate,
  reviewText,
}: ReviewScreenshotModalProps) {
  const { resolveImageUrl } = useApp();

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    onChangeIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onChangeIndex]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    onChangeIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onChangeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between gap-4 py-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-white min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base truncate">
                {reviewerName || 'Customer Review'}
              </span>
              {rating && (
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-white/90">{rating}.0</span>
                </div>
              )}
            </div>
            <div className="text-[11px] text-white/60 flex items-center gap-2">
              <span>Customer Proof Photo</span>
              {images.length > 1 && (
                <span>• {currentIndex + 1} of {images.length}</span>
              )}
              {reviewDate && <span>• {reviewDate}</span>}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image with Nav Buttons */}
      <div
        className="relative flex-1 w-full max-w-5xl flex items-center justify-center min-h-0 my-auto py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-1 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative max-h-[70vh] sm:max-h-[75vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black/40">
          <img
            src={resolveImageUrl(currentImage)}
            alt="Customer proof screenshot"
            className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain select-none"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-1 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption & Thumbnails */}
      <div
        className="w-full max-w-3xl flex flex-col items-center gap-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {reviewText && (
          <div className="w-full text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-xs sm:text-sm line-clamp-2">
            &ldquo;{reviewText}&rdquo;
          </div>
        )}

        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full p-1 pb-0.5">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeIndex(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  idx === currentIndex
                    ? 'border-[#c07828] scale-105 shadow-md'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={resolveImageUrl(img)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
