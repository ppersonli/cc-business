# 开发策划文档（更新版）

> **基于 tool-research-report.md 和 extension-research-report.md**
> **创建日期**：2026-06-08
> **更新日期**：2026-06-09
> **状态**：✅ 调研完成，策划完成，Phase 1-3 已完成，Phase 4 待启动

---

## 一、当前状态

### 工具站 (tools.pixiaoli.cn) ✅
- **工具数量**: 46个（含CSS Grid Generator、Lorem Ipsum Generator、Markdown Table Generator）
- **语言**: 7种 (en/zh/de/pt/es/ja/ko)
- **技术栈**: Next.js 15 + Tailwind CSS (静态导出)
- **构建状态**: ✅ 通过
- **SEO**: ✅ JSON-LD结构化数据 + hreflang多语言标签已添加到所有41个工具页面
- **变现**: Google AdSense（待审核通过）+ Pancake订阅
- **部署**: Vercel自动部署

### Chrome插件 (TabMaster AI) ✅ MVP完成
- **状态**: WXT + Vue 3 MVP已搭建，36 tests通过，93.68KB build
- **功能**: 侧边栏Tab管理、分类、搜索、快照、快速操作
- **品牌**: TabMaster AI — Smart Tab Manager
- **待完成**: AI API集成（Phase 4）、i18n、Chrome Web Store提交

---

## 二、工具站：下一步行动

### 优先级P0：SEO优化（1-2天）✅ 已完成
当前41个工具缺少JSON-LD结构化数据，影响搜索引擎理解页面内容。

**任务清单**：
1. ✅ `lib/metadata.ts` — 添加JSON-LD生成函数
2. ✅ 每个工具页面 — 注入`application/ld+json`脚本
3. ✅ `lib/metadata.ts` — 添加hreflang多语言标签
4. ✅ 验证：`pnpm build` + Google Rich Results Test

**完成记录**：
- Commit: `7ee2794` — feat: add JSON-LD structured data and hreflang tags for SEO
- 41个工具页面全部更新
- 构建通过，sitemap包含42个URL

**预期效果**：
- 搜索结果展示富媒体片段（星级、价格、工具类型）
- 多语言SEO权重提升
- 3-6个月后流量增长20-30%

### 优先级P1：新增高搜索量工具（2-3周）✅ 已完成（Phase 1-2）
基于调研报告的搜索量数据，补充开发者高频需求工具：

| 工具 | 月搜索量(估) | 竞争 | 开发复杂度 | 状态 |
|------|-------------|------|-----------|------|
| JSON Diff Tool | 12K | 中 | 低 | ✅ 已有 |
| HTML to JSX | 8K | 低 | 低 | ✅ 已有 |
| YAML Formatter | 9K | 中 | 低 | ✅ 已有 |
| CSS Grid Generator | 15K | 中 | 中 | ✅ 已完成 |
| Lorem Ipsum Generator | 18K | 高 | 低 | ✅ 已完成 |
| Markdown Table Generator | 7K | 低 | 低 | ✅ 已完成 |

**推荐P0新增**：
1. **CSS Grid Generator** — 15K搜索量，可视化网格布局生成器
2. **Lorem Ipsum Generator** — 18K搜索量，自定义段落/单词/HTML

### 优先级P2：功能增强（可选）
- WeChat Markdown编辑器：Mermaid图表、KaTeX公式（P1 feature spec已有）
- 工具收藏/历史记录（需localStorage）
- 暗黑模式切换（已有CSS变量基础）

---

## 三、Chrome插件：TabMaster AI（推荐方向）

### 调研结论
extension-research-report.md 推荐 **AI智能标签管理 + 工作流自动化插件（TabMaster AI）**，评分4.6/5。

### 为什么不做SnapGen？
1. **API成本高**：每次截图分析调用AI API，成本$0.01-0.05/次
2. **竞争激烈**：截图→代码工具已有多个竞品
3. **变现困难**：用户对截图工具付费意愿低
4. **Chrome审核风险**：截图+AI分析需要较多权限

### 为什么做TabMaster AI？
1. **市场验证**：Session Buddy、OneTab等产品有数百万用户
2. **痛点明确**：Chrome重度用户每天打开20+标签，管理困难
3. **差异化清晰**：AI自动分类、自然语言搜索、工作流自动化（竞品没有）
4. **变现可行**：$4/月Pro订阅，生产力工具付费意愿高
5. **开发周期短**：2-4周MVP

### TabMaster AI 核心功能
1. AI智能标签分类（基于页面标题和URL自动分类）
2. AI标签搜索（自然语言搜索所有打开的标签）
3. 标签快照（保存和恢复标签组）
4. AI工作流自动化（根据用户习惯自动执行重复任务）
5. AI专注模式（自动隐藏不相关标签，减少干扰）

