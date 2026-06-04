// Re-export all public types
export type {
  ParsedManifest,
  ContentScriptDef,
  ScanInput,
  ScanReport,
  RiskFinding,
  RiskLevel,
  RiskCategory,
  ExtensionMetadata,
  CategoryReport,
  PermissionReport,
  CspReport,
} from './types';

// Manifest
export {
  parseManifest,
  validateManifest,
  buildScanInput,
  extractJavaScriptPaths,
} from './manifest/parser';

// Permissions
export {
  analyzePermissions,
  calculatePermissionScore,
  detectBroadHostPermissions,
  detectDangerousCombos,
  DANGEROUS_PERMISSIONS,
  DANGEROUS_COMBOS,
} from './permissions/analyzer';

// CSP
export { parseCSP, analyzeCSP, calculateCSPScore } from './csp/analyzer';

// Remote code
export {
  detectRemoteCode,
  scanSourceForEvalPatterns,
  detectExternalScripts,
} from './remote-code/detector';

// Content scripts
export {
  analyzeContentScripts,
  isBroadMatchPattern,
  assessInjectionScope,
} from './content-script/inspector';

// Secrets
export {
  scanForSecrets,
  calculateEntropy,
  SECRET_RULES,
} from './secrets/scanner';

// Privacy
export {
  validatePrivacyPolicy,
  checkDataCollectionIndicators,
} from './privacy/validator';

// Single-purpose
export {
  checkSinglePurpose,
  categorizePermissionsByDomain,
} from './single-purpose/checker';

// Obfuscation
export {
  detectObfuscation,
  analyzeObfuscationScore,
  detectObfuscationSignatures,
} from './obfuscation/detector';

// Network
export {
  detectInsecureUrls,
  checkUpdateUrl,
  extractUrls,
} from './network/checker';

// Dependencies
export { checkDependencies, VULNERABLE_LIBRARIES } from './dependency/checker';

// Scoring
export {
  calculateOverallScore,
  scoreToRiskLevel,
  calculateSummary,
} from './scoring/calculator';

// Report
export {
  generateScanReport,
  generateHtmlReport,
  groupFindingsByCategory,
} from './report/generator';

// Extractor (server-only)
export { extractExtension, extractFromCrx, extractFromZip } from './extractor/index';
