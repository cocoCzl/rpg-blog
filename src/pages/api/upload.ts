import type { APIRoute } from 'astro'
import { requireAdmin } from '../../lib/auth'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'
import { apiText, jsonError, jsonSuccess } from '../../lib/api-response'

const UPLOAD_DIR = process.env.UPLOAD_PATH || join(process.cwd(), 'data/uploads')
const UPLOAD_URL_BASE = (process.env.UPLOAD_URL_BASE || '/uploads').replace(/\/+$/, '')
const MAX_FILE_SIZE = 10 * 1024 * 1024

function ext(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.substring(idx) : ''
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAdmin(cookies)) {
    return jsonError(apiText('api.forbidden'), 403, 'FORBIDDEN')
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError(apiText('api.invalid_form_data'), 400, 'INVALID_FORM_DATA')
  }
  const file = formData.get('file') as File | null
  if (!file) {
    return jsonError(apiText('api.no_file'), 400, 'NO_FILE')
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError(apiText('api.file_too_large'), 400, 'FILE_TOO_LARGE')
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return jsonError(apiText('api.file_type_invalid'), 400, 'FILE_TYPE_INVALID')
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
    return jsonError(apiText('api.file_magic_invalid'), 400, 'FILE_MAGIC_INVALID')
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
      const url = `${UPLOAD_URL_BASE}/${id}.webp`
      return jsonSuccess({ url, filename: `${id}.webp` })
    } catch {
      // sharp not available, save as original format
    }
  }

  writeFileSync(join(UPLOAD_DIR, filename), buffer)
  const url = `${UPLOAD_URL_BASE}/${filename}`
  return jsonSuccess({ url, filename })
}
