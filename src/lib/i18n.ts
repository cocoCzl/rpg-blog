import en from '../../locales/en.json'

const translations: Record<string, typeof en> = { en }

export function t(key: string, locale = 'en'): string {
  const keys = key.split('.')
  let value: any = translations[locale] || translations['en']
  for (const k of keys) {
    value = value?.[k]
  }
  return typeof value === 'string' ? value : key
}

export async function loadLocale(locale: string) {
  if (!translations[locale]) {
    try {
      if (locale === 'zh') {
        translations['zh'] = (await import('../../locales/zh.json')).default
      }
    } catch {
      translations[locale] = translations['en']
    }
  }
}
