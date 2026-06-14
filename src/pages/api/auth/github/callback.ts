import type { APIRoute } from 'astro'
import { exchangeCode, consumeState } from '../../../../lib/github-oauth'
import { createSessionToken, getSessionMaxAgeSec, signPayload, getSessionCookieOpts } from '../../../../lib/auth'

const JSON_HEADER = { 'Content-Type': 'application/json' }

export const GET: APIRoute = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') || '/'

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing authorization code' }), { status: 400, headers: JSON_HEADER })
  }

  const redirectTo = consumeState(state) || '/'

  const result = await exchangeCode(code)
  if (!result) {
    return new Response(JSON.stringify({ error: 'Failed to authenticate with GitHub' }), { status: 401, headers: JSON_HEADER })
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
