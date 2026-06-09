<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSnapshots, type Snapshot } from '~/composables/useSnapshots';

const { snapshots, getSnapshots, deleteSnapshot, restoreSnapshot } = useSnapshots();

const emit = defineEmits<{
  save: [name: string];
}>();

const snapshotName = ref('');
const showSaveForm = ref(false);

onMounted(() => getSnapshots());

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function handleRestore(id: string) {
  await restoreSnapshot(id);
}

async function handleDelete(id: string) {
  await deleteSnapshot(id);
  await getSnapshots();
}

function handleSave() {
  if (!snapshotName.value.trim()) return;
  emit('save', snapshotName.value.trim());
  snapshotName.value = '';
  showSaveForm.value = false;
}
</script>

<template>
  <div class="snapshot-manager">
    <div class="snapshots-header">
      <span>📸 Snapshots ({{ snapshots.length }})</span>
      <button class="btn-sm" @click="showSaveForm = !showSaveForm">
        {{ showSaveForm ? 'Cancel' : '+ Save' }}
      </button>
    </div>

    <div v-if="showSaveForm" class="save-form">
      <input v-model="snapshotName" placeholder="Snapshot name..." class="save-input" @keyup.enter="handleSave" />
      <button class="btn-primary" @click="handleSave">Save</button>
    </div>

    <div class="snapshot-list">
      <div v-for="snap in snapshots" :key="snap.id" class="snapshot-item">
        <div class="snapshot-info">
          <div class="snapshot-name">{{ snap.name }}</div>
          <div class="snapshot-meta">{{ snap.tabs.length }} tabs · {{ formatDate(snap.createdAt) }}</div>
        </div>
        <div class="snapshot-actions">
          <button class="btn-icon" @click="handleRestore(snap.id)" title="Restore">↩</button>
          <button class="btn-icon btn-danger" @click="handleDelete(snap.id)" title="Delete">×</button>
        </div>
      </div>
      <div v-if="snapshots.length === 0" class="empty-state">No snapshots saved</div>
    </div>
  </div>
</template>

<style scoped>
.snapshot-manager { padding: 12px 0; }
.snapshots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.save-form {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.save-input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
}
.snapshot-list { display: flex; flex-direction: column; gap: 4px; }
.snapshot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.15s;
}
.snapshot-item:hover { background: var(--bg-hover); }
.snapshot-info { flex: 1; min-width: 0; }
.snapshot-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}
.snapshot-meta { font-size: 11px; color: var(--text-muted); }
.snapshot-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.snapshot-item:hover .snapshot-actions { opacity: 1; }
.btn-icon {
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 8px;
  font-size: 14px;
  color: var(--text-secondary);
}
.btn-icon:hover { border-color: var(--accent); color: var(--accent); }
.btn-danger:hover { border-color: var(--danger); color: var(--danger); }
.btn-sm {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
}
.btn-primary {
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: var(--accent);
  color: white;
  cursor: pointer;
  font-weight: 600;
}
.empty-state { text-align: center; padding: 16px; color: var(--text-muted); font-size: 13px; }
</style>
