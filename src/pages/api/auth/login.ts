import type { APIRoute } from 'astro'
import { ensureAdminExists, verifyAdminCredentials, createSessionToken, getSessionMaxAgeSec, getSessionCookieOpts, getCsrfCookieOpts } from '../../../lib/auth'
import { generateCsrfToken } from '../../../lib/csrf'
import { apiText, jsonError } from '../../../lib/api-response'

const AUTH_HEADER = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000
const CLEANUP_INTERVAL_MS = 5 * 60_000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip)
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  ensureAdminExists()

  // NOTE: x-forwarded-for can be spoofed; ensure a trusted reverse proxy
  // rewrites it in production (e.g. nginx, Caddy, Cloudflare)
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1'
  const now = Date.now()
  cleanupExpiredEntries()
  let entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    rateLimitMap.set(ip, entry)
  }
  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    return jsonError(apiText('api.too_many_attempts'), 429, 'TOO_MANY_ATTEMPTS')
  }

  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return jsonError(apiText('api.invalid_json'), 400, 'INVALID_JSON')
  }
  const { username, password } = body || {}

  if (!username || !password) {
    return jsonError(apiText('api.credentials_required'), 400, 'CREDENTIALS_REQUIRED')
  }

  if (!verifyAdminCredentials(username, password)) {
    return jsonError(apiText('api.invalid_credentials'), 401, 'INVALID_CREDENTIALS')
  }

  const token = createSessionToken({
    username,
    createdAt: Date.now(),
  })

  const maxAge = getSessionMaxAgeSec()

  cookies.set('session', token, { ...getSessionCookieOpts(), maxAge })
  const csrfToken = generateCsrfToken()
  cookies.set('csrf_token', csrfToken, { ...getCsrfCookieOpts(), maxAge })

  rateLimitMap.delete(ip)

  return new Response(JSON.stringify({ success: true, username }), {
    status: 200,
    headers: AUTH_HEADER,
  })
}
