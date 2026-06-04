import type { RiskFinding } from '../types';

export const VULNERABLE_LIBRARIES: Array<{
  name: string;
  pattern: RegExp;
  maxSafeVersion: string;
  cve?: string;
  severity: 'medium' | 'high' | 'critical';
}> = [
  {
    name: 'jQuery',
    pattern: /jquery[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: '3.5.0',
    cve: 'CVE-2020-11022',
    severity: 'medium',
  },
  {
    name: 'AngularJS',
    pattern: /angular(?:\.js)?[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: '1.8.0',
    severity: 'high',
  },
  {
    name: 'Lodash',
    pattern: /lodash[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: '4.17.21',
    cve: 'CVE-2021-23337',
    severity: 'high',
  },
  {
    name: 'Handlebars',
    pattern: /handlebars[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: '4.7.7',
    cve: 'CVE-2021-23369',
    severity: 'critical',
  },
  {
    name: 'Prototype.js',
    pattern: /prototype\.?js?[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: '1.7.3',
    cve: 'CVE-2020-27587',
    severity: 'high',
  },
];

export function checkDependencies(files: Record<string, string>): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const seen = new Set<string>();

  for (const [filePath, content] of Object.entries(files)) {
    if (!content || !filePath.endsWith('.js')) continue;

    for (const lib of VULNERABLE_LIBRARIES) {
      lib.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = lib.pattern.exec(content)) !== null) {
        const version = match[1];
        if (compareVersions(version, lib.maxSafeVersion) < 0) {
          const key = `${lib.name}:${version}:${filePath}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const line = content.substring(0, match.index).split('\n').length;
          findings.push({
            id: `DEP_${lib.name.toUpperCase()}_${version.replace(/\./g, '_')}`,
            category: 'dependency',
            severity: lib.severity,
            title: `Vulnerable ${lib.name} v${version}`,
            description: `${lib.name} version ${version} in ${filePath} has known vulnerabilities${lib.cve ? ` (${lib.cve})` : ''}. Safe version: >=${lib.maxSafeVersion}.`,
            file: filePath,
            line,
            suggestion: `Update ${lib.name} to version ${lib.maxSafeVersion} or later.`,
            casReference: 'MASVS-CODE-2',
          });
        }
      }
    }
  }

  return findings;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }

  return 0;
}
