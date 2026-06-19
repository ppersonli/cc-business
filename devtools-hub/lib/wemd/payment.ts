/**
 * WeMD Pro payment configuration and Waffo Pancake client wrapper.
 * Handles checkout session creation and subscription verification.
 */

import { WaffoPancake, verifyWebhook, WebhookEventType } from '@waffo/pancake-ts';

// WeMD Pro product IDs (create these in Waffo Pancake Dashboard)
export const WEMD_PRODUCT_IDS = {
  'wemd-pro-monthly': process.env.WEMD_PRO_MONTHLY_ID || 'wemd-pro-monthly',
  'wemd-pro-yearly': process.env.WEMD_PRO_YEARLY_ID || 'wemd-pro-yearly',
} as const;

export type WeMDPlan = keyof typeof WEMD_PRODUCT_IDS;

export const WEMD_PRICING = {
  'wemd-pro-monthly': { price: '$4.99', period: '/month', name: 'WeMD Pro Monthly' },
  'wemd-pro-yearly': { price: '$49.00', period: '/year', name: 'WeMD Pro Yearly', savings: 'Save 18%' },
} as const;

// Pro features list
export const PRO_FEATURES = [
  'AI Writing Assistant (Polish, Expand, Shorten, Translate)',
  'Dark Mode Preview',
  'Custom CSS Editor',
  'Visual Theme Designer',
  'Download as HTML',
  'Link-to-Footnote Conversion',
  '13+ Premium Themes',
  'Priority Support',
] as const;

export const FREE_FEATURES = [
  'Markdown Editor with Live Preview',
  'One-Click Copy to WeChat',
  'Basic Themes',
  'Search & Replace',
  'Keyboard Shortcuts',
] as const;

// Lazy-init singleton client
let _client: WaffoPancake | null = null;

export function getPancakeClient(): WaffoPancake | null {
  if (_client) return _client;

  const merchantId = process.env.WAFFO_MERCHANT_ID;
  const privateKey = process.env.WAFFO_PRIVATE_KEY;

  if (!merchantId || !privateKey) {
    console.warn('[WeMD Payment] WAFFO_MERCHANT_ID or WAFFO_PRIVATE_KEY not set');
    return null;
  }

  try {
    _client = new WaffoPancake({ merchantId, privateKey });
    return _client;
  } catch (err) {
    console.error('[WeMD Payment] Failed to init WaffoPancake client:', err);
    return null;
  }
}

/**
 * Create a WeMD Pro checkout session.
 * Returns the checkout URL to redirect the user.
 */
export async function createWeMDCheckout(options: {
  plan: WeMDPlan;
  email?: string;
  successUrl?: string;
}): Promise<{ checkoutUrl: string; sessionId: string } | null> {
  const client = getPancakeClient();
  if (!client) return null;

  const productId = WEMD_PRODUCT_IDS[options.plan];
  if (!productId) return null;

  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tools.ovanime.com';

  try {
    const session = await client.checkout.createSession({
      productId,
      currency: 'USD',
      buyerEmail: options.email,
      successUrl: options.successUrl || `${FRONTEND_URL}/tools/wechat-markdown-editor?upgraded=true`,
      darkMode: true,
      metadata: {
        product: 'wemd-pro',
        plan: options.plan,
        source: 'wemd-editor',
      },
    });

    return {
      checkoutUrl: session.checkoutUrl,
      sessionId: session.sessionId,
    };
  } catch (err) {
    console.error('[WeMD Payment] Checkout error:', err);
    return null;
  }
}

/**
 * Verify a Waffo webhook signature using the SDK's built-in RSA-SHA256 verification.
 */
export function verifyWaffoWebhook(body: string, signature: string | null) {
  return verifyWebhook(body, signature);
}

export { WebhookEventType };
