# Customization Guide

Use this path after you create a blog from the template.

## 1. Initialize

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Open `http://localhost:4321`.

## 2. Pick a Profile

- `plain`: articles, RSS, sitemap, uploads, and admin basics
- `comments`: plain blog plus GitHub reader comments and moderation
- `rpg`: comments plus the RPG dashboard and ambient presentation
- `manual`: choose each feature toggle yourself

The same choices are stored in `site.config.ts` under `features`.

## 3. Edit Site Identity

Change these fields in `site.config.ts`:

- `title`
- `description`
- `home.intro`
- `author`
- `social`
- `theme.preset`
- `locale`

Blank avatar and social links are allowed. The UI hides empty links.

## 4. Write Posts

Posts live in `src/content/posts/`.

```md
---
title: "My First Post"
date: 2026-06-24
tags: ["notes"]
category: "Writing"
summary: "Short preview text."
draft: false
featured: true
---

Post body here.
```

Use `draft: true` to keep a post out of the homepage, pagination, RSS, sitemap, and article routes.

## 5. Configure Comments

For GitHub comments, create an OAuth app at <https://github.com/settings/developers>.

- Homepage URL: your public site URL
- Callback URL: `https://your-domain.com/api/auth/github/callback`

Set these in `.env` locally and in your production secret store:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## 6. Customize RPG Data

If RPG features are enabled, edit:

- `data/rpg/skills.ts`
- `data/rpg/equipment.ts`
- `data/rpg/titles.ts`
- `data/rpg/quests.ts`
- `data/rpg/status-effects.ts`

If you do not want RPG features, choose the `plain` or `comments` profile during setup.

## 7. Check Before Publishing

```bash
npm run check
npm run check:template
```

`npm run check:template` is intentionally strict. It fails when production placeholders, default site identity, or demo posts are still present.
