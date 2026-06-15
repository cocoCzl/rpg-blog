# RPG Blog

[English](./README.md) | 中文

一个基于 Astro 的博客模板，支持：

- Markdown 文章
- RSS、Sitemap、OG 图
- 管理员登录和评论审核
- 可选 GitHub OAuth 评论
- 可选 RPG 风格模块
- Docker / Render / Fly.io / 普通 Node 部署

这个项目是 SSR 模板，不是纯静态站点。

## 快速开始

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

## 贡献与范围

- 贡献说明：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 模板边界：[TEMPLATE_SCOPE.md](./TEMPLATE_SCOPE.md)
