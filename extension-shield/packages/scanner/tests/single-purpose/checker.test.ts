import { describe, it, expect } from 'vitest';
import { checkSinglePurpose, categorizePermissionsByDomain } from '../../src/single-purpose/checker';
import type { ParsedManifest } from '../../src/types';

function makeManifest(overrides: Partial<ParsedManifest> = {}): ParsedManifest {
  return {
    manifest_version: 3,
    name: 'Test',
    version: '1.0',
    permissions: [],
    host_permissions: [],
    ...overrides,
  };
}

describe('categorizePermissionsByDomain', () => {
  it('groups permissions by domain', () => {
    const result = categorizePermissionsByDomain(['tabs', 'cookies', 'webRequest']);
    expect(result['tab-management']).toContain('tabs');
    expect(result['data-access']).toContain('cookies');
    expect(result['network-interception']).toContain('webRequest');
  });

  it('returns empty for permissions not in any domain', () => {
    const result = categorizePermissionsByDomain(['unlimitedStorage']);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles empty permissions', () => {
    const result = categorizePermissionsByDomain([]);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('checkSinglePurpose', () => {
  it('returns empty for focused extension', () => {
    const findings = checkSinglePurpose(makeManifest({ permissions: ['storage'] }));
    expect(findings).toHaveLength(0);
  });

  it('flags permissions spanning 3+ domains', () => {
    const findings = checkSinglePurpose(
      makeManifest({
        permissions: ['tabs', 'cookies', 'webRequest', 'management'],
      })
    );
    expect(findings.some((f) => f.id === 'SP_MULTI_DOMAIN')).toBe(true);
  });

  it('does not flag 2 or fewer domains', () => {
    const findings = checkSinglePurpose(
      makeManifest({ permissions: ['tabs', 'cookies'] })
    );
    expect(findings.some((f) => f.id === 'SP_MULTI_DOMAIN')).toBe(false);
  });

  it('flags content scripts targeting many domains', () => {
    const findings = checkSinglePurpose(
      makeManifest({
        content_scripts: [
          {
            matches: [
              'https://a.com/*',
              'https://b.com/*',
              'https://c.com/*',
              'https://d.com/*',
              'https://e.com/*',
              'https://f.com/*',
            ],
          },
        ],
      })
    );
    expect(findings.some((f) => f.id === 'SP_MULTI_SITE_INJECTION')).toBe(true);
  });
});
