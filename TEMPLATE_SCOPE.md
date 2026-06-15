# Template Scope

This file defines what this repository is trying to be.

## In scope

- a deploy-ready Astro SSR blog template
- optional comment workflow with admin moderation
- optional GitHub OAuth reader login
- optional RPG-flavored presentation and data modules
- Docker-first deployment with clear non-Docker paths
- fork-friendly setup and customization flow
- local-file content authoring with Markdown and TypeScript data

## Out of scope by default

- full CMS integration
- multi-user editorial workflows
- multi-tenant hosting
- enterprise auth providers
- heavy analytics or marketing stack defaults
- platform-specific code for only one hosting vendor

## Stability priorities

When tradeoffs are necessary, favor:

1. safe deployment defaults
2. understandable setup for new fork users
3. compatibility with light customization
4. clear upgrade paths for long-lived forks

## What can change between template versions

- setup prompts and generated defaults
- deployment docs and sample env files
- content schema extensions
- feature toggle behavior
- shared UI defaults

## What downstream forks usually own

- branding
- content
- RPG data
- deployment secrets
- optional UI restyling

Fork users should expect to preserve those areas when pulling future template updates.
