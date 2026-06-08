# PR Handoff

## Public PR Title

feat: 增加文章草稿状态管理

## Public PR Body

### 变更内容

为 Article 增加草稿/发布状态管理，编辑器增加"保存草稿"按钮，列表默认过滤草稿，个人主页增加 Drafts Tab。

**后端**
- Article 模型新增 `status` 枚举字段（`draft` / `published`），默认值 `draft`
- 新增 migration 为现有数据设置 `status = 'published'`
- `GET /api/articles` 默认只返回 `published` 文章；支持 `?status=draft` 查询（仅作者本人可见）
- `GET /api/articles/feed` 只返回 `published` 文章
- `POST /api/articles` 支持 `status` 参数，默认 `draft`
- `PUT /api/articles/:slug` 支持更新 `status`
- `GET /api/articles/:slug` 草稿仅作者本人可访问，他人返回 404

**前端**
- 编辑器新增"保存草稿"按钮（status=draft），与"发布"按钮并存
- 个人主页增加 Drafts Tab（仅在查看自己主页时显示）
- 新增 `ProfileDrafts` 组件，通过 `api/articles?author=xxx&status=draft` 获取草稿列表
- 新增路由 `/profile/:username/drafts`

### 验证结果

在本地 PostgreSQL 环境通过 API 行为验证：

| 测试场景 | 结果 |
|---------|------|
| 默认文章列表只显示 published（56 篇） | ✅ |
| 未认证用户请求 drafts 返回空 | ✅ |
| 作者本人查看自己 drafts 正常显示 | ✅ |
| 他人查看作者 drafts 返回空 | ✅ |
| 创建草稿文章（status=draft） | ✅ |
| 作者本人查看草稿 URL 正常访问 | ✅ |
| 他人访问草稿 URL 返回 404 | ✅ |
| 发布草稿（PUT 更新 status） | ✅ |
| 前端构建成功 | ✅ |

### 涉及文件

| 文件 | 变更 |
|------|------|
| `backend/models/Article.js` | 添加 status 字段 |
| `backend/migrations/20260608000000-add-status-to-articles.js` | 新增 migration |
| `backend/controllers/articles.js` | 修改列表/创建/更新/单篇控制器 |
| `backend/seed-demo.js` | demo 数据指定 status |
| `frontend/src/services/setArticle.js` | 支持 status 参数 |
| `frontend/src/services/getArticles.js` | 新增 drafts 查询类型 |
| `frontend/src/components/ArticleEditorForm/ArticleEditorForm.jsx` | 增加保存草稿按钮 |
| `frontend/src/routes/Profile/Profile.jsx` | 增加 Drafts Tab |
| `frontend/src/routes/Profile/ProfileDrafts.jsx` | 新建草稿列表组件 |
| `frontend/src/main.jsx` | 增加 drafts 路由 |

---

## Internal Notes

- Vela task ID: `9c6b257e-1ebd-4c9e-9a97-b334e486102f`
- Branch: `vela/9c6b257e-1ebd-4c9e-9a97-b334e486102f`
- Commit: `b1d0a12`
- Migration name: `20260608000000-add-status-to-articles.js`
- 验证方式：本地 Docker PostgreSQL + 后端 API curl 测试 + 前端 Vite build 检查
