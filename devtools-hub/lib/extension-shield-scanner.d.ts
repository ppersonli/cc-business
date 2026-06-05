interface ContentScriptDef {
    matches: string[];
    js?: string[];
    css?: string[];
    run_at?: string;
    all_frames?: boolean;
}
interface ParsedManifest {
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
    web_accessible_resources?: (string | {
        resources: string[];
        matches: string[];
    })[];
    content_security_policy?: string | {
        extension_pages?: string;
        sandbox?: string;
    };
    externally_connectable?: {
        matches?: string[];
    };
    storage?: {
        managed_schema?: string;
    };
    oauth2?: {
        client_id?: string;
    };
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
    sandbox?: {
        pages?: string[];
    };
}
interface ExtensionMetadata {
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
interface ScanInput {
    manifest: ParsedManifest;
    files: Record<string, string>;
    metadata?: ExtensionMetadata;
}
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type RiskCategory = 'permission' | 'csp' | 'remote-code' | 'content-script' | 'secrets' | 'privacy' | 'single-purpose' | 'obfuscation' | 'network' | 'dependency';
interface RiskFinding {
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
interface PermissionReport {
    declared: string[];
    dangerous: string[];
    broadHostPermissions: string[];
    contentScriptHosts: string[];
    justification: string;
}
interface CspReport {
    raw: string | null;
    hasUnsafeEval: boolean;
    hasUnsafeInline: boolean;
    allowsDataUri: boolean;
    allowsRemoteScript: boolean;
    directives: Record<string, string[]>;
}
interface CategoryReport {
    category: RiskCategory;
    score: number;
    findings: RiskFinding[];
}
interface ScanReport {
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

declare function parseManifest(raw: string): ParsedManifest;
declare function validateManifest(manifest: ParsedManifest): string[];
declare function buildScanInput(manifest: ParsedManifest, files: Record<string, string>, metadata?: ScanInput['metadata']): ScanInput;
declare function extractJavaScriptPaths(manifest: ParsedManifest): string[];

declare const DANGEROUS_PERMISSIONS: Record<string, {
    weight: number;
    reason: string;
    casRef: string;
}>;
declare const DANGEROUS_COMBOS: Array<{
    permissions: string[];
    weight: number;
    reason: string;
    casRef: string;
}>;
declare function analyzePermissions(manifest: ParsedManifest): PermissionReport;
declare function calculatePermissionScore(manifest: ParsedManifest): {
    score: number;
    findings: RiskFinding[];
};
declare function detectBroadHostPermissions(hostPermissions: string[]): RiskFinding[];
declare function detectDangerousCombos(permissions: string[]): RiskFinding[];

declare function parseCSP(manifest: ParsedManifest): CspReport;
declare function analyzeCSP(manifest: ParsedManifest): RiskFinding[];
declare function calculateCSPScore(manifest: ParsedManifest): {
    score: number;
    findings: RiskFinding[];
};

declare function detectRemoteCode(files: Record<string, string>): RiskFinding[];
declare function scanSourceForEvalPatterns(source: string, filePath: string): Array<{
    id: string;
    title: string;
    pattern: string;
    line: number;
    severity: 'high' | 'critical';
}>;
declare function detectExternalScripts(files: Record<string, string>): RiskFinding[];

declare function analyzeContentScripts(manifest: ParsedManifest): RiskFinding[];
declare function isBroadMatchPattern(pattern: string): boolean;
declare function assessInjectionScope(scripts: ContentScriptDef[]): {
    riskLevel: 'low' | 'medium' | 'high';
    details: string;
};

interface SecretRule {
    id: string;
    name: string;
    pattern: RegExp;
    entropyThreshold: number;
    severity: 'medium' | 'high';
}
declare const SECRET_RULES: SecretRule[];
declare function calculateEntropy(str: string): number;
declare function scanForSecrets(files: Record<string, string>): RiskFinding[];

declare function validatePrivacyPolicy(manifest: ParsedManifest, metadata?: ExtensionMetadata): RiskFinding[];
declare function checkDataCollectionIndicators(manifest: ParsedManifest, files: Record<string, string>): {
    collectsData: boolean;
    indicators: string[];
};

declare function categorizePermissionsByDomain(permissions: string[]): Record<string, string[]>;
declare function checkSinglePurpose(manifest: ParsedManifest): RiskFinding[];

declare function detectObfuscation(files: Record<string, string>): RiskFinding[];
declare function analyzeObfuscationScore(source: string): number;
declare function detectObfuscationSignatures(source: string): string[];

declare function detectInsecureUrls(files: Record<string, string>): RiskFinding[];
declare function checkUpdateUrl(manifest: {
    update_url?: string;
}): RiskFinding[];
declare function extractUrls(source: string): {
    http: string[];
    https: string[];
    ws: string[];
    wss: string[];
};

declare const VULNERABLE_LIBRARIES: Array<{
    name: string;
    pattern: RegExp;
    maxSafeVersion: string;
    cve?: string;
    severity: 'medium' | 'high' | 'critical';
}>;
declare function checkDependencies(files: Record<string, string>): RiskFinding[];

declare function calculateOverallScore(findings: RiskFinding[]): number;
declare function scoreToRiskLevel(score: number): RiskLevel;
declare function calculateSummary(findings: RiskFinding[]): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
};

declare function generateScanReport(input: ScanInput): ScanReport;
declare function generateHtmlReport(report: ScanReport): string;
declare function groupFindingsByCategory(findings: RiskFinding[]): CategoryReport[];

declare function extractFromCrx(buffer: ArrayBuffer): Promise<{
    manifest: Record<string, unknown>;
    files: Record<string, string>;
}>;
declare function extractFromZip(buffer: ArrayBuffer): Promise<{
    manifest: Record<string, unknown>;
    files: Record<string, string>;
}>;
declare function extractExtension(buffer: ArrayBuffer): Promise<{
    manifest: Record<string, unknown>;
    files: Record<string, string>;
    format: 'crx' | 'zip';
}>;

export { type CategoryReport, type ContentScriptDef, type CspReport, DANGEROUS_COMBOS, DANGEROUS_PERMISSIONS, type ExtensionMetadata, type ParsedManifest, type PermissionReport, type RiskCategory, type RiskFinding, type RiskLevel, SECRET_RULES, type ScanInput, type ScanReport, VULNERABLE_LIBRARIES, analyzeCSP, analyzeContentScripts, analyzeObfuscationScore, analyzePermissions, assessInjectionScope, buildScanInput, calculateCSPScore, calculateEntropy, calculateOverallScore, calculatePermissionScore, calculateSummary, categorizePermissionsByDomain, checkDataCollectionIndicators, checkDependencies, checkSinglePurpose, checkUpdateUrl, detectBroadHostPermissions, detectDangerousCombos, detectExternalScripts, detectInsecureUrls, detectObfuscation, detectObfuscationSignatures, detectRemoteCode, extractExtension, extractFromCrx, extractFromZip, extractJavaScriptPaths, extractUrls, generateHtmlReport, generateScanReport, groupFindingsByCategory, isBroadMatchPattern, parseCSP, parseManifest, scanForSecrets, scanSourceForEvalPatterns, scoreToRiskLevel, validateManifest, validatePrivacyPolicy };
