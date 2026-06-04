const STORAGE_KEYS = {
  SUBSCRIPTION: 'es_subscriptionPlan',
  SUBSCRIPTION_CACHE_TIME: 'es_subscriptionCacheTime',
  USAGE_DATE: 'es_usageDate',
  USAGE_COUNT: 'es_usageCount',
  USER_ID: 'es_userId',
} as const;

const BACKEND_URL = 'https://tools.pixiaoli.cn';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export type PlanType = 'free' | 'shield-scan' | 'shield-pro-monthly';

export interface SubscriptionState {
  plan: PlanType;
  isPro: boolean;
  expiresAt?: number;
}

function decodeJwtPayload(token: string): { sub?: string; email?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export async function getAuthCookie(): Promise<{
  userId: string;
  email?: string;
} | null> {
  try {
    const cookie = await chrome.cookies.get({
      url: BACKEND_URL,
      name: 'auth_token',
    });
    if (!cookie?.value) return null;

    const payload = decodeJwtPayload(cookie.value);
    if (!payload?.sub) return null;

    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function getOrCreateUserId(): Promise<string> {
  const auth = await getAuthCookie();
  if (auth) return auth.userId;

  const data = await browser.storage.local.get(STORAGE_KEYS.USER_ID);
  if (data[STORAGE_KEYS.USER_ID]) return data[STORAGE_KEYS.USER_ID];

  const uuid = crypto.randomUUID();
  await browser.storage.local.set({ [STORAGE_KEYS.USER_ID]: uuid });
  return uuid;
}

export async function getSubscriptionState(): Promise<SubscriptionState> {
  const data = await browser.storage.local.get([
    STORAGE_KEYS.SUBSCRIPTION,
    STORAGE_KEYS.SUBSCRIPTION_CACHE_TIME,
  ]);

  const cached = data[STORAGE_KEYS.SUBSCRIPTION] as SubscriptionState | undefined;
  const cacheTime = data[STORAGE_KEYS.SUBSCRIPTION_CACHE_TIME] as number | undefined;

  if (cached && cacheTime && Date.now() - cacheTime < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const userId = await getOrCreateUserId();
    const res = await fetch(
      `${BACKEND_URL}/api/extension-shield/subscription/status?userId=${userId}`
    );
    if (!res.ok) return { plan: 'free', isPro: false };

    const json = await res.json();
    const state: SubscriptionState = {
      plan: json.plan || 'free',
      isPro: json.isPro || false,
      expiresAt: json.expiresAt,
    };

    await browser.storage.local.set({
      [STORAGE_KEYS.SUBSCRIPTION]: state,
      [STORAGE_KEYS.SUBSCRIPTION_CACHE_TIME]: Date.now(),
    });

    return state;
  } catch {
    return { plan: 'free', isPro: false };
  }
}

const FREE_SCAN_LIMIT = 3;

export async function getDailyUsage(): Promise<{
  count: number;
  limit: number;
  remaining: number;
}> {
  const state = await getSubscriptionState();
  if (state.isPro) {
    return { count: 0, limit: Infinity, remaining: Infinity };
  }

  const today = new Date().toISOString().slice(0, 10);
  const data = await browser.storage.local.get([
    STORAGE_KEYS.USAGE_DATE,
    STORAGE_KEYS.USAGE_COUNT,
  ]);

  const savedDate = data[STORAGE_KEYS.USAGE_DATE] as string | undefined;
  const count =
    savedDate === today ? ((data[STORAGE_KEYS.USAGE_COUNT] as number) || 0) : 0;

  return {
    count,
    limit: FREE_SCAN_LIMIT,
    remaining: Math.max(0, FREE_SCAN_LIMIT - count),
  };
}

export async function canUse(): Promise<{
  allowed: boolean;
  remaining: number;
  isPro: boolean;
}> {
  const state = await getSubscriptionState();
  if (state.isPro) return { allowed: true, remaining: Infinity, isPro: true };

  const usage = await getDailyUsage();
  return {
    allowed: usage.remaining > 0,
    remaining: usage.remaining,
    isPro: false,
  };
}

export async function incrementUsage(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await browser.storage.local.get([
    STORAGE_KEYS.USAGE_DATE,
    STORAGE_KEYS.USAGE_COUNT,
  ]);

  const savedDate = data[STORAGE_KEYS.USAGE_DATE] as string | undefined;
  const count =
    savedDate === today ? ((data[STORAGE_KEYS.USAGE_COUNT] as number) || 0) : 0;

  await browser.storage.local.set({
    [STORAGE_KEYS.USAGE_DATE]: today,
    [STORAGE_KEYS.USAGE_COUNT]: count + 1,
  });
}

export async function refreshSubscription(): Promise<void> {
  await browser.storage.local.remove([
    STORAGE_KEYS.SUBSCRIPTION,
    STORAGE_KEYS.SUBSCRIPTION_CACHE_TIME,
  ]);
}
