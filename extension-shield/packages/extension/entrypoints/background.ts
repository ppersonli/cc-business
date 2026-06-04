import {
  parseManifest,
  buildScanInput,
  generateScanReport,
  generateHtmlReport,
} from 'extension-shield-scanner';
import type { ParsedManifest, ScanReport } from 'extension-shield-scanner';
import type { InstalledExtension } from '~/utils/messages';

export default defineBackground(() => {
  console.log('ExtensionShield background service worker started');

  if (chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => {});
  }

  browser.runtime.onMessage.addListener(
    (
      message: { type: string; payload?: any },
      _sender: any,
      sendResponse: (response: any) => void
    ) => {
      switch (message.type) {
        case 'GET_INSTALLED_EXTENSIONS':
          handleGetInstalledExtensions().then(sendResponse);
          return true;
        case 'SCAN_INSTALLED':
          handleScanInstalled(message.payload.extensionId).then(sendResponse);
          return true;
        case 'SCAN_ALL_INSTALLED':
          handleScanAllInstalled().then(sendResponse);
          return true;
        case 'GET_SCAN_RESULT':
          handleGetScanResult(message.payload.scanId).then(sendResponse);
          return true;
        case 'GET_SCAN_HISTORY':
          handleGetScanHistory(message.payload).then(sendResponse);
          return true;
        case 'DELETE_SCAN_RESULT':
          handleDeleteScanResult(message.payload.scanId).then(sendResponse);
          return true;
        case 'EXPORT_REPORT':
          handleExportReport(message.payload).then(sendResponse);
          return true;
        default:
          return false;
      }
    }
  );
});

async function handleGetInstalledExtensions(): Promise<InstalledExtension[]> {
  const extensions = await chrome.management.getAll();
  return extensions
    .filter((ext) => ext.type === 'extension' && ext.id !== chrome.runtime.id)
    .map((ext) => ({
      id: ext.id,
      name: ext.name,
      description: ext.description || '',
      version: ext.version,
      icons: ext.icons || [],
      enabled: ext.enabled,
      type: ext.type,
      mayDisable: ext.mayDisable ?? true,
    }));
}

async function handleScanInstalled(extensionId: string): Promise<{
  success: boolean;
  report?: ScanReport;
  error?: string;
}> {
  try {
    const ext = await chrome.management.get(extensionId);
    if (!ext) return { success: false, error: 'Extension not found' };

    const manifest = await readExtensionManifest(extensionId);
    if (!manifest)
      return { success: false, error: 'Could not read extension manifest' };

    const files = await readExtensionFiles(extensionId, manifest);

    const scanInput = buildScanInput(manifest, files, {
      name: ext.name,
      version: ext.version,
      description: ext.description,
    });

    const report = generateScanReport(scanInput);
    await saveScanResult(extensionId, report);

    return { success: true, report };
  } catch (e: any) {
    return { success: false, error: e.message || 'Scan failed' };
  }
}

async function handleScanAllInstalled(): Promise<{
  success: boolean;
  reports?: ScanReport[];
  error?: string;
}> {
  const extensions = await chrome.management.getAll();
  const results: ScanReport[] = [];

  for (const ext of extensions) {
    if (ext.type !== 'extension' || ext.id === chrome.runtime.id) continue;
    const result = await handleScanInstalled(ext.id);
    if (result.success && result.report) results.push(result.report);
  }

  return { success: true, reports: results };
}

async function readExtensionManifest(
  extensionId: string
): Promise<ParsedManifest | null> {
  try {
    const response = await fetch(
      `chrome-extension://${extensionId}/manifest.json`
    );
    if (!response.ok) return null;
    const raw = await response.text();
    return parseManifest(raw);
  } catch {
    return null;
  }
}

async function readExtensionFiles(
  extensionId: string,
  manifest: ParsedManifest
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  const pathsToRead: string[] = [];

  if (manifest.background) {
    if (manifest.background.service_worker)
      pathsToRead.push(manifest.background.service_worker);
    if (manifest.background.scripts)
      pathsToRead.push(...manifest.background.scripts);
  }

  if (manifest.content_scripts) {
    for (const cs of manifest.content_scripts) {
      if (cs.js) pathsToRead.push(...cs.js);
    }
  }

  for (const path of pathsToRead) {
    try {
      const response = await fetch(
        `chrome-extension://${extensionId}/${path}`
      );
      if (response.ok) files[path] = await response.text();
    } catch {
      // Skip unreadable files
    }
  }

  return files;
}

async function saveScanResult(
  extensionId: string,
  report: ScanReport
): Promise<void> {
  const data = await browser.storage.local.get(['es_scanHistory']);
  const history: Record<string, ScanReport> = data.es_scanHistory || {};
  history[extensionId] = report;

  const entries = Object.entries(history);
  if (entries.length > 100) {
    const trimmed = entries.slice(-100);
    await browser.storage.local.set({
      es_scanHistory: Object.fromEntries(trimmed),
    });
  } else {
    await browser.storage.local.set({ es_scanHistory: history });
  }
}

async function handleGetScanResult(
  scanId: string
): Promise<ScanReport | null> {
  const data = await browser.storage.local.get(['es_scanHistory']);
  return data.es_scanHistory?.[scanId] || null;
}

async function handleGetScanHistory(params: {
  limit?: number;
  offset?: number;
}): Promise<ScanReport[]> {
  const data = await browser.storage.local.get(['es_scanHistory']);
  const history: Record<string, ScanReport> = data.es_scanHistory || {};
  const all = Object.values(history).sort(
    (a, b) =>
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
  );
  const offset = params.offset || 0;
  const limit = params.limit || 50;
  return all.slice(offset, offset + limit);
}

async function handleDeleteScanResult(
  scanId: string
): Promise<{ success: boolean }> {
  const data = await browser.storage.local.get(['es_scanHistory']);
  const history: Record<string, ScanReport> = data.es_scanHistory || {};
  delete history[scanId];
  await browser.storage.local.set({ es_scanHistory: history });
  return { success: true };
}

async function handleExportReport(params: {
  scanId: string;
  format: 'html' | 'json';
}): Promise<{
  success: boolean;
  content?: string;
  filename?: string;
  error?: string;
}> {
  const report = await handleGetScanResult(params.scanId);
  if (!report) return { success: false, error: 'Report not found' };

  if (params.format === 'json') {
    return {
      success: true,
      content: JSON.stringify(report, null, 2),
      filename: `extension-shield-${report.extensionName}-${report.id}.json`,
    };
  }

  const html = generateHtmlReport(report);
  return {
    success: true,
    content: html,
    filename: `extension-shield-${report.extensionName}-${report.id}.html`,
  };
}
