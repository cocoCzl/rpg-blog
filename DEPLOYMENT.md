# Deployment

`rpg-blog` builds to static files. Production does not need a Node server.

## Static Build

```bash
npm install
npm run build
```

Upload `dist/` to any static host.

Set `SITE_URL` before building when you want production canonical URLs, RSS links, sitemap entries, and Open Graph metadata:

```bash
SITE_URL=https://example.com npm run build
```

## Docker

The Docker image builds the Astro site and serves `dist/` with Nginx.

```bash
docker compose up --build
```

Open <http://localhost:4321/>.

For a plain Docker build:

```bash
docker build -t my-rpg-blog .
docker run --rm -p 4321:80 my-rpg-blog
```

## Static Hosts

The generated `dist/` folder works on common static platforms:

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
