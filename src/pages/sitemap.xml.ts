import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'
import { escapeXml } from '../lib/utils'

const BASE_URL = config.siteUrl

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts')
  const urls = posts.map(p => `
  <url>
    <loc>${escapeXml(BASE_URL)}/posts/${escapeXml(p.slug)}</loc>
    <lastmod>${p.data.date.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / config.postsPerPage)
  const pageUrls = Array.from({ length: totalPages }, (_, i) => `
  <url>
    <loc>${escapeXml(BASE_URL)}/page/${i + 1}</loc>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(BASE_URL)}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${escapeXml(BASE_URL)}/rpg</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${urls}${pageUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
