import { describe, it, expect } from 'vitest';
import {
  detectInsecureUrls,
  checkUpdateUrl,
  extractUrls,
} from '../../src/network/checker';

describe('detectInsecureUrls', () => {
  it('detects HTTP URLs', () => {
    const files = {
      'bg.js': 'fetch("http://example.com/api")',
    };
    const findings = detectInsecureUrls(files);
    expect(findings).toHaveLength(1);
    expect(findings[0].id).toBe('NET_HTTP_URL');
    expect(findings[0].severity).toBe('medium');
  });

  it('ignores HTTPS URLs', () => {
    const files = {
      'bg.js': 'fetch("https://example.com/api")',
    };
    const findings = detectInsecureUrls(files);
    expect(findings).toHaveLength(0);
  });

  it('ignores localhost URLs', () => {
    const files = {
      'bg.js': 'fetch("http://localhost:3000/api")',
    };
    const findings = detectInsecureUrls(files);
    expect(findings).toHaveLength(0);
  });

  it('ignores 127.0.0.1', () => {
    const files = {
      'bg.js': 'fetch("http://127.0.0.1:8080/api")',
    };
    const findings = detectInsecureUrls(files);
    expect(findings).toHaveLength(0);
  });

  it('deduplicates same URL in same file', () => {
    const files = {
      'bg.js': 'fetch("http://example.com");\nfetch("http://example.com");',
    };
    const findings = detectInsecureUrls(files);
    expect(findings).toHaveLength(1);
  });

  it('ignores empty files', () => {
    const findings = detectInsecureUrls({ 'empty.js': '' });
    expect(findings).toHaveLength(0);
  });
});

describe('checkUpdateUrl', () => {
  it('flags HTTP update_url', () => {
    const findings = checkUpdateUrl({ update_url: 'http://example.com/updates.xml' });
    expect(findings).toHaveLength(1);
    expect(findings[0].id).toBe('NET_INSECURE_UPDATE');
    expect(findings[0].severity).toBe('high');
  });

  it('does not flag HTTPS update_url', () => {
    const findings = checkUpdateUrl({ update_url: 'https://example.com/updates.xml' });
    expect(findings).toHaveLength(0);
  });

  it('returns empty when no update_url', () => {
    const findings = checkUpdateUrl({});
    expect(findings).toHaveLength(0);
  });
});

describe('extractUrls', () => {
  it('extracts HTTP and HTTPS URLs', () => {
    const result = extractUrls(
      'fetch("http://a.com"); fetch("https://b.com");'
    );
    expect(result.http).toHaveLength(1);
    expect(result.https).toHaveLength(1);
    expect(result.http[0]).toContain('http://a.com');
    expect(result.https[0]).toContain('https://b.com');
  });

  it('extracts WebSocket URLs', () => {
    const result = extractUrls('new WebSocket("ws://a.com"); new WebSocket("wss://b.com");');
    expect(result.ws).toHaveLength(1);
    expect(result.wss).toHaveLength(1);
  });

  it('returns empty arrays for no URLs', () => {
    const result = extractUrls('const x = 1;');
    expect(result.http).toHaveLength(0);
    expect(result.https).toHaveLength(0);
    expect(result.ws).toHaveLength(0);
    expect(result.wss).toHaveLength(0);
  });
});
