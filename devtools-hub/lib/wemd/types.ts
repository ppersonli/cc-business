// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

export interface Theme {
  id: string
  name: string
  css: string
  isBuiltIn: boolean
  designerVariables?: DesignerVariables
}

export interface DesignerVariables {
  // Global
  fontFamily: string
  fontSize: number
  lineHeight: number
  textColor: string
  bgColor: string
  contentWidth: number
  padding: number
  // Heading
  headingColor: string
  h1Size: number
  h2Size: number
  h3Size: number
  h4Size: number
  headingWeight: number
  headingMargin: number
  // Paragraph
  paragraphColor: string
  paragraphSize: number
  paragraphLineHeight: number
  paragraphMargin: number
  paragraphAlign: string
  // Quote
  quoteBorderColor: string
  quoteBgColor: string
  quoteTextColor: string
  quoteFontSize: number
  quotePadding: number
  // List
  listMarkerColor: string
  listFontSize: number
  listLineHeight: number
  listIndent: number
  // Code
  codeBgColor: string
  codeTextColor: string
  codeFontSize: number
  codeBorderRadius: number
  codeFontFamily: string
  // Image
  imageMaxWidth: number
  imageBorderRadius: number
  imageShadow: boolean
  imageMargin: number
  // Table & HR
  tableHeaderBg: string
  tableBorderColor: string
  tableFontSize: number
  tableCellPadding: number
  tableAlternateRows: boolean
  // Mermaid
  mermaidTheme: string
  mermaidMaxWidth: number
  mermaidMargin: number
  // Other
  linkColor: string
  hrColor: string
  footnoteSize: number
}
