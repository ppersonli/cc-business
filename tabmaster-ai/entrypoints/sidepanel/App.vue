<template>
  <div class="sidepanel" :class="{ dark: isDark }">
    <header class="header">
      <div class="header-left">
        <span class="logo">🧠</span>
        <h1>TabMaster AI</h1>
        <span v-if="isPro" class="pro-badge">PRO</span>
      </div>
      <div class="header-right">
        <span class="tab-count">{{ t('tabCount', String(tabs.length)) }}</span>
        <button
          class="icon-btn ai-classify-btn"
          :class="{ loading: aiClassifying }"
          :disabled="aiClassifying || tabs.length === 0"
          @click="runAIClassification"
          :title="t('titleAIClassify')"
        >
          <span v-if="aiClassifying" class="spinning">⟳</span>
          <span v-else>✨</span>
        </button>
        <button class="icon-btn" @click="refreshTabs" :disabled="loading" :title="t('titleRefresh')">
          <span :class="{ spinning: loading }">↻</span>
        </button>
        <button class="icon-btn" @click="showSettings = true" :title="t('titleSettings')">⚙️</button>
        <button class="icon-btn" @click="toggleDark" :title="t('titleToggleTheme')">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- Usage Counter -->
    <div v-if="!isPro && usageInfo" class="usage-bar">
      <span class="usage-item">
        ✨ {{ t('usageClassify', String(usageInfo.classification.used), String(usageInfo.classification.limit)) }}
      </span>
      <span class="usage-item">
        🔍 {{ t('usageSearch', String(usageInfo.search.used), String(usageInfo.search.limit)) }}
      </span>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="aiSearchEnabled ? t('searchPlaceholderAI') : t('searchPlaceholder')"
        class="search-input"
        :class="{ 'ai-active': aiSearchEnabled }"
        @input="aiSearchEnabled ? onAIInput() : onSearch()"
      />
      <div class="search-controls">
        <button
          class="ai-search-toggle"
          :class="{ active: aiSearchEnabled }"
          @click="toggleAISearch"
          :title="aiSearchEnabled ? t('titleSwitchToText') : t('titleSwitchToAI')"
        >
          🤖
        </button>
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
      </div>
      <div v-if="aiSearching" class="search-spinner">{{ t('searchingWithAI') }}</div>
    </div>

    <!-- Category Filter -->
    <div class="categories">
      <button
        v-for="cat in categories"
        :key="cat"
        class="category-btn"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = activeCategory === cat ? null : cat"
      >
        {{ categoryIcons[cat] }} {{ categoryLabels[cat] }}
        <span v-if="getCategoryCount(cat) > 0" class="cat-count">{{ getCategoryCount(cat) }}</span>
      </button>
    </div>

    <!-- Tab List -->
    <div class="tab-list">
      <!-- Pinned Section -->
      <div v-if="pinnedTabs.length > 0" class="section">
        <div class="section-header">
          <span>{{ t('sectionPinned', String(pinnedTabs.length)) }}</span>
        </div>
        <TabCard
          v-for="tab in pinnedTabs"
          :key="tab.id"
          :tab="tab"
          :is-active="tab.id === activeTabId"
          :is-search-match="searchMatchIds.has(tab.id)"
          @activate="activateTab"
          @close="closeTab"
          @unpin="pinTab(tab.id, false)"
        />
      </div>

      <!-- Category Sections -->
      <div
        v-for="cat in visibleCategories"
        :key="cat"
        class="section"
      >
        <div class="section-header">
          <span>{{ categoryIcons[cat] }} {{ categoryLabels[cat] }} ({{ getCategoryCount(cat) }})</span>
        </div>
        <TabCard
          v-for="tab in getCategoryTabs(cat)"
          :key="tab.id"
          :tab="tab"
          :is-active="tab.id === activeTabId"
          :is-search-match="searchMatchIds.has(tab.id)"
          @activate="activateTab"
          @close="closeTab"
          @pin="pinTab(tab.id, true)"
        />
      </div>

      <!-- Uncategorized -->
      <div v-if="uncategorizedTabs.length > 0 && !activeCategory" class="section">
        <div class="section-header">
          <span>{{ t('sectionUncategorized', String(uncategorizedTabs.length)) }}</span>
        </div>
        <TabCard
          v-for="tab in uncategorizedTabs"
          :key="tab.id"
          :tab="tab"
          :is-active="tab.id === activeTabId"
          :is-search-match="searchMatchIds.has(tab.id)"
          @activate="activateTab"
          @close="closeTab"
          @pin="pinTab(tab.id, true)"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredTabs.length === 0" class="empty-state">
        <p v-if="searchQuery">{{ t('emptyNoMatch', searchQuery) }}</p>
        <p v-else>{{ t('emptyNoCategory') }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-btn" @click="closeDuplicates" :title="t('titleCloseDupes')">
        {{ t('btnCloseDupes') }}
      </button>
      <button class="action-btn" @click="closeInactive" :title="t('titleCloseOld')">
        {{ t('btnCloseOld') }}
      </button>
      <button class="action-btn primary" @click="showSnapshotDialog = true" :disabled="tabs.length === 0">
        {{ t('btnNewSnapshot') }}
      </button>
    </div>

    <!-- Snapshots Section -->
    <div v-if="snapshots.length > 0" class="snapshots-section">
      <div class="section-header">
        <span>{{ t('sectionSnapshots', String(snapshots.length), isPro ? '∞' : String(MAX_FREE_SNAPSHOTS)) }}</span>
      </div>
      <div
        v-for="snapshot in snapshots"
        :key="snapshot.id"
        class="snapshot-item"
      >
        <div class="snapshot-info" @click="restoreSnapshot(snapshot)">
          <span class="snapshot-name">{{ snapshot.name }}</span>
          <span class="snapshot-meta">{{ t('snapshotTabsMeta', String(snapshot.tabs.length), formatTime(snapshot.createdAt)) }}</span>
        </div>
        <button class="icon-btn small" @click="deleteSnapshot(snapshot.id)" :title="t('titleDelete')">🗑️</button>
      </div>
    </div>

    <!-- Snapshot Dialog -->
    <div v-if="showSnapshotDialog" class="dialog-overlay" @click.self="showSnapshotDialog = false">
      <div class="dialog">
        <h3>{{ t('dialogSaveSnapshot') }}</h3>
        <input
          v-model="snapshotName"
          type="text"
          :placeholder="t('snapshotNamePlaceholder')"
          class="dialog-input"
          @keyup.enter="saveSnapshot"
          ref="snapshotInput"
        />
        <div class="dialog-actions">
          <button class="dialog-btn" @click="showSnapshotDialog = false">{{ t('btnCancel') }}</button>
          <button class="dialog-btn primary" @click="saveSnapshot" :disabled="!snapshotName.trim()">{{ t('btnSave') }}</button>
        </div>
      </div>
    </div>

    <!-- Settings Dialog -->
    <div v-if="showSettings" class="dialog-overlay" @click.self="showSettings = false">
      <div class="dialog settings-dialog">
        <h3>{{ t('dialogSettings') }}</h3>
        <div class="settings-section">
          <label class="settings-label">{{ t('labelApiKey') }}</label>
          <input
            v-model="apiKeyValue"
            type="password"
            :placeholder="t('apiKeyPlaceholder')"
            class="dialog-input"
            @keyup.enter="saveSettings"
          />
          <p class="settings-hint">{{ t('apiKeyHint') }}</p>
        </div>
        <div v-if="subscription" class="settings-section">
          <label class="settings-label">{{ t('labelSubscription') }}</label>
          <div class="settings-plan">
            <span class="plan-name">{{ subscription.plan }}</span>
            <span v-if="isPro" class="pro-badge inline">PRO</span>
            <span v-else class="free-badge">FREE</span>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="dialog-btn" @click="showSettings = false">{{ t('btnCancel') }}</button>
          <button class="dialog-btn primary" @click="saveSettings" :disabled="!apiKeyValue.trim()">{{ t('btnSaveKey') }}</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useTabs } from '~/composables/useTabs';
