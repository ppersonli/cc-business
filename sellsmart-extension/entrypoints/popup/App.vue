<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { calculateProfit, PLATFORM_LABELS, type Platform, type ProfitResult } from '~/utils/fees';
import { getTranslation, detectLocale, type Locale } from '~/utils/i18n';
import { saveResearch, getHistory, deleteResearch, clearHistory, type ResearchEntry } from '~/utils/storage';

// State
const locale = ref<Locale>('en');
const darkMode = ref(false);
const activeTab = ref<'calculator' | 'history'>('calculator');

// Form
const costOfGoods = ref<string>('');
const sellingPrice = ref<string>('');
const shippingCost = ref<string>('0');
const platform = ref<Platform>('etsy');
const quantity = ref<string>('1');

// Results
const result = ref<ProfitResult | null>(null);
const history = ref<ResearchEntry[]>([]);

const t = computed(() => getTranslation(locale.value));

const platforms: Platform[] = ['etsy', 'amazon', 'shopify', 'tiktok'];

function doCalculate() {
  const cost = parseFloat(costOfGoods.value);
  const price = parseFloat(sellingPrice.value);
  const shipping = parseFloat(shippingCost.value) || 0;
  const qty = parseInt(quantity.value) || 1;

  if (isNaN(cost) || isNaN(price) || cost < 0 || price < 0) return;

  result.value = calculateProfit({
    costOfGoods: cost,
    sellingPrice: price,
    shippingCost: shipping,
    platform: platform.value,
    quantity: qty,
  });
}

function doClear() {
  costOfGoods.value = '';
  sellingPrice.value = '';
  shippingCost.value = '0';
  platform.value = 'etsy';
  quantity.value = '1';
  result.value = null;
}

async function doSave() {
  if (!result.value) return;
  await saveResearch({
    costOfGoods: parseFloat(costOfGoods.value),
    sellingPrice: parseFloat(sellingPrice.value),
    shippingCost: parseFloat(shippingCost.value) || 0,
    platform: platform.value,
    quantity: parseInt(quantity.value) || 1,
    profit: result.value.profit,
    margin: result.value.margin,
    roi: result.value.roi,
  });
  await loadHistory();
}

async function doDeleteEntry(id: string) {
  await deleteResearch(id);
  await loadHistory();
}

async function doClearHistory() {
  await clearHistory();
  history.value = [];
}

