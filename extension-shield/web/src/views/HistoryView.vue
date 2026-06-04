<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ScanReport } from 'extension-shield-scanner';

const router = useRouter();
const { t } = useI18n();
const reports = ref<{ id: string; report: ScanReport }[]>([]);

onMounted(() => {
  const stored = localStorage.getItem('es_reports');
  if (stored) {
    reports.value = JSON.parse(stored);
  }
});

const sortedReports = computed(() =>
  [...reports.value].sort(
    (a, b) => new Date(b.report.scannedAt).getTime() - new Date(a.report.scannedAt).getTime()
  )
);

function severityColor(level: string): string {
  switch (level) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#94a3b8';
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 50) return '#f97316';
  if (score >= 20) return '#eab308';
  return '#22c55e';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function viewReport(id: string) {
  router.push(`/report/${id}`);
}

function deleteReport(id: string) {
  reports.value = reports.value.filter((r) => r.id !== id);
  localStorage.setItem('es_reports', JSON.stringify(reports.value));
}
</script>

<template>
  <div style="padding:2rem;max-width:960px;margin:0 auto;">
    <h1 style="font-size:1.5rem;font-weight:700;color:#f1f5f9;margin-bottom:1.5rem;">
      {{ t('history.title') }}
    </h1>

    <!-- Empty state -->
    <div
      v-if="sortedReports.length === 0"
      style="padding:3rem;text-align:center;background:#111827;border:1px solid #1e293b;border-radius:12px;"
    >
      <p style="font-size:0.9375rem;color:#94a3b8;margin-bottom:1.5rem;">{{ t('history.empty') }}</p>
      <button
        style="padding:0.625rem 1.5rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;"
        @click="router.push('/upload')"
      >{{ t('report.scanNew') }}</button>
    </div>

    <!-- Table -->
    <div v-else style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid #1e293b;">
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">{{ t('history.extension') }}</th>
            <th style="padding:0.75rem 1rem;text-align:center;font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">{{ t('history.riskScore') }}</th>
            <th style="padding:0.75rem 1rem;text-align:center;font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">{{ t('history.riskLevel') }}</th>
            <th style="padding:0.75rem 1rem;text-align:center;font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">{{ t('history.findings') }}</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">{{ t('history.date') }}</th>
            <th style="padding:0.75rem 1rem;text-align:right;font-size:0.75rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">{{ t('history.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in sortedReports"
            :key="item.id"
            style="border-bottom:1px solid #1e293b;transition:background 0.15s;"
            @mouseenter="($event.currentTarget as HTMLElement).style.background='#111827'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='transparent'"
          >
            <td style="padding:0.875rem 1rem;">
              <div style="font-size:0.875rem;font-weight:600;color:#e2e8f0;">{{ item.report.extensionName }}</div>
              <div style="font-size:0.6875rem;color:#64748b;">v{{ item.report.extensionVersion }}</div>
            </td>
            <td style="padding:0.875rem 1rem;text-align:center;">
              <span :style="{ fontSize: '1rem', fontWeight: '700', color: scoreColor(item.report.riskScore) }">
                {{ item.report.riskScore }}
              </span>
            </td>
            <td style="padding:0.875rem 1rem;text-align:center;">
              <span
                :style="{
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: severityColor(item.report.riskLevel) + '20',
                  color: severityColor(item.report.riskLevel),
                }"
              >{{ item.report.riskLevel }}</span>
            </td>
            <td style="padding:0.875rem 1rem;text-align:center;font-size:0.875rem;color:#e2e8f0;">
              {{ item.report.summary.total }}
            </td>
            <td style="padding:0.875rem 1rem;font-size:0.8125rem;color:#94a3b8;">
              {{ formatDate(item.report.scannedAt) }}
            </td>
            <td style="padding:0.875rem 1rem;text-align:right;">
              <button
                style="padding:0.375rem 0.75rem;background:#1e293b;color:#60a5fa;border:1px solid #334155;border-radius:6px;font-size:0.75rem;font-weight:500;cursor:pointer;margin-right:0.5rem;"
                @click="viewReport(item.id)"
              >{{ t('history.viewReport') }}</button>
              <button
                style="padding:0.375rem 0.75rem;background:#1e293b;color:#f87171;border:1px solid #334155;border-radius:6px;font-size:0.75rem;font-weight:500;cursor:pointer;"
                @click="deleteReport(item.id)"
              >{{ t('history.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
