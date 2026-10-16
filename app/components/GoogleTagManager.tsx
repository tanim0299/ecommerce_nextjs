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

    // 3. Inject Custom Head Scripts if provided (prevent injecting redundant GTM scripts if GTM is disabled)
    if (marketing?.custom_head_scripts && typeof window !== 'undefined') {
      const existingHeadCustom = document.getElementById('custom-head-scripts');
      if (!existingHeadCustom) {
        let customHead = marketing.custom_head_scripts;
        if (!isGtmEnabled && customHead.includes('googletagmanager.com/gtm.js')) {
          customHead = customHead.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*googletagmanager\.com\/gtm\.js[^<]*<\/script>/gi, '');
        }
        if (customHead.trim()) {
          const div = document.createElement('div');
          div.id = 'custom-head-scripts';
          div.innerHTML = customHead;
          document.head.appendChild(div);
        }
      }
    }

    // 4. Inject Custom Body Scripts if provided
    if (marketing?.custom_body_scripts && typeof window !== 'undefined' && document.body) {
      const existingBodyCustom = document.getElementById('custom-body-scripts');
      if (!existingBodyCustom) {
        let customBody = marketing.custom_body_scripts;
        if (!isGtmEnabled && customBody.includes('googletagmanager.com/ns.html')) {
          customBody = customBody.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*googletagmanager\.com\/ns\.html[^<]*<\/noscript>/gi, '');
        }
        if (customBody.trim()) {
          const div = document.createElement('div');
          div.id = 'custom-body-scripts';
          div.innerHTML = customBody;
          document.head.appendChild(div);
        }
      }
    }
  }, [systemConfig]);

  return null;
}
