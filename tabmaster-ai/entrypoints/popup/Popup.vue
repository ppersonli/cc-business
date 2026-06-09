<script setup lang="ts">
async function openSidePanel() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.windowId) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    window.close();
  }
}
</script>

<template>
  <div class="popup">
    <div class="popup-header">🧠 TabMaster AI</div>
    <button class="popup-btn" @click="openSidePanel">Open Side Panel</button>
    <div class="popup-hint">Or press Ctrl+Shift+T</div>
  </div>
</template>

<style scoped>
.popup {
  width: 250px;
  padding: 16px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.popup-header {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.popup-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #07C160;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.popup-btn:hover { opacity: 0.9; }
.popup-hint {
  margin-top: 8px;
  font-size: 11px;
  color: #9ca3af;
}
</style>
