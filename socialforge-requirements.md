# SocialForge — MVP 需求文档

> **版本**: v1.0 MVP  
> **日期**: 2026-06-10  
> **技术栈**: 全免费方案  
> **目标**: 开源社媒管理工具，对标 Postiz（$1.3M ARR），差异化：更轻量、有免费套餐、AI原生

---

## 1. 产品定位

| 维度 | 定义 |
|------|------|
| **产品名** | SocialForge |
| **一句话** | 开源社媒管理工具 — 一站式排期、发布、分析 |
| **目标用户** | 独立开发者、小团队、内容创作者（1-5人） |
| **核心价值** | 比 Postiz 更轻量（单 Docker）、有免费套餐、AI 辅助内容生成 |
| **差异化** | 免费层 100 条/月、AI 生成用 Gemini 免费层、一键部署 |
| **竞品** | Postiz（$1.3M ARR）、Buffer（$20K MRR）、Hootsuite（$239/月） |

---

## 2. 技术栈（全免费）

### 前端
| 组件 | 选型 | 说明 |
|------|------|------|
| 框架 | **Next.js 15** (App Router) | SSR + API Routes，部署 Vercel |
| UI | **shadcn/ui + Tailwind CSS 4** | 无运行时 CSS，组件级定制 |
| 状态 | **Zustand** | 轻量，5KB |
| 富文本 | **TipTap** | 社交帖子编辑器，支持格式 |
| 日历 | **react-big-calendar** 或自定义 | 拖拽排期 |
| 图表 | **Recharts** | 分析仪表盘 |
| 表单 | **React Hook Form + Zod** | 类型安全校验 |
| i18n | **next-intl** | 多语言 |

### 后端
| 组件 | 选型 | 说明 |
|------|------|------|
| 运行时 | **Node.js 22** (via Next.js) | 全栈 JS |
| ORM | **Drizzle ORM** | SQL-first，轻量 |
| 数据库 | **Turso (libsql)** | SQLite 兼容，免费层 500 DB + 9GB 存储 |
| 队列/定时 | **Inngest** | 免费层 100K 步/月，替代 Redis+BullMQ |
| 认证 | **Clerk** | 免费层 10K MAU |
| 文件存储 | **Vercel Blob** | 免费层 10GB 存储 + 100GB 带宽 |
| 邮件 | **Resend** | 免费层 100 封/天 |
| AI | **Gemini API** | 免费层，内容生成/摘要 |
| 分析 | **PostHog** | 免费层 100K 事件/月 |

### 部署
| 组件 | 选型 | 说明 |
|------|------|------|
| 平台 | **Vercel** | 免费 Hobby 层 |
| 数据库 | **Turso Cloud** | 免费层 |
| 队列 | **Inngest Cloud** | 免费层 |
| 域名 | 自有域名 | CNAME 到 Vercel |

### 社媒平台集成（MVP）
| 平台 | API | 认证方式 | 优先级 |
|------|-----|----------|--------|
| Twitter/X | Twitter API v2 | OAuth 2.0 (PKCE) | P0 |
| LinkedIn | LinkedIn Marketing API | OAuth 2.0 | P0 |
| Facebook/Instagram | Meta Graph API | OAuth 2.0 | P1 |
| Bluesky | AT Protocol | Session token | P1 |
| Mastodon | Mastodon API | OAuth 2.0 | P2 |

---

## 3. 免费层额度规划

### 用户端
| 功能 | 免费层 | Pro ($19/月) |
|------|--------|-------------|
| 社媒账号连接 | 3 个 | 无限 |
| 每月发布量 | 100 条 | 无限 |
| 排期队列 | 50 条 | 无限 |
| AI 内容生成 | 20 次/月 | 200 次/月 |
| 媒体存储 | 500MB | 10GB |
| 分析数据保留 | 30 天 | 12 个月 |
| 团队成员 | 1 人 | 5 人 |

