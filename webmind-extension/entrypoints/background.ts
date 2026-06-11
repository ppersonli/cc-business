export default defineBackground(() => {
  console.log('WebMind background service worker started');

  // Create context menu for highlighting
  chrome.contextMenus.create({
    id: 'webmind-highlight',
    title: 'Highlight with WebMind',
    contexts: ['selection'],
  });

  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'webmind-highlight' && info.selectionText && tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'HIGHLIGHT_SELECTION',
        text: info.selectionText,
      });
    }
  });

  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_HIGHLIGHT') {
      chrome.storage.local.get('webmind_highlights', (result) => {
        const highlights = result.webmind_highlights || [];
        highlights.push(message.highlight);
        chrome.storage.local.set({ webmind_highlights: highlights }, () => {
          sendResponse({ success: true });
        });
      });
      return true; // async response
    }
  });
});
