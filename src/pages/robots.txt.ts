import type { APIRoute } from 'astro'
import config from '../../site.config'

const BASE_URL = config.siteUrl

export const GET: APIRoute = () => {
  const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`
  return new Response(robots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
