<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ score: number }>();

const clampedScore = computed(() => Math.max(0, Math.min(100, props.score)));

const gaugeColor = computed(() => {
  if (clampedScore.value <= 20) return '#22c55e';
  if (clampedScore.value <= 50) return '#eab308';
  if (clampedScore.value <= 80) return '#f97316';
  return '#ef4444';
});

const riskLabel = computed(() => {
  if (clampedScore.value <= 20) return 'Low';
  if (clampedScore.value <= 50) return 'Medium';
  if (clampedScore.value <= 80) return 'High';
  return 'Critical';
});

const circumference = 2 * Math.PI * 54;
const dashOffset = computed(() => circumference - (clampedScore.value / 100) * circumference);
</script>

<template>
  <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
    <svg width="140" height="140" viewBox="0 0 120 120">
      <!-- Background circle -->
      <circle
        cx="60" cy="60" r="54"
        fill="none"
        stroke="#1e293b"
        stroke-width="10"
      />
      <!-- Score arc -->
      <circle
        cx="60" cy="60" r="54"
        fill="none"
        :stroke="gaugeColor"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 60 60)"
        style="transition: stroke-dashoffset 0.8s ease, stroke 0.3s ease;"
      />
      <!-- Score text -->
      <text
        x="60" y="55"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="gaugeColor"
        font-size="28"
        font-weight="800"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >{{ clampedScore }}</text>
      <!-- Label -->
      <text
        x="60" y="78"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="gaugeColor"
        font-size="11"
        font-weight="600"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        text-transform="uppercase"
      >{{ riskLabel }}</text>
    </svg>
  </div>
</template>
