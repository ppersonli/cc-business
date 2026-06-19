import { NextResponse } from 'next/server';
const PLAN_PRODUCT_IDS: Record<string, string> = {
  pro: 'ai-web-clipper-pro-monthly',
  'pro-byok': 'ai-web-clipper-pro-byok-monthly',
  'pro-yearly': 'ai-web-clipper-pro-yearly',
};

export async function POST(request: Request) {
  try {
    const { plan, email, successUrl, cancelUrl } = await request.json();

    if (!plan || !PLAN_PRODUCT_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan. Must be pro, pro-byok, or pro-yearly' }, { status: 400 });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tools.ovanime.com';
    const PANCAKE_API_KEY = process.env.PANCAKE_API_KEY;

    if (!PANCAKE_API_KEY) {
      return NextResponse.json({ error: 'Pancake API key not configured' }, { status: 500 });
    }

    // Create Waffo Pancake checkout session
    const res = await fetch('https://api.waffo.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PANCAKE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: PLAN_PRODUCT_IDS[plan],
        success_url: successUrl || `${FRONTEND_URL}/success`,
        cancel_url: cancelUrl || `${FRONTEND_URL}/cancel`,
        customer_email: email || undefined,
        metadata: {
          plan,
          subscriptionType: plan,
          source: 'chrome-extension',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Pancake API error:', res.status, err);
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 });
    }

    const session = await res.json();
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
