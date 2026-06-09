<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AISearch from '~/components/AISearch.vue';
import CategoryFilter from '~/components/CategoryFilter.vue';
import TabList from '~/components/TabList.vue';
import QuickActions from '~/components/QuickActions.vue';
import SnapshotManager from '~/components/SnapshotManager.vue';
import { useTabs } from '~/composables/useTabs';
import { useSnapshots } from '~/composables/useSnapshots';
import { useAI } from '~/composables/useAI';
import { tabToSnapshotItem } from '~/utils/tab-utils';

const { tabs, getAllTabs, activateTab, closeTab, closeDuplicateTabs, closeStaleTabs, closeAllExceptPinned } = useTabs();
const { saveSnapshot, getSnapshots } = useSnapshots();
const { classifications, classifyTabs, searchTabs, searchResults } = useAI();

const activeCategory = ref('all');
const searchQuery = ref('');
const notification = ref('');

function notify(msg: string) {
  notification.value = msg;
  setTimeout(() => { notification.value = ''; }, 2000);
}

const filteredTabs = ref<chrome.tabs.Tab[]>([]);

function updateFilteredTabs() {
  if (searchQuery.value) {
    const matchedIds = new Set(searchResults.value.map(r => r.id));
    filteredTabs.value = tabs.value.filter(t => matchedIds.has(t.id ?? -1));
  } else if (activeCategory.value === 'all') {
    filteredTabs.value = tabs.value;
  } else {
    filteredTabs.value = tabs.value.filter(t =>
      classifications.value.get(t.id ?? -1) === activeCategory.value
    );
  }
}

async function handleSearch(query: string) {
  searchQuery.value = query;
  await searchTabs(query, tabs.value.map(t => ({ id: t.id!, title: t.title ?? '', url: t.url ?? '' })));
  updateFilteredTabs();
}

function handleClearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
  updateFilteredTabs();
}

function handleCategorySelect(cat: string) {
  activeCategory.value = cat;
  updateFilteredTabs();
}

async function handleCloseDuplicates() {
  const count = await closeDuplicateTabs();
  notify(`Closed ${count} duplicate tabs`);
}

async function handleCloseStale() {
  const count = await closeStaleTabs();
  notify(`Closed ${count} stale tabs`);
}

async function handleCloseAllExceptPinned() {
  const count = await closeAllExceptPinned();
  notify(`Closed ${count} tabs`);
}

async function handleNewSnapshot() {
  const name = `Snapshot ${new Date().toLocaleTimeString()}`;
  try {
    const items = tabs.value.map(tabToSnapshotItem);
    await saveSnapshot(name, items, tabs.value[0]?.windowId ?? 0);
    notify('Snapshot saved');
  } catch (e: any) {
    notify(e.message);
  }
}

onMounted(async () => {
  await getAllTabs();
  filteredTabs.value = tabs.value;
  // Classify tabs on load (stub)
  await classifyTabs(tabs.value.map(t => ({ id: t.id!, title: t.title ?? '', url: t.url ?? '' })));
  updateFilteredTabs();
});
</script>

<template>
  <div class="app">
    <header class="header">
      <span class="logo">🧠 TabMaster AI</span>
      <span class="tab-count">{{ tabs.length }} tabs</span>
    </header>

    <AISearch @search="handleSearch" @clear="handleClearSearch" />

    <CategoryFilter
      :selected="activeCategory"
      @select="handleCategorySelect"
    />

    <TabList
      :tabs="filteredTabs"
      :classifications="classifications"
      @activate="activateTab"
      @close="closeTab"
    />

    <SnapshotManager @save="(name) => saveSnapshot(name, tabs.map(tabToSnapshotItem), tabs[0]?.windowId ?? 0)" />

    <QuickActions
      @close-duplicate="handleCloseDuplicates"
      @close-stale="handleCloseStale"
      @close-all-except-pinned="handleCloseAllExceptPinned"
      @new-snapshot="handleNewSnapshot"
    />

    <div v-if="notification" class="notification">{{ notification }}</div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.tab-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}
.notification {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: white;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
