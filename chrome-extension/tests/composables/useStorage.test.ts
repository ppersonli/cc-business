import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useStorage } from '~/composables/useStorage';

// Wrapper component that exposes the composable state for testing
function createTestComponent(key: string, defaultValue: any) {
  return defineComponent({
    setup() {
      const { data, isLoaded } = useStorage(key, defaultValue);
      return { data, isLoaded };
    },
    template: '<div>{{ data }}</div>',
  });
}

describe('composables/useStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).browser.storage.local.data = {};
  });

  it('initializes with the default value', async () => {
    const wrapper = mount(createTestComponent('testKey', 'default'));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toBe('default');
    expect(wrapper.vm.isLoaded).toBe(true); // isLoaded set after onMounted
    wrapper.unmount();
  });

  it('loads value from storage on mount', async () => {
    await browser.storage.local.set({ testKey: 'stored-value' });

    const wrapper = mount(createTestComponent('testKey', 'default'));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toBe('stored-value');
    expect(wrapper.vm.isLoaded).toBe(true);
    wrapper.unmount();
  });

  it('keeps default value when key is not in storage', async () => {
    const wrapper = mount(createTestComponent('missingKey', 42));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toBe(42);
    expect(wrapper.vm.isLoaded).toBe(true);
    wrapper.unmount();
  });

  it('writes to storage when data changes', async () => {
    const wrapper = mount(createTestComponent('writeKey', 'initial'));
    await wrapper.vm.$nextTick();

    wrapper.vm.data = 'updated';
    await wrapper.vm.$nextTick();

    const stored = await browser.storage.local.get('writeKey');
    expect(stored.writeKey).toBe('updated');
    wrapper.unmount();
  });

  it('works with complex objects', async () => {
    const defaultObj = { items: [1, 2, 3], active: true };
    await browser.storage.local.set({ objKey: { items: [10], active: false } });

    const wrapper = mount(createTestComponent('objKey', defaultObj));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toEqual({ items: [10], active: false });
    expect(wrapper.vm.isLoaded).toBe(true);

    // Mutate and verify persistence
    wrapper.vm.data = { items: [10, 20], active: true };
    await wrapper.vm.$nextTick();

    const stored = await browser.storage.local.get('objKey');
    expect(stored.objKey).toEqual({ items: [10, 20], active: true });
    wrapper.unmount();
  });

  it('handles numeric defaults', async () => {
    const wrapper = mount(createTestComponent('numKey', 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toBe(0);
    expect(wrapper.vm.isLoaded).toBe(true);
    wrapper.unmount();
  });

  it('handles boolean defaults', async () => {
    const wrapper = mount(createTestComponent('boolKey', false));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toBe(false);
    expect(wrapper.vm.isLoaded).toBe(true);
    wrapper.unmount();
  });

  it('handles array defaults', async () => {
    await browser.storage.local.set({ arrKey: ['a', 'b'] });

    const wrapper = mount(createTestComponent('arrKey', []));
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.data).toEqual(['a', 'b']);
    wrapper.unmount();
  });

  it('handles deep nested object mutations', async () => {
    const wrapper = mount(createTestComponent('nestedKey', { a: { b: 1 } }));
    await wrapper.vm.$nextTick();

    wrapper.vm.data = { a: { b: 2 } };
    await wrapper.vm.$nextTick();

    const stored = await browser.storage.local.get('nestedKey');
    expect(stored.nestedKey).toEqual({ a: { b: 2 } });
    wrapper.unmount();
  });
});
