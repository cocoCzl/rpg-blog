import type { CollectionEntry } from 'astro:content'
import type { SupportedLocale } from './locale'

type PostEntry = CollectionEntry<'posts'>

export function getPostBaseSlug(post: PostEntry): string {
  return post.data.baseSlug || post.slug.replace(/\.(en|zh)$/, '')
}

export function isPublishedPost(post: PostEntry): boolean {
  return post.data.draft !== true
}

export function filterPostsByLocale(posts: PostEntry[], locale: SupportedLocale): PostEntry[] {
  const bySlug = new Map<string, PostEntry>()

  for (const post of posts.filter(isPublishedPost)) {
    const baseSlug = getPostBaseSlug(post)
    const existing = bySlug.get(baseSlug)
    if (post.data.locale === locale) {
      bySlug.set(baseSlug, post)
    } else if (!existing && post.data.locale === 'en') {
      bySlug.set(baseSlug, post)
    }
  }

  return Array.from(bySlug.values())
}

export function findPostBySlugAndLocale(posts: PostEntry[], slug: string, locale: SupportedLocale): PostEntry | undefined {
  const published = posts.filter(isPublishedPost)
  return (
    published.find((post) => getPostBaseSlug(post) === slug && post.data.locale === locale) ||
    published.find((post) => getPostBaseSlug(post) === slug && post.data.locale === 'en')
  )
}

export function sortPosts(posts: PostEntry[]): PostEntry[] {
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export function getPostUrl(post: PostEntry, siteUrl: string): string {
  return post.data.canonicalUrl || `${siteUrl}/posts/${getPostBaseSlug(post)}`
}

export function getPostLastModified(post: PostEntry): Date {
  return post.data.updated || post.data.date
}
