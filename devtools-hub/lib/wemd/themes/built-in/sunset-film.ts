// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import type { Theme } from '../../types'

export const sunsetFilm: Theme = {
  id: 'sunset-film',
  name: 'Sunset Film',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: "Georgia", "Times New Roman", "Songti SC", serif;
      font-size: 15px;
      line-height: 1.85;
      color: #3d2e1f;
      background: #fdf8f0;
      padding: 24px 20px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 26px;
      font-weight: 700;
      color: #8b4513;
      margin: 28px 0 16px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #d4a76a;
      letter-spacing: 0.5px;
    }

    .wemd-preview h2 {
      font-size: 21px;
      font-weight: 600;
      color: #a0522d;
      margin: 24px 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #e8c99b;
    }

    .wemd-preview h3 {
      font-size: 18px;
      font-weight: 600;
      color: #b8732a;
      margin: 20px 0 10px 0;
    }

    .wemd-preview p {
      margin: 12px 0;
    }

    .wemd-preview a {
      color: #c0601a;
      text-decoration: none;
      border-bottom: 1px solid #e8a86a;
    }

    .wemd-preview a:hover {
      color: #8b4513;
      border-bottom-color: #8b4513;
    }

    .wemd-preview blockquote {
      margin: 16px 0;
      padding: 14px 18px;
      border-left: 4px solid #d4a76a;
      background: linear-gradient(to right, #f5e8d4, #fdf8f0);
      color: #6b5240;
      font-style: italic;
      font-size: 14px;
      border-radius: 0 4px 4px 0;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 16px 0;
      padding: 14px 16px;
      background: #2d1f10;
      border: 1px solid #5a3d20;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }

    .wemd-preview code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      padding: 2px 6px;
      background: #f0e0c8;
      border-radius: 3px;
      color: #8b4513;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: #e8c99b;
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
      background: #f0e0c8;
      border: 1px solid #d4a76a;
      font-weight: 600;
      text-align: left;
      color: #5a3d20;
    }

    .wemd-preview td {
      padding: 8px 12px;
      border: 1px solid #e8c99b;
    }

    .wemd-preview tr:nth-child(even) td {
      background: #faf3e6;
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
      color: #d4a76a;
    }

    .wemd-preview hr {
      margin: 28px 0;
      border: none;
      border-top: 1px solid #d4a76a;
      position: relative;
    }

    .wemd-preview hr::after {
      content: "✦";
      display: block;
      text-align: center;
      color: #d4a76a;
      font-size: 14px;
      position: relative;
      top: -10px;
      background: #fdf8f0;
      width: 20px;
      margin: 0 auto;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin: 16px 0;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
      border: 1px solid #e8c99b;
    }

    .wemd-preview strong {
      font-weight: 700;
      color: #8b4513;
    }

    .wemd-preview del {
      color: #b0a090;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #fde68a;
      color: #5a3d20;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      accent-color: #c0601a;
    }
  `,
}