### 系统端（Vercel + Turso + Inngest 免费层）
| 服务 | 免费额度 | MVP 预估用量 |
|------|----------|-------------|
| Vercel | 100GB 带宽/月 | ~10GB |
| Turso | 500 DB + 9GB | 1 DB ~100MB |
| Inngest | 100K 步/月 | ~50K |
| Clerk | 10K MAU | ~1K |
| Vercel Blob | 10GB 存储 | ~2GB |
| Resend | 100 封/天 | ~50 封/天 |
| PostHog | 100K 事件/月 | ~50K |

**结论**: MVP 阶段（<1000 用户）全部免费，零成本运营。

---

## 4. 核心功能（MVP）

### 4.1 社媒账号管理
- OAuth 连接 Twitter/LinkedIn/Facebook/Instagram
- 账号状态监控（token 过期提醒）
- 一键断开连接
- 多账号切换

### 4.2 内容创建与编辑
- TipTap 富文本编辑器
- Markdown 支持
- 多媒体上传（图片/视频/GIF）
- AI 辅助生成（Gemini）：
  - 帖子内容生成
  - 标题/标签建议
  - 内容改写/翻译
- 模板库（预设帖子模板）
- Emoji 选择器

### 4.3 排期与发布
- 日历视图（拖拽排期）
- 定时发布（精确到分钟）
- 批量排期（CSV 导入）
- 最佳发布时间建议（基于历史数据）
- 一键发布到多平台
- 发布队列管理
- 发布失败重试

### 4.4 分析与洞察
- 帖子级数据：浏览、点赞、评论、分享、点击
- 账号级数据：粉丝增长、互动率
- 趋势图表（7天/30天/90天）
- 最佳发布时间分析
- 内容类型表现对比
- 导出 CSV

### 4.5 协作（Pro）
- 团队成员邀请
- 角色权限（owner/admin/member/viewer）
- 审批流程（成员发布需管理员批准）
- 评论/批注

### 4.6 设置与集成
- 个人资料编辑
- 通知设置（邮件/浏览器推送）
- API Key 管理（开发者集成）
- 数据导出/删除（GDPR 合规）

---

## 5. 数据库设计（Turso/libsql）

### 表结构（10 张表）

```
users ─── social_accounts
  │            │
  ├── posts ── post_media ── media_assets
  │     └── post_logs
  │
  └── api_keys
```

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户 | id, email, name, clerk_id, subscription_tier, created_at |
| `social_accounts` | 社媒账号 | id, user_id, platform, access_token(加密), username, status |
| `posts` | 帖子 | id, user_id, content, status(draft/scheduled/published/failed), scheduled_at, target_platforms |
| `post_media` | 帖子媒体 | id, post_id, media_asset_id, sort_order, alt_text |
| `media_assets` | 媒体文件 | id, user_id, filename, blob_url, file_type, file_size |
| `post_logs` | 发布日志 | id, post_id, platform, status, platform_post_id, error_message, published_at |
| `analytics_daily` | 每日分析 | id, social_account_id, date, followers, engagement_rate, impressions |
| `analytics_posts` | 帖子分析 | id, post_id, platform, likes, comments, shares, impressions, clicks |
| `ai_generations` | AI 生成记录 | id, user_id, prompt, result, model, tokens_used, created_at |
| `api_keys` | API 密钥 | id, user_id, key_hash, name, permissions, last_used_at |

### Turso 注意事项
- 无 `JSONB` 类型，用 `TEXT` + JSON.parse
- 无 `ARRAY` 类型，用 JSON 数组
- 无 `gen_random_uuid()`，用应用层生成 UUID
- 无 `TIMESTAMPTZ`，用 `TEXT` 存 ISO 字符串
- 无 `GIN` 索引，全文搜索用 `LIKE` + 应用层过滤

---

## 6. API 设计（REST）

### 认证
- Clerk JWT 验证（中间件）
- API Key 验证（开发者 API）

### 端点清单

