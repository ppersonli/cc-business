export const FREE_DAILY_LIMIT = 5;

export const PLANS = {
  free: { name: 'Free', dailyLimit: FREE_DAILY_LIMIT, price: 0 },
  'pro-byok': { name: 'Pro BYOK', dailyLimit: Infinity, price: 499 }, // $4.99/month in cents
  pro: { name: 'Pro Hosted', dailyLimit: Infinity, price: 999 }, // $9.99/month in cents
  'pro-yearly': { name: 'Pro (Yearly)', dailyLimit: Infinity, price: 7999 }, // $79.99/year in cents
} as const;

export type PlanId = keyof typeof PLANS;

const API_BASE = 'https://tools.ovanime.com/api';

/**
 * Request a checkout session from the backend.
 * The backend creates the session with Waffo Pancake and returns the checkout URL.
 */
export async function createCheckoutSession(options: {
  email?: string;
  plan: 'pro' | 'pro-byok' | 'pro-yearly';
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  const res = await fetch(`${API_BASE}/checkout/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: options.plan,
      email: options.email,
      successUrl: options.successUrl || chrome.runtime.getURL('popup.html#upgraded'),
      cancelUrl: options.cancelUrl || chrome.runtime.getURL('popup.html#cancelled'),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create checkout session');
  }

  return res.json();
}

/**
 * Open checkout in a new tab (never redirect current page).
 */
export async function openCheckout(plan: 'pro' | 'pro-byok' | 'pro-yearly' = 'pro', email?: string): Promise<void> {
  const { checkoutUrl } = await createCheckoutSession({
    email,
    plan,
  });
  chrome.tabs.create({ url: checkoutUrl });
}
