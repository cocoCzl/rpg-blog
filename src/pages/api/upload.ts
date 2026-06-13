import { verifySessionToken } from '../../lib/auth'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_PATH || join(process.cwd(), 'public/uploads')

function ext(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.substring(idx) : ''
}

export async function POST({ request, cookies }: any) {
  const sessionCookie = cookies.get('session')
  if (!sessionCookie) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }
  const session = verifySessionToken(sessionCookie.value)
  if (!session) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Only PNG, JPEG, and WEBP are allowed' }), { status: 400 })
  }

  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  const id = randomBytes(8).toString('hex')
  const extname = file.type === 'image/webp' ? '.webp' : ext(file.name) || '.jpg'
  const filename = `${id}${extname}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // For non-webp images, convert using sharp if available
  if (file.type !== 'image/webp') {
    try {
      const sharp = await import('sharp')
      const webpBuffer = await sharp.default(buffer).webp({ quality: 80 }).toBuffer()
      writeFileSync(join(UPLOAD_DIR, `${id}.webp`), webpBuffer)
      const url = `/uploads/${id}.webp`
      return new Response(JSON.stringify({ url, filename: `${id}.webp` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // sharp not available, save as original format
    }
  }

  writeFileSync(join(UPLOAD_DIR, filename), buffer)
  const url = `/uploads/${filename}`
  return new Response(JSON.stringify({ url, filename }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
