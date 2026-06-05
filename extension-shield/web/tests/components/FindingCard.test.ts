import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FindingCard from '../../src/components/FindingCard.vue';
import type { RiskFinding } from 'extension-shield-scanner';

function makeFinding(overrides: Partial<RiskFinding> = {}): RiskFinding {
  return {
    id: 'TEST-001',
    title: 'Test Finding',
    description: 'A test finding description',
    severity: 'medium',
    category: 'permissions',
    suggestion: 'Fix this issue',
    file: 'manifest.json',
    line: 10,
    casReference: 'CASA-01',
    ...overrides,
  };
}

describe('FindingCard', () => {
  it('renders finding title', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ title: 'Risky Permission' }) },
    });
    expect(wrapper.text()).toContain('Risky Permission');
  });

  it('renders finding description', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ description: 'This extension requests all_urls' }) },
    });
    expect(wrapper.text()).toContain('This extension requests all_urls');
  });

  it('renders severity badge', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ severity: 'critical' }) },
    });
    expect(wrapper.text()).toContain('critical');
  });

  it('renders suggestion as fix', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ suggestion: 'Remove unnecessary permissions' }) },
    });
    expect(wrapper.text()).toContain('Fix:');
    expect(wrapper.text()).toContain('Remove unnecessary permissions');
  });

  it('renders file path when present', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ file: 'background.js', line: 42 }) },
    });
    expect(wrapper.text()).toContain('background.js');
    expect(wrapper.text()).toContain('42');
  });

  it('does not render file path when absent', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ file: undefined, line: undefined }) },
    });
    // Should not have monospace file path
    const monospace = wrapper.find('[style*="monospace"]');
    expect(monospace.exists()).toBe(false);
  });

  it('renders CASA reference when present', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ casReference: 'CASA-03' }) },
    });
    expect(wrapper.text()).toContain('CASA: CASA-03');
  });

  it('does not render CASA reference when absent', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ casReference: undefined }) },
    });
    expect(wrapper.text()).not.toContain('CASA:');
  });

  it('formats category name with spaces', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ category: 'remote-code' }) },
    });
    expect(wrapper.text()).toContain('Remote Code');
  });

  it('formats single-word category', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ category: 'permissions' }) },
    });
    expect(wrapper.text()).toContain('Permissions');
  });

  it('applies critical severity border color', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ severity: 'critical' }) },
    });
    const card = wrapper.find('div');
    const style = card.attributes('style');
    expect(style).toContain('#ef4444'); // critical border color
  });

  it('applies low severity border color', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ severity: 'low' }) },
    });
    const card = wrapper.find('div');
    const style = card.attributes('style');
    expect(style).toContain('#22c55e'); // low border color
  });

  it('handles file without line number', () => {
    const wrapper = mount(FindingCard, {
      props: { finding: makeFinding({ file: 'content.js', line: undefined }) },
    });
    expect(wrapper.text()).toContain('content.js');
    // Should not show colon without line number
    const monospace = wrapper.find('[style*="monospace"]');
    if (monospace.exists()) {
      expect(monospace.text()).not.toMatch(/:\d+/);
    }
  });
});