### 变现模式
- Free：基础分类、标签快照、搜索
- Pro $4/月：AI分类、AI搜索、工作流自动化
- Team $8/月/人：团队协作、跨设备同步

### 技术栈
- Chrome Extension (Manifest V3)
- WXT + Vue 3 + TypeScript
- OpenAI API（GPT-4o-mini，成本低）
- Chrome Storage API
- Waffo Pancake订阅集成

### 收入预估
- 3个月：$800 MRR（10K用户，2%付费率）
- 6个月：$6,000 MRR（50K用户，3%付费率）
- 12个月：$40,000 MRR（200K用户，5%付费率）

---

## 四、执行计划

### 第一阶段（本周）：工具站SEO优化 ✅ 已完成
1. ✅ 添加JSON-LD结构化数据到所有工具页面
2. ✅ 添加hreflang多语言标签
3. ✅ 构建验证 + 部署
4. **负责**: CC在tmux cc-web中开发
5. **完成时间**: 2026-06-09
6. **Commit**: `7ee2794`

### 第二阶段（下周）：新增2个高搜索量工具 ✅ 已完成
1. ✅ CSS Grid Generator（可视化网格布局）
2. ✅ Lorem Ipsum Generator（自定义文本生成）
3. ✅ 每个工具：实现→测试→部署
4. **负责**: CC在tmux cc-web中开发
5. **完成时间**: 2026-06-09
6. **Commit**: `a6403e0`

### 第三阶段（第3-4周）：TabMaster AI MVP ✅ 已完成
1. ✅ WXT项目搭建
2. ✅ 核心功能开发（标签分类、搜索、快照）
3. ✅ 36个测试通过
4. ✅ 构建成功（93.68KB）
5. **负责**: Hermes Agent
6. **完成时间**: 2026-06-09
7. **Commit**: `8bb4c65`

### 第四阶段（第4-5周）：TabMaster AI AI功能集成 ✅ 已完成
1. ✅ OpenAI API集成（AI分类+搜索）
2. ✅ Usage tracking & rate limiting
3. ✅ 订阅集成（Waffo Pancake）
4. **负责**: CC在tmux cc-web中开发
5. **完成时间**: 2026-06-09
6. **Commit**: `d271a4f` + `d2f2d1a`

### 第五阶段（第5-6周）：TabMaster AI完善 ✅ 已完成
1. ✅ AI工作流自动化（workflow-automation.ts + 12 tests）
2. ✅ AI专注模式（focus-mode.ts + 17 tests）
3. ✅ i18n多语言（EN/PT/ES/JA，4个locale文件）
4. **负责**: CC在tmux cc-web中开发
5. **完成时间**: 2026-06-09
6. **Commit**: `1409d29`
7. **测试**: 99/99 tests pass，build 138.56KB

---

## 五、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| SEO优化效果慢 | 高 | 低 | 持续优化，3-6个月见效 |
| CSS Grid Generator竞争 | 中 | 低 | 做得比竞品好用 |
| TabMaster AI用户获取 | 中 | 高 | Chrome Web Store SEO + Product Hunt |
| AI API成本超支 | 中 | 中 | 用GPT-4o-mini，设置用量限制 |
| Chrome审核拒绝 | 低 | 高 | 严格遵守权限最小化 |

---

## 六、下一步行动

**已完成**：
1. ✅ Phase 1: 工具站SEO优化（JSON-LD + hreflang）
2. ✅ Phase 2: 新增CSS Grid Generator + Lorem Ipsum Generator
3. ✅ Phase 3: TabMaster AI MVP开发（WXT + Vue 3，36 tests，93.68KB build）
4. ✅ Phase 4: TabMaster AI AI功能集成（OpenAI API，AI分类+搜索，70 tests）
5. ✅ Phase 5: TabMaster AI完善（AI工作流+专注模式+i18n，99 tests，138.56KB build）
6. ✅ Phase 6: TabMaster AI CWS准备（图标配置、listing文档、zip打包，155.28KB build）

**下一步**：
1. ✅ Chrome Web Store提交准备 — **zip已打包（155.28KB）**
2. ✅ TabMaster AI图标 — 已配置（待Gemini生成专属图标替换）
3. ✅ Chrome Web Store商品详情 — **listing文档已写好（docs/tabmaster-ai-cws-listing.md）**
4. ✅ CWS截图（1280x800×3）— **已截图（docs/screenshot-*.png）**
5. ✅ 促销图片（440x280 + 1400x560）— **已截图（docs/promo-*.png）**
6. ✅ 隐私政策+服务条款 — **已创建（app/[locale]/privacy/ + app/[locale]/terms/）**
7. 🔲 Chrome Web Store提交（Playwright CDP自动化）
8. 🔲 Product Hunt发布
9. 🔲 用户反馈迭代

