import type { Theme } from '../../types'

export const academicPaper: Theme = {
  id: 'academic-paper',
  name: 'Academic Paper',
  isBuiltIn: true,
  css: `
    .wemd-preview {
      font-family: Georgia, Cambria, "Times New Roman", "Noto Serif SC", serif;
      font-size: 15px;
      line-height: 1.9;
      color: #2c2c2c;
      background: #fdf8f0;
      padding: 24px 20px;
      max-width: 640px;
      margin: 0 auto;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .wemd-preview h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a1a;
      text-align: center;
      margin: 36px 0 8px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #8b7355;
      letter-spacing: 0.5px;
    }

    .wemd-preview h2 {
      font-size: 21px;
      font-weight: 700;
      color: #2c2c2c;
      margin: 30px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #c4b49a;
    }

    .wemd-preview h3 {
      font-size: 17px;
      font-weight: 700;
      color: #3a3a3a;
      margin: 24px 0 8px 0;
      font-style: italic;
    }

    .wemd-preview p {
      margin: 14px 0;
      text-align: justify;
      text-indent: 2em;
    }

    .wemd-preview a {
      color: #6b4226;
      text-decoration: underline;
      text-decoration-color: #c4b49a;
      text-underline-offset: 2px;
    }

    .wemd-preview blockquote {
      margin: 20px 0;
      padding: 14px 20px;
      border-left: 3px solid #8b7355;
      background: #f5eed8;
      color: #4a4032;
      font-style: italic;
      font-size: 14px;
      line-height: 1.8;
    }

    .wemd-preview blockquote p {
      text-indent: 0;
      margin: 6px 0;
    }

    .wemd-preview pre {
      margin: 18px 0;
      padding: 16px 18px;
      background: #f0ead6;
      border: 1px solid #d5c9a8;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }

    .wemd-preview code {
      font-family: "Courier New", Courier, "Noto Sans Mono", monospace;
      font-size: 13px;
      padding: 2px 6px;
      background: #efe8d0;
      border-radius: 3px;
      color: #5c4a2e;
    }

    .wemd-preview pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      color: #333333;
    }

    .wemd-preview .hljs {
      background: transparent;
      padding: 0;
    }

    .wemd-preview table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
      font-size: 14px;
    }

    .wemd-preview th {
      padding: 10px 14px;
      background: #e8dfc8;
      border: 1px solid #c4b49a;
      font-weight: 700;
      text-align: center;
    }

    .wemd-preview td {
      padding: 8px 14px;
      border: 1px solid #d5c9a8;
      text-align: center;
    }

    .wemd-preview ul,
    .wemd-preview ol {
      margin: 12px 0;
      padding-left: 28px;
    }

    .wemd-preview li {
      margin: 6px 0;
    }

    .wemd-preview hr {
      margin: 28px auto;
      border: none;
      width: 40%;
      border-top: 1px solid #8b7355;
    }

    .wemd-preview img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
      border: 1px solid #d5c9a8;
    }

    .wemd-preview strong {
      font-weight: 700;
      color: #1a1a1a;
    }

    .wemd-preview del {
      color: #9a8e7e;
      text-decoration: line-through;
    }

    .wemd-preview mark {
      background: #f5e6b8;
      color: #2c2c2c;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .wemd-preview input[type="checkbox"] {
      margin-right: 6px;
      vertical-align: middle;
      width: 15px;
      height: 15px;
      accent-color: #8b7355;
    }
  `,
}
