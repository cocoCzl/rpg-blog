import { describe, expect, it } from 'vitest'

describe('setup content helpers', () => {
  it('normalizes content mode values', async () => {
    const { normalizeContentMode } = await import('../../scripts/setup-content.mjs')
    expect(normalizeContentMode('keep')).toBe('keep')
    expect(normalizeContentMode('REPLACE')).toBe('replace')
    expect(normalizeContentMode('')).toBe('replace')
  })

  it('slugifies titles for starter posts', async () => {
    const { slugify } = await import('../../scripts/setup-content.mjs')
    expect(slugify('Start Here')).toBe('start-here')
    expect(slugify('  Hello, Blog World  ')).toBe('hello-blog-world')
  })

  it('builds english starter content', async () => {
    const { buildStarterPost } = await import('../../scripts/setup-content.mjs')
    const post = buildStarterPost({
      siteTitle: 'My Blog',
      authorName: 'Alice',
      profile: 'comments',
      locale: 'en',
      date: '2026-06-15',
    })
    expect(post).toContain('title: "Start Here"')
    expect(post).toContain('This site was initialized from the template as a comment-enabled blog.')
    expect(post).toContain('Written by Alice')
  })

  it('builds chinese starter content', async () => {
    const { buildStarterPost } = await import('../../scripts/setup-content.mjs')
    const post = buildStarterPost({
      siteTitle: '我的博客',
      authorName: '作者',
      profile: 'plain',
      locale: 'zh',
      date: '2026-06-15',
    })
    expect(post).toContain('title: "开始写作"')
    expect(post).toContain('这是 我的博客 的第一篇文章。')
    expect(post).toContain('作者：作者')
  })
})
