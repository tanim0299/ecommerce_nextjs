'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '../context';

export default function MetaPixel() {
  const { systemConfig } = useApp();
  const pathname = usePathname();
  const isInitializedRef = useRef(false);

  const marketing = systemConfig?.marketing;
  const isPixelEnabled = marketing ? marketing.fb_pixel_enabled !== false : true;
  const pixelId = isPixelEnabled ? (marketing?.fb_pixel_id || systemConfig?.fb_pixel_id) : null;

  // 1. Initialize Base Meta Pixel Code
  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return;

    const cleanPixelId = pixelId.trim();
    if (!cleanPixelId) return;

    if (!document.getElementById('meta-pixel-script')) {
      // Official Meta Pixel snippet
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.id = 'meta-pixel-script';
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s);
        } else {
          document.head.appendChild(t);
        }
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      (window as any).fbq('init', cleanPixelId);
      isInitializedRef.current = true;

      // Track Initial PageView
      if (marketing?.fb_track_page_view !== false) {
        (window as any).fbq('track', 'PageView');
      }

      // Append noscript fallback img to body
      if (!document.getElementById('meta-pixel-noscript') && document.body) {
        const noscript = document.createElement('noscript');
        noscript.id = 'meta-pixel-noscript';
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${encodeURIComponent(cleanPixelId)}&ev=PageView&noscript=1" />`;
        document.body.appendChild(noscript);
      }
    }
  }, [pixelId, marketing]);

  // 2. Track PageView on route / pathname change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq && isInitializedRef.current) {
      if (marketing?.fb_track_page_view !== false) {
        (window as any).fbq('track', 'PageView');
      }
    }
  }, [pathname, marketing]);

  return null;
}
