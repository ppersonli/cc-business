// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import type { DesignerVariables } from '../types'

export const defaultDesignerVariables: DesignerVariables = {
  // Global
  fontFamily: '-apple-system, "Helvetica Neue", sans-serif',
  fontSize: 15,
  lineHeight: 1.75,
  textColor: '#333333',
  bgColor: '#ffffff',
  contentWidth: 100,
  padding: 20,
  // Heading
  headingColor: '#1a1a1a',
  h1Size: 24,
  h2Size: 20,
  h3Size: 17,
  h4Size: 15,
  headingWeight: 700,
  headingMargin: 16,
  // Paragraph
  paragraphColor: '#333333',
  paragraphSize: 15,
  paragraphLineHeight: 1.75,
  paragraphMargin: 16,
  paragraphAlign: 'left',
  // Quote
  quoteBorderColor: '#07c160',
  quoteBgColor: '#f0f9eb',
  quoteTextColor: '#6a737d',
  quoteFontSize: 14,
  quotePadding: 12,
  // List
  listMarkerColor: '#07c160',
  listFontSize: 15,
  listLineHeight: 1.8,
  listIndent: 20,
  // Code
  codeBgColor: '#f6f8fa',
  codeTextColor: '#24292e',
  codeFontSize: 13,
  codeBorderRadius: 4,
  codeFontFamily: '"SF Mono", "Fira Code", Consolas, monospace',
  // Image
  imageMaxWidth: 100,
  imageBorderRadius: 4,
  imageShadow: false,
  imageMargin: 16,
  // Table
  tableHeaderBg: '#f6f8fa',
  tableBorderColor: '#e2e8f0',
  tableFontSize: 14,
  tableCellPadding: 8,
  tableAlternateRows: true,
  // Mermaid
  mermaidTheme: 'default',
  mermaidMaxWidth: 100,
  mermaidMargin: 16,
  // Other
  linkColor: '#576b95',
  hrColor: '#e2e8f0',
  footnoteSize: 13,
}

const FONT_MAP: Record<string, string> = {
  '-apple-system, "Helvetica Neue", sans-serif': '-apple-system, "Helvetica Neue", "PingFang SC", sans-serif',
  'Georgia, serif': 'Georgia, "Noto Serif SC", serif',
  '"SF Mono", "Fira Code", Consolas, monospace': '"SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
  '"PingFang SC", "Microsoft YaHei", sans-serif': '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif',
}

