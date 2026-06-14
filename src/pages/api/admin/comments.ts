import type { APIRoute } from 'astro'
import { getDb } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'

const JSON_HEADER = { 'Content-Type': 'application/json' }

export const GET: APIRoute = async ({ cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: JSON_HEADER })
  }
  const db = getDb()
  const comments = db.prepare(
    'SELECT id, article_slug, author_name, author_avatar, body, approved, created_at FROM comments ORDER BY created_at DESC LIMIT 100'
  ).all()
  return new Response(JSON.stringify(comments), { headers: JSON_HEADER })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!requireAdmin(cookies)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: JSON_HEADER })
  }
  const body = await request.json()
  const { id, action } = body || {}
  const numericId = Number(id)
  if (!Number.isFinite(numericId) || numericId <= 0 || !['approve', 'reject'].includes(action)) {
    return new Response(JSON.stringify({ error: 'id and action (approve/reject) required' }), { status: 400, headers: JSON_HEADER })
  }
  const db = getDb()
  if (action === 'approve') {
    db.prepare('UPDATE comments SET approved = 1 WHERE id = ?').run(numericId)
  } else {
    db.prepare('DELETE FROM comments WHERE id = ?').run(numericId)
  }
  return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADER })
}
