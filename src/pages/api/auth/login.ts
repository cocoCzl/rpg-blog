import type { APIRoute } from 'astro'
import { ensureAdminExists, verifyAdminCredentials, createSessionToken, getSessionMaxAgeSec } from '../../../lib/auth'
import { generateCsrfToken } from '../../../lib/csrf'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export const POST: APIRoute = async ({ request, cookies }) => {
  ensureAdminExists()

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  let entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    rateLimitMap.set(ip, entry)
  }
  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    return new Response(JSON.stringify({ error: 'Too many attempts. Try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

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

  const maxAge = getSessionMaxAgeSec()

  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge,
  })

  const csrfToken = generateCsrfToken()
  cookies.set('csrf_token', csrfToken, {
    path: '/',
    httpOnly: false,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    maxAge,
  })

  rateLimitMap.delete(ip)

  return new Response(JSON.stringify({ success: true, username }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
