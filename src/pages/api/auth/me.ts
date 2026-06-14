import type { APIRoute } from 'astro'
import { verifySessionToken, verifyPayload } from '../../../lib/auth'

const JSON_HEADER = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-cache, no-store',
  'Vary': 'Cookie',
}

export const GET: APIRoute = async ({ cookies }) => {
  const sessionCookie = cookies.get('session')
  const githubCookie = cookies.get('github_user')
  const githubSessionCookie = cookies.get('github_session')

  if (sessionCookie) {
    const session = verifySessionToken(sessionCookie.value)
    if (session) {
      return new Response(JSON.stringify({
        type: 'admin',
        username: session.username,
      }), { status: 200, headers: JSON_HEADER })
    }
  }

  if (githubCookie && githubSessionCookie) {
    const session = verifySessionToken(githubSessionCookie.value)
    if (session) {
      const user = verifyPayload<{ login: string; avatar_url: string; id: string | number }>(githubCookie.value)
      if (user) {
        return new Response(JSON.stringify({
          type: 'github',
          username: user.login,
          avatar: user.avatar_url,
          id: user.id,
        }), { status: 200, headers: JSON_HEADER })
      }
    }
  }

  return new Response(JSON.stringify({ type: 'anonymous' }), { status: 200, headers: JSON_HEADER })
}
