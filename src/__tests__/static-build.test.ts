import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const describeWhenBuilt = existsSync('dist') ? describe : describe.skip

describeWhenBuilt('static build output', () => {
  const requiredFiles = [
    'dist/index.html',
    'dist/about/index.html',
    'dist/archive/index.html',
    'dist/chapters/index.html',
    'dist/chapters/启程章节/index.html',
    'dist/chapters/工坊章节/index.html',
    'dist/tags/index.html',
    'dist/tags/写作/index.html',
    'dist/posts/guild-first-commission/index.html',
    'dist/posts/inventory-writing-rhythm/index.html',
    'dist/feed.xml',
    'dist/sitemap.xml',
    'dist/robots.txt',
    'dist/og/home.png',
  ]

  it('generates the core static routes after npm run build', () => {
    for (const file of requiredFiles) {
      expect(existsSync(file), `${file} should exist`).toBe(true)
    }
  })

  it('renders the default site identity and discovery assets', () => {
    const home = readFileSync('dist/index.html', 'utf8')
    const feed = readFileSync('dist/feed.xml', 'utf8')
    const sitemap = readFileSync('dist/sitemap.xml', 'utf8')
    const robots = readFileSync('dist/robots.txt', 'utf8')

    expect(home).toContain('企鹅工会')
    expect(home).toContain('指令菜单')
    expect(home).toContain('任务板')
    expect(home).toContain('最近存档')
    expect(home).not.toContain('Recent Journal Saves')
    expect(home).toContain('第一份委托：把博客开成公会菜单')
    expect(home).toContain('/posts/guild-first-commission')
    expect(home).toContain('/posts/inventory-writing-rhythm')
    expect(home).toContain('href="/chapters"')
    expect(home).toContain('订阅源 RSS')
    expect(home).not.toContain('>RSS</a>')
    expect(home).toContain('/tags/%E5%86%99%E4%BD%9C')
    expect(feed).toContain('<rss')
    expect(sitemap).toContain('/posts/guild-first-commission')
    expect(robots).toContain('Sitemap:')
    expect(home).toContain('/og/home.png')
    expect(readFileSync('dist/posts/guild-first-commission/index.html', 'utf8')).toContain('/og/guild-first-commission.png')
  })
})
