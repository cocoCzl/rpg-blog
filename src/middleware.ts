import { defineMiddleware } from 'astro:middleware'
import { verifySessionToken } from './lib/auth'
import { generateCsrfToken, verifyCsrfToken } from './lib/csrf'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])

const ADMIN_API_PREFIXES = [
  '/api/admin/',
  '/api/rpg',
  '/api/upload',
]

const SITE_URL = process.env.SITE_URL || 'http://localhost:4321'

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies, request } = context
  const pathname = url.pathname
  const method = request.method.toUpperCase()

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = cookies.get('session')
    if (!sessionCookie) {
      return context.redirect('/admin/login')
    }
    const session = verifySessionToken(sessionCookie.value)
    if (!session) {
      return context.redirect('/admin/login')
    }
  }

  if (pathname.startsWith('/admin')) {
    let csrfToken = cookies.get('csrf_token')?.value
    if (!csrfToken) {
      csrfToken = generateCsrfToken()
      cookies.set('csrf_token', csrfToken, {
        path: '/',
        httpOnly: false,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
      })
    }
  }

  if (MUTATING_METHODS.has(method)) {
    const isAdminApi = ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    const isLoginApi = pathname === '/api/auth/login'

    if (isAdminApi && !isLoginApi) {
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

  return next()
})
