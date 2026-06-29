# RPG Blog

[English](./README.md) | 中文

一个基于 Astro + Vue 3 的 SSR 博客模板，带 RPG 风格展示、管理员审核、GitHub OAuth 评论、SQLite 持久化和 Docker 部署能力。

这个项目是 SSR 模板，不是纯静态导出。它适合想要 fork 仓库、定制内容和主题，然后部署到支持 Node 的平台上的用户。

## 你会得到什么

- 带 frontmatter 校验的 Markdown 文章
- RSS、sitemap、robots.txt 和 OG 图片生成
- 管理员登录和评论审核
- 可选的 GitHub OAuth 读者评论
- RPG 面板、任务、装备、技能和状态效果
- 支持持久化 SQLite 和上传目录的 Docker 部署
- 单元测试、集成测试和 GitHub Actions CI

## Fork 前须知

- 本项目使用 `@astrojs/node`，运行在 SSR 模式。
- `GitHub Pages` 不适合这个模板，因为评论、认证、上传和 SQLite 都需要服务端运行时。
- 推荐部署目标：VPS + Docker、Railway、Render、Fly.io，或任何带持久化磁盘的 Node 托管平台。

## 快速开始

如果你要基于它创建自己的博客，推荐先在 GitHub 页面点击 **Use this template**。直接 clone 也可以：

```bash
git clone https://github.com/YOUR_USERNAME/rpg-blog.git my-blog
cd my-blog
npm install
cp .env.example .env
npm run setup
npm run dev
```

打开 `http://localhost:4321`。

`npm run setup` 会把站点标题、作者信息、站点 URL、主题预设、功能开关、管理员凭据和生成的 session secret 写入 `site.config.ts` 和 `.env`。
它会先让你选择模板档位：`plain`、`comments`、`rpg` 或 `manual`，然后选择初始内容：保留示例文章，或替换成一篇适合你站点的 starter post。
最后，它会按所选档位输出本地检查、OAuth 设置、内容清理、测试和部署的下一步清单。
社交资料可以留空，空链接会在前台自动隐藏。
作者头像也可以留空，作者区域会回退到纯文本布局。

如果你把 `locale` 设成 `zh`，并且在 setup 里选择替换示例内容，生成的 starter post 也会是中文。

更短的定制路径见：[CUSTOMIZATION.md](./CUSTOMIZATION.md)。

## 配置

### `site.config.ts`

模板级定制主要看 [site.config.ts](./site.config.ts)：

- `title`、`description`、`author`
- `home.intro`
- `social`
- `theme.preset`
- `locale`
- `postsPerPage`
- `features`
- `security.csp`

`locale` 是站点级语言设置。当前模板不会生成并行的 `/en/...` 和 `/zh/...` 路由树。

`home.intro` 是普通博客首页使用的站点介绍。建议把它和 `author.bio` 区分开，后者更适合作为作者个人简介。

`features` 可以在不删除代码的情况下关闭主要模块：

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: true,
}
```

- `comments: false`：隐藏评论 UI，并禁用评论 API 和后台审核
- `githubOAuth: false`：禁用读者 GitHub 登录
- `rpg: false`：移除 RPG 导航入口，并禁用 `/rpg` 和 `/api/rpg`

当 `rpg: false` 时，布局也会跳过樱花、极光等 RPG 氛围效果，默认呈现会更接近标准博客。

`security.csp` 用来在添加外部资源时扩展严格的默认 CSP：

```ts
security: {
  csp: {
    imgSrc: ['https://images.example.com'],
    scriptSrc: ['https://plausible.io'],
    connectSrc: ['https://plausible.io'],
  },
}
```

### `.env`

生产环境必填：

```env
SITE_URL=https://your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_long_random_password
SESSION_SECRET=replace_with_a_long_random_session_secret
```

可选：

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SQLITE_PATH=./data/rpg-blog.db
UPLOAD_PATH=./data/uploads
UPLOAD_URL_BASE=/uploads
```

如果生产环境缺少管理员凭据，或仍然使用不安全默认值，启动会直接失败。

部署时请以 [.env.production.example](./.env.production.example) 为生产配置参考，不要直接复用本地开发默认值。

## 内容写作

在 `src/content/posts/` 中创建文章：

```md
---
title: "My First Post"
date: 2026-06-15
updated: 2026-06-16
tags: ["astro", "blog"]
category: "Engineering"
summary: "Short preview text"
cover: "/uploads/cover.webp"
draft: false
featured: true
canonicalUrl: "https://your-domain.com/posts/my-first-post"
---

Post body here.
```

支持的 frontmatter 字段：

- `title`
- `date`
- `updated`
- `tags`
- `category`
- `summary`
- `cover`
- `draft`
- `featured`
- `canonicalUrl`

