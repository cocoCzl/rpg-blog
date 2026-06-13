import type { APIRoute } from 'astro'
import { verifySessionToken } from '../../../lib/auth'

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
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (githubCookie && githubSessionCookie) {
    const session = verifySessionToken(githubSessionCookie.value)
    if (session) {
      try {
        const user = JSON.parse(decodeURIComponent(githubCookie.value))
        return new Response(JSON.stringify({
          type: 'github',
          username: user.login,
          avatar: user.avatar_url,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch {}
    }
  }

  return new Response(JSON.stringify({ type: 'anonymous' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
