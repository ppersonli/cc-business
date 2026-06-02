import { ref, onMounted, watch } from 'vue';

export function useStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue);
  const isLoaded = ref(false);

  onMounted(async () => {
    const result = await browser.storage.local.get(key);
    if (key in result) {
      data.value = result[key];
    }
    isLoaded.value = true;
  });

  watch(data, async (newValue) => {
    await browser.storage.local.set({ [key]: newValue });
  }, { deep: true });

  return { data, isLoaded };
}
