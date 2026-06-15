import type { APIRoute } from 'astro'
import { existsSync, readFileSync, statSync } from 'fs'
import { join, normalize } from 'path'

const UPLOAD_DIR = process.env.UPLOAD_PATH || join(process.cwd(), 'public/uploads')

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

function getMimeType(pathname: string) {
  const extension = pathname.slice(pathname.lastIndexOf('.')).toLowerCase()
  return MIME_TYPES[extension] || 'application/octet-stream'
}

export const GET: APIRoute = async ({ params }) => {
  const requestedPath = params.path || ''
  const normalized = normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '')
  const fullPath = join(UPLOAD_DIR, normalized)

  if (!fullPath.startsWith(UPLOAD_DIR) || !existsSync(fullPath) || statSync(fullPath).isDirectory()) {
    return new Response(null, { status: 404 })
  }

  const content = readFileSync(fullPath)
  return new Response(content, {
    headers: {
      'Content-Type': getMimeType(fullPath),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
