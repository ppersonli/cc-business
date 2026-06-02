# AI截图分析 Chrome 插件 — 策划文档

**日期：** 2026-06-03
**状态：** 待开发
**调研依据：** extension-research-report.md（2026-06-03 v2）

---

## 一、产品定义

### 1.1 产品名称
**ScreenMind**（暂定）
- 英文名：ScreenMind - AI Screenshot Analyzer
- 定位：截图→AI自动分析→多场景输出

### 1.2 核心价值
一键截图→AI自动分析→输出代码/描述/设计建议/SEO检查，省去"截图→切换窗口→粘贴→描述→等待→复制"的流程。

### 1.3 目标用户
- 产品经理（需要截图+描述功能）
- UI设计师（需要截图→代码生成）
- QA工程师（需要截图+Bug描述）
- 内容创作者（需要截图+描述）
- SOC 2审计人员（需要截图+证据收集）

---

## 二、竞品分析

### 2.1 竞品对比

| 插件 | 用户数 | 评分 | 价格 | 核心功能 | 差异化 |
|------|--------|------|------|----------|--------|
| Scribe | 6M+ | 4.8★ | $17-35/月 | 截图→自动文档 | $1.3B估值，$100M ARR |
| GoFullPage | 4M+ | 4.9★ | Freemium $1/月 | 全页截图 | 无AI功能 |
| CocoShot | 60K+ | 4.9★ | Freemium | 截图+AI编辑+录屏 | AI弱，主打录屏 |
| Screenshot to AI | 0★ | — | — | 截图→多AI分析 | 功能完善但无用户 |

### 2.2 竞品弱点
- **Scribe**：$17/月太贵，只做文档生成，不覆盖分析/代码/设计场景
- **GoFullPage**：4M用户但无AI功能
- **CocoShot**：AI功能弱，主打录屏+字幕
- **Screenshot to AI**：功能完善但0评分，无用户基础

### 2.3 机会窗口
- 市场极度早期：8/10个AI截图工具是0评分的极早期产品
- 先发优势巨大，但需要快速迭代
- 我们定位$3-5/月的中间地带（vs Scribe的$17/月）

---

## 三、功能规划

### 3.1 MVP范围（第一版）

#### 核心功能
1. **截图→AI描述**：截图→AI自动生成文字描述
2. **截图→代码生成**：截图→CSS/HTML代码
3. **截图→UI改进建议**：截图→AI分析UI设计问题
4. **Freemium计数器**：免费5次/天，Pro无限次

#### UI设计
- Popup：截图按钮+快速操作
- Sidepanel：详细分析结果+历史记录
- Context Menu：右键截图分析

### 3.2 第二期功能
1. **截图→SEO检查**：截图→AI分析SEO问题
2. **截图→无障碍检查**：截图→AI分析可访问性问题
3. **批量截图分析**：多张截图→批量AI分析
4. **导出分析结果**：PDF/Markdown导出

### 3.3 第三期功能（可选）
1. **自定义AI模型**：用户选择GPT-4/Claude/Gemini
2. **团队协作**：共享分析结果
3. **API接口**：程序化访问

---

## 四、技术方案

### 4.1 技术栈
```
框架：WXT 0.19+（Manifest V3）
UI：Vue 3 + TypeScript
样式：Tailwind CSS
截图：Chrome Tab Capture API + Canvas
AI：OpenAI Vision API / Anthropic Claude API
支付：Waffo Pancake（共享PromptForge merchant）
包管理：pnpm
测试：Vitest + Playwright
```

### 4.2 项目结构
```
chrome-extension/
├── entrypoints/
│   ├── popup/           # Popup UI
│   ├── sidepanel/       # Sidepanel UI
│   ├── options/         # Options page
│   ├── background.ts    # Service worker
│   └── screenshot.content.ts  # Content script for screenshot
├── utils/
│   ├── screenshot.ts    # Screenshot capture logic
│   ├── ai.ts           # AI API calls
│   ├── storage.ts      # Chrome storage utilities
│   └── payment.ts      # Pancake payment integration
├── components/         # Vue components
├── public/
│   └── icon/          # Extension icons
├── tests/             # Vitest tests
├── wxt.config.ts      # WXT config
├── package.json
└── tsconfig.json
```

### 4.3 关键配置

