/**
 * Payment integration scaffolding for Vertical Scheduler.
 * Uses Pancake (Waffo) payment gateway, same as devtools-hub.
 */

const WAFFO_MERCHANT_ID = process.env.WAFFO_MERCHANT_ID || '';
const WAFFO_STORE_ID = process.env.WAFFO_STORE_ID || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
}

export interface PaymentWebhookPayload {
  order_id: string;
  status: 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  timestamp: string;
}

/**
 * Create a Pancake checkout session for a booking.
 */
export async function createCheckoutSession(params: {
  bookingId: string;
  amountCents: number;
  currency: string;
  description: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<CheckoutSession> {
  const successUrl = params.successUrl || `${BASE_URL}/book/success?booking=${params.bookingId}`;
  const cancelUrl = params.cancelUrl || `${BASE_URL}/book/cancel?booking=${params.bookingId}`;

  // Pancake/Waffo API integration
  // In production, this would call the actual Waffo API:
  // const response = await fetch('https://api.waffo.com/v1/checkout/sessions', { ... });

  // Scaffold: return a mock checkout URL for now
  const sessionId = `pancake_${params.bookingId}_${Date.now()}`;
  const checkoutUrl = `https://checkout.waffo.com/pay/${sessionId}?amount=${params.amountCents}&currency=${params.currency}`;

  return { checkoutUrl, sessionId };
}

/**
 * Verify the HMAC signature of a Pancake webhook.
 * Same pattern as devtools-hub's /api/webhooks/pancake.
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expectedSignature = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

/**
 * Process a Pancake payment webhook.
 */
export async function processPaymentWebhook(
  payload: PaymentWebhookPayload
): Promise<{ success: boolean; bookingId: string }> {
  // Extract booking ID from order_id
  const bookingId = payload.order_id.split('_')[1];

  if (payload.status === 'paid') {
    // Update booking payment_status to 'paid'
    // Update payment record
    return { success: true, bookingId };
  }

  return { success: false, bookingId };
}
