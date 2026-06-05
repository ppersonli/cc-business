// src/manifest/parser.ts
function parseManifest(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON in manifest.json");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("manifest.json must be a JSON object");
  }
  const mv = parsed.manifest_version;
  if (mv !== 2 && mv !== 3) {
    throw new Error(`Unsupported manifest_version: ${mv}`);
  }
  if (!parsed.name || typeof parsed.name !== "string") {
    throw new Error('manifest.json must have a "name" string');
  }
  if (!parsed.version || typeof parsed.version !== "string") {
    throw new Error('manifest.json must have a "version" string');
  }
  const permissions = Array.isArray(parsed.permissions) ? parsed.permissions.filter((p) => typeof p === "string") : [];
  const host_permissions = Array.isArray(parsed.host_permissions) ? parsed.host_permissions.filter((p) => typeof p === "string") : mv === 2 ? extractHostPermissionsFromPermissions(permissions) : [];
  const normalizedPermissions = mv === 2 ? permissions.filter((p) => !isHostPattern(p)) : permissions;
  const manifest = {
    manifest_version: mv,
    name: parsed.name,
    version: parsed.version,
    permissions: normalizedPermissions,
    host_permissions
  };
  if (typeof parsed.description === "string") manifest.description = parsed.description;
  if (Array.isArray(parsed.optional_permissions))
    manifest.optional_permissions = parsed.optional_permissions.filter(
      (p) => typeof p === "string"
    );
  if (Array.isArray(parsed.content_scripts))
    manifest.content_scripts = parsed.content_scripts;
  if (typeof parsed.background === "object" && parsed.background !== null)
    manifest.background = parsed.background;
  if (parsed.web_accessible_resources)
    manifest.web_accessible_resources = parsed.web_accessible_resources;
  if (parsed.content_security_policy !== void 0)
    manifest.content_security_policy = parsed.content_security_policy;
  if (typeof parsed.externally_connectable === "object")
    manifest.externally_connectable = parsed.externally_connectable;
  if (typeof parsed.storage === "object")
    manifest.storage = parsed.storage;
  if (typeof parsed.oauth2 === "object")
    manifest.oauth2 = parsed.oauth2;
  if (typeof parsed.homepage_url === "string")
    manifest.homepage_url = parsed.homepage_url;
  if (typeof parsed.icons === "object" && parsed.icons !== null)
    manifest.icons = parsed.icons;
  if (typeof parsed.action === "object")
    manifest.action = parsed.action;
  if (typeof parsed.browser_action === "object")
    manifest.browser_action = parsed.browser_action;
  if (typeof parsed.chrome_url_overrides === "object")
    manifest.chrome_url_overrides = parsed.chrome_url_overrides;
  if (typeof parsed.devtools_page === "string")
    manifest.devtools_page = parsed.devtools_page;
  if (typeof parsed.key === "string")
    manifest.key = parsed.key;
  if (typeof parsed.minimum_chrome_version === "string")
    manifest.minimum_chrome_version = parsed.minimum_chrome_version;
  if (typeof parsed.offline_enabled === "boolean")
    manifest.offline_enabled = parsed.offline_enabled;
  if (typeof parsed.update_url === "string")
    manifest.update_url = parsed.update_url;
  if (typeof parsed.sandbox === "object")
    manifest.sandbox = parsed.sandbox;
  return manifest;
}
function isHostPattern(perm) {
  return perm.includes("://") || perm === "<all_urls>" || perm.startsWith("*://");
}
function extractHostPermissionsFromPermissions(permissions) {
  return permissions.filter(isHostPattern);
}
function validateManifest(manifest) {
  const errors = [];
  if (!manifest.name || manifest.name.trim() === "") {
    errors.push('Missing or empty "name" field');
  }
  if (!manifest.version || manifest.version.trim() === "") {
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
function buildScanInput(manifest, files, metadata) {
  return { manifest, files, metadata };
}
function extractJavaScriptPaths(manifest) {
  const paths = [];
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
      if (page.endsWith(".js")) paths.push(page);
    }
  }
  return [...new Set(paths)];
}

