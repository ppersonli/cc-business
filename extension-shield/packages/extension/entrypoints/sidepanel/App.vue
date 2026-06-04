<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ScanReport, RiskFinding, RiskLevel } from 'extension-shield-scanner';

const report = ref<ScanReport | null>(null);
const activeTab = ref('all');

const tabs = [
  'all',
  'permission',
  'csp',
  'remote-code',
  'content-script',
  'secrets',
  'privacy',
  'single-purpose',
  'obfuscation',
  'network',
  'dependency',
];

const filteredFindings = computed(() => {
  if (!report.value) return [];
  if (activeTab.value === 'all') return report.value.findings;
  return report.value.findings.filter((f) => f.category === activeTab.value);
});

onMounted(async () => {
  const data = await browser.storage.local.get(['es_currentReport']);
  if (data.es_currentReport) {
    report.value = data.es_currentReport;
  }
});

function getScoreColor(score: number): string {
  if (score >= 80) return '#dc2626';
  if (score >= 50) return '#ea580c';
  if (score >= 20) return '#ca8a04';
  return '#16a34a';
}

function getSeverityClass(severity: string): string {
  return `severity-${severity}`;
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical':
      return '!!';
    case 'high':
      return '!';
    case 'medium':
      return '~';
    default:
      return 'i';
  }
}

async function exportReport(format: 'html' | 'json') {
  if (!report.value) return;
  const response = await browser.runtime.sendMessage({
    type: 'EXPORT_REPORT',
    payload: { scanId: report.value.id, format },
  });
  if (response.success) {
    const blob = new Blob([response.content], {
      type: format === 'html' ? 'text/html' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
</script>

<template>
  <div class="sidepanel">
    <header class="header">
      <div class="logo">
        <img src="/icon/icon-32.png" alt="" width="24" height="24" />
        <h1>ExtensionShield</h1>
      </div>
    </header>

    <div v-if="!report" class="empty-state">
      <p>No report loaded. Scan an extension from the popup.</p>
    </div>

    <div v-else class="report">
      <div class="report-header">
        <div class="report-title">
          <h2>{{ report.extensionName }}</h2>
          <span class="report-version">v{{ report.extensionVersion }}</span>
          <span class="report-mv">MV{{ report.manifestVersion }}</span>
        </div>
        <div
          class="score-gauge"
          :style="{ borderColor: getScoreColor(report.riskScore) }"
        >
          <span
            class="score-number"
            :style="{ color: getScoreColor(report.riskScore) }"
            >{{ report.riskScore }}</span
          >
          <span class="score-label">{{ report.riskLevel }}</span>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-item critical">
          <span class="count">{{ report.summary.critical }}</span>
          <span class="label">CRIT</span>
        </div>
        <div class="summary-item high">
          <span class="count">{{ report.summary.high }}</span>
          <span class="label">HIGH</span>
        </div>
        <div class="summary-item medium">
          <span class="count">{{ report.summary.medium }}</span>
          <span class="label">MED</span>
        </div>
        <div class="summary-item low">
          <span class="count">{{ report.summary.low }}</span>
          <span class="label">LOW</span>
        </div>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab === 'all' ? `All (${report.findings.length})` : tab }}
        </button>
      </div>

      <div class="findings">
        <div
          v-for="finding in filteredFindings"
          :key="finding.id + finding.file + finding.line"
          :class="['finding-card', getSeverityClass(finding.severity)]"
        >
          <div class="finding-header">
            <span :class="['sev-icon', getSeverityClass(finding.severity)]">{{
              getSeverityIcon(finding.severity)
            }}</span>
            <span class="finding-title">{{ finding.title }}</span>
          </div>
          <p class="finding-desc">{{ finding.description }}</p>
          <p v-if="finding.file" class="finding-file">
            {{ finding.file }}{{ finding.line ? `:${finding.line}` : '' }}
          </p>
          <p class="finding-suggestion">{{ finding.suggestion }}</p>
        </div>

        <div v-if="filteredFindings.length === 0" class="no-findings">
          No findings in this category.
        </div>
      </div>

      <div class="export-bar">
        <button class="export-btn" @click="exportReport('html')">
          Export HTML
        </button>
        <button class="export-btn" @click="exportReport('json')">
          Export JSON
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidepanel {
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1e293b;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo h1 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.empty-state {
  padding: 48px 16px;
  text-align: center;
  color: #94a3b8;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.report-title h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
}

.report-version,
.report-mv {
  font-size: 12px;
  color: #94a3b8;
  margin-right: 8px;
}

.score-gauge {
  width: 64px;
  height: 64px;
  border: 3px solid;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-number {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.score-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
}

.summary-bar {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.summary-item {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border-radius: 6px;
}

.summary-item .count {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.summary-item .label {
  font-size: 9px;
  font-weight: 600;
  color: #64748b;
}

.summary-item.critical {
  background: #fef2f2;
  color: #dc2626;
}
.summary-item.high {
  background: #fff7ed;
  color: #ea580c;
}
.summary-item.medium {
  background: #fefce8;
  color: #ca8a04;
}
.summary-item.low {
  background: #f0fdf4;
  color: #16a34a;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  font-size: 11px;
  cursor: pointer;
}

.tab.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.findings {
  padding: 8px 16px;
}

.finding-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-left: 3px solid #e2e8f0;
}

.finding-card.severity-critical {
  border-left-color: #dc2626;
}
.finding-card.severity-high {
  border-left-color: #ea580c;
}
.finding-card.severity-medium {
  border-left-color: #ca8a04;
}
.finding-card.severity-low {
  border-left-color: #16a34a;
}

.finding-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.sev-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}

.sev-icon.severity-critical {
  background: #dc2626;
}
.sev-icon.severity-high {
  background: #ea580c;
}
.sev-icon.severity-medium {
  background: #ca8a04;
}
.sev-icon.severity-low {
  background: #16a34a;
}

.finding-title {
  font-size: 12px;
  font-weight: 600;
}

.finding-desc {
  font-size: 11px;
  color: #475569;
  margin: 4px 0;
  line-height: 1.5;
}

.finding-file {
  font-size: 10px;
  color: #6366f1;
  font-family: monospace;
  margin: 2px 0;
}

.finding-suggestion {
  font-size: 11px;
  color: #1e293b;
  margin-top: 6px;
}

.no-findings {
  text-align: center;
  padding: 24px;
  color: #16a34a;
  font-weight: 600;
  font-size: 13px;
}

.export-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e2e8f0;
  position: sticky;
  bottom: 0;
}

.export-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.export-btn:hover {
  background: #f1f5f9;
}
</style>
