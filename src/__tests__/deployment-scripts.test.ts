import { describe, expect, it } from 'vitest'
import { buildPostSource, normalizeSlug } from '../../scripts/new-post.mjs'
import { getDeploymentSite, normalizePlatform, parsePlatform, readEnvValue, renderCaddyfile, renderCompose } from '../../scripts/package-deploy.mjs'

describe('deployment package helpers', () => {
  it('reads and validates a public HTTPS site URL', () => {
    expect(readEnvValue('SITE_URL=https://blog.example.com\n', 'SITE_URL')).toBe('https://blog.example.com')
    expect(getDeploymentSite('https://blog.example.com')).toEqual({ siteUrl: 'https://blog.example.com', host: 'blog.example.com' })
    expect(() => getDeploymentSite('http://blog.example.com')).toThrow('HTTPS')
    expect(() => getDeploymentSite('https://blog.example.com/path')).toThrow('没有路径')
    expect(() => getDeploymentSite('https://127.0.0.1')).toThrow('公网 HTTPS')
  })

  it('renders an isolated Caddy deployment', () => {
    expect(renderCompose()).toContain('rpg_blog_caddy_data')
    expect(renderCompose()).toContain('"443:443"')
    expect(renderCompose()).toContain('read_only: true')
    expect(renderCompose()).toContain('condition: service_healthy')
    expect(renderCaddyfile('blog.example.com')).toContain('reverse_proxy blog:8080')
  })

  it('accepts only supported Linux deployment platforms', () => {
    expect(normalizePlatform('linux/amd64')).toBe('linux/amd64')
    expect(normalizePlatform('linux/arm64')).toBe('linux/arm64')
    expect(parsePlatform([])).toBe('linux/amd64')
    expect(parsePlatform(['--platform', 'linux/arm64'])).toBe('linux/arm64')
    expect(() => normalizePlatform('linux/386')).toThrow('不支持的平台')
  })

  it('keeps deployment commands free of shell interpolation', () => {
    expect(renderCaddyfile('blog.example.com')).toBe('blog.example.com {\n  encode zstd gzip\n  reverse_proxy blog:8080\n}\n')
    expect(renderCompose()).not.toContain('privileged:')
  })
})

describe('post wizard helpers', () => {
  it('creates safe slugs and valid frontmatter', () => {
    expect(normalizeSlug(' My First Post! ', 'fallback')).toBe('my-first-post')
    expect(normalizeSlug('中文标题', 'post-2026-08-07')).toBe('post-2026-08-07')
    expect(buildPostSource({
      title: '第一篇文章', date: '2026-08-07', summary: '摘要', tags: ['写作', '记录'], category: '生活', draft: true, featured: false,
    })).toContain('tags: ["写作", "记录"]')
  })
})
