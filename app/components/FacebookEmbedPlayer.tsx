'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FacebookEmbedPlayerProps {
  url: string;
  className?: string;
  autoplay?: boolean;
}

declare global {
  interface Window {
    FB?: {
      init: (options: any) => void;
      XFBML: {
        parse: (element?: HTMLElement | null) => void;
      };
      Event: {
        subscribe: (eventName: string, callback: (msg: any) => void) => void;
        unsubscribe?: (eventName: string, callback: (msg: any) => void) => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

export default function FacebookEmbedPlayer({
  url,
  className = 'w-full h-full',
  autoplay = true,
}: FacebookEmbedPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // Clean URL if wrapped in iframe or full embed markup
  let cleanUrl = url.trim();
  const iframeSrcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    cleanUrl = iframeSrcMatch[1];
  }

  // If already a plugins/video.php URL, extract original href parameter if present
  let embedHref = cleanUrl;
  try {
    if (cleanUrl.includes('facebook.com/plugins/video.php')) {
      const parsed = new URL(cleanUrl);
      const originalHref = parsed.searchParams.get('href');
      if (originalHref) {
        embedHref = decodeURIComponent(originalHref);
      }
    }
  } catch {
    // Ignore URL parse errors
  }

  useEffect(() => {
    let isMounted = true;

    const loadFacebookSdk = () => {
      if (window.FB) {
        if (isMounted) setSdkReady(true);
        try {
          if (containerRef.current) {
            window.FB.XFBML.parse(containerRef.current);
          }
        } catch (e) {
          console.warn('FB.XFBML.parse error:', e);
        }
        return;
      }

      window.fbAsyncInit = function () {
        if (!window.FB) return;
        window.FB.init({
          xfbml: true,
          version: 'v21.0',
        });
        if (isMounted) {
          setSdkReady(true);
          if (containerRef.current) {
            window.FB.XFBML.parse(containerRef.current);
          }
        }
      };

      const scriptId = 'facebook-jssdk';
      if (!document.getElementById(scriptId)) {
        const js = document.createElement('script');
        js.id = scriptId;
        js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0';
        js.async = true;
        js.defer = true;
        js.crossOrigin = 'anonymous';
        js.onload = () => {
          if (isMounted && window.FB) {
            setSdkReady(true);
            if (containerRef.current) {
              window.FB.XFBML.parse(containerRef.current);
            }
          }
        };
        js.onerror = () => {
          if (isMounted) setUseIframeFallback(true);
        };
        document.body.appendChild(js);
      }
    };

    loadFacebookSdk();

    // Fallback timer if SDK takes too long (e.g. ad blocker)
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !sdkReady) {
        setUseIframeFallback(true);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [embedHref]);

  // Subscribe to xfbml.ready to trigger programmatic autoplay
  useEffect(() => {
    if (!window.FB || !autoplay) return;

    const handleXfbmlReady = (msg: any) => {
      if (msg && msg.type === 'video' && msg.instance) {
        try {
          // Play video instance
          msg.instance.play();
        } catch (err) {
          console.warn('Facebook instance.play failed:', err);
        }
      }
    };

    try {
      window.FB.Event.subscribe('xfbml.ready', handleXfbmlReady);
    } catch {
      // Ignore
    }
  }, [autoplay]);

  const iframeSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    embedHref
  )}&show_text=false&autoplay=1&mute=1&muted=1`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden ${className}`}
    >
      {!useIframeFallback ? (
        <div
          key={embedHref}
          className="fb-video w-full h-full flex items-center justify-center"
          data-href={embedHref}
          data-autoplay={autoplay ? 'true' : 'false'}
          data-allowfullscreen="true"
          data-show-text="false"
          data-controls="true"
          data-lazy="false"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <iframe
          src={iframeSrc}
          className="w-full h-full border-0 absolute inset-0"
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
}