export function generateCSS(vars: DesignerVariables): string {
  const fontFamily = FONT_MAP[vars.fontFamily] || vars.fontFamily

  return `.wemd-preview {
  font-family: ${fontFamily};
  font-size: ${vars.fontSize}px;
  line-height: ${vars.lineHeight};
  color: ${vars.textColor};
  background-color: ${vars.bgColor};
  padding: ${vars.padding}px;
}

.wemd-preview h1 {
  font-size: ${vars.h1Size}px;
  font-weight: ${vars.headingWeight};
  color: ${vars.headingColor};
  margin: ${vars.headingMargin * 1.5}px 0 ${vars.headingMargin}px;
  line-height: 1.3;
}

.wemd-preview h2 {
  font-size: ${vars.h2Size}px;
  font-weight: ${vars.headingWeight};
  color: ${vars.headingColor};
  margin: ${vars.headingMargin * 1.3}px 0 ${vars.headingMargin * 0.8}px;
  line-height: 1.35;
}

.wemd-preview h3 {
  font-size: ${vars.h3Size}px;
  font-weight: ${vars.headingWeight};
  color: ${vars.headingColor};
  margin: ${vars.headingMargin}px 0 ${vars.headingMargin * 0.6}px;
  line-height: 1.4;
}

.wemd-preview h4, .wemd-preview h5, .wemd-preview h6 {
  font-size: ${vars.h4Size}px;
  font-weight: ${vars.headingWeight};
  color: ${vars.headingColor};
  margin: ${vars.headingMargin}px 0 ${vars.headingMargin * 0.5}px;
}

.wemd-preview p {
  font-size: ${vars.paragraphSize}px;
  line-height: ${vars.paragraphLineHeight};
  color: ${vars.paragraphColor};
  margin: 0 0 ${vars.paragraphMargin}px;
  text-align: ${vars.paragraphAlign};
}

.wemd-preview blockquote {
  border-left: 4px solid ${vars.quoteBorderColor};
  background-color: ${vars.quoteBgColor};
  color: ${vars.quoteTextColor};
  font-size: ${vars.quoteFontSize}px;
  padding: ${vars.quotePadding}px ${vars.quotePadding * 1.2}px;
  margin: 0 0 ${vars.paragraphMargin}px;
  border-radius: 0 4px 4px 0;
}

.wemd-preview blockquote p {
  color: ${vars.quoteTextColor};
  margin: 0;
}

.wemd-preview ul, .wemd-preview ol {
  padding-left: ${vars.listIndent}px;
  margin: 0 0 ${vars.paragraphMargin}px;
}

.wemd-preview li {
  font-size: ${vars.listFontSize}px;
  line-height: ${vars.listLineHeight};
  margin-bottom: 4px;
}

.wemd-preview li::marker {
  color: ${vars.listMarkerColor};
}

.wemd-preview code {
  font-family: ${vars.codeFontFamily};
  font-size: ${vars.codeFontSize}px;
  background-color: ${vars.codeBgColor};
  color: ${vars.codeTextColor};
  padding: 2px 6px;
  border-radius: ${vars.codeBorderRadius}px;
}

.wemd-preview pre {
  background-color: ${vars.codeBgColor};
  border-radius: ${vars.codeBorderRadius * 2}px;
  padding: 16px;
  overflow-x: auto;
  margin: 0 0 ${vars.paragraphMargin}px;
}

.wemd-preview pre code {
  background: none;
  padding: 0;
  font-size: ${vars.codeFontSize}px;
  color: ${vars.codeTextColor};
}

.wemd-preview img {
  max-width: ${vars.imageMaxWidth}%;
  border-radius: ${vars.imageBorderRadius}px;
  margin: ${vars.imageMargin}px auto;
  display: block;
  ${vars.imageShadow ? 'box-shadow: 0 2px 12px rgba(0,0,0,0.1);' : ''}
}

.wemd-preview table {
  width: 100%;
  border-collapse: collapse;
  font-size: ${vars.tableFontSize}px;
  margin: 0 0 ${vars.paragraphMargin}px;
}

.wemd-preview th {
  background-color: ${vars.tableHeaderBg};
  border: 1px solid ${vars.tableBorderColor};
  padding: ${vars.tableCellPadding}px ${vars.tableCellPadding * 1.2}px;
  font-weight: 600;
  text-align: left;
}

.wemd-preview td {
  border: 1px solid ${vars.tableBorderColor};
  padding: ${vars.tableCellPadding}px ${vars.tableCellPadding * 1.2}px;
}

${vars.tableAlternateRows ? `.wemd-preview tr:nth-child(even) td {
  background-color: ${vars.tableHeaderBg}40;
}` : ''}

.wemd-preview .mermaid {
  max-width: ${vars.mermaidMaxWidth}%;
  margin: ${vars.mermaidMargin}px auto;
  text-align: center;
}

.wemd-preview a {
  color: ${vars.linkColor};
  text-decoration: none;
  border-bottom: 1px solid ${vars.linkColor}40;
}

.wemd-preview hr {
  border: none;
  border-top: 1px solid ${vars.hrColor};
  margin: ${vars.headingMargin * 1.5}px 0;
}

.wemd-preview .footnotes {
  font-size: ${vars.footnoteSize}px;
  color: ${vars.textColor}99;
  margin-top: ${vars.headingMargin * 1.5}px;
  padding-top: ${vars.headingMargin}px;
  border-top: 1px solid ${vars.hrColor};
}

.wemd-preview .katex-display {
  margin: ${vars.paragraphMargin}px 0;
  overflow-x: auto;
}

.wemd-preview .task-list-item {
  list-style: none;
}

.wemd-preview .task-list-item input[type="checkbox"] {
  margin-right: 6px;
}`
}
