import type { SiteConfig } from './theme'
import type { SupportedLocale } from './locale'
import { localized } from './locale'

export function getSiteText(config: SiteConfig, locale: SupportedLocale) {
  return {
    title: localized(config.title, locale),
    description: localized(config.description, locale),
    homeIntro: localized(config.home.intro, locale),
    authorName: localized(config.author.name, locale),
    authorBio: localized(config.author.bio, locale),
  }
}
