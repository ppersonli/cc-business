export type PlanType = 'free' | 'pro' | 'pro-byok' | 'pro-yearly';

export interface SubscriptionState {
  plan: PlanType;
  isPro: boolean;
  expiresAt?: number;
  userId: string;
}

const SITE_DOMAIN = 'tools.pixiaoli.cn';
const AUTH_COOKIE_NAME = 'auth_token';
const MAX_FREE_SNAPSHOTS = 5;

function isProPlan(plan: string): boolean {
  return plan === 'pro' || plan === 'pro-byok' || plan === 'pro-yearly';
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const FREE_SNAPSHOT_LIMIT = MAX_FREE_SNAPSHOTS;

export async function getAuthCookie(): Promise<{ userId: string; email: string } | null> {
  try {
    const cookie = await chrome.cookies.get({
      url: `https://${SITE_DOMAIN}`,
      name: AUTH_COOKIE_NAME,
    });
    if (!cookie?.value) return null;

    const payload = decodeJwtPayload(cookie.value);
    if (!payload) return null;
    if (payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) return null;

    const userId = String(payload.sub ?? '');
    const email = String(payload.email ?? '');
    if (!userId) return null;
    return { userId, email };
  } catch {
    return null;
  }
}

export async function getOrCreateUserId(): Promise<string> {
  const auth = await getAuthCookie();
  if (auth) {
    await browser.storage.local.set({ userId: auth.userId, loggedInEmail: auth.email, isAnonymous: false });
    return auth.userId;
  }

  const data = await browser.storage.local.get(['userId', 'isAnonymous']);
  if (data.userId && data.isAnonymous === false) return data.userId as string;
  if (data.userId) return data.userId as string;

  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  await browser.storage.local.set({ userId: id, isAnonymous: true });
  return id;
}

export async function getSubscriptionState(): Promise<SubscriptionState> {
  const userId = await getOrCreateUserId();
  const data = await browser.storage.local.get(['subscriptionPlan', 'subscriptionExpiresAt', 'subscriptionLastCheck']);

  const now = Date.now();
  const lastCheck = (data.subscriptionLastCheck as number) || 0;
  const cacheValid = now - lastCheck < 5 * 60 * 1000;

  if (cacheValid && data.subscriptionPlan) {
    return {
      plan: data.subscriptionPlan as PlanType,
      isPro: isProPlan(data.subscriptionPlan as string),
      expiresAt: data.subscriptionExpiresAt as number | undefined,
      userId,
    };
  }

  try {
    const res = await fetch(`https://${SITE_DOMAIN}/api/subscription/status?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const status = await res.json();
      const resolvedPlan: PlanType = status.plan || (status.isPro ? 'pro' : 'free');
      const state: SubscriptionState = {
        plan: resolvedPlan,
        isPro: isProPlan(resolvedPlan),
        expiresAt: status.expiresAt as number | undefined,
        userId,
      };
      await browser.storage.local.set({ subscriptionPlan: state.plan, subscriptionExpiresAt: state.expiresAt, subscriptionLastCheck: now });
      return state;
    }
  } catch {
    // Offline
  }

  return {
    plan: (data.subscriptionPlan as PlanType) || 'free',
    isPro: isProPlan(data.subscriptionPlan as string),
    expiresAt: data.subscriptionExpiresAt as number | undefined,
    userId,
  };
}
