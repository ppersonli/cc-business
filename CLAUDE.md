# CC Business — DevTools Hub + SnapGen

## ⚠️ 美术资源获取（最重要！）

**你不准自己画图！所有美术资源由Gemini AI生成。**

### 接口1: gen-art.py — 直接生成（推荐）
```bash
# 单张生成
python3 ~/.hermes/scripts/gen-art.py \
  --desc "modern blue gear icon, flat design" \
  --ratio 1:1 \
  --output ~/Desktop/cc-business/devtools-hub/public/favicon.png

# 生成+自动抠图
python3 ~/.hermes/scripts/gen-art.py \
  --desc "colorful puzzle piece icon, flat design" \
  --ratio 1:1 \
  --output ~/Desktop/cc-business/chrome-extension/public/icon-128.png \
  --remove-bg

# 批量生成
python3 ~/.hermes/scripts/gen-art.py \
  --project devtools-hub \
  --batch "1:1|blue gear icon ;; 1:1|developer tools logo" \
  --dir ~/Desktop/cc-business/devtools-hub/public
```

### 参数说明
- **--desc**: 图片描述（用英文，质量更高）
- **--ratio**: 1:1 / 16:9 / 4:3
- **--output**: 输出文件路径
- **--remove-bg**: 自动抠图（图标/Logo必须加）
- **--batch**: 批量，格式 "比例|描述 ;; 比例|描述"
- **--dir**: 批量输出目录

### 禁止事项
- ❌ 不准用 SVG/Canvas 程序化生成图形当图片
- ❌ 不准用纯色方块当图标
- ❌ 不准用占位符图片

---

## 技术栈

- **工具站**: Next.js 15 + Tailwind CSS（静态导出）
- **Chrome插件**: WXT + Vue 3 + TypeScript
- **包管理**: pnpm

## 项目结构

```
cc-business/
├── devtools-hub/          # Next.js 15 工具站 (DevTools Hub)
│   ├── app/tools/         # 每个工具一个目录
│   ├── app/api/           # API 路由 (订阅状态等)
│   ├── public/            # 静态资源
│   ├── .env.local         # Google OAuth 密钥 (GOOGLE_CLIENT_ID/SECRET)
│   └── package.json
├── chrome-extension/      # WXT + Vue 3 Chrome 插件 (SnapGen)
│   ├── entrypoints/       # 入口文件 (popup/sidepanel/options/background)
│   ├── utils/             # 工具函数
│   │   ├── subscription.ts # 订阅状态管理 (cookie读取+后端查询)
│   │   └── payment.ts     # 付费配置 (FREE_DAILY_LIMIT)
│   ├── public/            # 插件图标等
│   └── package.json
└── shared/                # 共用代码
```

## ⚠️ 多语言支持（必须！）

**所有产品面向海外，默认英文，支持主要市场语言。**

### 工具站必须支持的语言
1. **English** (en) - 默认
2. **Portuguese** (pt) - 巴西
3. **Spanish** (es) - 拉美+西班牙
4. **Japanese** (ja) - 日本
5. **Korean** (ko) - 韩国

### Chrome插件必须支持的语言
1. **English** (en) - 默认
2. **Portuguese** (pt) - 巴西
3. **Spanish** (es) - 拉美
4. **Japanese** (ja) - 日本

### i18n实现方式
```typescript
// 使用 next-intl 或简单的翻译对象
export const translations = {
  en: { /* ... */ },
  pt: { /* ... */ },
  es: { /* ... */ },
  ja: { /* ... */ },
  ko: { /* ... */ },
}
```

## ⚠️ 测试要求（100%覆盖！）

**所有产品必须100%测试覆盖核心逻辑。**

### 工具站测试
```bash
pnpm test:unit        # 单元测试
pnpm test:integration # 集成测试
pnpm test:e2e         # E2E测试（Playwright）
```

### Chrome插件测试
```bash
pnpm test:unit        # 单元测试
pnpm test:integration # 集成测试
pnpm test:e2e         # E2E测试（Playwright + CDP 9223）
```

### 测试覆盖要求
- 核心逻辑：100%
- API端点：100%
- UI组件：90%+
- 边界条件：必须测试

## ⚠️ 提交前检查清单

### 工具站
- [ ] 所有测试100%通过
- [ ] 无console.error/warn
- [ ] 移动端响应式测试通过
- [ ] 6种语言翻译完整
- [ ] SEO meta标签完整
- [ ] 性能测试通过（Lighthouse 90+）

