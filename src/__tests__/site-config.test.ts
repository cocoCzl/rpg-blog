import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import config from '../../site.config'
import { themePresets } from '../lib/theme'

describe('Site Config', () => {
  it('has valid title', () => {
    expect(config.title).toBeTruthy()
    expect(typeof config.title).toBe('string')
  })

  it('has valid author', () => {
    expect(config.author.name).toBeTruthy()
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
})

describe('Rendered HTML via preview server', () => {
  let html = ''

  beforeAll(async () => {
    const resp = await fetch('http://localhost:4321')
    html = await resp.text()
  })

  it('renders site title in HTML', () => {
    expect(html).toContain(`<title>${config.title}</title>`)
  })

  it('renders CSS custom property from selected preset', () => {
    const preset = themePresets[config.theme.preset]
    expect(html).toContain(`--color-primary: ${preset.colors.primary}`)
  })

  it('renders correct lang attribute', () => {
    expect(html).toContain(`lang="${config.locale}"`)
  })
})
