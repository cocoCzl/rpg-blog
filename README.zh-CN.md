# rpg-blog

一个基于 Astro、Markdown 和离线 Docker 部署的静态优先像素 JRPG 个人博客模板。

[English](./README.md) · [个性化](./CUSTOMIZATION.zh-CN.md) · [部署](./DEPLOYMENT.zh-CN.md) · [后续升级](./UPGRADING.md)

## 特色

- 公会菜单式首页：任务板、最近存档、章节、线索和角色档案
- Markdown/MDX、草稿、置顶、RSS、sitemap 和每篇文章独立的 Open Graph 图片
- 中英文界面标签；文章与 SEO 使用配置的默认语言
- 初始化与发文向导，并安全处理已有内容
- 字体完全本地化，支持系统“减少动态效果”设置
- 面向 `linux/amd64` 和 `linux/arm64` 的带校验离线 Docker 包

## 创建自己的博客

使用 GitHub 的 **Use this template**、下载源码 ZIP，或者 clone：

```bash
git clone https://github.com/cocoCzl/rpg-blog.git my-blog
cd my-blog
npm ci
npm run doctor
npm run setup
npm run dev
```

需要 Node.js `>=22.12.0`。打开 `http://localhost:4321`。

在未经修改的模板上，初始化向导默认建议把五篇演示文章替换成一篇欢迎文章；检测到自己的文章后会建议保留。选择 `starter` 或 `clear` 时，向导会先列出将被处理的文件并要求确认。

非交互式初始化必须明确指定内容模式：

```bash
npm run setup -- --yes --content starter --wizardLocale zh --titleZh "我的博客" --titleEn "My Blog"
```

## 写作与个性化

创建草稿：

```bash
npm run new:post
```

主要个人设置位于 `site.config.ts`，文章位于 `src/content/posts/`，图片放在 `public/images/`。完整说明见 [CUSTOMIZATION.zh-CN.md](./CUSTOMIZATION.zh-CN.md) 和 [USER_GUIDE.zh-CN.md](./USER_GUIDE.zh-CN.md)。

语言按钮会切换界面、站点身份和作者字段。文章正文、自定义近况/工具箱文字、canonical、RSS 和 Open Graph 使用构建时的默认语言。

## 使用 Docker 部署

在初始化时填入最终 HTTPS 域名，启动 Docker Desktop，然后按服务器 CPU 生成一个部署包：

```bash
# 大多数普通云服务器
npm run package:deploy -- --platform linux/amd64

# ARM 云服务器或树莓派
npm run package:deploy -- --platform linux/arm64
```

把 `release/` 中的压缩包上传到 Ubuntu/Debian 服务器，解压并运行 `sudo ./install.sh`。安装脚本会先验证文件校验值和 CPU 架构。服务器需要 Docker Engine、Compose 插件、开放 80/443 端口和正确 DNS；不需要 Git、Node、npm 或镜像仓库访问。

完整说明见 [DEPLOYMENT.zh-CN.md](./DEPLOYMENT.zh-CN.md)。

## 检查

```bash
npm run doctor
npm run build
npm test
npm run check:template
npm run test:visual
```

## 边界与许可

这是静态博客模板，不是 CMS 或可玩的游戏；默认不包含账号、评论、数据库、管理后台或在线编辑器。见 [TEMPLATE_SCOPE.md](./TEMPLATE_SCOPE.md)。

代码与原创美术使用 MIT 许可证，字体和依赖素材许可见 [ASSET_LICENSES.md](./ASSET_LICENSES.md)。
