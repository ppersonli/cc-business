import type { Theme } from '../../types'

export const codeGithub: Theme = {
  id: 'code-github',
  name: 'GitHub',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #1f2328;
      background: #ffffff;
      padding: 22px 18px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2328;
      margin: 28px 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #d1d9e0;
    }

    .wemd-preview h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1f2328;
      margin: 24px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #d1d9e0;
    }

    .wemd-preview h3 {
      font-size: 17px;
      font-weight: 600;
      color: #1f2328;
      margin: 20px 0 8px 0;
    }

    .wemd-preview p {
      margin: 12px 0;
    }

    .wemd-preview a {
      color: #0366d6;
      text-decoration: none;
    }

    .wemd-preview a:hover {
      text-decoration: underline;
    }

    .wemd-preview blockquote {
      margin: 16px 0;
      padding: 8px 16px;
      border-left: 4px solid #d1d9e0;
      color: #636c76;
      font-size: 14px;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 16px 0;
      padding: 16px;
      background: #f6f8fa;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.55;
      border: 1px solid #d1d9e0;
    }

    .wemd-preview code {
      font-family: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 13px;
      padding: 2px 6px;
      background: #eff1f3;
      border-radius: 4px;
      color: #1f2328;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: #1f2328;
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
      border: 1px solid #d1d9e0;
    }

    .wemd-preview th {
      padding: 8px 13px;
      background: #f6f8fa;
      border: 1px solid #d1d9e0;
      font-weight: 600;
      text-align: left;
    }

    .wemd-preview td {
      padding: 8px 13px;
      border: 1px solid #d1d9e0;
    }

    .wemd-preview tr:nth-child(even) td {
      background: #f6f8fa;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      margin: 12px 0;
      padding-left: 28px;
    }

    .wemd-preview li {
      margin: 4px 0;
    }

    .wemd-preview hr {
      margin: 24px 0;
      border: none;
      height: 3px;
      background: #d1d9e0;
      border-radius: 2px;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 12px 0;
      border: 1px solid #d1d9e0;
    }

    .wemd-preview strong {
      font-weight: 600;
      color: #1f2328;
    }

    .wemd-preview del {
      color: #8b949e;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #fff8c5;
      color: #1f2328;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      accent-color: #0366d6;
    }
  `,
}