import { useSnapshots } from '~/composables/useSnapshots';
import {
  groupTabsByCategory,
  findDuplicateTabs,
  filterTabs,
  type TabInfo,
  type TabCategory,
  type ClassifiedTab,
  type Snapshot,
} from '~/utils/tab-utils';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '~/utils/ai-prompts';
import { classifyTabs, searchTabsAI, getApiKey, setApiKey as saveApiKey } from '~/utils/openai-client';
import type { SearchResult } from '~/utils/openai-client';
import { getSubscriptionState, refreshSubscription, type SubscriptionState } from '~/utils/subscription';
import { canUseFeature, incrementUsage, getUsageSummary } from '~/utils/usage-tracker';
import { t, CATEGORY_I18N_KEYS } from '~/utils/i18n';
import TabCard from './TabCard.vue';

const { tabs, activeTabId, loading, refreshTabs, activateTab, closeTab, closeTabs, pinTab } = useTabs();
const {
  snapshots,
  saveSnapshot: saveSnapshotFn,
  deleteSnapshot: deleteSnapshotFn,
  restoreSnapshot: restoreSnapshotFn,
  MAX_FREE_SNAPSHOTS,
} = useSnapshots();

// State
const searchQuery = ref('');
const activeCategory = ref<TabCategory | null>(null);
const isDark = ref(false);
const searchMatchIds = ref(new Set<number>());
const showSnapshotDialog = ref(false);
const snapshotName = ref('');
const snapshotInput = ref<HTMLInputElement | null>(null);
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null);

