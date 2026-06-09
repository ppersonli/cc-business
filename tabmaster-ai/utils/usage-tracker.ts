/**
 * Usage tracking and rate limiting for AI features.
 * Free tier: 5 AI classifications/day, 10 AI searches/day.
 * Pro tier: unlimited.
 * Stored in chrome.storage.local with daily reset.
 */

export type AIFeatureType = 'classification' | 'search';

export interface UsageData {
  classificationCount: number;
  searchCount: number;
  date: string; // YYYY-MM-DD
}

export const FREE_LIMITS: Record<AIFeatureType, number> = {
  classification: 5,
  search: 10,
};

const STORAGE_KEY = 'ai_usage';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get current usage data, resetting counts if the day has changed.
 */
export async function getUsage(): Promise<UsageData> {
  const today = getToday();

  if (typeof chrome !== 'undefined' && chrome.storage) {
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    const usage = data[STORAGE_KEY] as UsageData | undefined;

    if (!usage || usage.date !== today) {
      const fresh: UsageData = { classificationCount: 0, searchCount: 0, date: today };
      await chrome.storage.local.set({ [STORAGE_KEY]: fresh });
      return fresh;
    }

    return usage;
  }

  // Dev/test fallback
  const raw = localStorage.getItem(`tabmaster_local_${STORAGE_KEY}`);
  if (raw) {
    try {
      const usage = JSON.parse(raw) as UsageData;
      if (usage.date !== today) {
        const fresh: UsageData = { classificationCount: 0, searchCount: 0, date: today };
        localStorage.setItem(`tabmaster_local_${STORAGE_KEY}`, JSON.stringify(fresh));
        return fresh;
      }
      return usage;
    } catch {
      // fallthrough
    }
  }

  return { classificationCount: 0, searchCount: 0, date: today };
}

/**
 * Check if the user can use a specific AI feature.
 * Pro users always have access. Free users are rate-limited.
 */
export async function canUseFeature(
  feature: AIFeatureType,
  isPro: boolean,
): Promise<{ allowed: boolean; remaining: number }> {
  if (isPro) return { allowed: true, remaining: Infinity };

  const usage = await getUsage();
  const count = feature === 'classification' ? usage.classificationCount : usage.searchCount;
  const limit = FREE_LIMITS[feature];
  const remaining = limit - count;

  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

/**
 * Increment usage count for a specific AI feature.
 */
export async function incrementUsage(feature: AIFeatureType): Promise<void> {
  const usage = await getUsage();

  if (feature === 'classification') {
    usage.classificationCount += 1;
  } else {
    usage.searchCount += 1;
  }

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ [STORAGE_KEY]: usage });
  } else {
    localStorage.setItem(`tabmaster_local_${STORAGE_KEY}`, JSON.stringify(usage));
  }
}

/**
 * Get usage summary for display.
 */
export async function getUsageSummary(isPro: boolean): Promise<{
  classification: { used: number; limit: number | string };
  search: { used: number; limit: number | string };
}> {
  if (isPro) {
    return {
      classification: { used: 0, limit: 'unlimited' },
      search: { used: 0, limit: 'unlimited' },
    };
  }

  const usage = await getUsage();
  return {
    classification: { used: usage.classificationCount, limit: FREE_LIMITS.classification },
    search: { used: usage.searchCount, limit: FREE_LIMITS.search },
  };
}
