import type { RiskFinding } from '../types';

const OBFUSCATION_SIGNATURES = [
  { pattern: /_0x[a-f0-9]{4,8}/gi, name: 'hex-variable-names', minCount: 5 },
  { pattern: /\\x[0-9a-f]{2}/gi, name: 'hex-escape-sequences', minCount: 50 },
  { pattern: /String\.fromCharCode/gi, name: 'fromCharCode-heavy', minCount: 10 },
  { pattern: /atob\s*\(/gi, name: 'base64-decoding-heavy', minCount: 5 },
  {
    pattern: /\[['"]\w+['"]\]\s*\[['"]\w+['"]\]/g,
    name: 'bracket-notation-chains',
    minCount: 20,
  },
  {
    pattern: /var\s+\w+\s*=\s*\[('[^']+',?\s*){20,}\]/g,
    name: 'string-array-declaration',
    minCount: 1,
  },
];

export function detectObfuscation(files: Record<string, string>): RiskFinding[] {
  const findings: RiskFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!content || !filePath.endsWith('.js')) continue;

    const score = analyzeObfuscationScore(content);

    if (score >= 70) {
      findings.push({
        id: 'OBF_HIGH',
        category: 'obfuscation',
        severity: 'high',
        title: 'Heavily obfuscated code detected',
        description: `${filePath} has an obfuscation score of ${score}/100. Heavily obfuscated code may hide malicious behavior.`,
        file: filePath,
        suggestion:
          'Provide unminified source code. Chrome Web Store requires readable code for review.',
        casReference: 'MASVS-CODE-4',
      });
    } else if (score >= 40) {
      findings.push({
        id: 'OBF_MEDIUM',
        category: 'obfuscation',
        severity: 'medium',
        title: 'Potentially obfuscated code',
        description: `${filePath} has an obfuscation score of ${score}/100. Some obfuscation indicators were detected.`,
        file: filePath,
        suggestion: 'Verify that the code is legitimately minified, not obfuscating malicious behavior.',
        casReference: 'MASVS-CODE-4',
      });
    }

    const signatures = detectObfuscationSignatures(content);
    if (signatures.length > 0) {
      findings.push({
        id: 'OBF_SIGNATURES',
        category: 'obfuscation',
        severity: 'medium',
        title: `Obfuscation toolkit signatures: ${signatures.join(', ')}`,
        description: `${filePath} contains patterns typical of code obfuscation tools.`,
        file: filePath,
        suggestion: 'Submit unobfuscated source code for CASA review.',
        casReference: 'MASVS-CODE-4',
      });
    }
  }

  return findings;
}

export function analyzeObfuscationScore(source: string): number {
  if (!source) return 0;

  let score = 0;
  const lines = source.split('\n');
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

  if (nonEmptyLines.length === 0) return 0;

  // High average line length
  const avgLineLength =
    nonEmptyLines.reduce((sum, l) => sum + l.length, 0) / nonEmptyLines.length;
  if (avgLineLength > 300) score += 30;
  else if (avgLineLength > 200) score += 20;
  else if (avgLineLength > 100) score += 10;

  // Low whitespace ratio
  const totalChars = source.length;
  const whitespaceChars = (source.match(/\s/g) || []).length;
  const wsRatio = whitespaceChars / totalChars;
  if (wsRatio < 0.05) score += 25;
  else if (wsRatio < 0.1) score += 15;

  // High entropy per line
  const highEntropyLines = nonEmptyLines.filter(
    (l) => calculateLineEntropy(l) > 5.0
  ).length;
  const highEntropyRatio = highEntropyLines / nonEmptyLines.length;
  if (highEntropyRatio > 0.5) score += 25;
  else if (highEntropyRatio > 0.3) score += 15;

  // Large base64 strings
  const base64Pattern = /['"]([A-Za-z0-9+/]{100,}={0,2})['"]/g;
  const base64Matches = source.match(base64Pattern) || [];
  if (base64Matches.length > 5) score += 20;
  else if (base64Matches.length > 0) score += 10;

  return Math.min(score, 100);
}

export function detectObfuscationSignatures(source: string): string[] {
  const found: string[] = [];

  for (const sig of OBFUSCATION_SIGNATURES) {
    sig.pattern.lastIndex = 0;
    const matches = source.match(sig.pattern) || [];
    if (matches.length >= sig.minCount) {
      found.push(sig.name);
    }
  }

  return found;
}

function calculateLineEntropy(line: string): number {
  if (!line) return 0;
  const freq: Record<string, number> = {};
  for (const char of line) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = line.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
