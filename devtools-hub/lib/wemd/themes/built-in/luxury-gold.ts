import type { Theme } from '../../types'

export const luxuryGold: Theme = {
  id: 'luxury-gold',
  name: 'Luxury Gold',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: 'Georgia', 'Times New Roman', 'Songti SC', 'SimSun', serif;
      line-height: 1.85;
      color: #e0ddd5;
      background: #1a1a2e;
      padding: 24px 20px;
    }

    .wemd-preview h1 {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 1.8em;
      font-weight: 700;
      color: #d4af37;
      text-align: center;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 12px;
      margin: 1.6em 0 0.8em 0;
      letter-spacing: 2px;
    }

    .wemd-preview h2 {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 1.4em;
      font-weight: 600;
      color: #d4af37;
      border-left: 4px solid #b8960c;
      padding-left: 14px;
      margin: 1.4em 0 0.6em 0;
      letter-spacing: 1px;
    }

    .wemd-preview h3 {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 1.15em;
      font-weight: 600;
      color: #c9a227;
      margin: 1.2em 0 0.5em 0;
    }

    .wemd-preview p {
      color: #d5d0c4;
      margin: 0.9em 0;
    }

    .wemd-preview a {
      color: #d4af37;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .wemd-preview blockquote {
      border-left: 4px solid #d4af37;
      background: rgba(212, 175, 55, 0.06);
      color: #c9bfa4;
      padding: 14px 18px;
      margin: 1.2em 0;
      border-radius: 0;
      font-style: italic;
      position: relative;
    }

    .wemd-preview pre {
      background: #141425;
      border: 1px solid #2a2a40;
      border-radius: 4px;
      padding: 16px;
      overflow-x: auto;
      margin: 1em 0;
    }

    .wemd-preview code {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
      font-size: 0.88em;
      color: #d4af37;
      background: rgba(212, 175, 55, 0.08);
      padding: 2px 6px;
      border-radius: 3px;
    }

    .wemd-preview pre code {
      color: #c9bfa4;
      background: transparent;
      padding: 0;
      font-size: 0.88em;
    }

    .wemd-preview .hljs {
      color: #c9bfa4;
      background: #141425;
    }

    .wemd-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      border: 1px solid #2a2a40;
    }

    .wemd-preview th {
      background: #222238;
      color: #d4af37;
      font-weight: 600;
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #2a2a40;
      letter-spacing: 1px;
    }

    .wemd-preview td {
      padding: 10px 14px;
      border: 1px solid #2a2a40;
      color: #d5d0c4;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      padding-left: 24px;
      margin: 0.8em 0;
      color: #d5d0c4;
    }

    .wemd-preview li {
      margin: 5px 0;
      color: #d5d0c4;
    }

    .wemd-preview li::marker {
      color: #d4af37;
    }

    .wemd-preview hr {
      border: none;
      height: 1px;
      background: linear-gradient(to right, transparent, #d4af37, transparent);
      margin: 2.5em 0;
    }

    .wemd-preview img {
      max-width: 100%;
      border-radius: 2px;
      border: 2px solid #2a2a40;
      margin: 1em 0;
    }

    .wemd-preview strong {
      color: #d4af37;
      font-weight: 700;
    }

    .wemd-preview del {
      color: #5a5a6e;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: rgba(212, 175, 55, 0.2);
      color: #d4af37;
      padding: 2px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid #d4af37;
      background: transparent;
      vertical-align: middle;
      margin-right: 6px;
      position: relative;
    }

    .wemd-preview input[type="checkbox"]:checked {
      background: #d4af37;
    }

    .wemd-preview input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 0;
      width: 8px;
      height: 10px;
      border: solid #1a1a2e;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `,
}
