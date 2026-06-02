import { FREE_DAILY_LIMIT } from '~/utils/payment';

export type PlanType = 'free' | 'pro' | 'pro-byok' | 'pro-yearly';

export interface SubscriptionState {
  plan: PlanType;
  isPro: boolean;
  expiresAt?: number;
  userId: string;
}

function isProPlan(plan: string): boolean {
  return plan === 'pro' || plan === 'pro-byok' || plan === 'pro-yearly';
}

// Generate a stable anonymous user ID based on extension install
async function getOrCreateUserId(): Promise<string> {
  const data = await browser.storage.local.get('userId');
  if (data.userId) return data.userId as string;

  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  await browser.storage.local.set({ userId: id });
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
    const res = await fetch(`https://tools.pixiaoli.cn/api/subscription/status?userId=${encodeURIComponent(userId)}`);
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
