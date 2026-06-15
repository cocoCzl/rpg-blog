import en from '../../locales/en.json'
import zh from '../../locales/zh.json'

const translations: Record<string, Record<string, unknown>> = {
  en,
  zh,
}

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
    console.warn(`Invalid locale "${locale}", falling back to "en"`)
    translations[locale] = translations['en']
  }
}

export function isLocaleLoaded(locale: string): boolean {
  return Boolean(translations[locale])
}
