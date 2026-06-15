import { needsGithubOAuth } from './setup-profiles.mjs'

export function buildPostSetupChecklist({
  siteUrl,
  contentMode,
  features,
}) {
  const items = [
    `Run npm run dev and open ${siteUrl}.`,
    'Review site.config.ts and replace any remaining placeholder social links.',
    'Check .env and store the generated admin password and session secret somewhere safe.',
    'Copy .env.production.example into your deployment platform or secret manager and replace every placeholder value.',
  ]

  if (contentMode === 'replace') {
    items.push('Edit the generated starter post in src/content/posts/ before publishing.')
  } else {
    items.push('Delete or rewrite the demo posts in src/content/posts/ before publishing.')
  }

  if (needsGithubOAuth(features)) {
    items.push('Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env and in your production secrets.')
    items.push(`Create a GitHub OAuth app with callback URL ${siteUrl.replace(/\/+$/, '')}/api/auth/github/callback.`)
  }

  if (features.rpg) {
    items.push('Customize data/rpg/ so the RPG module matches your own world and progression.')
  }

  items.push('Before deployment, run npm test and npm run build.')
  items.push('Deploy with docker compose up -d --build or node dist/server/entry.mjs on your target host.')

  return items
}
