export const SHIELD_PLANS = {
  'shield-scan': { name: 'Single Scan', price: 4900 },
  'shield-pro-monthly': { name: 'Shield Pro', price: 999 },
} as const;

export type ShieldPlanId = keyof typeof SHIELD_PLANS;

export async function createCheckoutSession(
  plan: ShieldPlanId,
  email?: string
): Promise<string> {
  const res = await fetch(
    'https://tools.pixiaoli.cn/api/extension-shield/checkout/create',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: plan,
        email,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      }),
    }
  );

  if (!res.ok) throw new Error('Failed to create checkout session');

  const json = await res.json();
  return json.checkoutUrl;
}

export async function openCheckout(
  plan: ShieldPlanId,
  email?: string
): Promise<void> {
  const url = await createCheckoutSession(plan, email);
  window.open(url, '_blank');
}
