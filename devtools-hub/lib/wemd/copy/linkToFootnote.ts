// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License
// Link-to-footnote conversion for WeChat articles
// Converts titled links to numbered footnotes since WeChat strips external links

/**
 * Converts links with title attributes to numbered footnotes.
 * 
 * Input:  `<a href="https://example.com" title="Example">Link Text</a>`
 * Output: `Link Text<sup>[1]</sup>` with a footnotes section at the bottom.
 * 
 * Only converts links that have a `title` attribute (opt-in per link).
 */
export function convertLinksToFootnotes(html: string): string {
  const links: Array<{ href: string; title: string; text: string }> = []
  let index = 0

  // Match <a> tags with title attribute
  const linkRegex = /<a\s+([^>]*?)href="([^"]*)"([^>]*?)title="([^"]*)"([^>]*)>(.*?)<\/a>/gi
  const result = html.replace(linkRegex, (_match, _pre, href, _mid, title, _post, text) => {
    index++
    links.push({ href, title, text })
    return `${text}<sup class="wemd-footnote-ref"><a href="#wemd-fn-${index}" id="wemd-fnref-${index}">[${index}]</a></sup>`
  })

  // If no links found, return original
  if (links.length === 0) return html

  // Build footnotes section
  let footnotes = '\n<hr class="wemd-footnotes-hr" />\n'
  footnotes += '<section class="wemd-footnotes">\n'
  footnotes += '<h3 class="wemd-footnotes-title">参考链接</h3>\n'
  footnotes += '<ol class="wemd-footnotes-list">\n'

  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const cleanUrl = link.href.replace(/^https?:\/\//, '').replace(/\/$/, '')
    footnotes += `<li id="wemd-fn-${i + 1}">`
    footnotes += `<span class="wemd-fn-text">${link.title || link.text}</span>`
    footnotes += `<span class="wemd-fn-url" style="color:#8b8b8b;font-size:12px;margin-left:4px;">(${cleanUrl})</span>`
    footnotes += `<a href="#wemd-fnref-${i + 1}" class="wemd-fn-back" style="margin-left:4px;font-size:11px;">↩</a>`
    footnotes += '</li>\n'
  }

  footnotes += '</ol>\n</section>\n'

  return result + footnotes
}
