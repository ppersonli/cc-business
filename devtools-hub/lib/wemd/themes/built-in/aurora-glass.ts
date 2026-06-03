import type { Theme } from '../../types'

export const auroraGlass: Theme = {
  id: 'aurora-glass',
  name: 'Aurora Glass',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: #3d3563;
      background: #f0edf8;
      padding: 22px 18px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 25px;
      font-weight: 700;
      color: #4a3d8f;
      margin: 28px 0 14px 0;
      padding: 12px 16px;
      background: #e4dff5;
      border-radius: 10px;
      border-left: 4px solid #7c6bc4;
    }

    .wemd-preview h2 {
      font-size: 21px;
      font-weight: 600;
      color: #5246a0;
      margin: 24px 0 12px 0;
      padding: 10px 14px;
      background: #ebe7f7;
      border-radius: 8px;
      border-left: 3px solid #9b8ede;
    }

    .wemd-preview h3 {
      font-size: 17px;
      font-weight: 600;
      color: #5f54a8;
      margin: 20px 0 10px 0;
      padding-left: 12px;
      border-left: 2px solid #b4a8e8;
    }

    .wemd-preview p {
      margin: 12px 0;
    }

    .wemd-preview a {
      color: #6c5ce7;
      text-decoration: none;
      border-bottom: 1px dashed #b4a8e8;
    }

    .wemd-preview blockquote {
      margin: 18px 0;
      padding: 16px 20px;
      background: #e8e3f5;
      border-left: 4px solid #a293d9;
      border-radius: 8px;
      color: #4a4080;
      font-size: 14px;
    }

    .wemd-preview blockquote p {
      margin: 4px 0;
    }

    .wemd-preview pre {
      margin: 18px 0;
      padding: 16px 18px;
      background: #e0daf0;
      border-radius: 10px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
      border: 1px solid #cdc4ea;
    }

    .wemd-preview code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      padding: 2px 7px;
      background: #e4dff5;
      border-radius: 6px;
      color: #5b4fb5;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: #3d3563;
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
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cdc4ea;
    }

    .wemd-preview th {
      padding: 10px 14px;
      background: #d8d0f0;
      border-bottom: 2px solid #b4a8e8;
      font-weight: 600;
      text-align: left;
      color: #3d3563;
    }

    .wemd-preview td {
      padding: 9px 14px;
      border-bottom: 1px solid #e4dff5;
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
      margin: 26px 0;
      border: none;
      height: 2px;
      background: linear-gradient(90deg, #b4a8e8, #7c6bc4, #b4a8e8);
      border-radius: 1px;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      margin: 14px 0;
      border: 1px solid #cdc4ea;
    }

    .wemd-preview strong {
      font-weight: 700;
      color: #4a3d8f;
    }

    .wemd-preview del {
      color: #a89ec4;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #e8dff8;
      color: #4a3d8f;
      padding: 1px 5px;
      border-radius: 4px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      accent-color: #7c6bc4;
    }
  `,
}
