<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { AVAILABLE_MODELS, validateApiKey } from '~/utils/ai';
import { openCheckout } from '~/utils/payment';
import { getSubscriptionState } from '~/utils/subscription';
import type { AiProvider } from '~/utils/ai';
import type { PlanType } from '~/utils/subscription';

const provider = ref<AiProvider>('openai');
const apiKey = ref('');
const model = ref('gpt-4o-mini');
const saved = ref(false);
const validating = ref(false);
const validationResult = ref<{ ok: boolean; msg: string } | null>(null);

const plan = ref<PlanType>('free');
const isPro = ref(false);
const expiresAt = ref<number | undefined>();
const upgrading = ref(false);

const models = computed(() => AVAILABLE_MODELS[provider.value] || []);

const expiryFormatted = computed(() => {
  if (!expiresAt.value) return '';
  return new Date(expiresAt.value).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
});

watch(provider, (p) => {
  model.value = AVAILABLE_MODELS[p][0].id;
  validationResult.value = null;
});

onMounted(async () => {
  const [data, sub] = await Promise.all([
    browser.storage.sync.get(['aiProvider', 'aiApiKey', 'aiModel']),
    getSubscriptionState(),
  ]);

  if (data.aiProvider) provider.value = data.aiProvider;
  if (data.aiApiKey) apiKey.value = data.aiApiKey;
  if (data.aiModel) model.value = data.aiModel;

  plan.value = sub.plan;
  isPro.value = sub.isPro;
  expiresAt.value = sub.expiresAt;
});

async function saveSettings() {
  await browser.storage.sync.set({
    aiProvider: provider.value,
    aiApiKey: apiKey.value.trim(),
    aiModel: model.value,
  });
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2000);
}

async function testKey() {
  if (!apiKey.value.trim()) return;
  validating.value = true;
  validationResult.value = null;

  const result = await validateApiKey(provider.value, apiKey.value.trim(), model.value);
  validationResult.value = result.valid
    ? { ok: true, msg: 'API key is valid' }
    : { ok: false, msg: result.error || 'Validation failed' };

  validating.value = false;
}

async function clearSettings() {
  apiKey.value = '';
  await browser.storage.sync.remove(['aiApiKey']);
  validationResult.value = null;
}

async function handleUpgrade() {
  upgrading.value = true;
  try {
    await openCheckout();
  } catch {
    validationResult.value = { ok: false, msg: 'Failed to open checkout. Please try again.' };
  } finally {
    upgrading.value = false;
  }
}
</script>

<template>
  <div class="settings-page">
    <header class="header">
      <h1>SnapGen — Settings</h1>
    </header>

    <main class="form">
      <section class="field">
        <label>AI Provider</label>
        <div class="radio-group">
          <label class="radio-label" :class="{ selected: provider === 'openai' }">
            <input type="radio" v-model="provider" value="openai" />
            OpenAI
          </label>
          <label class="radio-label" :class="{ selected: provider === 'claude' }">
            <input type="radio" v-model="provider" value="claude" />
            Claude (Anthropic)
          </label>
        </div>
      </section>

      <section class="field">
        <label>Model</label>
        <select v-model="model">
          <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </section>

      <section class="field">
        <label>API Key</label>
        <div class="key-row">
          <input
            type="password"
            v-model="apiKey"
            :placeholder="provider === 'openai' ? 'sk-...' : 'sk-ant-...'"
            spellcheck="false"
            autocomplete="off"
          />
          <button class="btn-clear" @click="clearSettings" title="Clear key" v-if="apiKey">Clear</button>
        </div>
        <p class="hint">
          {{ provider === 'openai'
            ? 'Get your key at platform.openai.com/api-keys'
            : 'Get your key at console.anthropic.com/settings/keys' }}
        </p>
      </section>

      <section class="actions">
        <button class="btn-test" :disabled="!apiKey.trim() || validating" @click="testKey">
          {{ validating ? 'Testing...' : 'Test Key' }}
        </button>
        <button class="btn-save" @click="saveSettings">
          {{ saved ? 'Saved!' : 'Save Settings' }}
        </button>
      </section>

      <div v-if="validationResult" class="validation" :class="{ ok: validationResult.ok, error: !validationResult.ok }">
        {{ validationResult.msg }}
      </div>

      <section class="subscription-section">
        <h3>Subscription</h3>
        <div v-if="isPro" class="sub-card sub-pro">
          <div class="sub-info">
            <span class="sub-plan">Pro Plan</span>
            <span class="sub-detail">Unlimited screenshot analyses</span>
            <span v-if="expiryFormatted" class="sub-detail">Renews {{ expiryFormatted }}</span>
          </div>
          <span class="sub-badge">Active</span>
        </div>
        <div v-else class="sub-card sub-free">
          <div class="sub-info">
            <span class="sub-plan">Free Plan</span>
            <span class="sub-detail">5 analyses per day</span>
          </div>
          <button class="btn-upgrade" :disabled="upgrading" @click="handleUpgrade">
            {{ upgrading ? 'Opening...' : 'Upgrade to Pro' }}
          </button>
        </div>
      </section>

      <section class="info">
        <h3>How it works</h3>
        <ul>
          <li>Your API key is stored locally in your browser via <code>chrome.storage.sync</code></li>
          <li>Key is synced across your Chrome devices if sync is enabled</li>
          <li>API calls go directly from your browser to the provider — no intermediary servers</li>
          <li>Free tier: 5 screenshot analyses per day</li>
        </ul>
      </section>
    </main>
    <div style="text-align:center; padding:16px; font-size:12px; color:#9ca3af;">
      <a href="https://pixiaoli.cn" target="_blank" rel="noopener noreferrer" style="color:#9ca3af; text-decoration:none;">pixiaoli.cn — Create manga with AI</a>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 520px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
  min-height: 100vh;
  background: #f9fafb;
}

.header {
  padding: 24px 24px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.header h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}

.radio-label.selected {
  border-color: #6366f1;
  background: #eef2ff;
  color: #6366f1;
}

.radio-label input {
  display: none;
}

select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.key-row {
  display: flex;
  gap: 8px;
}

.key-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, monospace;
}

.btn-clear {
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: #6b7280;
}

.hint {
  font-size: 11px;
  color: #9ca3af;
  margin: 4px 0 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-test,
.btn-save {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-test {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-test:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.validation {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.validation.ok {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.validation.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.subscription-section h3 {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 10px;
}

.sub-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
}

.sub-pro {
  border-color: #fcd34d;
  background: linear-gradient(135deg, #fffbeb 0%, #fef9ee 100%);
}

.sub-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sub-plan {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.sub-detail {
  font-size: 11px;
  color: #6b7280;
}

.sub-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 10px;
}

.btn-upgrade {
  padding: 8px 18px;
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-upgrade:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info {
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.info h3 {
  font-size: 13px;
  margin: 0 0 8px;
  color: #374151;
}

.info ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

.info code {
  background: #f3f4f6;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}
</style>