### Chrome插件
- [ ] 所有测试100%通过
- [ ] 无console.error/warn
- [ ] Chrome Web Store审核标准
- [ ] 4种语言翻译完整
- [ ] 权限声明最小化
- [ ] CSP安全策略正确

## ⚠️ 测试全覆盖（硬性要求！）

**测试覆盖率必须达到100%，否则不允许提交。**

### 测试命令
```bash
# 运行所有测试
pnpm test

# 查看覆盖率
pnpm test:coverage

# E2E测试
npx playwright test
```

### 覆盖率要求
- **核心逻辑**：100%
- **API端点**：100%
- **UI组件**：95%+
- **边界条件**：必须测试

### 测试类型
1. **单元测试** - 每个函数/方法
2. **集成测试** - 模块间交互
3. **E2E测试** - 完整用户流程
4. **性能测试** - 加载速度/响应时间

### 提交前必须通过
```bash
# 检查覆盖率
pnpm test:coverage --check

# 必须100%通过
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### 覆盖率报告
每次提交前生成覆盖率报告，保存到 `coverage/` 目录。

## ⚠️ SEO优化要求（必须！）

**所有页面必须做好SEO，流量主要来自搜索。**

### 基础SEO（每个页面必须有）
1. **Meta title** - 60字符内，包含关键词
2. **Meta description** - 160字符内，吸引点击
3. **Keywords** - 相关关键词
4. **OpenGraph** - 社交分享
5. **Twitter cards** - Twitter分享
6. **Canonical URL** - 防止重复内容
7. **结构化数据 (JSON-LD)** - 搜索引擎理解

### 多语言SEO
```tsx
// 每个页面添加hreflang标签
export const metadata = {
  alternates: {
    canonical: 'https://tools.pixiaoli.cn/tools/json-formatter/',
    languages: {
      'en': '/tools/json-formatter/',
      'pt': '/pt/tools/json-formatter/',
      'es': '/es/tools/json-formatter/',
      'ja': '/ja/tools/json-formatter/',
      'ko': '/ko/tools/json-formatter/',
    },
  },
}
```

### 工具页面SEO模板
```tsx
export const metadata: Metadata = {
  title: `${tool.name} — Free Online Tool | DevTools Hub`,
  description: `${tool.description} 100% client-side, no data sent to servers.`,
  keywords: [tool.name, 'online tool', 'free tool', 'developer tool'],
  openGraph: {
    title: `${tool.name} — Free Online Tool`,
    description: tool.description,
    url: `https://tools.pixiaoli.cn/tools/${tool.slug}/`,
    siteName: 'DevTools Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${tool.name} — Free Online Tool`,
    description: tool.description,
  },
  alternates: {
    canonical: `https://tools.pixiaoli.cn/tools/${tool.slug}/`,
  },
}
```

### JSON-LD结构化数据
```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: tool.name,
  description: tool.description,
  url: `https://tools.pixiaoli.cn/tools/${tool.slug}/`,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}
```

### 提交前SEO检查
- [ ] Meta title/description完整
- [ ] OpenGraph tags正确
- [ ] JSON-LD结构化数据
- [ ] Canonical URL正确
- [ ] Sitemap.xml更新
- [ ] 页面加载<3秒
- [ ] 移动端友好

---

## ⚠️ SnapGen 插件开发规范

**SnapGen（原 ScreenMind）是 Chrome 插件产品名，所有代码和文档中使用 SnapGen。**

### 品牌规范
- **产品名**: SnapGen — AI Screenshot to Code
- **插件名**: `SnapGen - AI Screenshot to Code`
- **简称**: SnapGen（不使用 ScreenMind）
- **所有 HTML/代码中引用必须使用 SnapGen**，不得残留 ScreenMind
- **入口文件标题**: `<title>SnapGen</title>` / `<title>SnapGen — Settings</title>`
- **Console log**: `SnapGen background service worker started`

### 代码规范
- **命名**: 遵循现有 WXT + Vue 3 项目结构，入口在 `entrypoints/`
- **工具函数**: 放在 `utils/` 目录（如 `subscription.ts`, `payment.ts`）
- **状态管理**: 使用 `browser.storage.local` 持久化
- **测试**: 每个 utils 函数必须有对应的 `tests/utils/xxx.test.ts`
- **类型**: 所有函数必须有 TypeScript 类型定义
- **权限最小化**: 只申请必要的 Chrome 权限（`cookies`, `activeTab`, `storage` 等）

---

## ⚠️ Google 登录集成（Cookie 认证）

**插件通过读取工具站的 auth_token cookie 实现免登录认证，不需要在插件内实现 OAuth 流程。**

### 认证流程
```
用户在 tools.pixiaoli.cn 登录 (Google OAuth)
        ↓
