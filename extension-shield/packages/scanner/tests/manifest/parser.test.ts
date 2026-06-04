import { describe, it, expect } from 'vitest';
import {
  parseManifest,
  validateManifest,
  buildScanInput,
  extractJavaScriptPaths,
} from '../../src/manifest/parser';

describe('parseManifest', () => {
  it('parses a valid MV3 manifest', () => {
    const raw = JSON.stringify({
      manifest_version: 3,
      name: 'Test Extension',
      version: '1.0.0',
      permissions: ['storage', 'activeTab'],
      host_permissions: ['https://example.com/*'],
    });
    const manifest = parseManifest(raw);
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('Test Extension');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.permissions).toEqual(['storage', 'activeTab']);
    expect(manifest.host_permissions).toEqual(['https://example.com/*']);
  });

  it('parses a valid MV2 manifest', () => {
    const raw = JSON.stringify({
      manifest_version: 2,
      name: 'MV2 Extension',
      version: '0.9.0',
      permissions: ['tabs', 'https://example.com/*', 'storage'],
    });
    const manifest = parseManifest(raw);
    expect(manifest.manifest_version).toBe(2);
    expect(manifest.permissions).toEqual(['tabs', 'storage']);
    expect(manifest.host_permissions).toEqual(['https://example.com/*']);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseManifest('not json')).toThrow('Invalid JSON');
  });

  it('throws on non-object JSON', () => {
    expect(() => parseManifest('"string"')).toThrow('must be a JSON object');
  });

  it('throws on unsupported manifest_version', () => {
    const raw = JSON.stringify({ manifest_version: 1, name: 'Test', version: '1.0' });
    expect(() => parseManifest(raw)).toThrow('Unsupported manifest_version');
  });

  it('throws on missing name', () => {
    const raw = JSON.stringify({ manifest_version: 3, version: '1.0' });
    expect(() => parseManifest(raw)).toThrow('must have a "name"');
  });

  it('throws on missing version', () => {
    const raw = JSON.stringify({ manifest_version: 3, name: 'Test' });
    expect(() => parseManifest(raw)).toThrow('must have a "version"');
  });

  it('normalizes host_permissions from MV2 match patterns', () => {
    const raw = JSON.stringify({
      manifest_version: 2,
      name: 'Test',
      version: '1.0',
      permissions: ['*://*/*', 'tabs'],
    });
    const manifest = parseManifest(raw);
    expect(manifest.host_permissions).toEqual(['*://*/*']);
    expect(manifest.permissions).toEqual(['tabs']);
  });

  it('extracts content_scripts', () => {
    const raw = JSON.stringify({
      manifest_version: 3,
      name: 'Test',
      version: '1.0',
      content_scripts: [{ matches: ['https://example.com/*'], js: ['content.js'] }],
    });
    const manifest = parseManifest(raw);
    expect(manifest.content_scripts).toHaveLength(1);
    expect(manifest.content_scripts![0].js).toEqual(['content.js']);
  });

  it('extracts optional fields', () => {
    const raw = JSON.stringify({
      manifest_version: 3,
      name: 'Test',
      version: '1.0',
      description: 'A test extension',
      homepage_url: 'https://example.com',
      background: { service_worker: 'background.js' },
    });
    const manifest = parseManifest(raw);
    expect(manifest.description).toBe('A test extension');
    expect(manifest.homepage_url).toBe('https://example.com');
    expect(manifest.background?.service_worker).toBe('background.js');
  });

  it('filters non-string permissions', () => {
    const raw = JSON.stringify({
      manifest_version: 3,
      name: 'Test',
      version: '1.0',
      permissions: ['storage', 123, null, 'activeTab'],
    });
    const manifest = parseManifest(raw);
    expect(manifest.permissions).toEqual(['storage', 'activeTab']);
  });
});

describe('validateManifest', () => {
  it('returns empty array for valid manifest', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0.0',
      permissions: [],
      host_permissions: [],
    };
    expect(validateManifest(manifest)).toEqual([]);
  });

  it('flags missing name', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: '',
      version: '1.0.0',
      permissions: [],
      host_permissions: [],
    };
    const errors = validateManifest(manifest);
    expect(errors).toContain('Missing or empty "name" field');
  });

  it('flags missing version', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '',
      permissions: [],
      host_permissions: [],
    };
    const errors = validateManifest(manifest);
    expect(errors).toContain('Missing or empty "version" field');
  });

  it('flags invalid version format', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: 'abc',
      permissions: [],
      host_permissions: [],
    };
    const errors = validateManifest(manifest);
    expect(errors).toContain('Invalid version format: "abc"');
  });
});

describe('buildScanInput', () => {
  it('builds a ScanInput object', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
    };
    const input = buildScanInput(manifest, { 'test.js': 'console.log("test")' });
    expect(input.manifest).toBe(manifest);
    expect(input.files['test.js']).toBe('console.log("test")');
  });

  it('includes metadata when provided', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
    };
    const input = buildScanInput(manifest, {}, { name: 'Test', version: '1.0' });
    expect(input.metadata?.name).toBe('Test');
  });
});

describe('extractJavaScriptPaths', () => {
  it('extracts MV3 service_worker path', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
      background: { service_worker: 'background.js' },
    };
    expect(extractJavaScriptPaths(manifest)).toEqual(['background.js']);
  });

  it('extracts MV2 background scripts', () => {
    const manifest = {
      manifest_version: 2 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
      background: { scripts: ['bg1.js', 'bg2.js'] },
    };
    expect(extractJavaScriptPaths(manifest)).toEqual(['bg1.js', 'bg2.js']);
  });

  it('extracts content script JS paths', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
      content_scripts: [{ matches: ['<all_urls>'], js: ['content.js'] }],
    };
    expect(extractJavaScriptPaths(manifest)).toEqual(['content.js']);
  });

  it('deduplicates paths', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
      background: { service_worker: 'bg.js' },
      content_scripts: [{ matches: ['<all_urls>'], js: ['bg.js'] }],
    };
    expect(extractJavaScriptPaths(manifest)).toEqual(['bg.js']);
  });

  it('extracts devtools_page', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
      devtools_page: 'devtools.html',
    };
    expect(extractJavaScriptPaths(manifest)).toEqual(['devtools.html']);
  });

  it('returns empty array when no JS paths', () => {
    const manifest = {
      manifest_version: 3 as const,
      name: 'Test',
      version: '1.0',
      permissions: [],
      host_permissions: [],
    };
    expect(extractJavaScriptPaths(manifest)).toEqual([]);
  });
});
