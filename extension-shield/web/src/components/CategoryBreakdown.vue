<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { CategoryReport } from 'extension-shield-scanner';

const { t } = useI18n();
defineProps<{ categories: CategoryReport[] }>();

function barColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 50) return '#f97316';
  if (score >= 20) return '#eab308';
  return '#22c55e';
}

function categoryLabel(cat: string): string {
  const key = `categories.${cat}`;
  const translated = t(key);
  return translated !== key ? translated : cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:0.625rem;">
    <div
      v-for="cat in categories"
      :key="cat.category"
      style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;"
    >
      <span style="width:130px;font-size:0.8125rem;font-weight:500;color:#cbd5e1;">
        {{ categoryLabel(cat.category) }}
      </span>
      <div style="flex:1;height:8px;background:#1e293b;border-radius:4px;overflow:hidden;">
        <div
          :style="{
            height: '100%',
            width: cat.score + '%',
            background: barColor(cat.score),
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }"
        />
      </div>
      <span style="width:32px;text-align:right;font-weight:600;font-size:0.8125rem;color:#e2e8f0;">
        {{ cat.score }}
      </span>
      <span style="width:80px;font-size:0.6875rem;color:#64748b;">
        {{ cat.findings.length }} finding{{ cat.findings.length !== 1 ? 's' : '' }}
      </span>
    </div>
  </div>
</template>
