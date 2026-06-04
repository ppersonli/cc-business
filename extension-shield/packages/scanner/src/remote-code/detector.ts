import type { RiskFinding } from '../types';

const EVAL_PATTERNS: Array<{
  pattern: RegExp;
  id: string;
  title: string;
  severity: 'high' | 'critical';
}> = [
  {
    pattern: /\beval\s*\(/g,
    id: 'RCE_EVAL',
    title: 'eval() usage detected',
    severity: 'critical',
  },
  {
    pattern: /new\s+Function\s*\(/g,
    id: 'RCE_FUNCTION_CONSTRUCTOR',
    title: 'Function constructor detected',
    severity: 'critical',
  },
  {
    pattern: /document\.write\s*\(/g,
    id: 'RCE_DOCUMENT_WRITE',
    title: 'document.write() usage detected',
    severity: 'high',
  },
  {
    pattern: /setTimeout\s*\(\s*['"`]/g,
    id: 'RCE_SETTIMEOUT_STRING',
    title: 'setTimeout with string argument',
    severity: 'high',
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/g,
    id: 'RCE_SETINTERVAL_STRING',
    title: 'setInterval with string argument',
    severity: 'high',
  },
  {
    pattern: /importScripts\s*\(/g,
    id: 'RCE_IMPORT_SCRIPTS',
    title: 'importScripts() detected',
    severity: 'critical',
  },
];

const EXTERNAL_SCRIPT_PATTERN =
  /<script[^>]+src\s*=\s*["'](https?:\/\/[^"']+)["']/gi;

export function detectRemoteCode(files: Record<string, string>): RiskFinding[] {
  const findings: RiskFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;

    const jsFindings = scanSourceForEvalPatterns(content, filePath);
    for (const match of jsFindings) {
      findings.push({
        id: match.id,
        category: 'remote-code',
        severity: match.severity,
        title: match.title,
        description: `${match.title} in ${filePath} at line ${match.line}. This allows dynamic code execution and is a security risk.`,
        file: filePath,
        line: match.line,
        suggestion: `Remove ${match.pattern} usage. Use static alternatives.`,
        casReference: 'MASVS-CODE-3',
      });
    }
  }

  findings.push(...detectExternalScripts(files));

  return findings;
}

export function scanSourceForEvalPatterns(
  source: string,
  filePath: string
): Array<{ id: string; title: string; pattern: string; line: number; severity: 'high' | 'critical' }> {
  const results: Array<{
    id: string;
    title: string;
    pattern: string;
    line: number;
    severity: 'high' | 'critical';
  }> = [];
  const lines = source.split('\n');

  for (const rule of EVAL_PATTERNS) {
    rule.pattern.lastIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(line)) !== null) {
        results.push({
          id: rule.id,
          title: rule.title,
          pattern: match[0],
          line: i + 1,
          severity: rule.severity,
        });
      }
    }
  }

  return results;
}

export function detectExternalScripts(
  files: Record<string, string>
): RiskFinding[] {
  const findings: RiskFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;

    // Only check HTML files and JS files that might reference external scripts
    const isHtml = filePath.endsWith('.html') || filePath.endsWith('.htm');
    if (!isHtml) continue;

    let match: RegExpExecArray | null;
    EXTERNAL_SCRIPT_PATTERN.lastIndex = 0;
    while ((match = EXTERNAL_SCRIPT_PATTERN.exec(content)) !== null) {
      const url = match[1];
      const line = content.substring(0, match.index).split('\n').length;
      findings.push({
        id: 'RCE_EXTERNAL_SCRIPT',
        category: 'remote-code',
        severity: 'critical',
        title: `External script loaded: ${url}`,
        description: `HTML file loads a script from external URL. Chrome extensions must bundle all scripts locally.`,
        file: filePath,
        line,
        suggestion: 'Bundle the script locally instead of loading from an external URL.',
        casReference: 'MASVS-CODE-3',
      });
    }
  }

  return findings;
}
