import { describe, it, expect } from 'vitest';
import {
  analyzeContentScripts,
  isBroadMatchPattern,
  assessInjectionScope,
} from '../../src/content-script/inspector';
import type { ParsedManifest, ContentScriptDef } from '../../src/types';

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

describe('isBroadMatchPattern', () => {
  it('flags <all_urls>', () => {
    expect(isBroadMatchPattern('<all_urls>')).toBe(true);
  });

  it('flags *://*/*', () => {
    expect(isBroadMatchPattern('*://*/*')).toBe(true);
  });

  it('flags *://*', () => {
    expect(isBroadMatchPattern('*://*')).toBe(true);
  });

  it('does not flag specific domains', () => {
    expect(isBroadMatchPattern('https://example.com/*')).toBe(false);
  });
});

describe('analyzeContentScripts', () => {
  it('returns empty for no content scripts', () => {
    const findings = analyzeContentScripts(makeManifest());
    expect(findings).toHaveLength(0);
  });

  it('flags broad match pattern', () => {
    const manifest = makeManifest({
      content_scripts: [{ matches: ['<all_urls>'], js: ['content.js'] }],
    });
    const findings = analyzeContentScripts(manifest);
    expect(findings.some((f) => f.id === 'CS_BROAD_MATCH')).toBe(true);
    expect(findings.find((f) => f.id === 'CS_BROAD_MATCH')!.severity).toBe('high');
  });

  it('flags all_frames', () => {
    const manifest = makeManifest({
      content_scripts: [
        { matches: ['https://example.com/*'], js: ['content.js'], all_frames: true },
      ],
    });
    const findings = analyzeContentScripts(manifest);
    expect(findings.some((f) => f.id === 'CS_ALL_FRAMES')).toBe(true);
  });

  it('flags document_start', () => {
    const manifest = makeManifest({
      content_scripts: [
        { matches: ['https://example.com/*'], js: ['content.js'], run_at: 'document_start' },
      ],
    });
    const findings = analyzeContentScripts(manifest);
    expect(findings.some((f) => f.id === 'CS_DOCUMENT_START')).toBe(true);
  });

  it('returns no findings for safe content scripts', () => {
    const manifest = makeManifest({
      content_scripts: [
        { matches: ['https://example.com/*'], js: ['content.js'] },
      ],
    });
    const findings = analyzeContentScripts(manifest);
    expect(findings).toHaveLength(0);
  });
});

describe('assessInjectionScope', () => {
  it('returns high for broad patterns', () => {
    const scripts: ContentScriptDef[] = [{ matches: ['<all_urls>'] }];
    const result = assessInjectionScope(scripts);
    expect(result.riskLevel).toBe('high');
  });

  it('returns medium for all_frames', () => {
    const scripts: ContentScriptDef[] = [
      { matches: ['https://example.com/*'], all_frames: true },
    ];
    const result = assessInjectionScope(scripts);
    expect(result.riskLevel).toBe('medium');
  });

  it('returns low for specific patterns', () => {
    const scripts: ContentScriptDef[] = [
      { matches: ['https://example.com/*'] },
    ];
    const result = assessInjectionScope(scripts);
    expect(result.riskLevel).toBe('low');
  });
});
