<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  extractExtension,
  parseManifest,
  buildScanInput,
  generateScanReport,
} from 'extension-shield-scanner';
import FileUploader from '../components/FileUploader.vue';

const router = useRouter();
const { t } = useI18n();

const scanning = ref(false);
const error = ref('');

function saveReport(report: Record<string, unknown>) {
  const stored = localStorage.getItem('es_reports');
  const reports: { id: string; report: Record<string, unknown> }[] = stored ? JSON.parse(stored) : [];
  reports.unshift({ id: report.id as string, report });
  // Keep last 50 reports
  if (reports.length > 50) reports.length = 50;
  localStorage.setItem('es_reports', JSON.stringify(reports));
}

async function handleUpload(file: File) {
  scanning.value = true;
  error.value = '';

  try {
    const buffer = await file.arrayBuffer();
    const extracted = await extractExtension(buffer);
    const manifest = parseManifest(JSON.stringify(extracted.manifest));
    const input = buildScanInput(manifest, extracted.files);
    const report = generateScanReport(input);

    saveReport(report as unknown as Record<string, unknown>);
    router.push(`/report/${report.id}`);
  } catch (err) {
    console.error('Scan error:', err);
    error.value = err instanceof Error ? err.message : t('upload.error');
  } finally {
    scanning.value = false;
  }
}
</script>

<template>
  <div style="padding:3rem 2rem;max-width:640px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:2rem;">
      <h1 style="font-size:1.75rem;font-weight:700;color:#f1f5f9;margin-bottom:0.5rem;">
        {{ t('upload.title') }}
      </h1>
      <p style="font-size:0.9375rem;color:#94a3b8;">
        {{ t('upload.subtitle') }}
      </p>
    </div>

    <FileUploader v-if="!scanning" @upload="handleUpload" />

    <!-- Scanning state -->
    <div
      v-if="scanning"
      :style="{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #1e293b',
      }"
    >
      <div :style="{
        width: '48px',
        height: '48px',
        border: '3px solid #1e293b',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        margin: '0 auto 1rem',
        animation: 'spin 1s linear infinite',
      }" />
      <p style="font-size:1rem;font-weight:600;color:#e2e8f0;">{{ t('upload.scanning') }}</p>
      <p style="font-size:0.75rem;color:#64748b;margin-top:0.5rem;">Analyzing permissions, CSP, secrets, and more...</p>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      :style="{
        marginTop: '1rem',
        padding: '1rem 1.25rem',
        background: '#7f1d1d',
        border: '1px solid #991b1b',
        borderRadius: '8px',
        color: '#fca5a5',
        fontSize: '0.875rem',
      }"
    >
      {{ error }}
    </div>

    <!-- Scan another -->
    <div v-if="error" style="text-align:center;margin-top:1rem;">
      <button
        style="padding:0.5rem 1.5rem;background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:8px;font-size:0.875rem;cursor:pointer;"
        @click="error = ''"
      >{{ t('upload.scanAnother') }}</button>
    </div>

    <!-- Inject keyframe for spinner -->
    <component :is="'style'">
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </component>
  </div>
</template>
