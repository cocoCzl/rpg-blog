import type { APIRoute } from 'astro'
import { getGithubAuthUrl, isConfigured } from '../../../../lib/github-oauth'

export const GET: APIRoute = async ({ url }) => {
  if (!isConfigured()) {
    return new Response('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env', { status: 500 })
  }

  const redirectTo = url.searchParams.get('redirect') || '/'
  return new Response(null, {
    status: 302,
    headers: { Location: getGithubAuthUrl(redirectTo) },
  })
}
