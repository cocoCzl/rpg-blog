# RPG Blog

English | [中文](./README.zh-CN.md)

An Astro blog template with RPG-style presentation, admin moderation, GitHub OAuth comments, SQLite persistence, and Docker deployment.

This is an SSR template, not a static export. It is intended for users who want to fork the repo, customize content and theme, then deploy to a Node-capable host.

## What you get

- Markdown posts with frontmatter validation
- RSS, sitemap, robots.txt, and OG image generation
- Admin login and comment moderation
- Optional GitHub OAuth for reader comments
- RPG dashboard, quests, equipment, skills, and status effects
- Docker deployment with persistent SQLite and uploads
- Unit tests, integration tests, and GitHub Actions CI

## Before you fork

- This project uses `@astrojs/node` in SSR mode.
- `GitHub Pages` is not a fit because comments, auth, uploads, and SQLite require a server runtime.
- Good deployment targets: VPS + Docker, Railway, Render, Fly.io, or any Node host with persistent disk.

## Quick start

If you are creating your own blog from this template, use GitHub's **Use this template** button first. Cloning also works:

```bash
git clone https://github.com/YOUR_USERNAME/rpg-blog.git my-blog
cd my-blog
npm install
cp .env.example .env
npm run setup
npm run dev
```

Open `http://localhost:4321`.

`npm run setup` updates `site.config.ts` and `.env` with your site title, author info, URL, theme preset, feature toggles, admin credentials, and a generated session secret.
It now starts with a template profile choice: `plain`, `comments`, `rpg`, or `manual`, and a starter content choice: keep demo posts or replace them with a single starter post for your site.
At the end, it prints a profile-aware checklist for local review, OAuth setup, content cleanup, tests, and deployment.
Social profile prompts can be left blank, and empty links stay hidden in the UI.
The author avatar can also be left blank; author sections fall back to text-only layout.

For a short customization path, see [CUSTOMIZATION.md](./CUSTOMIZATION.md).

## Configuration

### `site.config.ts`

Use [site.config.ts](./site.config.ts) for template-level customization:

- `title`, `description`, `author`
- `home.intro`
- `social`
- `theme.preset`
- `locale`
- `postsPerPage`
- `features`
- `security.csp`

`locale` is a site-wide language setting. The current template does not generate parallel `/en/...` and `/zh/...` route trees.

`home.intro` is the site-level introduction used on the plain blog homepage. Keep it separate from `author.bio`, which is better treated as person-level profile text.

`features` lets you switch major modules off without deleting code:

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: true,
}
```

- `comments: false`: hides comment UI and disables comment APIs/admin moderation
- `githubOAuth: false`: disables GitHub login for readers
- `rpg: false`: removes the RPG nav entry and disables `/rpg` plus `/api/rpg`

When `rpg: false`, the layout also skips RPG-specific ambient effects such as sakura and aurora, so the default presentation reads more like a standard blog.

`security.csp` lets you extend strict defaults when you add external assets:

```ts
security: {
  csp: {
    imgSrc: ['https://images.example.com'],
    scriptSrc: ['https://plausible.io'],
    connectSrc: ['https://plausible.io'],
  },
}
```

### `.env`

Required in production:

```env
SITE_URL=https://your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_long_random_password
SESSION_SECRET=replace_with_a_long_random_session_secret
```

Optional:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SQLITE_PATH=./data/rpg-blog.db
UPLOAD_PATH=./data/uploads
UPLOAD_URL_BASE=/uploads
```

Production startup now fails if admin credentials are missing or left at unsafe defaults.

For deployment, use [.env.production.example](./.env.production.example) as the production reference instead of reusing local-development defaults blindly.

## Content authoring

Create posts in `src/content/posts/`:

```md
---
title: "My First Post"
date: 2026-06-15
updated: 2026-06-16
tags: ["astro", "blog"]
category: "Engineering"
summary: "Short preview text"
cover: "/uploads/cover.webp"
draft: false
featured: true
canonicalUrl: "https://your-domain.com/posts/my-first-post"
---

Post body here.
```

Supported frontmatter fields:

- `title`
- `date`
- `updated`
- `tags`
- `category`
- `summary`
- `cover`
- `draft`
- `featured`
- `canonicalUrl`

Posts with `draft: true` are excluded from homepage, pagination, RSS, sitemap, and prerendered article routes.

