import type { APIRoute } from 'astro'
import { requireAdmin } from '../../lib/auth'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_PATH || join(process.cwd(), 'public/uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024
const JSON_HEADER = { 'Content-Type': 'application/json' }

function ext(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.substring(idx) : ''
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: JSON_HEADER,
    })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: JSON_HEADER })
  }

  if (file.size > MAX_FILE_SIZE) {
    return new Response(JSON.stringify({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }), { status: 400, headers: JSON_HEADER })
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Only PNG, JPEG, and WEBP are allowed' }), { status: 400, headers: JSON_HEADER })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Validate magic bytes to prevent spoofed MIME types
  const magicBytes = buffer.subarray(0, 4)
  const magicHex = magicBytes.toString('hex')
  const validMagic = (
    (file.type === 'image/png' && magicHex.startsWith('89504e47')) ||
    (file.type === 'image/jpeg' && magicHex.startsWith('ffd8')) ||
    (file.type === 'image/webp' && magicHex.startsWith('52494646'))
  )
  if (!validMagic) {
    return new Response(JSON.stringify({ error: 'File content does not match declared type' }), { status: 400, headers: JSON_HEADER })
  }

  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  const id = randomBytes(8).toString('hex')
  const extname = file.type === 'image/webp' ? '.webp' : ext(file.name) || '.jpg'
  const filename = `${id}${extname}`

  // For non-webp images, convert using sharp if available
  if (file.type !== 'image/webp') {
    try {
      const sharp = await import('sharp')
      const webpBuffer = await sharp.default(buffer).webp({ quality: 80 }).toBuffer()
      writeFileSync(join(UPLOAD_DIR, `${id}.webp`), webpBuffer)
      const url = `/uploads/${id}.webp`
      return new Response(JSON.stringify({ url, filename: `${id}.webp` }), {
        status: 200,
        headers: JSON_HEADER,
      })
    } catch {
      // sharp not available, save as original format
    }
  }

  writeFileSync(join(UPLOAD_DIR, filename), buffer)
  const url = `/uploads/${filename}`
  return new Response(JSON.stringify({ url, filename }), {
    status: 200,
    headers: JSON_HEADER,
  })
}
