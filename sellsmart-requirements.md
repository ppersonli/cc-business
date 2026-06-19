# SellSmart — Chrome 插件需求文档

> **版本**: v1.0 MVP  
> **日期**: 2026-06-10  
> **技术栈**: WXT + Vue 3 + TypeScript  
> **定位**: 电商卖家研究工具 — 一站式选品、算利润、看竞品

---

## 1. 产品定位

| 维度 | 定义 |
|------|------|
| **产品名** | SellSmart |
| **一句话** | 电商卖家的智能研究助手 — 选品、算利润、监控竞品 |
| **目标用户** | Etsy/Amazon/Shopify/TikTok Shop 卖家（独立卖家 + 小团队） |
| **核心价值** | 跨平台利润计算 + 竞品监控 + AI 趋势预测，一个插件搞定 |
| **差异化** | 支持 TikTok Shop/Temu 新兴平台（竞品几乎空白）、AI 驱动 |
| **竞品** | EverBee（200K 用户，Etsy 专用）、Sale Samurai、Marmalead |

### 市场机会
- **EverBee**: 200K+ 用户，仅支持 Etsy，$29.99/月
- **TikTok Shop 卖家工具**: 几乎空白（蓝海）
- **Temu 卖家工具**: 完全空白
- **跨平台工具**: 无（每个平台一个工具，没有统一方案）

---

## 2. 技术栈

### 核心
| 组件 | 选型 | 说明 |
|------|------|------|
| 框架 | **WXT** | Manifest V3，Vite 构建，比 Plasmo 更活跃 |
| UI | **Vue 3** + TypeScript | 组件化开发 |
| 测试 | **Vitest** | 单元测试 |
| E2E | **Playwright** (原生 launch) | 插件加载测试，不用 CDP |
| 样式 | **Tailwind CSS** | 快速 UI 开发 |
| 存储 | **chrome.storage.local** | 本地数据持久化 |
| 认证 | **Cookie 读取** | 共用 tools.ovanime.com 登录态 |

### 权限（最小化）
| 权限 | 用途 |
|------|------|
| `storage` | 保存设置、研究历史、缓存 |
| `activeTab` | 访问当前标签页（用户点击时） |
| `cookies` | 读取 tools.ovanime.com 登录态 |

**不用的权限**: `scripting`, `contextMenus`, `notifications`, `tabs`, `<all_urls>`

### 语言支持
| 语言 | 代码 | 优先级 |
|------|------|--------|
| English | en | 默认 |
| Portuguese | pt | P0（巴西电商大市场） |
| Spanish | es | P1（拉美市场） |
| Japanese | ja | P2 |

---

## 3. 核心功能（MVP）

### 3.1 利润计算器 ⭐ P0
**目标**: 输入成本，一键算出各平台真实利润

**输入字段**:
- 商品成本 (COGS)
- 售价
- 运费
- 数量
- 目标平台（下拉选择）

**输出**:
- 各平台费用明细
- 净利润
- 利润率
- ROI
- 平台对比（哪个平台最赚钱）

**支持平台费率**:
| 平台 | 费用结构 |
|------|----------|
| **Etsy** | 上架费 $0.20 + 交易费 6.5% + 支付处理 3%+$0.25 |
| **Amazon** | 推荐费 15% + 结算费 $1.80 |
| **Shopify** | 月费 + 交易费 2.9%+$0.30 |
| **TikTok Shop** | 佣金 5% + 支付处理 2.0% |

### 3.2 研究历史 ⭐ P0
**目标**: 保存每次计算结果，方便回顾

- 自动保存每次计算
- 最多保存 50 条记录
- 按平台筛选
- 按时间排序
- 一键删除/清空
- 数据存 chrome.storage.local

### 3.3 平台费用查询 ⭐ P1
**目标**: 快速查看各平台最新费率

- 各平台费率一览表
- 费率更新提醒
- 费用计算器联动

### 3.4 竞品监控 🔜 P1（Phase 2）
**目标**: 监控竞品店铺的价格和销量变化

- 输入竞品店铺 URL
- 记录价格快照
- 价格变动提醒
- 销量趋势图表

### 3.5 AI 选品建议 🔜 P2（Phase 3）
**目标**: AI 分析市场趋势，推荐选品方向

- 输入关键词/品类
- Gemini 分析市场热度
- 推荐利润最高的平台
- 竞争程度评估

---

## 4. UI 设计

### Popup 布局（400px 宽 × 500px 高）
```
┌─────────────────────────────┐
│  SellSmart 💰              │  ← 标题栏
├─────────────────────────────┤
│  [Calculator] [History]     │  ← Tab 切换
├─────────────────────────────┤
│                             │
│  Platform: [Etsy ▼]        │  ← 平台选择
│                             │
│  Cost:        [________]   │  ← 商品成本
│  Price:       [________]   │  ← 售价
│  Shipping:    [________]   │  ← 运费
│  Quantity:    [________]   │  ← 数量
│                             │
│  [Calculate Profit]         │  ← 计算按钮
│                             │
│  ─── Results ───            │
│  Revenue:      $120.00     │
│  Platform Fee: -$15.60     │
│  Shipping:     -$8.50      │
│  COGS:         -$30.00     │
│  ─────────────────          │
│  Net Profit:   $65.90  ✅  │  ← 绿色高亮
│  Margin:       54.9%       │
│  ROI:          219.7%      │
│                             │
│  [Compare All Platforms]    │  ← 对比按钮
│                             │
├─────────────────────────────┤
│  🔗 tools.ovanime.com     │  ← 底部链接
└─────────────────────────────┘
```

