<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { openCheckout } from '~/utils/payment';
import { getSubscriptionState } from '~/utils/subscription';
import type { PlanType } from '~/utils/subscription';
import { getHistory, clearHistory, downloadScreenshot, type ScreenshotHistoryEntry } from '~/utils/screenshot';
import type { AnalysisMode } from '~/utils/ai-vision';

// State
const isLoading = ref(false);
const isCapturing = ref(false);
const screenshot = ref<string | null>(null);
const screenshotMeta = ref<{ url: string; title: string }>({ url: '', title: '' });
const selectedMode = ref<AnalysisMode | null>(null);
const analysisResult = ref<string | null>(null);
const error = ref<string | null>(null);
const usageCount = ref(0);
const usageLimit = ref(5);
const hasApiKey = ref(false);
const plan = ref<PlanType>('free');
const isPro = ref(false);
const upgrading = ref(false);
const copied = ref(false);

// Active section
const activeSection = ref<'capture' | 'history'>('capture');

// History
const history = ref<ScreenshotHistoryEntry[]>([]);
const selectedHistoryEntry = ref<ScreenshotHistoryEntry | null>(null);

// Upgrade modal
const showUpgradeModal = ref(false);
const selectedPlan = ref<'pro' | 'pro-byok' | 'pro-yearly'>('pro');

const limitReached = computed(() => !isPro.value && usageCount.value >= usageLimit.value);

const modes: { id: AnalysisMode; icon: string; label: string; desc: string }[] = [
  { id: 'describe', icon: ' ', label: 'Describe', desc: 'Detailed text description of the screenshot' },
  { id: 'code', icon: ' ', label: 'Generate Code', desc: 'HTML/CSS code that replicates the UI' },
  { id: 'ui-review', icon: ' ', label: 'UI Review', desc: 'Design feedback and improvement suggestions' },
];

onMounted(async () => {
  const [usage, settings, sub] = await Promise.all([
    sendMessage('GET_USAGE'),
    sendMessage('GET_SETTINGS'),
    getSubscriptionState(),
  ]);

  if (usage) {
    usageCount.value = usage.count;
    usageLimit.value = usage.limit;
  }
  hasApiKey.value = settings?.hasKey || false;
  plan.value = sub.plan;
  isPro.value = sub.isPro;

  history.value = await getHistory();
});

async function capture() {
  isCapturing.value = true;
  error.value = null;
  analysisResult.value = null;
  selectedMode.value = null;

  try {
    const result = await sendMessage('CAPTURE_SCREENSHOT');
    if (result?.success) {
      screenshot.value = result.dataUrl;
      screenshotMeta.value = { url: result.url, title: result.title };
    } else {
      error.value = result?.error || 'Failed to capture screenshot';
    }
  } catch {
    error.value = 'Failed to communicate with extension';
  } finally {
    isCapturing.value = false;
  }
}

async function analyze(mode: AnalysisMode) {
  if (!screenshot.value || isLoading.value) return;
  selectedMode.value = mode;
  isLoading.value = true;
  error.value = null;
  analysisResult.value = null;

  try {
    const result = await sendMessage('ANALYZE_SCREENSHOT', {
      imageDataUrl: screenshot.value,
      mode,
      url: screenshotMeta.value.url,
      title: screenshotMeta.value.title,
    });

    if (result?.success) {
      analysisResult.value = result.content;
      const usage = await sendMessage('GET_USAGE');
      if (usage) {
        usageCount.value = usage.count;
        usageLimit.value = usage.limit;
      }
      history.value = await getHistory();
    } else {
      if (result?.error === 'NO_API_KEY') {
        error.value = 'Please set your API key in settings first';
        hasApiKey.value = false;
      } else {
        error.value = result?.error || 'Analysis failed';
      }
    }
  } catch {
    error.value = 'Failed to communicate with extension';
  } finally {
    isLoading.value = false;
  }
}

function resetCapture() {
  screenshot.value = null;
  analysisResult.value = null;
  selectedMode.value = null;
  error.value = null;
}

function openSettings() {
  browser.runtime.openOptionsPage();
}

