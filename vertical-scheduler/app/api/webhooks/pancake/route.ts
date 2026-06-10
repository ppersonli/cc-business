import { NextResponse } from 'next/server';
import { verifyWebhookSignature, processPaymentWebhook } from '@/lib/payments';
import { getClient } from '@/lib/db';

const WEBHOOK_SECRET = process.env.PANCAKE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-waffo-signature') || '';

    // Verify webhook signature
    if (WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const result = await processPaymentWebhook(payload);

    if (result.success) {
      // Update payment status in DB
      const db = getClient();
      await db.execute({
        sql: `UPDATE bookings SET payment_status = 'paid' WHERE id = ?`,
        args: [result.bookingId],
      });

      await db.execute({
        sql: `UPDATE payments SET status = 'paid', pancake_order_id = ? WHERE booking_id = ?`,
        args: [payload.order_id, result.bookingId],
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('POST /api/webhooks/pancake error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
