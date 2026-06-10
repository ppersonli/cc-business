import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { setClient, initSchema, createService } from '../db';

let testClient: ReturnType<typeof createClient>;
let pageId: string;

async function seedPage() {
  const { v4: uuidv4 } = await import('uuid');
  const userId = uuidv4();
  pageId = uuidv4();
  await testClient.execute({ sql: 'INSERT INTO users (id, email) VALUES (?, ?)', args: [userId, 'owner@test.com'] });
  await testClient.execute({
    sql: 'INSERT INTO booking_pages (id, user_id, slug, title) VALUES (?, ?, ?, ?)',
    args: [pageId, userId, 'test-page', 'Test Page'],
  });
}

beforeEach(async () => {
  testClient = createClient({ url: ':memory:' });
  setClient(testClient);
  await initSchema();
  await seedPage();
});

afterEach(() => {
  testClient.close();
});

describe('Package pricing (DB layer)', () => {
  it('can store service with price in cents', async () => {
    const service = await createService(pageId, {
      name: '5-Session Package',
      description: '5 personal training sessions',
      durationMinutes: 60,
      priceCents: 20000, // $200
      currency: 'USD',
    });

    expect(service.price_cents).toBe(20000);
    expect(service.currency).toBe('USD');
    expect(service.name).toBe('5-Session Package');
  });

  it('handles free services (null price)', async () => {
    const service = await createService(pageId, {
      name: 'Discovery Call',
      durationMinutes: 15,
    });

    expect(service.price_cents).toBeNull();
  });

  it('supports different currencies', async () => {
    const service = await createService(pageId, {
      name: 'Consultation',
      durationMinutes: 30,
      priceCents: 5000,
      currency: 'EUR',
    });

    expect(service.currency).toBe('EUR');
  });
});

describe('Calendar integration (unit)', () => {
  it('getCalendarAuthUrl generates valid URL', async () => {
    const { getCalendarAuthUrl } = await import('../google-calendar');
    const url = getCalendarAuthUrl('user-123');

    expect(url).toContain('accounts.google.com');
    expect(url).toContain('calendar.events');
    expect(url).toContain('user-123');
    expect(url).toContain('access_type=offline');
  });
});

describe('Payments (unit)', () => {
  it('verifyWebhookSignature validates correctly', async () => {
    const { verifyWebhookSignature } = await import('../payments');
    const payload = '{"order_id":"test","status":"paid"}';
    const secret = 'test-secret';

    // Generate a valid signature
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const validSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = await verifyWebhookSignature(payload, validSignature, secret);
    expect(isValid).toBe(true);

    const isInvalid = await verifyWebhookSignature(payload, 'invalid-sig', secret);
    expect(isInvalid).toBe(false);
  });

  it('createCheckoutSession returns mock checkout URL', async () => {
    const { createCheckoutSession } = await import('../payments');
    const session = await createCheckoutSession({
      bookingId: 'booking-123',
      amountCents: 5000,
      currency: 'USD',
      description: 'Consultation',
    });

    expect(session.checkoutUrl).toContain('waffo.com');
    expect(session.sessionId).toContain('booking-123');
  });
});