| 方法 | 路径 | 说明 |
|------|------|------|
| **认证** | | |
| GET | `/api/auth/me` | 当前用户信息 |
| PUT | `/api/auth/profile` | 更新资料 |
| **社媒账号** | | |
| GET | `/api/accounts` | 列出已连接账号 |
| POST | `/api/accounts/connect/:platform` | OAuth 连接 |
| DELETE | `/api/accounts/:id` | 断开连接 |
| POST | `/api/accounts/:id/sync` | 手动同步数据 |
| **帖子** | | |
| GET | `/api/posts` | 帖子列表（分页、筛选） |
| POST | `/api/posts` | 创建帖子 |
| PUT | `/api/posts/:id` | 更新帖子 |
| DELETE | `/api/posts/:id` | 删除帖子 |
| POST | `/api/posts/:id/publish` | 立即发布 |
| POST | `/api/posts/:id/schedule` | 设置排期 |
| POST | `/api/posts/bulk-schedule` | 批量排期 |
| **媒体** | | |
| POST | `/api/media/upload` | 上传文件（Vercel Blob） |
| GET | `/api/media` | 媒体库列表 |
| DELETE | `/api/media/:id` | 删除媒体 |
| **分析** | | |
| GET | `/api/analytics/overview` | 总览数据 |
| GET | `/api/analytics/posts` | 帖子分析 |
| GET | `/api/analytics/accounts` | 账号分析 |
| GET | `/api/analytics/export` | 导出 CSV |
| **AI** | | |
| POST | `/api/ai/generate` | AI 生成内容 |
| POST | `/api/ai/rewrite` | AI 改写 |
| POST | `/api/ai/translate` | AI 翻译 |
| **设置** | | |
| GET | `/api/settings` | 获取设置 |
| PUT | `/api/settings` | 更新设置 |
| POST | `/api/settings/api-keys` | 创建 API Key |
| DELETE | `/api/settings/api-keys/:id` | 删除 API Key |

---

## 7. Inngest 事件与函数

### 事件类型
| 事件 | 触发时机 | 处理函数 |
|------|----------|----------|
| `posts.publish` | 帖子到达发布时间 | 调用社媒 API 发布 |
| `posts.retry` | 发布失败重试 | 指数退避重试（最多3次） |
| `analytics.sync` | 定时同步 | 每6小时拉取分析数据 |
| `accounts.refresh` | Token 过期前 | 提前刷新 OAuth token |
| `ai.generate` | AI 生成请求 | 调用 Gemini API |

### 定时函数
| 函数 | 频率 | 说明 |
|------|------|------|
| `check-scheduled-posts` | 每分钟 | 检查到期帖子，触发发布 |
| `sync-analytics` | 每6小时 | 拉取各平台分析数据 |
| `refresh-tokens` | 每天 | 刷新即将过期的 OAuth token |
| `cleanup-expired` | 每天 | 清理过期数据 |

---

## 8. 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录/注册 | `/login`, `/register` | Clerk 托管 |
| 仪表盘 | `/dashboard` | 总览：今日发布、粉丝变化、待发布队列 |
| 创建帖子 | `/posts/new` | TipTap 编辑器 + AI 辅助 |
| 帖子列表 | `/posts` | 所有帖子，按状态筛选 |
| 排期日历 | `/calendar` | 日历视图，拖拽排期 |
| 媒体库 | `/media` | 上传/管理图片视频 |
| 分析 | `/analytics` | 图表仪表盘 |
| 社媒账号 | `/accounts` | 连接/管理平台账号 |
| 设置 | `/settings` | 个人资料、通知、API Key |
| 定价 | `/pricing` | 免费 vs Pro 对比 |

---

## 9. UI 设计规范

### 配色
| 用途 | 颜色 |
|------|------|
| 主色 | `#7c3aed` (紫色) |
| 强调色 | `#a855f7` (浅紫) |
| 成功 | `#22c55e` |
| 警告 | `#f59e0b` |
| 错误 | `#ef4444` |
| 背景 | `#09090b` (暗色) / `#fafafa` (亮色) |

### 布局
- 左侧导航栏（可折叠）
- 顶部面包屑
- 主内容区（响应式）
- 移动端：底部 Tab 导航

### 组件库
- shadcn/ui 组件（Button, Card, Dialog, Dropdown, Toast...）
- 自定义日历组件
- TipTap 编辑器组件
- 图表组件（Recharts 封装）

---

## 10. 开发阶段

### Phase 1: 基础设施（1周）
- [ ] Next.js 15 项目初始化
- [ ] Turso 数据库连接 + Drizzle ORM
- [ ] Clerk 认证集成
- [ ] 基础布局（导航、侧边栏）
- [ ] Vercel Blob 文件上传

