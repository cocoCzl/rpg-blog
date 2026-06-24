# Upgrading From New Template Versions

If you keep your own blog as a fork of this template, do not blindly overwrite your project with upstream changes. Treat upgrades as a merge between:

- template infrastructure changes
- your own content, branding, and feature choices

## Upgrade order

1. Read the upstream changelog or release notes for the template update.
2. Compare these files first:

- `package.json`
- `site.config.ts`
- `.env.example`
- `.env.production.example`
- `docker-compose.yml`
- `Dockerfile`
- `render.yaml`
- `fly.toml`
- `.github/workflows/ci.yml`

3. Then compare runtime code that affects shared behavior:

- `src/lib/`
- `src/middleware.ts`
- `src/pages/api/`
- `src/layouts/`
- shared Vue components under `src/components/vue/`

4. Keep your own content and branding unless the template update explicitly requires a content schema change:

- `src/content/posts/`
- `data/rpg/`
- author/social/theme values in `site.config.ts`

5. Re-run:

```bash
npm install
npm run check
npm test
npm run build
```

Run `npm run check:template` before publishing if the upgrade is being prepared for a live site.

## Files you usually own

These are usually project-specific after the initial fork:

- `src/content/posts/`
- `data/rpg/`
- `site.config.ts`
- `.env`
- deployment secrets in your platform

Do not replace them wholesale unless you intend to reset your site branding or content.

When a template update changes one of these files, merge the specific new option or schema requirement instead of copying the whole upstream file over your version.

## Common conflict decisions

- Keep your posts in `src/content/posts/` unless the release notes mention a required frontmatter migration.
- Keep your RPG data in `data/rpg/` unless the release notes mention renamed keys or new required fields.
- Keep your `site.config.ts` values, but copy new config fields from upstream when TypeScript or tests report missing properties.
- Keep your production secrets outside Git. Only compare `.env.example` and `.env.production.example` for new variable names.
- Prefer upstream changes for shared runtime files such as `src/lib/`, `src/pages/api/`, and `src/middleware.ts`, then re-apply any local behavior changes deliberately.

## When to update your content schema

Check `src/content.config.ts` on every template upgrade. If the post schema changed, verify that your markdown frontmatter still matches the new rules before deploying.

## When to update deployment config

Check deployment files whenever the template changes:

- storage paths
- environment variables
- Node version
- health check behavior
- SSR adapter behavior

Those changes usually land in:

- `Dockerfile`
- `docker-compose.yml`
- `render.yaml`
- `fly.toml`

## Safe merge strategy

For template upgrades with many file changes:

1. merge infra and shared runtime files first
2. run tests and build
3. re-apply local branding or content changes only where needed
4. deploy only after local verification passes

## Current high-impact template areas

When this template evolves, these areas are the most likely to need attention in downstream forks:

- auth and session handling
- feature toggles
- comment and upload APIs
- content schema
- deployment env vars and persistent storage paths
