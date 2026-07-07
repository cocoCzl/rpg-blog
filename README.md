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

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Guild Setup Wizard

```bash
npm run setup -- --yes --titleZh "企鹅工会" --titleEn "Penguin Guild" --content starter
```

The wizard configures site identity, Profile fields, language, avatar, links, Inventory Toolkit visibility, and starter Journal Entry content.

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
