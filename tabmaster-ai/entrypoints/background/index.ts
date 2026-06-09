export default defineBackground(() => {
  console.log('TabMaster AI background service worker started');

  // Open side panel when extension icon is clicked
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
  });

  // Also handle the keyboard command
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === '_execute_side_panel') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
    }
  });
});
