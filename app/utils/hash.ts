'use client';

/**
 * Normalizes and hashes a string using SHA-256 (standard for Meta Conversions API & GTM).
 * Ensures lowercase and trimmed text per Meta specifications.
 */
export async function hashSha256(value?: string | null): Promise<string | undefined> {
  if (!value || typeof value !== 'string') return undefined;
  const clean = value.trim().toLowerCase();
  if (!clean) return undefined;

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(clean);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.debug('SHA-256 hashing error:', err);
  }
  return undefined;
}

/**
 * Standardizes phone numbers according to Meta's formatting guidelines before hashing:
 * - Removes spaces, dashes, symbols, and leading zeroes.
 * - Ensures country code (defaults to Bangladesh '880' if not present).
 */
export function formatPhoneForMeta(phone?: string | null): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;

  if (digits.startsWith('880')) {
    return digits;
  }
  if (digits.startsWith('01')) {
    return `88${digits}`;
  }
  if (digits.startsWith('1') && digits.length === 10) {
    return `880${digits}`;
  }
  return digits;
}

/**
 * Reads a tracking cookie value (like _fbp or _fbc) from document.cookie
 */
export function getTrackingCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : undefined;
  } catch {
    return undefined;
  }
}

export interface CustomerTrackingDataInput {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  externalId?: string | null;
}

/**
 * Generates both hashed and unhashed customer data for Meta Conversions API & GTM DataLayer
 */
export async function prepareCustomerTrackingData(input: CustomerTrackingDataInput) {
  const fbp = getTrackingCookie('_fbp');
  const fbc = getTrackingCookie('_fbc');

  const metaPhone = formatPhoneForMeta(input.phone);
  const countryCode = (input.countryCode || 'bd').toLowerCase();

  const [
    hashedEmail,
    hashedPhone,
    hashedFirstName,
    hashedLastName,
    hashedCity,
    hashedState,
    hashedPostalCode,
    hashedCountry,
    hashedExternalId
  ] = await Promise.all([
    hashSha256(input.email),
    hashSha256(metaPhone),
    hashSha256(input.firstName),
    hashSha256(input.lastName),
    hashSha256(input.city),
    hashSha256(input.state),
    hashSha256(input.postalCode),
    hashSha256(countryCode),
    hashSha256(input.externalId)
  ]);

  return {
    // Top-level direct hashed variables (commonly referenced in GTM)
    hashed_email: hashedEmail || '',
    hashed_phone: hashedPhone || '',
    hashed_first_name: hashedFirstName || '',
    hashed_last_name: hashedLastName || '',
    hashed_city: hashedCity || '',
    hashed_region: hashedState || '',
    hashed_state: hashedState || '',
    hashed_postal_code: hashedPostalCode || '',
    hashed_zip: hashedPostalCode || '',
    hashed_country: hashedCountry || '',
    hashed_external_id: hashedExternalId || '',

    // Standard Meta & Ad Cookies
    fbp: fbp || undefined,
    fbc: fbc || undefined,
    external_id: input.externalId || undefined,

    // Meta Conversions API (CAPI) standard user_data payload
    meta_user_data: {
      em: hashedEmail,
      ph: hashedPhone,
      fn: hashedFirstName,
      ln: hashedLastName,
      ct: hashedCity,
      st: hashedState,
      zp: hashedPostalCode,
      country: hashedCountry,
      external_id: input.externalId || hashedExternalId,
      fbp: fbp || undefined,
      fbc: fbc || undefined
    }
  };
}