---

### 第七阶段（第6-7周）：CWS提交准备 ✅ 已完成
1. ✅ CWS submission ZIP打包（155.28KB）
2. ✅ TabMaster AI图标配置（16/32/48/128px）
3. ✅ CWS listing文档（docs/tabmaster-ai-cws-listing.md）
4. ✅ 隐私政策+服务条款页面
5. ✅ 促销图片（440x280 + 1400x560）
6. ✅ CWS提交脚本（scripts/cws-submit-tabmaster.py）
7. **负责**: Hermes Agent + CC
8. **完成时间**: 2026-06-10
9. **Commit**: `c248d5a`

---

## 六、下一步行动

**已完成**：
1. ✅ Phase 1: 工具站SEO优化（JSON-LD + hreflang）
2. ✅ Phase 2: 新增CSS Grid Generator + Lorem Ipsum Generator
3. ✅ Phase 3: TabMaster AI MVP开发（WXT + Vue 3，36 tests，93.68KB build）
4. ✅ Phase 4: TabMaster AI AI功能集成（OpenAI API，AI分类+搜索，70 tests）
5. ✅ Phase 5: TabMaster AI完善（AI工作流+专注模式+i18n，99 tests，138.56KB build）
6. ✅ Phase 6: TabMaster AI CWS准备（图标配置、listing文档、zip打包，155.28KB build）
7. ✅ Phase 7: CWS提交脚本（Playwright CDP自动化脚本）

### 第八阶段（第7-8周）：Vertical Scheduler MVP ✅ 已完成
1. ✅ Next.js 15 + Tailwind + next-intl (5 locales)
2. ✅ Auth.js JWT (Google OAuth ready)
3. ✅ SQLite local DB (Turso-ready schema)
4. ✅ 66 tests passing (vitest)
5. ✅ 18 API routes, 10+ pages, 8 components
6. ✅ Google Calendar integration (OAuth2)
7. ✅ Pancake payment integration (webhook)
8. ✅ Mobile responsive dashboard
9. ✅ SEO: metadata, OpenGraph, JSON-LD, sitemap, robots.txt
10. ✅ Public booking page with time slot selection
11. **负责**: CC在tmux cc-web中开发
12. **完成时间**: 2026-06-10
13. **Commit**: `4abfb8d`

### 第九阶段（第8-9周）：SocialForge MVP ✅ 已完成
1. ✅ Next.js 15 + Tailwind + next-intl (5 locales)
2. ✅ Clerk auth (Google OAuth ready)
3. ✅ Turso (libsql) database
4. ✅ 115 tests passing (vitest)
5. ✅ 18 API routes, 10+ pages, 8 components
6. ✅ Twitter/LinkedIn OAuth integration
7. ✅ TipTap content editor
8. ✅ Calendar scheduling view
9. ✅ AI content generation (Gemini API)
10. ✅ Analytics dashboard
11. ✅ Media library
12. ✅ SEO: metadata, OpenGraph, JSON-LD, sitemap, robots.txt
13. ✅ Build fix: head tag duplication + missing i18n keys
14. **负责**: CC在tmux cc-web中开发 + Hermes Agent (build fix)
15. **完成时间**: 2026-06-10
16. **Commit**: `0830c84` + `d7336e1` (build fix)

---

### 第十阶段（第9-10周）：WeMD P1 — Theme Designer ✅ 已完成
1. ✅ ThemeDesigner component (ColorSelector, SliderInput, CustomCSSEditor)
2. ✅ ThemePanel refactored to use ThemeDesigner
3. ✅ SearchPanel for markdown content search
4. ✅ Dark mode support (darkMode.ts)
5. ✅ CSS generation utilities (generateCSS.ts)
6. ✅ 3 new built-in themes: custom-default, receipt, sunset-film
7. ✅ Updated types, stores, layout, preview, toolbar
8. **负责**: Hermes Agent (committed)
9. **完成时间**: 2026-06-11
10. **Commit**: `87e26d9`

---

**下一步**：
1. 🔲 **Chrome Web Store提交** — 运行 `python3 scripts/cws-submit-tabmaster.py --submit`
2. 🔲 **Product Hunt发布** — 等待CWS审核通过后发布
3. 🔲 **用户反馈迭代** — 根据早期用户反馈优化
4. 🔲 **WEMD P1剩余** — Mermaid图表、KaTeX公式（主题设计器已完成）
5. 🔲 **SocialForge部署** — 配置环境变量，部署到Vercel
6. 🔲 **WebMind扩展** — AI摘要、云同步、Web App（76 tests，基础功能已完成）
7. 🔲 **新工具开发** — 基于搜索量数据补充高频工具

---

**文档状态：** Phase 1-10 全部完成
**最后更新：** 2026-06-11
