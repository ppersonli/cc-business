'use client'
import { useState } from 'react'
import { getToolBySlug } from '@/lib/tools'
import ToolLayout from '@/components/ToolLayout'
import Markdown from 'react-markdown'

const tool = getToolBySlug('markdown')!

const SAMPLE = `# Hello World

## Features

- **Bold text** and *italic text*
- [Links](https://example.com) and images
- Inline \`code\` and code blocks

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
console.log(greet('World'))
\`\`\`

### Table

| Name | Role | Stack |
|------|------|-------|
| Alice | Frontend | React, TypeScript |
| Bob | Backend | Node.js, PostgreSQL |

### Blockquote

> "The best way to predict the future is to invent it."
> — Alan Kay

---

### Checklist

- [x] Build the editor
- [x] Add live preview
- [ ] Ship it

### Ordered List

1. Write your Markdown
2. See the preview instantly
3. Copy the HTML output
`

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE)

  return (
    <ToolLayout tool={tool}>
      <div style={{ marginBottom: 16 }}>
        <div className="options-row">
          <button className="btn" onClick={() => setInput(SAMPLE)}>Load Sample</button>
          <button className="btn" onClick={() => setInput('')}>Clear</button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {input.length} chars · {input.split('\n').length} lines
          </span>
        </div>
      </div>

      <div className="tool-grid">
        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Markdown</span>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="# Start writing Markdown..."
              style={{ border: 'none', borderRadius: 0, minHeight: 400, padding: 16, resize: 'vertical' }}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="tool-panel">
          <div className="panel-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Preview</span>
          </div>
          <div className="panel-body">
            <div className="markdown-preview" style={{ minHeight: 400 }}>
              {input ? (
                <Markdown>{input}</Markdown>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Preview will appear here...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
