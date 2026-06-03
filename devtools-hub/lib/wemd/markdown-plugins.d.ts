declare module 'markdown-it-container' {
  import MarkdownIt from 'markdown-it'
  export default function container(md: MarkdownIt, name: string, options?: unknown): void
}

declare module 'markdown-it-deflist' {
  import MarkdownIt from 'markdown-it'
  export default function deflist(md: MarkdownIt): void
}

declare module 'markdown-it-emoji' {
  import MarkdownIt from 'markdown-it'
  export function bare(md: MarkdownIt, options?: unknown): void
  export function light(md: MarkdownIt, options?: unknown): void
  export function full(md: MarkdownIt, options?: unknown): void
}

declare module 'markdown-it-task-lists' {
  import MarkdownIt from 'markdown-it'
  export default function taskLists(md: MarkdownIt, options?: unknown): void
}

declare module 'markdown-it-mark' {
  import MarkdownIt from 'markdown-it'
  export default function mark(md: MarkdownIt): void
}

declare module 'markdown-it-sub' {
  import MarkdownIt from 'markdown-it'
  export default function sub(md: MarkdownIt): void
}

declare module 'markdown-it-sup' {
  import MarkdownIt from 'markdown-it'
  export default function sup(md: MarkdownIt): void
}

declare module 'markdown-it-katex' {
  import MarkdownIt from 'markdown-it'
  export default function katex(md: MarkdownIt, options?: unknown): void
}

declare module 'markdown-it-footnote' {
  import MarkdownIt from 'markdown-it'
  export default function footnote(md: MarkdownIt): void
}
