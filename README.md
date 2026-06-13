# RPG Blog

> A personal blog template with RPG-style gamification. Fork it, configure it, write Markdown articles, deploy with one command.

## What is this?

RPG Blog is an open-source template for developers who want a personal blog with a distinctive look and a built-in RPG gamification layer. It combines:

- **Astro** for page rendering (static + SSR)
- **Vue 3** for interactive components
- **Tailwind CSS** for styling with theme presets
- **SQLite** for lightweight data storage
- **Docker** for single-command deployment

## Features

- Write articles in Markdown with frontmatter
- Article pages pre-rendered as static HTML (fast!)
- GitHub OAuth for reader comments
- Admin panel for comment moderation
- RPG system: skills, equipment, titles, quests
- 3 built-in theme presets (Ocean, Forest, Twilight)
- i18n: Chinese and English built-in, extensible
- Auto-generated RSS feed, sitemap, and OG images
- Single Docker container deployment

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
author: { name: 'Me', avatar: '/my-avatar.jpg', bio: '...' }
theme: { preset: 'twilight' }  // ocean | forest | twilight
```

### 4. Set up environment

```bash
cp .env.example .env
# Edit .env with your credentials:
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=your_secure_password
# GITHUB_CLIENT_ID=...        (from GitHub OAuth App)
# GITHUB_CLIENT_SECRET=...    (from GitHub OAuth App)
# SESSION_SECRET=random_string
```

**Creating a GitHub OAuth App**: Go to https://github.com/settings/developers → New OAuth App. Set callback URL to `http://your-domain/api/auth/github/callback`.

### 5. Write articles

Create `.md` files in `src/content/posts/`:

```md
---
title: "My First Post"
date: 2026-06-13
tags: ["tech"]
summary: "Hello world!"
---

Your content here...
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

## Customizing RPG Data

Edit TypeScript files in `data/rpg/`:

- `skills.ts` — Define skills the character can learn
- `equipment.ts` — Define equippable items
- `titles.ts` — Define unlockable titles
- `quests.ts` — Define quests with objectives and rewards

## Directory Structure

```
rpg-blog/
├── data/rpg/              # RPG definitions (skills, equipment, quests, titles)
├── locales/               # Translation files (zh.json, en.json)
├── public/uploads/        # Uploaded images (gitignored)
├── src/
│   ├── components/vue/    # Vue components
│   ├── content/posts/     # Your Markdown articles
│   ├── layouts/           # Page layouts
│   ├── lib/               # Utilities (auth, db, theme, i18n)
│   └── pages/             # Routes and API endpoints
├── site.config.ts         # Your blog configuration
├── .env.example           # Environment variable template
├── Dockerfile             # Production Docker build
└── docker-compose.yml     # One-command deployment
```

## Tech Stack

- **Framework**: Astro 5 + Vue 3
- **Styling**: Tailwind CSS 3
- **Database**: SQLite (better-sqlite3)
- **Auth**: GitHub OAuth + bcrypt
- **Testing**: Vitest
- **Deployment**: Docker

## License

MIT
