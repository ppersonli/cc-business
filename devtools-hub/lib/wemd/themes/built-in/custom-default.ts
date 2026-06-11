// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import type { Theme } from '../../types'

export const customDefault: Theme = {
  id: 'custom-default',
  name: 'Custom Default',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: #2b2b2b;
      background: #ffffff;
      padding: 20px 16px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 32px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #07c160;
    }

    .wemd-preview h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 28px 0 12px 0;
      padding-left: 10px;
      border-left: 4px solid #07c160;
    }

    .wemd-preview h3 {
      font-size: 17px;
      font-weight: 600;
      color: #333333;
      margin: 22px 0 10px 0;
    }

    .wemd-preview p {
      margin: 12px 0;
    }

    .wemd-preview a {
      color: #07c160;
      text-decoration: none;
      font-weight: 500;
    }

    .wemd-preview a:hover {
      text-decoration: underline;
    }

    .wemd-preview blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      border-left: 4px solid #07c160;
      background: #f0faf4;
      color: #555555;
      font-size: 14px;
      border-radius: 0 4px 4px 0;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 16px 0;
      padding: 14px 16px;
      background: #f7f7f7;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
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
      color: #c0392b;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: #2b2b2b;
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
      background: #07c160;
      border: 1px solid #06a853;
      font-weight: 600;
      text-align: left;
      color: #ffffff;
    }

    .wemd-preview td {
      padding: 8px 12px;
      border: 1px solid #e8e8e8;
    }

    .wemd-preview tr:nth-child(even) td {
      background: #f9f9f9;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    .wemd-preview li {
      margin: 4px 0;
    }

    .wemd-preview li::marker {
      color: #07c160;
    }

    .wemd-preview hr {
      margin: 24px 0;
      border: none;
      border-top: 1px solid #e8e8e8;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 12px 0;
    }

    .wemd-preview strong {
      font-weight: 700;
      color: #1a1a1a;
    }

    .wemd-preview del {
      color: #999999;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #fff3b0;
      color: #2b2b2b;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      accent-color: #07c160;
    }
  `,
}
