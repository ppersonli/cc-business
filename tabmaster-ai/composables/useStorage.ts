export function useStorage() {
  async function get<T>(key: string): Promise<T | null> {
    const data = await browser.storage.local.get(key);
    return (data[key] as T) ?? null;
  }

  async function set<T>(key: string, value: T): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  }

  async function remove(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  }

  return { get, set, remove };
}
