import type { APIRoute } from 'astro'
import { normalizeRedirectPath, resolveLocale } from '../../lib/locale'

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: false,
  secure: import.meta.env.PROD,
  maxAge: 60 * 60 * 24 * 365,
}

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const locale = resolveLocale(url.searchParams.get('locale'))
  const redirectTo = normalizeRedirectPath(url.searchParams.get('redirect'))
  cookies.set('locale', locale, COOKIE_OPTIONS)
  return redirect(redirectTo)
}
