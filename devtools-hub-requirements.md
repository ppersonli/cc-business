# DevTools Hub (tools.pixiaoli.cn) — 产品需求文档

> **版本**: v2.0  
> **日期**: 2026-06-10  
> **技术栈**: Next.js 15 + Tailwind CSS  
> **定位**: 免费在线开发者工具集 — 45+ 工具，10 种语言，100% 客户端

---

## 1. 产品定位

| 维度 | 定义 |
|------|------|
| **产品名** | DevTools Hub |
| **域名** | tools.pixiaoli.cn |
| **一句话** | 45+ 免费在线开发者工具 — 格式化、转换、生成、测试 |
| **目标用户** | 开发者、设计师、数据分析师、内容创作者 |
| **核心价值** | 100% 客户端运行（无服务器传输）、免费、多语言、无广告 |
| **差异化** | 隐私安全（数据不出浏览器）、WeChat Markdown 编辑器独家、10 语言 |
| **竞品** | JSONFormatter.org、RegExr、CSS-Tricks 工具、TinyPNG |

### 流量来源
| 渠道 | 占比 | 说明 |
|------|------|------|
| SEO 搜索 | 60% | "json formatter online"、"regex tester" 等长尾词 |
| 直接访问 | 20% | 收藏夹、书签 |
| 外部链接 | 15% | pixiaoli.cn 导流、社交媒体 |
| 广告 | 5% | 可选 Google Ads |

---

## 2. 技术栈

| 组件 | 选型 | 说明 |
|------|------|------|
| 框架 | **Next.js 15** (App Router) | SSG 静态导出，部署 Vercel |
| UI | **Tailwind CSS** | 原子化样式，无运行时 |
| i18n | **next-intl** | 10 种语言 |
| 测试 | **Vitest + Playwright** | 单元 + E2E |
| 部署 | **Vercel** | 免费 Hobby 层 |
| 认证 | **Google OAuth** | 可选登录（订阅系统） |
| 付费 | **Waffo Pancake** | 共用支付后端 |

---

## 3. 工具清单（45 个）

### 按类别分组

| 类别 | 数量 | 工具 |
|------|------|------|
| **Code** | 12 | JSON Formatter, Regex Tester, Markdown Preview, CSS Minifier, HTML Minifier, Diff Checker, Markdown to HTML, JS Formatter, JSON to Go, JSON to TS, SQL Formatter, HTML to JSX, YAML Formatter |
| **Design** | 7 | Color Picker, Color Converter, Color Palette, CSS Flexbox, Gradient Generator, Box Shadow, CSS Grid |
| **Data** | 4 | JSON Schema Validator, CSV ⇄ JSON, JSON Diff, YAML Formatter |
| **Text** | 5 | Text Case Converter, Word Counter, Lorem Ipsum, Markdown Table, WeChat Markdown Editor |
| **Encoding** | 3 | Base64, URL Encoder, HTML Encoder |
| **Crypto** | 3 | Hash Calculator, JWT Decoder, Password Generator |
| **Utility** | 5 | QR Code, UUID Generator, Timestamp, Unit Converter, Cron Generator |
| **Network** | 2 | IP Lookup, API Tester |
| **Security** | 1 | Extension Shield |
| **Social** | 1 | SocialForge (Coming Soon) |

---

## 4. 核心功能

### 4.1 工具页面（每个工具）
- **输入区**: 文本框/代码编辑器
- **操作按钮**: 格式化/转换/生成
- **输出区**: 结果展示 + 一键复制
- **实时预览**: 输入即输出（无需点击）
- **暗色/亮色模式**: 系统跟随 + 手动切换
- **移动端适配**: 响应式布局

### 4.2 WeChat Markdown 编辑器（旗舰工具）
- CodeMirror 编辑器
- 10+ 主题切换
- KaTeX 数学公式
- Mermaid 图表
- 一键复制到微信
- 实时预览

### 4.3 首页
- 搜索框（实时过滤工具）
- 精选卡片（WeChat Markdown + SocialForge）
- 分类浏览
- 工具统计（45+ Tools）

### 4.4 全局功能
- **暗色模式**: localStorage 持久化
- **10 语言**: 自动检测浏览器语言，手动切换
- **SEO**: 每个工具独立 meta + JSON-LD
- **PWA**: 可安装到桌面

---

## 5. 多语言支持

### 支持语言
| 语言 | 代码 | 市场 |
|------|------|------|
| English | en | 全球（默认） |
| 中文 | zh | 中国 |
| Português | pt | 巴西 |
| Español | es | 拉美 + 西班牙 |
| 日本語 | ja | 日本 |
| 한국어 | ko | 韩国 |
| Deutsch | de | 德国 |
| Français | fr | 法国 |
| Русский | ru | 俄罗斯 |
| العربية | ar | 中东 |

### 实现方式
- next-intl 路由: `/en/tools/json-formatter/`, `/zh/tools/json-formatter/`
- 浏览器语言自动检测（可关闭）
- 默认英文

---

## 6. SEO 策略

