# Deployment

`rpg-blog` builds to static files. Production does not need a Node server; the generated `dist/` folder can be served by Nginx, a static host, object storage, or the included Docker image.

Set `SITE_URL` to your production URL before building. It is used for canonical URLs, RSS links, sitemap entries, and Open Graph metadata.

## Remote Server With Docker

Docker is the recommended path for a Linux VPS because the image builds the Astro site and serves the generated files with Nginx.

### Option A: Build On The Server

On your server:

```bash
git clone https://github.com/YOUR_NAME/YOUR_BLOG_REPO.git
cd YOUR_BLOG_REPO
```

Customize the blog if you have not already done it:

```bash
npm install
npm run setup -- --siteUrl "https://blog.example.com"
```

Build and start the container:

```bash
SITE_URL=https://blog.example.com docker compose up -d --build
```

The default compose file maps the site to `http://SERVER_IP:4321`. To serve directly on port `80`, change the port mapping to `"80:80"` or run a plain container:

```bash
docker build --build-arg SITE_URL=https://blog.example.com -t my-rpg-blog .
docker run -d --name rpg-blog --restart unless-stopped -p 80:80 my-rpg-blog
```

### Option B: Build Locally And Pull On The Server

Build and push the image from your local machine or CI:

```bash
docker build --build-arg SITE_URL=https://blog.example.com -t ghcr.io/YOUR_NAME/my-rpg-blog:latest .
docker push ghcr.io/YOUR_NAME/my-rpg-blog:latest
```

On the server:

```bash
docker pull ghcr.io/YOUR_NAME/my-rpg-blog:latest
docker run -d --name rpg-blog --restart unless-stopped -p 80:80 ghcr.io/YOUR_NAME/my-rpg-blog:latest
```

When you publish new posts or change config, rebuild the image and restart the container.

## Remote Server Without Docker

Use this path when you want to serve static files directly with an existing Nginx setup.

Build locally or in CI:

```bash
npm install
SITE_URL=https://blog.example.com npm run build
```

Upload `dist/` to the server:

```bash
rsync -av --delete dist/ user@SERVER_IP:/var/www/rpg-blog/
```

Minimal Nginx server block:

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

After updating the Nginx config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

For HTTPS, put the same static site behind your normal TLS setup, reverse proxy, CDN, or certificate manager.

## Static Platforms

The generated `dist/` folder also works on common static platforms:

- Netlify
- Vercel static output
- Cloudflare Pages
- GitHub Pages
- any Nginx or object-storage static site

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

## Smoke Checks

Before publishing:

```bash
npm run check
npm run check:template
```

After building:

```bash
npm run test:visual
```
