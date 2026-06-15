---
title: "博客模板快速开始"
date: 2026-02-15
locale: "zh"
baseSlug: "getting-started"
tags: ["教程", "模板"]
cover: ""
summary: "了解如何设置和定制这个博客模板。"
---

## 快速开始

Fork 这个模板之后，通常需要完成下面几步。

### 1. 配置站点

编辑 `site.config.ts`，设置博客标题、作者信息、默认语言和主题预设。

### 2. 配置认证

复制 `.env.example` 为 `.env`，然后填入需要的凭据：

- `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 用于管理员登录
- `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 用于读者 GitHub 登录
- `SESSION_SECRET` 用于签名会话

### 3. 撰写文章

在 `src/content/posts/` 中添加 `.md` 文件，并写入 frontmatter：

```yaml
---
title: "我的文章"
date: 2026-06-01
tags: ["标签1", "标签2"]
summary: "一段简短摘要"
---
```

### 4. 部署

```bash
docker compose up -d
```

你的博客会运行在 `http://your-server:4321`。

## 定制 RPG 数据

编辑 `data/rpg/` 里的 TypeScript 文件，就可以定制技能、装备、称号和任务。
