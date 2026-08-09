# Docker 一键部署指南

`rpg-blog` 只支持 Docker 部署包。你在自己的电脑上配置和写文章，生成一个压缩包后上传服务器；服务器不需要安装 Git、Node.js 或 npm。

## 准备条件

- 本地电脑：Node.js `>=22`、Docker Desktop。
- 服务器：Ubuntu/Debian、Docker Engine 和 Docker Compose 插件。
- 一个已解析到服务器公网 IP 的域名；防火墙与云安全组放行 TCP `80`、`443`。

部署包内含博客镜像和固定版本的 Caddy 镜像。Caddy 会为你的域名自动申请并续期 HTTPS 证书，因此服务器无需访问镜像仓库，但必须能访问互联网以完成证书验证。

## 首次部署

1. 在本地初始化博客。向导中的站点地址必须填写你的最终域名，例如 `https://blog.example.com`：

```bash
npm install
npm run setup
npm run dev
```

2. 本地确认效果后创建部署包：

```bash
npm run package:deploy
```

该命令会读取 `.env` 的 `SITE_URL`，构建博客镜像，并在 `release/` 生成类似 `rpg-blog-20260807120000.tar.gz` 的文件。

3. 用宝塔、1Panel、SFTP 或其他文件上传工具把该压缩包上传到服务器。服务器解压并安装：

```bash
tar -xzf rpg-blog-*.tar.gz
cd rpg-blog-*
sudo ./install.sh
```

脚本会导入镜像并启动博客。随后访问你的域名；首次签发证书通常需要几分钟。

## 发布新文章

在本地创建文章：

```bash
npm run new:post
```

按提示填写内容后编辑生成的 Markdown 文件，运行 `npm run dev` 预览。确认后再次运行 `npm run package:deploy`，上传新压缩包，并在服务器重复执行 `sudo ./install.sh`。脚本会替换博客容器，HTTPS 证书会继续保留。

博客是静态站点，文章会打包进 Docker 镜像；它没有网页后台或在线上传文章功能。

## 常见问题

- **证书没有签发**：确认域名 A/AAAA 记录已指向该服务器，且 `80/443` 未被其他服务占用。
- **端口被占用**：关闭或迁移已有的 Nginx、Apache、宝塔网站服务或其他反向代理后再部署。Caddy 需要独占 `80/443`。
- **查看状态**：运行 `sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog ps`。
- **查看日志**：运行 `sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog logs -f`。
