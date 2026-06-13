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
    try {
      const mod = await import(`../../locales/${locale}.json`)
      translations[locale] = mod.default
    } catch {
      translations[locale] = translations['en']
    }
  }
}
