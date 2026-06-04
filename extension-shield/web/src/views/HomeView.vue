<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const features = [
  { key: 'featurePermissions', icon: 'shield' },
  { key: 'featureCasa', icon: 'clipboard' },
  { key: 'featureSecrets', icon: 'key' },
  { key: 'featureRemoteCode', icon: 'code' },
  { key: 'featureCsp', icon: 'lock' },
  { key: 'featureObfuscation', icon: 'eye' },
];

const iconPaths: Record<string, string> = {
  shield: 'M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z',
  clipboard: 'M9 2h6a1 1 0 011 1v1H8V3a1 1 0 011-1zM6 4h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z',
  key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  lock: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
};
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section
      :style="{
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0b1120 0%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }"
    >
      <!-- Subtle grid pattern -->
      <div :style="{
        position: 'absolute',
        inset: '0',
        backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: '0.3',
      }" />
      <div style="position:relative;max-width:720px;margin:0 auto;">
        <div style="display:inline-block;padding:0.25rem 0.75rem;background:#1e293b;border-radius:999px;font-size:0.75rem;color:#60a5fa;margin-bottom:1.5rem;font-weight:500;">
          100% Client-Side Security Scanning
        </div>
        <h1 style="font-size:2.75rem;font-weight:800;color:#f1f5f9;line-height:1.15;margin-bottom:1rem;letter-spacing:-0.02em;">
          {{ t('home.heroTitle') }}
        </h1>
        <p style="font-size:1.125rem;color:#94a3b8;line-height:1.7;max-width:560px;margin:0 auto 2.5rem;">
          {{ t('home.heroSubtitle') }}
        </p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <button
            style="padding:0.75rem 2rem;background:#3b82f6;color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.2s;"
            @mouseenter="($event.target as HTMLElement).style.background='#2563eb'"
            @mouseleave="($event.target as HTMLElement).style.background='#3b82f6'"
            @click="router.push('/upload')"
          >{{ t('home.ctaScan') }}</button>
          <button
            style="padding:0.75rem 2rem;background:transparent;color:#94a3b8;border:1px solid #334155;border-radius:8px;font-size:1rem;font-weight:500;cursor:pointer;transition:all 0.2s;"
            @mouseenter="($event.target as HTMLElement).style.borderColor='#60a5fa';($event.target as HTMLElement).style.color='#60a5fa'"
            @mouseleave="($event.target as HTMLElement).style.borderColor='#334155';($event.target as HTMLElement).style.color='#94a3b8'"
            @click="router.push('/pricing')"
          >{{ t('home.ctaPricing') }}</button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section style="padding:4rem 2rem;max-width:1080px;margin:0 auto;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:1.5rem;">
        <div
          v-for="feature in features"
          :key="feature.key"
          :style="{
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '1.5rem',
            transition: 'border-color 0.2s',
          }"
          @mouseenter="($event.currentTarget as HTMLElement).style.borderColor='#334155'"
          @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#1e293b'"
        >
          <div
            :style="{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="iconPaths[feature.icon]" />
            </svg>
          </div>
          <h3 style="font-size:1rem;font-weight:600;color:#e2e8f0;margin-bottom:0.5rem;">
            {{ t(`home.${feature.key}.title`) }}
          </h3>
          <p style="font-size:0.8125rem;color:#94a3b8;line-height:1.6;">
            {{ t(`home.${feature.key}.desc`) }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
