import type { APIRoute } from 'astro'
import config from '../../site.config'
import { localized } from '../lib/locale'
import { escapeXml } from '../lib/utils'

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get('title') || localized(config.title, config.locale)
  const subtitle = localized(config.description, config.locale)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#100D18"/>
        <stop offset="55%" stop-color="#2A2435"/>
        <stop offset="100%" stop-color="#0B1020"/>
      </linearGradient>
      <radialGradient id="glow" cx="30%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#E8C77A" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="#E8C77A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <circle cx="1010" cy="128" r="3" fill="#F6EFE2" opacity="0.9"/>
    <circle cx="942" cy="210" r="2" fill="#F6EFE2" opacity="0.65"/>
    <circle cx="1082" cy="316" r="2.5" fill="#F6EFE2" opacity="0.7"/>
    <path d="M132 468 C320 410 518 510 720 452 C872 408 994 430 1084 386" fill="none" stroke="#E8C77A" stroke-width="3" opacity="0.42"/>
    <text x="110" y="250" fill="#F6EFE2" font-size="72" font-weight="700" font-family="Georgia, serif">${esc(title)}</text>
    <text x="114" y="326" fill="#C9BDA9" font-size="30" font-family="Arial, sans-serif">${esc(subtitle)}</text>
    <text x="114" y="518" fill="#E8C77A" font-size="26" font-family="Arial, sans-serif">${esc(localized(config.title, config.locale))}</text>
  </svg>`

  try {
    const sharp = await import('sharp')
    const png = await sharp.default(Buffer.from(svg)).png().toBuffer()
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
  } catch {
    return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } })
  }
}

function esc(value: string) {
  return escapeXml(value)
    .replace(/`/g, '&#96;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;')
}
