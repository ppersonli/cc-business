// WeMD WeChat Copy Unit Tests
import { describe, it, expect } from 'vitest'
import { exportAsHtml } from '../../lib/wemd/copy/wechatCopy'

describe('WeChat Copy / Export', () => {
  describe('exportAsHtml', () => {
    it('returns valid HTML document', () => {
      const result = exportAsHtml('# Hello', 'basic')
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('<html')
      expect(result).toContain('</html>')
    })

    it('contains rendered markdown', () => {
      const result = exportAsHtml('**bold text**', 'basic')
      expect(result).toContain('<strong>bold text</strong>')
    })

    it('wraps with wemd-preview container', () => {
      const result = exportAsHtml('Hello', 'basic')
      expect(result).toContain('class="wemd-preview"')
    })

    it('includes theme CSS in style tag', () => {
      const result = exportAsHtml('Hello', 'basic')
      expect(result).toContain('<style>')
      expect(result).toContain('.wemd-preview')
    })

    it('handles unknown theme gracefully', () => {
      const result = exportAsHtml('Hello', 'nonexistent-theme')
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('wemd-preview')
    })

    it('renders tables in output', () => {
      const md = '| A | B |\n| --- | --- |\n| 1 | 2 |'
      const result = exportAsHtml(md, 'basic')
      expect(result).toContain('<table>')
      expect(result).toContain('<th>')
    })

    it('includes meta viewport for mobile', () => {
      const result = exportAsHtml('Hello', 'basic')
      expect(result).toContain('viewport')
    })

    it('handles empty content', () => {
      const result = exportAsHtml('', 'basic')
      expect(result).toContain('<!DOCTYPE html>')
      expect(result).toContain('wemd-preview')
    })

    it('renders code blocks', () => {
      const md = '```javascript\nconst x = 1\n```'
      const result = exportAsHtml(md, 'basic')
      expect(result).toContain('<pre')
      expect(result).toContain('hljs')
    })
  })
})
