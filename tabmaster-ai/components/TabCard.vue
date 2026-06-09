<script setup lang="ts">
defineProps<{
  tab: chrome.tabs.Tab;
  category?: string;
}>();

const emit = defineEmits<{
  activate: [tabId: number, windowId: number];
  close: [tabId: number];
}>();

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}
</script>

<template>
  <div class="tab-card" @click="emit('activate', tab.id!, tab.windowId!)">
    <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="tab-favicon" width="16" height="16" />
    <div v-else class="tab-favicon-placeholder">📄</div>
    <div class="tab-info">
      <div class="tab-title">{{ tab.title }}</div>
      <div class="tab-url">{{ getDomain(tab.url || '') }}</div>
    </div>
    <span v-if="category" class="tab-category-badge">{{ category }}</span>
    <button class="tab-close" @click.stop="emit('close', tab.id!)" title="Close tab">×</button>
  </div>
</template>

<style scoped>
.tab-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.tab-card:hover { background: var(--bg-hover); }
.tab-favicon { border-radius: 3px; flex-shrink: 0; }
.tab-favicon-placeholder { font-size: 14px; flex-shrink: 0; }
.tab-info { flex: 1; min-width: 0; }
.tab-title {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-url {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-category-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}
.tab-close {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.tab-card:hover .tab-close { opacity: 1; }
.tab-close:hover { background: var(--bg-danger); color: var(--danger); }
</style>
