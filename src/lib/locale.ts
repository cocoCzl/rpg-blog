import config from '../../site.config'
import { SUPPORTED_LOCALES, type SupportedLocale } from './theme'

export { SUPPORTED_LOCALES, type SupportedLocale }

export function resolveLocale(value?: string | null): SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale) ? value as SupportedLocale : config.locale
}

export function localized(value: { zh: string; en: string }, locale: SupportedLocale = config.locale): string {
  return value[locale] || value.zh
}

export function formatDate(date: Date, locale: SupportedLocale = config.locale): string {
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
