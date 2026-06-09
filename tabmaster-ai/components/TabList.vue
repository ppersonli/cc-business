<script setup lang="ts">
import TabCard from './TabCard.vue';

defineProps<{
  tabs: chrome.tabs.Tab[];
  groupByWindow?: boolean;
  classifications?: Map<number, string>;
}>();

const emit = defineEmits<{
  activate: [tabId: number, windowId: number];
  close: [tabId: number];
}>();

function groupByWindowId(tabs: chrome.tabs.Tab[]): Map<number, chrome.tabs.Tab[]> {
  const groups = new Map<number, chrome.tabs.Tab[]>();
  for (const tab of tabs) {
    const wid = tab.windowId ?? 0;
    if (!groups.has(wid)) groups.set(wid, []);
    groups.get(wid)!.push(tab);
  }
  return groups;
}
</script>

<template>
  <div class="tab-list">
    <template v-if="groupByWindow">
      <div v-for="[winId, winTabs] in groupByWindowId(tabs)" :key="winId" class="window-group">
        <div class="window-header">Window {{ winId }} ({{ winTabs.length }})</div>
        <TabCard
          v-for="tab in winTabs"
          :key="tab.id"
          :tab="tab"
          :category="classifications?.get(tab.id ?? -1)"
          @activate="emit('activate', $event, tab.windowId!)"
          @close="emit('close', $event)"
        />
      </div>
    </template>
    <template v-else>
      <TabCard
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        :category="classifications?.get(tab.id ?? -1)"
        @activate="emit('activate', $event, tab.windowId!)"
        @close="emit('close', $event)"
      />
    </template>
    <div v-if="tabs.length === 0" class="empty-state">No tabs found</div>
  </div>
</template>

<style scoped>
.tab-list { display: flex; flex-direction: column; gap: 2px; }
.window-header {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 8px 10px 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.window-group { margin-bottom: 8px; }
.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
