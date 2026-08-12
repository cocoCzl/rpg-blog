import { describe, expect, it } from 'vitest'
import {
  findPostBySlug,
  getAllCategories,
  getAdjacentPosts,
  getAllTags,
  getPostSlug,
  getPostsByTag,
  getPostsByCategory,
  getPublishedPosts,
  groupPostsByYear,
  paginatePosts,
  normalizePostsPerPage,
} from '../lib/posts'

function post(id: string, data: Record<string, unknown>) {
  return {
    id,
    data: {
      title: id,
      date: new Date('2026-01-01'),
      summary: 'summary',
      tags: [],
      draft: false,
      featured: false,
      ...data,
    },
  } as any
}

describe('post helpers', () => {
  const posts = [
    post('guild-first-commission.md', { date: new Date('2026-03-21'), tags: ['写作', '公会'], category: '启程章节', featured: true }),
    post('inventory-writing-rhythm.md', { date: new Date('2026-03-12'), tags: ['道具栏', '复盘'], category: '工坊章节' }),
    post('draft.md', { date: new Date('2026-03-01'), tags: ['隐藏'], category: '隐藏章节', draft: true }),
  ]

  it('uses the file id as the public slug', () => {
    expect(getPostSlug(posts[0])).toBe('guild-first-commission')
  })

  it('filters drafts and sorts newest first', () => {
    expect(getPublishedPosts(posts).map(getPostSlug)).toEqual(['guild-first-commission', 'inventory-writing-rhythm'])
  })

  it('finds only published posts by slug', () => {
    expect(findPostBySlug(posts, 'guild-first-commission')?.data.featured).toBe(true)
    expect(findPostBySlug(posts, 'draft')).toBeUndefined()
  })

  it('collects tags from published posts only', () => {
    expect(getAllTags(posts)).toEqual([
      { tag: '公会', count: 1 },
      { tag: '写作', count: 1 },
      { tag: '复盘', count: 1 },
      { tag: '道具栏', count: 1 },
    ])
  })

  it('collects categories from published posts only', () => {
    expect(getAllCategories(posts)).toEqual([
      { category: '启程章节', count: 1 },
      { category: '工坊章节', count: 1 },
    ])
  })

  it('filters posts by tag without drafts', () => {
    expect(getPostsByTag(posts, '隐藏')).toEqual([])
    expect(getPostsByTag(posts, '道具栏').map(getPostSlug)).toEqual(['inventory-writing-rhythm'])
  })

  it('filters posts by category without drafts', () => {
    expect(getPostsByCategory(posts, '隐藏章节')).toEqual([])
    expect(getPostsByCategory(posts, '工坊章节').map(getPostSlug)).toEqual(['inventory-writing-rhythm'])
  })

  it('groups published posts by year', () => {
    expect(groupPostsByYear(posts)).toEqual([{ year: '2026', posts: [posts[0], posts[1]] }])
  })

  it('returns previous and next posts by date order', () => {
    expect(getAdjacentPosts(posts, posts[1])).toEqual({ previous: undefined, next: posts[0] })
  })

  it('paginates published posts with stable archive URLs', () => {
    const many = Array.from({ length: 7 }, (_, index) => post(`post-${index}.md`, { date: new Date(`2026-01-${String(index + 1).padStart(2, '0')}`) }))
    expect(paginatePosts(many, 1, 6)).toMatchObject({ currentPage: 1, totalPages: 2, previousUrl: undefined, nextUrl: '/archive/2' })
    expect(paginatePosts(many, 2, 6)).toMatchObject({ currentPage: 2, totalPages: 2, previousUrl: '/archive', nextUrl: undefined })
    expect(paginatePosts([], 1, 0)).toMatchObject({ posts: [], currentPage: 1, totalPages: 1 })
    expect(normalizePostsPerPage(0)).toBe(6)
  })
})