// src/permissions/analyzer.ts
var DANGEROUS_PERMISSIONS = {
  "<all_urls>": {
    weight: 35,
    reason: "Access to all websites \u2014 extremely broad scope",
    casRef: "MASVS-PLATFORM-1"
  },
  tabs: {
    weight: 10,
    reason: "Read and modify all browsing tabs",
    casRef: "MASVS-PLATFORM-1"
  },
  webRequest: {
    weight: 10,
    reason: "Observe and analyze web traffic",
    casRef: "MASVS-NETWORK-1"
  },
  webRequestBlocking: {
    weight: 15,
    reason: "Modify or block web requests in-flight",
    casRef: "MASVS-NETWORK-1"
  },
  management: {
    weight: 15,
    reason: "Manage installed extensions and apps",
    casRef: "MASVS-PLATFORM-1"
  },
  debugger: {
    weight: 30,
    reason: "Full page debugging control",
    casRef: "MASVS-PLATFORM-1"
  },
  cookies: {
    weight: 8,
    reason: "Read and modify cookies for all sites",
    casRef: "MASVS-AUTH-2"
  },
  clipboardRead: {
    weight: 12,
    reason: "Read clipboard contents",
    casRef: "MASVS-PRIVACY-1"
  },
  desktopCapture: {
    weight: 25,
    reason: "Capture screen content",
    casRef: "MASVS-PRIVACY-1"
  },
  nativeMessaging: {
    weight: 15,
    reason: "Communicate with native applications",
    casRef: "MASVS-PLATFORM-2"
  },
  pageCapture: {
    weight: 20,
    reason: "Save pages as MHTML",
    casRef: "MASVS-PRIVACY-1"
  },
  proxy: {
    weight: 20,
    reason: "Manage proxy settings",
    casRef: "MASVS-NETWORK-1"
  },
  webNavigation: {
    weight: 5,
    reason: "Monitor navigation events",
    casRef: "MASVS-PLATFORM-1"
  },
  scripting: {
    weight: 10,
    reason: "Inject scripts into web pages",
    casRef: "MASVS-PLATFORM-1"
  },
  downloads: {
    weight: 8,
    reason: "Trigger and monitor downloads",
    casRef: "MASVS-PLATFORM-1"
  },
  history: {
    weight: 8,
    reason: "Read and modify browsing history",
    casRef: "MASVS-PRIVACY-1"
  },
  identity: {
    weight: 10,
    reason: "Access OAuth2 tokens",
    casRef: "MASVS-AUTH-1"
  },
  browsingData: {
    weight: 12,
    reason: "Clear browsing data",
    casRef: "MASVS-STORAGE-1"
  },
  topSites: {
    weight: 5,
    reason: "Read most-visited sites",
    casRef: "MASVS-PRIVACY-1"
  }
};
var DANGEROUS_COMBOS = [
  {
    permissions: ["tabs", "webRequest", "webRequestBlocking"],
    weight: 20,
    reason: "Traffic interception: can observe and modify all web requests",
    casRef: "MASVS-NETWORK-1"
  },
  {
    permissions: ["cookies", "<all_urls>"],
    weight: 25,
    reason: "Cookie theft at scale: access cookies for every website",
    casRef: "MASVS-AUTH-2"
  },
  {
    permissions: ["scripting", "<all_urls>"],
    weight: 20,
    reason: "Arbitrary code injection into any page",
    casRef: "MASVS-PLATFORM-1"
  },
  {
    permissions: ["management", "tabs"],
    weight: 15,
    reason: "Extension enumeration: can see all extensions and open tabs",
    casRef: "MASVS-PLATFORM-1"
  },
  {
    permissions: ["debugger", "<all_urls>"],
    weight: 30,
    reason: "Full page control: debug any page with full access",
    casRef: "MASVS-PLATFORM-1"
  },
  {
    permissions: ["clipboardRead", "nativeMessaging"],
    weight: 15,
    reason: "Data exfiltration: read clipboard and send to native app",
    casRef: "MASVS-PRIVACY-1"
  }
];
function analyzePermissions(manifest) {
  const allDeclared = [...manifest.permissions, ...manifest.host_permissions];
  const dangerous = [];
  for (const perm of allDeclared) {
    if (DANGEROUS_PERMISSIONS[perm]) {
      dangerous.push(perm);
    }
  }
  const broadHostPermissions = detectBroadHostPermissionsList(manifest.host_permissions);
  const contentScriptHosts = [];
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
    justification
  };
}
function calculatePermissionScore(manifest) {
  const findings = [];
  let score = 0;
  const allPerms = [...manifest.permissions, ...manifest.host_permissions];
  for (const perm of allPerms) {
    const def = DANGEROUS_PERMISSIONS[perm];
    if (def) {
      score += def.weight;
      findings.push({
        id: `PERM_${perm.toUpperCase().replace(/[<>\s]/g, "_")}`,
        category: "permission",
        severity: def.weight >= 25 ? "critical" : def.weight >= 15 ? "high" : def.weight >= 8 ? "medium" : "low",
        title: `Dangerous permission: ${perm}`,
        description: def.reason,
        suggestion: `Review if "${perm}" is truly required. Remove if not essential.`,
        casReference: def.casRef
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
function detectBroadHostPermissions(hostPermissions) {
  const findings = [];
  for (const hp of hostPermissions) {
    if (hp === "<all_urls>") {
      findings.push({
        id: "PERM_ALL_URLS",
        category: "permission",
        severity: "critical",
        title: "Broad host permission: <all_urls>",
        description: "Extension requests access to all URLs. This grants access to every website the user visits.",
        suggestion: "Narrow host_permissions to only the domains your extension needs.",
        casReference: "MASVS-PLATFORM-1"
      });
    } else if (/^\*:\/\/\*\/?(\*|\/.*)?$/.test(hp)) {
      findings.push({
        id: "PERM_WILDCARD_HOST",
        category: "permission",
        severity: "critical",
        title: `Broad host permission: ${hp}`,
        description: "Wildcard host pattern grants access to all websites.",
        suggestion: "Replace wildcard with specific domain patterns.",
        casReference: "MASVS-PLATFORM-1"
      });
    } else if (/^\*:\/\/\*\./.test(hp)) {
      findings.push({
        id: "PERM_WILDCARD_SUBDOMAIN",
        category: "permission",
        severity: "medium",
        title: `Wildcard subdomain: ${hp}`,
        description: "Matches all subdomains \u2014 broader than necessary.",
        suggestion: "List specific subdomains instead of using wildcard.",
        casReference: "MASVS-PLATFORM-1"
      });
    }
  }
  return findings;
}
function detectBroadHostPermissionsList(hostPermissions) {
  const broad = [];
  for (const hp of hostPermissions) {
    if (hp === "<all_urls>" || /^\*:\/\/\*\/?(\*|\/.*)?$/.test(hp)) {
      broad.push(hp);
    }
  }
  return broad;
}
function detectDangerousCombos(permissions) {
  const findings = [];
  const permSet = new Set(permissions);
  for (const combo of DANGEROUS_COMBOS) {
    if (combo.permissions.every((p) => permSet.has(p))) {
      findings.push({
        id: `COMBO_${combo.permissions.join("_").toUpperCase().replace(/[<>\s]/g, "")}`,
        category: "permission",
        severity: combo.weight >= 25 ? "critical" : combo.weight >= 15 ? "high" : "medium",
        title: `Dangerous combination: ${combo.permissions.join(" + ")}`,
        description: combo.reason,
        suggestion: `Review if all of [${combo.permissions.join(", ")}] are needed together. Remove unnecessary permissions.`,
        casReference: combo.casRef
      });
    }
  }
  return findings;
}
function buildJustification(permissions, dangerous, broadHost, contentScriptHosts) {
  if (dangerous.length === 0 && broadHost.length === 0) {
    return "No dangerous permissions detected. Permissions follow least-privilege principle.";
  }
  const parts = [];
  if (dangerous.length > 0) {
    parts.push(`${dangerous.length} dangerous permission(s): ${dangerous.join(", ")}`);
  }
  if (broadHost.length > 0) {
    parts.push(`${broadHost.length} broad host permission pattern(s)`);
  }
  if (contentScriptHosts.length > 0) {
    const broad = contentScriptHosts.filter(
      (h) => h === "<all_urls>" || /^\*:\/\/\*\/?(\*|\/.*)?$/.test(h)
    );
    if (broad.length > 0) {
      parts.push(`${broad.length} broad content script injection pattern(s)`);
    }
  }
  return `Found: ${parts.join("; ")}. Review each permission for necessity.`;
}

// src/csp/analyzer.ts
function parseCSP(manifest) {
  const raw = manifest.content_security_policy ?? null;
  if (!raw) {
    return {
      raw: null,
      hasUnsafeEval: false,
      hasUnsafeInline: false,
      allowsDataUri: false,
      allowsRemoteScript: false,
      directives: {}
    };
  }
  const cspString = typeof raw === "string" ? raw : raw.extension_pages ?? "";
  const directives = parseCSPDirectives(cspString);
  const scriptSrc = getDirectiveSources(directives, "script-src") || getDirectiveSources(directives, "default-src") || [];
  return {
    raw: cspString,
    hasUnsafeEval: scriptSrc.includes("'unsafe-eval'"),
    hasUnsafeInline: scriptSrc.includes("'unsafe-inline'"),
    allowsDataUri: scriptSrc.some((s) => s === "data:"),
    allowsRemoteScript: scriptSrc.some(
      (s) => s.startsWith("http://") || s.startsWith("https://")
    ),
    directives
  };
}
function analyzeCSP(manifest) {
  const report = parseCSP(manifest);
  const findings = [];
  if (report.hasUnsafeEval) {
    findings.push({
      id: "CSP_UNSAFE_EVAL",
      category: "csp",
      severity: "critical",
      title: "CSP allows 'unsafe-eval'",
      description: "The Content Security Policy includes 'unsafe-eval' in script-src, which permits eval() and similar dynamic code execution.",
      suggestion: "Remove 'unsafe-eval' from script-src. Refactor code to avoid eval().",
      casReference: "MASVS-CODE-3"
    });
  }
  if (report.hasUnsafeInline) {
    findings.push({
      id: "CSP_UNSAFE_INLINE",
      category: "csp",
      severity: "high",
      title: "CSP allows 'unsafe-inline'",
      description: "The Content Security Policy includes 'unsafe-inline' in script-src, which permits inline scripts.",
      suggestion: "Remove 'unsafe-inline' from script-src. Use nonces or hashes for inline scripts if needed.",
      casReference: "MASVS-CODE-3"
    });
  }
  if (report.allowsDataUri) {
    findings.push({
      id: "CSP_DATA_URI",
      category: "csp",
      severity: "medium",
      title: "CSP allows data: URIs in script-src",
      description: "data: URIs in script-src can be used to inject scripts.",
      suggestion: "Remove data: from script-src directive.",
      casReference: "MASVS-CODE-3"
    });
  }
  if (report.allowsRemoteScript) {
    findings.push({
      id: "CSP_REMOTE_SCRIPT",
      category: "csp",
      severity: "high",
      title: "CSP allows remote script sources",
      description: "Remote hosts in script-src allow loading scripts from external servers.",
      suggestion: "Remove remote hosts from script-src. Bundle all scripts locally.",
      casReference: "MASVS-CODE-3"
    });
  }
  if (manifest.manifest_version === 2 && !manifest.content_security_policy) {
    findings.push({
      id: "CSP_MISSING",
      category: "csp",
      severity: "medium",
      title: "No Content Security Policy defined",
      description: "MV2 extension has no CSP defined. Default browser CSP may be insufficient.",
      suggestion: `Add a restrictive CSP to manifest.json: "content_security_policy": "script-src 'self'; object-src 'self'"`,
      casReference: "MASVS-CODE-3"
    });
  }
  return findings;
}
function calculateCSPScore(manifest) {
  const findings = analyzeCSP(manifest);
  let score = 0;
  for (const f of findings) {
    switch (f.id) {
      case "CSP_UNSAFE_EVAL":
        score += 40;
        break;
      case "CSP_UNSAFE_INLINE":
        score += 25;
        break;
      case "CSP_DATA_URI":
        score += 15;
        break;
      case "CSP_REMOTE_SCRIPT":
        score += 30;
        break;
      case "CSP_MISSING":
        score += 10;
        break;
    }
  }
  return { score: Math.min(score, 100), findings };
}
function parseCSPDirectives(cspString) {
  const directives = {};
  for (const part of cspString.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const tokens = trimmed.split(/\s+/);
    const directiveName = tokens[0];
    const sources = tokens.slice(1);
    directives[directiveName] = sources;
  }
  return directives;
}
function getDirectiveSources(directives, name) {
  return directives[name];
}

// src/remote-code/detector.ts
var EVAL_PATTERNS = [
  {
    pattern: /\beval\s*\(/g,
    id: "RCE_EVAL",
    title: "eval() usage detected",
    severity: "critical"
  },
  {
    pattern: /new\s+Function\s*\(/g,
    id: "RCE_FUNCTION_CONSTRUCTOR",
    title: "Function constructor detected",
    severity: "critical"
  },
  {
    pattern: /document\.write\s*\(/g,
    id: "RCE_DOCUMENT_WRITE",
    title: "document.write() usage detected",
    severity: "high"
  },
  {
    pattern: /setTimeout\s*\(\s*['"`]/g,
    id: "RCE_SETTIMEOUT_STRING",
    title: "setTimeout with string argument",
    severity: "high"
  },
  {
    pattern: /setInterval\s*\(\s*['"`]/g,
    id: "RCE_SETINTERVAL_STRING",
    title: "setInterval with string argument",
    severity: "high"
  },
  {
    pattern: /importScripts\s*\(/g,
    id: "RCE_IMPORT_SCRIPTS",
    title: "importScripts() detected",
    severity: "critical"
  }
];
var EXTERNAL_SCRIPT_PATTERN = /<script[^>]+src\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
function detectRemoteCode(files) {
  const findings = [];
  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;
    const jsFindings = scanSourceForEvalPatterns(content, filePath);
    for (const match of jsFindings) {
      findings.push({
        id: match.id,
        category: "remote-code",
        severity: match.severity,
        title: match.title,
        description: `${match.title} in ${filePath} at line ${match.line}. This allows dynamic code execution and is a security risk.`,
        file: filePath,
        line: match.line,
        suggestion: `Remove ${match.pattern} usage. Use static alternatives.`,
        casReference: "MASVS-CODE-3"
      });
    }
  }
  findings.push(...detectExternalScripts(files));
  return findings;
}
function scanSourceForEvalPatterns(source, filePath) {
  const results = [];
  const lines = source.split("\n");
  for (const rule of EVAL_PATTERNS) {
    rule.pattern.lastIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(line)) !== null) {
        results.push({
          id: rule.id,
          title: rule.title,
          pattern: match[0],
          line: i + 1,
          severity: rule.severity
        });
      }
    }
  }
  return results;
}
function detectExternalScripts(files) {
  const findings = [];
  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;
    const isHtml = filePath.endsWith(".html") || filePath.endsWith(".htm");
    if (!isHtml) continue;
    let match;
    EXTERNAL_SCRIPT_PATTERN.lastIndex = 0;
    while ((match = EXTERNAL_SCRIPT_PATTERN.exec(content)) !== null) {
      const url = match[1];
      const line = content.substring(0, match.index).split("\n").length;
      findings.push({
        id: "RCE_EXTERNAL_SCRIPT",
        category: "remote-code",
        severity: "critical",
        title: `External script loaded: ${url}`,
        description: `HTML file loads a script from external URL. Chrome extensions must bundle all scripts locally.`,
        file: filePath,
        line,
        suggestion: "Bundle the script locally instead of loading from an external URL.",
        casReference: "MASVS-CODE-3"
      });
    }
  }
  return findings;
}

// src/content-script/inspector.ts
function analyzeContentScripts(manifest) {
  const findings = [];
  if (!manifest.content_scripts || manifest.content_scripts.length === 0) {
    return findings;
  }
  for (let i = 0; i < manifest.content_scripts.length; i++) {
    const cs = manifest.content_scripts[i];
    const label = `content_scripts[${i}]`;
    for (const pattern of cs.matches) {
      if (isBroadMatchPattern(pattern)) {
        findings.push({
          id: "CS_BROAD_MATCH",
          category: "content-script",
          severity: "high",
          title: `Broad content script match: ${pattern}`,
          description: `${label} matches "${pattern}", injecting into all pages. This grants broad access to page content.`,
          suggestion: "Narrow match patterns to only the sites your extension needs.",
          casReference: "MASVS-PLATFORM-1"
        });
      }
    }
    if (cs.all_frames) {
      findings.push({
        id: "CS_ALL_FRAMES",
        category: "content-script",
        severity: "medium",
        title: `${label}: all_frames enabled`,
        description: "Content script injects into all iframes, including cross-origin frames. This increases the attack surface.",
        suggestion: "Set all_frames to false unless specifically needed for iframe interaction.",
        casReference: "MASVS-PLATFORM-1"
      });
    }
    if (cs.run_at === "document_start") {
      findings.push({
        id: "CS_DOCUMENT_START",
        category: "content-script",
        severity: "low",
        title: `${label}: runs at document_start`,
        description: "Content script runs before the page loads. Can modify page behavior before scripts execute.",
        suggestion: "Use document_idle (default) unless early injection is required.",
        casReference: "MASVS-PLATFORM-1"
      });
    }
  }
  return findings;
}
function isBroadMatchPattern(pattern) {
  if (pattern === "<all_urls>") return true;
  if (/^\*:\/\/\*\/?(\*|\/.*)?$/.test(pattern)) return true;
  return false;
}
function assessInjectionScope(scripts) {
  let broadCount = 0;
  let allFramesCount = 0;
  for (const cs of scripts) {
    for (const pattern of cs.matches) {
      if (isBroadMatchPattern(pattern)) broadCount++;
    }
    if (cs.all_frames) allFramesCount++;
  }
  if (broadCount > 0) {
    return {
      riskLevel: "high",
      details: `${broadCount} content script(s) use broad match patterns. Extension has wide page access.`
    };
  }
  if (allFramesCount > 0) {
    return {
      riskLevel: "medium",
      details: `${allFramesCount} content script(s) inject into all frames.`
    };
  }
  return {
    riskLevel: "low",
    details: "Content scripts use specific match patterns."
  };
}

// src/secrets/scanner.ts
var SECRET_RULES = [
  {
    id: "SECRET_AWS_KEY",
    name: "AWS Access Key",
    pattern: /(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}/g,
    entropyThreshold: 3.5,
    severity: "high"
  },
  {
    id: "SECRET_GITHUB_TOKEN",
    name: "GitHub Token",
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
    entropyThreshold: 0,
    severity: "high"
  },
  {
    id: "SECRET_GOOGLE_API",
    name: "Google API Key",
    pattern: /AIza[A-Za-z0-9_-]{35}/g,
    entropyThreshold: 0,
    severity: "medium"
  },
  {
    id: "SECRET_SLACK_TOKEN",
    name: "Slack Token",
    pattern: /xox[bporas]-[A-Za-z0-9-]{10,}/g,
    entropyThreshold: 0,
    severity: "high"
  },
  {
    id: "SECRET_STRIPE_KEY",
    name: "Stripe Key",
    pattern: /(sk|pk)_(test|live)_[A-Za-z0-9]{20,}/g,
    entropyThreshold: 0,
    severity: "high"
  },
  {
    id: "SECRET_GENERIC_API_KEY",
    name: "Possible API Key",
    pattern: /['"]?(?:api[_-]?key|apikey|api[_-]?secret|apisecret)['"]?\s*[:=]\s*['"]([A-Za-z0-9_\-]{20,})['"]/gi,
    entropyThreshold: 4,
    severity: "medium"
  },
  {
    id: "SECRET_GENERIC_PASSWORD",
    name: "Hardcoded Password",
    pattern: /['"]?(?:password|passwd|pwd|secret)['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
    entropyThreshold: 3,
    severity: "high"
  },
  {
    id: "SECRET_PRIVATE_KEY",
    name: "Private Key",
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    entropyThreshold: 0,
    severity: "high"
  },
  {
    id: "SECRET_JWT_SECRET",
    name: "JWT Secret",
    pattern: /['"]?(?:jwt[_-]?secret|jwt[_-]?key)['"]?\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
    entropyThreshold: 3.5,
    severity: "high"
  }
];
function calculateEntropy(str) {
  if (!str) return 0;
  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
function scanForSecrets(files) {
  const findings = [];
  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;
    for (const rule of SECRET_RULES) {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        const matched = match[1] || match[0];
        if (rule.entropyThreshold > 0 && calculateEntropy(matched) < rule.entropyThreshold) {
          continue;
        }
        const line = content.substring(0, match.index).split("\n").length;
        findings.push({
          id: rule.id,
          category: "secrets",
          severity: rule.severity,
          title: `${rule.name} detected`,
          description: `Found a potential ${rule.name.toLowerCase()} in ${filePath} at line ${line}. Hardcoded secrets in extension code are accessible to anyone who downloads the extension.`,
          file: filePath,
          line,
          suggestion: `Remove the hardcoded secret. Use environment variables at build time or prompt the user for credentials.`,
          casReference: "MASVS-STORAGE-1"
        });
      }
    }
  }
  return findings;
}

// src/privacy/validator.ts
function validatePrivacyPolicy(manifest, metadata) {
  const findings = [];
  const hasPrivacyUrl = !!metadata?.privacyPolicyUrl || !!manifest.homepage_url;
  const { collectsData, indicators } = checkDataCollectionIndicators(
    manifest,
    {}
  );
  if (collectsData && !hasPrivacyUrl) {
    findings.push({
      id: "PRIVACY_NO_POLICY",
      category: "privacy",
      severity: "high",
      title: "No privacy policy found",
      description: `Extension appears to collect data (${indicators.join(", ")}) but no privacy policy URL was found.`,
      suggestion: "Add a privacy policy URL to the Chrome Web Store listing and/or manifest homepage_url.",
      casReference: "MASVS-PRIVACY-3"
    });
  } else if (collectsData && hasPrivacyUrl) {
    findings.push({
      id: "PRIVACY_COLLECTS_DATA",
      category: "privacy",
      severity: "low",
      title: "Extension collects data with privacy policy",
      description: `Extension uses data-related APIs (${indicators.join(", ")}). Verify the privacy policy covers all data collection.`,
      suggestion: "Ensure the privacy policy accurately describes all data collected and how it is used.",
      casReference: "MASVS-PRIVACY-3"
    });
  }
  return findings;
}
function checkDataCollectionIndicators(manifest, files) {
  const indicators = [];
  if (manifest.permissions.includes("cookies")) {
    indicators.push("chrome.cookies API");
  }
  if (manifest.permissions.includes("identity")) {
    indicators.push("chrome.identity API");
  }
  if (manifest.permissions.includes("geolocation")) {
    indicators.push("geolocation access");
  }
  for (const [, content] of Object.entries(files)) {
    if (!content) continue;
    if (/chrome\.cookies\b/.test(content) && !indicators.includes("chrome.cookies API")) {
      indicators.push("chrome.cookies API");
    }
    if (/\bfetch\s*\(/.test(content) || /XMLHttpRequest/.test(content)) {
      indicators.push("network requests (fetch/XHR)");
    }
    if (/navigator\.geolocation/.test(content)) {
      indicators.push("geolocation access");
    }
    if (/navigator\.mediaDevices/.test(content)) {
      indicators.push("media device access");
    }
    if (/google-analytics|googletagmanager|mixpanel|amplitude|segment\.com/i.test(content)) {
      indicators.push("analytics tracking");
    }
    if (/localStorage\.|sessionStorage\./.test(content)) {
      indicators.push("local/session storage usage");
    }
  }
  return {
    collectsData: indicators.length > 0,
    indicators: [...new Set(indicators)]
  };
}

// src/single-purpose/checker.ts
var PERMISSION_DOMAINS = {
  "network-interception": ["webRequest", "webRequestBlocking", "proxy"],
  "tab-management": ["tabs", "activeTab", "tabCapture"],
  "data-access": ["cookies", "storage", "browsingData"],
  "dom-manipulation": ["scripting", "contentScripts"],
  "media": ["desktopCapture", "pageCapture", "tabCapture"],
  "system": ["management", "nativeMessaging", "debugger"],
  "identity": ["identity", "identity.email"],
  "notifications": ["notifications", "alarms"]
};
function categorizePermissionsByDomain(permissions) {
  const result = {};
  const permSet = new Set(permissions);
  for (const [domain, domainPerms] of Object.entries(PERMISSION_DOMAINS)) {
    const matched = domainPerms.filter((p) => permSet.has(p));
    if (matched.length > 0) {
      result[domain] = matched;
    }
  }
  return result;
}
function checkSinglePurpose(manifest) {
  const findings = [];
  const allPerms = [...manifest.permissions];
  const domainMap = categorizePermissionsByDomain(allPerms);
  const activeDomains = Object.keys(domainMap);
  if (activeDomains.length >= 3) {
    findings.push({
      id: "SP_MULTI_DOMAIN",
      category: "single-purpose",
      severity: "medium",
      title: "Permissions span multiple functional domains",
      description: `Extension uses permissions from ${activeDomains.length} different domains: ${activeDomains.join(", ")}. Chrome's single-purpose policy requires extensions to have a narrow, focused purpose.`,
      suggestion: "Review if all permission domains are necessary for a single purpose. Consider splitting into multiple extensions.",
      casReference: "MASVS-PRIVACY-2"
    });
  }
  if (manifest.content_scripts && manifest.content_scripts.length > 0) {
    const contentDomains = /* @__PURE__ */ new Set();
    for (const cs of manifest.content_scripts) {
      for (const pattern of cs.matches) {
        if (pattern.includes("://")) {
          try {
            const url = pattern.replace(/\*:/g, "https:").replace(/\/\*$/, "");
            const domain = new URL(url).hostname;
            contentDomains.add(domain);
          } catch {
          }
        }
      }
    }
    if (contentDomains.size > 5) {
      findings.push({
        id: "SP_MULTI_SITE_INJECTION",
        category: "single-purpose",
        severity: "medium",
        title: `Content scripts target ${contentDomains.size} different domains`,
        description: `Content scripts inject into pages on ${contentDomains.size} different domains. Wide injection scope may indicate multi-purpose functionality.`,
        suggestion: "Reduce content script injection to only the sites your extension modifies.",
        casReference: "MASVS-PRIVACY-2"
      });
    }
  }
  return findings;
}

// src/obfuscation/detector.ts
var OBFUSCATION_SIGNATURES = [
  { pattern: /_0x[a-f0-9]{4,8}/gi, name: "hex-variable-names", minCount: 5 },
  { pattern: /\\x[0-9a-f]{2}/gi, name: "hex-escape-sequences", minCount: 50 },
  { pattern: /String\.fromCharCode/gi, name: "fromCharCode-heavy", minCount: 10 },
  { pattern: /atob\s*\(/gi, name: "base64-decoding-heavy", minCount: 5 },
  {
    pattern: /\[['"]\w+['"]\]\s*\[['"]\w+['"]\]/g,
    name: "bracket-notation-chains",
    minCount: 20
  },
  {
    pattern: /var\s+\w+\s*=\s*\[('[^']+',?\s*){20,}\]/g,
    name: "string-array-declaration",
    minCount: 1
  }
];
function detectObfuscation(files) {
  const findings = [];
  for (const [filePath, content] of Object.entries(files)) {
    if (!content || !filePath.endsWith(".js")) continue;
    const score = analyzeObfuscationScore(content);
    if (score >= 70) {
      findings.push({
        id: "OBF_HIGH",
        category: "obfuscation",
        severity: "high",
        title: "Heavily obfuscated code detected",
        description: `${filePath} has an obfuscation score of ${score}/100. Heavily obfuscated code may hide malicious behavior.`,
        file: filePath,
        suggestion: "Provide unminified source code. Chrome Web Store requires readable code for review.",
        casReference: "MASVS-CODE-4"
      });
    } else if (score >= 40) {
      findings.push({
        id: "OBF_MEDIUM",
        category: "obfuscation",
        severity: "medium",
        title: "Potentially obfuscated code",
        description: `${filePath} has an obfuscation score of ${score}/100. Some obfuscation indicators were detected.`,
        file: filePath,
        suggestion: "Verify that the code is legitimately minified, not obfuscating malicious behavior.",
        casReference: "MASVS-CODE-4"
      });
    }
    const signatures = detectObfuscationSignatures(content);
    if (signatures.length > 0) {
      findings.push({
        id: "OBF_SIGNATURES",
        category: "obfuscation",
        severity: "medium",
        title: `Obfuscation toolkit signatures: ${signatures.join(", ")}`,
        description: `${filePath} contains patterns typical of code obfuscation tools.`,
        file: filePath,
        suggestion: "Submit unobfuscated source code for CASA review.",
        casReference: "MASVS-CODE-4"
      });
    }
  }
  return findings;
}
function analyzeObfuscationScore(source) {
  if (!source) return 0;
  let score = 0;
  const lines = source.split("\n");
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return 0;
  const avgLineLength = nonEmptyLines.reduce((sum, l) => sum + l.length, 0) / nonEmptyLines.length;
  if (avgLineLength > 300) score += 30;
  else if (avgLineLength > 200) score += 20;
  else if (avgLineLength > 100) score += 10;
  const totalChars = source.length;
  const whitespaceChars = (source.match(/\s/g) || []).length;
  const wsRatio = whitespaceChars / totalChars;
  if (wsRatio < 0.05) score += 25;
  else if (wsRatio < 0.1) score += 15;
  const highEntropyLines = nonEmptyLines.filter(
    (l) => calculateLineEntropy(l) > 5
  ).length;
  const highEntropyRatio = highEntropyLines / nonEmptyLines.length;
  if (highEntropyRatio > 0.5) score += 25;
  else if (highEntropyRatio > 0.3) score += 15;
  const base64Pattern = /['"]([A-Za-z0-9+/]{100,}={0,2})['"]/g;
  const base64Matches = source.match(base64Pattern) || [];
  if (base64Matches.length > 5) score += 20;
  else if (base64Matches.length > 0) score += 10;
  return Math.min(score, 100);
}
function detectObfuscationSignatures(source) {
  const found = [];
  for (const sig of OBFUSCATION_SIGNATURES) {
    sig.pattern.lastIndex = 0;
    const matches = source.match(sig.pattern) || [];
    if (matches.length >= sig.minCount) {
      found.push(sig.name);
    }
  }
  return found;
}
function calculateLineEntropy(line) {
  if (!line) return 0;
  const freq = {};
  for (const char of line) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = line.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// src/network/checker.ts
var URL_PATTERN = /\bhttps?:\/\/[^\s'"<>)}\]]+/gi;
var WS_PATTERN = /\bws[s]?:\/\/[^\s'"<>)}\]]+/gi;
var SAFE_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
function detectInsecureUrls(files) {
  const findings = [];
  const seen = /* @__PURE__ */ new Set();
  for (const [filePath, content] of Object.entries(files)) {
    if (!content) continue;
    URL_PATTERN.lastIndex = 0;
    let match;
    while ((match = URL_PATTERN.exec(content)) !== null) {
      const url = match[0];
      if (!url.startsWith("http://")) continue;
      try {
        const hostname = new URL(url).hostname;
        if (SAFE_HOSTS.includes(hostname)) continue;
      } catch {
        continue;
      }
      const key = `${filePath}:${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const line = content.substring(0, match.index).split("\n").length;
      findings.push({
        id: "NET_HTTP_URL",
        category: "network",
        severity: "medium",
        title: "Insecure HTTP URL detected",
        description: `HTTP (non-HTTPS) URL found in ${filePath}: ${url}. Data transmitted over HTTP can be intercepted.`,
        file: filePath,
        line,
        suggestion: "Use HTTPS instead of HTTP for all external URLs.",
        casReference: "MASVS-NETWORK-1"
      });
    }
  }
  return findings;
}
function checkUpdateUrl(manifest) {
  const findings = [];
  if (manifest.update_url && manifest.update_url.startsWith("http://")) {
    findings.push({
      id: "NET_INSECURE_UPDATE",
      category: "network",
      severity: "high",
      title: "Insecure update URL",
      description: `update_url uses HTTP: ${manifest.update_url}. Extension updates could be intercepted.`,
      suggestion: "Use HTTPS for the update_url.",
      casReference: "MASVS-NETWORK-1"
    });
  }
  return findings;
}
function extractUrls(source) {
  const result = { http: [], https: [], ws: [], wss: [] };
  URL_PATTERN.lastIndex = 0;
  let match;
  while ((match = URL_PATTERN.exec(source)) !== null) {
    const url = match[0];
    if (url.startsWith("http://")) result.http.push(url);
    else result.https.push(url);
  }
  WS_PATTERN.lastIndex = 0;
  while ((match = WS_PATTERN.exec(source)) !== null) {
    const url = match[0];
    if (url.startsWith("wss://")) result.wss.push(url);
    else result.ws.push(url);
  }
  return result;
}

// src/dependency/checker.ts
var VULNERABLE_LIBRARIES = [
  {
    name: "jQuery",
    pattern: /jquery[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: "3.5.0",
    cve: "CVE-2020-11022",
    severity: "medium"
  },
  {
    name: "AngularJS",
    pattern: /angular(?:\.js)?[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: "1.8.0",
    severity: "high"
  },
  {
    name: "Lodash",
    pattern: /lodash[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: "4.17.21",
    cve: "CVE-2021-23337",
    severity: "high"
  },
  {
    name: "Handlebars",
    pattern: /handlebars[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: "4.7.7",
    cve: "CVE-2021-23369",
    severity: "critical"
  },
  {
    name: "Prototype.js",
    pattern: /prototype\.?js?[\/\s]v?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/gi,
    maxSafeVersion: "1.7.3",
    cve: "CVE-2020-27587",
    severity: "high"
  }
];
function checkDependencies(files) {
  const findings = [];
  const seen = /* @__PURE__ */ new Set();
  for (const [filePath, content] of Object.entries(files)) {
    if (!content || !filePath.endsWith(".js")) continue;
    for (const lib of VULNERABLE_LIBRARIES) {
      lib.pattern.lastIndex = 0;
      let match;
      while ((match = lib.pattern.exec(content)) !== null) {
        const version = match[1];
        if (compareVersions(version, lib.maxSafeVersion) < 0) {
          const key = `${lib.name}:${version}:${filePath}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const line = content.substring(0, match.index).split("\n").length;
          findings.push({
            id: `DEP_${lib.name.toUpperCase()}_${version.replace(/\./g, "_")}`,
            category: "dependency",
            severity: lib.severity,
            title: `Vulnerable ${lib.name} v${version}`,
            description: `${lib.name} version ${version} in ${filePath} has known vulnerabilities${lib.cve ? ` (${lib.cve})` : ""}. Safe version: >=${lib.maxSafeVersion}.`,
            file: filePath,
            line,
            suggestion: `Update ${lib.name} to version ${lib.maxSafeVersion} or later.`,
            casReference: "MASVS-CODE-2"
          });
        }
      }
    }
  }
  return findings;
}
function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

// src/scoring/calculator.ts
function calculateOverallScore(findings) {
  let score = 0;
  for (const finding of findings) {
    switch (finding.severity) {
      case "critical":
        score += 25;
        break;
      case "high":
        score += 12;
        break;
      case "medium":
        score += 5;
        break;
      case "low":
        score += 2;
        break;
    }
  }
  return Math.min(score, 100);
}
function scoreToRiskLevel(score) {
  if (score <= 20) return "low";
  if (score <= 50) return "medium";
  if (score <= 80) return "high";
  return "critical";
}
function calculateSummary(findings) {
  const summary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  for (const finding of findings) {
    summary.total++;
    summary[finding.severity]++;
  }
  return summary;
}

// src/report/generator.ts
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
function generateScanReport(input) {
  const { manifest, files, metadata } = input;
  const validationErrors = validateManifest(manifest);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid manifest: ${validationErrors.join(", ")}`);
  }
  const allFindings = [];
  const permResult = calculatePermissionScore(manifest);
  allFindings.push(...permResult.findings);
  const cspResult = calculateCSPScore(manifest);
  allFindings.push(...cspResult.findings);
  const remoteCodeFindings = detectRemoteCode(files);
  allFindings.push(...remoteCodeFindings);
  const csFindings = analyzeContentScripts(manifest);
  allFindings.push(...csFindings);
  const secretFindings = scanForSecrets(files);
  allFindings.push(...secretFindings);
  const privacyFindings = validatePrivacyPolicy(manifest, metadata);
  allFindings.push(...privacyFindings);
  const spFindings = checkSinglePurpose(manifest);
  allFindings.push(...spFindings);
  const obfFindings = detectObfuscation(files);
  allFindings.push(...obfFindings);
  const netFindings = detectInsecureUrls(files);
  const updateFindings = checkUpdateUrl(manifest);
  allFindings.push(...netFindings, ...updateFindings);
  const depFindings = checkDependencies(files);
  allFindings.push(...depFindings);
  const deduped = deduplicateFindings(allFindings);
  const riskScore = calculateOverallScore(deduped);
  const riskLevel = scoreToRiskLevel(riskScore);
  const summary = calculateSummary(deduped);
  const categories = groupFindingsByCategory(deduped);
  const permissionsReport = analyzePermissions(manifest);
  const cspReport = parseCSP(manifest);
  return {
    id: generateId(),
    extensionName: manifest.name,
    extensionVersion: manifest.version,
    manifestVersion: manifest.manifest_version,
    scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
    riskScore,
    riskLevel,
    summary,
    categories,
    findings: deduped,
    permissions: permissionsReport,
    csp: cspReport,
    metadata: metadata ?? null
  };
}
function generateHtmlReport(report) {
  const riskColor = report.riskLevel === "critical" ? "#dc2626" : report.riskLevel === "high" ? "#ea580c" : report.riskLevel === "medium" ? "#ca8a04" : "#16a34a";
  const findingsHtml = report.findings.map(
    (f) => `
    <div class="finding finding-${f.severity}">
      <div class="finding-header">
        <span class="severity-badge severity-${f.severity}">${f.severity.toUpperCase()}</span>
        <span class="finding-title">${escapeHtml(f.title)}</span>
      </div>
      <p class="finding-desc">${escapeHtml(f.description)}</p>
      ${f.file ? `<p class="finding-file">File: ${escapeHtml(f.file)}${f.line ? `:${f.line}` : ""}</p>` : ""}
      <p class="finding-suggestion"><strong>Fix:</strong> ${escapeHtml(f.suggestion)}</p>
      ${f.casReference ? `<p class="finding-cas">CASA: ${escapeHtml(f.casReference)}</p>` : ""}
    </div>`
  ).join("\n");
  const categoryHtml = report.categories.map(
    (c) => `
    <div class="category-row">
      <span class="category-name">${escapeHtml(c.category)}</span>
      <div class="category-bar">
        <div class="category-fill" style="width: ${c.score}%; background: ${scoreToColor(c.score)}"></div>
      </div>
      <span class="category-score">${c.score}</span>
      <span class="category-count">${c.findings.length} finding(s)</span>
    </div>`
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ExtensionShield Report: ${escapeHtml(report.extensionName)} v${escapeHtml(report.extensionVersion)}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 2rem; max-width: 960px; margin: 0 auto; }
h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
.risk-gauge { display: flex; align-items: center; gap: 1rem; }
.risk-score { font-size: 3rem; font-weight: 800; color: ${riskColor}; }
.risk-level { font-size: 1rem; font-weight: 600; color: ${riskColor}; text-transform: uppercase; }
.summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
.summary-item { padding: 1rem; border-radius: 8px; background: white; border: 1px solid #e2e8f0; text-align: center; flex: 1; }
.summary-count { font-size: 1.5rem; font-weight: 700; }
.summary-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
.section { margin-bottom: 2rem; }
.section h2 { font-size: 1.125rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; }
.category-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; }
.category-name { width: 120px; font-size: 0.875rem; font-weight: 500; }
.category-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.category-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.category-score { width: 32px; text-align: right; font-weight: 600; font-size: 0.875rem; }
.category-count { width: 100px; font-size: 0.75rem; color: #64748b; }
.finding { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; border-left: 4px solid #e2e8f0; }
.finding-critical { border-left-color: #dc2626; }
.finding-high { border-left-color: #ea580c; }
.finding-medium { border-left-color: #ca8a04; }
.finding-low { border-left-color: #16a34a; }
.finding-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.severity-badge { font-size: 0.625rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 4px; color: white; }
.severity-critical { background: #dc2626; }
.severity-high { background: #ea580c; }
.severity-medium { background: #ca8a04; }
.severity-low { background: #16a34a; }
.finding-title { font-weight: 600; font-size: 0.875rem; }
.finding-desc { font-size: 0.8125rem; color: #475569; margin-bottom: 0.25rem; }
.finding-file { font-size: 0.75rem; color: #6366f1; font-family: monospace; }
.finding-suggestion { font-size: 0.8125rem; margin-top: 0.5rem; }
.finding-cas { font-size: 0.75rem; color: #64748b; }
.footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>ExtensionShield Security Report</h1>
    <p>${escapeHtml(report.extensionName)} v${escapeHtml(report.extensionVersion)} &mdash; MV${report.manifestVersion}</p>
    <p style="font-size:0.75rem;color:#94a3b8">Scanned: ${new Date(report.scannedAt).toLocaleString()}</p>
  </div>
  <div class="risk-gauge">
    <div>
      <div class="risk-score">${report.riskScore}</div>
      <div class="risk-level">${report.riskLevel} risk</div>
    </div>
  </div>
</div>

<div class="summary">
  <div class="summary-item"><div class="summary-count" style="color:#dc2626">${report.summary.critical}</div><div class="summary-label">Critical</div></div>
  <div class="summary-item"><div class="summary-count" style="color:#ea580c">${report.summary.high}</div><div class="summary-label">High</div></div>
  <div class="summary-item"><div class="summary-count" style="color:#ca8a04">${report.summary.medium}</div><div class="summary-label">Medium</div></div>
  <div class="summary-item"><div class="summary-count" style="color:#16a34a">${report.summary.low}</div><div class="summary-label">Low</div></div>
  <div class="summary-item"><div class="summary-count">${report.summary.total}</div><div class="summary-label">Total</div></div>
</div>

<div class="section">
  <h2>Category Breakdown</h2>
  ${categoryHtml}
</div>

<div class="section">
  <h2>Findings (${report.summary.total})</h2>
  ${findingsHtml || '<p style="color:#16a34a;font-weight:600">No issues found. Extension passes all checks.</p>'}
</div>

<div class="footer">
  Generated by ExtensionShield &mdash; Chrome Extension Security Scanner
</div>
</body>
</html>`;
}
function groupFindingsByCategory(findings) {
  const categoryMap = /* @__PURE__ */ new Map();
  for (const finding of findings) {
    const existing = categoryMap.get(finding.category) || [];
    existing.push(finding);
    categoryMap.set(finding.category, existing);
  }
  const allCategories = [
    "permission",
    "csp",
    "remote-code",
    "content-script",
    "secrets",
    "privacy",
    "single-purpose",
    "obfuscation",
    "network",
    "dependency"
  ];
  return allCategories.map((category) => {
    const catFindings = categoryMap.get(category) || [];
    const score = catFindings.length === 0 ? 0 : Math.min(
      catFindings.reduce((sum, f) => {
        switch (f.severity) {
          case "critical":
            return sum + 25;
          case "high":
            return sum + 12;
          case "medium":
            return sum + 5;
          case "low":
            return sum + 2;
        }
      }, 0),
      100
    );
    return { category, score, findings: catFindings };
  });
}
function deduplicateFindings(findings) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const f of findings) {
    const key = `${f.id}:${f.file || ""}:${f.line || 0}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(f);
    }
  }
  return result;
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function scoreToColor(score) {
  if (score >= 80) return "#dc2626";
  if (score >= 50) return "#ea580c";
  if (score >= 20) return "#ca8a04";
  return "#16a34a";
}

// src/extractor/index.ts
import { unzipSync, strFromU8 } from "fflate";
var CRX_MAGIC = new Uint8Array([67, 114, 50, 52]);
async function extractFromCrx(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== CRX_MAGIC[0] || bytes[1] !== CRX_MAGIC[1] || bytes[2] !== CRX_MAGIC[2] || bytes[3] !== CRX_MAGIC[3]) {
    throw new Error("Not a valid CRX file: missing Cr24 magic bytes");
  }
  const version = new DataView(buffer).getUint32(4, true);
  let zipOffset;
  if (version === 3) {
    const headerSize = new DataView(buffer).getUint32(8, true);
    zipOffset = 12 + headerSize;
  } else if (version === 2) {
    const pubkeyLen = new DataView(buffer).getUint32(8, true);
    const sigLen = new DataView(buffer).getUint32(12, true);
    zipOffset = 16 + pubkeyLen + sigLen;
  } else {
    throw new Error(`Unsupported CRX version: ${version}`);
  }
  const zipBuffer = buffer.slice(zipOffset);
  return extractFromZip(zipBuffer);
}
async function extractFromZip(buffer) {
  const unzipped = unzipSync(new Uint8Array(buffer));
  const files = {};
  let manifest = null;
  for (const [path, data] of Object.entries(unzipped)) {
    const normalizedPath = path.includes("/") ? path.split("/").slice(1).join("/") : path;
    if (normalizedPath === "manifest.json") {
      const content = strFromU8(data);
      manifest = JSON.parse(content);
      files["manifest.json"] = content;
    } else if (isTextFile(normalizedPath)) {
      try {
        files[normalizedPath] = strFromU8(data);
      } catch {
      }
    }
  }
  if (!manifest) {
    throw new Error("No manifest.json found in archive");
  }
  return { manifest, files };
}
async function extractExtension(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 4 && bytes[0] === CRX_MAGIC[0] && bytes[1] === CRX_MAGIC[1] && bytes[2] === CRX_MAGIC[2] && bytes[3] === CRX_MAGIC[3]) {
    const result = await extractFromCrx(buffer);
    return { ...result, format: "crx" };
  }
  if (bytes.length >= 4 && bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) {
    const result = await extractFromZip(buffer);
    return { ...result, format: "zip" };
  }
  throw new Error("Unsupported file format. Please upload a CRX or ZIP file.");
}
function isTextFile(path) {
  const textExtensions = [
    ".js",
    ".ts",
    ".html",
    ".htm",
    ".css",
    ".json",
    ".xml",
    ".svg",
    ".txt",
    ".md",
    ".csv",
    ".yml",
    ".yaml"
  ];
  const lower = path.toLowerCase();
  return textExtensions.some((ext) => lower.endsWith(ext));
}
export {
  DANGEROUS_COMBOS,
  DANGEROUS_PERMISSIONS,
  SECRET_RULES,
  VULNERABLE_LIBRARIES,
  analyzeCSP,
  analyzeContentScripts,
  analyzeObfuscationScore,
  analyzePermissions,
  assessInjectionScope,
  buildScanInput,
  calculateCSPScore,
  calculateEntropy,
  calculateOverallScore,
  calculatePermissionScore,
  calculateSummary,
  categorizePermissionsByDomain,
  checkDataCollectionIndicators,
  checkDependencies,
  checkSinglePurpose,
  checkUpdateUrl,
  detectBroadHostPermissions,
  detectDangerousCombos,
  detectExternalScripts,
  detectInsecureUrls,
  detectObfuscation,
  detectObfuscationSignatures,
  detectRemoteCode,
  extractExtension,
  extractFromCrx,
  extractFromZip,
  extractJavaScriptPaths,
  extractUrls,
  generateHtmlReport,
  generateScanReport,
  groupFindingsByCategory,
  isBroadMatchPattern,
  parseCSP,
  parseManifest,
  scanForSecrets,
  scanSourceForEvalPatterns,
  scoreToRiskLevel,
  validateManifest,
  validatePrivacyPolicy
};
//# sourceMappingURL=index.js.map