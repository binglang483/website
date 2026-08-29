# 🌸 学びの庭 (Gaku no Niwa)

一个以知识记录为核心的个人学习空间。全栈 TypeScript · SSR 友好 · 和式美学 UI。

## ✨ 特性

- 🏠 **首页**：680px Hero 壁纸轮播（cover 铺满 + 渐变遮罩）+ 搜索框 + 数据看板 + 热门文档 Top5 + 工具分类快选
- 📚 **文档站**：33+ 技术文档，12 大领域文件树导航，Markdown 实时渲染 + DOMPurify XSS 防护
- 📓 **笔记系统**：自定义文件夹分类 · 快速记录灵感 · Markdown 编辑
- 🛠️ **工具箱**：40+ 精选工具，5 大分类（开发/设计/效率/AI/杂项）
- 🎨 **主题系统**：和纸 / 浅色 / 深色 三套主题，CSS 变量动态切换
- 🌏 **多语言**：中文 / English / 日本語，Pinia store 响应式 t() 翻译
- 🖼️ **壁纸系统**：52 张内置壁纸，自动轮播（可暂停），手动选择，透明度可调（10%-100%），设置页分页加载（16+加载更多）
- ⚙️ **设置中心**：主题 / 语言 / 壁纸 / 字体大小 / 动画开关 / 笔记导出 / 重置
- 🔐 **用户认证**：JWT 注册登录 · 公开/私密切换
- 💬 **评论系统**：文档 + 笔记评论
- 🚀 **HTTP 缓存**：壁纸 + _nuxt 资源 immutable 1 年，API SWR 5 分钟

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Nuxt 3 + Vue 3 | SSR + 全栈 Nitro |
| 状态 | Pinia | 设置/壁纸/语言持久化 |
| 样式 | TailwindCSS 3 | + CSS 变量主题系统 |
| 数据库 | SQLite (better-sqlite3) | 零配置本地存储 |
| 认证 | JWT (jsonwebtoken) | HttpOnly Cookie |
| 安全 | DOMPurify + marked | Markdown XSS 防护 |
| 测试 | Vitest | 单元测试 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式 http://localhost:3000
npm run dev

# 生产构建 + 预览
npm run build
npm run preview
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |
| 普通用户 | 任意邮箱注册 | /register |

## 📂 项目结构

```
website/
├── components/
│   ├── HeroBanner.vue       # 首页壁纸轮播 + 搜索
│   └── Sidebar.vue          # 侧边栏目录
├── composables/
│   ├── i18n.ts              # 三语种字典 (zh/en/ja 47+ keys)
│   ├── useI18n.ts           # 响应式翻译 hook
│   └── useMarkdown.ts       # Markdown 安全渲染 (DOMPurify + marked)
├── layouts/default.vue      # 导航栏 + 主题🎨/语言🇨🇳 切换
├── pages/
│   ├── index.vue            # 首页 (Hero + 数据看板 + 热门 + 工具分类)
│   ├── about.vue            # 关于页
│   ├── settings.vue         # 设置中心
│   ├── docs/index.vue       # 文档列表 (卡片美化)
│   ├── docs/[...path].vue   # 文档详情 (Markdown)
│   ├── notes/               # 笔记 CRUD
│   ├── tools/index.vue      # 工具箱 (40+ 工具, 5 分类)
│   └── login.vue / register.vue
├── public/wallpapers/       # 52 张壁纸 (01.jpg - 52.png, <5MB each)
├── server/
│   ├── api/wallpapers.get.ts          # 壁纸列表 API
│   ├── api/stats/index.get.ts         # 站点统计 + 热门文档
│   ├── api/docs/tree.get.ts           # 文档树
│   ├── api/docs/[...path].get.ts      # 文档详情
│   ├── api/auth/                      # 登录注册
│   ├── api/notes/                     # 笔记 CRUD
│   ├── api/categories/                # 分类 CRUD
│   ├── api/comments/                   # 评论
│   ├── middleware/                    # 速率限制 + 请求日志
│   ├── migrations/schema.ts           # 数据库 schema
│   ├── seed/                          # 管理员 + 分类种子
│   └── utils/response.ts             # 统一响应工具
├── stores/settings.ts        # Pinia 设置 store
├── data/knowledge.db         # SQLite 数据库 (运行时生成)
└── nuxt.config.ts            # routeRules HTTP 缓存
```

## 🎨 主题与壁纸

### 三套主题 (CSS 变量)

| 主题 | data-theme | 效果 |
|------|-----------|------|
| 和纸 (默认) | `washi` | 米白 #faf8f5 + 粉紫樱花渐变 |
| 浅色 | `light` | 纯白 #ffffff + 极简配色 |
| 深色 | `dark` | 深蓝 #1a1a2e + 夜樱花 |

### 壁纸规范

- **位置**：`public/wallpapers/`
- **命名**：两位数字 (01-52)，jpg/png 均可
- **大小**：≤ 5MB（sharp CLI 压缩）
- **分辨率**：推荐 ≥ 1920×1080
- **加载**：设置页默认渲染 16 张，点"加载更多"翻页

## 🌐 缓存策略 (nuxt.config routeRules)

```ts
routeRules: {
  '/wallpapers/**':   { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  '/_nuxt/**':        { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  '/api/wallpapers':  { swr: true, headers: { 'Cache-Control': 'public, max-age=300' } },
}
```

## 🧪 测试

```bash
npm run test       # Vitest 单元测试
```

测试覆盖：响应格式 (14) · Markdown XSS 防护 (14) · 数据库 schema (14)

## 🔒 生产安全

```bash
JWT_SECRET=your-production-secret
npm run build
```

生产构建强制校验 JWT_SECRET，缺失则抛 fatal error。

## 📦 部署

```bash
npm run build
npm run preview
# 或用 pm2 守护
pm2 start .output/server/index.mjs --name gaku-no-niwa
```

## 📜 License

MIT — 仅供个人学习使用。
