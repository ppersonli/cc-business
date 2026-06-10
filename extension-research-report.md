# Chrome Extension Research Report

**调研日期**: 2026-06-09
**调研版本**: V56（全新发散调研）
**方法论**: 苛刻市场验证 - 发散-收口法

---

## 品类/方向排名（综合评分）

| 排名 | 方向 | 竞争度 | 变现验证 | 技术难度 | 差异化空间 | 综合评分 |
|------|------|--------|----------|----------|------------|----------|
| 🥇 | 价格追踪（跨平台+AI） | 中 | 强 | 中 | 大 | 4/5 |
| 🥈 | 网页高亮/标注 | 中 | 中 | 中 | 中 | 3/5 |
| 🥉 | 截图工具（AI转代码） | 中 | 中 | 低-中 | 中 | 3/5 |
| 4 | 数字健康/专注 | 低 | 弱 | 低 | 中 | 2/5 |
| 5 | AI会议记录 | 极高 | 强 | 高 | 低 | 2/5 |
| 6 | 购物助手/比价 | 极高 | 强 | 中 | 极低 | 1/5 |
| 7 | 密码管理 | 极高 | 强 | 高 | 极低 | 1/5 |
| 8 | AI写作/语法 | 极高 | 强 | 高 | 极低 | 1/5 |

---

## Top 3推荐

### 🥇 第1名: PriceOracle - AI Price Tracker

**产品概念**: 跨平台价格追踪 + AI价格预测

**核心功能**:
1. 跨平台价格追踪（Amazon, Walmart, Ebay, AliExpress, Target等250+商店）
2. AI价格预测（预测价格走势，推荐最佳购买时机）
3. 价格历史图表（浏览器内嵌入商品页面）
4. 智能提醒（价格下降通知）
5. 联盟推荐（赚取佣金）

**差异化**:
- 支持250+商店（Keepa仅支持Amazon）
- AI价格预测（竞品没有）
- $3/月定价（比Keepa便宜80%）

**开发周期**: 4周MVP

**技术栈**:
- Chrome Extension: WXT + Vue 3 + TypeScript
- 后端API: Node.js + Express
- 数据库: PostgreSQL (Supabase/Neon)
- AI预测: 简单ML模型（移动平均+趋势分析）

**定价**:
| Plan | 价格 | 功能 |
|------|------|------|
| Free | $0 | 3个商品追踪、价格历史图表 |
| Pro | $3/月 | 无限追踪、AI预测、跨平台、邮件通知 |
| Pro Yearly | $25/年 | 同Pro，年付优惠 |

**收入预测（保守）**:
| 时间 | 免费用户 | 付费用户 | MRR |
|------|----------|----------|-----|
| Month 1-3 | 1,000+ | 10+ | $30+ |
| Month 4-6 | 5,000+ | 50+ | $150+ |
| Month 7-12 | 20,000+ | 200+ | $600+ |

**竞品数据**:
- Keepa: 4.7★, €19/月, Amazon绝对霸主
- PriceLasso: 4.8★, 免费, 250+商店, 300,000+提醒, $5M+节省
- Buyhatke: 4.8★, 印度市场头部

---

### 🥈 第2名: WebMind - AI Web Highlighter

**产品概念**: 网页高亮 + AI摘要 + 笔记

**核心功能**:
1. 网页/PDF高亮标注
2. AI自动生成高亮内容摘要
3. 笔记管理
4. 导出到Notion/Obsidian
5. 团队协作（可选）

**差异化**:
- AI自动摘要（竞品没有）
- 本地AI处理（WebLLM，隐私保护）
- 导出到主流笔记工具

**开发周期**: 2-3周MVP

**技术栈**:
- Chrome Extension: WXT + Vue 3 + TypeScript
- AI: WebLLM (本地) 或 OpenAI API
- 存储: Chrome Storage + 可选云同步

