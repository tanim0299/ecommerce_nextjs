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

  // 1. Dispatch to Meta Pixel (fbq) with optional eventID for deduplication
  try {
    if ((window as any).fbq) {
      if (options?.eventID) {
        (window as any).fbq('track', eventName, params, { eventID: String(options.eventID) });
      } else {
        (window as any).fbq('track', eventName, params);
      }
    }
  } catch (e) {
    console.debug('Meta Pixel event dispatch error:', e);
  }

  // 2. Dispatch to Google Tag Manager (dataLayer) conforming strictly to GA4 standards
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];

    // GA4 Requirement: Clear previous ecommerce object before pushing new ecommerce data
    if (params && params.ecommerce) {
      (window as any).dataLayer.push({ ecommerce: null });
    }

    const ga4EventName = GA4_EVENT_MAP[eventName] || eventName.toLowerCase();

    // Push GA4 Official Standard Event (e.g. 'view_item', 'add_to_cart', 'begin_checkout', 'purchase')
    (window as any).dataLayer.push({
      event: ga4EventName,
      event_id: options?.eventID ? String(options.eventID) : undefined,
      ...params,
    });

    // Also push the PascalCase event name (e.g. 'Purchase', 'AddToCart') if different,
    // ensuring both standard GA4 event tags and custom Meta/GTM triggers work flawlessly
    if (ga4EventName !== eventName) {
      (window as any).dataLayer.push({
        event: eventName,
        event_id: options?.eventID ? String(options.eventID) : undefined,
        ...params,
      });
    }
  } catch (e) {
    console.debug('DataLayer event push error:', e);
  }
};
