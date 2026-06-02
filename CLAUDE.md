# CC Business — 工具站 + Chrome插件

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
├── devtools-hub/          # Next.js 工具站
│   ├── app/tools/         # 每个工具一个目录
│   ├── public/            # 静态资源
│   └── package.json
├── chrome-extension/      # WXT Chrome插件
│   ├── entrypoints/       # 入口文件
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
