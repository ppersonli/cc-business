import { NextResponse } from 'next/server';
import { createWeMDCheckout, type WeMDPlan, WEMD_PRODUCT_IDS } from '@/lib/wemd/payment';

export async function POST(request: Request) {
  try {
    const { plan, email } = await request.json();

    if (!plan || !WEMD_PRODUCT_IDS[plan as WeMDPlan]) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be wemd-pro-monthly or wemd-pro-yearly' },
        { status: 400 }
      );
    }

    const result = await createWeMDCheckout({
      plan: plan as WeMDPlan,
      email,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Payment service not configured. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[WeMD Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
