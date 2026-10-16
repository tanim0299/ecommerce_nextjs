'use client';

// Map Meta Pixel event names to official GA4 Standard Ecommerce Event names
const GA4_EVENT_MAP: Record<string, string> = {
  'ViewContent': 'view_item',
  'AddToCart': 'add_to_cart',
  'InitiateCheckout': 'begin_checkout',
  'Purchase': 'purchase',
  'RemoveFromCart': 'remove_from_cart',
  'AddToWishlist': 'add_to_wishlist',
  'Search': 'search',
};

export const trackMetaEvent = (
  eventName: string,
  params: Record<string, any> = {},
  options?: { eventID?: string }
) => {
  if (typeof window === 'undefined') return;

  const marketing = (window as any).__MARKETING_CONFIG__;
  // Controlled solely by the backend "Enable Meta Pixel" checkbox
  const isFbEnabled = marketing ? marketing.fb_pixel_enabled === true : Boolean((window as any).fbq);
  // Controlled solely by the backend "Enable GTM" checkbox
  const isGtmEnabled = marketing ? marketing.gtm_enabled === true : true;

  // 1. Dispatch to Meta Pixel (fbq) ONLY if Meta Pixel is enabled in backend
  if (isFbEnabled && (window as any).fbq) {
    try {
      let isEventAllowed = true;
      if (marketing) {
        if (eventName === 'PageView' && marketing.fb_track_page_view === false) isEventAllowed = false;
        if (eventName === 'ViewContent' && marketing.fb_track_view_content === false) isEventAllowed = false;
        if (eventName === 'AddToCart' && marketing.fb_track_add_to_cart === false) isEventAllowed = false;
        if (eventName === 'InitiateCheckout' && marketing.fb_track_initiate_checkout === false) isEventAllowed = false;
        if (eventName === 'Purchase' && marketing.fb_track_purchase === false) isEventAllowed = false;
      }

      if (isEventAllowed) {
        if (options?.eventID) {
          (window as any).fbq('track', eventName, params, { eventID: String(options.eventID) });
        } else {
          (window as any).fbq('track', eventName, params);
        }
      }
    } catch (e) {
      console.debug('Meta Pixel event dispatch error:', e);
    }
  }

  // 2. Dispatch to Google Tag Manager (dataLayer) ONLY if GTM is enabled in backend
  if (isGtmEnabled) {
    try {
      (window as any).dataLayer = (window as any).dataLayer || [];

      // GA4 Requirement: Clear previous ecommerce object before pushing new ecommerce data
      if (params && params.ecommerce) {
        (window as any).dataLayer.push({ ecommerce: null });
      }

      const ga4EventName = GA4_EVENT_MAP[eventName] || eventName.toLowerCase();

      // Push ONLY single official GA4 Standard Event (e.g. 'view_item', 'add_to_cart', 'begin_checkout', 'purchase')
      // No duplicate events pushed to dataLayer!
      (window as any).dataLayer.push({
        event: ga4EventName,
        event_id: options?.eventID ? String(options.eventID) : undefined,
        ...params,
      });
    } catch (e) {
      console.debug('DataLayer event push error:', e);
    }
  }
};
