import { describe, expect, it } from 'vitest'

describe('site wizard', () => {
  it('exports allowed setup choices', async () => {
    const setup = await import('../../scripts/setup.mjs')
    expect(setup.VALID_LOCALES).toEqual(['zh', 'en'])
    expect(setup.VALID_THEMES).toEqual(['guild'])
    expect(setup.VALID_EFFECTS).toEqual(['embers', 'mist', 'stars'])
  })

  it('builds a valid non-interactive site config source', async () => {
    const { buildSiteConfigSource } = await import('../../scripts/setup.mjs')
    const { source, config } = buildSiteConfigSource('', {
      siteUrl: 'https://example.com',
      titleZh: '公会手札',
      titleEn: 'Guild Journal',
      descriptionZh: '中文描述',
      descriptionEn: 'English description',
      introZh: '首页介绍',
      introEn: 'Home intro',
      authorZh: '作者',
      authorEn: 'Author',
      bioZh: '简介',
      bioEn: 'Bio',
      avatar: '/images/avatar.webp',
      github: '',
      twitter: '',
      website: 'https://example.com',
      locale: 'zh',
      theme: 'guild',
      background: '',
      effects: 'embers,mist,unknown',
      showAbout: 'true',
      showTags: 'false',
      showArchive: 'true',
      showToolbox: 'false',
      content: 'starter',
    })

    expect(config.theme).toBe('guild')
    expect(config.effects).toEqual(['embers', 'mist'])
    expect(config.contentMode).toBe('starter')
    expect(source).toContain("siteUrl: process.env.SITE_URL || 'https://example.com'")
    expect(source).toContain("preset: 'guild'")
    expect(source).toContain("effects: ['embers', 'mist']")
    expect(source).toContain('showTags: false')
    expect(source).toContain('showToolbox: false')
  })

  it('falls back to safe defaults for invalid values', async () => {
    const { buildSiteConfigSource } = await import('../../scripts/setup.mjs')
    const { config } = buildSiteConfigSource('', {
      locale: 'fr',
      theme: 'plain',
      background: '',
      effects: '',
      content: 'bad',
    })

    expect(config.locale).toBe('zh')
    expect(config.theme).toBe('guild')
    expect(config.background).toBe('')
    expect(config.effects).toEqual(['embers', 'mist'])
    expect(config.contentMode).toBe('keep')
  })
})
