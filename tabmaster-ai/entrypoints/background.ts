export default defineBackground(() => {
  console.log('TabMaster AI background service worker started');

  // Open side panel on extension icon click
  if (chrome.action) {
    chrome.action.onClicked.addListener(async (tab) => {
      if (tab.id) {
        await chrome.sidePanel.open({ tabId: tab.id });
      }
    });
  }

  // Listen for tab activation to track last active time
  const tabActivationTimes = new Map<number, number>();

  if (chrome.tabs) {
    chrome.tabs.onActivated.addListener(({ tabId }) => {
      tabActivationTimes.set(tabId, Date.now());
    });

    // Periodically save activation times to storage
    setInterval(() => {
      const times: Record<string, number> = {};
      tabActivationTimes.forEach((time, id) => {
        times[String(id)] = time;
      });
      chrome.storage.local.set({ tabActivationTimes: times });
    }, 60000); // Every minute
  }
});
