import type { ParsedManifest, RiskFinding } from '../types';

const PERMISSION_DOMAINS: Record<string, string[]> = {
  'network-interception': ['webRequest', 'webRequestBlocking', 'proxy'],
  'tab-management': ['tabs', 'activeTab', 'tabCapture'],
  'data-access': ['cookies', 'storage', 'browsingData'],
  'dom-manipulation': ['scripting', 'contentScripts'],
  'media': ['desktopCapture', 'pageCapture', 'tabCapture'],
  'system': ['management', 'nativeMessaging', 'debugger'],
  'identity': ['identity', 'identity.email'],
  'notifications': ['notifications', 'alarms'],
};

export function categorizePermissionsByDomain(
  permissions: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const permSet = new Set(permissions);

  for (const [domain, domainPerms] of Object.entries(PERMISSION_DOMAINS)) {
    const matched = domainPerms.filter((p) => permSet.has(p));
    if (matched.length > 0) {
      result[domain] = matched;
    }
  }

  return result;
}

export function checkSinglePurpose(manifest: ParsedManifest): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const allPerms = [...manifest.permissions];

  const domainMap = categorizePermissionsByDomain(allPerms);
  const activeDomains = Object.keys(domainMap);

  if (activeDomains.length >= 3) {
    findings.push({
      id: 'SP_MULTI_DOMAIN',
      category: 'single-purpose',
      severity: 'medium',
      title: 'Permissions span multiple functional domains',
      description: `Extension uses permissions from ${activeDomains.length} different domains: ${activeDomains.join(', ')}. Chrome's single-purpose policy requires extensions to have a narrow, focused purpose.`,
      suggestion:
        'Review if all permission domains are necessary for a single purpose. Consider splitting into multiple extensions.',
      casReference: 'MASVS-PRIVACY-2',
    });
  }

  if (manifest.content_scripts && manifest.content_scripts.length > 0) {
    const contentDomains = new Set<string>();
    for (const cs of manifest.content_scripts) {
      for (const pattern of cs.matches) {
        if (pattern.includes('://')) {
          try {
            const url = pattern.replace(/\*:/g, 'https:').replace(/\/\*$/, '');
            const domain = new URL(url).hostname;
            contentDomains.add(domain);
          } catch {
            // invalid pattern
          }
        }
      }
    }

    if (contentDomains.size > 5) {
      findings.push({
        id: 'SP_MULTI_SITE_INJECTION',
        category: 'single-purpose',
        severity: 'medium',
        title: `Content scripts target ${contentDomains.size} different domains`,
        description: `Content scripts inject into pages on ${contentDomains.size} different domains. Wide injection scope may indicate multi-purpose functionality.`,
        suggestion:
          'Reduce content script injection to only the sites your extension modifies.',
        casReference: 'MASVS-PRIVACY-2',
      });
    }
  }

  return findings;
}
