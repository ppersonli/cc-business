import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RiskGauge from '../../src/components/RiskGauge.vue';

describe('RiskGauge', () => {
  it('renders score value', () => {
    const wrapper = mount(RiskGauge, { props: { score: 42 } });
    expect(wrapper.text()).toContain('42');
  });

  it('clamps score to 0 minimum', () => {
    const wrapper = mount(RiskGauge, { props: { score: -10 } });
    expect(wrapper.text()).toContain('0');
  });

  it('clamps score to 100 maximum', () => {
    const wrapper = mount(RiskGauge, { props: { score: 150 } });
    expect(wrapper.text()).toContain('100');
  });

  it('shows Low label for score <= 20', () => {
    const wrapper = mount(RiskGauge, { props: { score: 10 } });
    expect(wrapper.text()).toContain('Low');
  });

  it('shows Medium label for score 21-50', () => {
    const wrapper = mount(RiskGauge, { props: { score: 35 } });
    expect(wrapper.text()).toContain('Medium');
  });

  it('shows High label for score 51-80', () => {
    const wrapper = mount(RiskGauge, { props: { score: 65 } });
    expect(wrapper.text()).toContain('High');
  });

  it('shows Critical label for score > 80', () => {
    const wrapper = mount(RiskGauge, { props: { score: 90 } });
    expect(wrapper.text()).toContain('Critical');
  });

  it('uses green stroke for low risk', () => {
    const wrapper = mount(RiskGauge, { props: { score: 10 } });
    const circles = wrapper.findAll('circle');
    const scoreArc = circles[1];
    expect(scoreArc.attributes('stroke')).toBe('#22c55e');
  });

  it('uses red stroke for critical risk', () => {
    const wrapper = mount(RiskGauge, { props: { score: 90 } });
    const circles = wrapper.findAll('circle');
    const scoreArc = circles[1];
    expect(scoreArc.attributes('stroke')).toBe('#ef4444');
  });

  it('renders SVG with correct viewBox', () => {
    const wrapper = mount(RiskGauge, { props: { score: 50 } });
    const svg = wrapper.find('svg');
    expect(svg.attributes('viewBox')).toBe('0 0 120 120');
  });

  it('handles boundary score of 20 (Low)', () => {
    const wrapper = mount(RiskGauge, { props: { score: 20 } });
    expect(wrapper.text()).toContain('Low');
  });

  it('handles boundary score of 50 (Medium)', () => {
    const wrapper = mount(RiskGauge, { props: { score: 50 } });
    expect(wrapper.text()).toContain('Medium');
  });

  it('handles boundary score of 80 (High)', () => {
    const wrapper = mount(RiskGauge, { props: { score: 80 } });
    expect(wrapper.text()).toContain('High');
  });

  it('handles boundary score of 81 (Critical)', () => {
    const wrapper = mount(RiskGauge, { props: { score: 81 } });
    expect(wrapper.text()).toContain('Critical');
  });

  it('handles score of 0', () => {
    const wrapper = mount(RiskGauge, { props: { score: 0 } });
    expect(wrapper.text()).toContain('0');
    expect(wrapper.text()).toContain('Low');
  });

  it('handles score of 100', () => {
    const wrapper = mount(RiskGauge, { props: { score: 100 } });
    expect(wrapper.text()).toContain('100');
    expect(wrapper.text()).toContain('Critical');
  });
});
