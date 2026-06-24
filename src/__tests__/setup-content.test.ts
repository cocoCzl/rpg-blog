import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

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

  it('replaces only known demo posts and preserves user markdown', async () => {
    const { replaceDemoContent } = await import('../../scripts/setup-content.mjs')
    const dir = await mkdtemp(join(tmpdir(), 'rpg-blog-posts-'))
    const postsDir = pathToFileURL(`${dir}/`)

    await writeFile(new URL('hello-world.md', postsDir), 'demo', 'utf8')
    await writeFile(new URL('getting-started.zh.md', postsDir), 'demo zh', 'utf8')
    await writeFile(new URL('my-draft.md', postsDir), 'keep me', 'utf8')

    const result = await replaceDemoContent({
      postsDir,
      siteTitle: 'My Blog',
      authorName: 'Alice',
      profile: 'plain',
      locale: 'en',
    })

    const files = await readdir(postsDir)
    expect(files.sort()).toEqual(['my-draft.md', 'start-here.md'])
    expect(await readFile(new URL('my-draft.md', postsDir), 'utf8')).toBe('keep me')
    expect(result.removedFiles.sort()).toEqual(['getting-started.zh.md', 'hello-world.md'])
    expect(result.skippedFiles).toEqual(['my-draft.md'])

    await rm(dir, { recursive: true, force: true })
  })

  it('does not overwrite an existing starter post', async () => {
    const { replaceDemoContent } = await import('../../scripts/setup-content.mjs')
    const dir = await mkdtemp(join(tmpdir(), 'rpg-blog-posts-'))
    const postsDir = pathToFileURL(`${dir}/`)

    await writeFile(new URL('hello-world.md', postsDir), 'demo', 'utf8')
    await writeFile(new URL('start-here.md', postsDir), 'existing post', 'utf8')

    const result = await replaceDemoContent({
      postsDir,
      siteTitle: 'My Blog',
      authorName: 'Alice',
      profile: 'plain',
      locale: 'en',
    })

    expect(result.createdFile).toBe('start-here-2.md')
    expect(await readFile(new URL('start-here.md', postsDir), 'utf8')).toBe('existing post')

    await rm(dir, { recursive: true, force: true })
  })
})