async function loadHistory() {
  history.value = await getHistory();
}

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(locale.value === 'en' ? 'en-US' : locale.value === 'pt' ? 'pt-BR' : 'es-MX', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function profitClass(value: number): string {
  return value >= 0 ? 'positive' : 'negative';
}

// Persist dark mode
watch(darkMode, (val) => {
  browser.storage.local.set({ sellsmart_dark: val });
});

// Persist locale
watch(locale, (val) => {
  browser.storage.local.set({ sellsmart_locale: val });
});

onMounted(async () => {
  const stored = await browser.storage.local.get(['sellsmart_dark', 'sellsmart_locale']);
  if (stored.sellsmart_dark) darkMode.value = true;
  if (stored.sellsmart_locale) locale.value = stored.sellsmart_locale;
  else locale.value = detectLocale();
  await loadHistory();
});
</script>

<template>
  <div class="popup" :class="{ dark: darkMode }">
    <!-- Header -->
    <header class="header">
      <div class="header-top">
        <div class="brand">
          <span class="logo">📊</span>
          <div>
            <h1 class="title">{{ t.appName }}</h1>
            <p class="subtitle">{{ t.tagline }}</p>
          </div>
        </div>
        <div class="header-controls">
          <select v-model="locale" class="locale-select">
            <option value="en">EN</option>
            <option value="pt">PT</option>
            <option value="es">ES</option>
          </select>
          <button class="icon-btn" :title="t.darkMode" @click="darkMode = !darkMode">
            {{ darkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <nav class="tabs">
        <button
          :class="['tab', { active: activeTab === 'calculator' }]"
          @click="activeTab = 'calculator'"
        >
          {{ t.tabCalculator }}
        </button>
        <button
          :class="['tab', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'"
        >
          {{ t.tabHistory }}
          <span v-if="history.length" class="badge">{{ history.length }}</span>
        </button>
      </nav>
    </header>

    <!-- Calculator Tab -->
    <main v-if="activeTab === 'calculator'" class="content">
      <div class="form">
        <div class="field">
          <label>{{ t.costOfGoods }}</label>
          <div class="input-group">
            <span class="prefix">$</span>
            <input v-model="costOfGoods" type="number" min="0" step="0.01" placeholder="0.00" />
          </div>
        </div>

        <div class="field">
          <label>{{ t.sellingPrice }}</label>
          <div class="input-group">
            <span class="prefix">$</span>
            <input v-model="sellingPrice" type="number" min="0" step="0.01" placeholder="0.00" />
          </div>
        </div>

        <div class="field">
          <label>{{ t.shippingCost }}</label>
          <div class="input-group">
            <span class="prefix">$</span>
            <input v-model="shippingCost" type="number" min="0" step="0.01" placeholder="0.00" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>{{ t.platform }}</label>
            <select v-model="platform">
              <option v-for="p in platforms" :key="p" :value="p">
                {{ PLATFORM_LABELS[p] }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>{{ t.quantity }}</label>
            <input v-model="quantity" type="number" min="1" step="1" placeholder="1" />
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="doCalculate">{{ t.calculate }}</button>
          <button class="btn-secondary" @click="doClear">{{ t.clear }}</button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="result" class="results">
        <h2 class="results-title">{{ t.results }}</h2>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">{{ t.revenue }}</span>
            <span class="value">{{ formatCurrency(result.revenue) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">{{ t.totalCost }}</span>
            <span class="value">{{ formatCurrency(result.totalCost) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">{{ t.totalFees }}</span>
            <span class="value fee">{{ formatCurrency(result.totalFees) }}</span>
          </div>
          <div :class="['summary-item', 'highlight', profitClass(result.profit)]">
            <span class="label">{{ t.profit }}</span>
            <span class="value">{{ formatCurrency(result.profit) }}</span>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric">
            <span class="metric-label">{{ t.margin }}</span>
            <span :class="['metric-value', profitClass(result.margin)]">{{ result.margin.toFixed(1) }}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">{{ t.roi }}</span>
            <span :class="['metric-value', profitClass(result.roi)]">{{ result.roi.toFixed(1) }}%</span>
          </div>
        </div>

        <!-- Fee Breakdown -->
        <div class="fee-breakdown">
          <h3>{{ t.feeBreakdown }} — {{ result.platformFees.label }}</h3>
          <div v-for="fee in result.platformFees.fees" :key="fee.name" class="fee-row">
            <span class="fee-name">{{ fee.name }}</span>
            <span class="fee-desc">{{ fee.description }}</span>
            <span class="fee-amount">{{ formatCurrency(fee.amount) }}</span>
          </div>
        </div>

        <button class="btn-save" @click="doSave">{{ t.saveToHistory }}</button>
      </div>
    </main>

    <!-- History Tab -->
    <main v-else class="content">
      <div v-if="history.length === 0" class="empty">
        <p>{{ t.noHistory }}</p>
      </div>
      <div v-else class="history">
        <div class="history-header">
          <span>{{ history.length }} {{ t.tabHistory.toLowerCase() }}</span>
          <button class="btn-clear" @click="doClearHistory">{{ t.clearHistory }}</button>
        </div>
        <div v-for="entry in history" :key="entry.id" class="history-entry">
          <div class="entry-top">
            <span class="entry-platform">{{ PLATFORM_LABELS[entry.platform] }}</span>
            <span class="entry-date">{{ formatDate(entry.timestamp) }}</span>
          </div>
          <div class="entry-details">
            <span>Cost: {{ formatCurrency(entry.costOfGoods) }} × {{ entry.quantity }}</span>
            <span>→</span>
            <span>Price: {{ formatCurrency(entry.sellingPrice) }}</span>
          </div>
          <div class="entry-result">
            <span :class="profitClass(entry.profit)">
              {{ formatCurrency(entry.profit) }} ({{ entry.margin.toFixed(1) }}% margin)
            </span>
            <button class="btn-delete" @click="doDeleteEntry(entry.id)">{{ t.deleteEntry }}</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.popup {
  width: 400px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  color: #1a1a2e;
  font-size: 13px;
  line-height: 1.4;
}

.popup.dark {
  background: #1a1a2e;
  color: #e0e0e0;
}

/* Header */
.header {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 14px 16px 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 24px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  font-size: 11px;
  opacity: 0.85;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.locale-select {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 11px;
  cursor: pointer;
}

.locale-select option {
  color: #1a1a2e;
  background: white;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 4px;
  padding: 3px 6px;
  cursor: pointer;
  font-size: 14px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-top: 12px;
}

.tab {
  flex: 1;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: white;
  border-bottom-color: white;
}

.tab:hover {
  color: white;
}

.badge {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  margin-left: 4px;
}

/* Content */
.content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.dark .field label {
  color: #9ca3af;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.dark .input-group {
  border-color: #374151;
  background: #2d2d44;
}

.prefix {
  padding: 0 8px;
  color: #9ca3af;
  font-size: 13px;
  background: #f3f4f6;
  height: 36px;
  display: flex;
  align-items: center;
}

.dark .prefix {
  background: #252540;
  color: #6b7280;
}

input, select {
  width: 100%;
  padding: 8px 10px;
  border: none;
  font-size: 13px;
  background: transparent;
  color: #1a1a2e;
  outline: none;
}

.dark input, .dark select {
  color: #e0e0e0;
}

select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 10px;
  background: white;
  cursor: pointer;
}

.dark select {
  border-color: #374151;
  background: #2d2d44;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #e5e7eb;
  color: #4b5563;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 13px;
  cursor: pointer;
}

.dark .btn-secondary {
  background: #374151;
  color: #d1d5db;
}

/* Results */
.results {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.dark .results {
  border-top-color: #374151;
}

.results-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  background: #f3f4f6;
  border-radius: 6px;
}

.dark .summary-item {
  background: #2d2d44;
}

.summary-item .label {
  font-size: 11px;
  color: #6b7280;
}

.dark .summary-item .label {
  color: #9ca3af;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 700;
}

.summary-item.highlight {
  grid-column: 1 / -1;
}

.summary-item.highlight .value {
  font-size: 20px;
}

.summary-item .value.fee {
  color: #ef4444;
}

.positive .value, .metric-value.positive {
  color: #10b981;
}

.negative .value, .metric-value.negative {
  color: #ef4444;
}

.metrics-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.metric {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 6px;
}

.dark .metric {
  background: #2d2d44;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
}

.dark .metric-label {
  color: #9ca3af;
}

.metric-value {
  font-size: 14px;
  font-weight: 700;
}

/* Fee Breakdown */
.fee-breakdown {
  margin-top: 12px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.dark .fee-breakdown {
  background: #252540;
  border-color: #374151;
}

.fee-breakdown h3 {
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #6b7280;
}

.dark .fee-breakdown h3 {
  color: #9ca3af;
}

.fee-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.fee-name {
  font-weight: 500;
  min-width: 120px;
}

.fee-desc {
  flex: 1;
  color: #9ca3af;
  font-size: 11px;
}

.fee-amount {
  font-weight: 600;
  color: #ef4444;
}

.btn-save {
  width: 100%;
  margin-top: 12px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.dark .btn-save {
  background: #1e3a5f;
  border-color: #2563eb;
  color: #60a5fa;
}

/* History */
.empty {
  text-align: center;
  padding: 40px 16px;
  color: #9ca3af;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #6b7280;
}

.dark .history-header {
  color: #9ca3af;
}

.btn-clear {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
}

.history-entry {
  padding: 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.dark .history-entry {
  background: #2d2d44;
  border-color: #374151;
}

.entry-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.entry-platform {
  font-weight: 600;
  font-size: 12px;
  color: #10b981;
}

.entry-date {
  font-size: 11px;
  color: #9ca3af;
}

.entry-details {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 6px;
  align-items: center;
}

.dark .entry-details {
  color: #9ca3af;
}

.entry-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-weight: 600;
  font-size: 13px;
}

.entry-result .positive {
  color: #10b981;
}

.entry-result .negative {
  color: #ef4444;
}

.btn-delete {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;
}

.btn-delete:hover {
  color: #ef4444;
}
</style>
