import { describe, it, expect } from 'vitest';
import {
  detectRemoteCode,
  scanSourceForEvalPatterns,
  detectExternalScripts,
} from '../../src/remote-code/detector';

describe('scanSourceForEvalPatterns', () => {
  it('detects eval() usage', () => {
    const results = scanSourceForEvalPatterns('const x = eval("1+1");', 'test.js');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('RCE_EVAL');
    expect(results[0].line).toBe(1);
  });

  it('detects new Function()', () => {
    const results = scanSourceForEvalPatterns('const fn = new Function("a", "return a");', 'test.js');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('RCE_FUNCTION_CONSTRUCTOR');
  });

  it('detects document.write()', () => {
    const results = scanSourceForEvalPatterns('document.write("<p>hi</p>");', 'test.js');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('RCE_DOCUMENT_WRITE');
  });

  it('detects setTimeout with string', () => {
    const results = scanSourceForEvalPatterns('setTimeout("alert(1)", 100);', 'test.js');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('RCE_SETTIMEOUT_STRING');
  });

  it('detects setInterval with string', () => {
    const results = scanSourceForEvalPatterns('setInterval("alert(1)", 100);', 'test.js');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('RCE_SETINTERVAL_STRING');
  });

  it('detects importScripts()', () => {
    const results = scanSourceForEvalPatterns('importScripts("https://evil.com/script.js");', 'test.js');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('RCE_IMPORT_SCRIPTS');
  });

  it('does not flag setTimeout with function', () => {
    const results = scanSourceForEvalPatterns('setTimeout(() => {}, 100);', 'test.js');
    expect(results).toHaveLength(0);
  });

  it('returns correct line numbers', () => {
    const code = 'const a = 1;\nconst b = 2;\neval("a+b");';
    const results = scanSourceForEvalPatterns(code, 'test.js');
    expect(results[0].line).toBe(3);
  });

  it('handles multiple findings on same line', () => {
    const code = 'eval(setTimeout("x", 1));';
    const results = scanSourceForEvalPatterns(code, 'test.js');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });
});

describe('detectExternalScripts', () => {
  it('detects external script in HTML', () => {
    const files = {
      'index.html': '<html><body><script src="https://evil.com/malware.js"></script></body></html>',
    };
    const findings = detectExternalScripts(files);
    expect(findings).toHaveLength(1);
    expect(findings[0].id).toBe('RCE_EXTERNAL_SCRIPT');
    expect(findings[0].severity).toBe('critical');
  });

  it('does not flag local scripts', () => {
    const files = {
      'index.html': '<html><body><script src="local.js"></script></body></html>',
    };
    const findings = detectExternalScripts(files);
    expect(findings).toHaveLength(0);
  });

  it('ignores non-HTML files', () => {
    const files = {
      'style.css': 'body { color: red; }',
    };
    const findings = detectExternalScripts(files);
    expect(findings).toHaveLength(0);
  });
});

describe('detectRemoteCode', () => {
  it('combines eval pattern and external script findings', () => {
    const files = {
      'test.js': 'eval("alert(1)");',
      'index.html': '<script src="https://cdn.example.com/lib.js"></script>',
    };
    const findings = detectRemoteCode(files);
    expect(findings.length).toBeGreaterThanOrEqual(2);
  });

  it('returns empty for clean files', () => {
    const files = {
      'test.js': 'const x = 1; console.log(x);',
    };
    const findings = detectRemoteCode(files);
    expect(findings).toHaveLength(0);
  });
});
