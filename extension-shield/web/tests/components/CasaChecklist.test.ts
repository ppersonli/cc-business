import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CasaChecklist from '../../src/components/CasaChecklist.vue';
import type { ScanReport, RiskFinding } from 'extension-shield-scanner';

function makeReport(overrides: Partial<ScanReport> = {}): ScanReport {
  return {
    id: 'test-report-1',
    extensionName: 'Test Extension',
    extensionVersion: '1.0.0',
    manifestVersion: 3,
    scannedAt: new Date().toISOString(),
    riskScore: 25,
    riskLevel: 'low',
    summary: { critical: 0, high: 0, medium: 1, low: 2, total: 3 },
    categories: [],
    findings: [],
    ...overrides,
  };
}

function makeFinding(overrides: Partial<RiskFinding> = {}): RiskFinding {
  return {
    id: 'FIND-001',
    title: 'Test Finding',
    description: 'Test description',
    severity: 'medium',
    category: 'permissions',
    suggestion: 'Fix it',
    ...overrides,
  };
}

describe('CasaChecklist', () => {
  it('shows all 7 checks passed when no findings', () => {
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings: [] }) },
    });
    expect(wrapper.text()).toContain('7/7 checks passed');
  });

  it('shows 0/7 when all checks fail', () => {
    const findings: RiskFinding[] = [
      makeFinding({ category: 'permission', severity: 'critical' }),
      makeFinding({ category: 'remote-code', severity: 'high' }),
      makeFinding({ category: 'csp', severity: 'medium' }),
      makeFinding({ category: 'secrets', severity: 'high' }),
      makeFinding({ category: 'privacy', severity: 'medium' }),
      makeFinding({ category: 'obfuscation', severity: 'medium' }),
      makeFinding({ category: 'network', severity: 'low' }),
    ];
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings }) },
    });
    expect(wrapper.text()).toContain('0/7 checks passed');
  });

  it('renders CASA check IDs', () => {
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings: [] }) },
    });
    expect(wrapper.text()).toContain('CASA-01');
    expect(wrapper.text()).toContain('CASA-02');
    expect(wrapper.text()).toContain('CASA-03');
    expect(wrapper.text()).toContain('CASA-04');
    expect(wrapper.text()).toContain('CASA-05');
    expect(wrapper.text()).toContain('CASA-06');
    expect(wrapper.text()).toContain('CASA-07');
  });

  it('CASA-01 fails with dangerous permissions', () => {
    const findings = [
      makeFinding({ category: 'permission', severity: 'critical' }),
    ];
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings }) },
    });
    expect(wrapper.text()).toContain('1 dangerous permission issue(s) found');
  });

  it('CASA-02 fails with remote code findings', () => {
    const findings = [
      makeFinding({ category: 'remote-code', severity: 'high' }),
    ];
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings }) },
    });
    expect(wrapper.text()).toContain('1 remote code issue(s) detected');
  });

  it('CASA-03 fails with CSP issues', () => {
    const findings = [
      makeFinding({ category: 'csp', severity: 'medium' }),
    ];
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings }) },
    });
    expect(wrapper.text()).toContain('1 CSP issue(s) detected');
  });

  it('CASA-04 fails with secrets', () => {
    const findings = [
      makeFinding({ category: 'secrets', severity: 'high' }),
    ];
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings }) },
    });
    expect(wrapper.text()).toContain('1 potential secret(s) found');
  });

  it('CASA-01 passes with only low-severity permissions', () => {
    const findings = [
      makeFinding({ category: 'permission', severity: 'low' }),
    ];
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings }) },
    });
    expect(wrapper.text()).toContain('All permissions are within acceptable scope');
  });

  it('renders check names', () => {
    const wrapper = mount(CasaChecklist, {
      props: { report: makeReport({ findings: [] }) },
    });
    expect(wrapper.text()).toContain('No dangerous permissions without justification');
    expect(wrapper.text()).toContain('No remote code execution');
    expect(wrapper.text()).toContain('Secure Content Security Policy');
    expect(wrapper.text()).toContain('No leaked secrets or credentials');
  });
});
