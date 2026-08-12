# Upgrading

Treat your personal content and assets as user-owned files, then pull template changes around them deliberately.

## User-Owned Files

Keep extra care around:

- `site.config.ts`
- `src/content/posts/`
- `public/backgrounds/`
- `public/images/`
- `.env`

These files usually contain your actual blog identity, writing, and images.

## Template-Owned Files

Template updates most often change:

- `src/layouts/`
- `src/pages/`
- `src/lib/`
- `src/styles/`
- `scripts/`
- docs and tests

Review conflicts in these files as template behavior changes, not personal content changes.

## Recommended Flow

```bash
git remote add upstream https://github.com/UPSTREAM_OWNER/rpg-blog.git
git fetch upstream
git merge upstream/main
npm ci
npm run check
npm run check:template
```

If the template adds a new theme or effect, copy any new default assets from upstream unless you intentionally replaced them.

## Content Model

Posts are single-language Markdown files. UI labels can switch between Chinese and English, but your article content does not need paired translations.

If a future release changes frontmatter, update each post explicitly and run:

```bash
npm run build
```
