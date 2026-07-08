# rpg-blog

A static-first pixel JRPG guild journal blog template for Astro. The default site opens like a polished RPG save-board menu: Command Menu navigation, Character Slot profile, Quest Board pinned entry, Recent Save Slots, Chapters, Clues, Profile, and an optional Inventory Toolkit.

The template is built for people who want a personal blog that stands out visually on GitHub while staying simple to deploy as static HTML.

## Highlights

- JRPG Guild Menu homepage instead of a generic blog hero
- Save Board layout with Command Menu, Character Slot, Quest Board, and Save Slots
- Dark pixel RPG menu palette with a supporting atmospheric guild backdrop
- Journal Entries, Chapters, Clues, Profile, and Inventory Toolkit vocabulary
- Bilingual site chrome for Chinese and English UI labels
- Markdown/MDX content through Astro content collections
- RSS, sitemap, robots.txt, Open Graph metadata, static build, Docker, and Nginx support
- React integration with Pxlkit for pixel icon rendering

## Quick Start

Requires Node.js `>=22`.

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Create Your Blog From This Template

1. On GitHub, click **Use this template** to create your own repository, or fork and clone it manually.
2. Clone your repository and enter the project folder.
3. Install dependencies:

```bash
npm install
```

4. Run the setup wizard to replace the default guild identity with your own blog details:

```bash
npm run setup
```

For a non-interactive setup:

```bash
npm run setup -- --yes --titleZh "我的博客" --titleEn "My Blog" --content starter
```

5. Start local development:

```bash
npm run dev
```

Open `http://localhost:4321` and review the homepage, Profile, Chapters, Clues, and Journal Entries.

## Guild Setup Wizard

```bash
npm run setup -- --yes --titleZh "企鹅工会" --titleEn "Penguin Guild" --content starter
```

The wizard configures site identity, Profile fields, language, avatar, links, Inventory Toolkit visibility, and starter Journal Entry content. It updates `site.config.ts`, creates or updates `.env`, and can manage files in `src/content/posts/`.

Content modes:

- `keep`: keep existing Journal Entries.
- `starter`: clear existing entries and create one starter entry for your blog.
- `clear`: remove existing entries and leave the blog empty.

## Write Your First Post

Add Markdown or MDX files to `src/content/posts/`.

```md
---
title: "My First Journal Entry"
date: 2026-03-21
summary: "A short summary shown on the save board."
tags: ["writing", "notes"]
category: "Start"
featured: true
draft: false
---

Write your post here.
```

Supported frontmatter fields are `title`, `date`, `updated`, `summary`, `tags`, `category`, `cover`, `draft`, and `featured`.

## Customize

Most personal settings live in `site.config.ts`: site URL, Chinese and English titles, description, author name, avatar, bio, social links, default language, homepage focus items, Inventory Toolkit items, background image, effects, and navigation visibility.

See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for the full customization guide.

## Build And Deploy

Build static files into `dist/`:

```bash
SITE_URL=https://example.com npm run build
```

Upload `dist/` to a static host such as GitHub Pages, Netlify, Vercel static output, Cloudflare Pages, Nginx, or object storage.

Docker is also supported:

```bash
docker compose up --build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details.

## Keep Template Updates

Your personal content usually lives in `site.config.ts`, `src/content/posts/`, `public/images/`, and `.env`. Treat those as user-owned files when pulling future template changes.

See [UPGRADING.md](./UPGRADING.md) for the recommended update flow.

## Template Boundary

This is a static blog template with RPG-style interface framing. It does not add playable RPG mechanics, controllable characters, combat, accounts, comments, databases, or backend gameplay state.

## Checks

```bash
npm run build
npm test
npm run check:template
npm run test:visual
```

`check:template` protects the JRPG Guild Menu scope and rejects stale discarded visual direction in public source and docs.
