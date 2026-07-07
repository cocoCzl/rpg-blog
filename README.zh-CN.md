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

```bash
npm install
npm run dev
```

打开 `http://localhost:4321`。

## Guild Setup Wizard

```bash
npm run setup -- --yes --titleZh "企鹅工会" --titleEn "Penguin Guild" --content starter
```

向导会配置站点名称、角色档案、默认语言、头像、社交链接、道具栏工具箱显示状态和起始手札内容。

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
