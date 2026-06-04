import type { ParsedManifest, PermissionReport, RiskFinding } from '../types';

export const DANGEROUS_PERMISSIONS: Record<
  string,
  { weight: number; reason: string; casRef: string }
> = {
  '<all_urls>': {
    weight: 35,
    reason: 'Access to all websites — extremely broad scope',
    casRef: 'MASVS-PLATFORM-1',
  },
  tabs: {
    weight: 10,
    reason: 'Read and modify all browsing tabs',
    casRef: 'MASVS-PLATFORM-1',
  },
  webRequest: {
    weight: 10,
    reason: 'Observe and analyze web traffic',
    casRef: 'MASVS-NETWORK-1',
  },
  webRequestBlocking: {
    weight: 15,
    reason: 'Modify or block web requests in-flight',
    casRef: 'MASVS-NETWORK-1',
  },
  management: {
    weight: 15,
    reason: 'Manage installed extensions and apps',
    casRef: 'MASVS-PLATFORM-1',
  },
  debugger: {
    weight: 30,
    reason: 'Full page debugging control',
    casRef: 'MASVS-PLATFORM-1',
  },
  cookies: {
    weight: 8,
    reason: 'Read and modify cookies for all sites',
    casRef: 'MASVS-AUTH-2',
  },
  clipboardRead: {
    weight: 12,
    reason: 'Read clipboard contents',
    casRef: 'MASVS-PRIVACY-1',
  },
  desktopCapture: {
    weight: 25,
    reason: 'Capture screen content',
    casRef: 'MASVS-PRIVACY-1',
  },
  nativeMessaging: {
    weight: 15,
    reason: 'Communicate with native applications',
    casRef: 'MASVS-PLATFORM-2',
  },
  pageCapture: {
    weight: 20,
    reason: 'Save pages as MHTML',
    casRef: 'MASVS-PRIVACY-1',
  },
  proxy: {
    weight: 20,
    reason: 'Manage proxy settings',
    casRef: 'MASVS-NETWORK-1',
  },
  webNavigation: {
    weight: 5,
    reason: 'Monitor navigation events',
    casRef: 'MASVS-PLATFORM-1',
  },
  scripting: {
    weight: 10,
    reason: 'Inject scripts into web pages',
    casRef: 'MASVS-PLATFORM-1',
  },
  downloads: {
    weight: 8,
    reason: 'Trigger and monitor downloads',
    casRef: 'MASVS-PLATFORM-1',
  },
  history: {
    weight: 8,
    reason: 'Read and modify browsing history',
    casRef: 'MASVS-PRIVACY-1',
  },
  identity: {
    weight: 10,
    reason: 'Access OAuth2 tokens',
    casRef: 'MASVS-AUTH-1',
  },
  browsingData: {
    weight: 12,
    reason: 'Clear browsing data',
    casRef: 'MASVS-STORAGE-1',
  },
  topSites: {
    weight: 5,
    reason: 'Read most-visited sites',
    casRef: 'MASVS-PRIVACY-1',
  },
};

export const DANGEROUS_COMBOS: Array<{
  permissions: string[];
  weight: number;
  reason: string;
  casRef: string;
}> = [
  {
    permissions: ['tabs', 'webRequest', 'webRequestBlocking'],
    weight: 20,
    reason: 'Traffic interception: can observe and modify all web requests',
    casRef: 'MASVS-NETWORK-1',
  },
  {
    permissions: ['cookies', '<all_urls>'],
    weight: 25,
    reason: 'Cookie theft at scale: access cookies for every website',
    casRef: 'MASVS-AUTH-2',
  },
  {
    permissions: ['scripting', '<all_urls>'],
    weight: 20,
    reason: 'Arbitrary code injection into any page',
    casRef: 'MASVS-PLATFORM-1',
  },
  {
    permissions: ['management', 'tabs'],
    weight: 15,
    reason: 'Extension enumeration: can see all extensions and open tabs',
    casRef: 'MASVS-PLATFORM-1',
  },
  {
    permissions: ['debugger', '<all_urls>'],
    weight: 30,
    reason: 'Full page control: debug any page with full access',
    casRef: 'MASVS-PLATFORM-1',
  },
  {
    permissions: ['clipboardRead', 'nativeMessaging'],
    weight: 15,
    reason: 'Data exfiltration: read clipboard and send to native app',
    casRef: 'MASVS-PRIVACY-1',
  },
];

export function analyzePermissions(manifest: ParsedManifest): PermissionReport {
  const allDeclared = [...manifest.permissions, ...manifest.host_permissions];
  const dangerous: string[] = [];

  for (const perm of allDeclared) {
    if (DANGEROUS_PERMISSIONS[perm]) {
      dangerous.push(perm);
    }
  }

  const broadHostPermissions = detectBroadHostPermissionsList(manifest.host_permissions);

  const contentScriptHosts: string[] = [];
  if (manifest.content_scripts) {
    for (const cs of manifest.content_scripts) {
      contentScriptHosts.push(...cs.matches);
    }
  }

  const justification = buildJustification(
    manifest.permissions,
    dangerous,
    broadHostPermissions,
    contentScriptHosts
  );

  return {
    declared: allDeclared,
    dangerous,
    broadHostPermissions,
    contentScriptHosts,
    justification,
  };
}

