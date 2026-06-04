import type { RiskFinding } from '../types';

const URL_PATTERN = /\bhttps?:\/\/[^\s'"<>)}\]]+/gi;
const WS_PATTERN = /\bws[s]?:\/\/[^\s'"<>)}\]]+/gi;
const SAFE_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

export function detectInsecureUrls(files: Record<string, string>): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const seen = new Set<string>();

  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;

    URL_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = URL_PATTERN.exec(content)) !== null) {
      const url = match[0];

      if (!url.startsWith('http://')) continue;

      try {
        const hostname = new URL(url).hostname;
        if (SAFE_HOSTS.includes(hostname)) continue;
      } catch {
        continue;
      }

      const key = `${filePath}:${url}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const line = content.substring(0, match.index).split('\n').length;
      findings.push({
        id: 'NET_HTTP_URL',
        category: 'network',
        severity: 'medium',
        title: 'Insecure HTTP URL detected',
        description: `HTTP (non-HTTPS) URL found in ${filePath}: ${url}. Data transmitted over HTTP can be intercepted.`,
        file: filePath,
        line,
        suggestion: 'Use HTTPS instead of HTTP for all external URLs.',
        casReference: 'MASVS-NETWORK-1',
      });
    }
  }

  return findings;
}

export function checkUpdateUrl(manifest: { update_url?: string }): RiskFinding[] {
  const findings: RiskFinding[] = [];

  if (manifest.update_url && manifest.update_url.startsWith('http://')) {
    findings.push({
      id: 'NET_INSECURE_UPDATE',
      category: 'network',
      severity: 'high',
      title: 'Insecure update URL',
      description: `update_url uses HTTP: ${manifest.update_url}. Extension updates could be intercepted.`,
      suggestion: 'Use HTTPS for the update_url.',
      casReference: 'MASVS-NETWORK-1',
    });
  }

  return findings;
}

export function extractUrls(source: string): {
  http: string[];
  https: string[];
  ws: string[];
  wss: string[];
} {
  const result = { http: [] as string[], https: [] as string[], ws: [] as string[], wss: [] as string[] };

  URL_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = URL_PATTERN.exec(source)) !== null) {
    const url = match[0];
    if (url.startsWith('http://')) result.http.push(url);
    else result.https.push(url);
  }

  WS_PATTERN.lastIndex = 0;
  while ((match = WS_PATTERN.exec(source)) !== null) {
    const url = match[0];
    if (url.startsWith('wss://')) result.wss.push(url);
    else result.ws.push(url);
  }

  return result;
}
