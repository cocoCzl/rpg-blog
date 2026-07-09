import { describe, expect, it } from 'vitest'

describe('site wizard', () => {
  it('exports allowed setup choices', async () => {
    const setup = await import('../../scripts/setup.mjs')
    expect(setup.VALID_LOCALES).toEqual(['zh', 'en'])
    expect(setup.VALID_WIZARD_LOCALES).toEqual(['zh', 'en'])
    expect(setup.VALID_THEMES).toEqual(['guild'])
    expect(setup.VALID_EFFECTS).toEqual(['embers', 'mist', 'stars'])
  })

  it('normalizes wizard prompt locales', async () => {
    const { normalizeWizardLocale } = await import('../../scripts/setup.mjs')
    expect(normalizeWizardLocale('zh')).toBe('zh')
    expect(normalizeWizardLocale('EN')).toBe('en')
    expect(normalizeWizardLocale('bad')).toBe('zh')
    expect(normalizeWizardLocale('')).toBe('zh')
  })

  it('provides localized wizard prompt text', async () => {
    const { getWizardText } = await import('../../scripts/setup.mjs')
    expect(getWizardText('zh').labels.siteUrl).toBe('站点地址')
    expect(getWizardText('zh').labels.bioZh).toBe('中文作者简介')
    expect(getWizardText('zh').labels.toolbox1TitleZh).toBe('工具箱条目 1 中文标题')
    expect(getWizardText('zh').toolboxHint).toContain('site.config.ts')
    expect(getWizardText('zh').complete).toBe('公会初始化向导完成。')
    expect(getWizardText('en').labels.siteUrl).toBe('Site URL')
    expect(getWizardText('en').labels.bioZh).toBe('Chinese author bio')
    expect(getWizardText('en').labels.toolbox1TitleZh).toBe('Toolkit item 1 Chinese title')
    expect(getWizardText('en').toolboxHint).toContain('home.toolbox')
    expect(getWizardText('bad').labels.siteUrl).toBe('站点地址')
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
      toolbox1TitleZh: '项目入口',
      toolbox1TitleEn: 'Project Links',
      toolbox1DetailZh: '查看我的项目。',
      toolbox1DetailEn: 'Browse my projects.',
      toolbox1Href: 'https://example.com/projects',
      toolbox2TitleZh: '写作计划',
      toolbox2TitleEn: 'Writing Plan',
      toolbox2DetailZh: '接下来想写的主题。',
      toolbox2DetailEn: 'Upcoming writing topics.',
      toolbox2Href: '',
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
    expect(source).toContain("zh: '项目入口'")
    expect(source).toContain("en: 'Project Links'")
    expect(source).toContain("href: 'https://example.com/projects'")
    expect(source).toContain("zh: '写作计划'")
    expect(source).not.toContain("href: '',")
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
