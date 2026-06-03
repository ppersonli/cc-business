import { NextResponse } from 'next/server';
import { findUserByEmail, upsertSubscription } from '@/lib/db';
const WEBHOOK_SECRET = process.env.PANCAKE_WEBHOOK_SECRET || '';

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-waffo-signature') || '';
    const body = await request.text();

    // Verify webhook signature
    if (WEBHOOK_SECRET) {
      const expectedSig = await hmacSha256(WEBHOOK_SECRET, body);
      if (signature !== expectedSig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Pancake webhook received:', event.type);

    if (event.type === 'checkout.session.completed' || event.type === 'subscription.renewed') {
      const email = event.data?.customer_email;
      const plan = event.data?.metadata?.subscriptionType || event.data?.metadata?.plan || 'pro';
      const expiresAt = event.data?.expires_at;

      if (email) {
        const user = await findUserByEmail(email);
        if (user) {
          await upsertSubscription(user.id, plan, 'active', event.data?.id, expiresAt);
        }
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'subscription.cancelled' || event.type === 'subscription.expired') {
      const email = event.data?.customer_email;
      if (email) {
        const user = await findUserByEmail(email);
        if (user) {
          await upsertSubscription(user.id, 'free', 'cancelled');
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
