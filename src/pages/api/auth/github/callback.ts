import type { APIRoute } from 'astro'
import { exchangeCode, consumeState } from '../../../../lib/github-oauth'
import { createSessionToken, getSessionMaxAgeSec, signPayload, getSessionCookieOpts } from '../../../../lib/auth'
import { isGithubAuthEnabled } from '../../../../lib/features'
import { apiText, jsonError } from '../../../../lib/api-response'

const JSON_HEADER = { 'Content-Type': 'application/json' }

export const GET: APIRoute = async ({ url, cookies }) => {
  if (!isGithubAuthEnabled()) {
    return jsonError(apiText('api.github_comments_disabled'), 404, 'GITHUB_COMMENTS_DISABLED')
  }
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') || '/'

  if (!code) {
    return jsonError(apiText('api.missing_authorization_code'), 400, 'MISSING_AUTHORIZATION_CODE')
  }

  const redirectTo = consumeState(state) || '/'

  const result = await exchangeCode(code)
  if (!result) {
    return jsonError(apiText('api.github_auth_failed'), 401, 'GITHUB_AUTH_FAILED')
  }

  const maxAge = getSessionMaxAgeSec()

  cookies.set('github_user', signPayload(result.user), { ...getSessionCookieOpts(), maxAge })
  cookies.set('github_session', createSessionToken({
    username: result.user.login,
    createdAt: Date.now(),
  }), { ...getSessionCookieOpts(), maxAge })

  return new Response(null, {
    status: 302,
    headers: { Location: redirectTo },
  })
}
