import { NextResponse } from 'next/server';
import { initSchema, findUserByEmail, upsertSubscription } from '@/lib/db';
import { verifyWaffoWebhook, WebhookEventType } from '@/lib/wemd/payment';

/**
 * WeMD Pro webhook handler.
 * Receives payment events from Waffo Pancake and updates subscription status.
 * URL: /api/webhooks/waffo
 */
export async function POST(request: Request) {
  try {
    // CRITICAL: Read body as raw text for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-waffo-signature');

    // Verify webhook signature using SDK's RSA-SHA256 verification
    let event;
    try {
      event = verifyWaffoWebhook(body, signature);
    } catch (err) {
      console.error('[WeMD Webhook] Invalid signature:', err);
      return new Response('Invalid signature', { status: 401 });
    }

    console.log('[WeMD Webhook] Event received:', event.eventType, event.data?.orderId);

    // Initialize database schema
    await initSchema();

    // Handle WeMD Pro subscription events
    const metadata = (event.data?.orderMetadata || {}) as Record<string, string>;
    const isWeMDProduct = metadata.product === 'wemd-pro' || metadata.source === 'wemd-editor';

    if (!isWeMDProduct) {
      // Not a WeMD event, pass through
      return NextResponse.json({ received: true, ignored: 'not wemd-pro' });
    }

    const email = event.data?.buyerEmail as string | undefined;
    if (!email) {
      return NextResponse.json({ received: true, ignored: 'no email' });
    }

    const plan = metadata.plan || 'wemd-pro-monthly';
    const orderId = event.data?.orderId as string | undefined;

    switch (event.eventType) {
      case WebhookEventType.OrderCompleted:
      case WebhookEventType.SubscriptionActivated:
      case WebhookEventType.SubscriptionPaymentSucceeded: {
        const user = await findUserByEmail(email);
        if (user) {
          // Calculate expiry (30 days for monthly, 365 days for yearly)
          const isYearly = plan.includes('yearly');
          const daysToAdd = isYearly ? 365 : 30;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + daysToAdd);

          await upsertSubscription(
            user.id,
            plan,
            'active',
            orderId,
            expiresAt.toISOString()
          );
          console.log(`[WeMD Webhook] Activated ${plan} for ${email}`);
        } else {
          console.warn(`[WeMD Webhook] User not found for email: ${email}`);
        }
        break;
      }

      case WebhookEventType.SubscriptionCanceling:
      case WebhookEventType.SubscriptionCanceled: {
        const user = await findUserByEmail(email);
        if (user) {
          const status = event.eventType === WebhookEventType.SubscriptionCanceled ? 'cancelled' : 'canceling';
          await upsertSubscription(user.id, plan, status, orderId);
          console.log(`[WeMD Webhook] Subscription ${status} for ${email}`);
        }
        break;
      }

      case WebhookEventType.RefundSucceeded: {
        const user = await findUserByEmail(email);
        if (user) {
          await upsertSubscription(user.id, 'free', 'cancelled', orderId);
          console.log(`[WeMD Webhook] Refund processed for ${email}`);
        }
        break;
      }

      default:
        console.log('[WeMD Webhook] Unhandled event type:', event.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WeMD Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
