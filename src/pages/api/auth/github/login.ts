import type { APIRoute } from 'astro'
import { getGithubAuthUrl, isConfigured } from '../../../../lib/github-oauth'
import { isGithubAuthEnabled } from '../../../../lib/features'
import { apiText } from '../../../../lib/api-response'

export const GET: APIRoute = async ({ url }) => {
  if (!isGithubAuthEnabled()) {
    return new Response(apiText('api.github_oauth_disabled'), { status: 404 })
  }
  if (!isConfigured()) {
    return new Response(apiText('api.github_oauth_not_configured'), { status: 500 })
  }

  const redirectTo = url.searchParams.get('redirect') || '/'
  return new Response(null, {
    status: 302,
    headers: { Location: getGithubAuthUrl(redirectTo) },
  })
}
