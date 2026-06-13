import en from '../../locales/en.json'

const translations: Record<string, Record<string, unknown>> = { en }
let currentLocale = 'en'

export function setLocale(locale: string) {
  currentLocale = locale
}

export function getLocale(): string {
  return currentLocale
}

export function t(key: string, locale?: string): string {
  const loc = locale || currentLocale
  const keys = key.split('.')
  let value: unknown = translations[loc] || translations['en']
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k]
  }
  return typeof value === 'string' ? value : key
}

export async function loadLocale(locale: string) {
  if (!translations[locale]) {
    try {
      const mod = await import(`../../locales/${locale}.json`)
      translations[locale] = mod.default
    } catch {
      translations[locale] = translations['en']
    }
  }
  setLocale(locale)
}

export function isLocaleLoaded(locale: string): boolean {
  return Boolean(translations[locale])
}
