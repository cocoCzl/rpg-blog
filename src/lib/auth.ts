import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { getDb } from './db'
import { generateCsrfToken } from './csrf'

const SESSION_SECRET = (() => {
  const secret = process.env.SESSION_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production environment')
  }
  console.warn('WARNING: SESSION_SECRET not set. Using insecure default. Set SESSION_SECRET in .env for production.')
  return 'dev-secret-change-me'
})()

export interface Session {
  username: string
  createdAt: number
}

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

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
    if (sig.length !== expectedSig.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as Session
    if (Date.now() - session.createdAt > SESSION_MAX_AGE_MS) return null
    return session
  } catch {
    return null
  }
}

export function getSessionMaxAgeSec(): number {
  return Math.floor(SESSION_MAX_AGE_MS / 1000)
}

export function requireAdmin(cookies: { get: (name: string) => { value: string } | undefined }) {
  const sessionCookie = cookies.get('session')
  if (!sessionCookie) return false
  return Boolean(verifySessionToken(sessionCookie.value))
}

export function ensureAdminExists() {
  const db = getDb()
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'change_me_immediately'

  const existing = db.prepare('SELECT id FROM admins').all()
  if (existing.length === 0) {
    const hash = hashPassword(adminPassword)
    const result = db.prepare('INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)').run(adminUsername, hash)
    if (result.changes > 0) {
      console.log(`Admin account created.`)
    }
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const db = getDb()
  const admin = db.prepare('SELECT password_hash FROM admins WHERE username = ?').get(username) as { password_hash: string } | undefined
  if (!admin) return false
  return verifyPassword(password, admin.password_hash)
}
