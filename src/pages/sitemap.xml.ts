import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'
import { escapeXml } from '../lib/utils'
import { getAllCategories, getAllTags, getPostLastModified, getPostUrl, getPublishedPosts, normalizePostsPerPage } from '../lib/posts'

export const GET: APIRoute = async () => {
  const baseUrl = config.siteUrl.replace(/\/$/, '')
  const posts = getPublishedPosts(await getCollection('posts'))
  const buildDate = (posts.length > 0 ? getPostLastModified(posts[0]) : new Date()).toISOString().split('T')[0]
  const staticPaths = ['/', '/about', '/archive', '/chapters', '/tags', '/feed.xml']
  const postUrls = posts.map((post) => ({
    loc: getPostUrl(post, baseUrl),
    lastmod: getPostLastModified(post).toISOString().split('T')[0],
  }))
  const tagUrls = getAllTags(posts).map(({ tag }) => ({
    loc: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    lastmod: buildDate,
  }))
  const categoryUrls = getAllCategories(posts).map(({ category }) => ({
    loc: `${baseUrl}/chapters/${encodeURIComponent(category)}`,
    lastmod: buildDate,
  }))
  const archiveUrls = Array.from(
    { length: Math.max(0, Math.ceil(posts.length / normalizePostsPerPage(config.postsPerPage)) - 1) },
    (_, index) => ({ loc: `${baseUrl}/archive/${index + 2}`, lastmod: buildDate }),
  )
  const urls = [
    ...staticPaths.map((path) => ({ loc: `${baseUrl}${path}`, lastmod: buildDate })),
    ...postUrls,
    ...tagUrls,
    ...categoryUrls,
    ...archiveUrls,
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
