import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts')
  const urls = posts.map(p => `
  <url>
    <loc>http://localhost:4321/posts/${p.slug}</loc>
    <lastmod>${p.data.date.toISOString().split('T')[0]}</lastmod>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:4321/</loc>
  </url>${urls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