// Subscription & AI state
const subscription = ref<SubscriptionState | null>(null);
const isPro = computed(() => subscription.value?.isPro ?? false);
const aiClassifying = ref(false);
const aiClassifiedResults = ref<Map<number, ClassifiedTab>>(new Map());
const aiSearchMode = ref(false);
const aiSearchResults = ref<SearchResult[]>([]);
const aiSearching = ref(false);
const aiSearchEnabled = ref(false);
const apiKeyValue = ref('');
const showSettings = ref(false);
const usageInfo = ref<{ classification: { used: number; limit: number | string }; search: { used: number; limit: number | string } } | null>(null);

// Computed
const categories = CATEGORIES;
const categoryLabels = computed(() => {
  const labels: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    labels[cat] = t(CATEGORY_I18N_KEYS[cat] || 'catOther');
  }
  return labels;
});
const categoryIcons = CATEGORY_ICONS;

const pinnedTabs = computed(() => tabs.value.filter(t => t.pinned));
const unpinnedTabs = computed(() => tabs.value.filter(t => !t.pinned));

const classifiedTabs = computed<ClassifiedTab[]>(() => {
  const aiResults = aiClassifiedResults.value;
  return unpinnedTabs.value.map(tab => {
    const aiResult = aiResults.get(tab.id);
    if (aiResult) return aiResult;
    return {
      ...tab,
      category: classifyByPattern(tab) as TabCategory,
      confidence: 0.7,
    };
  });
});

const visibleCategories = computed(() => {
  if (activeCategory.value) return [activeCategory.value];
  return categories.filter(cat => getCategoryCount(cat) > 0);
});

const uncategorizedTabs = computed(() => {
  return classifiedTabs.value.filter(t => t.category === 'other');
});

const filteredTabs = computed(() => {
  // AI search mode: show results sorted by relevance
  if (aiSearchMode.value && aiSearchResults.value.length > 0) {
    const matchedIds = new Set(aiSearchResults.value.map(r => r.id));
    return classifiedTabs.value
      .filter(t => matchedIds.has(t.id))
      .sort((a, b) => {
        const aRel = aiSearchResults.value.find(r => r.id === a.id)?.relevance ?? 0;
        const bRel = aiSearchResults.value.find(r => r.id === b.id)?.relevance ?? 0;
        return bRel - aRel;
      });
  }

  let result = classifiedTabs.value;
  if (activeCategory.value) {
    result = result.filter(t => t.category === activeCategory.value);
  }
  if (searchQuery.value) {
    result = filterTabs(result, searchQuery.value);
  }
  return result;
});

