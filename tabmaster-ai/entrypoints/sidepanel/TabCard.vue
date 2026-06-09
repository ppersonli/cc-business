<template>
  <div
    class="tab-card"
    :class="{ active: isActive, 'search-match': isSearchMatch }"
    @click="$emit('activate', tab.id)"
  >
    <img
      v-if="tab.favIconUrl"
      :src="tab.favIconUrl"
      class="favicon"
      @error="onFaviconError"
    />
    <div v-else class="favicon-placeholder">📄</div>
    <div class="tab-info">
      <div class="tab-title">{{ tab.title }}</div>
      <div class="tab-url">{{ shortUrl }}</div>
    </div>
    <div class="tab-actions">
      <button
        v-if="!tab.pinned"
        class="tab-action"
        @click.stop="$emit('pin', tab.id)"
        title="Pin tab"
      >📌</button>
      <button
        v-if="tab.pinned"
        class="tab-action"
        @click.stop="$emit('unpin', tab.id)"
        title="Unpin tab"
      ></button>
      <button
        class="tab-action danger"
        @click.stop="$emit('close', tab.id)"
        title="Close tab"
      >✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TabInfo } from '~/utils/tab-utils';

const props = defineProps<{
  tab: TabInfo;
  isActive: boolean;
  isSearchMatch: boolean;
}>();

defineEmits<{
  activate: [tabId: number];
  close: [tabId: number];
  pin: [tabId: number];
  unpin: [tabId: number];
}>();

const shortUrl = computed(() => {
  try {
    const u = new URL(props.tab.url);
    return u.hostname + (u.pathname !== '/' ? u.pathname.slice(0, 30) : '');
  } catch {
    return props.tab.url.slice(0, 40);
  }
});

function onFaviconError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none';
}
</script>

<style scoped>
.tab-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.tab-card:hover {
  background: var(--bg-tertiary);
}

.tab-card.active {
  background: var(--bg-tertiary);
  border-left: 3px solid var(--accent);
  padding-left: 9px;
}

.tab-card.search-match {
  background: rgba(7,193,96,0.08);
}

.favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.favicon-placeholder {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.tab-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.tab-title {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.tab-url {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.tab-card:hover .tab-actions {
  opacity: 1;
}

.tab-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background 0.15s;
}

.tab-action:hover {
  background: rgba(0,0,0,0.1);
}

.tab-action.danger:hover {
  background: rgba(239,68,68,0.2);
  color: var(--danger);
}
</style>
