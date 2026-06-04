<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const tiers = [
  {
    key: 'singleScan',
    highlighted: false,
    features: ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'],
  },
  {
    key: 'pro',
    highlighted: true,
    features: ['feature1', 'feature2', 'feature3', 'feature4', 'feature5'],
  },
];
</script>

<template>
  <div style="padding:3rem 2rem;max-width:820px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:3rem;">
      <h1 style="font-size:1.75rem;font-weight:700;color:#f1f5f9;margin-bottom:0.5rem;">
        {{ t('pricing.title') }}
      </h1>
      <p style="font-size:0.9375rem;color:#94a3b8;">
        {{ t('pricing.subtitle') }}
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:1.5rem;">
      <div
        v-for="tier in tiers"
        :key="tier.key"
        :style="{
          background: tier.highlighted ? '#111827' : '#0f172a',
          border: tier.highlighted ? '2px solid #3b82f6' : '1px solid #1e293b',
          borderRadius: '16px',
          padding: '2rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <!-- Badge -->
        <div
          v-if="tier.highlighted"
          style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);padding:0.125rem 0.75rem;background:#3b82f6;color:white;font-size:0.6875rem;font-weight:700;border-radius:999px;text-transform:uppercase;letter-spacing:0.05em;"
        >{{ t(`pricing.${tier.key}.badge`) }}</div>

        <!-- Plan name -->
        <h3 style="font-size:1rem;font-weight:600;color:#94a3b8;margin-bottom:0.75rem;">
          {{ t(`pricing.${tier.key}.name`) }}
        </h3>

        <!-- Price -->
        <div style="display:flex;align-items:baseline;gap:0.25rem;margin-bottom:1.5rem;">
          <span :style="{ fontSize: '2.5rem', fontWeight: '800', color: tier.highlighted ? '#60a5fa' : '#e2e8f0' }">
            {{ t(`pricing.${tier.key}.price`) }}
          </span>
          <span style="font-size:0.875rem;color:#64748b;">{{ t(`pricing.${tier.key}.period`) }}</span>
        </div>

        <!-- Features -->
        <ul style="list-style:none;padding:0;margin:0 0 2rem 0;flex:1;">
          <li
            v-for="f in tier.features"
            :key="f"
            style="display:flex;align-items:center;gap:0.625rem;padding:0.5rem 0;font-size:0.8125rem;color:#cbd5e1;"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;">
              <path d="M4 8l3 3 5-5" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ t(`pricing.${tier.key}.${f}`) }}
          </li>
        </ul>

        <!-- CTA -->
        <button
          :style="{
            padding: '0.75rem 1.5rem',
            background: tier.highlighted ? '#3b82f6' : '#1e293b',
            color: tier.highlighted ? 'white' : '#e2e8f0',
            border: tier.highlighted ? 'none' : '1px solid #334155',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
            width: '100%',
          }"
          @mouseenter="($event.target as HTMLElement).style.background = tier.highlighted ? '#2563eb' : '#334155'"
          @mouseleave="($event.target as HTMLElement).style.background = tier.highlighted ? '#3b82f6' : '#1e293b'"
          @click="router.push('/upload')"
        >{{ t(`pricing.${tier.key}.cta`) }}</button>
      </div>
    </div>

    <p style="text-align:center;font-size:0.75rem;color:#475569;margin-top:2rem;">
      {{ t('pricing.guarantee') }}
    </p>
  </div>
</template>
