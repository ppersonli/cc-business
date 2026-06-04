import type { ParsedManifest, ScanInput } from '../types';

export function parseManifest(raw: string): ParsedManifest {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON in manifest.json');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('manifest.json must be a JSON object');
  }

  const mv = parsed.manifest_version as number;
  if (mv !== 2 && mv !== 3) {
    throw new Error(`Unsupported manifest_version: ${mv}`);
  }

  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('manifest.json must have a "name" string');
  }

  if (!parsed.version || typeof parsed.version !== 'string') {
    throw new Error('manifest.json must have a "version" string');
  }

  const permissions = Array.isArray(parsed.permissions)
    ? (parsed.permissions as string[]).filter((p) => typeof p === 'string')
    : [];

  const host_permissions = Array.isArray(parsed.host_permissions)
    ? (parsed.host_permissions as string[]).filter((p) => typeof p === 'string')
    : mv === 2
      ? extractHostPermissionsFromPermissions(permissions)
      : [];

  const normalizedPermissions = mv === 2
    ? permissions.filter((p) => !isHostPattern(p))
    : permissions;

  const manifest: ParsedManifest = {
    manifest_version: mv as 2 | 3,
    name: parsed.name as string,
    version: parsed.version as string,
    permissions: normalizedPermissions,
    host_permissions,
  };

  if (typeof parsed.description === 'string') manifest.description = parsed.description;
  if (Array.isArray(parsed.optional_permissions))
    manifest.optional_permissions = (parsed.optional_permissions as string[]).filter(
      (p) => typeof p === 'string'
    );
  if (Array.isArray(parsed.content_scripts))
    manifest.content_scripts = parsed.content_scripts as ParsedManifest['content_scripts'];
  if (typeof parsed.background === 'object' && parsed.background !== null)
    manifest.background = parsed.background as ParsedManifest['background'];
  if (parsed.web_accessible_resources)
    manifest.web_accessible_resources = parsed.web_accessible_resources as ParsedManifest['web_accessible_resources'];
  if (parsed.content_security_policy !== undefined)
    manifest.content_security_policy = parsed.content_security_policy as ParsedManifest['content_security_policy'];
  if (typeof parsed.externally_connectable === 'object')
    manifest.externally_connectable = parsed.externally_connectable as ParsedManifest['externally_connectable'];
  if (typeof parsed.storage === 'object')
    manifest.storage = parsed.storage as ParsedManifest['storage'];
  if (typeof parsed.oauth2 === 'object')
    manifest.oauth2 = parsed.oauth2 as ParsedManifest['oauth2'];
  if (typeof parsed.homepage_url === 'string')
    manifest.homepage_url = parsed.homepage_url;
  if (typeof parsed.icons === 'object' && parsed.icons !== null)
    manifest.icons = parsed.icons as Record<string, string>;
  if (typeof parsed.action === 'object')
    manifest.action = parsed.action as Record<string, unknown>;
  if (typeof parsed.browser_action === 'object')
    manifest.browser_action = parsed.browser_action as Record<string, unknown>;
  if (typeof parsed.chrome_url_overrides === 'object')
    manifest.chrome_url_overrides = parsed.chrome_url_overrides as Record<string, string>;
  if (typeof parsed.devtools_page === 'string')
    manifest.devtools_page = parsed.devtools_page;
  if (typeof parsed.key === 'string')
    manifest.key = parsed.key;
  if (typeof parsed.minimum_chrome_version === 'string')
    manifest.minimum_chrome_version = parsed.minimum_chrome_version;
  if (typeof parsed.offline_enabled === 'boolean')
    manifest.offline_enabled = parsed.offline_enabled;
  if (typeof parsed.update_url === 'string')
    manifest.update_url = parsed.update_url;
  if (typeof parsed.sandbox === 'object')
    manifest.sandbox = parsed.sandbox as ParsedManifest['sandbox'];

  return manifest;
}

function isHostPattern(perm: string): boolean {
  return (
    perm.includes('://') ||
    perm === '<all_urls>' ||
    perm.startsWith('*://')
  );
}

function extractHostPermissionsFromPermissions(permissions: string[]): string[] {
  return permissions.filter(isHostPattern);
}

export function validateManifest(manifest: ParsedManifest): string[] {
  const errors: string[] = [];

  if (!manifest.name || manifest.name.trim() === '') {
    errors.push('Missing or empty "name" field');
  }
  if (!manifest.version || manifest.version.trim() === '') {
    errors.push('Missing or empty "version" field');
  }
  if (manifest.manifest_version !== 2 && manifest.manifest_version !== 3) {
    errors.push(`Invalid manifest_version: ${manifest.manifest_version}`);
  }
  if (!/^\d+(\.\d+)*$/.test(manifest.version)) {
    errors.push(`Invalid version format: "${manifest.version}"`);
  }

  return errors;
}

export function buildScanInput(
  manifest: ParsedManifest,
  files: Record<string, string>,
  metadata?: ScanInput['metadata']
): ScanInput {
  return { manifest, files, metadata };
}

export function extractJavaScriptPaths(manifest: ParsedManifest): string[] {
  const paths: string[] = [];

  if (manifest.background) {
    if (manifest.background.service_worker) {
      paths.push(manifest.background.service_worker);
    }
    if (manifest.background.scripts) {
      paths.push(...manifest.background.scripts);
    }
  }

  if (manifest.content_scripts) {
    for (const cs of manifest.content_scripts) {
      if (cs.js) paths.push(...cs.js);
    }
  }

  if (manifest.devtools_page) {
    paths.push(manifest.devtools_page);
  }

  if (manifest.sandbox?.pages) {
    for (const page of manifest.sandbox.pages) {
      if (page.endsWith('.js')) paths.push(page);
    }
  }

  return [...new Set(paths)];
}
