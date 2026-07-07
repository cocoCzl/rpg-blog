import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

describe('setup content helpers', () => {
  it('normalizes content mode values', async () => {
    const { normalizeContentMode } = await import('../../scripts/setup-content.mjs')
    expect(normalizeContentMode('keep')).toBe('keep')
    expect(normalizeContentMode('starter')).toBe('starter')
    expect(normalizeContentMode('clear')).toBe('clear')
    expect(normalizeContentMode('replace')).toBe('starter')
    expect(normalizeContentMode('unknown')).toBe('keep')
  })

  it('slugifies titles for starter posts', async () => {
    const { slugify } = await import('../../scripts/setup-content.mjs')
    expect(slugify('Start Here')).toBe('start-here')
    expect(slugify('  Hello, Blog World  ')).toBe('hello-blog-world')
  })

  it('builds a real starter post without setup instructions', async () => {
    const { buildStarterPost } = await import('../../scripts/setup-content.mjs')
    const post = buildStarterPost({
      siteTitle: '我的博客',
      authorName: '作者',
      date: '2026-06-15',
    })
    expect(post).toContain('title: "第一份委托：把博客开成公会菜单"')
    expect(post).toContain('欢迎来到 **我的博客**')
    expect(post).toContain('记录员：作者')
    expect(post).not.toMatch(/site\.config|Docker|OAuth|SQLite|template/i)
  })

  it('keeps existing posts when requested', async () => {
    const { applyContentMode } = await import('../../scripts/setup-content.mjs')
    const dir = await mkdtemp(join(tmpdir(), 'rpg-blog-posts-'))
    const postsDir = pathToFileURL(`${dir}/`)
    await writeFile(new URL('existing.md', postsDir), 'keep me', 'utf8')

    const result = await applyContentMode({ postsDir, siteTitle: 'Blog', authorName: 'Author', mode: 'keep' })

    expect(result).toEqual({ mode: 'keep', removedFiles: [], createdFile: null })
    expect(await readFile(new URL('existing.md', postsDir), 'utf8')).toBe('keep me')
    await rm(dir, { recursive: true, force: true })
  })

  it('creates a starter post after clearing markdown', async () => {
    const { applyContentMode } = await import('../../scripts/setup-content.mjs')
    const dir = await mkdtemp(join(tmpdir(), 'rpg-blog-posts-'))
    const postsDir = pathToFileURL(`${dir}/`)
    await writeFile(new URL('old.md', postsDir), 'old', 'utf8')
    await writeFile(new URL('notes.txt', postsDir), 'keep', 'utf8')

    const result = await applyContentMode({ postsDir, siteTitle: 'Blog', authorName: 'Author', mode: 'starter' })
    const files = await readdir(postsDir)

    expect(result.createdFile).toBe('guild-first-commission.md')
    expect(result.removedFiles).toEqual(['old.md'])
    expect(files.sort()).toEqual(['guild-first-commission.md', 'notes.txt'])
    await rm(dir, { recursive: true, force: true })
  })

  it('can clear markdown posts without creating content', async () => {
    const { applyContentMode } = await import('../../scripts/setup-content.mjs')
    const dir = await mkdtemp(join(tmpdir(), 'rpg-blog-posts-'))
    const postsDir = pathToFileURL(`${dir}/`)
    await writeFile(new URL('old.md', postsDir), 'old', 'utf8')

    const result = await applyContentMode({ postsDir, siteTitle: 'Blog', authorName: 'Author', mode: 'clear' })

    expect(result).toEqual({ mode: 'clear', removedFiles: ['old.md'], createdFile: null })
    expect(await readdir(postsDir)).toEqual([])
    await rm(dir, { recursive: true, force: true })
  })
})
