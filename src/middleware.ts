import { defineMiddleware } from 'astro:middleware'
import { verifySessionToken, getCsrfCookieOpts } from './lib/auth'
import { generateCsrfToken, verifyCsrfToken } from './lib/csrf'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])

const ADMIN_API_PREFIXES = [
  '/api/admin/',
  '/api/rpg',
  '/api/upload',
]

const CSRF_PROTECTED_PREFIXES = [
  '/api/admin/',
  '/api/rpg',
  '/api/upload',
]

const SITE_URL = process.env.SITE_URL || 'http://localhost:4321'

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request } = context
  const pathname = url.pathname
  const method = request.method.toUpperCase()

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && pathname !== '/admin/login') {
    const sessionCookie = cookies.get('session')
    if (!sessionCookie) {
      return context.redirect('/admin/login')
    }
    const session = verifySessionToken(sessionCookie.value)
    if (!session) {
      return context.redirect('/admin/login')
    }
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    let csrfToken = cookies.get('csrf_token')?.value
    if (!csrfToken) {
      csrfToken = generateCsrfToken()
      cookies.set('csrf_token', csrfToken, getCsrfCookieOpts())
    }
  }

  if (MUTATING_METHODS.has(method)) {
    const isProtected = CSRF_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    const isLoginApi = pathname === '/api/auth/login'

    if (isProtected && !isLoginApi) {
      const csrfTokenCookie = cookies.get('csrf_token')?.value
      const csrfTokenHeader = request.headers.get('x-csrf-token')
      if (!verifyCsrfToken(csrfTokenCookie, csrfTokenHeader)) {
        return new Response(JSON.stringify({ error: 'CSRF token mismatch' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  const response = await next()

  // Apply security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'")
  if (import.meta.env.PROD) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
})
