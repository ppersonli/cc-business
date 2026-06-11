<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAllHighlights, removeHighlightFromStorage, getHighlightStats } from '~/utils/storage';
import { searchHighlights, groupHighlightsByPage, getRecentHighlights } from '~/utils/search';
import { exportAsJSON, exportAsHTML } from '~/utils/export';
import { truncateText, extractDomain, formatDate } from '~/utils/dom-utils';
import type { Highlight } from '~/utils/highlight-utils';
import { HIGHLIGHT_COLORS } from '~/utils/highlight-utils';

const highlights = ref<Highlight[]>([]);
const searchQuery = ref('');
const stats = ref({ total: 0, pages: 0 });
const activeView = ref<'all' | 'recent' | 'search'>('all');
const selectedPage = ref<string | null>(null);

const filteredHighlights = computed(() => {
  if (searchQuery.value.trim()) {
    activeView.value = 'search';
    return searchHighlights(highlights.value, searchQuery.value);
  }
  if (selectedPage.value) {
    return highlights.value.filter(h => h.url === selectedPage.value);
  }
  return highlights.value;
});

const groupedHighlights = computed(() => groupHighlightsByPage(filteredHighlights.value));
const recentHighlights = computed(() => getRecentHighlights(highlights.value, 10));

async function loadData() {
  highlights.value = await getAllHighlights();
  stats.value = await getHighlightStats();
}

async function removeHighlight(id: string) {
  await removeHighlightFromStorage(id);
  await loadData();
}

function exportJSON() {
  const json = exportAsJSON(filteredHighlights.value);
  downloadFile(json, 'webmind-highlights.json', 'application/json');
}

function exportHTML() {
  const html = exportAsHTML(filteredHighlights.value);
  downloadFile(html, 'webmind-highlights.html', 'text/html');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getColorStyle(colorName: string) {
  const color = HIGHLIGHT_COLORS.find(c => c.name === colorName) || HIGHLIGHT_COLORS[0];
  return { backgroundColor: color.rgba };
}

onMounted(loadData);
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
        <span>WebMind</span>
      </div>
      <div class="stats">
        <span class="stat">{{ stats.total }} highlights</span>
        <span class="stat-sep">·</span>
        <span class="stat">{{ stats.pages }} pages</span>
      </div>
    </header>

    <!-- Search -->
    <div class="search-bar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search highlights..."
        class="search-input"
      />
    </div>

    <!-- View tabs -->
    <div class="tabs">
      <button :class="['tab', { active: activeView === 'all' && !selectedPage }]" @click="activeView = 'all'; selectedPage = null">
        All
      </button>
      <button :class="['tab', { active: activeView === 'recent' }]" @click="activeView = 'recent'; selectedPage = null">
        Recent
      </button>
    </div>

    <!-- Export buttons -->
    <div class="actions">
      <button class="btn-export" @click="exportJSON" title="Export as JSON">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        JSON
      </button>
      <button class="btn-export" @click="exportHTML" title="Export as HTML">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        HTML
      </button>
    </div>

    <!-- Highlights list -->
    <div class="highlights-list">
      <template v-if="activeView === 'recent'">
        <div v-for="h in recentHighlights" :key="h.id" class="highlight-card">
          <div class="highlight-color" :style="getColorStyle(h.color)" />
          <div class="highlight-content">
            <p class="highlight-text">{{ truncateText(h.text, 120) }}</p>
            <p class="highlight-meta">{{ extractDomain(h.url) }} · {{ formatDate(h.createdAt) }}</p>
          </div>
          <button class="btn-delete" @click="removeHighlight(h.id)" title="Delete">&times;</button>
        </div>
      </template>
      <template v-else>
        <template v-for="(pageHighlights, url) in groupedHighlights" :key="url">
          <div class="page-group">
            <button class="page-header" @click="selectedPage = selectedPage === url ? null : (url as string)">
              <span class="page-domain">{{ extractDomain(url as string) }}</span>
              <span class="page-title">{{ pageHighlights[0]?.title }}</span>
              <span class="page-count">{{ pageHighlights.length }}</span>
            </button>
            <div v-if="selectedPage === url || !selectedPage" class="page-highlights">
              <div v-for="h in pageHighlights" :key="h.id" class="highlight-card">
                <div class="highlight-color" :style="getColorStyle(h.color)" />
                <div class="highlight-content">
                  <p class="highlight-text">{{ truncateText(h.text, 120) }}</p>
                  <p v-if="h.note" class="highlight-note">{{ h.note }}</p>
                  <p class="highlight-meta">{{ formatDate(h.createdAt) }}</p>
                </div>
                <button class="btn-delete" @click="removeHighlight(h.id)" title="Delete">&times;</button>
              </div>
            </div>
          </div>
        </template>
      </template>

      <div v-if="filteredHighlights.length === 0" class="empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
        <p>No highlights yet</p>
        <p class="empty-hint">Select text on any page and right-click to highlight</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app { padding: 12px; }

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 12px; border-bottom: 1px solid var(--wm-border);
}