#### Manifest V3权限
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "scripting",
    "notifications",
    "sidePanel"
  ],
  "host_permissions": [
    "https://api.openai.com/*",
    "https://api.anthropic.com/*"
  ]
}
```

#### 截图方案
```typescript
// 使用Chrome Tab Capture API
const stream = await chrome.tabCapture.capture({
  video: true,
  audio: false
});
// 或使用chrome.tabs.captureVisibleTab
const dataUrl = await chrome.tabs.captureVisibleTab(null, {
  format: 'png',
  quality: 100
});
```

#### AI调用方案
```typescript
// OpenAI Vision API
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: screenshotDataUrl } }
      ]
    }]
  })
});
```

---

## 五、变现模式

### 5.1 定价策略
- **免费版**：每天5次AI分析
- **Pro版**：$3/月，无限次AI分析 + 高级模型
- **年付**：$29/年（省$7）

### 5.2 收入预测
- 达到$5K MRR需要~1,667个Pro用户
- 达到$10K MRR需要~3,333个Pro用户
- 参考GoFullPage：4M用户，Freemium $1/月，$10k/月收入

### 5.3 支付集成
- 使用Waffo Pancake（共享PromptForge merchant）
- Merchant ID: `MER_2Kh82JvDPlCAegyPSUY20K`
- Dashboard: https://pancake.waffo.ai

---

## 六、获客策略

### 6.1 Chrome Web Store ASO
- 标题：ScreenMind - AI Screenshot Analyzer
- 描述：包含核心关键词（AI screenshot, screenshot analysis, screenshot to code）
- 截图：1280x800，展示核心功能
- 评分：争取5星好评

### 6.2 Reddit推广
- r/chrome_extensions：发布介绍帖
- r/webdev：分享开发过程
- r/SaaS：讨论变现模式
- r/microsaas：build in public

### 6.3 ProductHunt发布
- 目标：#1 Product of the Day
- 准备：Landing page + 视频演示

### 6.4 IndieHackers
- 分享开发过程（build in public）
- 记录收入数据

---

## 七、开发排期

### 7.1 第一阶段：MVP（1-2周）
- **第1天**：项目搭建、WXT配置、基础结构
- **第2-3天**：截图捕获功能（Tab Capture API）
- **第4-5天**：AI调用集成（OpenAI Vision）
- **第6-7天**：Popup UI开发
- **第8-9天**：Sidepanel UI开发
- **第10天**：Freemium计数器
- **第11-14天**：测试、优化、提交审核

### 7.2 第二阶段：增强（1周）
- SEO检查功能
- 无障碍检查功能
- 批量分析功能
- 导出功能

### 7.3 第三阶段：变现（1周）
- Pancake支付集成
- 订阅验证API
- 用户账户系统

---

## 八、风险与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| AI API成本高 | 中 | 中 | 控制免费额度，优化prompt |
| Chrome审核严格 | 中 | 高 | 最小化权限，清晰描述 |
| 竞品反应 | 低 | 中 | 快速迭代，建立用户基础 |
| 获客困难 | 高 | 高 | Reddit+PH+IH多渠道推广 |
| 用户不付费 | 中 | 高 | Freemium模式，免费版足够好 |

---

## 九、成功指标

### 9.1 短期目标（1个月）
- Chrome Web Store上线
- 100+安装量
- 4.5+评分

### 9.2 中期目标（3个月）
- 1,000+安装量
- 100+Pro用户
- $300+ MRR

### 9.3 长期目标（6个月）
- 10,000+安装量
- 1,000+Pro用户
- $3,000+ MRR

---

## 十、下一步行动

### 10.1 开发准备
- [ ] 确认产品名称和品牌
- [ ] 注册Chrome Web Store开发者账号（$5）
- [ ] 准备图标和截图资源
- [ ] 配置AI API密钥

### 10.2 开始开发
- [ ] 用Claude Code在tmux cc-web中开发
- [ ] 实现截图捕获功能
- [ ] 实现AI调用集成
- [ ] 开发Popup和Sidepanel UI
- [ ] 测试、优化、提交审核

### 10.3 获客准备
- [ ] 准备Reddit推广帖
- [ ] 准备ProductHunt发布
- [ ] 准备IndieHackers分享

---

**文档状态：** 待开发
**最后更新：** 2026-06-03
