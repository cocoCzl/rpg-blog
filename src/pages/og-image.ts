import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import satori from 'satori'
import sharp from 'sharp'

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug')
  let title = 'RPG Blog'
  if (slug) {
    const posts = await getCollection('posts')
    const post = posts.find(p => p.slug === slug)
    if (post) title = post.data.title
  }

  const svg = await satori(
    { type: 'div', props: { children: title, style: { fontSize: 48, fontWeight: 700, color: '#F5F0FF', fontFamily: 'serif' } } },
    { width: 1200, height: 630, fonts: [] }
  )

  const png = await sharp(Buffer.from(svg)).png().toBuffer()

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  })
}
