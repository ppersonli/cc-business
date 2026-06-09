<script setup lang="ts">
const CATEGORIES = ['all', 'work', 'research', 'social', 'shopping', 'entertainment', 'news', 'other'] as const;

defineProps<{
  selected: string;
  counts?: Map<string, number>;
}>();

const emit = defineEmits<{ select: [category: string] }>();

function label(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}
</script>

<template>
  <div class="category-filter">
    <button
      v-for="cat in CATEGORIES"
      :key="cat"
      :class="['category-btn', { active: selected === cat }]"
      @click="emit('select', cat)"
    >
      {{ label(cat) }}
      <span v-if="counts?.has(cat)" class="count">{{ counts.get(cat) }}</span>
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0;
}
.category-btn {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.category-btn:hover { border-color: var(--accent); color: var(--accent); }
.category-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
.count { margin-left: 4px; opacity: 0.7; }
</style>
