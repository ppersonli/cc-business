// ===== Manifest Types =====

export interface ContentScriptDef {
  matches: string[];
  js?: string[];
  css?: string[];
  run_at?: string;
  all_frames?: boolean;
}

export interface ParsedManifest {
  manifest_version: 2 | 3;
  name: string;
  version: string;
  description?: string;
  permissions: string[];
  host_permissions: string[];
  optional_permissions?: string[];
  content_scripts?: ContentScriptDef[];
  background?: {
    service_worker?: string;
    scripts?: string[];
    persistent?: boolean;
  };
  web_accessible_resources?: (string | { resources: string[]; matches: string[] })[];
  content_security_policy?: string | { extension_pages?: string; sandbox?: string };
  externally_connectable?: { matches?: string[] };
  storage?: { managed_schema?: string };
  oauth2?: { client_id?: string };
  homepage_url?: string;
  icons?: Record<string, string>;
  action?: Record<string, unknown>;
  browser_action?: Record<string, unknown>;
  chrome_url_overrides?: Record<string, string>;
  devtools_page?: string;
  key?: string;
  minimum_chrome_version?: string;
  offline_enabled?: boolean;
  update_url?: string;
  sandbox?: { pages?: string[] };
}

// ===== Scan Input Types =====

export interface ExtensionMetadata {
  name: string;
  version: string;
  description?: string;
  developer?: string;
  privacyPolicyUrl?: string;
  homepageUrl?: string;
  storeUrl?: string;
  ratingCount?: number;
  averageRating?: number;
}

export interface ScanInput {
  manifest: ParsedManifest;
  files: Record<string, string>;
  metadata?: ExtensionMetadata;
}

// ===== Risk Types =====

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory =
  | 'permission'
  | 'csp'
  | 'remote-code'
  | 'content-script'
  | 'secrets'
  | 'privacy'
  | 'single-purpose'
  | 'obfuscation'
  | 'network'
  | 'dependency';

export interface RiskFinding {
  id: string;
  category: RiskCategory;
  severity: RiskLevel;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion: string;
  casReference?: string;
}

// ===== Report Types =====

export interface PermissionReport {
  declared: string[];
  dangerous: string[];
  broadHostPermissions: string[];
  contentScriptHosts: string[];
  justification: string;
}

export interface CspReport {
  raw: string | null;
  hasUnsafeEval: boolean;
  hasUnsafeInline: boolean;
  allowsDataUri: boolean;
  allowsRemoteScript: boolean;
  directives: Record<string, string[]>;
}

export interface CategoryReport {
  category: RiskCategory;
  score: number;
  findings: RiskFinding[];
}

export interface ScanReport {
  id: string;
  extensionName: string;
  extensionVersion: string;
  manifestVersion: 2 | 3;
  scannedAt: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  categories: CategoryReport[];
  findings: RiskFinding[];
  permissions: PermissionReport;
  csp: CspReport;
  metadata: ExtensionMetadata | null;
}