设置 auth_token cookie (domain: tools.pixiaoli.cn)
        ↓
插件通过 chrome.cookies.get 读取该 cookie
        ↓
解码 JWT payload 获取 userId + email
        ↓
用 userId 查询后端订阅状态
```

### 关键实现 (`chrome-extension/utils/subscription.ts`)
```typescript
// 读取 auth_token cookie
const cookie = await chrome.cookies.get({
  url: 'https://tools.pixiaoli.cn',
  name: 'auth_token',
});

// 解码 JWT payload（不验证签名，仅提取 userId/email）
const payload = decodeJwtPayload(cookie.value);
// → { sub: userId, email: email, exp: expiration }
```

### 权限要求
- **Chrome 权限**: `cookies`（读取工具站 cookie）
- **Cookie 来源**: `https://tools.pixiaoli.cn` 的 `auth_token`
- **注意**: 插件不存储密码，不发起 OAuth 请求，仅读取已有 cookie

### 开发注意事项
- 登录态依赖用户先在工具站登录，插件无法独立触发登录
- JWT 过期后 `getAuthCookie()` 返回 null，回退到匿名 UUID
- 测试环境 cookies API 不可用，需 mock `chrome.cookies.get`

---

## ⚠️ 订阅系统说明

**插件通过 cookie 获取 userId，再向后端 API 查询订阅状态。**

### 订阅计划
| Plan | 说明 | 每日限额 |
|------|------|----------|
| `free` | 免费用户 | `FREE_DAILY_LIMIT` 次/天 |
| `pro` | 月度付费 | 无限制 |
| `pro-byok` | BYOK (自带API Key) | 无限制 |
| `pro-yearly` | 年度付费 | 无限制 |

### 状态查询流程
```typescript
// 1. 获取 userId（优先认证用户，否则匿名 UUID）
const userId = await getOrCreateUserId();

// 2. 查询后端订阅状态（5分钟缓存）
const res = await fetch(
  `https://tools.pixiaoli.cn/api/subscription/status?userId=${userId}`
);
const { plan, isPro, expiresAt } = await res.json();

// 3. 缓存到 browser.storage.local（避免重复请求）
```

### 使用量控制
```typescript
// 检查是否可用
const { allowed, remaining, isPro } = await canUse();

// 使用后增加计数
await incrementUsage();
```

### 后端 API 端点
- **GET** `/api/subscription/status?userId=xxx` — 查询订阅状态
- 返回: `{ plan: string, isPro: boolean, expiresAt?: number }`

---

## ⚠️ Chrome Web Store 提交规范

### 提交前检查
```bash
# 构建插件
cd chrome-extension && pnpm build

# 检查输出
ls .output/chrome-mv3/   # 确认 manifest.json 和资源完整
```

### Manifest 要求
- `manifest_version`: 3
- `permissions`: 仅声明必要权限（`cookies`, `activeTab`, `storage`）
- `host_permissions`: 仅 `https://tools.pixiaoli.cn/*`
- `name`: `SnapGen - AI Screenshot to Code`
- `description`: 不超过 132 字符
- `icons`: 16/48/128px 必须存在
- `action.default_icon`: 必须配置

### 审核注意事项
- **隐私政策**: 必须提供，声明不收集用户数据
- **权限说明**: 每个权限必须有对应功能说明
- **CSP**: 不使用 `unsafe-inline` / `unsafe-eval`
- **数据安全**: 不向第三方发送用户截图数据
- **截图处理**: 所有 AI 分析在客户端完成或通过自有服务器

### 包内容检查
```
.chrome-mv3/
├── manifest.json          ✅
├── background.js          ✅
├── popup.html             ✅
├── sidepanel.html         ✅
├── options.html           ✅
├── chunks/                ✅ (Vue 组件已编译)
├── assets/                ✅ (CSS 已编译)
└── icon/                  ✅ (16/32/48/128px)
```

### 提交流程
1. 更新 `manifest.json` 版本号
2. 运行 `pnpm build` 构建生产包
3. 压缩 `.output/chrome-mv3/` 为 zip
4. 登录 Chrome Web Store Developer Dashboard
5. 上传 zip，填写商店描述和截图
6. 提交审核（通常 1-3 个工作日）
