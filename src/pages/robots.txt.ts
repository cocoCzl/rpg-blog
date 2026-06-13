import type { APIRoute } from 'astro'

const BASE_URL = process.env.SITE_URL || 'http://localhost:4321'

export const GET: APIRoute = () => {
  const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`
  return new Response(robots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
