import { describe, expect, it } from 'vitest'

describe('setup profiles', () => {
  it('normalizes known profile names', async () => {
    const { normalizeTemplateProfile } = await import('../../scripts/setup-profiles.mjs')
    expect(normalizeTemplateProfile('plain')).toBe('plain')
    expect(normalizeTemplateProfile('COMMENTS')).toBe('comments')
    expect(normalizeTemplateProfile(' manual ')).toBe('manual')
  })

  it('falls back to rpg for unknown profiles', async () => {
    const { normalizeTemplateProfile } = await import('../../scripts/setup-profiles.mjs')
    expect(normalizeTemplateProfile('unknown')).toBe('rpg')
    expect(normalizeTemplateProfile('')).toBe('rpg')
  })

  it('returns predefined feature sets for named profiles', async () => {
    const { getTemplateProfileFeatures } = await import('../../scripts/setup-profiles.mjs')
    expect(getTemplateProfileFeatures('plain')).toEqual({
      comments: false,
      githubOAuth: false,
      rpg: false,
    })
    expect(getTemplateProfileFeatures('comments')).toEqual({
      comments: true,
      githubOAuth: true,
      rpg: false,
    })
    expect(getTemplateProfileFeatures('rpg')).toEqual({
      comments: true,
      githubOAuth: true,
      rpg: true,
    })
  })

  it('leaves manual profile without forced feature defaults', async () => {
    const { getTemplateProfileFeatures } = await import('../../scripts/setup-profiles.mjs')
    expect(getTemplateProfileFeatures('manual')).toBeNull()
  })

  it('detects when github oauth env is needed', async () => {
    const { needsGithubOAuth } = await import('../../scripts/setup-profiles.mjs')
    expect(needsGithubOAuth({ comments: true, githubOAuth: true, rpg: false })).toBe(true)
    expect(needsGithubOAuth({ comments: true, githubOAuth: false, rpg: true })).toBe(false)
    expect(needsGithubOAuth({ comments: false, githubOAuth: true, rpg: false })).toBe(false)
  })
})
