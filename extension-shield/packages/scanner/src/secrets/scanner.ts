import type { RiskFinding } from '../types';

export interface SecretRule {
  id: string;
  name: string;
  pattern: RegExp;
  entropyThreshold: number;
  severity: 'medium' | 'high';
}

export const SECRET_RULES: SecretRule[] = [
  {
    id: 'SECRET_AWS_KEY',
    name: 'AWS Access Key',
    pattern: /(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}/g,
    entropyThreshold: 3.5,
    severity: 'high',
  },
  {
    id: 'SECRET_GITHUB_TOKEN',
    name: 'GitHub Token',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
    entropyThreshold: 0,
    severity: 'high',
  },
  {
    id: 'SECRET_GOOGLE_API',
    name: 'Google API Key',
    pattern: /AIza[A-Za-z0-9_-]{35}/g,
    entropyThreshold: 0,
    severity: 'medium',
  },
  {
    id: 'SECRET_SLACK_TOKEN',
    name: 'Slack Token',
    pattern: /xox[bporas]-[A-Za-z0-9-]{10,}/g,
    entropyThreshold: 0,
    severity: 'high',
  },
  {
    id: 'SECRET_STRIPE_KEY',
    name: 'Stripe Key',
    pattern: /(sk|pk)_(test|live)_[A-Za-z0-9]{20,}/g,
    entropyThreshold: 0,
    severity: 'high',
  },
  {
    id: 'SECRET_GENERIC_API_KEY',
    name: 'Possible API Key',
    pattern:
      /['"]?(?:api[_-]?key|apikey|api[_-]?secret|apisecret)['"]?\s*[:=]\s*['"]([A-Za-z0-9_\-]{20,})['"]/gi,
    entropyThreshold: 4.0,
    severity: 'medium',
  },
  {
    id: 'SECRET_GENERIC_PASSWORD',
    name: 'Hardcoded Password',
    pattern:
      /['"]?(?:password|passwd|pwd|secret)['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
    entropyThreshold: 3.0,
    severity: 'high',
  },
  {
    id: 'SECRET_PRIVATE_KEY',
    name: 'Private Key',
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    entropyThreshold: 0,
    severity: 'high',
  },
  {
    id: 'SECRET_JWT_SECRET',
    name: 'JWT Secret',
    pattern:
      /['"]?(?:jwt[_-]?secret|jwt[_-]?key)['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
    entropyThreshold: 3.5,
    severity: 'high',
  },
];

export function calculateEntropy(str: string): number {
  if (!str) return 0;

  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

export function scanForSecrets(files: Record<string, string>): RiskFinding[] {
  const findings: RiskFinding[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;

    for (const rule of SECRET_RULES) {
      rule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = rule.pattern.exec(content)) !== null) {
        const matched = match[1] || match[0];

        if (rule.entropyThreshold > 0 && calculateEntropy(matched) < rule.entropyThreshold) {
          continue;
        }

        const line = content.substring(0, match.index).split('\n').length;

        findings.push({
          id: rule.id,
          category: 'secrets',
          severity: rule.severity,
          title: `${rule.name} detected`,
          description: `Found a potential ${rule.name.toLowerCase()} in ${filePath} at line ${line}. Hardcoded secrets in extension code are accessible to anyone who downloads the extension.`,
          file: filePath,
          line,
          suggestion: `Remove the hardcoded secret. Use environment variables at build time or prompt the user for credentials.`,
          casReference: 'MASVS-STORAGE-1',
        });
      }
    }
  }

  return findings;
}
