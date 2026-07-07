import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'
import { escapeXml } from '../lib/utils'
import { getPostLastModified, getPostUrl, getPublishedPosts } from '../lib/posts'
import { getSiteText } from '../lib/site-text'

export const GET: APIRoute = async () => {
  const siteText = getSiteText(config, config.locale)
  const posts = getPublishedPosts(await getCollection('posts'))
  const lastBuildDate = posts.length > 0 ? getPostLastModified(posts[0]).toUTCString() : new Date().toUTCString()
  const baseUrl = config.siteUrl.replace(/\/$/, '')
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(getPostUrl(post, baseUrl))}</link>
      <description>${escapeXml(post.data.summary)}</description>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(getPostUrl(post, baseUrl))}</guid>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteText.title)}</title>
    <description>${escapeXml(siteText.description)}</description>
    <link>${escapeXml(baseUrl)}/</link>
    <language>${config.locale === 'zh' ? 'zh-CN' : 'en'}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(baseUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
