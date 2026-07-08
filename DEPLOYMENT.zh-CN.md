# 部署指南

`rpg-blog` 会构建成静态文件。生产环境不需要运行 Node 开发服务器，也不需要在服务器上跑 `npm run dev`。构建后的 `dist/` 可以由 Nginx、静态托管平台、对象存储，或者 Docker 镜像里的 Nginx 提供服务。

构建生产版本前，请设置 `SITE_URL` 为你的线上地址。它会用于 canonical URL、RSS 链接、sitemap 和 Open Graph 元数据。

## 先选部署方式

常见方式有三种：

- 本地定制后直接部署静态文件：服务器只需要 Nginx 或其他静态文件服务。
- 本地定制后打 Docker 镜像：服务器只需要 Docker/Compose，不需要 Git、Node 或 npm。
- 服务器拉取代码后在服务器定制：服务器需要 Git、Node/npm，并可选择 Docker 或 Nginx 静态部署。

`docker-compose.yml` 用于“有源码时构建镜像”。`docker-compose.prod.yml` 用于“服务器已有镜像，只负责运行”。

## 方式一：本地定制后部署静态文件

这种方式适合你在本地完成所有定制，然后只把构建产物上传到服务器。

本地准备并构建：

```bash
npm install
npm run setup
SITE_URL=https://blog.example.com npm run build
```

没有域名、只是用服务器 IP 试跑时，可以先用：

```bash
SITE_URL=http://SERVER_IP npm run build
```

上传 `dist/` 到服务器：

```bash
rsync -av --delete dist/ user@SERVER_IP:/var/www/rpg-blog/
```

最小 Nginx server block：

```nginx
server {
  listen 80;
  server_name blog.example.com;

  root /var/www/rpg-blog;
  index index.html;

  location / {
    try_files $uri $uri/ /404.html;
  }
}
```

更新 Nginx 配置后：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

更新文章或配置时，在本地重新 `npm run build`，再重新上传 `dist/`。

## 方式二：本地打 Docker 镜像后上传服务器

这种方式适合你在本地完成定制和镜像构建，服务器只负责运行镜像。

本地构建生产镜像：

```bash
docker build --build-arg SITE_URL=https://blog.example.com -t my-rpg-blog:latest .
```

本地试跑镜像：

```bash
docker run --rm -p 8080:80 my-rpg-blog:latest
```

打开：

```text
http://localhost:8080
```

注意：这个镜像可以在本地和服务器都跑，但 RSS、sitemap、canonical、分享卡片等元数据会固定为构建时的 `SITE_URL`。

导出镜像：

```bash
docker save my-rpg-blog:latest -o my-rpg-blog.tar
```

上传镜像和生产 Compose 文件到服务器：

```bash
ssh user@SERVER_IP "mkdir -p /opt/rpg-blog"
scp my-rpg-blog.tar docker-compose.prod.yml user@SERVER_IP:/opt/rpg-blog/
```

在服务器导入镜像：

```bash
docker load -i /opt/rpg-blog/my-rpg-blog.tar
```

启动容器：

```bash
docker compose -f /opt/rpg-blog/docker-compose.prod.yml up -d
```

默认 `docker-compose.prod.yml` 使用 `80:80`。如果服务器 80 端口被占用，先把端口改成例如：

```yaml
ports:
  - "4321:80"
```

然后访问：

```text
http://SERVER_IP:4321
```

更新文章或配置时，在本地重新构建镜像、`docker save`、上传、`docker load`，再执行：

```bash
docker compose -f /opt/rpg-blog/docker-compose.prod.yml up -d
```

## 方式三：服务器拉代码后定制和部署

这种方式适合你想直接在服务器上修改配置、写文章或构建。服务器需要安装 Git、Node.js `>=22`、npm，以及可选的 Docker。

在服务器拉取你的仓库：

```bash
git clone https://github.com/YOUR_NAME/YOUR_BLOG_REPO.git
cd YOUR_BLOG_REPO
```

在服务器定制博客：

```bash
npm install
npm run setup
```

### 方式三 A：服务器源码构建 Docker 镜像

```bash
SITE_URL=https://blog.example.com docker compose up -d --build
```

当前 `docker-compose.yml` 默认端口映射是 `4321:80`，也就是容器内 Nginx 监听 80，服务器对外暴露 4321。

试跑访问：

```text
http://SERVER_IP:4321
```

如果要正式使用 80 端口，把 `docker-compose.yml` 里的端口映射从：

```yaml
ports:
  - "4321:80"
```

改为：

```yaml
ports:
  - "80:80"
```

然后重新启动：

```bash
SITE_URL=https://blog.example.com docker compose up -d --build
```

### 方式三 B：服务器构建静态文件并交给 Nginx

```bash
SITE_URL=https://blog.example.com npm run build
sudo rsync -av --delete dist/ /var/www/rpg-blog/
```

Nginx 配置可使用方式一里的 server block。

## 静态托管平台

构建后的 `dist/` 也可以部署到常见静态平台：

- GitHub Pages
- Cloudflare Pages
- Vercel static output
- Netlify
- 对象存储静态站点
- 任意 Nginx 静态文件服务

构建命令：

```bash
npm run build
```

发布目录：

```text
dist
```

平台环境变量里建议设置：

```text
SITE_URL=https://blog.example.com
```

## HTTPS

HTTPS 可以放到同一台服务器上的 Nginx、Caddy、证书管理工具、云厂商面板或 CDN 里配置。这个模板本身只负责生成静态站点或 Docker 镜像，不直接签发证书。

## 发布前检查

发布前运行：

```bash
npm run check
npm run check:template
```

构建后可以再跑视觉冒烟检查：

```bash
npm run test:visual
```