## RPG customization

Edit `data/rpg/`:

- `skills.ts`
- `equipment.ts`
- `titles.ts`
- `quests.ts`
- `status-effects.ts`

This data stays in TypeScript so template users can extend it without adding a CMS.

## Comments and auth

Admin auth works with local credentials from `.env`.

Reader comments use GitHub OAuth if these env vars are set:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

Create the OAuth app at <https://github.com/settings/developers>.

- Homepage URL: your public site URL
- Callback URL: `https://your-domain.com/api/auth/github/callback`

If GitHub OAuth is not configured, the reader login button is hidden and comment posting remains unavailable.

## Template profiles

Most users forking this repo do not want to redesign the whole system first. Start from one of these profiles and customize from there.

### Plain blog

Use this when you only want articles, pagination, RSS, sitemap, uploads, and a small admin backend.

```ts
features: {
  comments: false,
  githubOAuth: false,
  rpg: false,
}
```

Recommended env:

```env
SITE_URL=https://your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=replace_with_a_long_random_password
SESSION_SECRET=replace_with_a_long_random_session_secret
```

What changes automatically:

- RPG nav entry is removed
- `/rpg` and `/api/rpg` are disabled
- Comment UI and moderation endpoints are disabled
- The layout skips RPG ambient effects
- The homepage switches to a more standard blog presentation with site notes, tags, and recent posts
- `npm run setup` can generate this directly by choosing the `plain` profile

### Comment-enabled blog

Use this when you want a standard blog with reader discussion, but no RPG module.

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: false,
}
```

Required env additions:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

This keeps the blog-first presentation while enabling GitHub comment login and moderation.
- `npm run setup` can generate this directly by choosing the `comments` profile

### Full RPG blog

Use this when you want the original template experience with blog posts, comments, and the RPG dashboard.

```ts
features: {
  comments: true,
  githubOAuth: true,
  rpg: true,
}
```

Required env:

- base production env
- GitHub OAuth env

Then customize `data/rpg/` and `site.config.ts` to fit your own world, mechanics, and writing style.
- `npm run setup` uses this as the default profile

### For custom frontend changes

Template customizers can rely on stable API error codes such as `FORBIDDEN`, `LOGIN_REQUIRED`, `COMMENTS_DISABLED`, `GITHUB_COMMENTS_DISABLED`, and `RPG_DISABLED`. This makes it easier to replace the default Vue components with your own UI without parsing localized error strings.

## Deploy

Deployment instructions live in [DEPLOYMENT.md](./DEPLOYMENT.md).

Supported paths documented there:

- Docker Compose
- Plain Node host
- Render
- Fly.io

Uploads are served at `/uploads/*`, and local development also defaults to `./data/uploads` so user content stays outside source-controlled template assets.

## Upgrading

If you keep your site as a long-lived fork, use [UPGRADING.md](./UPGRADING.md) when pulling in newer template changes.

## Contributing

Template contribution expectations live in [CONTRIBUTING.md](./CONTRIBUTING.md), and the intended product boundary lives in [TEMPLATE_SCOPE.md](./TEMPLATE_SCOPE.md).

## Tests

```bash
npm run check
npm test
npm run test:integration
npm run test:all
npm run check:template
```

- `npm run check`: build plus fast unit coverage
- `npm test`: fast unit coverage
- `npm run test:integration`: starts the Astro dev server automatically, then runs HTTP-level tests
- `npm run test:all`: both
- `npm run check:template`: pre-publish checks for placeholders, demo posts, and production config

## CI

GitHub Actions lives at [.github/workflows/ci.yml](./.github/workflows/ci.yml) and runs:

- `npm run build`
- `npm test`
- `npm run test:integration`

## Project structure

```text
.
├── data/rpg/
├── public/
├── scripts/
├── src/
│   ├── content/posts/
│   ├── components/vue/
│   ├── layouts/
│   ├── lib/
│   └── pages/
├── .github/workflows/ci.yml
├── DEPLOYMENT.md
├── CONTRIBUTING.md
├── TEMPLATE_SCOPE.md
├── UPGRADING.md
├── docker-compose.yml
├── Dockerfile
├── site.config.ts
├── .env.example
└── .env.production.example
```

## License

MIT. See [LICENSE](./LICENSE).
