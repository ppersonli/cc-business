import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveResearch,
  getHistory,
  deleteResearch,
  clearHistory,
  type ResearchEntry,
} from '~/utils/storage';

const mockEntry = {
  costOfGoods: 10,
  sellingPrice: 25,
  shippingCost: 3,
  platform: 'etsy' as const,
  quantity: 1,
  profit: 9.17,
  margin: 36.68,
  roi: 70.54,
};

describe('getHistory', () => {
  it('returns empty array when no history exists', async () => {
    const history = await getHistory();
    expect(history).toEqual([]);
  });
});

describe('saveResearch', () => {
  it('saves an entry and returns it with id and timestamp', async () => {
    const saved = await saveResearch(mockEntry);
    expect(saved.id).toBeDefined();
    expect(saved.id.length).toBeGreaterThan(0);
    expect(saved.timestamp).toBeGreaterThan(0);
    expect(saved.costOfGoods).toBe(10);
    expect(saved.sellingPrice).toBe(25);
    expect(saved.profit).toBe(9.17);
  });

  it('prepends new entries (newest first)', async () => {
    await saveResearch(mockEntry);
    const second = await saveResearch({ ...mockEntry, sellingPrice: 30 });

    const history = await getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe(second.id);
    expect(history[1].sellingPrice).toBe(25);
  });

  it('caps history at 50 entries', async () => {
    for (let i = 0; i < 55; i++) {
      await saveResearch({ ...mockEntry, sellingPrice: 10 + i });
    }
    const history = await getHistory();
    expect(history).toHaveLength(50);
    // Newest entry should be first
    expect(history[0].sellingPrice).toBe(64); // 10 + 54
  });
});

describe('deleteResearch', () => {
  it('removes entry by id', async () => {
    const entry1 = await saveResearch(mockEntry);
    const entry2 = await saveResearch({ ...mockEntry, sellingPrice: 30 });

    await deleteResearch(entry1.id);

    const history = await getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(entry2.id);
  });

  it('does nothing when id does not exist', async () => {
    await saveResearch(mockEntry);
    await deleteResearch('nonexistent-id');

    const history = await getHistory();
    expect(history).toHaveLength(1);
  });
});

describe('clearHistory', () => {
  it('removes all entries', async () => {
    await saveResearch(mockEntry);
    await saveResearch(mockEntry);
    expect(await getHistory()).toHaveLength(2);

    await clearHistory();
    expect(await getHistory()).toEqual([]);
  });
});
