/**
 * useStorage — Chrome storage abstraction for composables.
 * Falls back to localStorage for testing/development.
 */

import { ref, watch } from 'vue';

type StorageArea = 'local' | 'sync';

function getStorage(area: StorageArea) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage[area];
  }
  // Fallback for testing/dev
  return {
    get: (keys: string[]) => {
      const result: Record<string, any> = {};
      for (const key of keys) {
        const val = localStorage.getItem(`tabmaster_${area}_${key}`);
        if (val !== null) {
          try { result[key] = JSON.parse(val); } catch { result[key] = val; }
        }
      }
      return result;
    },
    set: (items: Record<string, any>) => {
      for (const [key, val] of Object.entries(items)) {
        localStorage.setItem(`tabmaster_${area}_${key}`, JSON.stringify(val));
      }
    },
    remove: (keys: string[]) => {
      for (const key of keys) {
        localStorage.removeItem(`tabmaster_${area}_${key}`);
      }
    },
  };
}

export function useStorage<T>(key: string, defaultValue: T, area: StorageArea = 'local') {
  const storage = getStorage(area);
  const data = ref<T>(defaultValue) as { value: T };

  // Load initial value
  const loaded = storage.get([key]);
  if (loaded[key] !== undefined) {
    data.value = loaded[key];
  }

  // Watch for changes and persist
  watch(data, (newVal) => {
    storage.set({ [key]: newVal });
  }, { deep: true });

  return data;
}

export async function storageGet<T>(key: string, defaultValue: T, area: StorageArea = 'local'): Promise<T> {
  const storage = getStorage(area);
  const data = await storage.get([key]);
  return data[key] ?? defaultValue;
}

export async function storageSet(key: string, value: any, area: StorageArea = 'local'): Promise<void> {
  const storage = getStorage(area);
  await storage.set({ [key]: value });
}

export async function storageRemove(key: string, area: StorageArea = 'local'): Promise<void> {
  const storage = getStorage(area);
  await storage.remove([key]);
}
