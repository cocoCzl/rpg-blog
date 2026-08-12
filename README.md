# rpg-blog

A static-first pixel JRPG personal blog template built with Astro, Markdown, and offline Docker deployment.

[简体中文](./README.zh-CN.md) · [Customization](./CUSTOMIZATION.md) · [Deployment](./DEPLOYMENT.md) · [Upgrading](./UPGRADING.md)

## Highlights

- Distinctive Guild Menu homepage with Quest Board, Save Slots, Chapters, Clues, and Profile
- Markdown/MDX content, drafts, featured entries, RSS, sitemap, and per-entry Open Graph images
- Chinese/English interface labels; entries and SEO use the configured default language
- Guided setup and post creation, with safe handling of existing content
- Locally hosted fonts and reduced-motion support
- Offline, checksummed Docker packages for `linux/amd64` and `linux/arm64`

## Create your blog

Use GitHub's **Use this template**, download the source ZIP, or clone it:

```bash
git clone https://github.com/cocoCzl/rpg-blog.git my-blog
cd my-blog
npm ci
npm run doctor
npm run setup
npm run dev
```

Requires Node.js `>=22.12.0`. Open `http://localhost:4321`.

On an untouched template, setup recommends replacing the five demo entries with one welcome entry. If it detects your own entries, it recommends keeping them. `starter` and `clear` display the affected files before making changes.

Non-interactive setup must choose a content mode explicitly:

```bash
npm run setup -- --yes --content starter --wizardLocale en --titleZh "我的博客" --titleEn "My Blog"
```

## Write and customize

Create a draft:

```bash
npm run new:post
```

Most personal settings live in `site.config.ts`. Entries live in `src/content/posts/`; images live under `public/images/`. See [CUSTOMIZATION.md](./CUSTOMIZATION.md) and [USER_GUIDE.md](./USER_GUIDE.md).

The language button switches the interface, site identity, and author fields. Article content, custom focus/toolbox text, canonical metadata, RSS, and Open Graph output use the build-time default language.

## Deploy with Docker

Set the final HTTPS domain during setup, start Docker Desktop, then build one package for the server CPU:

```bash
# Most cloud servers
npm run package:deploy -- --platform linux/amd64

# ARM servers and Raspberry Pi
npm run package:deploy -- --platform linux/arm64
```

Upload the archive from `release/`, extract it on an Ubuntu/Debian server, and run `sudo ./install.sh`. The installer verifies its checksum and CPU architecture before loading the images. The server needs Docker Engine, the Compose plugin, ports 80/443, and working DNS; it does not need Git, Node, npm, or registry access.

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Checks

```bash
npm run doctor
npm run build
npm test
npm run check:template
npm run test:visual
```

## Scope and license

This is a static blog template, not a CMS or playable game. It intentionally has no accounts, comments, database, admin dashboard, or online editor. See [TEMPLATE_SCOPE.md](./TEMPLATE_SCOPE.md).

Code and original artwork are MIT licensed. Bundled font and package licenses are listed in [ASSET_LICENSES.md](./ASSET_LICENSES.md).
