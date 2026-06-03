// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

import { create } from 'zustand'
import type { EditorView } from '@codemirror/view'

const DEFAULT_CONTENT = `# 你好，WeChat！👋

欢迎使用 **WeMD 公众号 Markdown 排版编辑器**。

## 基本格式

**加粗文本**、*斜体文本*、~~删除线~~、==高亮文本==、<u>下划线文本</u>

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Mermaid 图表

\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[显示登录页]
    D --> C
\`\`\`

## 提示框

:::tip 小贴士
这是一个提示框，用于展示有用的信息。
:::

:::warning 注意
这是一个警告框，用于提醒用户注意。
:::

:::danger 危险
这是一个危险提示框，用于警告高风险操作。
:::

:::info 备注
这是一个信息框，用于展示补充说明。
:::

## 代码示例

\`\`\`javascript
function greet(name) {
  return \`你好, \${name}!\`;
}
console.log(greet('WeChat'));
\`\`\`

## 表格

| 功能 | 状态 | 说明 |
|---------|--------|------|
| 编辑器 | ✅ 完成 | CodeMirror 6 |
| 预览 | ✅ 完成 | 实时渲染 |
| 主题 | ✅ 完成 | 10+ 主题 |
| 复制 | ✅ 完成 | 一键复制 |

## 任务列表

- [x] 搭建编辑器
- [x] 添加实时预览
- [ ] 撰写文章
- [ ] 复制到公众号

## 引用

> "预测未来的最好方式就是创造它。" — 彼得·德鲁克

## 脚注

这里有一个脚注引用[^1]，还有一个[^note]。

[^1]: 这是第一个脚注的内容。
[^note]: 这是命名脚注的内容。

## 列表

### 无序列表
- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B

### 有序列表
1. 步骤一
2. 步骤二
3. 步骤三

---

Happy writing! 🚀
`

interface EditorState {
  content: string
  setContent: (content: string) => void
  editorView: EditorView | null
  setEditorView: (view: EditorView | null) => void
  lineCount: number
  wordCount: number
  lastSaved: number | null
  saveStatus: 'saved' | 'saving' | 'unsaved'
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void
  setLastSaved: (time: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  content: DEFAULT_CONTENT,
  setContent: (content) => {
    const lines = content.split('\n').length
    const chars = content.replace(/\s/g, '').length
    set({ content, lineCount: lines, wordCount: chars, saveStatus: 'unsaved' })
  },
  editorView: null,
  setEditorView: (view) => set({ editorView: view }),
  lineCount: DEFAULT_CONTENT.split('\n').length,
  wordCount: DEFAULT_CONTENT.replace(/\s/g, '').length,
  lastSaved: null,
  saveStatus: 'unsaved',
  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSaved: (time) => set({ lastSaved: time, saveStatus: 'saved' }),
}))

// Load saved content from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('wemd-content')
  if (saved) {
    const lines = saved.split('\n').length
    const chars = saved.replace(/\s/g, '').length
    useEditorStore.setState({ content: saved, lineCount: lines, wordCount: chars })
  }
}
