import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import config from '../../site.config'
import { AMBIANCE_EFFECTS, SUPPORTED_LOCALES, THEME_PRESETS, themePresets } from '../lib/theme'

describe('site config', () => {
  it('ships with the default v1 identity', () => {
    expect(config.title.zh).toBe('企鹅工会')
    expect(config.title.en).toBe('Penguin Guild')
    expect(config.author.name.zh).toBe('未命名记录员')
    expect(config.author.name.en).toBe('Unnamed Scribe')
  })

  it('uses supported locale, theme, and ambiance effects', () => {
    expect(SUPPORTED_LOCALES).toContain(config.locale)
    expect(THEME_PRESETS).toContain(config.theme.preset)
    expect(config.theme.effects.every((effect) => AMBIANCE_EFFECTS.includes(effect))).toBe(true)
  })

  it('has the single guild theme preset', () => {
    expect(Object.keys(themePresets)).toEqual(['guild'])
    for (const key of THEME_PRESETS) {
      const preset = themePresets[key]
      expect(preset.primary).toBeTruthy()
      expect(preset.secondary).toBeTruthy()
      expect(preset.accent).toBeTruthy()
      expect(preset.sceneImage).toBe('/images/scenes/guild-hall.svg')
      expect(existsSync(`public${preset.sceneImage}`)).toBe(true)
    }
  })

  it('does not require a background image for the built-in pixel scene', () => {
    expect(config.theme.backgroundImage).toBe('')
  })

  it('keeps display modules explicit', () => {
    expect(typeof config.display.showAbout).toBe('boolean')
    expect(typeof config.display.showTags).toBe('boolean')
    expect(typeof config.display.showArchive).toBe('boolean')
    expect(typeof config.display.showToolbox).toBe('boolean')
  })

  it('uses a valid positive archive page size', () => {
    expect(Number.isInteger(config.postsPerPage)).toBe(true)
    expect(config.postsPerPage).toBeGreaterThan(0)
  })

  it('does not expose removed backend feature flags', () => {
    expect('features' in config).toBe(false)
    expect('comments' in config).toBe(false)
  })
})
