import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import config from '../../site.config'
import { escapeXml } from '../lib/utils'
import { filterPostsByLocale, getPostLastModified, getPostUrl, sortPosts } from '../lib/posts'
import { getSiteText } from '../lib/site-text'

const BASE_URL = config.siteUrl

export const GET: APIRoute = async () => {
  const siteText = getSiteText(config, config.locale)
  const posts = await getCollection('posts')
  const sorted = sortPosts(filterPostsByLocale(posts, config.locale))
  const lastBuildDate = sorted.length > 0 ? getPostLastModified(sorted[0]).toUTCString() : new Date().toUTCString()

  const items = sorted.map(p => `
    <item>
      <title>${escapeXml(p.data.title)}</title>
      <link>${escapeXml(getPostUrl(p, BASE_URL))}</link>
      <description>${escapeXml(p.data.summary || '')}</description>
      <content:encoded><![CDATA[${p.body || ''}]]></content:encoded>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <guid isPermaLink="true">${escapeXml(getPostUrl(p, BASE_URL))}</guid>
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteText.title)}</title>
    <description>${escapeXml(siteText.description)}</description>
    <link>${escapeXml(BASE_URL)}/</link>
    <language>${config.locale === 'zh' ? 'zh-CN' : 'en'}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(BASE_URL)}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
