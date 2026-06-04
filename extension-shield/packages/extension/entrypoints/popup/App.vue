<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ScanReport, RiskLevel } from 'extension-shield-scanner';
import type { InstalledExtension, ScanResultResponse } from '~/utils/messages';

const extensions = ref<InstalledExtension[]>([]);
const scanResults = ref<Record<string, ScanReport>>({});
const scanning = ref<string | null>(null);
const scanningAll = ref(false);

onMounted(async () => {
  await loadExtensions();
  await loadScanResults();
});

async function loadExtensions() {
  const result = await browser.runtime.sendMessage({
    type: 'GET_INSTALLED_EXTENSIONS',
    payload: {},
  });
  extensions.value = result || [];
}

async function loadScanResults() {
  const results: ScanReport[] = await browser.runtime.sendMessage({
    type: 'GET_SCAN_HISTORY',
    payload: { limit: 100 },
  });
  if (results) {
    for (const report of results) {
      // Find matching extension by name
      const ext = extensions.value.find((e) => e.name === report.extensionName);
      if (ext) {
        scanResults.value[ext.id] = report;
        ext.riskScore = report.riskScore;
        ext.riskLevel = report.riskLevel;
      }
    }
  }
}

async function scanExtension(id: string) {
  scanning.value = id;
  try {
    const response: ScanResultResponse = await browser.runtime.sendMessage({
      type: 'SCAN_INSTALLED',
      payload: { extensionId: id },
    });
    if (response.success && response.report) {
      scanResults.value[id] = response.report;
      const ext = extensions.value.find((e) => e.id === id);
      if (ext) {
        ext.riskScore = response.report.riskScore;
        ext.riskLevel = response.report.riskLevel;
      }
    }
  } finally {
    scanning.value = null;
  }
}

async function scanAll() {
  scanningAll.value = true;
  try {
    for (const ext of extensions.value) {
      if (ext.id !== chrome.runtime.id) {
        await scanExtension(ext.id);
      }
    }
  } finally {
    scanningAll.value = false;
  }
}

function getRiskBadgeClass(level?: string): string {
  switch (level) {
    case 'critical':
      return 'badge-critical';
    case 'high':
      return 'badge-high';
    case 'medium':
      return 'badge-medium';
    case 'low':
      return 'badge-low';
    default:
      return 'badge-none';
  }
}

function getIconUrl(ext: InstalledExtension): string {
  if (ext.icons && ext.icons.length > 0) {
    const largest = ext.icons.reduce((a, b) => (a.size > b.size ? a : b));
    return largest.url || '';
  }
  return '';
}

function openReport(extensionId: string) {
  const report = scanResults.value[extensionId];
  if (report) {
    browser.storage.local.set({ es_currentReport: report });
    chrome.sidePanel.open({ tabId: undefined as any }).catch(() => {});
  }
}
</script>

<template>
  <div class="popup">
    <header class="header">
      <div class="logo">
        <img src="/icon/icon-32.png" alt="" width="24" height="24" />
        <h1>ExtensionShield</h1>
      </div>
    </header>

    <div class="toolbar">
      <button class="scan-all-btn" :disabled="scanningAll" @click="scanAll">
        {{ scanningAll ? 'Scanning...' : 'Scan All Extensions' }}
      </button>
    </div>

    <div class="extension-list">
      <div
        v-for="ext in extensions"
        :key="ext.id"
        class="ext-item"
        @click="openReport(ext.id)"
      >
        <img
          v-if="ext.icons && ext.icons.length > 0"
          :src="getIconUrl(ext)"
          class="ext-icon"
          width="24"
          height="24"
        />
        <div v-else class="ext-icon-placeholder"></div>
        <div class="ext-info">
          <span class="ext-name">{{ ext.name }}</span>
          <span class="ext-version">v{{ ext.version }}</span>
        </div>
        <div class="ext-actions">
          <span
            v-if="scanResults[ext.id]"
            :class="['risk-badge', getRiskBadgeClass(scanResults[ext.id].riskLevel)]"
          >
            {{ scanResults[ext.id].riskScore }}
          </span>
          <button
            v-if="scanning === ext.id"
            class="scanning-spinner"
            disabled
          >
            ...
          </button>
          <button
            v-else
            class="scan-btn"
            @click.stop="scanExtension(ext.id)"
          >
            Scan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  width: 380px;
  min-height: 400px;
  max-height: 600px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1e293b;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
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

.toolbar {
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.scan-all-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.scan-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.extension-list {
  overflow-y: auto;
  max-height: 460px;
}

.ext-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.15s;
}

.ext-item:hover {
  background: #f1f5f9;
}

.ext-icon {
  border-radius: 4px;
  flex-shrink: 0;
}

.ext-icon-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.ext-info {
  flex: 1;
  min-width: 0;
}

.ext-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ext-version {
  font-size: 11px;
  color: #94a3b8;
}

.ext-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.risk-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
}

.badge-critical {
  background: #dc2626;
}
.badge-high {
  background: #ea580c;
}
.badge-medium {
  background: #ca8a04;
}
.badge-low {
  background: #16a34a;
}

.scan-btn {
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  font-size: 11px;
  cursor: pointer;
}

.scan-btn:hover {
  background: #f1f5f9;
}

.scanning-spinner {
  padding: 4px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 11px;
}
</style>
