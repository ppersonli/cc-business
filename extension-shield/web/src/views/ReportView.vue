<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { generateHtmlReport } from 'extension-shield-scanner';
import type { ScanReport } from 'extension-shield-scanner';
import RiskGauge from '../components/RiskGauge.vue';
import CategoryBreakdown from '../components/CategoryBreakdown.vue';
import FindingCard from '../components/FindingCard.vue';
import CasaChecklist from '../components/CasaChecklist.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const report = ref<ScanReport | null>(null);

onMounted(() => {
  const id = route.params.id as string;
  const stored = localStorage.getItem('es_reports');
  if (stored) {
    const reports: { id: string; report: ScanReport }[] = JSON.parse(stored);
    const found = reports.find((r) => r.id === id);
    if (found) {
      report.value = found.report;
    }
  }
});

const summaryColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  total: '#e2e8f0',
};

const summaryLevels = ['critical', 'high', 'medium', 'low', 'total'] as const;
type SummaryKey = (typeof summaryLevels)[number];

function getSummaryValue(key: SummaryKey): number {
  if (!report.value) return 0;
  return report.value.summary[key];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function exportHtml() {
  if (!report.value) return;
  const html = generateHtmlReport(report.value);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `extension-shield-report-${report.value.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJson() {
  if (!report.value) return;
  const blob = new Blob([JSON.stringify(report.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `extension-shield-report-${report.value.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <!-- Not found -->
  <div
    v-if="!report"
    style="padding:4rem 2rem;text-align:center;max-width:480px;margin:0 auto;"
  >
    <p style="font-size:1rem;color:#94a3b8;margin-bottom:1.5rem;">{{ t('report.notFound') }}</p>
    <button
      style="padding:0.625rem 1.5rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;"
      @click="router.push('/upload')"
    >{{ t('report.scanNew') }}</button>
  </div>

  <!-- Report -->
  <div v-if="report" style="padding:2rem;max-width:960px;margin:0 auto;">
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;margin-bottom:2rem;">
      <div>
        <h1 style="font-size:1.5rem;font-weight:700;color:#f1f5f9;margin-bottom:0.5rem;">
          {{ t('report.title') }}
        </h1>
        <p style="font-size:0.875rem;color:#94a3b8;">
          {{ report.extensionName }} v{{ report.extensionVersion }} &mdash; MV{{ report.manifestVersion }}
        </p>
        <p style="font-size:0.75rem;color:#64748b;margin-top:0.25rem;">
          {{ t('report.scannedAt') }}: {{ formatDate(report.scannedAt) }}
        </p>
      </div>
      <RiskGauge :score="report.riskScore" />
    </div>

    <!-- Summary Bar -->
    <div style="display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;">
      <div
        v-for="level in summaryLevels"
        :key="level"
        :style="{
          flex: '1',
          minWidth: '120px',
          padding: '1rem',
          background: '#111827',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          textAlign: 'center',
        }"
      >
        <div :style="{ fontSize: '1.5rem', fontWeight: '700', color: summaryColors[level] }">
          {{ getSummaryValue(level) }}
        </div>
        <div style="font-size:0.6875rem;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:0.25rem;">
          {{ t(`report.${level}`) }}
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <section style="margin-bottom:2rem;">
      <h2 style="font-size:1.125rem;font-weight:600;color:#e2e8f0;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #1e293b;">
        {{ t('report.categoryBreakdown') }}
      </h2>
      <CategoryBreakdown :categories="report.categories" />
    </section>

    <!-- CASA Compliance -->
    <section style="margin-bottom:2rem;">
      <h2 style="font-size:1.125rem;font-weight:600;color:#e2e8f0;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #1e293b;">
        {{ t('report.casaCompliance') }}
      </h2>
      <CasaChecklist :report="report" />
    </section>

    <!-- Findings -->
    <section style="margin-bottom:2rem;">
      <h2 style="font-size:1.125rem;font-weight:600;color:#e2e8f0;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #1e293b;">
        {{ t('report.findings') }} ({{ report.summary.total }})
      </h2>
      <div v-if="report.findings.length === 0" style="padding:2rem;text-align:center;">
        <p style="font-size:0.9375rem;color:#22c55e;font-weight:600;">{{ t('report.noFindings') }}</p>
      </div>
      <FindingCard v-for="finding in report.findings" :key="finding.id + finding.file + finding.line" :finding="finding" />
    </section>

    <!-- Export Buttons -->
    <div style="display:flex;gap:1rem;flex-wrap:wrap;padding-top:1rem;border-top:1px solid #1e293b;">
      <button
        style="padding:0.625rem 1.25rem;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;font-size:0.875rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:0.5rem;"
        @click="exportHtml"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2M8 2v8M5 7l3 3 3-3"/></svg>
        {{ t('report.exportHtml') }}
      </button>
      <button
        style="padding:0.625rem 1.25rem;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;font-size:0.875rem;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:0.5rem;"
        @click="exportJson"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2M8 2v8M5 7l3 3 3-3"/></svg>
        {{ t('report.exportJson') }}
      </button>
      <button
        style="padding:0.625rem 1.25rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;margin-left:auto;"
        @click="router.push('/upload')"
      >{{ t('report.scanNew') }}</button>
    </div>
  </div>
</template>
