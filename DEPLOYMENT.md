# Deployment Guide

This template runs in Astro SSR mode with a Node server. It needs:

- a persistent database path
- a persistent upload path
- production secrets for admin auth and sessions

Use [.env.production.example](./.env.production.example) as the production reference.

## Required production variables

Set these everywhere:

```env
SITE_URL=https://your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_long_random_password
SESSION_SECRET=replace_with_a_long_random_session_secret
```

Optional for reader comments:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Docker Compose

1. Copy `.env.production.example` into your deployment secret store or server env file.
2. Set `SITE_URL`, admin credentials, and `SESSION_SECRET`.
3. On the server, run:

```bash
docker compose up -d --build
```

4. Persisted data lives in the named volume mounted at `/app/storage`.
5. The app serves uploads at `/uploads/*`.

Relevant files:

- [docker-compose.yml](./docker-compose.yml)
- [Dockerfile](./Dockerfile)

## Plain Node Host

Use this for a VM, VPS, or process manager such as `systemd`, `pm2`, or `supervisord`.

1. Install dependencies:

```bash
npm install
```

2. Export production env vars.
3. Build:

```bash
npm run build
```

4. Start the server:

```bash
node dist/server/entry.mjs
```

5. Reverse-proxy to the app port from Nginx, Caddy, or your platform router.

Recommended persistent paths:

```env
SQLITE_PATH=/var/lib/rpg-blog/rpg-blog.db
UPLOAD_PATH=/var/lib/rpg-blog/uploads
UPLOAD_URL_BASE=/uploads
```

## Render

This repo includes [render.yaml](./render.yaml).

1. Create a new Render web service from the repo.
2. Render will detect `render.yaml`.
3. Set secret values for:

- `SITE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

4. Render mounts a persistent disk at `/app/storage`.
5. Deploy.

## Fly.io

This repo includes [fly.toml](./fly.toml).

1. Create the app:

```bash
fly launch --no-deploy
```

2. Set secrets:

```bash
fly secrets set SITE_URL=https://your-domain.com
fly secrets set ADMIN_USERNAME=your_admin_username
fly secrets set ADMIN_PASSWORD=replace_with_a_long_random_password
fly secrets set SESSION_SECRET=replace_with_a_long_random_session_secret
```

3. If comments are enabled, also set:

```bash
fly secrets set GITHUB_CLIENT_ID=...
fly secrets set GITHUB_CLIENT_SECRET=...
```

4. Deploy:

```bash
fly deploy
```

5. Persistent data is mounted at `/data`.

## Pre-deploy checks

Run these before shipping:

```bash
npm test
npm run build
```

`npm run test:integration` is also useful when your environment allows local port binding.
