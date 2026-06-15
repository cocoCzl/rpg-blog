# Contributing

This repository is maintained as a reusable blog template, not just a single deployed site. Contributions should improve one or more of these goals:

- easier first-time setup for fork users
- safer default deployment behavior
- clearer customization paths
- better long-term maintainability

## Good contribution targets

- deployment hardening
- template setup flow
- content schema improvements
- feature toggle behavior
- documentation for setup, deployment, or upgrading
- focused tests around shared template behavior

## Changes to avoid without strong justification

- adding vendor-specific lock-in
- introducing a CMS dependency for the default template
- shipping features that only make sense for one personal blog
- broad visual redesigns that reduce the template's adaptability
- weakening production auth or storage defaults

## Before opening changes

1. Keep edits scoped.
2. Prefer existing local patterns over new abstractions.
3. Update docs when behavior changes.
4. Add or adjust tests when shared behavior changes.
5. Run:

```bash
npm test
npm run build
```

## Template-specific review standard

When proposing a change, explain:

- who this helps forking users
- whether it changes deployment requirements
- whether it changes content structure
- whether it changes setup flow

## Areas most likely to need tests

- `site.config.ts`-driven behavior
- setup helpers in `scripts/`
- API response shape
- feature toggles
- content schema and draft handling
