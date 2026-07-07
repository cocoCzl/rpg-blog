import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'
import { escapeXml } from '../lib/utils'
import { getAllTags, getPostLastModified, getPostUrl, getPublishedPosts } from '../lib/posts'

export const GET: APIRoute = async () => {
  const baseUrl = config.siteUrl.replace(/\/$/, '')
  const posts = getPublishedPosts(await getCollection('posts'))
  const staticPaths = ['/', '/about', '/archive', '/tags', '/feed.xml']
  const postUrls = posts.map((post) => ({
    loc: getPostUrl(post, baseUrl),
    lastmod: getPostLastModified(post).toISOString().split('T')[0],
  }))
  const tagUrls = getAllTags(posts).map(({ tag }) => ({
    loc: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    lastmod: new Date().toISOString().split('T')[0],
  }))
  const urls = [
    ...staticPaths.map((path) => ({ loc: `${baseUrl}${path}`, lastmod: new Date().toISOString().split('T')[0] })),
    ...postUrls,
    ...tagUrls,
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