.logo {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 700; color: var(--wm-primary);
}

.stats { display: flex; align-items: center; gap: 6px; }
.stat { font-size: 12px; color: var(--wm-text-muted); }
.stat-sep { color: var(--wm-border); }

.search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; margin: 10px 0;
  background: var(--wm-bg-secondary); border: 1px solid var(--wm-border);
  border-radius: 8px; color: var(--wm-text-muted);
}

.search-input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--wm-text); font-size: 13px;
}
.search-input::placeholder { color: var(--wm-text-muted); }

.tabs {
  display: flex; gap: 4px; margin-bottom: 10px;
}

.tab {
  padding: 5px 14px; border: 1px solid var(--wm-border);
  border-radius: 16px; background: none; color: var(--wm-text-muted);
  font-size: 12px; cursor: pointer; transition: all 0.15s;
}
.tab.active {
  background: var(--wm-primary); border-color: var(--wm-primary);
  color: #fff;
}

.actions {
  display: flex; gap: 6px; margin-bottom: 12px;
}

.btn-export {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 10px; border: 1px solid var(--wm-border);
  border-radius: 6px; background: none; color: var(--wm-text-muted);
  font-size: 12px; cursor: pointer; transition: all 0.15s;
}
.btn-export:hover { border-color: var(--wm-primary); color: var(--wm-primary); }

.highlights-list { max-height: 380px; overflow-y: auto; }

.page-group { margin-bottom: 8px; }

.page-header {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 8px 10px; background: var(--wm-bg-secondary);
  border: 1px solid var(--wm-border); border-radius: 8px;
  cursor: pointer; font-size: 13px; color: var(--wm-text);
  transition: all 0.15s;
}
.page-header:hover { border-color: var(--wm-primary); }
.page-domain { font-weight: 600; color: var(--wm-primary-light); }
.page-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--wm-text-muted); font-size: 12px; }
.page-count {
  background: var(--wm-bg); padding: 2px 8px; border-radius: 10px;
  font-size: 11px; color: var(--wm-text-muted);
}

.page-highlights { padding: 4px 0 4px 12px; }

.highlight-card {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px; margin: 4px 0;
  border-radius: 8px; transition: background 0.15s;
}
.highlight-card:hover { background: var(--wm-bg-secondary); }

.highlight-color {
  width: 4px; min-height: 32px; border-radius: 2px; flex-shrink: 0;
}

.highlight-content { flex: 1; min-width: 0; }
.highlight-text { font-size: 13px; line-height: 1.5; margin-bottom: 4px; }
.highlight-note { font-size: 12px; color: var(--wm-primary-light); font-style: italic; margin-bottom: 2px; }
.highlight-meta { font-size: 11px; color: var(--wm-text-muted); }

.btn-delete {
  padding: 2px 6px; background: none; border: none;
  color: var(--wm-text-muted); font-size: 16px; cursor: pointer;
  border-radius: 4px; transition: all 0.15s; opacity: 0;
}
.highlight-card:hover .btn-delete { opacity: 1; }
.btn-delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.empty {
  text-align: center; padding: 40px 20px; color: var(--wm-text-muted);
}
.empty p { margin-top: 8px; font-size: 14px; }
.empty-hint { font-size: 12px; color: var(--wm-text-muted); opacity: 0.7; }
</style>
