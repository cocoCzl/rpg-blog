import type { APIRoute } from 'astro'
import { getSessionCookieOpts, getCsrfCookieOpts } from '../../../lib/auth'

const JSON_HEADER = {
  'Content-Type': 'application/json',
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
}

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete('session', getSessionCookieOpts())
  cookies.delete('github_session', getSessionCookieOpts())
  cookies.delete('github_user', getSessionCookieOpts())
  cookies.delete('csrf_token', getCsrfCookieOpts())
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: JSON_HEADER,
  })
}

