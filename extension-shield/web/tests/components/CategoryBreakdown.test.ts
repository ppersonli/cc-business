import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CategoryBreakdown from '../../src/components/CategoryBreakdown.vue';
import type { CategoryReport } from 'extension-shield-scanner';

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  }),
}));

function makeCategory(overrides: Partial<CategoryReport> = {}): CategoryReport {
  return {
    category: 'permissions',
    score: 50,
    findings: [],
    ...overrides,
  };
}

describe('CategoryBreakdown', () => {
  it('renders category rows', () => {
    const categories = [
      makeCategory({ category: 'permissions', score: 30 }),
      makeCategory({ category: 'csp', score: 80 }),
    ];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    expect(wrapper.text()).toContain('30');
    expect(wrapper.text()).toContain('80');
  });

  it('formats category names with spaces', () => {
    const categories = [makeCategory({ category: 'remote-code' })];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    expect(wrapper.text()).toContain('Remote Code');
  });

  it('shows finding count', () => {
    const categories = [
      makeCategory({
        category: 'permissions',
        findings: [
          { id: '1', title: 'A', description: '', severity: 'low', category: 'permissions', suggestion: '' },
          { id: '2', title: 'B', description: '', severity: 'low', category: 'permissions', suggestion: '' },
        ] as any,
      }),
    ];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    expect(wrapper.text()).toContain('2 findings');
  });

  it('shows singular finding for 1 finding', () => {
    const categories = [
      makeCategory({
        category: 'csp',
        findings: [
          { id: '1', title: 'A', description: '', severity: 'low', category: 'csp', suggestion: '' },
        ] as any,
      }),
    ];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    expect(wrapper.text()).toContain('1 finding');
    expect(wrapper.text()).not.toContain('1 findings');
  });

  it('renders bar with correct width percentage', () => {
    const categories = [makeCategory({ score: 75 })];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    const bar = wrapper.find('[style*="width: 75%"]');
    expect(bar.exists()).toBe(true);
  });

  it('uses red bar color for score >= 80', () => {
    const categories = [makeCategory({ score: 90 })];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    const bar = wrapper.find('[style*="#ef4444"]');
    expect(bar.exists()).toBe(true);
  });

  it('uses green bar color for score < 20', () => {
    const categories = [makeCategory({ score: 10 })];
    const wrapper = mount(CategoryBreakdown, { props: { categories } });
    const bar = wrapper.find('[style*="#22c55e"]');
    expect(bar.exists()).toBe(true);
  });

  it('renders empty when no categories', () => {
    const wrapper = mount(CategoryBreakdown, { props: { categories: [] } });
    expect(wrapper.text()).toBe('');
  });
});
