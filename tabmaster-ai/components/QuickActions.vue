<script setup lang="ts">
const emit = defineEmits<{
  closeDuplicate: [];
  closeStale: [];
  closeAllExceptPinned: [];
  newSnapshot: [];
}>();
</script>

<template>
  <div class="quick-actions">
    <div class="actions-header">⚡ Quick Actions</div>
    <div class="actions-grid">
      <button class="action-btn" @click="emit('closeDuplicate')">
        <span class="action-icon">📋</span>
        <span>Close Dupes</span>
      </button>
      <button class="action-btn" @click="emit('closeStale')">
        <span class="action-icon">⏰</span>
        <span>Close Old</span>
      </button>
      <button class="action-btn" @click="emit('closeAllExceptPinned')">
        <span class="action-icon">📌</span>
        <span>Keep Pinned</span>
      </button>
      <button class="action-btn" @click="emit('newSnapshot')">
        <span class="action-icon">📸</span>
        <span>New Snapshot</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-actions { padding: 12px 0; }
.actions-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
}
.action-btn:hover {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.action-icon { font-size: 16px; }
</style>
