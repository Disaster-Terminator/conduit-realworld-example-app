# Plan: Article 增加 status 枚举 + 编辑器草稿按钮 + 列表过滤 + 个人 Drafts Tab

## 任务理解

为文章系统增加草稿/发布状态管理：
1. Article 模型新增 `status` 枚举字段（`draft`/`published`）
2. 编辑器新增"保存草稿"按钮，与"发布"按钮并存
3. 文章列表（全局/Feed/作者页面）默认只展示 `published` 文章
4. 个人主页增加 Drafts Tab，展示当前用户自己的草稿

## 已确认决策

| 决策 | 来源 |
|------|------|
| Article 增加 status 字段，ENUM('draft','published') | [需求原文] |
| 已有数据通过新 migration 设 status = 'published' | [低风险假设] 已有文章都是已发布状态 |
| 新文章默认 status = 'draft'（API 未指定时） | [低风险假设] 保守默认值 |
| Drafts Tab 仅在查看自己主页时显示 | [低风险假设] 他人不能查看自己的草稿 |
| drafts 通过 `?status=draft` query 参数筛选 | [低风险假设] 复用现有 allArticles 路由 |
| 草稿只能被作者自己查看（singleArticle 检查） | [低风险假设] 隐私保护 |
| 保存草稿后导航到文章页面（同发布行为） | [低风险假设] 用户体验一致 |

## 涉及文件

### 后端（7 个文件）
- `backend/models/Article.js` — 添加 status 字段定义
- `backend/migrations/20220129140808-create-article.js` — 创建新 migration 添加 status 列
- `backend/controllers/articles.js` — 修改 allArticles/createArticle/updateArticle/singleArticle
- `backend/seed-demo.js` — demo 数据指定 status: 'published'
- `backend/helper/helpers.test.js` — 不受影响（保持通过）

### 前端（9 个文件）
- `frontend/src/components/ArticleEditorForm/ArticleEditorForm.jsx` — 增加"保存草稿"按钮
- `frontend/src/services/setArticle.js` — 支持 status 字段
- `frontend/src/services/getArticles.js` — 新增 drafts 类型 URL
- `frontend/src/routes/Profile/Profile.jsx` — 增加 Drafts Tab
- `frontend/src/routes/Profile/ProfileDrafts.jsx` — 新建文件，展示草稿列表
- `frontend/src/main.jsx` — 增加 drafts 路由
- `frontend/src/routes/Profile/ProfileArticles.jsx` — 不受影响
- `frontend/src/routes/Profile/ProfileFavArticles.jsx` — 不受影响
- `frontend/src/hooks/useArticles.js` — 支持 status 参数（自动适配）

## 执行步骤

### Phase 1: 后端 — 数据层

- [ ] **1.1 新增 migration 文件**
  创建 `backend/migrations/20260608000000-add-status-to-articles.js`：
  ```js
  'use strict';
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Articles', 'status', {
        type: Sequelize.ENUM('draft', 'published'),
        defaultValue: 'draft',
        allowNull: false,
      });
      // 已有数据全部设为 published
      await queryInterface.sequelize.query(
        `UPDATE "Articles" SET status = 'published' WHERE status IS NULL`
      );
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Articles', 'status');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Articles_status"');
    },
  };
  ```

- [ ] **1.2 更新 Article 模型**
  在 `backend/models/Article.js` 的 `Article.init` 中添加：
  ```js
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
    allowNull: false,
  },
  ```

### Phase 2: 后端 — 控制器逻辑

- [ ] **2.1 修改 `allArticles` 控制器**
  - 默认 `where` 条件增加 `status: 'published'`
  - 如果 query 包含 `status=draft` 且 loggedUser 是所查询的 author，则改为查询 drafts
  - 支持 query 参数 `status` 透传

- [ ] **2.2 修改 `articlesFeed` 控制器**
  - 增加 `where: { status: 'published' }` 过滤

