// WeMD Parser Unit Tests
import { describe, it, expect } from 'vitest'
import { createParser } from '../../lib/wemd/parser'

const parser = createParser()

describe('WeMD Parser', () => {
  describe('Basic Markdown', () => {
    it('renders headings', () => {
      const result = parser.render('# Hello')
      expect(result).toContain('<h1>')
      expect(result).toContain('Hello')
    })

    it('renders bold text', () => {
      const result = parser.render('**bold**')
      expect(result).toContain('<strong>bold</strong>')
    })

    it('renders italic text', () => {
      const result = parser.render('*italic*')
      expect(result).toContain('<em>italic</em>')
    })

    it('renders links', () => {
      const result = parser.render('[link](https://example.com)')
      expect(result).toContain('<a href="https://example.com"')
      expect(result).toContain('link</a>')
    })
  })

  describe('GFM Tables', () => {
    it('renders tables', () => {
      const md = '| A | B |\n| --- | --- |\n| 1 | 2 |'
      const result = parser.render(md)
      expect(result).toContain('<table>')
      expect(result).toContain('<th>')
      expect(result).toContain('<td>')
    })
  })

  describe('Task Lists', () => {
    it('renders task list items', () => {
      const md = '- [x] Done\n- [ ] Todo'
      const result = parser.render(md)
      expect(result).toContain('type="checkbox"')
      expect(result).toContain('checked')
    })
  })

  describe('Mark/Highlight', () => {
    it('renders mark text', () => {
      const result = parser.render('==highlighted==')
      expect(result).toContain('<mark>highlighted</mark>')
    })
  })

  describe('Sub/Sup', () => {
    it('renders subscript', () => {
      const result = parser.render('H~2~O')
      expect(result).toContain('<sub>2</sub>')
    })

    it('renders superscript', () => {
      const result = parser.render('29^th^')
      expect(result).toContain('<sup>th</sup>')
    })
  })

  describe('Footnotes', () => {
    it('renders footnote reference', () => {
      const result = parser.render('Text[^1]\n\n[^1]: Note content')
      expect(result).toContain('footnote')
    })
  })

  describe('Code Blocks', () => {
    it('renders syntax-highlighted code', () => {
      const md = '```javascript\nconst x = 1\n```'
      const result = parser.render(md)
      expect(result).toContain('<pre class="hljs">')
      expect(result).toContain('<code>')
    })

    it('renders plain code for unknown language', () => {
      const md = '```unknown\nhello world\n```'
      const result = parser.render(md)
      expect(result).toContain('<pre class="hljs">')
    })
  })

  describe('Mermaid', () => {
    it('renders mermaid blocks as div', () => {
      const md = '```mermaid\ngraph TD\n    A-->B\n```'
      const result = parser.render(md)
      expect(result).toContain('<div class="mermaid">')
      expect(result).toContain('A--&gt;B')
    })
  })

  describe('Alert Containers', () => {
    it('renders tip alert', () => {
      const md = ':::tip 小贴士\n这是提示\n:::'
      const result = parser.render(md)
      expect(result).toContain('wemd-alert')
      expect(result).toContain('wemd-alert-tip')
      expect(result).toContain('小贴士')
    })

    it('renders warning alert', () => {
      const md = ':::warning 注意\n这是警告\n:::'
      const result = parser.render(md)
      expect(result).toContain('wemd-alert-warning')
    })

    it('renders danger alert', () => {
      const md = ':::danger 危险\n这是危险\n:::'
      const result = parser.render(md)
      expect(result).toContain('wemd-alert-danger')
    })
  })

  describe('KaTeX Math', () => {
    it('renders inline math', () => {
      const result = parser.render('$E = mc^2$')
      // markdown-it-katex outputs with class "katex"
      expect(result).toContain('katex')
    })

    it('renders block math', () => {
      const result = parser.render('$$\nx^2 + y^2 = z^2\n$$')
      expect(result).toContain('katex')
    })
  })

  describe('Emoji', () => {
    it('renders emoji shortcode', () => {
      const result = parser.render(':smile:')
      // markdown-it-emoji should convert :smile: to emoji
      expect(result).not.toContain(':smile:')
    })
  })

  describe('Underline', () => {
    it('renders <u> underline', () => {
      const result = parser.render('<u>underlined</u>')
      expect(result).toContain('<u>underlined</u>')
    })
  })
})
