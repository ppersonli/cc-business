# 开发计划 — 基于市场调研

**创建日期**: 2026-06-10
**基于调研**: tool-research-report.md (V64) + extension-research-report.md (V62)
**状态**: 待用户确认方向

---

## 当前项目状态

| 项目 | 状态 | 技术栈 | 说明 |
|------|------|--------|------|
| devtools-hub | ✅ 成熟 | Next.js 15 + Tailwind | 45+工具站，已部署 |
| socialforge | ✅ MVP完成 | Next.js 15 + Clerk + Drizzle + Inngest | 社媒管理工具，有dashboard/帖子/分析/日历 |
| vertical-scheduler | ✅ MVP完成 | Next.js 15 + NextAuth + Turso | 预约平台，有dashboard/页面/服务/预约 |
| chrome-extension (SnapGen) | ✅ 可用 | WXT + Vue 3 | 截图分析插件 |

---

## 调研推荐的新产品方向

###   推荐1: BuildFlow — 建筑项目管理SaaS
- **综合评分**: 9.0/10（最高）
- **定位**: 建筑行业的轻量级项目管理工具
- **差异化**: 比Procore/Buildertrend便宜70%+，现代UI+移动优先+AI辅助
- **开发周期**: 3-6周
- **技术栈**: Next.js + PostgreSQL + React Native
- **定价**: $29-199/月
- **风险**: 建筑行业采购周期长，需要行业特定功能

###   推荐2: PageAudit — AI着陆页CRO优化
- **综合评分**: 7.1/10
- **定位**: AI驱动的着陆页转化率优化工具
- **差异化**: 超利基（只做着陆页CRO），AI原生，比Surfer SEO便宜50%+
- **开发周期**: 2-4周（最快）
- **技术栈**: Next.js + Puppeteer + OpenAI API
- **定价**: $19-99/月
- **风险**: AI API费用，竞品多

###   推荐3: WebMind — AI网页高亮+知识管理（Chrome插件）
- **综合评分**: 7.1/10
- **定位**: AI驱动的网页高亮和知识管理
- **差异化**: AI智能高亮（自动识别重要段落）+ 知识图谱
- **开发周期**: 6-8周
- **技术栈**: Manifest V3 + React + TypeScript + Firebase
- **定价**: Free + Pro $4.99/月 + Team $9.99/月
- **风险**: Web Highlights竞品（250K用户），需要验证付费意愿

---

## 需要用户决策的问题

### 1. 优先级选择
三个推荐方向，选哪个先做？

| 选项 | 优点 | 缺点 |
|------|------|------|
| **BuildFlow** | 评分最高，收入潜力最大 | 开发周期最长，需要行业知识 |
| **PageAudit** | 开发最快（2-4周），技术最简单 | 竞品多，需要AI API预算 |
| **WebMind** | Chrome插件市场成熟，品类受认可 | 6-8周MVP，需要Firebase后端 |
| **SocialForge迭代** | 已有MVP，可快速完善 | 市场竞争激烈（Buffer等） |

### 2. SocialForge 是否继续？
SocialForge MVP已完成（有dashboard/帖子/分析/日历/AI重写），但调研推荐的是全新的OpenSocial（开源社媒管理）。需要决定：
- 继续完善SocialForge？
- 还是转向新方向？

### 3. vertical-scheduler 如何处理？
vertical-scheduler MVP已完成，但不在调研推荐范围内。需要决定：
- 继续开发？
- 暂停搁置？
- 作为副产品？

### 4. 开发资源分配
当前CC在tmux cc-web中运行。需要决定：
- 一个产品专注开发？
- 还是并行开发多个？

---

## 如果选择 BuildFlow

### MVP功能清单（P0）
1. 项目看板（拖拽式任务管理）
2. 任务分配+进度跟踪
3. 文档管理（图纸、合同、变更单）
4. 团队沟通（项目内聊天）
5. 移动端适配（响应式Web）

### 技术方案
- **前端**: Next.js 15 + Tailwind + dnd-kit（拖拽）
- **后端**: Next.js API Routes + Drizzle ORM
- **数据库**: Turso (libsql)
- **认证**: Clerk
- **存储**: Vercel Blob（文档）
- **部署**: Vercel

### 开发计划
| 周 | 任务 |
|----|------|
| 1 | 项目框架+数据库schema+认证 |
| 2 | 项目看板+任务管理 |
| 3 | 文档管理+团队沟通 |
| 4 | 移动端适配+测试 |
| 5 | 部署+SEO+定价页 |
| 6 | 发布+推广 |

---

## 如果选择 PageAudit

### MVP功能清单（P0）
1. URL输入+网页截图
2. AI分析（设计、文案、CTA、加载速度）
3. 评分+优化建议
4. PDF报告导出
5. 免费3次/月限制

### 技术方案
- **前端**: Next.js 15 + Tailwind
- **后端**: Next.js API Routes + Puppeteer（截图）+ OpenAI API（分析）
- **数据库**: Turso (libsql)
- **认证**: Clerk
- **部署**: Vercel

### 开发计划
| 周 | 任务 |
|----|------|
| 1 | 项目框架+URL抓取+截图 |
| 2 | AI分析集成+评分系统 |
| 3 | 报告生成+付费限制 |
| 4 | 测试+部署+推广 |

---

## 如果选择 WebMind

### MVP功能清单（P0）
1. 基础高亮功能（选中文本→高亮→持久化）
2. AI摘要（页面摘要、高亮内容摘要）
3. 云同步（Firebase集成）
4. Web App（管理所有高亮）
5. 导出功能（Notion/Obsidian/HTML）

### 技术方案
- **Chrome插件**: Manifest V3 + React + TypeScript
- **UI**: Tailwind CSS
- **后端**: Firebase（Firestore + Auth）
- **AI**: OpenAI API
- **Web App**: Next.js 15 + Tailwind

### 开发计划
| 周 | 任务 |
|----|------|
| 1-2 | 基础高亮功能+Chrome Storage |
| 3 | AI摘要功能 |
| 4 | Firebase云同步 |
| 5-6 | Web App |
| 7 | 导出功能 |
| 8 | 测试+Chrome Web Store发布 |

---

## 下一步行动

**等待用户确认方向后，创建详细技术规格文档，然后启动CC开发。**

1. 用户选择产品方向
2. 创建 `docs/<product>-spec.md` 技术规格
3. 在 tmux cc-web 中启动CC开发
4. 每周review进度
