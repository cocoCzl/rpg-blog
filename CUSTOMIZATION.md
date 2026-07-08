# Customization

Customize `rpg-blog` through `site.config.ts`, Markdown/MDX Journal Entries, and optional static assets.

## Identity

Edit:

- `title`: site name shown in Chinese and English UI
- `description`: short public value line
- `author.name`: Profile display name
- `author.avatar`: optional replaceable avatar path
- `author.bio`: Character Slot and Profile bio
- `social`: links shown through the command surface

## Guild Theme

The first high-completion release ships one default theme:

```ts
theme: {
  preset: 'guild',
  backgroundImage: '',
  effects: ['embers', 'mist'],
}
```

`backgroundImage` is optional. The built-in atmospheric guild backdrop is included at `public/images/scenes/guild-hall.svg`.

Supported effects:

- `embers`
- `mist`
- `stars`

## Content Language

Public labels use the JRPG Guild Journal vocabulary:

- Posts are Journal Entries
- Categories are Chapters
- Tags are Clues
- About is Profile
- Toolbox is Inventory Toolkit
- Featured is Quest Board
- Latest is Recent Saves / Save Slots

The UI can switch between Chinese and English labels, but Journal Entry content is single-language. Write entries in the language you want to publish.

## Inventory Toolkit

Set `display.showToolbox` to control whether the optional Inventory Toolkit appears. Toolkit items can represent projects, resources, links, or tools, but they should not imply real gameplay inventory state.

Each `home.toolbox` item supports `title`, `detail`, and an optional `href`. Items with `href` render as links; items without `href` render as compact informational notes.
