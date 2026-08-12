import type { CollectionEntry } from 'astro:content'

export type PostEntry = CollectionEntry<'posts'>

export function getPostSlug(post: PostEntry): string {
  return post.id.replace(/\.(md|mdx)$/, '')
}

export function isPublishedPost(post: PostEntry): boolean {
  return post.data.draft !== true
}

export function sortPosts(posts: PostEntry[]): PostEntry[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export function getPublishedPosts(posts: PostEntry[]): PostEntry[] {
  return sortPosts(posts.filter(isPublishedPost))
}

export function findPostBySlug(posts: PostEntry[], slug: string): PostEntry | undefined {
  return posts.filter(isPublishedPost).find((post) => getPostSlug(post) === slug)
}

export function getPostUrl(post: PostEntry, siteUrl = ''): string {
  const path = `/posts/${getPostSlug(post)}`
  return siteUrl ? `${siteUrl.replace(/\/$/, '')}${path}` : path
}

export function getPostLastModified(post: PostEntry): Date {
  return post.data.updated || post.data.date
}

export function getAllTags(posts: PostEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of posts.filter(isPublishedPost)) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.tag.localeCompare(b.tag)
  })
}

export function getPostsByTag(posts: PostEntry[], tag: string): PostEntry[] {
  return getPublishedPosts(posts).filter((post) => post.data.tags.includes(tag))
}

export function getAllCategories(posts: PostEntry[]): { category: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of posts.filter(isPublishedPost)) {
    if (!post.data.category) continue
    counts.set(post.data.category, (counts.get(post.data.category) || 0) + 1)
  }
  return Array.from(counts, ([category, count]) => ({ category, count })).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.category.localeCompare(b.category)
  })
}

export function getPostsByCategory(posts: PostEntry[], category: string): PostEntry[] {
  return getPublishedPosts(posts).filter((post) => post.data.category === category)
}

export function groupPostsByYear(posts: PostEntry[]): { year: string; posts: PostEntry[] }[] {
  const groups = new Map<string, PostEntry[]>()
  for (const post of getPublishedPosts(posts)) {
    const year = String(post.data.date.getFullYear())
    groups.set(year, [...(groups.get(year) || []), post])
  }
  return Array.from(groups, ([year, groupedPosts]) => ({ year, posts: groupedPosts }))
}

export function paginatePosts(posts: PostEntry[], page: number, perPage: number) {
  const safePerPage = normalizePostsPerPage(perPage)
  const published = getPublishedPosts(posts)
  const totalPages = Math.max(1, Math.ceil(published.length / safePerPage))
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages)
  const start = (currentPage - 1) * safePerPage
  return {
    posts: published.slice(start, start + safePerPage),
    currentPage,
    totalPages,
    previousUrl: currentPage > 1 ? (currentPage === 2 ? '/archive' : `/archive/${currentPage - 1}`) : undefined,
    nextUrl: currentPage < totalPages ? `/archive/${currentPage + 1}` : undefined,
  }
}

export function normalizePostsPerPage(value: number): number {
  return Number.isInteger(value) && value > 0 ? value : 6
}

export function getAdjacentPosts(posts: PostEntry[], current: PostEntry): { previous?: PostEntry; next?: PostEntry } {
  const published = getPublishedPosts(posts)
  const index = published.findIndex((post) => getPostSlug(post) === getPostSlug(current))
  return {
    previous: index >= 0 ? published[index + 1] : undefined,
    next: index > 0 ? published[index - 1] : undefined,
  }
}
