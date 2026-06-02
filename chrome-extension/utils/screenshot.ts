export interface CapturedScreenshot {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
  url: string;
  title: string;
}

export interface ScreenshotHistoryEntry {
  id: string;
  thumbnail: string;
  analysisMode: string;
  result: string;
  url: string;
  title: string;
  timestamp: number;
}

export async function captureVisibleTab(): Promise<CapturedScreenshot> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error('No active tab found');

  const dataUrl = await chrome.tabs.captureVisibleTab(null, {
    format: 'png',
    quality: 100,
  });

  const dimensions = await getImageDimensions(dataUrl);

  return {
    dataUrl,
    width: dimensions.width,
    height: dimensions.height,
    timestamp: Date.now(),
    url: tab.url || '',
    title: tab.title || 'Untitled',
  };
}

export async function cropScreenshot(
  dataUrl: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

  return canvas.toDataURL('image/png');
}

export function compressForApi(dataUrl: string, maxWidth = 1920, quality = 0.85): string {
  const canvas = document.createElement('canvas');
  const img = new Image();

  return new Promise<string>((resolve) => {
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  }) as any;
}

export function downloadScreenshot(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function saveToHistory(entry: ScreenshotHistoryEntry): Promise<void> {
  const { screenshotHistory = [] } = await browser.storage.local.get('screenshotHistory');
  const history = screenshotHistory as ScreenshotHistoryEntry[];
  history.unshift(entry);
  await browser.storage.local.set({ screenshotHistory: history.slice(0, 100) });
}

export async function getHistory(): Promise<ScreenshotHistoryEntry[]> {
  const { screenshotHistory = [] } = await browser.storage.local.get('screenshotHistory');
  return screenshotHistory as ScreenshotHistoryEntry[];
}

export async function clearHistory(): Promise<void> {
  await browser.storage.local.set({ screenshotHistory: [] });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
