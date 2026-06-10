import type { Platform } from './fees';

export interface ResearchEntry {
  id: string;
  timestamp: number;
  costOfGoods: number;
  sellingPrice: number;
  shippingCost: number;
  platform: Platform;
  quantity: number;
  profit: number;
  margin: number;
  roi: number;
}

const STORAGE_KEY = 'sellsmart_history';
const MAX_ENTRIES = 50;

export async function saveResearch(entry: Omit<ResearchEntry, 'id' | 'timestamp'>): Promise<ResearchEntry> {
  const history = await getHistory();
  const newEntry: ResearchEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };
  history.unshift(newEntry);
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  await browser.storage.local.set({ [STORAGE_KEY]: history });
  return newEntry;
}

export async function getHistory(): Promise<ResearchEntry[]> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as ResearchEntry[]) || [];
}

export async function deleteResearch(id: string): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter((e) => e.id !== id);
  await browser.storage.local.set({ [STORAGE_KEY]: filtered });
}

export async function clearHistory(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
