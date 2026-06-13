# RPG Blog

> A personal blog template with RPG-style gamification, visual effects, and one-command Docker deployment. Built with Astro + Vue 3 + SQLite.

## Features

**Blog**
- Write articles in Markdown with frontmatter (title, date, tags, summary, cover)
- Pre-rendered static article pages for fast loading
- RSS feed, XML sitemap, robots.txt, and auto-generated OG images
- Comment system with GitHub OAuth login and admin moderation
- Image upload with auto WebP conversion via sharp

**RPG Gamification**
- Character panel with level, EXP bar, and attribute bars (HP/MP/ATK/DEF/SPD/LUK)
- Skill tree, equipment grid, quest log, titles, and status effects
- All RPG state editable via admin API
- RPG Dashboard at `/rpg`

**Visual Effects**
- Animated sakura petals and aurora waves (Canvas-based)
- Crossfading background image slideshow
- Danmaku (弹幕) scrolling text system
- Glass-morphism cards and navbar
- All effects respect `prefers-reduced-motion`

**Customization**
- 3 built-in theme presets (Ocean, Forest, Twilight)
- i18n: Chinese (zh) and English (en) with dynamic locale loading
- RPG data defined in TypeScript — easy to extend

**Security**
- CSRF protection on all admin mutation endpoints
- Session signing with HMAC-SHA256 and expiry validation
- Admin password hashed with scrypt
- Rate limiting on login endpoint (5 attempts/minute/IP)
- File upload size limit (10MB)
- httpOnly session cookies with SameSite

## Quick Start

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/rpg-blog.git my-blog
cd my-blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your blog

Edit `site.config.ts`:

```ts
title: 'My Blog'
description: 'Welcome to my blog'
author: { name: 'Me', avatar: '/my-avatar.jpg', bio: '...' }
theme: { preset: 'twilight' }       // ocean | forest | twilight
locale: 'en'                         // en | zh
postsPerPage: 6
```

### 4. Set up environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
SESSION_SECRET=a_long_random_string
```

To enable GitHub OAuth comments: create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers) with callback URL `https://your-domain/api/auth/github/callback`.

### 5. Write articles

Create `.md` files in `src/content/posts/`:

```md
---
title: "My First Post"
date: 2026-06-13
tags: ["tech", "tutorial"]
summary: "A short description for previews"
cover: "/uploads/cover.webp"
---

Your Markdown content here...
```

### 6. Run locally

```bash
npm run dev
# Open http://localhost:4321
```

### 7. Deploy

```bash
docker compose up -d
# Blog live at http://your-server:4321
```

## Running Tests

```bash
# Unit tests (auth, CSRF, stores)
npm test -- src/__tests__/stores.test.ts

# Integration tests (requires dev server running)
npm run dev &
npm test
```

## Customizing RPG Data

Edit TypeScript files in `data/rpg/`:

| File | Purpose |
|---|---|
| `skills.ts` | Skills the character can learn |
| `equipment.ts` | Equippable items with 8 slot types |
| `titles.ts` | Unlockable character titles |
| `quests.ts` | Quests with objectives, rewards, difficulty |
| `status-effects.ts` | Buff/debuff effects on the character |

## Directory Structure

```
rpg-blog/
├── data/rpg/                  # RPG definitions
├── locales/                   # Translation files (zh.json, en.json)
├── public/
│   ├── favicon.svg
│   └── uploads/               # Uploaded images (gitignored)
├── src/
│   ├── __tests__/             # Unit & integration tests
│   ├── components/vue/        # Vue 3 components (20)
│   ├── composables/           # Vue composables (useReducedMotion)
│   ├── content/posts/         # Your Markdown articles
│   ├── layouts/               # Page layouts (BaseLayout)
│   ├── lib/                   # Core utilities
│   │   ├── auth.ts            # Session management & scrypt hashing
│   │   ├── csrf.ts            # CSRF token generation
│   │   ├── db.ts              # SQLite init, migrations, indexes
│   │   ├── github-oauth.ts    # GitHub OAuth flow with state nonce
│   │   ├── i18n.ts            # i18n with dynamic locale loading
│   │   ├── rpg-types.ts       # RPG TypeScript interfaces
│   │   └── theme.ts           # Theme presets & colors
│   ├── pages/                 # Routes and API endpoints
│   │   ├── api/               # REST API
│   │   │   ├── auth/          # Login, logout, me, GitHub OAuth
│   │   │   ├── admin/         # Comment moderation
│   │   │   ├── comments.ts    # Comment CRUD with pagination
│   │   │   ├── rpg.ts         # RPG state read & admin mutations
│   │   │   └── upload.ts      # Image upload with WebP conversion
│   │   ├── admin/             # Admin panel pages
│   │   ├── posts/[slug].astro # Article pages (pre-rendered)
│   │   └── rpg.astro          # RPG Dashboard (SSR)
│   ├── stores/                # Pinia stores (auth, danmaku, toast)
│   └── styles/                # Global CSS with Tailwind
├── site.config.ts             # Blog configuration
├── astro.config.mjs           # Astro SSR + Vue + Tailwind config
├── tailwind.config.mjs        # Custom brand colors & animations
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # One-command deployment
└── vitest.config.ts           # Vitest with Vue & jsdom
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 5 (SSR mode) |
| UI | Vue 3 + Pinia |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Database | SQLite via better-sqlite3 (WAL mode) |
| Auth | GitHub OAuth + scrypt + HMAC-SHA256 sessions |
| Image Processing | sharp (SVG OG images, WebP conversion) |
| Testing | Vitest + jsdom + vue-test-utils |
| Deployment | Docker + docker-compose |

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/comments` | GET | List approved comments (paginated) |
| `/api/comments` | POST | Submit comment (GitHub login required) |
| `/api/rpg` | GET | Get full character state |
| `/api/rpg` | POST | Admin: modify RPG state |
| `/api/auth/me` | GET | Current user session |
| `/api/auth/login` | POST | Admin login (rate-limited) |
| `/api/auth/logout` | GET/POST | Clear session |
| `/api/auth/github/login` | GET | Redirect to GitHub OAuth |
| `/api/auth/github/callback` | GET | GitHub OAuth callback |
| `/api/admin/comments` | GET/POST | Admin: moderate comments |
| `/api/upload` | POST | Admin: upload image (CSRF-protected) |
| `/feed.xml` | GET | RSS 2.0 feed |
| `/sitemap.xml` | GET | XML sitemap |
| `/og-image` | GET | SVG/PNG OG images |

## License

MIT
