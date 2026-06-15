import config from '../../site.config'
import { t } from './i18n'
import { jsonError } from './api-response'

export type FeatureKey = 'comments' | 'github_comments' | 'rpg'

export function isCommentsEnabled(): boolean {
  return config.features.comments
}

export function isGithubAuthEnabled(): boolean {
  return config.features.comments && config.features.githubOAuth
}

export function isRpgEnabled(): boolean {
  return config.features.rpg
}

export function disabledFeatureCode(feature: FeatureKey) {
  if (feature === 'comments') return 'COMMENTS_DISABLED'
  if (feature === 'github_comments') return 'GITHUB_COMMENTS_DISABLED'
  return 'RPG_DISABLED'
}

export function disabledJsonResponse(feature: FeatureKey) {
  return jsonError(disabledFeatureMessage(feature), 404, disabledFeatureCode(feature))
}

export function disabledFeatureMessage(feature: FeatureKey) {
  if (feature === 'comments') return t('api.comments_disabled', config.locale)
  if (feature === 'github_comments') return t('api.github_comments_disabled', config.locale)
  return t('api.rpg_disabled', config.locale)
}
