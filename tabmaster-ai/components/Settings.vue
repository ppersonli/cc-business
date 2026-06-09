<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadAISettings, saveAISettings, clearAISettings, type AISettings } from '~/utils/ai-client';
import { getAIUsageSummary } from '~/utils/subscription';

const apiKey = ref('');
const model = ref('gpt-4o-mini');
const saved = ref(false);
const showKey = ref(false);
const usage = ref<{ classifications: number; searches: number; classifyLimit: number; searchLimit: number; isPro: boolean } | null>(null);

onMounted(async () => {
  const settings = await loadAISettings();
  if (settings) {
    apiKey.value = settings.apiKey;
    model.value = settings.model || 'gpt-4o-mini';
  }
  usage.value = await getAIUsageSummary();
});

async function handleSave() {
  if (!apiKey.value.trim()) return;
  const settings: AISettings = {
    apiKey: apiKey.value.trim(),
    model: model.value,
    provider: 'openai',
  };
  await saveAISettings(settings);
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2000);
}

async function handleClear() {
  await clearAISettings();
  apiKey.value = '';
  saved.value = false;
}

function maskKey(key: string): string {
  if (key.length <= 8) return '***';
  return key.slice(0, 4) + '...' + key.slice(-4);
}
</script>

<template>
  <div class="settings">
    <div class="settings-header">⚙️ AI Settings</div>

    <div class="settings-section">
      <label class="label">OpenAI API Key</label>
      <div class="key-row">
        <input
          v-model="apiKey"
          :type="showKey ? 'text' : 'password'"
          placeholder="sk-..."
          class="key-input"
        />
        <button class="toggle-btn" @click="showKey = !showKey">
          {{ showKey ? 'Hide' : 'Show' }}
        </button>
      </div>
      <p class="hint">Your key is stored locally and never shared. Used for AI classification and search.</p>
    </div>

    <div class="settings-section">
      <label class="label">Model</label>
      <select v-model="model" class="model-select">
        <option value="gpt-4o-mini">GPT-4o Mini (recommended, $0.15/1M tokens)</option>
        <option value="gpt-4o">GPT-4o ($2.50/1M tokens)</option>
      </select>
    </div>

    <div class="actions">
      <button class="btn-save" @click="handleSave">{{ saved ? 'Saved!' : 'Save' }}</button>
      <button v-if="apiKey" class="btn-clear" @click="handleClear">Clear Key</button>
    </div>

    <div v-if="usage" class="usage-section">
      <div class="usage-header">AI Usage Today</div>
      <div class="usage-row">
        <span>Classifications</span>
        <span>{{ usage.isPro ? 'Unlimited' : `${usage.classifications} / ${usage.classifyLimit}` }}</span>
      </div>
      <div class="usage-row">
        <span>Searches</span>
        <span>{{ usage.isPro ? 'Unlimited' : `${usage.searches} / ${usage.searchLimit}` }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings { padding: 12px 0; }
.settings-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.settings-section { margin-bottom: 14px; }
.label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.key-row {
  display: flex;
  gap: 6px;
}
.key-input {
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: monospace;
}
.key-input:focus { border-color: var(--accent); outline: none; }
.toggle-btn {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}
.hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
.model-select {
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
}
.model-select:focus { border-color: var(--accent); outline: none; }
.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.btn-save {
  padding: 7px 18px;
  border-radius: 6px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-save:hover { opacity: 0.9; }
.btn-clear {
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}
.btn-clear:hover { border-color: var(--danger); color: var(--danger); }
.usage-section {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.usage-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.usage-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-primary);
  padding: 3px 0;
}
.usage-row span:last-child { color: var(--accent); font-weight: 600; }
</style>
