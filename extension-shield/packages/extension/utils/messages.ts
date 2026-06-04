import type { ScanReport } from 'extension-shield-scanner';

export interface ScanInstalledMessage {
  type: 'SCAN_INSTALLED';
  payload: { extensionId: string };
}

export interface ScanAllInstalledMessage {
  type: 'SCAN_ALL_INSTALLED';
  payload: {};
}

export interface GetInstalledExtensionsMessage {
  type: 'GET_INSTALLED_EXTENSIONS';
  payload: {};
}

export interface GetScanResultMessage {
  type: 'GET_SCAN_RESULT';
  payload: { scanId: string };
}

export interface GetScanHistoryMessage {
  type: 'GET_SCAN_HISTORY';
  payload: { limit?: number; offset?: number };
}

export interface DeleteScanResultMessage {
  type: 'DELETE_SCAN_RESULT';
  payload: { scanId: string };
}

export interface ExportReportMessage {
  type: 'EXPORT_REPORT';
  payload: { scanId: string; format: 'html' | 'json' };
}

export type ExtensionMessage =
  | ScanInstalledMessage
  | ScanAllInstalledMessage
  | GetInstalledExtensionsMessage
  | GetScanResultMessage
  | GetScanHistoryMessage
  | DeleteScanResultMessage
  | ExportReportMessage;

export interface InstalledExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  icons: chrome.management.ExtensionIcon[];
  enabled: boolean;
  type: string;
  mayDisable: boolean;
  riskScore?: number;
  riskLevel?: string;
}

export interface ScanProgress {
  total: number;
  completed: number;
  currentExtension: string;
}

export type ScanResultResponse =
  | { success: true; report: ScanReport }
  | { success: false; error: string };

export type ScanAllResponse =
  | { success: true; reports: ScanReport[] }
  | { success: false; error: string };
