/**
 * AI Focus Mode for TabMaster AI.
 * User declares a task; AI classifies tabs as relevant/irrelevant.
 * Irrelevant tabs are hidden (not closed) and restored when focus mode exits.
 */

import type { TabInfo } from './tab-utils';

export interface FocusState {
  active: boolean;
  task: string;
  hiddenTabIds: number[];
  activatedAt: number;
}

export interface FocusResult {
  id: number;
  relevant: boolean;
  reason: string;
}

const STORAGE_KEY = 'focus_state';

/**
 * Get the current focus mode state, or null if never activated.
 */
export async function getFocusState(): Promise<FocusState | null> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    return (data[STORAGE_KEY] as FocusState) || null;
  }
  const raw = localStorage.getItem(`tabmaster_local_${STORAGE_KEY}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Activate focus mode. Stores which tabs are hidden so they can be restored later.
 * Does NOT actually hide tabs — the caller handles UI filtering.
 */
export async function activateFocusMode(
  task: string,
  results: FocusResult[],
  tabs: TabInfo[],
): Promise<FocusState> {
  const relevantIds = new Set(results.filter(r => r.relevant).map(r => r.id));
  const hiddenTabIds = tabs
    .filter(t => !t.pinned && !relevantIds.has(t.id))
    .map(t => t.id);

  const state: FocusState = {
    active: true,
    task,
    hiddenTabIds,
    activatedAt: Date.now(),
  };

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
  } else {
    localStorage.setItem(`tabmaster_local_${STORAGE_KEY}`, JSON.stringify(state));
  }

  return state;
}

/**
 * Deactivate focus mode. Returns the previously hidden tab ids so the caller
 * can restore them in the UI.
 */
export async function deactivateFocusMode(): Promise<number[]> {
  const state = await getFocusState();
  const hiddenIds = state?.hiddenTabIds || [];

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.remove(STORAGE_KEY);
  } else {
    localStorage.removeItem(`tabmaster_local_${STORAGE_KEY}`);
  }

  return hiddenIds;
}

/**
 * Get the set of hidden tab ids. Returns empty set when focus mode is inactive.
 */
export async function getHiddenTabIds(): Promise<Set<number>> {
  const state = await getFocusState();
  if (!state || !state.active) return new Set();
  return new Set(state.hiddenTabIds);
}

/**
 * Build AI prompt for focus mode tab relevance classification.
 */
export function buildFocusPrompt(task: string, tabs: TabInfo[]): string {
  const tabList = tabs
    .map(t => `${t.id}: ${t.title} (${t.url})`)
    .join('\n');

  return `The user is currently focused on this task: "${task}"

Determine which open tabs are relevant to this task and which are not.

Tabs:
${tabList}

Return ONLY a JSON array (no markdown fences):
[{"id": tabId, "relevant": true, "reason": "why relevant or not"}]

Mark tabs as relevant if they could help with the task. Mark entertainment, social media, shopping, and unrelated tabs as not relevant.`;
}

/**
 * Parse AI focus mode response.
 */
export function parseFocusResponse(text: string): FocusResult[] {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: any) => item.id !== undefined)
      .map((item: any) => ({
        id: Number(item.id),
        relevant: Boolean(item.relevant),
        reason: String(item.reason || ''),
      }));
  } catch {
    return [];
  }
}
