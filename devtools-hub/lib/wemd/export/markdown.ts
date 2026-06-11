/**
 * WeMD Markdown File I/O — Import/export .md files.
 */

/**
 * Export current content as a .md file download.
 */
export function exportMarkdown(content: string, filename?: string): void {
  const title = extractTitle(content);
  const name = filename || `${title || 'wechat-article'}.md`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a .md file and return its content.
 * Returns null if user cancels or file is invalid.
 */
export function importMarkdown(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt,.text';
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('文件过大，最大支持 5MB');
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };

    input.oncancel = () => resolve(null);

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}

/**
 * Extract the first H1 title from markdown content.
 */
function extractTitle(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.slice(2).replace(/[*_`~]/g, '').slice(0, 50);
    }
  }
  return '';
}
