import { unzipSync, strFromU8 } from 'fflate';

const CRX_MAGIC = new Uint8Array([0x43, 0x72, 0x32, 0x34]); // "Cr24"

export async function extractFromCrx(buffer: ArrayBuffer): Promise<{
  manifest: Record<string, unknown>;
  files: Record<string, string>;
}> {
  const bytes = new Uint8Array(buffer);

  // Verify CRX magic bytes
  if (
    bytes[0] !== CRX_MAGIC[0] ||
    bytes[1] !== CRX_MAGIC[1] ||
    bytes[2] !== CRX_MAGIC[2] ||
    bytes[3] !== CRX_MAGIC[3]
  ) {
    throw new Error('Not a valid CRX file: missing Cr24 magic bytes');
  }

  // Read version (uint32 LE at offset 4)
  const version = new DataView(buffer).getUint32(4, true);

  let zipOffset: number;

  if (version === 3) {
    // CRX3: magic(4) + version(4) + headerSize(4) + header(headerSize)
    const headerSize = new DataView(buffer).getUint32(8, true);
    zipOffset = 12 + headerSize;
  } else if (version === 2) {
    // CRX2: magic(4) + version(4) + pubkeyLen(4) + sigLen(4) + pubkey + sig
    const pubkeyLen = new DataView(buffer).getUint32(8, true);
    const sigLen = new DataView(buffer).getUint32(12, true);
    zipOffset = 16 + pubkeyLen + sigLen;
  } else {
    throw new Error(`Unsupported CRX version: ${version}`);
  }

  const zipBuffer = buffer.slice(zipOffset);
  return extractFromZip(zipBuffer);
}

export async function extractFromZip(buffer: ArrayBuffer): Promise<{
  manifest: Record<string, unknown>;
  files: Record<string, string>;
}> {
  const unzipped = unzipSync(new Uint8Array(buffer));
  const files: Record<string, string> = {};
  let manifest: Record<string, unknown> | null = null;

  for (const [path, data] of Object.entries(unzipped)) {
    // Normalize path (remove leading directory if present)
    const normalizedPath = path.includes('/') ? path.split('/').slice(1).join('/') : path;

    if (normalizedPath === 'manifest.json') {
      const content = strFromU8(data);
      manifest = JSON.parse(content);
      files['manifest.json'] = content;
    } else if (isTextFile(normalizedPath)) {
      try {
        files[normalizedPath] = strFromU8(data);
      } catch {
        // Binary file, skip
      }
    }
  }

  if (!manifest) {
    throw new Error('No manifest.json found in archive');
  }

  return { manifest, files };
}

export async function extractExtension(buffer: ArrayBuffer): Promise<{
  manifest: Record<string, unknown>;
  files: Record<string, string>;
  format: 'crx' | 'zip';
}> {
  const bytes = new Uint8Array(buffer);

  // Check for CRX magic
  if (
    bytes.length >= 4 &&
    bytes[0] === CRX_MAGIC[0] &&
    bytes[1] === CRX_MAGIC[1] &&
    bytes[2] === CRX_MAGIC[2] &&
    bytes[3] === CRX_MAGIC[3]
  ) {
    const result = await extractFromCrx(buffer);
    return { ...result, format: 'crx' };
  }

  // Check for ZIP magic (PK\x03\x04)
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const result = await extractFromZip(buffer);
    return { ...result, format: 'zip' };
  }

  throw new Error('Unsupported file format. Please upload a CRX or ZIP file.');
}

function isTextFile(path: string): boolean {
  const textExtensions = [
    '.js',
    '.ts',
    '.html',
    '.htm',
    '.css',
    '.json',
    '.xml',
    '.svg',
    '.txt',
    '.md',
    '.csv',
    '.yml',
    '.yaml',
  ];
  const lower = path.toLowerCase();
  return textExtensions.some((ext) => lower.endsWith(ext));
}
