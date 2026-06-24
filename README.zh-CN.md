# RPG Blog

[English](./README.md) | 中文

一个基于 Astro + Vue 3 的 SSR 博客模板，支持：

- Markdown 文章
- RSS、Sitemap、OG 图
- 管理员登录和评论审核
- 可选 GitHub OAuth 评论
- 可选 RPG 风格模块
- Docker / Render / Fly.io / 普通 Node 部署

这个项目是 SSR 模板，不是纯静态站点。评论、登录、上传和 SQLite 都需要 Node 服务运行时，所以不适合直接部署到 GitHub Pages。

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

打开：

```text
http://localhost:4321
```

## 初始化能力

`npm run setup` 会帮你处理这些事情：

- 选择模板档位：`plain` / `comments` / `rpg` / `manual`
- 选择是否保留示例文章
- 生成管理员账号和会话密钥
- 写入 `site.config.ts`
- 写入 `.env`
- 输出下一步检查清单

如果你把 `locale` 设成 `zh`，并且在 setup 里选择替换示例内容，生成的 starter post 也会是中文。

更短的定制路径见：[CUSTOMIZATION.md](./CUSTOMIZATION.md)。

## 配置重点

主要看 [site.config.ts](./site.config.ts)：

- `title`
- `description`
- `home.intro`
- `author`
- `social`
- `theme.preset`
- `features`
- `security.csp`

说明：

- `home.intro`：首页站点介绍
- `author.bio`：作者个人简介
- `author.avatar`：可留空
- 社交链接可留空，前台会自动隐藏

## 功能档位

`site.config.ts` 里的 `features` 可以控制主要模块：

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: true,
}
```

- `plain`：关闭评论、GitHub OAuth 和 RPG，只保留标准博客体验
- `comments`：保留 GitHub 登录评论和后台审核，关闭 RPG
- `rpg`：启用完整 RPG 博客体验
- `manual`：初始化时手动选择每个开关

## 示例文章是干嘛的

默认有两篇示例文章：

- `hello-world.md`：展示基础文章排版效果
- `getting-started.md`：展示教程型文章结构

它们只是模板演示内容，不是必须保留的正式页面。

## 部署

部署说明见：

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [UPGRADING.md](./UPGRADING.md)

生产环境变量参考：

- [\.env.production.example](./.env.production.example)

生产环境至少要设置：

```env
SITE_URL=https://your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_long_random_password
SESSION_SECRET=replace_with_a_long_random_session_secret
```

如果开启 GitHub 评论，还要设置：

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

GitHub OAuth 回调地址格式：

```text
https://your-domain.com/api/auth/github/callback
```

## 检查

发布前建议运行：

```bash
npm run check
npm run check:template
```

- `npm run check`：构建和单元测试
- `npm run check:template`：检查生产 URL、密钥占位符、默认站点信息和示例文章

## 贡献与范围

- 贡献说明：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 模板边界：[TEMPLATE_SCOPE.md](./TEMPLATE_SCOPE.md)
- 长期 fork 升级建议：[UPGRADING.md](./UPGRADING.md)
