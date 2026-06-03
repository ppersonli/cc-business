import type { Theme } from '../../types'

export const basic: Theme = {
  id: 'basic',
  name: 'Basic',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #333333;
      background: #ffffff;
      padding: 20px 16px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 24px;
      font-weight: 700;
      color: #111111;
      margin: 28px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #eeeeee;
    }

    .wemd-preview h2 {
      font-size: 20px;
      font-weight: 600;
      color: #222222;
      margin: 24px 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #eeeeee;
    }

    .wemd-preview h3 {
      font-size: 17px;
      font-weight: 600;
      color: #333333;
      margin: 20px 0 10px 0;
    }

    .wemd-preview p {
      margin: 12px 0;
    }

    .wemd-preview a {
      color: #1a73e8;
      text-decoration: none;
    }

    .wemd-preview a:hover {
      text-decoration: underline;
    }

    .wemd-preview blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      border-left: 4px solid #d0d7de;
      background: #f8f9fa;
      color: #57606a;
      font-size: 14px;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 16px 0;
      padding: 14px 16px;
      background: #f6f8fa;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }

    .wemd-preview code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      padding: 2px 6px;
      background: #f0f0f0;
      border-radius: 3px;
      color: #476582;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: #333333;
    }

    .wemd-preview .hljs {
      background: transparent;
      padding: 0;
    }

    .wemd-preview table {
      width: 100%;
      margin: 16px 0;
      border-collapse: collapse;
      font-size: 14px;
    }

    .wemd-preview th {
      padding: 10px 12px;
      background: #f6f8fa;
      border: 1px solid #d0d7de;
      font-weight: 600;
      text-align: left;
    }

    .wemd-preview td {
      padding: 8px 12px;
      border: 1px solid #d0d7de;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    .wemd-preview li {
      margin: 4px 0;
    }

    .wemd-preview hr {
      margin: 24px 0;
      border: none;
      border-top: 1px solid #d0d7de;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 12px 0;
    }

    .wemd-preview strong {
      font-weight: 600;
      color: #111111;
    }

    .wemd-preview del {
      color: #999999;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #fff3b0;
      color: #333333;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 16px;
      height: 16px;
    }
  `,
}
