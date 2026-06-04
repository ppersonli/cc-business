import type { ParsedManifest, ContentScriptDef, RiskFinding } from '../types';

export function analyzeContentScripts(manifest: ParsedManifest): RiskFinding[] {
  const findings: RiskFinding[] = [];

  if (!manifest.content_scripts || manifest.content_scripts.length === 0) {
    return findings;
  }

  for (let i = 0; i < manifest.content_scripts.length; i++) {
    const cs = manifest.content_scripts[i];
    const label = `content_scripts[${i}]`;

    for (const pattern of cs.matches) {
      if (isBroadMatchPattern(pattern)) {
        findings.push({
          id: 'CS_BROAD_MATCH',
          category: 'content-script',
          severity: 'high',
          title: `Broad content script match: ${pattern}`,
          description: `${label} matches "${pattern}", injecting into all pages. This grants broad access to page content.`,
          suggestion: 'Narrow match patterns to only the sites your extension needs.',
          casReference: 'MASVS-PLATFORM-1',
        });
      }
    }

    if (cs.all_frames) {
      findings.push({
        id: 'CS_ALL_FRAMES',
        category: 'content-script',
        severity: 'medium',
        title: `${label}: all_frames enabled`,
        description:
          'Content script injects into all iframes, including cross-origin frames. This increases the attack surface.',
        suggestion:
          'Set all_frames to false unless specifically needed for iframe interaction.',
        casReference: 'MASVS-PLATFORM-1',
      });
    }

    if (cs.run_at === 'document_start') {
      findings.push({
        id: 'CS_DOCUMENT_START',
        category: 'content-script',
        severity: 'low',
        title: `${label}: runs at document_start`,
        description:
          'Content script runs before the page loads. Can modify page behavior before scripts execute.',
        suggestion:
          'Use document_idle (default) unless early injection is required.',
        casReference: 'MASVS-PLATFORM-1',
      });
    }
  }

  return findings;
}

export function isBroadMatchPattern(pattern: string): boolean {
  if (pattern === '<all_urls>') return true;
  if (/^\*:\/\/\*\/?(\*|\/.*)?$/.test(pattern)) return true;
  return false;
}

export function assessInjectionScope(scripts: ContentScriptDef[]): {
  riskLevel: 'low' | 'medium' | 'high';
  details: string;
} {
  let broadCount = 0;
  let allFramesCount = 0;

  for (const cs of scripts) {
    for (const pattern of cs.matches) {
      if (isBroadMatchPattern(pattern)) broadCount++;
    }
    if (cs.all_frames) allFramesCount++;
  }

  if (broadCount > 0) {
    return {
      riskLevel: 'high',
      details: `${broadCount} content script(s) use broad match patterns. Extension has wide page access.`,
    };
  }

  if (allFramesCount > 0) {
    return {
      riskLevel: 'medium',
      details: `${allFramesCount} content script(s) inject into all frames.`,
    };
  }

  return {
    riskLevel: 'low',
    details: 'Content scripts use specific match patterns.',
  };
}
