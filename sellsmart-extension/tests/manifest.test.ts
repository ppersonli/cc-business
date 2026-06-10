import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const outputDir = resolve(__dirname, '../.output/chrome-mv3');

describe('manifest.json', () => {
  let manifest: any;

  it('manifest file exists after build', () => {
    const path = resolve(outputDir, 'manifest.json');
    expect(existsSync(path)).toBe(true);
    manifest = JSON.parse(readFileSync(path, 'utf-8'));
  });

  it('is manifest version 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('has correct extension name', () => {
    expect(manifest.name).toBe('SellSmart - E-Commerce Seller Research');
  });

  it('has minimal permissions (storage, activeTab)', () => {
    expect(manifest.permissions).toEqual(
      expect.arrayContaining(['storage', 'activeTab'])
    );
    expect(manifest.permissions).toHaveLength(2);
  });

  it('has no host_permissions', () => {
    expect(manifest.host_permissions).toBeUndefined();
  });

  it('has popup action configured', () => {
    expect(manifest.action?.default_popup).toBeDefined();
    expect(manifest.action?.default_title).toBe('SellSmart');
  });

  it('has all required icons', () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBe('icon/icon-16.png');
    expect(manifest.icons['48']).toBe('icon/icon-48.png');
    expect(manifest.icons['128']).toBe('icon/icon-128.png');
  });

  it('has background service worker', () => {
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBeDefined();
  });

  it('popup.html exists in output', () => {
    expect(existsSync(resolve(outputDir, 'popup.html'))).toBe(true);
  });

  it('background.js exists in output', () => {
    expect(existsSync(resolve(outputDir, 'background.js'))).toBe(true);
  });

  it('all icon files exist in output', () => {
    for (const size of [16, 32, 48, 128]) {
      expect(existsSync(resolve(outputDir, `icon/icon-${size}.png`))).toBe(true);
    }
  });
});
