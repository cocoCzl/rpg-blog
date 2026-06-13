import type { APIRoute } from 'astro'
import { getDb } from '../../../lib/db'
import { verifySessionToken } from '../../../lib/auth'

function requireAdmin(cookies: any) {
  const sessionCookie = cookies.get('session')
  if (!sessionCookie) return false
  const session = verifySessionToken(sessionCookie.value)
  return Boolean(session)
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }
  const db = getDb()
  const comments = db.prepare(
    'SELECT id, article_slug, author_name, author_avatar, body, approved, created_at FROM comments ORDER BY created_at DESC LIMIT 100'
  ).all()
  return new Response(JSON.stringify(comments))
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }
  const body = await request.json()
  const { id, action } = body || {}
  if (!id || !['approve', 'reject'].includes(action)) {
    return new Response(JSON.stringify({ error: 'id and action (approve/reject) required' }), { status: 400 })
  }
  const db = getDb()
  if (action === 'approve') {
    db.prepare('UPDATE comments SET approved = 1 WHERE id = ?').run(id)
  } else {
    db.prepare('DELETE FROM comments WHERE id = ?').run(id)
  }
  return new Response(JSON.stringify({ success: true }))
}