带 `draft: true` 的文章会从首页、分页、RSS、sitemap 和预渲染文章路由中排除。

默认有两篇示例文章：

- `hello-world.md`：展示基础文章排版效果
- `getting-started.md`：展示教程型文章结构

它们只是模板演示内容，不是必须保留的正式页面。

## RPG 定制

编辑 `data/rpg/`：

- `skills.ts`
- `equipment.ts`
- `titles.ts`
- `quests.ts`
- `status-effects.ts`

这些数据保留为 TypeScript，方便模板使用者扩展，不需要额外引入 CMS。

## 评论和认证

管理员认证使用 `.env` 中的本地凭据。

如果设置了以下环境变量，读者评论会使用 GitHub OAuth：

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

在 <https://github.com/settings/developers> 创建 OAuth App。

- Homepage URL：你的公开站点 URL
- Callback URL：`https://your-domain.com/api/auth/github/callback`

如果没有配置 GitHub OAuth，读者登录按钮会隐藏，评论提交也不可用。

## 模板档位

大多数 fork 这个仓库的用户不需要一开始就重做整个系统。建议先选一个档位，再在此基础上定制。

### 普通博客

适合只需要文章、分页、RSS、sitemap、上传和小型后台的场景。

```ts
features: {
  comments: false,
  githubOAuth: false,
  rpg: false,
}
```

推荐环境变量：

```env
SITE_URL=https://your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_long_random_password
SESSION_SECRET=replace_with_a_long_random_session_secret
```

自动变化：

- 移除 RPG 导航入口
- 禁用 `/rpg` 和 `/api/rpg`
- 禁用评论 UI 和审核端点
- 布局跳过 RPG 氛围效果
- 首页切换为更标准的博客呈现，包含站点说明、标签和近期文章
- `npm run setup` 选择 `plain` 档位即可直接生成

### 带评论的博客

适合想要标准博客和读者讨论，但不需要 RPG 模块的场景。

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: false,
}
```

额外必填环境变量：

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

这会保留博客优先的呈现，同时启用 GitHub 评论登录和后台审核。
- `npm run setup` 选择 `comments` 档位即可直接生成

### 完整 RPG 博客

适合想要原始模板体验的场景：博客文章、评论和 RPG 面板全部启用。

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: true,
}
```

必填环境变量：

- 基础生产环境变量
- GitHub OAuth 环境变量

然后按你自己的世界观、机制和写作风格定制 `data/rpg/` 和 `site.config.ts`。
- `npm run setup` 默认使用这个档位

### 自定义前端时

模板定制者可以依赖稳定的 API 错误码，例如 `FORBIDDEN`、`LOGIN_REQUIRED`、`COMMENTS_DISABLED`、`GITHUB_COMMENTS_DISABLED` 和 `RPG_DISABLED`。这样你替换默认 Vue 组件时，不需要解析本地化错误字符串。

## 部署

部署说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

其中记录了这些路径：

- Docker Compose
- 普通 Node 托管
- Render
- Fly.io

上传文件通过 `/uploads/*` 提供访问，本地开发也默认使用 `./data/uploads`，这样用户内容会和源码里的模板资产分开。

生产环境变量参考：

- [.env.production.example](./.env.production.example)

## 升级

如果你把自己的站点作为长期 fork 维护，拉取新版模板变更时请参考 [UPGRADING.md](./UPGRADING.md)。

## 贡献

模板贡献说明见 [CONTRIBUTING.md](./CONTRIBUTING.md)，项目边界见 [TEMPLATE_SCOPE.md](./TEMPLATE_SCOPE.md)。

## 测试

发布前建议运行：

```bash
npm run check
npm test
npm run test:integration
npm run test:all
npm run check:template
```

- `npm run check`：构建和快速单元测试
- `npm test`：快速单元测试
- `npm run test:integration`：自动启动 Astro dev server，然后运行 HTTP 层集成测试
- `npm run test:all`：同时运行单元测试和集成测试
- `npm run check:template`：发布前检查占位符、示例文章和生产配置

## CI

GitHub Actions 位于 [.github/workflows/ci.yml](./.github/workflows/ci.yml)，会运行：

- `npm run build`
- `npm test`
- `npm run test:integration`

## 项目结构

```text
.
├── data/rpg/
├── public/
├── scripts/
├── src/
│   ├── content/posts/
│   ├── components/vue/
│   ├── layouts/
│   ├── lib/
│   └── pages/
├── .github/workflows/ci.yml
├── DEPLOYMENT.md
├── CONTRIBUTING.md
├── TEMPLATE_SCOPE.md
├── UPGRADING.md
├── docker-compose.yml
├── Dockerfile
├── site.config.ts
├── .env.example
└── .env.production.example
```

## License

MIT。见 [LICENSE](./LICENSE)。
