# WeMD-Style Markdown Editor for tools.pixiaoli.cn

## Feature Specification Document

> **Date**: 2026-06-03
> **Reference Project**: [WeMD](https://github.com/tenngoxars/WeMD) (MIT License)
> **Target Site**: tools.pixiaoli.cn (Next.js 15 monorepo)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Breakdown by Priority](#2-feature-breakdown-by-priority)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Technical Approach by Feature](#4-technical-approach-by-feature)
5. [Integration Points](#5-integration-points)
6. [WeChat-Specific Considerations](#6-wechat-specific-considerations)
7. [Dependencies & Packages](#7-dependencies--packages)
8. [File Structure](#8-file-structure)
9. [Testing Strategy](#9-testing-strategy)
10. [SEO & Metadata](#10-seo--metadata)
11. [Implementation Phases](#11-implementation-phases)

---

## 1. Executive Summary

Add a full-featured WeChat (微信公众号) Markdown editor to tools.pixiaoli.cn, modeled after the WeMD open-source project. The tool will allow users to write Markdown with GFM syntax, apply beautiful themes, preview the result in both light and dark mode, and copy the styled HTML directly into the WeChat public account editor.

**Key Differentiators from Existing Markdown Tool**:
The site already has a basic `markdown` preview tool (react-markdown + textarea). The new tool (`wechat-markdown-editor`) will be a completely separate, full-page application with CodeMirror editing, theme management, dark mode preview, copy-to-WeChat, and image hosting — a fundamentally different product.

---

## 2. Feature Breakdown by Priority

### P0 — MVP (Must-Have for Launch)

| # | Feature | WeMD Source | Description |
|---|---------|-------------|-------------|
| 1 | **Markdown Editor** | `Editor/MarkdownEditor.tsx` | CodeMirror 6 editor with syntax highlighting, line numbers, word wrap, keyboard shortcuts |
| 2 | **Live Preview** | `Preview/MarkdownPreview.tsx` | Real-time split-pane preview with sync scrolling |
| 3 | **GFM + Extended Markdown** | `packages/core/MarkdownParser.ts` | Tables, task lists, code highlighting, emoji, sub/sup, underline, footnotes, GitHub alerts, definition lists |
| 4 | **10+ Built-in Themes** | `packages/core/src/themes/` | Academic Paper, Aurora Glass, Bauhaus, Cyberpunk Neon, Knowledge Base, Luxury Gold, Morandi Forest, Neo-Brutalism, Receipt, Sunset Film, Basic, Code-GitHub, Custom Default |
| 5 | **Theme Selector** | `Theme/ThemePanel.tsx`, `ThemePanelView.tsx` | Visual grid of theme previews with one-click selection |
| 6 | **One-Click Copy to WeChat** | `services/wechatCopyService.ts` | HTML clipboard injection with inline CSS, WeChat-compatible formatting |
| 7 | **Light/Dark UI Mode** | `hooks/useUITheme.ts` | Editor UI theme toggle (separate from WeChat dark mode preview) |
| 8 | **Local-First Storage** | `storage/adapters/IndexedDBAdapter.ts` | All data in IndexedDB/localStorage, no login required |
| 9 | **Toolbar** | `Editor/Toolbar.tsx` | Bold, italic, headings, code, link, image, quote, list, table, HR buttons |
| 10 | **Syntax Help** | `Editor/SyntaxHelpPopover.tsx` | Popover with Markdown syntax reference |

### P1 — Important (Phase 2)

| # | Feature | WeMD Source | Description |
|---|---------|-------------|-------------|
| 11 | **WeChat Dark Mode Preview** | `packages/core/wechatDarkMode.ts` | HSL-based color algorithm to simulate WeChat dark mode rendering (98%+ accuracy) |
| 12 | **Visual Theme Designer** | `Theme/ThemeDesigner/` | 10-section visual designer (Global, Heading, Paragraph, Quote, List, Code, Image, Table, Mermaid, Other) |
| 13 | **Custom CSS Editor** | ThemeDesigner CSS mode | Raw CSS editor for advanced theme customization |
| 14 | **Advanced Search** | `Editor/SearchPanel.tsx` | Regex, case-sensitive, whole-word search + batch replace |
| 15 | **Mermaid Diagrams** | Preview mermaid rendering | Flowcharts, sequence diagrams, Gantt charts with theme-aware colors |
| 16 | **Math Formula Support** | `plugins/markdown-it-math.ts`, KaTeX | Inline `$...$` and display `$$...$$` formulas via KaTeX |
| 17 | **Mac Code Bar** | `MarkdownParser.ts` MAC_CODE_SVG | macOS-style traffic light dots on code blocks |
| 18 | **Image Paste & Upload** | `services/image/` | Paste images from clipboard → auto-compress → upload to chosen host |

### P2 — Nice-to-Have (Phase 3)

| # | Feature | WeMD Source | Description |
|---|---------|-------------|-------------|
| 19 | **Multi-Image Hosting** | `services/image/uploaders/` | Official (default), Qiniu, Aliyun OSS, Tencent COS, S3-compatible |
| 20 | **Sliding Image Groups** | `plugins/markdown-it-imageflow.ts` | Horizontal scrollable multi-image component |
| 21 | **File History / Versioning** | `store/historyStore.ts`, `HistoryManager.ts` | IndexedDB-based version history with snapshots |
| 22 | **Export as HTML File** | Header actions | Download styled HTML as standalone file |
| 23 | **Export Theme as CSS** | `themeStore.exportThemeCSS` | Download theme CSS for reuse |
| 24 | **Import/Export Themes** | `themeStore.importTheme` | JSON-based theme import/export |
| 25 | **Link-to-Footnote Conversion** | `utils/linkFootnote.ts` | Auto-convert titled links to numbered footnotes (WeChat pattern) |
| 26 | **Table-of-Contents** | markdown-it-table-of-contents | `[toc]` marker generates auto TOC |
| 27 | **Multi-language i18n** | Site requirement | EN/PT/ES/JA/KO for editor UI labels |
| 28 | **Keyboard Shortcuts** | `Editor/editorShortcuts.ts` | Ctrl+B bold, Ctrl+I italic, Ctrl+K link, etc. |
| 29 | **Mobile Responsive** | `hooks/useMobileView.ts` | Mobile-optimized layout with bottom toolbar |
| 30 | **Save Indicator** | `Editor/SaveIndicator.tsx` | Visual auto-save status feedback |

---

## 3. Architecture Decisions

### 3.1 Routing & Page Location

```
app/[locale]/tools/wechat-markdown-editor/
├── page.tsx          # Server component: metadata + render
└── client.tsx        # Client component: full editor application
```

**Decision**: Use a new route `wechat-markdown-editor` (not extending the existing `markdown` tool). The existing `markdown` tool remains as a simple preview tool; the new tool is a completely different product.

**Slug**: `wechat-markdown-editor`
**Category**: `Writing` (new category, or `Content`)

### 3.2 Component Architecture

The editor is a complex application that goes beyond a simple tool component. It needs a custom layout:

```
app/[locale]/tools/wechat-markdown-editor/
├── page.tsx
├── client.tsx                    # Root client component (NOT using ToolLayout)
├── components/
│   ├── Editor/
│   │   ├── CodeMirrorEditor.tsx  # CodeMirror 6 wrapper
│   │   ├── Toolbar.tsx           # Formatting toolbar
│   │   ├── SearchPanel.tsx       # Advanced search/replace
│   │   └── SyntaxHelp.tsx        # Syntax reference popover
│   ├── Preview/
│   │   ├── MarkdownPreview.tsx   # Styled preview pane
│   │   └── DarkModePreview.tsx   # WeChat dark mode simulation
│   ├── Theme/
│   │   ├── ThemePanel.tsx        # Theme selector grid
│   │   ├── ThemeDesigner.tsx     # Visual CSS designer
│   │   ├── ThemePreview.tsx      # Live preview thumbnail
│   │   └── CustomCSSEditor.tsx   # Raw CSS editor
│   ├── Layout/
│   │   ├── EditorLayout.tsx      # Split-pane layout manager
│   │   └── Header.tsx            # Top toolbar (copy, theme, settings)
│   └── Settings/
│       └── ImageHostSettings.tsx # Image hosting configuration
├── lib/
│   ├── parser.ts                 # markdown-it setup with plugins
│   ├── themes/
│   │   ├── index.ts              # Theme registry
│   │   ├── types.ts              # Theme type definitions
│   │   ├── built-in/             # 13 built-in themes
│   │   └── dark-mode.ts          # WeChat dark mode algorithm
│   ├── copy/
│   │   └── wechatCopy.ts         # Copy-to-WeChat pipeline
│   ├── storage.ts                # IndexedDB/localStorage abstraction
│   └── stores/
│       ├── editorStore.ts        # Editor content state
│       ├── themeStore.ts         # Theme selection & customization
│       └── settingsStore.ts      # App settings
├── styles/
│   ├── editor.css                # CodeMirror overrides
│   ├── preview.css               # Preview pane styles
│   └── themes/                   # Per-theme CSS files
└── hooks/
    ├── useSyncScroll.ts          # Editor↔Preview scroll sync
    ├── useAutoSave.ts            # Auto-save to IndexedDB
    └── useDarkMode.ts            # Dark mode toggle
```

### 3.3 State Management

**Decision**: Zustand (lightweight, no boilerplate)

WeMD uses Zustand with 3 stores. We adopt the same pattern:

- **editorStore**: Markdown content, cursor position, file path, dirty state
- **themeStore**: Selected theme, custom themes, custom CSS, designer variables
- **settingsStore**: UI theme (light/dark), image host config, preferences

All persisted to localStorage/IndexedDB (no backend required for core functionality).

### 3.4 Editor Engine

**Decision**: CodeMirror 6 (matching WeMD)

CodeMirror 6 is the best choice because:
- WeMD already uses it successfully
- Excellent Markdown support via `@codemirror/lang-markdown`
- Custom extensions for search, paste handling, scroll sync
- Theme-able (light/dark editor themes)
- Handles large documents efficiently

Alternatives considered and rejected:
- Monaco Editor: Too heavy, overkill for Markdown
- ProseMirror: Better for WYSIWYG, not raw Markdown editing
- textarea: Too basic, no syntax highlighting

### 3.5 Markdown Parser

**Decision**: markdown-it (matching WeMD's `@wemd/core`)

WeMD's core package uses markdown-it with 15+ plugins. We replicate this approach:

**Plugins needed:**
| Plugin | Purpose |
|--------|---------|
| `markdown-it` | Base parser |
| `markdown-it-container` | Custom containers (admonitions) |
| `markdown-it-deflist` | Definition lists |
| `markdown-it-emoji` | Emoji shortcodes |
| `markdown-it-implicit-figures` | Auto-wrap images in `<figure>` |
| `markdown-it-imsize` | Image size syntax `![alt](url =100x200)` |
| `markdown-it-katex` | Math formulas |
| `markdown-it-mark` | `==highlighted==` text |
| `markdown-it-ruby` | Ruby annotations |
| `markdown-it-sub` / `markdown-it-sup` | Subscript/superscript |
| `markdown-it-table-of-contents` | Auto TOC |
| `markdown-it-task-lists` | Checkbox task lists |

**Custom plugins to port from WeMD:**
- `markdown-it-span` — custom `<span>` wrapping
- `markdown-it-table-container` — scrollable table wrapper
- `markdown-it-linkfoot` — link-to-footnote conversion
- `markdown-it-imageflow` — sliding image groups
- `markdown-it-multiquote` — nested blockquotes
- `markdown-it-li` — list item processing
- `markdown-it-github-alert` — GitHub-style alert blocks
- `markdown-it-checkbox-emoji` — checkbox emoji support
- `markdown-it-math` — math formula detection
- `markdown-it-underline` — underline support

### 3.6 Theming System

**Decision**: CSS-based themes with optional visual designer

Each theme is a CSS string applied to the preview pane. Theme structure:

```typescript
interface Theme {
  id: string;
  name: string;
  css: string;                    // Full CSS for the theme
  isBuiltIn: boolean;
  editorMode?: 'visual' | 'css'; // How the user created it
  designerVariables?: DesignerVariables; // Visual designer state
}
```

**13 Built-in Themes** (ported from WeMD `packages/core/src/themes/`):
1. Basic (default clean theme)
2. Academic Paper — scholarly typography
3. Aurora Glass — glassmorphism effect
4. Bauhaus — geometric, bold colors
5. Code-GitHub — GitHub-style code blocks
6. Custom Default — user template
7. Cyberpunk Neon — neon-on-dark aesthetic
8. Knowledge Base — wiki/documentation style
9. Luxury Gold — gold accents on dark
10. Morandi Forest — muted earth tones
11. Neo-Brutalism — thick borders, bold
12. Receipt — thermal printer style
13. Sunset Film — warm cinematic tones

**Theme CSS Injection**:
Preview uses inline `<style>` tags (not CSS modules) to apply theme CSS to the rendered HTML. This matches WeMD's approach and is required for copy-to-WeChat compatibility.

### 3.7 Storage Strategy

**Decision**: IndexedDB primary, localStorage fallback

```typescript
// Storage layers (matching WeMD's adapter pattern)
interface StorageAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listFiles(): Promise<FileItem[]>;
  deleteFile(path: string): Promise<void>;
  // ...
}
```

**What gets stored:**
- Current document content → IndexedDB (large, frequent writes)
- Theme selections → localStorage
- Custom themes → localStorage
- Image host settings → localStorage
- UI preferences (dark mode, layout) → localStorage
- Document history/snapshots → IndexedDB (optional, P2)

---

## 4. Technical Approach by Feature

### 4.1 Markdown Editor (CodeMirror 6)

```tsx
// Editor/CodeMirrorEditor.tsx
import { EditorView, minimalSetup } from 'codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'
import { wechatMarkdownHighlighting } from './markdownTheme'

// Key extensions:
// - minimalSetup: basic keybindings, undo/redo
// - markdown(): Markdown language support
// - wechatMarkdownHighlighting: custom syntax colors
// - EditorView.lineWrapping: soft line wrap
// - customKeymap: bold (Ctrl+B), italic (Ctrl+I), link (Ctrl+K)
// - paste handler: image paste → upload flow
// - scroll sync: dispatch events for preview sync
```

**CodeMirror Theme**:
WeMD defines custom `wechatMarkdownHighlighting` with WeChat-friendly colors. Port this directly.

**Custom Keyboard Shortcuts** (from WeMD `editorShortcuts.ts`):
- `Ctrl/Cmd + B`: Wrap selection in `**`
- `Ctrl/Cmd + I`: Wrap selection in `*`
- `Ctrl/Cmd + K`: Insert `[text](url)`
- `Ctrl/Cmd + Shift + X`: Strikethrough `~~`
- `Ctrl/Cmd + Shift + H`: Highlight `==`
- `Ctrl/Cmd + Shift + U`: Underline `<u>`

### 4.2 Live Preview with Sync Scrolling

```tsx
// Custom event for sync scroll
const SYNC_SCROLL_EVENT = 'wemd-sync-scroll'

// Editor dispatches scroll ratio
EditorView.domEventHandlers({
  scroll: (event, view) => {
    const ratio = view.scrollDOM.scrollTop / 
      (view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight)
    window.dispatchEvent(new CustomEvent(SYNC_SCROLL_EVENT, {
      detail: { source: 'editor', ratio }
    }))
  }
})

// Preview listens and applies scroll
useEffect(() => {
  const handler = (e: CustomEvent) => {
    if (e.detail.source === 'editor' && previewRef.current) {
      const maxScroll = previewRef.current.scrollHeight - 
        previewRef.current.clientHeight
      previewRef.current.scrollTop = e.detail.ratio * maxScroll
    }
  }
  window.addEventListener(SYNC_SCROLL_EVENT, handler)
  return () => window.removeEventListener(SYNC_SCROLL_EVENT, handler)
}, [])
```

### 4.3 Copy to WeChat Pipeline

This is the most complex feature. WeMD's `wechatCopyService.ts` implements a multi-step pipeline:

```
1. Parse Markdown → HTML (markdown-it + plugins)
2. Apply theme CSS (with CSS variable expansion)
3. Render Mermaid diagrams → inline SVG
4. Render KaTeX → MathJax for clipboard
5. Convert titled links → footnotes (optional)
6. Materialize CSS counter pseudo-elements
7. Expand CSS variables (WeChat strips var())
8. Inline all styles (no external CSS)
9. Normalize copy container
10. Strip copy metadata
11. Handle Mac code bar SVG → PNG conversion
12. Write to clipboard as rich HTML
```

**Key WeChat Compatibility Rules:**
- WeChat strips `<style>` tags — all styles must be inline
- WeChat strips `class` attributes — use inline `style` only
- WeChat strips `var()` — must expand CSS variables
- WeChat strips CSS counters — must materialize
- WeChat strips SVG — convert to PNG data URLs
- WeChat limits image dimensions — compress before paste

**Implementation approach:**
```typescript
// copy/wechatCopy.ts
export async function copyToWechat(markdown: string, css: string) {
  // 1. Parse markdown to HTML
  const html = parser.render(markdown)
  
  // 2. Expand CSS variables
  const expandedCss = expandCSSVariables(css)
  
  // 3. Render Mermaid → SVG → PNG (if present)
  const mermaidHtml = await renderMermaidBlocks(html)
  
  // 4. Apply theme + inline styles
  const styledHtml = processHtml(mermaidHtml, expandedCss, true)
  
  // 5. Materialize counters
  const counterHtml = materializeCounterPseudoContent(styledHtml)
  
  // 6. Normalize for WeChat
  const cleanHtml = normalizeCopyContainer(counterHtml)
  
  // 7. Copy to clipboard
  const blob = new Blob([cleanHtml], { type: 'text/html' })
  const item = new ClipboardItem({ 'text/html': blob })
  await navigator.clipboard.write([item])
}
```

### 4.4 WeChat Dark Mode Preview

The dark mode algorithm is the most technically sophisticated feature. It's based on WeChat's official `mp-darkmode` open-source algorithm.

**Algorithm Overview:**
1. Parse CSS to extract color declarations
2. Classify elements by type (heading, body, table, code, blockquote, etc.)
3. Convert colors from hex/rgb to HSL color space
4. Apply semantic-aware lightness inversion:
   - Backgrounds: dark → light, light → dark
   - Text: invert with contrast preservation
   - Decorative elements: preserve saturation, adjust lightness
   - Vibrant colors: protect saturation, shift lightness
5. Cache converted CSS for performance (LRU, 200 entries)
6. Add conversion marker to prevent double-processing

```typescript
// lib/themes/dark-mode.ts (ported from packages/core/wechatDarkMode.ts)
export function convertCssToWeChatDarkMode(css: string): string {
  // Check cache
  const cacheKey = hashCss(css)
  if (darkCssCache.has(cacheKey)) return darkCssCache.get(cacheKey)!
  
  // Parse CSS nodes
  const nodes = parseCssNodes(css)
  
  // Process each rule
  for (const node of nodes) {
    if (node.type === 'rule') {
      node.body = convertCssBody(node.body, classifyElement(node.selector))
    }
  }
  
  // Serialize back to CSS string
  const result = serializeCssNodes(nodes)
  darkCssCache.set(cacheKey, result)
  return result
}
```

**Element Classification:**
| Element Type | Selector Patterns | Conversion Strategy |
|---|---|---|
| `heading` | `h1-h6`, `.heading` | Brighten text, darken background |
| `body` | `p`, `span`, `div` | Standard inversion |
| `background` | `body`, `.container`, main containers | Full background inversion |
| `table` | `table`, `th`, `td`, `tr` | Border + cell background |
| `code` | `pre`, `code`, `.hljs` | Preserve syntax colors, invert bg |
| `blockquote` | `blockquote` | Border + background adjustment |
| `decorative-dark` | Low-luminance decorative | Protect from over-brightening |
| `vibrant-protected` | High-saturation colors | Preserve saturation |

### 4.5 Theme Designer (Visual)

10-section visual designer matching WeMD's implementation:

| Section | Controls |
|---------|----------|
| **Global** | Body font, font size, line height, text color, background, container width, padding |
| **Heading** | H1-H4: font, size, weight, color, margin, decoration |
| **Paragraph** | Font, size, line height, color, margin, alignment |
| **Quote** | Border style/color, padding, background, text color, italic |
| **List** | Bullet style, spacing, indentation, color |
| **Code** | Font, size, background, border radius, syntax colors, padding |
| **Image** | Max width, border radius, shadow, alignment |
| **Table** | Border, header bg, cell padding, alternating rows, width |
| **Mermaid** | Theme selection (base/dark/forest/default), primary color |
| **Other** | HR style, link color, footnote style, checkbox style |

Each section generates CSS via a `generateCSS(variables)` function. The designer operates in two modes:
- **Visual mode**: Sliders, color pickers, font selectors
- **CSS mode**: Raw CSS text editor

### 4.6 Advanced Search & Replace

```tsx
// Features:
// - Case-sensitive toggle
// - Regex toggle
// - Whole-word match toggle
// - Match counter (N of M)
// - Navigate matches (up/down arrows)
// - Replace single / Replace all
// - Live highlight in editor

// Implementation via CodeMirror compartments:
const searchCompartments = new WeakMap<EditorView, Compartment>()

// Highlight matches using EditorView decoration
// Navigate using EditorView.dispatch with selection updates
```

### 4.7 Mermaid Diagram Support

```typescript
// Preview renders mermaid blocks:
import mermaid from 'mermaid'

// Initialize once
mermaid.initialize({ startOnLoad: false, theme: 'default' })

// Render after HTML update
const mermaidBlocks = previewRef.querySelectorAll('.mermaid')
for (const block of mermaidBlocks) {
  const id = `mermaid-${renderToken}-${index}`
  const { svg } = await mermaid.render(id, block.textContent)
  block.innerHTML = svg
}
```

**Theme-aware**: Mermaid colors adapt to the current theme via CSS variables passed to mermaid's `theme` and `themeVariables` config.

### 4.8 Math Formula Support

Two-layer approach (matching WeMD):

1. **Preview**: KaTeX (fast, lightweight)
   - Render on DOM after HTML update
   - Use `katex.render()` for each formula element

2. **Copy to WeChat**: MathJax (better WeChat compatibility)
   - Convert KaTeX to MathJax output for clipboard
   - WeChat doesn't support KaTeX CSS, so MathJax's SVG output is needed

```typescript
// Preview rendering
import katex from 'katex'

export function renderMathInElement(container: HTMLElement) {
  // Find $...$ and $$...$$ patterns in text nodes
  // Render each with katex.render()
}
```

### 4.9 Image Paste & Upload

When user pastes an image from clipboard:

```
1. Detect paste event with image data
2. Check file size → auto-compress if > WeChat limit (10MB)
3. Show "Uploading..." placeholder in editor
4. Upload to configured image host
5. Replace placeholder with final URL
6. Show success toast
```

**Auto-compression** (from WeMD `autoCompressImage.ts`):
- Target: WeChat's 10MB limit per image
- Strategy: Canvas resize + JPEG quality reduction
- Binary search for optimal quality within size constraint

### 4.10 File History (P2)

```typescript
// IndexedDB-based version history
interface HistorySnapshot {
  id: string
  timestamp: number
  markdown: string
  themeId: string
  label?: string
}

// Auto-snapshot on significant changes (debounced)
// Manual snapshot on explicit save
// Restore any snapshot with one click
```

---

## 5. Integration Points

### 5.1 Navigation & Tool Registration

Add to `lib/tools.ts`:

```typescript
{
  name: 'WeChat Markdown Editor',
  slug: 'wechat-markdown-editor',
  description: 'Write Markdown and copy beautifully styled content to WeChat public accounts with one click',
  category: 'Writing',
  color: '#07C160'  // WeChat green
}
```

### 5.2 Layout Integration

**Decision**: The editor uses a **custom layout**, NOT the standard `ToolLayout` component. Reasons:
- The editor needs full-width, full-height viewport space
- It has its own header/toolbar
- The standard ToolLayout adds breadcrumbs, title, description, related tools — inappropriate for an editor

```tsx
// app/[locale]/tools/wechat-markdown-editor/page.tsx
import { generateToolMetadata } from '@/lib/metadata'
import EditorClient from './client'

export const metadata = generateToolMetadata('wechat-markdown-editor')

export default function WeChatMarkdownEditorPage() {
  return <EditorClient />
}
```

The editor manages its own chrome (header bar with copy button, theme picker, settings).

### 5.3 Existing Markdown Tool

The existing `markdown` tool remains unchanged. It serves a different purpose (quick Markdown-to-HTML preview). The new tool is not a replacement but a complementary product.

### 5.4 Header/Footer

The editor should include:
- A subtle "← Back to tools" link (top-left or integrated into header)
- The site header can be included via a simplified wrapper
- No `RelatedTools` component (not appropriate for an editor)

### 5.5 Styles

The editor uses **Tailwind CSS** (already in the project) for its own UI components, plus custom CSS files for:
- CodeMirror theme overrides
- Preview pane theme injection
- Split-pane layout
- Theme designer controls

All preview/theme CSS is injected dynamically (not Tailwind), matching WeMD's approach.

### 5.6 i18n

Following the site's existing i18n pattern with `next-intl`:

```typescript
// Editor UI strings (labels, buttons, tooltips)
const editorStrings = {
  en: {
    'editor.copy': 'Copy to WeChat',
    'editor.theme': 'Theme',
    'editor.search': 'Search',
    'editor.darkMode': 'Dark Mode Preview',
    // ...
  },
  zh: {
    'editor.copy': '复制到公众号',
    'editor.theme': '主题',
    'editor.search': '搜索',
    'editor.darkMode': '深色模式预览',
    // ...
  },
  // ...
}
```

---

## 6. WeChat-Specific Considerations

### 6.1 HTML Sanitization Rules

WeChat's public account editor applies its own sanitization. Key constraints:

| Rule | Impact | Mitigation |
|------|--------|------------|
| Strips `<style>` tags | Can't use stylesheet blocks | All styles must be inline on each element |
| Strips `class` attributes | Can't use CSS classes | Use inline `style` for everything |
| Strips `var()` CSS functions | CSS variables broken | Expand all CSS variables before copy |
| Strips `@keyframes` | No CSS animations | Avoid animations in copied content |
| Strips SVG elements | Code block SVG decorations fail | Convert SVG to PNG data URLs |
| Strips `<script>` tags | No JS interactivity | N/A (static content) |
| Strips `position: fixed/sticky` | Fixed elements fail | Use relative/absolute only |
| Limited CSS property support | Some properties ignored | Test each property, use fallbacks |
| Image max ~10MB | Large images rejected | Auto-compress before upload |

### 6.2 Dark Mode Algorithm Details

WeChat's dark mode inverts the public account page. The preview algorithm must:

1. **Parse CSS efficiently**: Handle nested rules, at-rules, media queries
2. **Classify selectors**: Use selector pattern matching to determine element type
3. **Convert in HSL space**: Lightness inversion is more perceptually uniform than RGB
4. **Preserve semantic meaning**: Text must remain readable, decorative elements maintain relative appearance
5. **Cache aggressively**: CSS conversion is expensive; LRU cache with 200-entry limit
6. **Handle edge cases**: `currentcolor`, `inherit`, `transparent`, zero-alpha colors

### 6.3 Code Block Rendering

WeChat has limited code block support. WeMD's approach:
- Highlight code with highlight.js
- Wrap in `<pre class="custom">` (the `custom` class prevents WeChat's default code stripping)
- Optionally add Mac-style traffic light SVG bar (converted to PNG for clipboard)

### 6.4 Table Rendering

WeChat tables need special handling:
- Must be wrapped in a scrollable container
- Inline styles for all borders, padding, backgrounds
- Header row styling must be explicit

### 6.5 Image Handling

- Images pasted into editor are auto-uploaded to configured host
- WeChat doesn't support `<figure>` with `<figcaption>` in the same way — WeMD wraps images carefully
- Image alignment (left/center/right) via inline styles
- Max width constraints via inline `max-width`

---

## 7. Dependencies & Packages

### New NPM Packages Required

| Package | Version | Purpose | Size |
|---------|---------|---------|------|
| `codemirror` | ^6.0 | Editor framework | ~15KB |
| `@codemirror/lang-markdown` | ^6.5 | Markdown language | ~8KB |
| `@codemirror/search` | ^6.5 | Search panel | ~5KB |
| `@codemirror/state` | ^6.5 | Editor state | ~5KB |
| `@codemirror/view` | ^6.38 | Editor view | ~20KB |
| `@lezer/markdown` | ^1.6 | Markdown parser | ~10KB |
| `@uiw/codemirror-theme-github` | ^4.25 | GitHub editor theme | ~2KB |
| `markdown-it` | ^14.1 | MD→HTML parser | ~30KB |
| `highlight.js` | ^11.11 | Syntax highlighting | ~40KB |
| `katex` | ^0.16 | Math rendering | ~200KB |
| `mermaid` | ^11.12 | Diagram rendering | ~500KB |
| `zustand` | ^5.0 | State management | ~3KB |
| `lucide-react` | ^0.55 | Icons | ~50KB |
| `react-hot-toast` | ^2.6 | Toast notifications | ~5KB |
| `juice` | ^5.2 | CSS inlining | ~10KB |

**Plugins (matching WeMD):**
| Package | Purpose |
|---------|---------|
| `markdown-it-emoji` | Emoji shortcodes |
| `markdown-it-task-lists` | Checkbox lists |
| `markdown-it-deflist` | Definition lists |
| `markdown-it-implicit-figures` | Auto figure wrapping |
| `markdown-it-imsize` | Image sizes |
| `markdown-it-ruby` | Ruby annotations |
| `markdown-it-mark` | Highlighted text |
| `markdown-it-sub` / `markdown-it-sup` | Sub/superscript |
| `markdown-it-table-of-contents` | Auto TOC |
| `markdown-it-container` | Custom containers |

**Custom plugins to port** (from WeMD `packages/core/src/plugins/`):
| Plugin | Complexity |
|--------|-----------|
| `markdown-it-span` | Low |
| `markdown-it-table-container` | Low |
| `markdown-it-math` | Medium |
| `markdown-it-linkfoot` | Medium |
| `markdown-it-imageflow` | Medium |
| `markdown-it-multiquote` | Low |
| `markdown-it-li` | Low |
| `markdown-it-github-alert` | Low |
| `markdown-it-checkbox-emoji` | Low |
| `markdown-it-underline` | Low |

### Size Budget

Total new JS bundle: ~300-400KB gzipped (CodeMirror + markdown-it + plugins)
Mermaid: ~200KB gzipped (lazy-loaded)
KaTeX: ~80KB gzipped (lazy-loaded)

**Lazy loading strategy**: Mermaid and KaTeX are loaded on demand, not in the initial bundle.

---

## 8. File Structure

```
devtools-hub/
├── app/[locale]/tools/wechat-markdown-editor/
│   ├── page.tsx                      # Server component (metadata)
│   └── client.tsx                    # Root client component
│
├── components/wemd-editor/
│   ├── Editor/
│   │   ├── CodeMirrorEditor.tsx      # CodeMirror 6 wrapper
│   │   ├── Toolbar.tsx               # Formatting buttons
│   │   ├── SearchPanel.tsx           # Find/replace
│   │   ├── SyntaxHelp.tsx            # Syntax reference
│   │   ├── SaveIndicator.tsx         # Auto-save status
│   │   ├── markdownTheme.ts          # CM syntax theme
│   │   ├── editorShortcuts.ts        # Key bindings
│   │   └── MarkdownEditor.css        # Editor styles
│   │
│   ├── Preview/
│   │   ├── MarkdownPreview.tsx       # Preview pane
│   │   ├── DarkModePreview.tsx       # Dark mode toggle
│   │   └── MarkdownPreview.css       # Preview styles
│   │
│   ├── Theme/
│   │   ├── ThemePanel.tsx            # Theme selector modal
│   │   ├── ThemePanelView.tsx        # Theme grid view
│   │   ├── ThemeDesigner.tsx         # Visual designer
│   │   ├── ThemeLivePreview.tsx      # Live preview thumb
│   │   ├── ColorSelector.tsx         # Color picker
│   │   ├── SliderInput.tsx           # Range slider
│   │   ├── ThemePanel.css
│   │   ├── ThemeDesigner.css
│   │   └── sections/                 # Designer sections
│   │       ├── GlobalSection.tsx
│   │       ├── HeadingSection.tsx
│   │       ├── ParagraphSection.tsx
│   │       ├── QuoteSection.tsx
│   │       ├── ListSection.tsx
│   │       ├── CodeSection.tsx
│   │       ├── ImageSection.tsx
│   │       ├── TableHrSection.tsx
│   │       ├── MermaidSection.tsx
│   │       └── OtherSection.tsx
│   │
│   ├── Layout/
│   │   ├── EditorLayout.tsx          # Split pane container
│   │   ├── Header.tsx                # Top bar
│   │   └── MobileToolbar.tsx         # Mobile bottom bar
│   │
│   ├── Settings/
│   │   ├── ImageHostSettings.tsx     # Image host config
│   │   └── SettingsModal.tsx         # Settings dialog
│   │
│   └── common/
│       ├── Modal.tsx
│       └── FloatingToolbarButton.tsx
│
├── lib/wemd/
│   ├── parser.ts                     # markdown-it setup
│   ├── copy/
│   │   ├── wechatCopy.ts             # Main copy pipeline
│   │   ├── cssVariableExpander.ts    # var() expansion
│   │   ├── wechatCopyNormalizer.ts   # HTML normalization
│   │   ├── wechatCounterCompat.ts    # Counter materialization
│   │   ├── wechatMermaidRenderer.ts  # Mermaid → clipboard
│   │   └── wechatTableRenderer.ts    # Table → clipboard
│   │
│   ├── themes/
│   │   ├── index.ts                  # Theme registry
│   │   ├── types.ts                  # Theme interfaces
│   │   ├── darkMode.ts              # WeChat dark mode algo
│   │   └── built-in/                 # Theme CSS files
│   │       ├── basic.ts
│   │       ├── academic-paper.ts
│   │       ├── aurora-glass.ts
│   │       ├── bauhaus.ts
│   │       ├── cyberpunk-neon.ts
│   │       ├── knowledge-base.ts
│   │       ├── luxury-gold.ts
│   │       ├── morandi-forest.ts
│   │       ├── neo-brutalism.ts
│   │       ├── receipt.ts
│   │       ├── sunset-film.ts
│   │       ├── code-github.ts
│   │       └── custom-default.ts
│   │
│   ├── plugins/                      # Custom MD-it plugins
│   │   ├── markdown-it-span.ts
│   │   ├── markdown-it-table-container.ts
│   │   ├── markdown-it-math.ts
│   │   ├── markdown-it-linkfoot.ts
│   │   ├── markdown-it-imageflow.ts
│   │   ├── markdown-it-multiquote.ts
│   │   ├── markdown-it-li.ts
│   │   ├── markdown-it-github-alert.ts
│   │   ├── markdown-it-checkbox-emoji.ts
│   │   └── markdown-it-underline.ts
│   │
│   ├── stores/
│   │   ├── editorStore.ts
│   │   ├── themeStore.ts
│   │   └── settingsStore.ts
│   │
│   └── hooks/
│       ├── useSyncScroll.ts
│       ├── useAutoSave.ts
│       ├── useDarkMode.ts
│       └── useMobileView.ts
│
└── styles/wemd/
    ├── editor.css
    ├── preview.css
    └── designer.css
```

---

## 9. Testing Strategy

Following the project's 100% coverage requirement:

### Unit Tests
- `parser.ts`: All markdown-it plugins render correctly
- `darkMode.ts`: Color conversion functions (hex→rgb→hsl→inverted)
- `cssVariableExpander.ts`: Variable expansion with nested resolution
- `wechatCopyNormalizer.ts`: HTML sanitization rules
- `stores/editorStore.ts`: State transitions
- `stores/themeStore.ts`: Theme CRUD operations
- `themes/built-in/*.ts`: Each theme CSS generates valid output
- `plugins/*.ts`: Each markdown-it plugin handles edge cases

### Integration Tests
- Copy pipeline: Markdown → styled HTML → clipboard (mock Clipboard API)
- Theme switching: Select theme → preview updates → CSS applied correctly
- Dark mode: Light CSS → dark CSS conversion → color accuracy
- Auto-save: Edit → debounce → IndexedDB write → reload → restore
- Image paste: Paste → compress → upload → URL insertion

### E2E Tests (Playwright)
- Full editor flow: Type markdown → see preview → switch theme → copy to WeChat
- Theme designer: Adjust slider → CSS updates → preview reflects change
- Search/replace: Open search → find matches → replace all → verify
- Dark mode toggle: Toggle → preview shows dark mode simulation
- Mobile viewport: Verify responsive layout works

### Test Commands
```bash
# Unit tests
pnpm test:unit -- --testPathPattern=wemd

# Integration tests
pnpm test:integration -- --testPathPattern=wemd

# E2E tests
npx playwright test --grep="wechat-markdown-editor"
```

---

## 10. SEO & Metadata

### Page Metadata

```typescript
// app/[locale]/tools/wechat-markdown-editor/page.tsx
export const metadata = {
  title: 'WeChat Markdown Editor — Write & Copy to WeChat | DevTools Hub',
  description: 'Write Markdown and copy beautifully styled content to WeChat public accounts with one click. 10+ themes, dark mode preview, no login required.',
  keywords: [
    'WeChat Markdown editor',
    '微信公众号排版',
    'WeChat public account editor',
    'Markdown to WeChat',
    '公众号编辑器',
    'free online editor',
    'markdown editor',
  ],
  openGraph: {
    title: 'WeChat Markdown Editor — Free Online Tool',
    description: 'Write Markdown and copy styled content to WeChat with 10+ beautiful themes.',
    url: 'https://tools.pixiaoli.cn/tools/wechat-markdown-editor/',
    siteName: 'DevTools Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'WeChat Markdown Editor — Free Online Tool',
    description: 'Write Markdown and copy styled content to WeChat with one click.',
  },
  alternates: {
    canonical: 'https://tools.pixiaoli.cn/tools/wechat-markdown-editor/',
  },
}
```

### JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "WeChat Markdown Editor",
  "description": "Write Markdown and copy beautifully styled content to WeChat public accounts",
  "url": "https://tools.pixiaoli.cn/tools/wechat-markdown-editor/",
  "applicationCategory": "WritingApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Markdown editor with GFM support",
    "10+ built-in themes",
    "One-click copy to WeChat",
    "WeChat dark mode preview",
    "Visual theme designer",
    "Mermaid diagram support",
    "Math formula support",
    "Local-first storage"
  ]
}
```

---

## 11. Implementation Phases

### Phase 1: MVP (Week 1-2)

**Goal**: Working editor with basic theme support and copy to WeChat.

**Deliverables:**
1. ✅ New route + page component
2. ✅ CodeMirror 6 editor with Markdown highlighting
3. ✅ Live preview with markdown-it + basic plugins
4. ✅ 3 built-in themes (Basic, Knowledge Base, Code-GitHub)
5. ✅ Theme selector (simple dropdown)
6. ✅ Copy to WeChat (basic pipeline)
7. ✅ Light/Dark UI toggle
8. ✅ LocalStorage auto-save
9. ✅ Toolbar with basic formatting buttons
10. ✅ Tool registration in `lib/tools.ts`

**Acceptance Criteria:**
- User can write Markdown and see live preview
- User can select from 3 themes
- "Copy to WeChat" copies styled HTML to clipboard
- Pastes correctly into WeChat public account editor
- Data persists across page reloads

### Phase 2: Enhanced Features (Week 3-4)

**Goal**: Feature parity with core WeMD capabilities.

**Deliverables:**
1. ✅ All 13 built-in themes
2. ✅ Visual Theme Designer (10 sections)
3. ✅ Custom CSS editor mode
4. ✅ WeChat Dark Mode Preview algorithm
5. ✅ Advanced Search & Replace (regex, case, whole word)
6. ✅ Mermaid diagram rendering
7. ✅ KaTeX math formulas
8. ✅ Image paste → auto-compress → upload
9. ✅ Mac code bar option
10. ✅ Sync scrolling (editor ↔ preview)

**Acceptance Criteria:**
- All 13 themes render correctly
- Theme designer produces working CSS
- Dark mode preview matches WeChat (98%+ accuracy)
- Search/replace works with regex
- Mermaid diagrams render in preview
- Math formulas display correctly

### Phase 3: Polish & Advanced (Week 5-6)

**Goal**: Full feature parity with WeMD, plus i18n and testing.

**Deliverables:**
1. ✅ Multi-image hosting (Qiniu, Aliyun, Tencent, S3)
2. ✅ Sliding image groups
3. ✅ File history / versioning
4. ✅ Export as HTML file
5. ✅ Import/Export themes
6. ✅ Link-to-footnote conversion
7. ✅ TOC generation
8. ✅ i18n (EN/PT/ES/JA/KO)
9. ✅ Mobile responsive layout
10. ✅ 100% test coverage

**Acceptance Criteria:**
- All image hosts work with test credentials
- i18n works for all 5 languages
- Mobile layout is functional
- All tests pass with 100% coverage

---

## Appendix A: WeMD Source Code Analysis

### Key Files to Reference

| WeMD File | Purpose | Port Priority |
|-----------|---------|---------------|
| `packages/core/src/MarkdownParser.ts` | Core parser setup | P0 |
| `packages/core/src/wechatDarkMode.ts` | Dark mode algorithm | P1 |
| `packages/core/src/ThemeProcessor.ts` | CSS processing | P0 |
| `packages/core/src/plugins/*.ts` | 10 custom plugins | P0-P1 |
| `packages/core/src/themes/*.ts` | 13 theme definitions | P0 |
| `apps/web/src/components/Editor/MarkdownEditor.tsx` | Editor setup | P0 |
| `apps/web/src/components/Preview/MarkdownPreview.tsx` | Preview rendering | P0 |
| `apps/web/src/components/Theme/ThemeDesigner/` | Visual designer | P1 |
| `apps/web/src/components/Editor/SearchPanel.tsx` | Search/replace | P1 |
| `apps/web/src/services/wechatCopyService.ts` | Copy pipeline | P0 |
| `apps/web/src/services/image/` | Image hosting | P2 |
| `apps/web/src/store/themeStore.ts` | Theme state | P0 |
| `apps/web/src/store/editorStore.ts` | Editor state | P0 |

### License Compatibility

WeMD is MIT licensed. We can port code directly with attribution:

```
// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License © WeMD Team
```

All ported code should include the above attribution comment at the top of each file.

---

## Appendix B: Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| WeChat copy compatibility breaks | High | Medium | Test against WeChat editor regularly; maintain WeChat-specific sanitization |
| CodeMirror bundle too large | Medium | Low | Lazy-load; tree-shake unused extensions |
| Mermaid CSS conflicts | Medium | Medium | Render Mermaid in isolated container; inject theme CSS carefully |
| Dark mode algorithm edge cases | Medium | Medium | Extensive unit tests with real WeChat CSS samples |
| Image hosting CORS issues | High | Medium | Test each provider; document CORS configuration requirements |
| i18n coverage gaps | Low | High | Use translation keys for all UI strings; add missing translations early |
| Mobile CodeMirror issues | Medium | Medium | Test on real devices; consider simplified mobile editor |

---

## Appendix C: Competitive Analysis

| Feature | WeMD | This Tool | Markdown Nice | Mdnice |
|---------|------|-----------|---------------|--------|
| GFM + Extended MD | ✅ | ✅ | ✅ | ✅ |
| Built-in themes | 13 | 13 | 10+ | 10+ |
| Visual theme designer | ✅ | ✅ | ❌ | ❌ |
| Copy to WeChat | ✅ | ✅ | ✅ | ✅ |
| Dark mode preview | ✅ | ✅ | ❌ | ❌ |
| Image hosting | 5 providers | 5 providers | 3 providers | Official only |
| Mermaid support | ✅ | ✅ | ✅ | ✅ |
| Math formulas | KaTeX | KaTeX | MathJax | KaTeX |
| Local-first | ✅ | ✅ | ❌ | ❌ |
| Search & Replace | ✅ | ✅ | Basic | Basic |
| Free | ✅ | ✅ | Freemium | ✅ |

**Key differentiator**: Being part of tools.pixiaoli.cn gives SEO advantage alongside 30+ other developer tools. Cross-linking and shared traffic will drive adoption.
