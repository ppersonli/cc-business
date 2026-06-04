import type { ParsedManifest, CspReport, RiskFinding } from '../types';

export function parseCSP(manifest: ParsedManifest): CspReport {
  const raw = manifest.content_security_policy ?? null;

  if (!raw) {
    return {
      raw: null,
      hasUnsafeEval: false,
      hasUnsafeInline: false,
      allowsDataUri: false,
      allowsRemoteScript: false,
      directives: {},
    };
  }

  const cspString = typeof raw === 'string' ? raw : raw.extension_pages ?? '';
  const directives = parseCSPDirectives(cspString);

  const scriptSrc = getDirectiveSources(directives, 'script-src')
    || getDirectiveSources(directives, 'default-src')
    || [];

  return {
    raw: cspString,
    hasUnsafeEval: scriptSrc.includes("'unsafe-eval'"),
    hasUnsafeInline: scriptSrc.includes("'unsafe-inline'"),
    allowsDataUri: scriptSrc.some((s) => s === 'data:'),
    allowsRemoteScript: scriptSrc.some(
      (s) => s.startsWith('http://') || s.startsWith('https://')
    ),
    directives,
  };
}

export function analyzeCSP(manifest: ParsedManifest): RiskFinding[] {
  const report = parseCSP(manifest);
  const findings: RiskFinding[] = [];

  if (report.hasUnsafeEval) {
    findings.push({
      id: 'CSP_UNSAFE_EVAL',
      category: 'csp',
      severity: 'critical',
      title: "CSP allows 'unsafe-eval'",
      description:
        "The Content Security Policy includes 'unsafe-eval' in script-src, which permits eval() and similar dynamic code execution.",
      suggestion: "Remove 'unsafe-eval' from script-src. Refactor code to avoid eval().",
      casReference: 'MASVS-CODE-3',
    });
  }

  if (report.hasUnsafeInline) {
    findings.push({
      id: 'CSP_UNSAFE_INLINE',
      category: 'csp',
      severity: 'high',
      title: "CSP allows 'unsafe-inline'",
      description:
        "The Content Security Policy includes 'unsafe-inline' in script-src, which permits inline scripts.",
      suggestion:
        "Remove 'unsafe-inline' from script-src. Use nonces or hashes for inline scripts if needed.",
      casReference: 'MASVS-CODE-3',
    });
  }

  if (report.allowsDataUri) {
    findings.push({
      id: 'CSP_DATA_URI',
      category: 'csp',
      severity: 'medium',
      title: 'CSP allows data: URIs in script-src',
      description: 'data: URIs in script-src can be used to inject scripts.',
      suggestion: 'Remove data: from script-src directive.',
      casReference: 'MASVS-CODE-3',
    });
  }

  if (report.allowsRemoteScript) {
    findings.push({
      id: 'CSP_REMOTE_SCRIPT',
      category: 'csp',
      severity: 'high',
      title: 'CSP allows remote script sources',
      description:
        'Remote hosts in script-src allow loading scripts from external servers.',
      suggestion:
        'Remove remote hosts from script-src. Bundle all scripts locally.',
      casReference: 'MASVS-CODE-3',
    });
  }

  if (
    manifest.manifest_version === 2 &&
    !manifest.content_security_policy
  ) {
    findings.push({
      id: 'CSP_MISSING',
      category: 'csp',
      severity: 'medium',
      title: 'No Content Security Policy defined',
      description:
        'MV2 extension has no CSP defined. Default browser CSP may be insufficient.',
      suggestion:
        "Add a restrictive CSP to manifest.json: \"content_security_policy\": \"script-src 'self'; object-src 'self'\"",
      casReference: 'MASVS-CODE-3',
    });
  }

  return findings;
}

export function calculateCSPScore(manifest: ParsedManifest): {
  score: number;
  findings: RiskFinding[];
} {
  const findings = analyzeCSP(manifest);
  let score = 0;

  for (const f of findings) {
    switch (f.id) {
      case 'CSP_UNSAFE_EVAL':
        score += 40;
        break;
      case 'CSP_UNSAFE_INLINE':
        score += 25;
        break;
      case 'CSP_DATA_URI':
        score += 15;
        break;
      case 'CSP_REMOTE_SCRIPT':
        score += 30;
        break;
      case 'CSP_MISSING':
        score += 10;
        break;
    }
  }

  return { score: Math.min(score, 100), findings };
}

function parseCSPDirectives(cspString: string): Record<string, string[]> {
  const directives: Record<string, string[]> = {};

  for (const part of cspString.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const tokens = trimmed.split(/\s+/);
    const directiveName = tokens[0];
    const sources = tokens.slice(1);
    directives[directiveName] = sources;
  }

  return directives;
}

function getDirectiveSources(
  directives: Record<string, string[]>,
  name: string
): string[] | undefined {
  return directives[name];
}