### Phase 2: 社媒连接（1周）
- [ ] Twitter OAuth 2.0 集成
- [ ] LinkedIn OAuth 集成
- [ ] 账号管理页面
- [ ] Token 刷新机制

### Phase 3: 内容管理（1周）
- [ ] TipTap 编辑器
- [ ] 帖子 CRUD
- [ ] 媒体上传（Vercel Blob）
- [ ] 多平台适配（字数限制、格式）

### Phase 4: 排期与发布（1周）
- [ ] Inngest 定时发布
- [ ] 日历视图
- [ ] 批量排期
- [ ] 发布日志

### Phase 5: AI 与分析（1周）
- [ ] Gemini AI 内容生成
- [ ] 分析数据同步
- [ ] 图表仪表盘
- [ ] 导出 CSV

### Phase 6: 打磨与上线（1周）
- [ ] UI 完善（暗色模式、动画）
- [ ] i18n（EN/PT/ES/JA/KO）
- [ ] SEO + Landing Page
- [ ] 定价页面
- [ ] 部署到 Vercel

**总周期**: 6周 MVP

---

## 11. 成本估算

### MVP 阶段（<1000 用户）
| 服务 | 月成本 |
|------|--------|
| Vercel Hobby | $0 |
| Turso Free | $0 |
| Inngest Free | $0 |
| Clerk Free | $0 |
| Vercel Blob Free | $0 |
| Resend Free | $0 |
| PostHog Free | $0 |
| Gemini API Free | $0 |
| **总计** | **$0** |

### 增长阶段（1K-10K 用户）
| 服务 | 月成本 |
|------|--------|
| Vercel Pro | $20 |
| TursoScaler | $29 |
| Inngest Starter | $49 |
| Clerk Pro | $25 |
| **总计** | **~$123/月** |

---

## 12. 部署架构

```
用户浏览器
    ↓
Vercel (Next.js SSR)
    ├── /api/* → Next.js API Routes
    ├── /dashboard → SSR 页面
    └── /static → 静态资源
    ↓
Turso Cloud (libsql)
    └── SQLite 兼容，边缘复制

Vercel Blob
    └── 用户上传的图片/视频

Inngest Cloud
    ├── 定时任务（检查排期帖子）
    └── 后台任务（同步分析数据）

Gemini API
    └── AI 内容生成

Clerk
    └── 认证 + 用户管理
```

---

## 13. 安全要求

- [ ] OAuth Token 加密存储（AES-256）
- [ ] Clerk JWT 验证中间件
- [ ] API Rate Limiting（每用户 100 req/min）
- [ ] CORS 限制
- [ ] CSP 安全策略
- [ ] SQL 注入防护（Drizzle ORM 参数化）
- [ ] 文件上传类型/大小限制
- [ ] GDPR 数据导出/删除
- [ ] 敏感信息不出现在日志中

---

## 14. SEO 策略

### 目标关键词
- "social media scheduling tool free"
- "open source social media management"
- "buffer alternative free"
- "post scheduler for creators"

### 页面 SEO
- 每个页面：title + description + OG + JSON-LD
- Landing Page：功能对比表 vs Buffer vs Hootsuite
- Blog：社媒运营技巧、工具对比、案例研究
- 开源文档：GitHub README + 贡献指南

---

## 15. 开源策略

### 仓库结构
```
socialforge/
├── apps/
│   └── web/          # Next.js 前端
├── packages/
│   ├── db/           # Drizzle schema + migrations
│   ├── ui/           # shadcn/ui 组件
│   └── utils/        # 共享工具函数
├── docker-compose.yml
├── LICENSE (AGPL-3.0)
└── README.md
```

### 开源协议
- **AGPL-3.0** — 要求衍生作品开源，防止 SaaS 竞品闭源fork
- 商用许可：联系获取

### 社区建设
- GitHub: README + Contributing Guide + Issue Templates
- Discord: 社区支持
- 文档: 官网文档站

---

*文档结束。基于 64 轮 Web 调研 + 49 轮 Chrome 插件调研 + Postiz 竞品分析。*
