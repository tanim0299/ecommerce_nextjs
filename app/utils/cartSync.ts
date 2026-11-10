// Keeps a server-side copy of the cart so abandoned-cart reminder emails can be sent.
// Everything here is best-effort and must never break shopping.

const TOKEN_KEY = 'cart_token';

const apiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const randomToken = () => {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export const getCartToken = (): string => {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = randomToken();
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return randomToken();
  }
};

export const setCartToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
};

// Called after an order is placed so the next cart starts a fresh reminder sequence.
export const resetCartToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

export interface CartSyncContact {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
}

export const syncCart = async (
  items: Array<{
    id: string;
    name: string;
    price: number;
    size: string;
    colorName: string;
    colorHex: string;
    quantity: number;
    image: string;
  }>,
  contact: CartSyncContact = {},
  authToken?: string | null
) => {
  try {
    const body: Record<string, unknown> = { cart_token: getCartToken(), items };
    if (contact.email && contact.email.includes('@')) body.email = contact.email.trim();
    if (contact.phone) body.phone = contact.phone.trim();
    if (contact.name) body.name = contact.name.trim();

    await fetch(`${apiBase()}/cart-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Reminder tracking is optional; ignore network errors.
  }
};
