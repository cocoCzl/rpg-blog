import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'
import { verifySessionToken, verifyPayload } from '../../lib/auth'

const JSON_HEADER = { 'Content-Type': 'application/json' }

const CACHE_HEADER = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=30, s-maxage=60',
}

export const GET: APIRoute = async ({ url }) => {
  const articleSlug = url.searchParams.get('article_slug')
  if (!articleSlug) {
    return new Response(JSON.stringify({ error: 'article_slug is required' }), {
      status: 400,
      headers: JSON_HEADER,
    })
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
  const githubCookie = cookies.get('github_user')
  const sessionCookie = cookies.get('github_session')
  if (!githubCookie || !sessionCookie) {
    return new Response(JSON.stringify({ error: 'Login required' }), {
      status: 401,
      headers: JSON_HEADER,
    })
  }
  const session = verifySessionToken(sessionCookie.value)
  if (!session) {
    return new Response(JSON.stringify({ error: 'Session expired' }), {
      status: 401,
      headers: JSON_HEADER,
    })
  }

  let body: { article_slug?: string; body?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: JSON_HEADER,
    })
  }
  const { article_slug, body: commentBody } = body || {}
  if (!article_slug || !commentBody) {
    return new Response(JSON.stringify({ error: 'article_slug and body are required' }), {
      status: 400,
      headers: JSON_HEADER,
    })
  }
  if (typeof commentBody === 'string' && commentBody.length > 5000) {
    return new Response(JSON.stringify({ error: 'Comment is too long' }), {
      status: 400,
      headers: JSON_HEADER,
    })
  }

  try {
    const user = verifyPayload<{ login: string; avatar_url: string; id: string | number }>(githubCookie.value)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user data' }), {
        status: 400,
        headers: JSON_HEADER,
      })
    }
    const db = getDb()
    db.prepare(
      'INSERT INTO comments (article_slug, author_name, author_avatar, author_github_id, body) VALUES (?, ?, ?, ?, ?)'
    ).run(article_slug, user.login, user.avatar_url, String(user.id), stripHtml(commentBody.trim()))

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: JSON_HEADER,
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid user data' }), {
      status: 400,
      headers: JSON_HEADER,
    })
  }
}