### 配色
| 元素 | 颜色 |
|------|------|
| 主色 | `#10b981` (绿色 — 代表利润) |
| 背景 | `#0f172a` (暗色) |
| 卡片 | `#1e293b` |
| 文字 | `#f8fafc` |
| 利润正 | `#22c55e` (绿色) |
| 利润负 | `#ef4444` (红色) |
| 按钮 | `#10b981` → `#059669` |

---

## 5. 数据结构

### 研究记录
```typescript
interface ResearchEntry {
  id: string;              // UUID
  timestamp: number;       // Date.now()
  platform: Platform;      // 'etsy' | 'amazon' | 'shopify' | 'tiktok'
  costOfGoods: number;
  sellingPrice: number;
  shippingCost: number;
  quantity: number;
  result: ProfitResult;    // 计算结果快照
}
```

### 平台费率配置
```typescript
interface PlatformConfig {
  id: Platform;
  name: string;
  fees: FeeRule[];         // 费率规则数组
  lastUpdated: string;     // ISO 日期
}
```

### 设置
```typescript
interface Settings {
  defaultPlatform: Platform;
  currency: string;        // 'USD' | 'EUR' | 'GBP'
  theme: 'dark' | 'light';
  locale: 'en' | 'pt' | 'es' | 'ja';
}
```

---

## 6. Chrome Web Store 提交

### 权限审计
| 权限 | 代码证据 |
|------|----------|
| `storage` | `chrome.storage.local.get/set` 在 storage.ts |
| `activeTab` | 仅在用户点击图标时使用 |
| `cookies` | `chrome.cookies.get` 在 subscription.ts |

### 必需材料
- [ ] 隐私政策页面（tools.ovanime.com/privacy）
- [ ] 服务条款页面（tools.ovanime.com/terms）
- [ ] 截图 1280×800（至少1张）
- [ ] 宣传图 440×280 + 1400×560
- [ ] 描述（英文）
- [ ] 图标 128×128

### 审核要点
- 权限最小化（只有3个）
- 无远程代码执行
- 无误导性 UI
- 隐私政策可访问
- 功能与描述一致

---

## 7. 开发阶段

### Phase 1: MVP（1-2周）
- [ ] WXT 项目初始化 + Vue 3 + TypeScript
- [ ] Manifest V3 配置（最小权限）
- [ ] 利润计算器核心逻辑
- [ ] 平台费率配置（4个平台）
- [ ] Popup UI（计算器 + 结果展示）
- [ ] 研究历史（保存/查看/删除）
- [ ] i18n（EN/PT/ES）
- [ ] 单元测试（100% 覆盖）
- [ ] E2E 测试（Playwright 原生）
- [ ] 暗色模式

### Phase 2: 增强（2-3周）
- [ ] 竞品监控功能
- [ ] 平台费率对比视图
- [ ] 导出 CSV
- [ ] 快捷键支持
- [ ] 更新日志页面

### Phase 3: AI（2-3周）
- [ ] Gemini AI 选品建议
- [ ] 趋势分析
- [ ] AI 改进建议

### Phase 4: 发布（1周）
- [ ] Chrome Web Store 提交
- [ ] 宣传图制作
- [ ] Landing Page（tools.ovanime.com/sellsmart）
- [ ] Product Hunt 发布

---

## 8. 变现模式

### 免费层
- 利润计算：无限制
- 研究历史：50 条
- 平台支持：4 个

### Pro ($9.99/月)
- 研究历史：无限
- 竞品监控（10 个店铺）
- AI 选品建议（20 次/月）
- 优先支持

### Pro+ ($19.99/月)
- 全部 Pro 功能
- 竞品监控（无限）
- AI 选品建议（无限）
- API 访问
- 自定义费率

### 认证流程（共用 tools.ovanime.com）
```
用户在 tools.ovanime.com 注册/登录
        ↓
设置 auth_token cookie
        ↓
插件 chrome.cookies.get 读取 cookie
        ↓
查询 /api/subscription/status
        ↓
解锁 Pro 功能
```

---

## 9. 竞品对比

| 功能 | SellSmart | EverBee | Sale Samurai |
|------|-----------|---------|--------------|
| **平台支持** | Etsy/Amazon/Shopify/TikTok | 仅 Etsy | 仅 Etsy |
| **利润计算** | ✅ 跨平台 | ❌ | ❌ |
| **竞品监控** | ✅ (Phase 2) | ✅ | ✅ |
| **AI 选品** | ✅ (Phase 3) | ✅ | ❌ |
| **价格** | Free + $9.99/月 | $29.99/月 | $29.99/月 |
| **TikTok Shop** | ✅ | ❌ | ❌ |
| **Temu** | 🔜 | ❌ | ❌ |

### 核心差异化
1. **跨平台** — 一个插件覆盖所有主流平台（竞品只做 Etsy）
2. **新平台** — 支持 TikTok Shop/Temu（蓝海，无竞品）
3. **更便宜** — $9.99/月 vs 竞品 $29.99/月
4. **AI 驱动** — Gemini 免费层提供 AI 功能

---

## 10. 安全要求

- [ ] OAuth Token 加密存储（chrome.storage.local + 应用层加密）
- [ ] API 调用通过 service worker（不在 content script 中）
- [ ] CSP 安全策略
- [ ] 无远程代码执行
- [ ] 用户数据本地存储（不上传服务器，除非用户主动）
- [ ] 隐私政策明确说明数据使用

---

*文档结束。基于 49 轮 Chrome 插件调研 + EverBee/Sale Samurai 竞品分析。*
