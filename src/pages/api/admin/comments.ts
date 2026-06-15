import type { APIRoute } from 'astro'
import { getDb } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'
import { disabledJsonResponse, isCommentsEnabled } from '../../../lib/features'
import { apiText, jsonError, jsonSuccess } from '../../../lib/api-response'

const JSON_HEADER = { 'Content-Type': 'application/json' }

export const GET: APIRoute = async ({ cookies }) => {
  if (!isCommentsEnabled()) return disabledJsonResponse('comments')
  if (!requireAdmin(cookies)) {
    return jsonError(apiText('api.forbidden'), 403, 'FORBIDDEN')
  }
  const db = getDb()
  const comments = db.prepare(
    'SELECT id, article_slug, author_name, author_avatar, body, approved, created_at FROM comments ORDER BY created_at DESC LIMIT 100'
  ).all()
  return new Response(JSON.stringify(comments), { headers: JSON_HEADER })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isCommentsEnabled()) return disabledJsonResponse('comments')
  if (!requireAdmin(cookies)) {
    return jsonError(apiText('api.forbidden'), 403, 'FORBIDDEN')
  }
  const body = await request.json()
  const { id, action } = body || {}
  const numericId = Number(id)
  if (!Number.isFinite(numericId) || numericId <= 0 || !['approve', 'reject'].includes(action)) {
    return jsonError(apiText('api.id_action_required'), 400, 'ID_ACTION_REQUIRED')
  }
  const db = getDb()
  if (action === 'approve') {
    db.prepare('UPDATE comments SET approved = 1 WHERE id = ?').run(numericId)
  } else {
    db.prepare('DELETE FROM comments WHERE id = ?').run(numericId)
  }
  return jsonSuccess({ success: true })
}
