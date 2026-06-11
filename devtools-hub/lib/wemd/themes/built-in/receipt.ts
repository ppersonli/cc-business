// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import type { Theme } from '../../types'

export const receipt: Theme = {
  id: 'receipt',
  name: 'Receipt',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: "Courier New", Courier, "Lucida Console", monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fffef7;
      padding: 24px 20px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 20px;
      font-weight: 700;
      color: #000000;
      margin: 20px 0 12px 0;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-bottom: 2px dashed #1a1a1a;
      padding-bottom: 8px;
    }

    .wemd-preview h2 {
      font-size: 17px;
      font-weight: 700;
      color: #000000;
      margin: 18px 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px dashed #999999;
      padding-bottom: 4px;
    }

    .wemd-preview h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 14px 0 8px 0;
      text-transform: uppercase;
    }

    .wemd-preview p {
      margin: 8px 0;
    }

    .wemd-preview a {
      color: #1a1a1a;
      text-decoration: underline;
      text-decoration-style: dashed;
    }

    .wemd-preview blockquote {
      margin: 12px 0;
      padding: 8px 12px;
      border-left: 3px dashed #999999;
      background: transparent;
      color: #555555;
      font-style: italic;
      font-size: 13px;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 12px 0;
      padding: 12px;
      background: #f5f5e8;
      border: 1px dashed #cccccc;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
    }

    .wemd-preview code {
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      padding: 1px 4px;
      background: #f0f0e0;
      color: #333333;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      color: #1a1a1a;
    }

    .wemd-preview .hljs {
      background: transparent;
      padding: 0;
    }

    .wemd-preview table {
      width: 100%;
      margin: 12px 0;
      border-collapse: collapse;
      font-size: 13px;
    }

    .wemd-preview th {
      padding: 8px 10px;
      background: #f5f5e8;
      border: 1px dashed #999999;
      font-weight: 700;
      text-align: left;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .wemd-preview td {
      padding: 6px 10px;
      border: 1px dashed #cccccc;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .wemd-preview li {
      margin: 3px 0;
    }

    .wemd-preview li::marker {
      content: "- ";
    }

    .wemd-preview hr {
      margin: 16px 0;
      border: none;
      border-top: 2px dashed #999999;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      margin: 12px 0;
      border: 1px dashed #cccccc;
    }

    .wemd-preview strong {
      font-weight: 700;
      color: #000000;
    }

    .wemd-preview del {
      color: #999999;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #ffff99;
      color: #1a1a1a;
      padding: 0 2px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 14px;
      height: 14px;
    }
  `,
}
