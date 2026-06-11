// Based on WeMD (https://github.com/tenngoxars/WeMD)
// MIT License

'use client'

import { useState, useMemo } from 'react'
import type { DesignerVariables } from '../../../lib/wemd/types'
import { defaultDesignerVariables, generateCSS } from '../../../lib/wemd/themes/generateCSS'
import { useThemeStore } from '../../../lib/wemd/stores/themeStore'
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore'
import ColorSelector from './ColorSelector'
import SliderInput, { SelectInput, ToggleInput } from './SliderInput'

interface ThemeDesignerProps {
  onClose: () => void
}

const SECTIONS = [
  { key: 'global', label: '全局', icon: '⚙' },
  { key: 'heading', label: '标题', icon: 'H' },
  { key: 'paragraph', label: '段落', icon: '¶' },
  { key: 'quote', label: '引用', icon: '❝' },
  { key: 'list', label: '列表', icon: '•' },
  { key: 'code', label: '代码', icon: '</>' },
  { key: 'image', label: '图片', icon: '🖼' },
  { key: 'table', label: '表格/HR', icon: '⊞' },
  { key: 'mermaid', label: 'Mermaid', icon: '◈' },
  { key: 'other', label: '其他', icon: '⋯' },
]

export default function ThemeDesigner({ onClose }: ThemeDesignerProps) {
  const { addCustomTheme, setCurrentThemeId } = useThemeStore()
  const { isDarkUI } = useSettingsStore()
  const [section, setSection] = useState('global')
  const [vars, setVars] = useState<DesignerVariables>({ ...defaultDesignerVariables })
  const [themeName, setThemeName] = useState('我的自定义主题')

  const updateVar = <K extends keyof DesignerVariables>(key: K, value: DesignerVariables[K]) => {
    setVars((prev) => ({ ...prev, [key]: value }))
  }

  const generatedCSS = useMemo(() => generateCSS(vars), [vars])

  const handleSave = () => {
    const id = 'designer-' + Date.now()
    addCustomTheme({
      id,
      name: themeName,
      css: generatedCSS,
      isBuiltIn: false,
      designerVariables: vars,
    })
    setCurrentThemeId(id)
    onClose()
  }

  const handleReset = () => {
    setVars({ ...defaultDesignerVariables })
  }

  const text = isDarkUI ? '#e2e8f0' : '#1e293b'
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b'
  const surfaceBg = isDarkUI ? '#1e293b' : '#f8fafc'
  const border = isDarkUI ? '#334155' : '#e2e8f0'
  const activeBg = isDarkUI ? '#1e3a5f' : '#e0f2fe'
  const activeBorder = isDarkUI ? '#3b82f6' : '#0284c7'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Theme name */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 10px',
            backgroundColor: isDarkUI ? '#0f172a' : '#ffffff',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            color: text,
            fontSize: '13px',
            outline: 'none',
          }}
          placeholder="主题名称"
        />
        <button
          onClick={handleReset}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            color: textMuted,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          重置
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '6px 14px',
            backgroundColor: '#07c160',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          保存
        </button>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              padding: '4px 10px',
              backgroundColor: section === s.key ? activeBg : surfaceBg,
              border: `1px solid ${section === s.key ? activeBorder : border}`,
              borderRadius: '4px',
              color: section === s.key ? activeBorder : text,
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: section === s.key ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span style={{ fontSize: '10px' }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Section controls */}
      <div
        style={{
          padding: '16px',
          backgroundColor: surfaceBg,
          border: `1px solid ${border}`,
          borderRadius: '8px',
          minHeight: '200px',
        }}
      >
        {section === 'global' && (
          <>
            <SelectInput
              label="字体"
              value={vars.fontFamily}
              onChange={(v) => updateVar('fontFamily', v)}
              isDarkUI={isDarkUI}
              options={[
                { label: '系统默认 (无衬线)', value: '-apple-system, "Helvetica Neue", sans-serif' },
                { label: 'Georgia (衬线)', value: 'Georgia, serif' },
                { label: '等宽字体', value: '"SF Mono", "Fira Code", Consolas, monospace' },
                { label: '苹方/微软雅黑', value: '"PingFang SC", "Microsoft YaHei", sans-serif' },
              ]}
            />
            <SliderInput label="字号" value={vars.fontSize} min={12} max={22} onChange={(v) => updateVar('fontSize', v)} isDarkUI={isDarkUI} />
            <SliderInput label="行高" value={vars.lineHeight} min={1.2} max={2.5} step={0.05} unit="" onChange={(v) => updateVar('lineHeight', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="文字颜色" value={vars.textColor} onChange={(v) => updateVar('textColor', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="背景颜色" value={vars.bgColor} onChange={(v) => updateVar('bgColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="内边距" value={vars.padding} min={0} max={60} onChange={(v) => updateVar('padding', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'heading' && (
          <>
            <ColorSelector label="标题颜色" value={vars.headingColor} onChange={(v) => updateVar('headingColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="H1 字号" value={vars.h1Size} min={18} max={40} onChange={(v) => updateVar('h1Size', v)} isDarkUI={isDarkUI} />
            <SliderInput label="H2 字号" value={vars.h2Size} min={16} max={32} onChange={(v) => updateVar('h2Size', v)} isDarkUI={isDarkUI} />
            <SliderInput label="H3 字号" value={vars.h3Size} min={14} max={26} onChange={(v) => updateVar('h3Size', v)} isDarkUI={isDarkUI} />
            <SliderInput label="H4 字号" value={vars.h4Size} min={13} max={22} onChange={(v) => updateVar('h4Size', v)} isDarkUI={isDarkUI} />
            <SliderInput label="字重" value={vars.headingWeight} min={400} max={900} step={100} unit="" onChange={(v) => updateVar('headingWeight', v)} isDarkUI={isDarkUI} />
            <SliderInput label="间距" value={vars.headingMargin} min={8} max={40} onChange={(v) => updateVar('headingMargin', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'paragraph' && (
          <>
            <ColorSelector label="文字颜色" value={vars.paragraphColor} onChange={(v) => updateVar('paragraphColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="字号" value={vars.paragraphSize} min={12} max={22} onChange={(v) => updateVar('paragraphSize', v)} isDarkUI={isDarkUI} />
            <SliderInput label="行高" value={vars.paragraphLineHeight} min={1.2} max={2.5} step={0.05} unit="" onChange={(v) => updateVar('paragraphLineHeight', v)} isDarkUI={isDarkUI} />
            <SliderInput label="段落间距" value={vars.paragraphMargin} min={4} max={40} onChange={(v) => updateVar('paragraphMargin', v)} isDarkUI={isDarkUI} />
            <SelectInput
              label="对齐方式"
              value={vars.paragraphAlign}
              onChange={(v) => updateVar('paragraphAlign', v)}
              isDarkUI={isDarkUI}
              options={[
                { label: '左对齐', value: 'left' },
                { label: '居中', value: 'center' },
                { label: '两端对齐', value: 'justify' },
              ]}
            />
          </>
        )}

        {section === 'quote' && (
          <>
            <ColorSelector label="边框颜色" value={vars.quoteBorderColor} onChange={(v) => updateVar('quoteBorderColor', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="背景颜色" value={vars.quoteBgColor} onChange={(v) => updateVar('quoteBgColor', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="文字颜色" value={vars.quoteTextColor} onChange={(v) => updateVar('quoteTextColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="字号" value={vars.quoteFontSize} min={12} max={20} onChange={(v) => updateVar('quoteFontSize', v)} isDarkUI={isDarkUI} />
            <SliderInput label="内边距" value={vars.quotePadding} min={4} max={30} onChange={(v) => updateVar('quotePadding', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'list' && (
          <>
            <ColorSelector label="标记颜色" value={vars.listMarkerColor} onChange={(v) => updateVar('listMarkerColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="字号" value={vars.listFontSize} min={12} max={22} onChange={(v) => updateVar('listFontSize', v)} isDarkUI={isDarkUI} />
            <SliderInput label="行高" value={vars.listLineHeight} min={1.2} max={2.5} step={0.05} unit="" onChange={(v) => updateVar('listLineHeight', v)} isDarkUI={isDarkUI} />
            <SliderInput label="缩进" value={vars.listIndent} min={10} max={50} onChange={(v) => updateVar('listIndent', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'code' && (
          <>
            <SelectInput
              label="代码字体"
              value={vars.codeFontFamily}
              onChange={(v) => updateVar('codeFontFamily', v)}
              isDarkUI={isDarkUI}
              options={[
                { label: 'SF Mono (默认)', value: '"SF Mono", "Fira Code", Consolas, monospace' },
                { label: 'Fira Code', value: '"Fira Code", "SF Mono", Consolas, monospace' },
                { label: 'JetBrains Mono', value: '"JetBrains Mono", "SF Mono", Consolas, monospace' },
              ]}
            />
            <ColorSelector label="背景颜色" value={vars.codeBgColor} onChange={(v) => updateVar('codeBgColor', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="文字颜色" value={vars.codeTextColor} onChange={(v) => updateVar('codeTextColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="字号" value={vars.codeFontSize} min={10} max={18} onChange={(v) => updateVar('codeFontSize', v)} isDarkUI={isDarkUI} />
            <SliderInput label="圆角" value={vars.codeBorderRadius} min={0} max={16} onChange={(v) => updateVar('codeBorderRadius', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'image' && (
          <>
            <SliderInput label="最大宽度" value={vars.imageMaxWidth} min={50} max={100} unit="%" onChange={(v) => updateVar('imageMaxWidth', v)} isDarkUI={isDarkUI} />
            <SliderInput label="圆角" value={vars.imageBorderRadius} min={0} max={24} onChange={(v) => updateVar('imageBorderRadius', v)} isDarkUI={isDarkUI} />
            <ToggleInput label="阴影效果" value={vars.imageShadow} onChange={(v) => updateVar('imageShadow', v)} isDarkUI={isDarkUI} />
            <SliderInput label="间距" value={vars.imageMargin} min={0} max={40} onChange={(v) => updateVar('imageMargin', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'table' && (
          <>
            <ColorSelector label="表头背景" value={vars.tableHeaderBg} onChange={(v) => updateVar('tableHeaderBg', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="边框颜色" value={vars.tableBorderColor} onChange={(v) => updateVar('tableBorderColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="字号" value={vars.tableFontSize} min={12} max={18} onChange={(v) => updateVar('tableFontSize', v)} isDarkUI={isDarkUI} />
            <SliderInput label="单元格间距" value={vars.tableCellPadding} min={4} max={20} onChange={(v) => updateVar('tableCellPadding', v)} isDarkUI={isDarkUI} />
            <ToggleInput label="斑马纹行" value={vars.tableAlternateRows} onChange={(v) => updateVar('tableAlternateRows', v)} isDarkUI={isDarkUI} />
            <ColorSelector label="分割线颜色" value={vars.hrColor} onChange={(v) => updateVar('hrColor', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'mermaid' && (
          <>
            <SelectInput
              label="Mermaid 主题"
              value={vars.mermaidTheme}
              onChange={(v) => updateVar('mermaidTheme', v)}
              isDarkUI={isDarkUI}
              options={[
                { label: 'Default', value: 'default' },
                { label: 'Dark', value: 'dark' },
                { label: 'Forest', value: 'forest' },
                { label: 'Neutral', value: 'neutral' },
              ]}
            />
            <SliderInput label="最大宽度" value={vars.mermaidMaxWidth} min={50} max={100} unit="%" onChange={(v) => updateVar('mermaidMaxWidth', v)} isDarkUI={isDarkUI} />
            <SliderInput label="间距" value={vars.mermaidMargin} min={0} max={40} onChange={(v) => updateVar('mermaidMargin', v)} isDarkUI={isDarkUI} />
          </>
        )}

        {section === 'other' && (
          <>
            <ColorSelector label="链接颜色" value={vars.linkColor} onChange={(v) => updateVar('linkColor', v)} isDarkUI={isDarkUI} />
            <SliderInput label="脚注字号" value={vars.footnoteSize} min={10} max={16} onChange={(v) => updateVar('footnoteSize', v)} isDarkUI={isDarkUI} />
          </>
        )}
      </div>

      {/* CSS Preview */}
      <details style={{ marginTop: '4px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '12px', color: textMuted, userSelect: 'none' }}>
          查看生成的 CSS
        </summary>
        <pre
          style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: isDarkUI ? '#0f172a' : '#f8fafc',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            fontSize: '11px',
            lineHeight: 1.5,
            overflow: 'auto',
            maxHeight: '300px',
            color: text,
            fontFamily: "'SF Mono', monospace",
            whiteSpace: 'pre-wrap',
          }}
        >
          {generatedCSS}
        </pre>
      </details>
    </div>
  )
}