// Methods
function getCategoryCount(cat: TabCategory): number {
  return classifiedTabs.value.filter(t => t.category === cat).length;
}

function getCategoryTabs(cat: TabCategory): TabInfo[] {
  return classifiedTabs.value.filter(t => t.category === cat);
}

function classifyByPattern(tab: TabInfo): string {
  const url = tab.url.toLowerCase();
  const title = tab.title.toLowerCase();

  // Work patterns
  if (/github\.com|gitlab\.com|bitbucket\.org|jira\.|notion\.so|linear\.app|slack\.com|trello\.com/.test(url)) return 'work';
  if (/docs\.google\.com|sheets\.google\.com|slides\.google\.com|calendar\.google\.com/.test(url)) return 'work';

  // Social patterns
  if (/twitter\.com|x\.com|facebook\.com|instagram\.com|linkedin\.com|reddit\.com|discord\.com/.test(url)) return 'social';
  if (/web\.whatsapp\.com|telegram\.org|t\.me/.test(url)) return 'social';

  // Shopping patterns
  if (/amazon\.|ebay\.|etsy\.|shopify\.|walmart\.|bestbuy\./.test(url)) return 'shopping';

  // Entertainment patterns
  if (/youtube\.com|netflix\.com|twitch\.tv|spotify\.com|open\.spotify\.com/.test(url)) return 'entertainment';
  if (/hulu\.com|disneyplus\.com|hbo.*\.com/.test(url)) return 'entertainment';

  // News patterns
  if (/techcrunch\.com|theverge\.com|arstechnica\.com|wired\.com|bbc\.com|cnn\.com|reuters\.com/.test(url)) return 'news';

  // Research patterns
  if (/stackoverflow\.com|stackexchange\.com|dev\.to|medium\.com|hacker-news\.com|news\.ycombinator\.com/.test(url)) return 'research';
  if (/en\.wikipedia\.org|docs\..*\.com|developer\..*\.com/.test(url)) return 'research';

  return 'other';
}

/**
 * Trigger AI classification for all tabs.
 * Requires API key and available usage (free tier limit).
 */
async function runAIClassification() {
  const allTabs = unpinnedTabs.value;
  if (allTabs.length === 0) return;

  const hasKey = await getApiKey();
  if (!hasKey) return;

  const { allowed } = await canUseFeature('classification', isPro.value);
  if (!allowed) {
    showToast(t('toastAIClassifyLimit'), 'error');
    return;
  }

  aiClassifying.value = true;
  try {
    const results = await classifyTabs(allTabs);
    if (results && results.length > 0) {
      const map = new Map<number, ClassifiedTab>();
      for (const r of results) {
        const tab = allTabs.find(t => t.id === r.id);
        if (tab) {
          map.set(tab.id, { ...tab, category: r.category, confidence: r.confidence });
        }
      }
      aiClassifiedResults.value = map;
      await incrementUsage('classification');
      await loadUsageInfo();
      showToast(t('toastAIClassified', String(results.length)), 'success');
    }
  } catch (err: any) {
    showToast(t('toastAIClassifyFailed', err.message || 'Unknown error'), 'error');
  } finally {
    aiClassifying.value = false;
  }
}

/**
 * AI-powered natural language tab search.
 */
