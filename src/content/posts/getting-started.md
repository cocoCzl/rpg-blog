---
title: "Getting Started with the Blog Template"
date: 2026-02-15
tags: ["tutorial", "template"]
cover: ""
summary: "Learn how to set up and customize this blog template."
---

## Getting Started

After forking this template, here's what you need to do:

### 1. Configure your site

Edit `site.config.ts` to set your blog title, author name, and choose a theme preset.

### 2. Set up authentication

Copy `.env.example` to `.env` and fill in your credentials:

- `ADMIN_USERNAME` and `ADMIN_PASSWORD` for admin access
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` for reader login
- `SESSION_SECRET` for encrypting sessions

### 3. Write articles

Add `.md` files to `src/content/posts/` with frontmatter:

```yaml
---
title: "My Article"
date: 2026-06-01
tags: ["tag1", "tag2"]
summary: "A short summary"
---
```

### 4. Deploy

```bash
docker compose up -d
```

Your blog will be live at `http://your-server:4321`.

## Customizing RPG Data

Edit TypeScript files in `data/rpg/` to customize skills, equipment, titles, and quests.