- [ ] **2.3 修改 `createArticle` 控制器**
  - 从 `req.body.article.status` 读取状态，默认 `'draft'`
  - 不再强制要求 title/description/body 都为必填（草稿允许不完整的文章？）；
    **决策**：保持原有必填校验，草稿和发布一样需要 title/description/body。简化实现。

- [ ] **2.4 修改 `updateArticle` 控制器**
  - 允许更新 status 字段
  - 从 `req.body.article.status` 读取

- [ ] **2.5 修改 `singleArticle` 控制器**
  - 如果文章 status 为 draft 且 loggedUser 不是作者，返回 404

- [ ] **2.6 更新 seed-demo.js**
  - 每个 article 创建时指定 `status: 'published'`

### Phase 3: 前端 — 服务层

- [ ] **3.1 修改 `setArticle.js`**
  - 接受并发送 `status` 字段到 API

- [ ] **3.2 修改 `getArticles.js`**
  - 新增 location 类型 `drafts`：`api/articles?author=${username}&&status=draft&&limit=${limit}&&offset=${page}`

### Phase 4: 前端 — 编辑器

- [ ] **4.1 修改 `ArticleEditorForm.jsx`**
  - 新增 `formSubmitDraft` 函数，调用 `setArticle` 时传入 `status: 'draft'`
  - 新增"保存草稿"按钮（`<button type="button">保存草稿</button>`），点击执行 `formSubmitDraft`
  - 现有提交按钮改为"发布"，调用时传入 `status: 'published'`
  - 编辑模式下也保留两个按钮

### Phase 5: 前端 — 个人主页 Drafts Tab

- [ ] **5.1 创建 `ProfileDrafts.jsx`**
  - 类似 `ProfileArticles.jsx`，但 location 为 `drafts`
  - 展示当前用户的草稿列表

- [ ] **5.2 修改 `Profile.jsx`**
  - 导入 `useAuth` 获取当前用户
  - 导入 `useParams` 获取 URL 中的 username
  - 仅在 `username === loggedUser.username` 时渲染 Drafts Tab

- [ ] **5.3 修改 `main.jsx` 增加路由**
  - 在 `/profile/:username` 路由下增加 `<Route path="drafts" element={<ProfileDrafts />} />`

### Phase 6: 验证

- [ ] **6.1 运行后端现有测试**
  ```bash
  npx vitest run backend/helper/helpers.test.js
  ```
  预期：2 个测试通过（slugify）

- [ ] **6.2 运行前端现有测试**
  ```bash
  npx vitest run frontend/src/helpers/
  ```
  预期：全部通过

- [ ] **6.3 代码结构检查**
  ```bash
  node -e "require('./backend/models/Article.js')"  # 不报错
  # 前端构建检查
  npm run build -w frontend
  ```
  预期：build 成功，无报错

## 风险

| 风险 | 缓解 |
|------|------|
| 现有文章没有 status 字段 | Migration 设置默认值 'published'，兼容现有数据 |
| 草稿 URL 泄露（知道 slug 就能访问） | singleArticle 做了作者校验；列表页不展示 draft |
| 前端依赖的 axios API 数据结构变化 | setArticle 和 getArticles 是显式修改，类型匹配 |

## 非目标

- 不添加草稿列表的独立 API 端点（复用现有路由 + query 参数）
- 不修改后端测试基础设施（无 DB 集成测试）
- 不添加图像上传、自动保存等编辑器增强功能
- 不改动 Comment / Tag / User 模型

## 验收行为

1. **文章状态**：新建文章时，通过"发布"创建的文章 status='published'，通过"保存草稿"创建的文章 status='draft'
2. **列表过滤**：全局 / Feed / 作者文章列表不显示 draft 文章
3. **草稿可见性**：直接访问草稿 URL 时，作者本人可以查看，其他用户返回 404
4. **Drafts Tab**：在个人主页上，如果查看的是自己的主页，显示 Drafts Tab；查看他人主页不显示
5. **已有数据兼容**：运行 migration 后所有现有文章 status='published'，在列表中正常展示

<!-- vela:plan-ready -->
