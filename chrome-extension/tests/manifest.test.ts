import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const manifestPath = resolve(__dirname, '../.output/chrome-mv3/manifest.json');

describe('Manifest V3 configuration', () => {
  let manifest: any;

  beforeAll(() => {
    const raw = readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(raw);
  });

  it('has manifest_version 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('includes sidePanel permission', () => {
    expect(manifest.permissions).toContain('sidePanel');
  });

  it('includes commands permission', () => {
    expect(manifest.permissions).toContain('commands');
  });

  it('has side_panel configuration', () => {
    expect(manifest.side_panel).toBeDefined();
    expect(manifest.side_panel.default_path).toBe('sidepanel.html');
  });

  it('has capture-screenshot keyboard shortcut command', () => {
    expect(manifest.commands).toBeDefined();
    expect(manifest.commands['capture-screenshot']).toBeDefined();

    const cmd = manifest.commands['capture-screenshot'];
    expect(cmd.description).toBe('Capture & analyze screenshot');
    expect(cmd.suggested_key.default).toBe('Ctrl+Shift+S');
    expect(cmd.suggested_key.mac).toBe('Command+Shift+S');
  });

  it('has all required permissions', () => {
    const required = ['activeTab', 'storage', 'contextMenus', 'scripting', 'notifications', 'sidePanel', 'commands'];
    for (const perm of required) {
      expect(manifest.permissions).toContain(perm);
    }
  });

  it('includes sidepanel.html in output', () => {
    const { existsSync } = require('fs');
    expect(existsSync(resolve(__dirname, '../.output/chrome-mv3/sidepanel.html'))).toBe(true);
  });

  it('includes sidepanel JS chunk', () => {
    const { readdirSync } = require('fs');
    const chunks = readdirSync(resolve(__dirname, '../.output/chrome-mv3/chunks'));
    const sidepanelChunk = chunks.find((f: string) => f.startsWith('sidepanel-') && f.endsWith('.js'));
    expect(sidepanelChunk).toBeDefined();
  });

  it('includes sidepanel CSS', () => {
    const { readdirSync } = require('fs');
    const assets = readdirSync(resolve(__dirname, '../.output/chrome-mv3/assets'));
    const sidepanelCss = assets.find((f: string) => f.startsWith('sidepanel-') && f.endsWith('.css'));
    expect(sidepanelCss).toBeDefined();
  });
});
