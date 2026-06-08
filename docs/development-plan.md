# 开发策划文档

> 基于 tool-research-report.md 和 extension-research-report.md
> 创建日期：2026-06-08
> 状态：**等待用户确认后执行**

---

## 一、当前状态

### 工具站 (tools.pixiaoli.cn)
- **工具数量**: 35个
- **语言**: 7种 (en/zh/de/pt/es/ja/ko)
- **技术栈**: Next.js 15 + Tailwind CSS (静态导出)
- **SEO**: 需优化（大部分工具页面缺少结构化数据）
- **变现**: Google AdSense（待审核通过）+ Pancake订阅

### Chrome插件 (SnapGen)
- **状态**: 基础框架已搭建 (WXT + Vue 3)
- **功能**: 截图→AI分析→代码生成
- **问题**: 需要后端支持，API调用成本

---

## 二、工具站：推荐开发方向

### 方向A：高搜索量开发者工具（客户端，零成本）

基于开发者日常高频需求，选择有搜索量但现有35个工具未覆盖的方向：

| 工具 | 月搜索量(估) | 竞争 | 开发复杂度 | 优先级 |
|------|-------------|------|-----------|--------|
| JSON Diff Tool | 12K | 中 | 低 | P0 |
| HTML to JSX | 8K | 低 | 低 | P0 |
| CSS Grid Generator | 15K | 中 | 中 | P1 |
| Lorem Ipsum Generator | 18K | 高 | 低 | P1 |
| JSON to CSV | 10K | 中 | 低 | P1 |
| YAML Formatter | 9K | 中 | 低 | P2 |
| Markdown Table Generator | 7K | 低 | 低 | P2 |
| Regex Cheat Sheet | 11K | 中 | 低 | P2 |

**推荐P0**: JSON Diff Tool — 开发者高频需求，现有Diff Checker只做文本对比，JSON Diff能解析结构差异。

### 方向B：隐私分析平台（需要后端）

调研报告推荐的Top 1方向，但需要：
- 后端API（用户注册、数据存储）
- 数据库（Turso/PostgreSQL）
- 计费系统（Pancake订阅）

**MVP周期**: 4-6周
**预期MRR**: $500-2000（6个月后）

**⚠️ 注意**: 当前静态导出架构不支持后端。需要：
1. 改为混合架构（部分页面静态，API路由动态）
2. 或单独部署后端服务（Cloudflare Workers）

### 方向C：内容创作者工具

调研推荐的Top 2方向，但需要AI API集成：
- AI文案生成器（调用OpenAI/Gemini API）
- 跨平台内容管理（需要OAuth集成）

**MVP周期**: 3-4周
**风险**: API成本高，需要用户量覆盖

---

## 三、Chrome插件：推荐开发方向

### 推荐：邮件写作AI助手

基于调研报告的🥈推荐，原因：
1. **市场验证**: Grammarly证明付费意愿
2. **技术可行**: 纯前端 + AI API调用
3. **差异化**: 专注邮件场景（Grammarly太通用）
4. **MVP周期**: 5-6周
5. **预期MRR**: $500-2000

**MVP功能**:
- 一键生成邮件（基于场景/语气选择）
- 邮件模板库（商务/销售/客服/感谢/道歉）
- 多语言支持（至少中/英/日）
- 免费层：3封/天，Pro无限制

**技术栈**:
- WXT + Vue 3
- AI API（OpenAI GPT-4o-mini，成本低）
- Waffo Pancake订阅集成

**⚠️ 依赖**:
- 需要OpenAI API Key
- 需要后端API（邮件历史、订阅验证）
- 需要Chrome Web Store开发者账号

---

## 四、执行建议

### 短期（1-2周）— 推荐先做

**工具站P0工具**:
1. JSON Diff Tool — 结构化JSON对比，显示路径级差异
2. HTML to JSX — HTML代码转JSX语法
3. YAML Formatter — YAML格式化/压缩

每个工具开发流程：
1. CC在tmux中开发
2. 实现功能 → 写测试 → 测试通过
3. 构建验证
4. 提交部署

### 中期（3-6周）

**邮件AI助手Chrome插件**:
1. WXT项目搭建
2. 核心功能开发（邮件生成/模板）
3. 订阅集成（Waffo Pancake）
4. Chrome Web Store提交

### 长期（1-2月）

**隐私分析平台**:
1. 后端架构设计
2. 数据库设计
3. 核心功能开发
4. 变现系统集成

---

## 五、风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 工具站SEO优化效果慢 | 低 | 持续优化，3-6个月见效 |
| AI插件API成本高 | 中 | 用GPT-4o-mini控制成本 |
| Chrome审核拒绝 | 中 | 严格遵守权限最小化 |
| 隐私分析平台开发周期长 | 高 | 先做MVP验证市场 |

---

## 六、下一步行动

**用户需要决定**:
1. 优先开发哪个方向？（P0工具 / 邮件AI插件 / 隐私分析）
2. 是否需要我开始CC开发P0工具？
3. 邮件AI插件是否需要先申请OpenAI API Key？

**⚠️ 铁律**: 等待用户确认后才能开始CC开发。
