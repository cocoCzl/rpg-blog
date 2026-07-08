# rpg-blog

一个基于 Astro 的静态优先像素 JRPG 公会手札博客模板。默认首页像 RPG 存档板菜单：指令菜单、角色档案槽、任务板置顶手札、最近存档、章节、线索、角色档案和可选的道具栏工具箱。

它适合想让个人博客在 GitHub 上有明显视觉记忆点，同时仍然保持静态部署简单性的使用者。

## 亮点

- JRPG 公会菜单首页，而不是普通博客 hero
- Save Board 布局：Command Menu、Character Slot、Quest Board、Save Slots
- 暗色像素 RPG 菜单配色，背景只负责公会氛围
- 使用手札条目、章节、线索、角色档案、道具栏工具箱等公开语言
- 中文和英文 UI chrome
- Astro Content Collections 管理 Markdown/MDX 内容
- RSS、sitemap、robots.txt、Open Graph、静态构建、Docker、Nginx 支持
- 接入 React 与 Pxlkit，用于像素图标渲染

## 快速开始

需要 Node.js `>=22`。

```bash
npm install
npm run dev
```

打开 `http://localhost:4321`。

## 通过模板创建自己的博客

1. 在 GitHub 点击 **Use this template** 创建你自己的仓库，或者手动 fork 后 clone。
2. clone 你的仓库并进入项目目录。
3. 安装依赖：

```bash
npm install
```

4. 运行初始化向导，把默认公会信息替换成你的博客信息：

```bash
npm run setup
```

也可以使用非交互式初始化：

```bash
npm run setup -- --yes --titleZh "我的博客" --titleEn "My Blog" --content starter
```

5. 启动本地开发服务器：

```bash
npm run dev
```

打开 `http://localhost:4321`，检查首页、角色档案、章节、线索和手札条目。

## Guild Setup Wizard

```bash
npm run setup -- --yes --titleZh "企鹅工会" --titleEn "Penguin Guild" --content starter
```

向导会配置站点名称、角色档案、默认语言、头像、社交链接、道具栏工具箱显示状态和起始手札内容。它会更新 `site.config.ts`，创建或更新 `.env`，并且可以处理 `src/content/posts/` 里的文章文件。

内容模式：

- `keep`：保留现有手札条目。
- `starter`：清空现有条目，并为你的博客创建一篇起始手札。
- `clear`：移除现有条目，让博客保持空内容状态。

## 写第一篇文章

把 Markdown 或 MDX 文件放到 `src/content/posts/`。

```md
---
title: "我的第一篇手札"
date: 2026-03-21
summary: "显示在存档板上的简短摘要。"
tags: ["写作", "记录"]
category: "启程"
featured: true
draft: false
---

在这里写正文。
```

支持的 frontmatter 字段包括 `title`、`date`、`updated`、`summary`、`tags`、`category`、`cover`、`draft` 和 `featured`。

## 个性化配置

大部分个人设置都在 `site.config.ts`：站点 URL、中英文标题、描述、作者名称、头像、简介、社交链接、默认语言、首页焦点内容、道具栏工具箱、背景图、氛围效果和导航显示状态。

完整配置说明见 [CUSTOMIZATION.md](./CUSTOMIZATION.md)。

## 构建与部署

构建静态文件到 `dist/`：

```bash
SITE_URL=https://example.com npm run build
```

非 Docker 远程服务器部署时，把 `dist/` 上传到服务器，并用 Nginx 或其他静态文件服务托管。

Docker 部署时，用生产域名构建镜像，然后在服务器上运行：

```bash
docker build --build-arg SITE_URL=https://example.com -t my-rpg-blog .
docker run -d --name rpg-blog --restart unless-stopped -p 80:80 my-rpg-blog
```

也支持 GitHub Pages、Netlify、Vercel static output、Cloudflare Pages 和对象存储等静态平台。远程 Docker 和非 Docker 部署细节见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 后续同步模板更新

你的个人内容通常在 `site.config.ts`、`src/content/posts/`、`public/images/` 和 `.env`。后续拉取模板更新时，把这些文件视为用户自有内容。

推荐更新流程见 [UPGRADING.md](./UPGRADING.md)。

## 模板边界

这是一个带 RPG 风格界面包装的静态博客模板。它不提供可玩 RPG 机制、可控制角色、战斗、账号、评论、数据库或后端游戏状态。

## 检查

```bash
npm run build
npm test
npm run check:template
npm run test:visual
```

`check:template` 会保护 JRPG Guild Menu 范围，拒绝旧视觉方向重新出现在公开源码和文档里。
