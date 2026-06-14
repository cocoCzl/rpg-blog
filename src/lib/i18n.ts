import en from '../../locales/en.json'

const translations: Record<string, Record<string, unknown>> = { en }

export function t(key: string, locale = 'en'): string {
  const keys = key.split('.')
  let value: unknown = translations[locale] || translations['en']
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k]
  }
  return typeof value === 'string' ? value : key
}

export async function loadLocale(locale: string) {
  if (!translations[locale]) {
    if (!/^[a-z]{2}$/.test(locale)) {
      console.warn(`Invalid locale "${locale}", falling back to "en"`)
      translations[locale] = translations['en']
      return
    }
    try {
      const mod = await import(`../../locales/${locale}.json`)
      translations[locale] = mod.default
    } catch {
      console.warn(`Locale "${locale}" not found, falling back to "en"`)
      translations[locale] = translations['en']
    }
  }
}

export function isLocaleLoaded(locale: string): boolean {
  return Boolean(translations[locale])
}
