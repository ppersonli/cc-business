import { loadSettings } from '~/utils/ai';
import { getSubscriptionState, getDailyUsage, canUse, incrementUsage } from '~/utils/subscription';
import { analyzeScreenshot, type AnalysisMode } from '~/utils/ai-vision';
import { saveToHistory, type CapturedScreenshot } from '~/utils/screenshot';

export default defineBackground(() => {
  console.log('SnapGen background service worker started');

  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }

  if (chrome.commands) {
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'capture-screenshot') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {});
          }
        });
      }
    });
  }

  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install' || reason === 'update') {
      browser.contextMenus?.create({
        id: 'analyze-screenshot',
        title: 'SnapGen: Capture & Analyze',
        contexts: ['page'],
      });
    }
  });

  browser.contextMenus?.onClicked.addListener(async (_info, tab) => {
    if (tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
    }
  });

  browser.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: (response: any) => void) => {
    switch (message.type) {
      case 'CAPTURE_SCREENSHOT':
        handleCapture().then(sendResponse);
        return true;

      case 'ANALYZE_SCREENSHOT':
        handleAnalyze(message.payload).then(sendResponse);
        return true;

      case 'GET_USAGE':
        getDailyUsage().then(sendResponse);
        return true;

      case 'GET_SUBSCRIPTION':
        getSubscriptionState().then(s => sendResponse({
          plan: s.plan,
          isPro: s.isPro,
          expiresAt: s.expiresAt,
        }));
        return true;

      case 'GET_SETTINGS':
        loadSettings().then(s => {
          sendResponse({ hasKey: !!s, provider: s?.provider, model: s?.model });
        });
        return true;

      default:
        return false;
    }
  });
});

async function handleCapture() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab) return { success: false, error: 'No active tab found' };

    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 100,
    });

    return {
      success: true,
      dataUrl,
      url: tab.url || '',
      title: tab.title || 'Untitled',
      timestamp: Date.now(),
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to capture screenshot' };
  }
}

async function handleAnalyze(payload: {
  imageDataUrl: string;
  mode: AnalysisMode;
  url: string;
  title: string;
}) {
  const settings = await loadSettings();
  if (!settings) {
    return { success: false, error: 'NO_API_KEY' };
  }

  const usage = await canUse();
  if (!usage.allowed) {
    return { success: false, error: 'Daily limit reached (5/day). Upgrade to Pro for unlimited.' };
  }

  try {
    await incrementUsage();
    const result = await analyzeScreenshot(payload.imageDataUrl, payload.mode, settings);

    await saveToHistory({
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      thumbnail: payload.imageDataUrl.slice(0, 200),
      analysisMode: payload.mode,
      result: result.content,
      url: payload.url,
      title: payload.title,
      timestamp: Date.now(),
    });

    return { success: true, ...result };
  } catch (e: any) {
    const code = e.code || 'unknown';
    if (code === 'invalid_key') return { success: false, error: 'NO_API_KEY' };
    if (code === 'rate_limit') return { success: false, error: 'Rate limit exceeded — try again in a few minutes' };
    if (code === 'quota') return { success: false, error: 'API quota exceeded — check your billing settings' };
    if (code === 'network') return { success: false, error: 'Network error — check your internet connection' };
    return { success: false, error: e.message || 'Analysis failed' };
  }
}
