export const TEMPLATE_PROFILES = {
  plain: {
    label: 'Plain blog',
    features: {
      comments: false,
      githubOAuth: false,
      rpg: false,
    },
  },
  comments: {
    label: 'Comment-enabled blog',
    features: {
      comments: true,
      githubOAuth: true,
      rpg: false,
    },
  },
  rpg: {
    label: 'Full RPG blog',
    features: {
      comments: true,
      githubOAuth: true,
      rpg: true,
    },
  },
  manual: {
    label: 'Manual feature selection',
    features: null,
  },
}

export function normalizeTemplateProfile(value) {
  const normalized = value.trim().toLowerCase()
  return normalized in TEMPLATE_PROFILES ? normalized : 'rpg'
}

export function getTemplateProfileFeatures(profile) {
  const normalized = normalizeTemplateProfile(profile)
  const preset = TEMPLATE_PROFILES[normalized]
  return preset.features ? { ...preset.features } : null
}

export function needsGithubOAuth(features) {
  return Boolean(features.comments && features.githubOAuth)
}

