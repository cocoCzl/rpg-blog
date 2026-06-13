import type { APIRoute } from 'astro'
import { exchangeCode, consumeState } from '../../../../lib/github-oauth'
import { createSessionToken, getSessionMaxAgeSec } from '../../../../lib/auth'

export const GET: APIRoute = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state') || '/'

  if (!code) {
    return new Response('Missing authorization code', { status: 400 })
  }

  const redirectTo = consumeState(state) || '/'

  const result = await exchangeCode(code)
  if (!result) {
    return new Response('Failed to authenticate with GitHub', { status: 401 })
  }

  const maxAge = getSessionMaxAgeSec()

  cookies.set('github_user', JSON.stringify(result.user), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge,
  })

  cookies.set('github_session', createSessionToken({
    username: result.user.login,
    createdAt: Date.now(),
  }), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge,
  })

  return new Response(null, {
    status: 302,
    headers: { Location: redirectTo },
  })
}
