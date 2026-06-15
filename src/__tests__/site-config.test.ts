import { describe, it, expect } from 'vitest'
import config from '../../site.config'
import { themePresets } from '../lib/theme'

describe('Site Config', () => {
  it('has valid title', () => {
    expect(config.title).toBeTruthy()
    expect(typeof config.title).toBe('string')
  })

  it('has homepage intro copy', () => {
    expect(config.home.intro).toBeTruthy()
    expect(typeof config.home.intro).toBe('string')
  })

  it('has valid author', () => {
    expect(config.author.name).toBeTruthy()
    expect(typeof config.author.avatar).toBe('string')
  })

  it('theme preset exists in presets', () => {
    const preset = themePresets[config.theme.preset]
    expect(preset).toBeDefined()
    expect(preset.colors.primary).toBeTruthy()
  })

  it('has valid locale', () => {
    expect(['zh', 'en']).toContain(config.locale)
  })

  it('has positive postsPerPage', () => {
    expect(config.postsPerPage).toBeGreaterThan(0)
  })

  it('has boolean feature toggles', () => {
    expect(typeof config.features.comments).toBe('boolean')
    expect(typeof config.features.githubOAuth).toBe('boolean')
    expect(typeof config.features.rpg).toBe('boolean')
  })

  it('allows optional social links', () => {
    expect(typeof config.social.github).toBe('string')
    expect(typeof config.social.twitter).toBe('string')
    expect(typeof config.social.website).toBe('string')
  })

  it('keeps githubOAuth dependent on comments in the default template profile', () => {
    if (!config.features.comments) {
      expect(config.features.githubOAuth).toBe(false)
    } else {
      expect(typeof config.features.githubOAuth).toBe('boolean')
    }
  })
})

describe('Theme Presets', () => {
  it('has all three presets', () => {
    expect(Object.keys(themePresets)).toEqual(['ocean', 'forest', 'twilight'])
  })

  it.each(['ocean', 'forest', 'twilight'])('%s preset has required colors', (key) => {
    const p = themePresets[key]
    expect(p.colors.primary).toBeTruthy()
    expect(p.colors.secondary).toBeTruthy()
    expect(p.colors.accent).toBeTruthy()
    expect(p.colors.background).toBeTruthy()
    expect(p.colors.surface).toBeTruthy()
    expect(p.colors.text).toBeTruthy()
    expect(p.colors.textSecondary).toBeTruthy()
  })

  it.each(['ocean', 'forest', 'twilight'])('%s preset has valid mode', (key) => {
    const p = themePresets[key]
    expect(['dark', 'light']).toContain(p.mode)
  })
  it('has configurable CSP extension lists', () => {
    expect(Array.isArray(config.security.csp.imgSrc)).toBe(true)
    expect(Array.isArray(config.security.csp.scriptSrc)).toBe(true)
  })
})
