import type { APIRoute } from 'astro'
import { ensureAdminExists, verifyAdminCredentials, createSessionToken } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  ensureAdminExists()

  const body = await request.json()
  const { username, password } = body || {}

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Username and password are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!verifyAdminCredentials(username, password)) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const token = createSessionToken({
    username,
    createdAt: Date.now(),
  })

  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return new Response(JSON.stringify({ success: true, username }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
