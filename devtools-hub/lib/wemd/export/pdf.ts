/**
 * WeMD Pro PDF Export — Uses browser print dialog with optimized print CSS.
 */

import { exportAsHtml } from '../copy/wechatCopy';

interface PDFExportOptions {
  themeId: string;
  linkToFootnote: boolean;
  title?: string;
}

/**
 * Export markdown content as PDF via browser print dialog.
 * Opens a new window with styled HTML and triggers print.
 */
export function exportAsPdf(content: string, options: PDFExportOptions): void {
  const { themeId, linkToFootnote, title = 'wechat-article' } = options;

  const html = exportAsHtml(content, themeId, [], { linkToFootnote });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口，请允许弹出窗口后重试');
    return;
  }

  const printDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      max-width: 680px;
      margin: 0 auto;
      padding: 20px;
      color: #1e293b;
      line-height: 1.8;
      font-size: 14px;
    }

    h1 { font-size: 22px; margin: 24px 0 16px; font-weight: 700; }
    h2 { font-size: 18px; margin: 20px 0 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 16px; margin: 16px 0 8px; font-weight: 600; }

    p { margin: 8px 0; }
    blockquote {
      border-left: 4px solid #07c160;
      margin: 12px 0;
      padding: 8px 16px;
      color: #64748b;
      background: #f8fafc;
    }

    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
      font-family: "SF Mono", "Fira Code", monospace;
    }

    pre {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }
    pre code { background: none; padding: 0; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }
    th { background: #f8fafc; font-weight: 600; }

    img { max-width: 100%; height: auto; border-radius: 4px; }
    a { color: #07c160; text-decoration: none; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }

    ul, ol { padding-left: 24px; }
    li { margin: 4px 0; }

    @media print {
      body { padding: 0; max-width: 100%; }
      pre { white-space: pre-wrap; word-break: break-word; }
      h1, h2, h3 { page-break-after: avoid; }
      img { page-break-inside: avoid; }

      @page {
        size: A4;
        margin: 20mm 15mm;
      }
    }
  </style>
</head>
<body>
  <div id="content">${html}</div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(printDoc);
  printWindow.document.close();
}
