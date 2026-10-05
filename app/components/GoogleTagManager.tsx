'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context';

export default function GoogleTagManager() {
  const { systemConfig } = useApp();

  useEffect(() => {
    if (!systemConfig) return;

    const marketing = systemConfig.marketing;
    const isGtmEnabled = marketing ? marketing.gtm_enabled !== false : true;
    const gtmId = isGtmEnabled ? (marketing?.gtm_id || systemConfig.gtm_id) : null;

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

    // 3. Inject Custom Head Scripts if provided
    if (marketing?.custom_head_scripts && typeof window !== 'undefined') {
      const existingHeadCustom = document.getElementById('custom-head-scripts');
      if (!existingHeadCustom) {
        const div = document.createElement('div');
        div.id = 'custom-head-scripts';
        div.innerHTML = marketing.custom_head_scripts;
        document.head.appendChild(div);
      }
    }

    // 4. Inject Custom Body Scripts if provided
    if (marketing?.custom_body_scripts && typeof window !== 'undefined' && document.body) {
      const existingBodyCustom = document.getElementById('custom-body-scripts');
      if (!existingBodyCustom) {
        const div = document.createElement('div');
        div.id = 'custom-body-scripts';
        div.innerHTML = marketing.custom_body_scripts;
        document.body.appendChild(div);
      }
    }
  }, [systemConfig]);

  return null;
}
