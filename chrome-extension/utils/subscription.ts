import { FREE_DAILY_LIMIT } from '~/utils/payment';

export type PlanType = 'free' | 'pro' | 'pro-byok' | 'pro-yearly';

export interface SubscriptionState {
  plan: PlanType;
  isPro: boolean;
  expiresAt?: number;
  userId: string;
}

const SITE_DOMAIN = 'tools.ovanime.com';
const AUTH_COOKIE_NAME = 'auth_token';

function isProPlan(plan: string): boolean {
  return plan === 'pro' || plan === 'pro-byok' || plan === 'pro-yearly';
}

/**
 * Decode a base64url-encoded JWT payload without verification.
 * Used to extract userId from the auth_token cookie.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Read the auth_token cookie from tools.ovanime.com.
 * Returns the decoded payload with userId and email, or null if not logged in.
 */
export async function getAuthCookie(): Promise<{ userId: string; email: string } | null> {
  try {
    // chrome.cookies.get requires the cookies permission
    const cookie = await chrome.cookies.get({
      url: `https://${SITE_DOMAIN}`,
      name: AUTH_COOKIE_NAME,
    });

    if (!cookie?.value) return null;

    const payload = decodeJwtPayload(cookie.value);
    if (!payload) return null;

    // Check expiration
    if (payload.exp && typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) {
      return null;
    }

    const userId = String(payload.sub ?? '');
    const email = String(payload.email ?? '');

    if (!userId) return null;

    return { userId, email };
  } catch {
    // cookies API not available (e.g. in test environment) — fall back
    return null;
  }
}

/**
 * Get or create user ID:
 * 1. If user is logged in (has auth_token cookie), use their DB user ID
 * 2. Otherwise, use a local anonymous UUID
 */
export async function getOrCreateUserId(): Promise<string> {
  // Try to get authenticated user ID from cookie first
  const auth = await getAuthCookie();
  if (auth) {
    // Cache the logged-in user ID
    await browser.storage.local.set({
      userId: auth.userId,
      loggedInEmail: auth.email,
      isAnonymous: false,
    });
    return auth.userId;
  }

  // Fall back to anonymous UUID
  const data = await browser.storage.local.get(['userId', 'isAnonymous']);
  // If we previously had a logged-in user, keep their ID as fallback
  if (data.userId && data.isAnonymous === false) {
    return data.userId as string;
  }

  if (data.userId) return data.userId as string;

  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  await browser.storage.local.set({ userId: id, isAnonymous: true });
  return id;
}

/**
 * Get the current subscription state.
 * Checks local cache first, then refreshes from backend if stale.
 */
export async function getSubscriptionState(): Promise<SubscriptionState> {
  const userId = await getOrCreateUserId();
  const data = await browser.storage.local.get(['subscriptionPlan', 'subscriptionExpiresAt', 'subscriptionLastCheck']);

  const now = Date.now();
  const lastCheck = (data.subscriptionLastCheck as number) || 0;
  const cacheValid = now - lastCheck < 5 * 60 * 1000; // 5 min cache

  if (cacheValid && data.subscriptionPlan) {
    return {
      plan: data.subscriptionPlan as PlanType,
      isPro: isProPlan(data.subscriptionPlan as string),
      expiresAt: data.subscriptionExpiresAt as number | undefined,
      userId,
    };
  }

  // Refresh from backend (devtools-hub API)
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

      await browser.storage.local.set({
        subscriptionPlan: state.plan,
        subscriptionExpiresAt: state.expiresAt,
        subscriptionLastCheck: now,
      });

      return state;
    }
  } catch {
    // Offline or error — use cached value
  }

  return {
    plan: ((data.subscriptionPlan as PlanType) || 'free') as PlanType,
    isPro: isProPlan(data.subscriptionPlan as string),
    expiresAt: data.subscriptionExpiresAt as number | undefined,
    userId,
  };
}

/**
 * Check if the user has remaining free usage today.
 */
export async function getDailyUsage(): Promise<{ count: number; limit: number; date: string; isPro: boolean }> {
  const state = await getSubscriptionState();
  const today = new Date().toISOString().slice(0, 10);
  const data = await browser.storage.local.get(['usageDate', 'usageCount']);

  if (state.isPro) {
    return { count: 0, limit: Infinity, date: today, isPro: true };
  }

  if (data.usageDate !== today) {
    await browser.storage.local.set({ usageDate: today, usageCount: 0 });
    return { count: 0, limit: FREE_DAILY_LIMIT, date: today, isPro: false };
  }

  return {
    count: (data.usageCount as number) || 0,
    limit: FREE_DAILY_LIMIT,
    date: today,
    isPro: false,
  };
}

/**
 * Check if the user can perform another summarization.
 */
export async function canUse(): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
  const usage = await getDailyUsage();
  if (usage.isPro) return { allowed: true, remaining: Infinity, isPro: true };
  const remaining = usage.limit - usage.count;
  return { allowed: remaining > 0, remaining, isPro: false };
}

/**
 * Increment usage counter (called after successful summarization).
 */
export async function incrementUsage(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await browser.storage.local.get(['usageDate', 'usageCount']);
  const count = data.usageDate === today ? ((data.usageCount as number) || 0) + 1 : 1;
  await browser.storage.local.set({ usageDate: today, usageCount: count });
}

/**
 * Force refresh subscription status from backend.
 */
export async function refreshSubscription(): Promise<SubscriptionState> {
  await browser.storage.local.remove('subscriptionLastCheck');
  return getSubscriptionState();
}
