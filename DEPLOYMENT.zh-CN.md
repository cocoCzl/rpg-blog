# 离线 Docker 部署

在本地完成配置和写作，再上传一个与服务器架构匹配的部署包。服务器不需要 Git、Node.js、npm 或镜像仓库访问。

## 条件

- 本地：Node.js `>=22.12.0`、Docker Engine/Desktop 和 Docker Buildx。
- 服务器：Ubuntu/Debian、Docker Engine 和 Compose 插件。
- 域名已经解析到服务器，并开放 TCP 80、443 端口。

## 生成部署包

运行 `npm run setup` 时填入最终地址，例如 `https://blog.example.com`。然后运行：

```bash
npm run doctor -- --deploy --platform linux/amd64
npm run package:deploy -- --platform linux/amd64
```

ARM 服务器改用 `linux/arm64`。省略 `--platform` 时默认是 `linux/amd64`，生成的文件名会包含架构。

压缩包包含博客和 Caddy 镜像、Compose/Caddy 配置、平台清单、SHA-256 校验和安装脚本。

## 安装或更新

```bash
tar -xzf rpg-blog-*-amd64.tar.gz
cd rpg-blog-*-amd64
sudo ./install.sh
```

安装脚本会拒绝损坏文件和错误 CPU 架构，离线加载镜像，等待博客健康，并在更新时保留 Caddy 证书卷。

发布新文章时，在本地重新生成相同架构的包，上传后再次运行新包中的安装脚本。

## 排错

- 架构：运行 `uname -m`；`x86_64` 对应 amd64，`aarch64` 对应 arm64。
- DNS：确认域名解析到服务器公网 IP。
- 端口：确认没有其他服务占用 80/443。
- 状态：`sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog ps`
- 日志：`sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog logs -f`