**定价**:
| Plan | 价格 | 功能 |
|------|------|------|
| Free | $0 | 基础高亮、5个摘要/月 |
| Pro | $3/月 | 无限摘要、导出、团队协作 |

**竞品数据**:
- Web Highlights: Chrome Monthly Focus推荐
- Weava: 4.0★
- Readwise: 4.1★

---

### 🥉 第3名: SnapToCode - AI Screenshot to Code

**产品概念**: 截图 + AI转HTML/CSS代码

**核心功能**:
1. 全页截图（一键截取）
2. AI将截图转换为HTML/CSS代码
3. 代码编辑器
4. 导出代码

**差异化**:
- AI截图转代码（GoFullPage没有）
- 实时预览
- 代码导出

**开发周期**: 3-4周MVP

**技术栈**:
- Chrome Extension: WXT + Vue 3 + TypeScript
- AI: GPT-4 Vision API
- 代码编辑: Monaco Editor

**定价**:
| Plan | 价格 | 功能 |
|------|------|------|
| Free | $0 | 基础截图、3次AI转代码/月 |
| Pro | $5/月 | 无限AI转代码、代码编辑器 |

**竞品数据**:
- GoFullPage: 4.9★, $1/月, 极简设计
- FireShot: 4.8★, 功能全面

---

## 关键数据点

### Chrome Web Store数据（2026-06-09实时）
- **AI工具**: Sider 4.9★, Monica 4.9★, AITOPIA 4.9★, MaxAI 4.7★
- **价格追踪**: Keepa 4.7★, PriceLasso 4.8★, Buyhatke 4.8★
- **截图工具**: GoFullPage 4.9★, FireShot 4.8★
- **网页高亮**: Web Highlights (Monthly Focus), Weava 4.0★, Readwise 4.1★
- **购物助手**: Rakuten 4.9★, Honey 4.6★, Coupert 4.7★

### PriceLasso数据
- 250+支持商店
- 300,000+提醒创建
- $5M+帮助用户节省
- $15平均每提醒节省
- 免费使用（联盟佣金变现）

### Keepa数据
- €19/月订阅
- Amazon价格追踪绝对霸主
- 数百万用户

---

## 行动计划

### 短期（1-2周）
1. ✅ 确认产品方向：PriceOracle - AI Price Tracker
2. ✅ 开始MVP开发（Week 1）
3. ✅ 准备Chrome Web Store listing

### 中期（1-2月）
1. 完成跨平台支持
2. 实现AI价格预测
3. 集成付费功能
4. 发布到Chrome Web Store

### 长期（3-6月）
1. 优化AI预测准确度
2. 扩展到更多商店
3. 移动端App
4. 国际化

---

## 调研文件清单

| 文件 | 路径 |
|------|------|
| Step 0: 广泛扫描 | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-step0-divergent-chrome-web-store-broad-scan.md` |
| Step 1: 深入分析 | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-step1-deep-dive-top-directions.md` |
| Step 2: 5轮辩论 | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-step2-debate-top3-directions.md` |
| Step 3: 竞品分析 | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-step3-competitive-analysis-price-tracker.md` |
| Step 4: 技术可行性 | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-step4-technical-feasibility.md` |
| Step 5: 最终推荐 | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-step5-final-recommendation.md` |
| SUMMARY | `~/Documents/Obsidian Vault/共享/Hermes/调研报告/chrome-extension/steps/v56-SUMMARY.md` |

---

## 注意事项

1. **Tavily API不可用**: 2026-06-09实测432错误，Reddit/ProductHunt等社区数据无法获取
2. **很多网站被Cloudflare封锁**: Keepa、CamelCamelCamel、Reddit、ProductHunt
3. **Chrome Web Store可访问**: 是最可靠的数据源
4. **PriceLasso可访问**: 提供了有价值的竞品数据
5. **数据来源**: Chrome Web Store实时浏览 + PriceLasso官网 + 行业知识
