<script setup lang="ts">
import { ref } from 'vue';

const query = ref('');
const emit = defineEmits<{
  search: [query: string];
  clear: [];
}>();

function handleInput() {
  if (query.value.trim()) {
    emit('search', query.value.trim());
  } else {
    emit('clear');
  }
}

function clear() {
  query.value = '';
  emit('clear');
}
</script>

<template>
  <div class="ai-search">
    <span class="search-icon">🔍</span>
    <input
      v-model="query"
      type="text"
      placeholder="Search tabs..."
      class="search-input"
      @input="handleInput"
    />
    <button v-if="query" class="clear-btn" @click="clear">×</button>
  </div>
</template>

<style scoped>
.ai-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  transition: border-color 0.15s;
}
.ai-search:focus-within { border-color: var(--accent); }
.search-icon { font-size: 14px; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}
.search-input::placeholder { color: var(--text-muted); }
.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}
.clear-btn:hover { color: var(--text-primary); }
</style>
