# 个性化配置

你主要通过 `site.config.ts`、Markdown/MDX 手札条目和可选静态资源来个性化 `rpg-blog`。

`display.showAbout`、`showTags` 和 `showArchive` 会隐藏导航与首页入口，但对应静态 URL 仍然可访问。`postsPerPage` 控制归档分页，必须是正整数。

语言按钮会切换界面标签、站点身份和作者字段；手札正文、自定义近况/工具箱、RSS 与 SEO 使用配置的默认语言。

## 站点身份

编辑这些字段：

- `title`：中英文 UI 中显示的站点名称
- `description`：公开站点简介
- `author.name`：角色档案显示名称
- `author.avatar`：可选头像路径
- `author.bio`：角色档案槽和个人档案简介
- `social`：在指令界面中展示的链接

## 公会主题

当前高完成度版本提供一个默认主题：

```ts
theme: {
  preset: 'guild',
  backgroundImage: '',
  effects: ['embers', 'mist'],
}
```

`backgroundImage` 是可选项。内置公会氛围背景位于 `public/images/scenes/guild-hall.svg`。

支持的氛围效果：

- `embers`
- `mist`
- `stars`

## 内容语言

公开 UI 标签使用 JRPG 公会手札语汇：

- Posts 是手札条目
- Categories 是章节
- Tags 是线索
- About 是角色档案
- Toolbox 是道具栏工具箱
- Featured 是任务板
- Latest 是最近存档 / 存档槽

UI 可以在中文和英文标签之间切换，但每篇手札正文是单语言内容。你希望发布什么语言，就直接用什么语言写文章。

## 道具栏工具箱

通过 `display.showToolbox` 控制可选的道具栏工具箱是否显示。工具箱条目可以代表项目、资源、链接或工具，但不要暗示真实游戏中的可玩背包状态。

每个 `home.toolbox` 条目支持 `title`、`detail` 和可选的 `href`。有 `href` 时会显示为可点击链接；没有 `href` 时会显示为紧凑说明条目。
