import { defineMiddleware } from 'astro:middleware'
import { verifySessionToken } from './lib/auth'

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies } = context
  const pathname = url.pathname

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

  return next()
})
