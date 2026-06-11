/**
 * WeMD Image Upload — Handle paste/drop image events in the editor.
 * Converts clipboard images to base64 Data URLs or uploads to image host.
 */

import type { EditorView } from '@codemirror/view';

/** Max image size for base64 embed (2MB) */
const MAX_BASE64_SIZE = 2 * 1024 * 1024;

/**
 * Convert a File to base64 Data URL.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to SM.MS free image host.
 * Falls back to base64 if upload fails.
 */
async function uploadToSmMs(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('smfile', file);

    const res = await fetch('https://sm.ms/api/v2/upload', {
      method: 'POST',
      headers: {
        // SM.MS allows anonymous uploads without token for small files
      },
      body: formData,
    });

    const data = await res.json();
    if (data.success && data.data?.url) {
      return data.data.url;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Process an image file and insert into the editor.
 * Small images → base64 Data URL
 * Large images → attempt SM.MS upload, fallback to base64
 */
export async function processImageFile(
  file: File,
  view: EditorView,
): Promise<void> {
  const { from } = view.state.selection.main;

  // Insert placeholder
  const placeholder = `![uploading ${file.name}...](...)`;
  view.dispatch({
    changes: { from, to: from, insert: placeholder },
  });

  let imageUrl: string;

  if (file.size <= MAX_BASE64_SIZE) {
    // Small file: embed as base64
    imageUrl = await fileToDataUrl(file);
  } else {
    // Large file: try upload, fallback to base64
    const uploaded = await uploadToSmMs(file);
    imageUrl = uploaded || (await fileToDataUrl(file));
  }

  // Replace placeholder with actual image
  const currentDoc = view.state.doc.toString();
  const placeholderStart = currentDoc.indexOf(placeholder);
  if (placeholderStart !== -1) {
    const alt = file.name.replace(/\.[^.]+$/, '') || 'image';
    const replacement = `![${alt}](${imageUrl})`;
    view.dispatch({
      changes: {
        from: placeholderStart,
        to: placeholderStart + placeholder.length,
        insert: replacement,
      },
      selection: { anchor: placeholderStart + replacement.length },
    });
  }
}

/**
 * Handle paste event — detect images in clipboard.
 * Returns true if an image was handled.
 */
export function handlePasteImage(
  event: ClipboardEvent,
  view: EditorView,
): boolean {
  const items = event.clipboardData?.items;
  if (!items) return false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        processImageFile(file, view);
        return true;
      }
    }
  }
  return false;
}

/**
 * Handle drop event — detect image files being dropped.
 * Returns true if an image was handled.
 */
export function handleDropImage(
  event: DragEvent,
  view: EditorView,
): boolean {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return false;

  let handled = false;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      event.preventDefault();
      processImageFile(file, view);
      handled = true;
    }
  }
  return handled;
}