export function calculatePermissionScore(manifest: ParsedManifest): {
  score: number;
  findings: RiskFinding[];
} {
  const findings: RiskFinding[] = [];
  let score = 0;

  const allPerms = [...manifest.permissions, ...manifest.host_permissions];

  for (const perm of allPerms) {
    const def = DANGEROUS_PERMISSIONS[perm];
    if (def) {
      score += def.weight;
      findings.push({
        id: `PERM_${perm.toUpperCase().replace(/[<>\s]/g, '_')}`,
        category: 'permission',
        severity: def.weight >= 25 ? 'critical' : def.weight >= 15 ? 'high' : def.weight >= 8 ? 'medium' : 'low',
        title: `Dangerous permission: ${perm}`,
        description: def.reason,
        suggestion: `Review if "${perm}" is truly required. Remove if not essential.`,
        casReference: def.casRef,
      });
    }
  }

  const broadFindings = detectBroadHostPermissions(manifest.host_permissions);
  findings.push(...broadFindings);
  score += broadFindings.length * 15;

  const comboFindings = detectDangerousCombos(allPerms);
  findings.push(...comboFindings);
  for (const f of comboFindings) {
    const combo = DANGEROUS_COMBOS.find(
      (c) => c.reason === f.description
    );
    if (combo) score += combo.weight;
  }

  return { score: Math.min(score, 100), findings };
}

export function detectBroadHostPermissions(hostPermissions: string[]): RiskFinding[] {
  const findings: RiskFinding[] = [];

  for (const hp of hostPermissions) {
    if (hp === '<all_urls>') {
      findings.push({
        id: 'PERM_ALL_URLS',
        category: 'permission',
        severity: 'critical',
        title: 'Broad host permission: <all_urls>',
        description: 'Extension requests access to all URLs. This grants access to every website the user visits.',
        suggestion: 'Narrow host_permissions to only the domains your extension needs.',
        casReference: 'MASVS-PLATFORM-1',
      });
    } else if (/^\*:\/\/\*\/?(\*|\/.*)?$/.test(hp)) {
      findings.push({
        id: 'PERM_WILDCARD_HOST',
        category: 'permission',
        severity: 'critical',
        title: `Broad host permission: ${hp}`,
        description: 'Wildcard host pattern grants access to all websites.',
        suggestion: 'Replace wildcard with specific domain patterns.',
        casReference: 'MASVS-PLATFORM-1',
      });
    } else if (/^\*:\/\/\*\./.test(hp)) {
      findings.push({
        id: 'PERM_WILDCARD_SUBDOMAIN',
        category: 'permission',
        severity: 'medium',
        title: `Wildcard subdomain: ${hp}`,
        description: 'Matches all subdomains — broader than necessary.',
        suggestion: 'List specific subdomains instead of using wildcard.',
        casReference: 'MASVS-PLATFORM-1',
      });
    }
  }

  return findings;
}

function detectBroadHostPermissionsList(hostPermissions: string[]): string[] {
  const broad: string[] = [];
  for (const hp of hostPermissions) {
    if (
      hp === '<all_urls>' ||
      /^\*:\/\/\*\/?(\*|\/.*)?$/.test(hp)
    ) {
      broad.push(hp);
    }
  }
  return broad;
}

export function detectDangerousCombos(permissions: string[]): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const permSet = new Set(permissions);

  for (const combo of DANGEROUS_COMBOS) {
    if (combo.permissions.every((p) => permSet.has(p))) {
      findings.push({
        id: `COMBO_${combo.permissions.join('_').toUpperCase().replace(/[<>\s]/g, '')}`,
        category: 'permission',
        severity: combo.weight >= 25 ? 'critical' : combo.weight >= 15 ? 'high' : 'medium',
        title: `Dangerous combination: ${combo.permissions.join(' + ')}`,
        description: combo.reason,
        suggestion: `Review if all of [${combo.permissions.join(', ')}] are needed together. Remove unnecessary permissions.`,
        casReference: combo.casRef,
      });
    }
  }

  return findings;
}

function buildJustification(
  permissions: string[],
  dangerous: string[],
  broadHost: string[],
  contentScriptHosts: string[]
): string {
  if (dangerous.length === 0 && broadHost.length === 0) {
    return 'No dangerous permissions detected. Permissions follow least-privilege principle.';
  }

  const parts: string[] = [];
  if (dangerous.length > 0) {
    parts.push(`${dangerous.length} dangerous permission(s): ${dangerous.join(', ')}`);
  }
  if (broadHost.length > 0) {
    parts.push(`${broadHost.length} broad host permission pattern(s)`);
  }
  if (contentScriptHosts.length > 0) {
    const broad = contentScriptHosts.filter(
      (h) => h === '<all_urls>' || /^\*:\/\/\*\/?(\*|\/.*)?$/.test(h)
    );
    if (broad.length > 0) {
      parts.push(`${broad.length} broad content script injection pattern(s)`);
    }
  }

  return `Found: ${parts.join('; ')}. Review each permission for necessity.`;
}
