import { NextResponse } from 'next/server';

const SHIELD_PRODUCT_IDS: Record<string, string> = {
  'shield-scan': 'extension-shield-single-scan',
  'shield-pro-monthly': 'extension-shield-pro-monthly',
};

export async function POST(request: Request) {
  try {
    const { product, email, successUrl, cancelUrl } = await request.json();

    if (!product || !SHIELD_PRODUCT_IDS[product]) {
      return NextResponse.json(
        { error: 'Invalid product. Must be shield-scan or shield-pro-monthly' },
        { status: 400 }
      );
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tools.ovanime.com';
    const PANCAKE_API_KEY = process.env.PANCAKE_API_KEY;

    if (!PANCAKE_API_KEY) {
      return NextResponse.json(
        { error: 'Pancake API key not configured' },
        { status: 500 }
      );
    }

    const res = await fetch('https://api.waffo.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PANCAKE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: SHIELD_PRODUCT_IDS[product],
        success_url: successUrl || `${FRONTEND_URL}/extensions/`,
        cancel_url: cancelUrl || `${FRONTEND_URL}/extensions/`,
        customer_email: email || undefined,
        metadata: {
          product,
          source: 'extension-shield',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Pancake API error:', res.status, err);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 502 }
      );
    }

    const session = await res.json();
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
