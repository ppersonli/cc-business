import type { Theme } from '../../types'

export const neoBrutalism: Theme = {
  id: 'neo-brutalism',
  name: 'Neo Brutalism',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace;
      line-height: 1.7;
      color: #1a1a1a;
      background: #f5f5f0;
      padding: 20px 16px;
    }

    .wemd-preview h1 {
      font-size: 1.8em;
      font-weight: 900;
      color: #1a1a1a;
      background: #ffeb3b;
      border: 3px solid #1a1a1a;
      box-shadow: 4px 4px 0 #1a1a1a;
      padding: 10px 16px;
      margin: 1.4em 0 0.8em 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .wemd-preview h2 {
      font-size: 1.4em;
      font-weight: 800;
      color: #ffffff;
      background: #2196f3;
      border: 3px solid #1a1a1a;
      box-shadow: 4px 4px 0 #1a1a1a;
      padding: 8px 14px;
      margin: 1.3em 0 0.6em 0;
      text-transform: uppercase;
    }

    .wemd-preview h3 {
      font-size: 1.15em;
      font-weight: 800;
      color: #ffffff;
      background: #e91e63;
      border: 3px solid #1a1a1a;
      box-shadow: 3px 3px 0 #1a1a1a;
      padding: 6px 12px;
      margin: 1.2em 0 0.5em 0;
      text-transform: uppercase;
    }

    .wemd-preview p {
      color: #1a1a1a;
      margin: 0.8em 0;
    }

    .wemd-preview a {
      color: #e91e63;
      text-decoration: underline;
      text-decoration-thickness: 3px;
      text-underline-offset: 3px;
      font-weight: 700;
    }

    .wemd-preview blockquote {
      border: 3px solid #1a1a1a;
      border-left: 8px solid #1a1a1a;
      background: #80deea;
      color: #1a1a1a;
      padding: 14px 16px;
      margin: 1em 0;
      box-shadow: 4px 4px 0 #1a1a1a;
      font-weight: 600;
    }

    .wemd-preview pre {
      background: #1a1a1a;
      border: 3px solid #1a1a1a;
      box-shadow: 4px 4px 0 #e91e63;
      padding: 16px;
      overflow-x: auto;
      margin: 1em 0;
    }

    .wemd-preview code {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace;
      font-size: 0.9em;
      color: #1a1a1a;
      background: #ffeb3b;
      padding: 2px 6px;
      border: 2px solid #1a1a1a;
      font-weight: 700;
    }

    .wemd-preview pre code {
      color: #f5f5f0;
      background: transparent;
      border: none;
      padding: 0;
      font-weight: 400;
    }

    .wemd-preview .hljs {
      color: #f5f5f0;
      background: #1a1a1a;
    }

    .wemd-preview table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1em 0;
      border: 3px solid #1a1a1a;
      box-shadow: 4px 4px 0 #1a1a1a;
    }

    .wemd-preview th {
      background: #2196f3;
      color: #ffffff;
      font-weight: 800;
      text-align: left;
      padding: 10px 14px;
      border: 2px solid #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .wemd-preview td {
      padding: 10px 14px;
      border: 2px solid #1a1a1a;
      color: #1a1a1a;
      background: #ffffff;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      padding-left: 24px;
      margin: 0.8em 0;
      color: #1a1a1a;
    }

    .wemd-preview li {
      margin: 6px 0;
      color: #1a1a1a;
      font-weight: 600;
    }

    .wemd-preview li::marker {
      color: #e91e63;
    }

    .wemd-preview hr {
      border: none;
      height: 4px;
      background: #1a1a1a;
      margin: 2em 0;
      box-shadow: 0 4px 0 #e91e63;
    }

    .wemd-preview img {
      max-width: 100%;
      border: 3px solid #1a1a1a;
      box-shadow: 4px 4px 0 #1a1a1a;
      margin: 1em 0;
    }

    .wemd-preview strong {
      color: #e91e63;
      font-weight: 900;
    }

    .wemd-preview del {
      color: #999999;
      text-decoration: line-through;
      text-decoration-thickness: 3px;
    }

    .wemd-preview mark {
      background: #ffeb3b;
      color: #1a1a1a;
      padding: 2px 4px;
      font-weight: 700;
      border: 2px solid #1a1a1a;
    }

    .wemd-preview input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border: 3px solid #1a1a1a;
      background: #ffffff;
      vertical-align: middle;
      margin-right: 8px;
      box-shadow: 2px 2px 0 #1a1a1a;
      position: relative;
    }

    .wemd-preview input[type="checkbox"]:checked {
      background: #ffeb3b;
    }

    .wemd-preview input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 3px;
      top: 0;
      width: 6px;
      height: 10px;
      border: solid #1a1a1a;
      border-width: 0 3px 3px 0;
      transform: rotate(45deg);
    }
  `,
}
