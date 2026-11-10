'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context';

export default function GoogleTagManager() {
  const { systemConfig } = useApp();

  useEffect(() => {
    if (!systemConfig) return;

    const marketing = systemConfig.marketing;
    const isGtmEnabled = marketing ? marketing.gtm_enabled === true : false;
    const gtmId = isGtmEnabled ? (marketing?.gtm_id || systemConfig.gtm_id) : null;

    // If GTM is disabled, remove any existing injected GTM script/noscript from DOM
    if (!isGtmEnabled || !gtmId) {
      const existingScript = document.getElementById('gtm-script');
      if (existingScript) existingScript.remove();

      const existingNoscript = document.getElementById('gtm-noscript');
      if (existingNoscript) existingNoscript.remove();

      return;
    }

    // 1. Inject Google Tag Manager Head Script
    if (gtmId && typeof window !== 'undefined') {
      const cleanGtmId = gtmId.trim();
      const existingScript = document.getElementById('gtm-script');

      if (!existingScript && cleanGtmId) {
        // Initialize dataLayer
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js',
        });

        const script = document.createElement('script');
        script.id = 'gtm-script';
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(cleanGtmId);

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          document.head.appendChild(script);
        }
      }

      // 2. Inject Google Tag Manager Noscript (in body)
      const existingNoscript = document.getElementById('gtm-noscript');
      if (!existingNoscript && cleanGtmId && document.body) {
        const noscript = document.createElement('noscript');
        noscript.id = 'gtm-noscript';
        noscript.innerHTML = '<iframe src="https://www.googletagmanager.com/ns.html?id=' + encodeURIComponent(cleanGtmId) + '" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    // 3 & 4. Inject custom head/body code. Scripts are re-created so they actually execute
    // (scripts added via innerHTML never run), and each node goes directly into <head> / <body>.
    const stripGtm = (html: string, pattern: RegExp, needle: string) =>
      !isGtmEnabled && html.includes(needle) ? html.replace(pattern, '') : html;

    const injectCustomHtml = (html: string, target: HTMLElement, marker: string) => {
      if (document.querySelector(`[data-custom-injected="${marker}"]`)) return;
      const template = document.createElement('template');
      template.innerHTML = html;
      Array.from(template.content.childNodes).forEach((node) => {
        let el: Node = node;
        if (node.nodeName === 'SCRIPT') {
          const old = node as HTMLScriptElement;
          const script = document.createElement('script');
          Array.from(old.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
          script.text = old.text;
          el = script;
        } else if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
          return;
        }
        if (el instanceof Element) el.setAttribute('data-custom-injected', marker);
        else return; // ignore stray text / comments
        target.appendChild(el);
      });
      // marker guard so an empty/whitespace-only payload is not re-processed
      if (!document.querySelector(`[data-custom-injected="${marker}"]`)) {
        const guard = document.createElement('meta');
        guard.setAttribute('data-custom-injected', marker);
        guard.setAttribute('name', `custom-${marker}-guard`);
        document.head.appendChild(guard);
      }
    };

    if (marketing?.custom_head_scripts) {
      const customHead = stripGtm(
        marketing.custom_head_scripts,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*googletagmanager\.com\/gtm\.js[^<]*<\/script>/gi,
        'googletagmanager.com/gtm.js'
      );
      if (customHead.trim()) injectCustomHtml(customHead, document.head, 'head');
    }

    if (marketing?.custom_body_scripts && document.body) {
      const customBody = stripGtm(
        marketing.custom_body_scripts,
        /<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*googletagmanager\.com\/ns\.html[^<]*<\/noscript>/gi,
        'googletagmanager.com/ns.html'
      );
      if (customBody.trim()) injectCustomHtml(customBody, document.body, 'body');
    }
  }, [systemConfig]);

  return null;
}
