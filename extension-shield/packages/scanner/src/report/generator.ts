import type {
  ScanInput,
  ScanReport,
  CategoryReport,
  RiskFinding,
  RiskCategory,
} from '../types';
import { validateManifest } from '../manifest/parser';
import { calculatePermissionScore, analyzePermissions } from '../permissions/analyzer';
import { calculateCSPScore, parseCSP } from '../csp/analyzer';
import { detectRemoteCode } from '../remote-code/detector';
import { analyzeContentScripts } from '../content-script/inspector';
import { scanForSecrets } from '../secrets/scanner';
import { validatePrivacyPolicy } from '../privacy/validator';
import { checkSinglePurpose } from '../single-purpose/checker';
import { detectObfuscation } from '../obfuscation/detector';
import { detectInsecureUrls, checkUpdateUrl } from '../network/checker';
import { checkDependencies } from '../dependency/checker';
import { calculateOverallScore, scoreToRiskLevel, calculateSummary } from '../scoring/calculator';

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

export function generateScanReport(input: ScanInput): ScanReport {
  const { manifest, files, metadata } = input;

  const validationErrors = validateManifest(manifest);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid manifest: ${validationErrors.join(', ')}`);
  }

  const allFindings: RiskFinding[] = [];

  // 1. Permission analysis
  const permResult = calculatePermissionScore(manifest);
  allFindings.push(...permResult.findings);

  // 2. CSP analysis
  const cspResult = calculateCSPScore(manifest);
  allFindings.push(...cspResult.findings);

  // 3. Remote code detection
  const remoteCodeFindings = detectRemoteCode(files);
  allFindings.push(...remoteCodeFindings);

  // 4. Content script inspection
  const csFindings = analyzeContentScripts(manifest);
  allFindings.push(...csFindings);

  // 5. Secrets scanning
  const secretFindings = scanForSecrets(files);
  allFindings.push(...secretFindings);

  // 6. Privacy policy validation
  const privacyFindings = validatePrivacyPolicy(manifest, metadata);
  allFindings.push(...privacyFindings);

  // 7. Single-purpose check
  const spFindings = checkSinglePurpose(manifest);
  allFindings.push(...spFindings);

  // 8. Obfuscation detection
  const obfFindings = detectObfuscation(files);
  allFindings.push(...obfFindings);

  // 9. Network security check
  const netFindings = detectInsecureUrls(files);
  const updateFindings = checkUpdateUrl(manifest);
  allFindings.push(...netFindings, ...updateFindings);

  // 10. Dependency check
  const depFindings = checkDependencies(files);
  allFindings.push(...depFindings);

  // Deduplicate findings by id + file + line
  const deduped = deduplicateFindings(allFindings);

  // Calculate scores
  const riskScore = calculateOverallScore(deduped);
  const riskLevel = scoreToRiskLevel(riskScore);
  const summary = calculateSummary(deduped);
  const categories = groupFindingsByCategory(deduped);
  const permissionsReport = analyzePermissions(manifest);
  const cspReport = parseCSP(manifest);

  return {
    id: generateId(),
    extensionName: manifest.name,
    extensionVersion: manifest.version,
    manifestVersion: manifest.manifest_version,
    scannedAt: new Date().toISOString(),
    riskScore,
    riskLevel,
    summary,
    categories,
    findings: deduped,
    permissions: permissionsReport,
    csp: cspReport,
    metadata: metadata ?? null,
  };
}

export function generateHtmlReport(report: ScanReport): string {
  const riskColor =
    report.riskLevel === 'critical'
      ? '#dc2626'
      : report.riskLevel === 'high'
        ? '#ea580c'
        : report.riskLevel === 'medium'
          ? '#ca8a04'
          : '#16a34a';

  const findingsHtml = report.findings
    .map(
      (f) => `
    <div class="finding finding-${f.severity}">
      <div class="finding-header">
        <span class="severity-badge severity-${f.severity}">${f.severity.toUpperCase()}</span>
        <span class="finding-title">${escapeHtml(f.title)}</span>
      </div>
      <p class="finding-desc">${escapeHtml(f.description)}</p>
      ${f.file ? `<p class="finding-file">File: ${escapeHtml(f.file)}${f.line ? `:${f.line}` : ''}</p>` : ''}
      <p class="finding-suggestion"><strong>Fix:</strong> ${escapeHtml(f.suggestion)}</p>
      ${f.casReference ? `<p class="finding-cas">CASA: ${escapeHtml(f.casReference)}</p>` : ''}
    </div>`
    )
    .join('\n');

  const categoryHtml = report.categories
    .map(
      (c) => `
    <div class="category-row">
      <span class="category-name">${escapeHtml(c.category)}</span>
      <div class="category-bar">
        <div class="category-fill" style="width: ${c.score}%; background: ${scoreToColor(c.score)}"></div>
      </div>
      <span class="category-score">${c.score}</span>
      <span class="category-count">${c.findings.length} finding(s)</span>
    </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ExtensionShield Report: ${escapeHtml(report.extensionName)} v${escapeHtml(report.extensionVersion)}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 2rem; max-width: 960px; margin: 0 auto; }
