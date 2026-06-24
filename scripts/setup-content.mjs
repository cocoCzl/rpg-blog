import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const DEMO_POST_FILES = ['hello-world.md', 'getting-started.md', 'hello-world.zh.md', 'getting-started.zh.md']

export function normalizeContentMode(value) {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'keep' || normalized === 'replace') return normalized
  return 'replace'
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
  profile,
  locale,
  date = new Date().toISOString().slice(0, 10),
}) {
  const profileLabel = profile === 'plain'
    ? 'plain blog'
    : profile === 'comments'
      ? 'comment-enabled blog'
      : 'RPG blog'

	if (locale === 'zh') {
    return `---
title: "开始写作"
date: ${date}
updated: ${date}
tags: ["开始", "博客"]
category: "公告"
summary: "这是 ${siteTitle} 的第一篇文章。"
draft: false
featured: true
---

欢迎来到 **${siteTitle}**。

这是一个基于当前模板初始化的 ${profileLabel}。你现在可以直接从这里开始替换内容，而不是沿用示例文章。

## 建议先改这几处

- 更新 \`site.config.ts\` 里的站点描述和社交链接
- 在 \`.env\` 中补齐生产环境密钥
- 按你的栏目规划调整 \`tags\` 和 \`category\`

## 下一步

删除这篇文章，或者把它改成你的正式置顶说明。

作者：${authorName}
`
  }

  return `---
title: "Start Here"
date: ${date}
updated: ${date}
tags: ["welcome", "blog"]
category: "Announcements"
summary: "This is the first post for ${siteTitle}."
draft: false
featured: true
---

Welcome to **${siteTitle}**.

This site was initialized from the template as a ${profileLabel}. You can replace this post immediately and publish your own content without leaving the demo articles in place.

## Recommended first edits

- Update the description and social links in \`site.config.ts\`
- Fill in production secrets in \`.env\`
- Adjust tags and categories to match your content structure

## Next step

Delete this post, or turn it into your real pinned introduction.

Written by ${authorName}
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

export async function replaceDemoContent({
  postsDir,
  siteTitle,
  authorName,
  profile,
  locale,
}) {
  await mkdir(postsDir, { recursive: true })
  const files = await readdir(postsDir)
  const markdownFiles = files.filter((file) => file.endsWith('.md'))
  const postsBase = postsDir.href.endsWith('/') ? postsDir.href : `${postsDir.href}/`
  const demoFiles = DEMO_POST_FILES.filter((file) => markdownFiles.includes(file))

  await Promise.all(
    demoFiles.map((file) => rm(new URL(file, postsBase), { force: true }))
  )

  const preferredSlug = slugify(locale === 'zh' ? 'kai-shi-xie-zuo' : 'start-here')
  const createdFile = await getAvailableMarkdownFilename(postsBase, preferredSlug)
  const starterPost = buildStarterPost({ siteTitle, authorName, profile, locale })
  await writeFile(new URL(createdFile, postsBase), starterPost, 'utf8')

  return {
    removedFiles: demoFiles,
    skippedFiles: markdownFiles.filter((file) => !DEMO_POST_FILES.includes(file)),
    createdFile,
    removedDemoFiles: demoFiles,
  }
}
