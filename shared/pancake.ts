/**
 * Shared Pancake SDK wrapper for Waffo Pancake integration.
 * Used by both devtools-hub backend and chrome-extension.
 */

import { WaffoPancake } from '@waffo/pancake-ts';

const merchantId = process.env.WAFFO_MERCHANT_ID || '';
const privateKey = process.env.WAFFO_PRIVATE_KEY || '';

export const pancake = new WaffoPancake({ merchantId, privateKey });

/**
 * Pancake checkout session creation helper.
 * Creates a hosted checkout session and returns the URL.
 */
export async function createCheckoutSession(options: {
  productId: string;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<{ url: string; id: string }> {
  const session = await pancake.checkout.sessions.create({
    product_id: options.productId,
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    customer_email: options.customerEmail,
    metadata: options.metadata,
  });

  return { url: (session as any).url, id: (session as any).id };
}

/**
 * Verify a Pancake webhook signature.
 */
export async function verifyWebhookSignature(
  secret: string,
  payload: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return signature === expected;
}

/**
 * Plan product IDs mapping.
 */
export const PLAN_PRODUCT_IDS: Record<string, string> = {
  pro: 'ai-web-clipper-pro-monthly',
  'pro-byok': 'ai-web-clipper-pro-byok-monthly',
  'pro-yearly': 'ai-web-clipper-pro-yearly',
};
