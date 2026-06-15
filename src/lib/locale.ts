import config from '../../site.config'

export const SUPPORTED_LOCALES = ['en', 'zh'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function resolveLocale(value?: string | null): SupportedLocale {
  return value === 'zh' ? 'zh' : 'en'
}

export function getActiveLocale(): SupportedLocale {
  if (typeof document !== 'undefined') {
    return resolveLocale(document.documentElement.lang)
  }
  return resolveLocale(config.locale)
}

export function getLocaleFromLocals(locals: Record<string, unknown>): SupportedLocale {
  return resolveLocale(typeof locals.locale === 'string' ? locals.locale : config.locale)
}

export function normalizeRedirectPath(target?: string | null): string {
  if (!target) return '/'
  return /^\/(?!\/)/.test(target) && !target.includes('\n') && !target.includes('\r') ? target : '/'
}

export function buildLocaleSwitchHref(locale: SupportedLocale, redirectTo: string): string {
  return `/api/locale?locale=${encodeURIComponent(locale)}&redirect=${encodeURIComponent(normalizeRedirectPath(redirectTo))}`
}
