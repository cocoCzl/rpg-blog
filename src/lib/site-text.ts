import type { SiteConfig } from './theme'
import type { SupportedLocale } from './locale'

export function getSiteText(config: SiteConfig, locale: SupportedLocale) {
  const localized = config.i18n?.[locale]

  return {
    title: localized?.title || config.title,
    description: localized?.description || config.description,
    homeIntro: localized?.homeIntro || config.home.intro,
    authorName: localized?.authorName || config.author.name,
    authorBio: localized?.authorBio || config.author.bio,
  }
}