h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
.risk-gauge { display: flex; align-items: center; gap: 1rem; }
.risk-score { font-size: 3rem; font-weight: 800; color: ${riskColor}; }
.risk-level { font-size: 1rem; font-weight: 600; color: ${riskColor}; text-transform: uppercase; }
.summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
.summary-item { padding: 1rem; border-radius: 8px; background: white; border: 1px solid #e2e8f0; text-align: center; flex: 1; }
.summary-count { font-size: 1.5rem; font-weight: 700; }
.summary-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
.section { margin-bottom: 2rem; }
.section h2 { font-size: 1.125rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; }
.category-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; }
.category-name { width: 120px; font-size: 0.875rem; font-weight: 500; }
.category-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.category-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.category-score { width: 32px; text-align: right; font-weight: 600; font-size: 0.875rem; }
.category-count { width: 100px; font-size: 0.75rem; color: #64748b; }
.finding { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; border-left: 4px solid #e2e8f0; }
.finding-critical { border-left-color: #dc2626; }
.finding-high { border-left-color: #ea580c; }
.finding-medium { border-left-color: #ca8a04; }
.finding-low { border-left-color: #16a34a; }
.finding-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.severity-badge { font-size: 0.625rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 4px; color: white; }
.severity-critical { background: #dc2626; }
.severity-high { background: #ea580c; }
.severity-medium { background: #ca8a04; }
.severity-low { background: #16a34a; }
.finding-title { font-weight: 600; font-size: 0.875rem; }
.finding-desc { font-size: 0.8125rem; color: #475569; margin-bottom: 0.25rem; }
.finding-file { font-size: 0.75rem; color: #6366f1; font-family: monospace; }
.finding-suggestion { font-size: 0.8125rem; margin-top: 0.5rem; }
.finding-cas { font-size: 0.75rem; color: #64748b; }
.footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>ExtensionShield Security Report</h1>
    <p>${escapeHtml(report.extensionName)} v${escapeHtml(report.extensionVersion)} &mdash; MV${report.manifestVersion}</p>
    <p style="font-size:0.75rem;color:#94a3b8">Scanned: ${new Date(report.scannedAt).toLocaleString()}</p>
  </div>
  <div class="risk-gauge">
    <div>
      <div class="risk-score">${report.riskScore}</div>
      <div class="risk-level">${report.riskLevel} risk</div>
    </div>
  </div>
</div>

<div class="summary">
  <div class="summary-item"><div class="summary-count" style="color:#dc2626">${report.summary.critical}</div><div class="summary-label">Critical</div></div>
  <div class="summary-item"><div class="summary-count" style="color:#ea580c">${report.summary.high}</div><div class="summary-label">High</div></div>
  <div class="summary-item"><div class="summary-count" style="color:#ca8a04">${report.summary.medium}</div><div class="summary-label">Medium</div></div>
  <div class="summary-item"><div class="summary-count" style="color:#16a34a">${report.summary.low}</div><div class="summary-label">Low</div></div>
  <div class="summary-item"><div class="summary-count">${report.summary.total}</div><div class="summary-label">Total</div></div>
</div>

<div class="section">
  <h2>Category Breakdown</h2>
  ${categoryHtml}
</div>

<div class="section">
  <h2>Findings (${report.summary.total})</h2>
  ${findingsHtml || '<p style="color:#16a34a;font-weight:600">No issues found. Extension passes all checks.</p>'}
</div>

<div class="footer">
  Generated by ExtensionShield &mdash; Chrome Extension Security Scanner
</div>
</body>
</html>`;
}

export function groupFindingsByCategory(findings: RiskFinding[]): CategoryReport[] {
  const categoryMap = new Map<RiskCategory, RiskFinding[]>();

  for (const finding of findings) {
    const existing = categoryMap.get(finding.category) || [];
    existing.push(finding);
    categoryMap.set(finding.category, existing);
  }

  const allCategories: RiskCategory[] = [
    'permission',
    'csp',
    'remote-code',
    'content-script',
    'secrets',
    'privacy',
    'single-purpose',
    'obfuscation',
    'network',
    'dependency',
  ];

  return allCategories.map((category) => {
    const catFindings = categoryMap.get(category) || [];
    const score =
      catFindings.length === 0
        ? 0
        : Math.min(
            catFindings.reduce((sum, f) => {
              switch (f.severity) {
                case 'critical':
                  return sum + 25;
                case 'high':
                  return sum + 12;
                case 'medium':
                  return sum + 5;
                case 'low':
                  return sum + 2;
              }
            }, 0),
            100
          );

    return { category, score, findings: catFindings };
  });
}

function deduplicateFindings(findings: RiskFinding[]): RiskFinding[] {
  const seen = new Set<string>();
  const result: RiskFinding[] = [];

  for (const f of findings) {
    const key = `${f.id}:${f.file || ''}:${f.line || 0}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(f);
    }
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scoreToColor(score: number): string {
  if (score >= 80) return '#dc2626';
  if (score >= 50) return '#ea580c';
  if (score >= 20) return '#ca8a04';
  return '#16a34a';
}
