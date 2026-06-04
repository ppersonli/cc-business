<script setup lang="ts">
import type { RiskFinding } from 'extension-shield-scanner';

defineProps<{ finding: RiskFinding }>();

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
  high: { bg: '#7c2d12', text: '#fdba74', border: '#f97316' },
  medium: { bg: '#713f12', text: '#fde047', border: '#eab308' },
  low: { bg: '#14532d', text: '#86efac', border: '#22c55e' },
};

function getSeverityStyle(severity: string) {
  return severityColors[severity] || severityColors.low;
}

function formatCategory(cat: string): string {
  return cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
</script>

<template>
  <div
    :style="{
      background: '#111827',
      border: '1px solid #1e293b',
      borderLeft: `4px solid ${getSeverityStyle(finding.severity).border}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '0.75rem',
    }"
  >
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
      <span
        :style="{
          fontSize: '0.625rem',
          fontWeight: '700',
          padding: '0.125rem 0.5rem',
          borderRadius: '4px',
          background: getSeverityStyle(finding.severity).bg,
          color: getSeverityStyle(finding.severity).text,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }"
      >{{ finding.severity }}</span>
      <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.5rem;border-radius:4px;background:#1e293b;color:#94a3b8;">
        {{ formatCategory(finding.category) }}
      </span>
      <span style="font-weight:600;font-size:0.875rem;color:#e2e8f0;">{{ finding.title }}</span>
    </div>
    <p style="font-size:0.8125rem;color:#94a3b8;margin-bottom:0.5rem;line-height:1.5;">{{ finding.description }}</p>
    <p v-if="finding.file" style="font-size:0.75rem;color:#818cf8;font-family:monospace;margin-bottom:0.5rem;">
      {{ finding.file }}<template v-if="finding.line">:{{ finding.line }}</template>
    </p>
    <p style="font-size:0.8125rem;color:#cbd5e1;">
      <span style="font-weight:600;color:#60a5fa;">Fix:</span> {{ finding.suggestion }}
    </p>
    <p v-if="finding.casReference" style="font-size:0.6875rem;color:#64748b;margin-top:0.375rem;">
      CASA: {{ finding.casReference }}
    </p>
  </div>
</template>