async function handleCopy() {
  if (!analysisResult.value) return;
  try {
    await navigator.clipboard.writeText(analysisResult.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {}
}

function handleDownload() {
  if (!screenshot.value) return;
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadScreenshot(screenshot.value, `screenmind-${ts}.png`);
}

async function handleClearHistory() {
  await clearHistory();
  history.value = [];
  selectedHistoryEntry.value = null;
}

function viewHistoryEntry(entry: ScreenshotHistoryEntry) {
  selectedHistoryEntry.value = entry;
}

function closeHistoryDetail() {
  selectedHistoryEntry.value = null;
}

function getModeLabel(mode: string): string {
  return modes.find(m => m.id === mode)?.label || mode;
}

function getModeIcon(mode: string): string {
  return modes.find(m => m.id === mode)?.icon || ' ';
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function handleUpgrade() {
  showUpgradeModal.value = true;
}

async function handleCheckout() {
  upgrading.value = true;
  try {
    showUpgradeModal.value = false;
    await openCheckout(selectedPlan.value);
  } catch {
    error.value = 'Failed to open checkout. Please try again.';
  } finally {
    upgrading.value = false;
  }
}

function closeUpgradeModal() {
  showUpgradeModal.value = false;
}

function sendMessage(type: string, payload?: any): Promise<any> {
  return browser.runtime.sendMessage({ type, payload });
}
</script>

<template>
  <div class="sidepanel">
    <header class="header">
      <div class="header-left">
        <h1>ScreenMind</h1>
        <span v-if="isPro" class="pro-badge">Pro</span>
        <span v-else class="usage">{{ usageCount }}/{{ usageLimit }} today</span>
      </div>
      <button class="settings-btn" @click="openSettings" title="Settings">&#9881;</button>
    </header>

    <div v-if="!isPro && limitReached" class="upgrade-banner">
      <span>Daily limit reached</span>
      <button class="upgrade-cta" @click="handleUpgrade">Upgrade to Pro</button>
    </div>

    <nav class="tabs">
      <button :class="{ active: activeSection === 'capture' }" @click="activeSection = 'capture'; selectedHistoryEntry = null">
        Capture & Analyze
      </button>
      <button :class="{ active: activeSection === 'history' }" @click="activeSection = 'history'">
        History ({{ history.length }})
      </button>
    </nav>

    <!-- Capture & Analyze Section -->
    <main v-if="activeSection === 'capture'" class="content">
      <!-- Capture Button -->
      <div v-if="!screenshot" class="capture-area">
        <button class="capture-btn" :disabled="isCapturing" @click="capture">
          {{ isCapturing ? 'Capturing...' : 'Capture Screenshot' }}
        </button>
        <p class="capture-hint">Captures the visible area of the current tab</p>
      </div>

      <!-- Screenshot Preview + Mode Selection -->
      <div v-else>
        <div class="preview-header">
          <span class="preview-title" :title="screenshotMeta.title">{{ screenshotMeta.title }}</span>
          <div class="preview-actions">
            <button class="action-btn" @click="handleDownload" title="Download">&#128229;</button>
            <button class="action-btn" @click="resetCapture" title="New capture">&#128260;</button>
          </div>
        </div>

        <div class="screenshot-preview">
          <img :src="screenshot" alt="Captured screenshot" />
        </div>

        <div class="mode-grid">
          <button
            v-for="m in modes"
            :key="m.id"
            :class="['mode-btn', { active: selectedMode === m.id, loading: isLoading && selectedMode === m.id }]"
            :disabled="isLoading || (!hasApiKey && !isPro)"
            @click="analyze(m.id)"
          >
            <span class="mode-icon">{{ isLoading && selectedMode === m.id ? '⏳' : m.icon }}</span>
            <span class="mode-label">{{ m.label }}</span>
            <span class="mode-desc">{{ m.desc }}</span>
          </button>
        </div>

        <div v-if="!hasApiKey && !isPro" class="no-key-hint">
          <button class="settings-link" @click="openSettings">Set API key to start analyzing</button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="error">
        {{ error }}
        <button v-if="error.includes('API key')" class="error-link" @click="openSettings">Open Settings</button>
      </div>

      <!-- Results -->
      <div v-if="analysisResult" class="result">
        <div class="result-header">
          <h2>{{ modes.find(m => m.id === selectedMode)?.label || 'Analysis' }}</h2>
          <button class="copy-btn" @click="handleCopy">{{ copied ? 'Copied!' : 'Copy' }}</button>
        </div>
        <div class="result-content" v-html="formatResult(analysisResult)"></div>
      </div>
    </main>

    <!-- History Section -->
    <main v-else class="content">
      <!-- History Detail View -->
      <div v-if="selectedHistoryEntry" class="history-detail">
        <div class="detail-header">
          <button class="back-btn" @click="closeHistoryDetail">&larr; Back</button>
          <span class="detail-mode">{{ getModeIcon(selectedHistoryEntry.analysisMode) }} {{ getModeLabel(selectedHistoryEntry.analysisMode) }}</span>
        </div>
        <div class="detail-meta">
          <h3>{{ selectedHistoryEntry.title }}</h3>
          <span class="detail-url">{{ selectedHistoryEntry.url }}</span>
          <span class="detail-time">{{ timeAgo(selectedHistoryEntry.timestamp) }}</span>
        </div>
        <div class="detail-content" v-html="formatResult(selectedHistoryEntry.result)"></div>
      </div>

      <!-- History List -->
      <div v-else>
        <div v-if="!history.length" class="empty">
          <p>No analysis history yet</p>
          <p class="empty-hint">Capture a screenshot to get started</p>
        </div>

        <div v-else class="history-list">
          <div class="history-actions">
            <button class="clear-btn" @click="handleClearHistory">Clear All</button>
          </div>
          <div
            v-for="entry in history"
            :key="entry.id"
            class="history-item"
            @click="viewHistoryEntry(entry)"
          >
            <div class="history-mode">{{ getModeIcon(entry.analysisMode) }}</div>
            <div class="history-info">
              <h4>{{ entry.title }}</h4>
              <span class="history-preview">{{ entry.result.slice(0, 80) }}...</span>
            </div>
            <span class="history-time">{{ timeAgo(entry.timestamp) }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Upgrade Modal -->
    <Transition name="modal">
      <div v-if="showUpgradeModal" class="modal-overlay" @click.self="closeUpgradeModal">
        <div class="modal">
          <button class="modal-close" @click="closeUpgradeModal">&times;</button>
          <h2 class="modal-title">Upgrade to Pro</h2>
          <p class="modal-subtitle">Unlimited screenshot analyses</p>

          <div class="plan-options">
            <div
              :class="['plan-card', { selected: selectedPlan === 'pro' }]"
              @click="selectedPlan = 'pro'"
            >
              <div class="plan-badge">No API Key</div>
              <div class="plan-name">Pro Hosted</div>
              <div class="plan-price">$9.99<span class="plan-period">/mo</span></div>
            </div>
            <div
              :class="['plan-card', { selected: selectedPlan === 'pro-byok' }]"
              @click="selectedPlan = 'pro-byok'"
            >
              <div class="plan-name">Pro BYOK</div>
              <div class="plan-price">$4.99<span class="plan-period">/mo</span></div>
              <div class="plan-desc">Use your own API key</div>
            </div>
          </div>

          <div class="feature-comparison">
            <div class="comparison-row comparison-header">
              <span>Feature</span><span>Free</span><span>Pro</span>
            </div>
            <div class="comparison-row">
              <span>Daily analyses</span><span>5</span><span>Unlimited</span>
            </div>
            <div class="comparison-row">
              <span>All analysis modes</span><span>Yes</span><span>Yes</span>
            </div>
            <div class="comparison-row">
              <span>History</span><span>10</span><span>100</span>
            </div>
            <div class="comparison-row">
              <span>Export</span><span>-</span><span>Yes</span>
            </div>
          </div>

          <button class="checkout-btn" :disabled="upgrading" @click="handleCheckout">
            {{ upgrading ? 'Redirecting...' : `Subscribe ${selectedPlan === 'pro-byok' ? '$4.99/mo' : '$9.99/mo'}` }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
function formatResult(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
</script>

<style scoped>
.sidepanel {
  width: 100vw;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 700;
}

.pro-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  padding: 2px 10px;
  border-radius: 10px;
}

.usage {
  font-size: 12px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.settings-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.15s;
}

.settings-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
}

.upgrade-banner {
  padding: 10px 20px;
  background: #fffbeb;
  border-bottom: 1px solid #fcd34d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #92400e;
}

.upgrade-cta {
  padding: 6px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.tabs button.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
  font-weight: 600;
}

.content {
  padding: 20px;
  flex: 1;
}

/* Capture Area */
.capture-area {
  text-align: center;
  padding: 40px 0;
}

.capture-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  padding: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.capture-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.capture-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.capture-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 10px;
}

/* Preview */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.preview-title {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.preview-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn:hover {
  background: #e5e7eb;
}

.screenshot-preview {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
  max-height: 300px;
}

.screenshot-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Mode Grid */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn:hover:not(:disabled) {
  border-color: #6366f1;
  background: #f0f0ff;
}

.mode-btn.active {
  border-color: #6366f1;
  background: #eef2ff;
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 24px;
}

.mode-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.mode-desc {
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
}

.no-key-hint {
  text-align: center;
  margin-top: 8px;
}

.settings-link {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

/* Error */
.error {
  margin-top: 16px;
  padding: 10px 14px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-link {
  background: none;
  border: none;
  color: #dc2626;
  text-decoration: underline;
  font-size: 12px;
  cursor: pointer;
}

/* Result */
.result {
  margin-top: 20px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-header h2 {
  font-size: 16px;
  margin: 0;
  color: #6366f1;
}

.copy-btn {
  padding: 6px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.copy-btn:hover {
  background: #e5e7eb;
}

.result-content {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
}

.result-content :deep(pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
  margin: 10px 0;
}

.result-content :deep(code) {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* History */
.empty {
  text-align: center;
  color: #9ca3af;
  padding: 60px 20px;
}

.empty p {
  font-size: 14px;
  margin: 0;
}

.empty-hint {
  font-size: 12px;
  margin-top: 6px !important;
  color: #d1d5db;
}

.history-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.clear-btn {
  padding: 4px 12px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 11px;
  color: #9ca3af;
  cursor: pointer;
}

.clear-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.history-item:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.history-mode {
  font-size: 24px;
  flex-shrink: 0;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-info h4 {
  font-size: 13px;
  margin: 0 0 3px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-preview {
  font-size: 11px;
  color: #9ca3af;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-time {
  font-size: 11px;
  color: #d1d5db;
  white-space: nowrap;
}

/* History Detail */
.history-detail {
  padding-top: 4px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  padding: 4px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.back-btn:hover {
  background: #e5e7eb;
}

.detail-mode {
  font-size: 13px;
  color: #6366f1;
  font-weight: 600;
}

.detail-meta {
  margin-bottom: 16px;
}

.detail-meta h3 {
  font-size: 15px;
  margin: 0 0 4px;
  color: #1f2937;
}

.detail-url {
  font-size: 11px;
  color: #9ca3af;
  display: block;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-time {
  font-size: 11px;
  color: #d1d5db;
}

.detail-content {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.detail-content :deep(pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
  margin: 10px 0;
}

.detail-content :deep(code) {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* Upgrade Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 400px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 22px;
  color: #9ca3af;
  cursor: pointer;
}

.modal-title {
  font-size: 18px;
  margin: 0 0 4px;
  text-align: center;
}

.modal-subtitle {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 18px;
}

.plan-options {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.plan-card {
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.plan-card.selected {
  border-color: #6366f1;
  background: #f0f0ff;
}

.plan-badge {
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: white;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.plan-name {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.plan-price {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.plan-period {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
}

.plan-desc {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
}

.feature-comparison {
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  padding: 6px 10px;
  font-size: 11px;
  border-bottom: 1px solid #f3f4f6;
}

.comparison-row:last-child { border-bottom: none; }

.comparison-header {
  background: #f9fafb;
  font-weight: 600;
  color: #6b7280;
  font-size: 10px;
  text-transform: uppercase;
}

.comparison-row span:nth-child(2) {
  text-align: center;
  color: #9ca3af;
}

.comparison-row span:nth-child(3) {
  text-align: center;
  color: #6366f1;
  font-weight: 600;
}

.checkout-btn {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
