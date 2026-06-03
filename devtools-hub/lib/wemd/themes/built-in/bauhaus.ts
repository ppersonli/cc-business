import type { Theme } from '../../types'

export const bauhaus: Theme = {
  id: 'bauhaus',
  name: 'Bauhaus',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #1a1a1a;
      background: #ffffff;
      padding: 22px 18px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 28px;
      font-weight: 900;
      color: #d62828;
      margin: 32px 0 14px 0;
      padding: 10px 16px;
      border: 4px solid #d62828;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .wemd-preview h2 {
      font-size: 22px;
      font-weight: 800;
      color: #003049;
      margin: 26px 0 12px 0;
      padding: 8px 14px;
      border-bottom: 4px solid #003049;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .wemd-preview h3 {
      font-size: 18px;
      font-weight: 700;
      color: #f77f00;
      margin: 22px 0 10px 0;
      padding-left: 14px;
      border-left: 5px solid #f77f00;
    }

    .wemd-preview p {
      margin: 12px 0;
    }

    .wemd-preview a {
      color: #003049;
      text-decoration: none;
      border-bottom: 3px solid #fcbf49;
      font-weight: 600;
    }

    .wemd-preview blockquote {
      margin: 18px 0;
      padding: 16px 20px;
      border: 3px solid #1a1a1a;
      background: #fcbf49;
      color: #1a1a1a;
      font-weight: 500;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 18px 0;
      padding: 16px 18px;
      background: #003049;
      color: #fcbf49;
      border-radius: 0;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
      border: 3px solid #1a1a1a;
    }

    .wemd-preview code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      padding: 2px 7px;
      background: #fcbf49;
      color: #1a1a1a;
      font-weight: 600;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      color: #fcbf49;
      font-weight: 400;
    }

    .wemd-preview .hljs {
      background: transparent;
      padding: 0;
    }

    .wemd-preview table {
      width: 100%;
      margin: 18px 0;
      border-collapse: collapse;
      font-size: 14px;
      border: 3px solid #1a1a1a;
    }

    .wemd-preview th {
      padding: 10px 14px;
      background: #d62828;
      color: #ffffff;
      border: 2px solid #1a1a1a;
      font-weight: 700;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .wemd-preview td {
      padding: 9px 14px;
      border: 2px solid #1a1a1a;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    .wemd-preview li {
      margin: 5px 0;
    }

    .wemd-preview hr {
      margin: 28px 0;
      border: none;
      height: 4px;
      background: #1a1a1a;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      margin: 14px 0;
      border: 3px solid #1a1a1a;
    }

    .wemd-preview strong {
      font-weight: 800;
      color: #d62828;
    }

    .wemd-preview del {
      color: #888888;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #fcbf49;
      color: #1a1a1a;
      padding: 1px 5px;
      font-weight: 600;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      accent-color: #d62828;
    }
  `,
}
