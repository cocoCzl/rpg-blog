import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { getDb } from './db'

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me'

export interface Session {
  username: string
  createdAt: number
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const input = scryptSync(password, salt, 64)
  const storedBuf = Buffer.from(hash, 'hex')
  return input.length === storedBuf.length && timingSafeEqual(input, storedBuf)
}

export function createSessionToken(session: Session): string {
  const payload = JSON.stringify(session)
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = createHash('sha256')
    .update(encoded + SESSION_SECRET)
    .digest('hex')
  return `${encoded}.${sig}`
}

export function verifySessionToken(token: string): Session | null {
  try {
    const [encoded, sig] = token.split('.')
    if (!encoded || !sig) return null
    const expectedSig = createHash('sha256')
      .update(encoded + SESSION_SECRET)
      .digest('hex')
    if (sig !== expectedSig) return null
    return JSON.parse(Buffer.from(encoded, 'base64url').toString())
  } catch {
    return null
  }
}

export function ensureAdminExists() {
  const db = getDb()
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'change_me_immediately'

  const existing = db.prepare('SELECT id FROM admins').all()
  if (existing.length === 0) {
    const hash = hashPassword(adminPassword)
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(adminUsername, hash)
    console.log(`Admin account "${adminUsername}" created from environment config.`)
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const db = getDb()
  const admin = db.prepare('SELECT password_hash FROM admins WHERE username = ?').get(username) as { password_hash: string } | undefined
  if (!admin) return false
  return verifyPassword(password, admin.password_hash)
}
