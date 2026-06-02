<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { openCheckout } from '~/utils/payment';
import { getSubscriptionState } from '~/utils/subscription';
import type { PlanType } from '~/utils/subscription';
import { downloadScreenshot } from '~/utils/screenshot';
import type { AnalysisMode } from '~/utils/ai-vision';

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

// Upgrade modal
const showUpgradeModal = ref(false);
const selectedPlan = ref<'pro' | 'pro-byok' | 'pro-yearly'>('pro');

const limitReached = computed(() => !isPro.value && usageCount.value >= usageLimit.value);

const modes: { id: AnalysisMode; icon: string; label: string; desc: string }[] = [
  { id: 'describe', icon: ' ', label: 'Describe', desc: 'Detailed text description' },
  { id: 'code', icon: ' ', label: 'Generate Code', desc: 'HTML/CSS from screenshot' },
  { id: 'ui-review', icon: ' ', label: 'UI Review', desc: 'Design feedback & tips' },
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
  <div class="popup">
    <header class="header">
      <h1>ScreenMind</h1>
      <div class="header-right">
        <span v-if="isPro" class="pro-badge">Pro</span>
        <div v-else class="usage">
          {{ usageCount }}/{{ usageLimit }} today
        </div>
        <button class="settings-btn" @click="openSettings" title="Settings">&#9881;</button>
      </div>
    </header>

    <div v-if="!isPro && limitReached" class="upgrade-banner">
      <div class="upgrade-banner-text">
        <strong>Daily limit reached</strong>
        <span>Upgrade for unlimited analyses</span>
      </div>
      <button class="upgrade-cta" @click="handleUpgrade">Upgrade</button>
    </div>

    <main class="content">
      <!-- Capture Button (no screenshot yet) -->
      <div v-if="!screenshot" class="capture-area">
        <button class="capture-btn" :disabled="isCapturing" @click="capture">
          <span class="capture-icon">{{ isCapturing ? ' ' : ' ' }}</span>
          {{ isCapturing ? 'Capturing...' : 'Capture Screenshot' }}
        </button>
        <p class="capture-hint">Captures the visible area of the current tab</p>
      </div>

      <!-- Screenshot Preview + Mode Selection -->
      <div v-else class="preview-area">
        <div class="preview-header">
          <span class="preview-title" :title="screenshotMeta.title">{{ screenshotMeta.title }}</span>
          <div class="preview-actions">
            <button class="action-btn" @click="handleDownload" title="Download screenshot">&#128229;</button>
            <button class="action-btn recapture" @click="resetCapture" title="New capture">&#128260;</button>
          </div>
        </div>

        <div class="screenshot-preview">
          <img :src="screenshot" alt="Captured screenshot" />
        </div>

        <!-- Analysis Mode Buttons -->
        <div class="mode-grid">
          <button
            v-for="m in modes"
            :key="m.id"
            :class="['mode-btn', { active: selectedMode === m.id, loading: isLoading && selectedMode === m.id }]"
            :disabled="isLoading || (!hasApiKey && !isPro)"
            @click="analyze(m.id)"
          >
            <span class="mode-icon">{{ isLoading && selectedMode === m.id ? ' ' : m.icon }}</span>
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
          <div class="result-actions">
            <button class="copy-btn" @click="handleCopy">{{ copied ? 'Copied!' : 'Copy' }}</button>
          </div>
        </div>
        <div class="result-content" v-html="formatResult(analysisResult)"></div>
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
.popup {
  width: 400px;
  min-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.header h1 {
  font-size: 16px;
  margin: 0;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pro-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  font-size: 16px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.15s;
}

.settings-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
}

.upgrade-banner {
  padding: 10px 16px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-bottom: 1px solid #fcd34d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.upgrade-banner-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.upgrade-banner-text strong {
  font-size: 12px;
  color: #92400e;
}

.upgrade-banner-text span {
  font-size: 11px;
  color: #b45309;
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

.content {
  padding: 16px;
}

/* Capture Area */
.capture-area {
  text-align: center;
  padding: 20px 0;
}

.capture-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.capture-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.capture-btn:active:not(:disabled) {
  transform: translateY(0);
}

.capture-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.capture-icon {
  font-size: 18px;
}

.capture-hint {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
}

/* Preview Area */
.preview-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
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
  transition: all 0.15s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.screenshot-preview {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  max-height: 180px;
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
  gap: 8px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 6px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
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

.mode-btn.loading {
  border-color: #6366f1;
  background: #eef2ff;
}

.mode-icon {
  font-size: 20px;
}

.mode-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
}

.mode-desc {
  font-size: 9px;
  color: #9ca3af;
  text-align: center;
}

.no-key-hint {
  text-align: center;
}

.settings-link {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}

/* Error */
.error {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.error-link {
  background: none;
  border: none;
  color: #dc2626;
  text-decoration: underline;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

/* Result */
.result {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-header h2 {
  font-size: 14px;
  margin: 0;
  color: #6366f1;
}

.copy-btn {
  padding: 4px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.result-content {
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.result-content :deep(pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 10px 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  margin: 8px 0;
}

.result-content :deep(code) {
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
  width: 360px;
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
  color: #1f2937;
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
