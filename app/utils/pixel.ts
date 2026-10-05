'use client';

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

  // 2. Dispatch to Google Tag Manager (dataLayer)
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      event_id: options?.eventID ? String(options.eventID) : undefined,
      ...params,
    });
  } catch (e) {
    console.debug('DataLayer event push error:', e);
  }
};
