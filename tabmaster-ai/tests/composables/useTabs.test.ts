import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTabs } from '~/composables/useTabs';

describe('composables/useTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
  });

  it('getAllTabs calls chrome.tabs.query', async () => {
    const mockTabsData = [
      { id: 1, title: 'Tab 1', url: 'https://a.com', windowId: 1, pinned: false },
      { id: 2, title: 'Tab 2', url: 'https://b.com', windowId: 1, pinned: true },
    ];
    (globalThis as any).chrome.tabs.query = vi.fn().mockResolvedValue(mockTabsData);

    const { getAllTabs } = useTabs();
    const tabs = await getAllTabs();
    expect(tabs).toHaveLength(2);
    expect(chrome.tabs.query).toHaveBeenCalledWith({});
  });

  it('activateTab calls chrome.tabs.update and windows.update', async () => {
    (globalThis as any).chrome.tabs.update = vi.fn().mockResolvedValue({});
    (globalThis as any).chrome.windows = { update: vi.fn().mockResolvedValue({}) };

    const { activateTab } = useTabs();
    await activateTab(5, 2);
    expect(chrome.tabs.update).toHaveBeenCalledWith(5, { active: true });
  });

  it('closeTab calls chrome.tabs.remove', async () => {
    (globalThis as any).chrome.tabs.remove = vi.fn().mockResolvedValue(undefined);

    const { closeTab } = useTabs();
    await closeTab(5);
    expect(chrome.tabs.remove).toHaveBeenCalledWith(5);
  });
});
