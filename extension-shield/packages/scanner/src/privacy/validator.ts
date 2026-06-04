import type { ExtensionMetadata, ParsedManifest, RiskFinding } from '../types';

export function validatePrivacyPolicy(
  manifest: ParsedManifest,
  metadata?: ExtensionMetadata
): RiskFinding[] {
  const findings: RiskFinding[] = [];

  const hasPrivacyUrl =
    !!metadata?.privacyPolicyUrl ||
    !!manifest.homepage_url;

  const { collectsData, indicators } = checkDataCollectionIndicators(
    manifest,
    {}
  );

  if (collectsData && !hasPrivacyUrl) {
    findings.push({
      id: 'PRIVACY_NO_POLICY',
      category: 'privacy',
      severity: 'high',
      title: 'No privacy policy found',
      description: `Extension appears to collect data (${indicators.join(', ')}) but no privacy policy URL was found.`,
      suggestion:
        'Add a privacy policy URL to the Chrome Web Store listing and/or manifest homepage_url.',
      casReference: 'MASVS-PRIVACY-3',
    });
  } else if (collectsData && hasPrivacyUrl) {
    findings.push({
      id: 'PRIVACY_COLLECTS_DATA',
      category: 'privacy',
      severity: 'low',
      title: 'Extension collects data with privacy policy',
      description: `Extension uses data-related APIs (${indicators.join(', ')}). Verify the privacy policy covers all data collection.`,
      suggestion:
        'Ensure the privacy policy accurately describes all data collected and how it is used.',
      casReference: 'MASVS-PRIVACY-3',
    });
  }

  return findings;
}

export function checkDataCollectionIndicators(
  manifest: ParsedManifest,
  files: Record<string, string>
): { collectsData: boolean; indicators: string[] } {
  const indicators: string[] = [];

  if (manifest.permissions.includes('cookies')) {
    indicators.push('chrome.cookies API');
  }
  if (manifest.permissions.includes('identity')) {
    indicators.push('chrome.identity API');
  }
  if (manifest.permissions.includes('geolocation')) {
    indicators.push('geolocation access');
  }

  for (const [, content] of Object.entries(files)) {
    if (!content) continue;

    if (/chrome\.cookies\b/.test(content) && !indicators.includes('chrome.cookies API')) {
      indicators.push('chrome.cookies API');
    }
    if (/\bfetch\s*\(/.test(content) || /XMLHttpRequest/.test(content)) {
      indicators.push('network requests (fetch/XHR)');
    }
    if (/navigator\.geolocation/.test(content)) {
      indicators.push('geolocation access');
    }
    if (/navigator\.mediaDevices/.test(content)) {
      indicators.push('media device access');
    }
    if (/google-analytics|googletagmanager|mixpanel|amplitude|segment\.com/i.test(content)) {
      indicators.push('analytics tracking');
    }
    if (/localStorage\.|sessionStorage\./.test(content)) {
      indicators.push('local/session storage usage');
    }
  }

  return {
    collectsData: indicators.length > 0,
    indicators: [...new Set(indicators)],
  };
}
