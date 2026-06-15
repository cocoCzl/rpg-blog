import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'
import { isPublishedPost } from '../lib/posts'

let cachedPosts: ReturnType<typeof getCollection> | null = null
let cacheExpiry = 0

async function getCachedPosts() {
  const now = Date.now()
  if (!cachedPosts || now > cacheExpiry) {
    cachedPosts = getCollection('posts')
    cacheExpiry = now + 60_000 // 1 minute cache
  }
  return cachedPosts
}

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug')
  let title = config.title
  if (slug) {
    const posts = await getCachedPosts()
    const post = posts.filter(isPublishedPost).find(p => p.slug === slug)
    if (post) title = post.data.title
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e1b2e"/>
        <stop offset="100%" style="stop-color:#3d2b5a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <text x="600" y="280" text-anchor="middle" fill="#f5f0ff" font-size="56" font-weight="bold" font-family="serif">${esc(title)}</text>
    <text x="600" y="350" text-anchor="middle" fill="#c0b0d8" font-size="28" font-family="sans-serif">${esc(config.title.toLowerCase())}</text>
  </svg>`

  try {
    const sharp = await import('sharp')
    const png = await sharp.default(Buffer.from(svg)).png().toBuffer()
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
  } catch {
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } })
  }
}

import { escapeXml } from '../lib/utils'

function esc(s: string) {
  return escapeXml(s)
    .replace(/`/g, '&#96;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;')
}
