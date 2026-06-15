import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'
import { verifySessionToken, verifyPayload } from '../../lib/auth'
import { disabledJsonResponse, isCommentsEnabled, isGithubAuthEnabled } from '../../lib/features'
import { apiText, jsonError, jsonSuccess } from '../../lib/api-response'

const CACHE_HEADER = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=30, s-maxage=60',
}

export const GET: APIRoute = async ({ url }) => {
  if (!isCommentsEnabled()) return disabledJsonResponse('comments')
  const articleSlug = url.searchParams.get('article_slug')
  if (!articleSlug) {
    return jsonError(apiText('api.article_slug_required'), 400, 'ARTICLE_SLUG_REQUIRED')
  }
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50))
  const offset = (page - 1) * limit

  const db = getDb()
  const comments = db.prepare(
    'SELECT id, article_slug, author_name, author_avatar, body, created_at FROM comments WHERE article_slug = ? AND approved = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(articleSlug, limit, offset)

  const total = db.prepare(
    'SELECT COUNT(*) as count FROM comments WHERE article_slug = ? AND approved = 1'
  ).get(articleSlug) as { count: number }

  return new Response(JSON.stringify({
    comments,
    total: total?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((total?.count || 0) / limit),
  }), { headers: CACHE_HEADER })
}

function stripHtml(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isCommentsEnabled()) return disabledJsonResponse('comments')
  if (!isGithubAuthEnabled()) return disabledJsonResponse('github_comments')
  const githubCookie = cookies.get('github_user')
  const sessionCookie = cookies.get('github_session')
  if (!githubCookie || !sessionCookie) {
    return jsonError(apiText('api.login_required'), 401, 'LOGIN_REQUIRED')
  }
  const session = verifySessionToken(sessionCookie.value)
  if (!session) {
    return jsonError(apiText('api.session_expired'), 401, 'SESSION_EXPIRED')
  }

  let body: { article_slug?: string; body?: string }
  try {
    body = await request.json()
  } catch {
    return jsonError(apiText('api.invalid_json'), 400, 'INVALID_JSON')
  }
  const { article_slug, body: commentBody } = body || {}
  if (!article_slug || !commentBody) {
    return jsonError(apiText('api.comment_fields_required'), 400, 'COMMENT_FIELDS_REQUIRED')
  }
  if (typeof commentBody === 'string' && commentBody.length > 5000) {
    return jsonError(apiText('api.comment_too_long'), 400, 'COMMENT_TOO_LONG')
  }

  try {
    const user = verifyPayload<{ login: string; avatar_url: string; id: string | number }>(githubCookie.value)
    if (!user) {
      return jsonError(apiText('api.invalid_user_data'), 400, 'INVALID_USER_DATA')
    }
    const db = getDb()
    db.prepare(
      'INSERT INTO comments (article_slug, author_name, author_avatar, author_github_id, body) VALUES (?, ?, ?, ?, ?)'
    ).run(article_slug, user.login, user.avatar_url, String(user.id), stripHtml(commentBody.trim()))

    return jsonSuccess({ success: true }, 201)
  } catch {
    return jsonError(apiText('api.invalid_user_data'), 400, 'INVALID_USER_DATA')
  }
}
