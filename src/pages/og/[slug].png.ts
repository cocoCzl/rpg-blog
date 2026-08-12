import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../../site.config'
import { localized } from '../../lib/locale'
import { getPostSlug, getPublishedPosts } from '../../lib/posts'
import { escapeXml } from '../../lib/utils'

export async function getStaticPaths() {
  const posts = getPublishedPosts(await getCollection('posts'))
  return [
    { params: { slug: 'home' }, props: { title: localized(config.title, config.locale) } },
    ...posts.map((post) => ({ params: { slug: getPostSlug(post) }, props: { title: post.data.title } })),
  ]
}

export const GET: APIRoute = async ({ props }) => {
  const title = String(props.title)
  const subtitle = localized(config.description, config.locale)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#fffdf5"/><path d="M0 0H1200V630H0Z" fill="#111" opacity=".035"/>
    <rect x="70" y="64" width="1060" height="502" rx="8" fill="#fff" stroke="#111" stroke-width="10"/>
    <rect x="92" y="86" width="1016" height="458" fill="#fff9cd" stroke="#111" stroke-width="5"/>
    <rect x="116" y="116" width="285" height="46" fill="#58d6c8" stroke="#111" stroke-width="4"/>
    <text x="136" y="147" fill="#111" font-size="23" font-weight="700" font-family="monospace">GUILD JOURNAL</text>
    <text x="116" y="278" fill="#111" font-size="58" font-weight="800" font-family="sans-serif">${esc(shorten(title, 28))}</text>
    <text x="118" y="350" fill="#4c4c5a" font-size="29" font-family="sans-serif">${esc(shorten(subtitle, 52))}</text>
    <rect x="116" y="436" width="352" height="62" fill="#f4d142" stroke="#111" stroke-width="5"/>
    <text x="141" y="476" fill="#111" font-size="24" font-weight="700" font-family="monospace">LOAD SAVE  ▶</text>
    <circle cx="1016" cy="468" r="58" fill="#c36aa4" stroke="#111" stroke-width="6"/>
    <path d="M986 468h60M1016 438v60" stroke="#fff" stroke-width="12"/>
  </svg>`
  const sharp = await import('sharp')
  const png = await sharp.default(Buffer.from(svg)).png().toBuffer()
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}

function shorten(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function esc(value: string) {
  return escapeXml(value).replace(/`/g, '&#96;').replace(/[\n\r]/g, ' ')
}
