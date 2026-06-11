'use client';

import { useMemo } from 'react';
import { useSettingsStore } from '../../../lib/wemd/stores/settingsStore';

interface StatsPanelProps {
  content: string;
}

interface Stats {
  chineseChars: number;
  englishWords: number;
  totalChars: number;
  paragraphs: number;
  sentences: number;
  avgSentenceLen: number;
  headings: number;
  images: number;
  links: number;
  codeBlocks: number;
  readTimeMin: number;
  keywords: string[];
  score: number;
  tips: string[];
}

function analyzeContent(text: string): Stats {
  // Chinese chars
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // English words
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  const totalChars = text.replace(/\s/g, '').length;

  // Paragraphs (non-empty lines that aren't headings/lists)
  const lines = text.split('\n');
  const paragraphs = lines.filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('- ') && !l.startsWith('1.')).length;

  // Sentences (split by Chinese/English sentence endings)
  const sentences = (text.match(/[。！？.!?]+/g) || []).length || paragraphs;

  const avgSentenceLen = sentences > 0 ? Math.round(totalChars / sentences) : 0;

  // Headings
  const headings = (text.match(/^#{1,6}\s/gm) || []).length;

  // Images
  const images = (text.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // Links
  const links = (text.match(/\[.*?\]\(.*?\)/g) || []).length - images;

  // Code blocks
  const codeBlocks = (text.match(/```/g) || []).length / 2;

  // Reading time (Chinese: ~400 chars/min, English: ~200 words/min)
  const readTimeMin = Math.max(1, Math.ceil((chineseChars / 400) + (englishWords / 200)));

  // Keywords extraction (top Chinese words by frequency, min 2 chars)
  const wordFreq = new Map<string, number>();
  const wordMatches = text.match(/[\u4e00-\u9fff]{2,6}/g) || [];
  for (const w of wordMatches) {
    // Skip common stop words
    if (['的是', '可以', '我们', '他们', '这个', '那个', '什么', '如何', '为什么', '已经', '通过', '进行', '其中', '以及', '但是', '因为', '所以', '如果', '虽然', '然而', '一个', '不是', '还有', '就是', '或者', '而且', '并且', '对于', '关于', '然后', '之后', '需要', '使用', '时候', '问题', '方法'].includes(w)) continue;
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }
  const keywords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  // Scoring
  let score = 60; // Base score
  const tips: string[] = [];

  if (totalChars > 800 && totalChars < 3000) { score += 10; }
  else if (totalChars < 300) { tips.push('文章较短，建议增加更多内容（推荐 800-3000 字）'); }
  else if (totalChars > 5000) { tips.push('文章较长，建议拆分为多篇短文提升阅读体验'); }

  if (headings >= 2 && headings <= 8) { score += 10; }
  else if (headings < 2) { tips.push('添加更多小标题帮助读者快速理解文章结构'); }

  if (images >= 1) { score += 10; }
  else { tips.push('添加配图可提升 30% 的阅读完成率'); }

  if (avgSentenceLen < 50) { score += 5; }
  else { tips.push('句子偏长，建议拆分为短句提升可读性'); }

  if (paragraphs > 3) { score += 5; }

  if (codeBlocks > 0) { score += 5; } // Technical content bonus

  score = Math.min(100, score);

  return {
    chineseChars, englishWords, totalChars, paragraphs, sentences,
    avgSentenceLen, headings, images, links, codeBlocks, readTimeMin,
    keywords, score, tips,
  };
}

export default function StatsPanel({ content }: StatsPanelProps) {
  const { isDarkUI } = useSettingsStore();
  const stats = useMemo(() => analyzeContent(content), [content]);

  const text = isDarkUI ? '#e2e8f0' : '#1e293b';
  const textMuted = isDarkUI ? '#94a3b8' : '#64748b';
  const bg = isDarkUI ? '#1e293b' : '#f8fafc';
  const border = isDarkUI ? '#334155' : '#e2e8f0';

  const scoreColor = stats.score >= 80 ? '#10b981' : stats.score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '16px',
      fontSize: '13px',
    }}>
      {/* Score */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: bg,
        borderRadius: '12px',
        border: `1px solid ${border}`,
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
          {stats.score}
        </div>
        <div style={{ fontSize: '12px', color: textMuted, marginTop: '4px' }}>微信排版评分</div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '16px',
      }}>
        {[
          { label: '总字数', value: stats.totalChars.toLocaleString() },
          { label: '预计阅读', value: `${stats.readTimeMin} 分钟` },
          { label: '中文字符', value: stats.chineseChars.toLocaleString() },
          { label: '英文单词', value: stats.englishWords.toLocaleString() },
          { label: '段落数', value: stats.paragraphs },
          { label: '句子数', value: stats.sentences },
          { label: '标题数', value: stats.headings },
          { label: '平均句长', value: `${stats.avgSentenceLen} 字` },
          { label: '图片', value: stats.images },
          { label: '链接', value: stats.links },
          { label: '代码块', value: Math.floor(stats.codeBlocks) },
        ].map((item) => (
          <div key={item.label} style={{
            padding: '10px',
            backgroundColor: bg,
            borderRadius: '8px',
            border: `1px solid ${border}`,
          }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: text }}>{item.value}</div>
            <div style={{ fontSize: '11px', color: textMuted }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      {stats.keywords.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: text, marginBottom: '8px' }}>
            关键词 Top 5
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {stats.keywords.map((kw) => (
              <span key={kw} style={{
                padding: '3px 10px',
                backgroundColor: isDarkUI ? '#1e3a5f' : '#dbeafe',
                color: isDarkUI ? '#60a5fa' : '#2563eb',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {stats.tips.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: text, marginBottom: '8px' }}>
            优化建议
          </div>
          {stats.tips.map((tip, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              backgroundColor: isDarkUI ? '#422006' : '#fffbeb',
              border: `1px solid ${isDarkUI ? '#92400e' : '#fcd34d'}`,
              borderRadius: '8px',
              color: isDarkUI ? '#fbbf24' : '#92400e',
              fontSize: '12px',
              marginBottom: '6px',
              lineHeight: '1.5',
            }}>
              💡 {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
