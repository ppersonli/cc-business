<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
</script>

<template>
  <div style="display:flex;flex-direction:column;min-height:100vh;background:#0b1120;color:#e2e8f0;">
    <!-- Header -->
    <header
      style="display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:64px;background:#0f172a;border-bottom:1px solid #1e293b;position:sticky;top:0;z-index:100;"
    >
      <router-link
        to="/"
        style="display:flex;align-items:center;gap:0.5rem;text-decoration:none;color:#e2e8f0;font-weight:700;font-size:1.125rem;"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2L4 7v7c0 6.075 4.25 11.75 10 13 5.75-1.25 10-6.925 10-13V7L14 2z" fill="#3b82f6" />
          <path d="M14 6L8 8.5v5c0 4.05 2.75 7.8 6 8.6 3.25-.8 6-4.55 6-8.6v-5L14 6z" fill="#1e3a5f" />
          <path d="M11 14l2 2 4-4" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ExtensionShield
      </router-link>
      <nav style="display:flex;gap:1.5rem;">
        <router-link
          to="/upload"
          style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.2s;"
          @mouseenter="($event.target as HTMLElement).style.color='#60a5fa'"
          @mouseleave="($event.target as HTMLElement).style.color='#94a3b8'"
        >{{ t('nav.scan') }}</router-link>
        <router-link
          to="/history"
          style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.2s;"
          @mouseenter="($event.target as HTMLElement).style.color='#60a5fa'"
          @mouseleave="($event.target as HTMLElement).style.color='#94a3b8'"
        >{{ t('nav.history') }}</router-link>
        <router-link
          to="/pricing"
          style="color:#94a3b8;text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.2s;"
          @mouseenter="($event.target as HTMLElement).style.color='#60a5fa'"
          @mouseleave="($event.target as HTMLElement).style.color='#94a3b8'"
        >{{ t('nav.pricing') }}</router-link>
      </nav>
    </header>

    <!-- Main Content -->
    <main style="flex:1;">
      <router-view />
    </main>

    <!-- Footer -->
    <footer
      style="padding:1.5rem 2rem;background:#0f172a;border-top:1px solid #1e293b;text-align:center;"
    >
      <p style="font-size:0.75rem;color:#64748b;">
        &copy; {{ new Date().getFullYear() }} {{ t('footer.copyright') }}
      </p>
      <p style="font-size:0.6875rem;color:#475569;margin-top:0.25rem;">
        {{ t('footer.tagline') }}
      </p>
    </footer>
  </div>
</template>
