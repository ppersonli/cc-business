import type { Theme } from '../../types'

export const cyberpunkNeon: Theme = {
  id: 'cyberpunk-neon',
  name: 'Cyberpunk Neon',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
      line-height: 1.75;
      color: #e0e0e0;
      background: #0a0a0f;
      padding: 20px 16px;
    }

    .wemd-preview h1 {
      font-size: 1.75em;
      font-weight: 700;
      color: #00f0ff;
      text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
      border-bottom: 2px solid #00f0ff;
      padding-bottom: 10px;
      margin: 1.5em 0 0.8em 0;
    }

    .wemd-preview h2 {
      font-size: 1.4em;
      font-weight: 600;
      color: #ff00aa;
      text-shadow: 0 0 10px rgba(255, 0, 170, 0.3);
      border-left: 4px solid #ff00aa;
      padding-left: 12px;
      margin: 1.3em 0 0.6em 0;
    }

    .wemd-preview h3 {
      font-size: 1.15em;
      font-weight: 600;
      color: #b366ff;
      text-shadow: 0 0 10px rgba(179, 102, 255, 0.25);
      margin: 1.2em 0 0.5em 0;
    }

    .wemd-preview p {
      color: #c8c8d0;
      margin: 0.8em 0;
    }

    .wemd-preview a {
      color: #00f0ff;
      text-decoration: none;
      border-bottom: 1px dashed #00f0ff;
    }

    .wemd-preview blockquote {
      border-left: 4px solid #ff00aa;
      background: rgba(255, 0, 170, 0.08);
      color: #d0b0cc;
      padding: 12px 16px;
      margin: 1em 0;
      border-radius: 0 4px 4px 0;
    }

    .wemd-preview pre {
      background: #0d0d18;
      border: 1px solid #1a1a2e;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 1em 0;
    }

    .wemd-preview code {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
      font-size: 0.9em;
      color: #39ff14;
      background: rgba(57, 255, 20, 0.06);
      padding: 2px 6px;
      border-radius: 3px;
    }

    .wemd-preview pre code {
      color: #39ff14;
      background: transparent;
      padding: 0;
    }

    .wemd-preview .hljs {
      color: #c8c8d0;
      background: #0d0d18;
    }

    .wemd-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      border: 1px solid #1e1e30;
    }

    .wemd-preview th {
      background: #12121e;
      color: #00f0ff;
      font-weight: 600;
      text-align: left;
      padding: 10px 12px;
      border: 1px solid #1e1e30;
    }

    .wemd-preview td {
      padding: 8px 12px;
      border: 1px solid #1e1e30;
      color: #c8c8d0;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      padding-left: 24px;
      margin: 0.8em 0;
      color: #c8c8d0;
    }

    .wemd-preview li {
      margin: 4px 0;
      color: #c8c8d0;
    }

    .wemd-preview hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, #00f0ff, #ff00aa, transparent);
      margin: 2em 0;
    }

    .wemd-preview img {
      max-width: 100%;
      border-radius: 4px;
      border: 1px solid #1a1a2e;
      margin: 1em 0;
    }

    .wemd-preview strong {
      color: #ffffff;
      font-weight: 700;
    }

    .wemd-preview del {
      color: #555566;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: rgba(0, 240, 255, 0.2);
      color: #00f0ff;
      padding: 2px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid #00f0ff;
      background: transparent;
      vertical-align: middle;
      margin-right: 6px;
      position: relative;
    }

    .wemd-preview input[type="checkbox"]:checked {
      background: #00f0ff;
    }

    .wemd-preview input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 0;
      width: 8px;
      height: 10px;
      border: solid #0a0a0f;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `,
}
