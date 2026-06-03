import type { Theme } from '../../types'

export const knowledgeBase: Theme = {
  id: 'knowledge-base',
  name: 'Knowledge Base',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      line-height: 1.8;
      color: #2c3e50;
      background: #f5f7fa;
      padding: 24px 20px;
    }

    .wemd-preview h1 {
      font-size: 1.75em;
      font-weight: 700;
      color: #1a73e8;
      border-bottom: 2px solid #d2e3fc;
      padding-bottom: 10px;
      margin: 1.6em 0 0.8em 0;
    }

    .wemd-preview h2 {
      font-size: 1.4em;
      font-weight: 600;
      color: #1a73e8;
      border-bottom: 1px solid #e8eaed;
      padding-bottom: 8px;
      margin: 1.4em 0 0.6em 0;
    }

    .wemd-preview h3 {
      font-size: 1.15em;
      font-weight: 600;
      color: #1967d2;
      margin: 1.2em 0 0.5em 0;
    }

    .wemd-preview p {
      color: #3c4043;
      margin: 0.8em 0;
    }

    .wemd-preview a {
      color: #1a73e8;
      text-decoration: none;
      border-bottom: 1px solid #a8c7fa;
    }

    .wemd-preview blockquote {
      border-left: 4px solid #1a73e8;
      background: #e8f0fe;
      color: #3c4043;
      padding: 12px 16px;
      margin: 1em 0;
      border-radius: 0 6px 6px 0;
    }

    .wemd-preview pre {
      background: #f1f3f4;
      border: 1px solid #dadce0;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 1em 0;
    }

    .wemd-preview code {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
      font-size: 0.88em;
      color: #c7254e;
      background: #f9f2f4;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .wemd-preview pre code {
      color: #3c4043;
      background: transparent;
      padding: 0;
      font-size: 0.9em;
    }

    .wemd-preview .hljs {
      color: #3c4043;
      background: #f1f3f4;
    }

    .wemd-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      border: 1px solid #dadce0;
      border-radius: 8px;
    }

    .wemd-preview th {
      background: #e8f0fe;
      color: #1967d2;
      font-weight: 600;
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #dadce0;
    }

    .wemd-preview td {
      padding: 10px 14px;
      border: 1px solid #dadce0;
      color: #3c4043;
      background: #ffffff;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      padding-left: 24px;
      margin: 0.8em 0;
      color: #3c4043;
    }

    .wemd-preview li {
      margin: 4px 0;
      color: #3c4043;
    }

    .wemd-preview li::marker {
      color: #1a73e8;
    }

    .wemd-preview hr {
      border: none;
      height: 1px;
      background: #dadce0;
      margin: 2em 0;
    }

    .wemd-preview img {
      max-width: 100%;
      border-radius: 8px;
      border: 1px solid #dadce0;
      margin: 1em 0;
    }

    .wemd-preview strong {
      color: #202124;
      font-weight: 700;
    }

    .wemd-preview del {
      color: #80868b;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #fff3cd;
      color: #2c3e50;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .wemd-preview input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid #1a73e8;
      background: #ffffff;
      vertical-align: middle;
      margin-right: 6px;
      border-radius: 3px;
      position: relative;
    }

    .wemd-preview input[type="checkbox"]:checked {
      background: #1a73e8;
    }

    .wemd-preview input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 3px;
      top: 0;
      width: 6px;
      height: 10px;
      border: solid #ffffff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `,
}
