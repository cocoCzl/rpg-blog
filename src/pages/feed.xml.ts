import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'

const BASE_URL = process.env.SITE_URL || 'http://localhost:4321'

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts')
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  const items = sorted.map(p => `
    <item>
      <title>${esc(p.data.title)}</title>
      <link>${BASE_URL}/posts/${p.slug}</link>
      <description>${esc(p.data.summary || '')}</description>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <guid>${BASE_URL}/posts/${p.slug}</guid>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(config.title)}</title>
    <description>${esc(config.description)}</description>
    <link>${BASE_URL}/</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
