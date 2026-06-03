import type { Theme } from '../../types'

export const morandiForest: Theme = {
  id: 'morandi-forest',
  name: 'Morandi Forest',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      line-height: 1.8;
      color: #4a4a3f;
      background: #e8dcc8;
      padding: 24px 20px;
    }

    .wemd-preview h1 {
      font-family: 'Georgia', 'Times New Roman', 'Songti SC', serif;
      font-size: 1.75em;
      font-weight: 700;
      color: #5c6b4f;
      border-bottom: 2px solid #a3b18a;
      padding-bottom: 10px;
      margin: 1.6em 0 0.8em 0;
    }

    .wemd-preview h2 {
      font-family: 'Georgia', 'Times New Roman', 'Songti SC', serif;
      font-size: 1.35em;
      font-weight: 600;
      color: #6b7c5e;
      border-left: 4px solid #a3b18a;
      padding-left: 14px;
      margin: 1.4em 0 0.6em 0;
    }

    .wemd-preview h3 {
      font-family: 'Georgia', 'Times New Roman', 'Songti SC', serif;
      font-size: 1.15em;
      font-weight: 600;
      color: #7a8a6a;
      margin: 1.2em 0 0.5em 0;
    }

    .wemd-preview p {
      color: #4a4a3f;
      margin: 0.8em 0;
    }

    .wemd-preview a {
      color: #7a6a52;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .wemd-preview blockquote {
      border-left: 4px solid #b5896a;
      background: rgba(181, 137, 106, 0.1);
      color: #5c5043;
      padding: 14px 18px;
      margin: 1em 0;
      border-radius: 0 6px 6px 0;
    }

    .wemd-preview pre {
      background: #ddd4c2;
      border: 1px solid #c4b8a2;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 1em 0;
    }

    .wemd-preview code {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
      font-size: 0.88em;
      color: #6b5c4e;
      background: rgba(107, 92, 78, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .wemd-preview pre code {
      color: #4a4a3f;
      background: transparent;
      padding: 0;
      font-size: 0.88em;
    }

    .wemd-preview .hljs {
      color: #4a4a3f;
      background: #ddd4c2;
    }

    .wemd-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      border: 1px solid #c4b8a2;
      border-radius: 8px;
    }

    .wemd-preview th {
      background: #d5ccb8;
      color: #5c6b4f;
      font-weight: 600;
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #c4b8a2;
    }

    .wemd-preview td {
      padding: 10px 14px;
      border: 1px solid #c4b8a2;
      color: #4a4a3f;
      background: #ece4d2;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      padding-left: 24px;
      margin: 0.8em 0;
      color: #4a4a3f;
    }

    .wemd-preview li {
      margin: 5px 0;
      color: #4a4a3f;
    }

    .wemd-preview li::marker {
      color: #a3b18a;
    }

    .wemd-preview hr {
      border: none;
      height: 2px;
      background: linear-gradient(to right, transparent, #a3b18a, #b5896a, #a3b18a, transparent);
      margin: 2em 0;
    }

    .wemd-preview img {
      max-width: 100%;
      border-radius: 8px;
      border: 2px solid #c4b8a2;
      margin: 1em 0;
    }

    .wemd-preview strong {
      color: #5c5043;
      font-weight: 700;
    }

    .wemd-preview del {
      color: #9e9688;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: rgba(163, 177, 138, 0.3);
      color: #4a4a3f;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .wemd-preview input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid #a3b18a;
      background: #ece4d2;
      vertical-align: middle;
      margin-right: 6px;
      border-radius: 4px;
      position: relative;
    }

    .wemd-preview input[type="checkbox"]:checked {
      background: #6b7c5e;
    }

    .wemd-preview input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 0;
      width: 8px;
      height: 10px;
      border: solid #ece4d2;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `,
}
