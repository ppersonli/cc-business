<script setup lang="ts">
import { computed } from 'vue';
import type { ScanReport, RiskFinding } from 'extension-shield-scanner';

const props = defineProps<{ report: ScanReport }>();

interface CasaCheck {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

const checks = computed<CasaCheck[]>(() => {
  const findings = props.report.findings;
  const f = (ids: string[]) => findings.filter((fi: RiskFinding) => fi.casReference && ids.some((id) => fi.casReference!.includes(id)));

  const dangerousPerms = findings.filter(
    (fi: RiskFinding) => fi.category === 'permission' && (fi.severity === 'critical' || fi.severity === 'high')
  );
  const remoteCode = findings.filter((fi: RiskFinding) => fi.category === 'remote-code');
  const cspIssues = findings.filter((fi: RiskFinding) => fi.category === 'csp');
  const secretIssues = findings.filter((fi: RiskFinding) => fi.category === 'secrets');
  const privacyIssues = findings.filter((fi: RiskFinding) => fi.category === 'privacy');
  const obfuscationIssues = findings.filter((fi: RiskFinding) => fi.category === 'obfuscation');
  const networkIssues = findings.filter((fi: RiskFinding) => fi.category === 'network');

  return [
    {
      id: 'CASA-01',
      name: 'No dangerous permissions without justification',
      passed: dangerousPerms.length === 0,
      details: dangerousPerms.length > 0
        ? `${dangerousPerms.length} dangerous permission issue(s) found`
        : 'All permissions are within acceptable scope',
    },
    {
      id: 'CASA-02',
      name: 'No remote code execution',
      passed: remoteCode.length === 0,
      details: remoteCode.length > 0
        ? `${remoteCode.length} remote code issue(s) detected`
        : 'No remote code patterns found',
    },
    {
      id: 'CASA-03',
      name: 'Secure Content Security Policy',
      passed: cspIssues.length === 0,
      details: cspIssues.length > 0
        ? `${cspIssues.length} CSP issue(s) detected`
        : 'CSP policy is properly configured',
    },
    {
      id: 'CASA-04',
      name: 'No leaked secrets or credentials',
      passed: secretIssues.length === 0,
      details: secretIssues.length > 0
        ? `${secretIssues.length} potential secret(s) found`
        : 'No secrets detected in source files',
    },
    {
      id: 'CASA-05',
      name: 'Privacy policy present and data handling declared',
      passed: privacyIssues.length === 0,
      details: privacyIssues.length > 0
        ? `${privacyIssues.length} privacy concern(s)`
        : 'Privacy declarations are in order',
    },
    {
      id: 'CASA-06',
      name: 'No obfuscated or encoded source code',
      passed: obfuscationIssues.length === 0,
      details: obfuscationIssues.length > 0
        ? `${obfuscationIssues.length} obfuscation issue(s)`
        : 'Source code is readable and unobfuscated',
    },
    {
      id: 'CASA-07',
      name: 'All network connections use HTTPS',
      passed: networkIssues.length === 0,
      details: networkIssues.length > 0
        ? `${networkIssues.length} insecure connection(s)`
        : 'All network URLs use HTTPS',
    },
  ];
});

const passedCount = computed(() => checks.value.filter((c) => c.passed).length);
</script>

<template>
  <div>
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
      <span style="font-size:0.875rem;color:#94a3b8;">{{ passedCount }}/{{ checks.length }} checks passed</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      <div
        v-for="check in checks"
        :key="check.id"
        :style="{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: '#0f172a',
          borderRadius: '8px',
          border: `1px solid ${check.passed ? '#166534' : '#7f1d1d'}`,
        }"
      >
        <!-- Status indicator -->
        <div
          :style="{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: check.passed ? '#166534' : '#7f1d1d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: '0',
            marginTop: '1px',
          }"
        >
          <svg v-if="check.passed" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-5" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 4l6 6M10 4l-6 6" stroke="#f87171" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
            <span style="font-size:0.6875rem;color:#64748b;font-family:monospace;">{{ check.id }}</span>
            <span style="font-size:0.8125rem;font-weight:600;color:#e2e8f0;">{{ check.name }}</span>
          </div>
          <p style="font-size:0.75rem;color:#94a3b8;">{{ check.details }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
