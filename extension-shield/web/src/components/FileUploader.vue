<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{ upload: [file: File] }>();
const isDragging = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) emit('upload', file);
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) emit('upload', file);
  target.value = '';
}

function openPicker() {
  inputRef.value?.click();
}
</script>

<template>
  <div
    :style="{
      border: `2px dashed ${isDragging ? '#3b82f6' : '#334155'}`,
      borderRadius: '12px',
      padding: '3rem 2rem',
      textAlign: 'center',
      cursor: 'pointer',
      background: isDragging ? '#1e293b' : '#0f172a',
      transition: 'all 0.2s ease',
    }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="openPicker"
  >
    <input
      ref="inputRef"
      type="file"
      accept=".crx,.zip"
      style="display:none;"
      @change="onFileChange"
    />
    <div style="margin-bottom:1rem;">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:0 auto;">
        <rect x="8" y="4" width="32" height="40" rx="4" stroke="#475569" stroke-width="2" fill="none" />
        <path d="M18 24l6-6 6 6" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <line x1="24" y1="18" x2="24" y2="34" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
    <p style="font-size:1rem;font-weight:600;color:#e2e8f0;margin-bottom:0.5rem;">
      {{ isDragging ? 'Drop file here' : 'Drop your .crx or .zip file here, or click to browse' }}
    </p>
    <p style="font-size:0.75rem;color:#64748b;">Accepted formats: .crx, .zip</p>
  </div>
</template>