async function runAISearch() {
  const query = searchQuery.value.trim();
  if (!query) {
    aiSearchMode.value = false;
    aiSearchResults.value = [];
    return;
  }

  const hasKey = await getApiKey();
  if (!hasKey) {
    // Fall back to text search — no API key
    aiSearchMode.value = false;
    onSearch();
    return;
  }

  const { allowed } = await canUseFeature('search', isPro.value);
  if (!allowed) {
    showToast(t('toastAISearchLimit'), 'error');
    aiSearchMode.value = false;
    onSearch();
    return;
  }

  aiSearching.value = true;
  aiSearchMode.value = true;
  try {
    const results = await searchTabsAI(query, tabs.value);
    if (results && results.length > 0) {
      aiSearchResults.value = results;
      searchMatchIds.value = new Set(results.map(r => r.id));
      await incrementUsage('search');
      await loadUsageInfo();
    } else {
      aiSearchMode.value = false;
      onSearch();
    }
  } catch (err: any) {
    showToast(t('toastAISearchFailed'), 'error');
    aiSearchMode.value = false;
    onSearch();
  } finally {
    aiSearching.value = false;
  }
}

function onSearch() {
  if (!searchQuery.value) {
    searchMatchIds.value = new Set();
    aiSearchMode.value = false;
    aiSearchResults.value = [];
    return;
  }
  const matches = filterTabs(tabs.value, searchQuery.value);
  searchMatchIds.value = new Set(matches.map(t => t.id));
}

function clearSearch() {
  searchQuery.value = '';
  searchMatchIds.value = new Set();
  aiSearchMode.value = false;
  aiSearchResults.value = [];
}

let aiSearchDebounce: ReturnType<typeof setTimeout> | null = null;

function toggleAISearch() {
  aiSearchEnabled.value = !aiSearchEnabled.value;
  if (!aiSearchEnabled.value) {
    aiSearchMode.value = false;
    aiSearchResults.value = [];
    if (searchQuery.value) onSearch();
  }
}

function onAIInput() {
  if (aiSearchDebounce) clearTimeout(aiSearchDebounce);
  if (!searchQuery.value.trim()) {
    clearSearch();
    return;
  }
  aiSearchDebounce = setTimeout(() => {
    runAISearch();
  }, 500);
}

async function closeDuplicates() {
  const dupes = findDuplicateTabs(tabs.value);
  let closedCount = 0;
  for (const group of dupes) {
    const toClose = group.slice(1).map(t => t.id);
    if (toClose.length > 0) {
      await closeTabs(toClose);
      closedCount += toClose.length;
    }
  }
  showToast(t('toastClosedDupes', String(closedCount)), 'success');
}

async function closeInactive() {
  const closeable = tabs.value.filter(t => !t.pinned && !t.active).slice(0, 10);
  if (closeable.length > 0) {
    await closeTabs(closeable.map(t => t.id));
    showToast(t('toastClosedOld', String(closeable.length)), 'success');
  }
}

async function saveSnapshot() {
  if (!snapshotName.value.trim() || tabs.value.length === 0) return;

  const windowId = tabs.value[0]?.windowId || 1;
  const result = await saveSnapshotFn(snapshotName.value.trim(), tabs.value, windowId, isPro.value);

  if (result) {
    showToast(t('toastSnapshotSaved'), 'success');
    showSnapshotDialog.value = false;
    snapshotName.value = '';
  } else {
    showToast(t('toastSnapshotLimit', String(MAX_FREE_SNAPSHOTS)), 'error');
  }
}

async function deleteSnapshot(id: string) {
  await deleteSnapshotFn(id);
  showToast(t('toastSnapshotDeleted'), 'success');
}

async function restoreSnapshot(snapshot: Snapshot) {
  await restoreSnapshotFn(snapshot);
  showToast(t('toastSnapshotRestored', snapshot.name), 'success');
}

function toggleDark() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return t('timeJustNow');
  if (diff < 3600000) return t('timeMinutesAgo', String(Math.floor(diff / 60000)));
  if (diff < 86400000) return t('timeHoursAgo', String(Math.floor(diff / 3600000)));
  return new Date(timestamp).toLocaleDateString();
}

function showToast(message: string, type: 'success' | 'error') {
  toast.value = { message, type };
  setTimeout(() => { toast.value = null; }, 3000);
}

async function loadUsageInfo() {
  usageInfo.value = await getUsageSummary(isPro.value);
}

async function saveSettings() {
  if (apiKeyValue.value.trim()) {
    await saveApiKey(apiKeyValue.value.trim());
    showToast(t('toastKeySaved'), 'success');
    showSettings.value = false;
    // Trigger classification after setting key
    await runAIClassification();
  }
}

