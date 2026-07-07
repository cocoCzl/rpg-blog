import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'

export const CONTENT_MODES = ['keep', 'starter', 'clear']

export function normalizeContentMode(value) {
  const normalized = value.trim().toLowerCase()
  if (CONTENT_MODES.includes(normalized)) return normalized
  if (normalized === 'replace') return 'starter'
  return 'keep'
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'welcome'
}

export function buildStarterPost({
  siteTitle,
  authorName,
  date = new Date().toISOString().slice(0, 10),
}) {
  return `---
title: "第一份委托：把博客开成公会菜单"
date: ${date}
updated: ${date}
tags: ["写作", "界面", "公会"]
category: "启程章节"
summary: "这是 ${siteTitle} 的第一篇冒险手札。"
draft: false
featured: true
---

欢迎来到 **${siteTitle}**。

这是我在公会大厅留下的第一份记录。以后这里会存放写作、阅读、工具和日常里的冒险手札。

## 先开放哪些入口

- 指令菜单
- 任务板
- 最近存档
- 章节与线索

## 保持静态博客边界

它看起来像 JRPG 菜单，但仍然是一套静态个人博客模板。先写下一页手札，之后再慢慢整理章节、线索和道具栏。

记录员：${authorName}
`
}

async function pathExists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function getAvailableMarkdownFilename(postsBase, preferredSlug) {
  const preferredFile = `${preferredSlug}.md`
  if (!(await pathExists(new URL(preferredFile, postsBase)))) return preferredFile

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${preferredSlug}-${index}.md`
    if (!(await pathExists(new URL(candidate, postsBase)))) return candidate
  }

  throw new Error(`Could not find an available starter post filename for ${preferredSlug}`)
}

async function clearMarkdown(postsDir) {
  await mkdir(postsDir, { recursive: true })
  const files = await readdir(postsDir)
  const markdownFiles = files.filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
  const postsBase = postsDir.href.endsWith('/') ? postsDir.href : `${postsDir.href}/`
  await Promise.all(markdownFiles.map((file) => rm(new URL(file, postsBase), { force: true })))
  return markdownFiles
}

export async function applyContentMode({
  postsDir,
  siteTitle,
  authorName,
  mode,
}) {
  await mkdir(postsDir, { recursive: true })
  const normalizedMode = normalizeContentMode(mode)

  if (normalizedMode === 'keep') {
    return { mode: normalizedMode, removedFiles: [], createdFile: null }
  }

  const removedFiles = await clearMarkdown(postsDir)
  if (normalizedMode === 'clear') {
    return { mode: normalizedMode, removedFiles, createdFile: null }
  }

  const postsBase = postsDir.href.endsWith('/') ? postsDir.href : `${postsDir.href}/`
  const preferredSlug = slugify('guild-first-commission')
  const createdFile = await getAvailableMarkdownFilename(postsBase, preferredSlug)
  const starterPost = buildStarterPost({ siteTitle, authorName })
  await writeFile(new URL(createdFile, postsBase), starterPost, 'utf8')

  return {
    mode: normalizedMode,
    removedFiles,
    createdFile,
  }
}