### 目标关键词（每个工具）
| 工具 | 主关键词 | 长尾词 |
|------|----------|--------|
| JSON Formatter | json formatter | format json online, pretty print json |
| Regex Tester | regex tester | test regex online, regex match |
| Base64 | base64 encoder | encode base64 online, base64 decode |
| WeChat Markdown | wechat markdown editor | 微信 markdown 编辑器 |
| Password Generator | password generator | random password generator online |

### SEO 要素（每个工具页）
- `<title>` — 60 字符内，含关键词
- `<meta name="description">` — 160 字符内
- `<meta name="keywords">` — 5-10 个
- OpenGraph（社交分享）
- Twitter Cards
- JSON-LD 结构化数据
- Canonical URL
- hreflang（10 语言）

---

## 7. 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 工具列表 + 搜索 + 精选 |
| 工具页 | `/tools/{slug}/` | 单个工具 |
| 关于 | `/about` | 介绍 + 团队 |
| 服务条款 | `/terms` | ToS |
| 隐私政策 | `/privacy` | Privacy Policy |
| 定价 | `/pricing` | 免费 vs Pro（可选） |
| 博客 | `/blog` | 技术文章（SEO） |
| API 文档 | `/api/docs` | 开发者 API（可选） |

---

## 8. 变现模式

### 当前状态
- **全部免费**，无付费层
- **无广告**

### 可选变现（未来）
| 方式 | 说明 | 优先级 |
|------|------|--------|
| **Pro 订阅** | 高级功能（批量处理、API 调用） | P2 |
| **Chrome 插件** | SellSmart 等插件付费 | P0 |
| **赞助** | GitHub Sponsors / Buy Me a Coffee | P2 |
| **联盟营销** | 推荐开发工具（Vercel、Railway 等） | P3 |

### 共用支付架构
```
用户在 tools.pixiaoli.cn 注册/登录
        ↓
Google OAuth → auth_token cookie
        ↓
Chrome 插件读取 cookie → 验证订阅状态
        ↓
Waffo Pancake 处理支付
```

---

## 9. 开发阶段

### Phase 1: 基础优化（已完成 ✅）
- [x] 45 个工具全部上线
- [x] 10 语言 i18n
- [x] 暗色模式
- [x] WeChat Markdown 编辑器
- [x] Google OAuth 登录
- [x] SEO 基础（meta + JSON-LD）
- [x] SocialForge 入口卡片

### Phase 2: 增强（2周）
- [ ] 搜索优化（模糊搜索、拼音搜索）
- [ ] 工具收藏功能
- [ ] 使用历史（localStorage）
- [ ] 快捷键支持
- [ ] 移动端 UI 优化
- [ ] 性能优化（代码分割、懒加载）

### Phase 3: 新工具（持续）
- [ ] JSON to YAML（已有 YAML Formatter）
- [ ] HTML to Markdown
- [ ] Image Compressor（客户端压缩）
- [ ] Color Contrast Checker（WCAG 合规）
- [ ] CSS Minifier 增强（去重、优化）
- [ ] API Mock Server（在线 mock）
- [ ] WebSocket Tester
- [ ] GraphQL Playground

### Phase 4: 生态（1个月）
- [ ] Chrome 插件集成（SellSmart 入口）
- [ ] 博客系统（技术文章 SEO）
- [ ] 开发者 API（付费）
- [ ] 赞助页面
- [ ] Product Hunt 发布

---

## 10. 性能指标

| 指标 | 目标 | 当前 |
|------|------|------|
| Lighthouse 性能分 | 95+ | ~90 |
| 首屏加载时间 | <1.5s | ~2s |
| 工具切换速度 | <200ms | ~300ms |
| 移动端评分 | 90+ | ~85 |
| 总打包大小 | <500KB | ~600KB |

### 优化方向
- 代码分割（每个工具独立 chunk）
- 懒加载（非首屏工具延迟加载）
- 图标优化（SVG sprite）
- 字体优化（subset + preload）

---

## 11. 测试策略

### 单元测试（Vitest）
- 每个工具的转换/格式化逻辑
- i18n 翻译完整性
- 工具元数据完整性

### E2E 测试（Playwright）
- 工具页面加载
- 输入→输出流程
- 一键复制功能
- 暗色模式切换
- 语言切换

### 提交前检查
- [ ] `pnpm test` 全部通过
- [ ] `pnpm build` 无错误
- [ ] 10 语言翻译完整
- [ ] SEO meta 正确
- [ ] 移动端响应式
- [ ] 无 console.error/warn

---

## 12. 运营指标

| 指标 | 目标（3个月） | 目标（6个月） |
|------|--------------|--------------|
| 月访问量 | 10K | 50K |
| 工具使用次数 | 50K/月 | 200K/月 |
| 注册用户 | 500 | 2K |
| 收藏用户 | 100 | 500 |
| Google 排名 Top 10 | 5 个工具 | 15 个工具 |

---

*文档结束。基于 tools.pixiaoli.cn 45 个工具的实际运营数据。*