async function logout() {
  await refreshSubscription();
  showToast(t('toastSubRefreshed'), 'success');
}

// Init
onMounted(async () => {
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Load subscription status
  try {
    subscription.value = await getSubscriptionState();
  } catch {
    subscription.value = { plan: 'free', isPro: false, userId: 'anonymous' };
  }

  // Load API key for settings display
  const key = await getApiKey();
  if (key) apiKeyValue.value = key;

  // Load usage info
  await loadUsageInfo();

  await refreshTabs();
});
</script>

<style>
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #eef2f6;
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --accent: #07c160;
  --accent-hover: #05a850;
  --danger: #ef4444;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
}

.dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --text-primary: #e2e8f0;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border: #334155;
  --accent: #07c160;
  --accent-hover: #05a850;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.4;
}

.sidepanel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 20px;
}

.header h1 {
  font-size: 15px;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}

.icon-btn:hover {
  background: var(--bg-tertiary);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-btn.small {
  font-size: 12px;
  padding: 2px;
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-bar {
  position: relative;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}

.search-input {
  width: 100%;
  padding: 8px 60px 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(7,193,96,0.1);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
}

.categories {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.category-btn:hover {
  border-color: var(--accent);
}

.category-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.cat-count {
  background: rgba(0,0,0,0.1);
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 10px;
}

.tab-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.section {
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.quick-actions {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
}

.action-btn {
  flex: 1;
  padding: 8px 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.action-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.action-btn.primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.action-btn.primary:hover {
  background: var(--accent-hover);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.snapshots-section {
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  max-height: 150px;
  overflow-y: auto;
}

.snapshot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.snapshot-item:hover {
  background: var(--bg-tertiary);
}

.snapshot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.snapshot-name {
  font-weight: 500;
}

.snapshot-meta {
  font-size: 11px;
  color: var(--text-muted);
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 20px;
  width: 280px;
  box-shadow: var(--shadow-md);
}

.dialog h3 {
  margin-bottom: 12px;
  font-size: 15px;
}

.dialog-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  margin-bottom: 16px;
}

.dialog-input:focus {
  border-color: var(--accent);
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
}

.dialog-btn.primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.dialog-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  z-index: 200;
  box-shadow: var(--shadow-md);
}

.toast.success {
  background: var(--accent);
  color: white;
}

.toast.error {
  background: var(--danger);
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Pro Badge */
.pro-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.pro-badge.inline {
  margin-left: 6px;
}

.free-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-left: 6px;
}

/* AI Classify Button */
.ai-classify-btn {
  position: relative;
}

.ai-classify-btn:not(:disabled):hover {
  background: rgba(245, 158, 11, 0.15);
}

.ai-classify-btn.loading {
  opacity: 0.8;
}

/* Usage Bar */
.usage-bar {
  display: flex;
  gap: 12px;
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
  font-size: 10px;
  color: var(--text-muted);
}

.usage-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* AI Search Toggle & Search Controls */
.search-controls {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
}

.ai-search-toggle {
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
  opacity: 0.5;
  transition: all 0.15s;
}

.ai-search-toggle:hover {
  opacity: 1;
  background: var(--bg-tertiary);
}

.ai-search-toggle.active {
  opacity: 1;
  border-color: var(--accent);
  background: rgba(7, 193, 96, 0.1);
}

.search-input.ai-active {
  border-color: var(--accent);
}

.search-input.ai-active:focus {
  box-shadow: 0 0 0 3px rgba(7, 193, 96, 0.2);
}

.search-spinner {
  position: absolute;
  bottom: -18px;
  left: 12px;
  font-size: 10px;
  color: var(--accent);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Settings Dialog */
.settings-dialog {
  width: 320px;
}

.settings-section {
  margin-bottom: 16px;
}

.settings-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.settings-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.settings-plan {
  display: flex;
  align-items: center;
}

.plan-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}
</style>
