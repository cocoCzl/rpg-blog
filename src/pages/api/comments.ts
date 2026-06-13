import type { APIRoute } from 'astro'
import { getDb } from '../../lib/db'
import { verifySessionToken } from '../../lib/auth'

export const GET: APIRoute = async ({ url, request }) => {
  const articleSlug = url.searchParams.get('article_slug')
  if (!articleSlug) {
    return new Response(JSON.stringify({ error: 'article_slug is required' }), { status: 400 })
  }
  const db = getDb()
  const comments = db.prepare(
    'SELECT id, article_slug, author_name, author_avatar, body, created_at FROM comments WHERE article_slug = ? AND approved = 1 ORDER BY created_at DESC'
  ).all(articleSlug)
  return new Response(JSON.stringify(comments))
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const githubCookie = cookies.get('github_user')
  const sessionCookie = cookies.get('github_session')
  if (!githubCookie || !sessionCookie) {
    return new Response(JSON.stringify({ error: 'Login required' }), { status: 401 })
  }
  const session = verifySessionToken(sessionCookie.value)
  if (!session) {
    return new Response(JSON.stringify({ error: 'Session expired' }), { status: 401 })
  }

  const body = await request.json()
  const { article_slug, body: commentBody } = body || {}
  if (!article_slug || !commentBody) {
    return new Response(JSON.stringify({ error: 'article_slug and body are required' }), { status: 400 })
  }

  try {
    const user = JSON.parse(decodeURIComponent(githubCookie.value))
    const db = getDb()
    db.prepare(
      'INSERT INTO comments (article_slug, author_name, author_avatar, author_github_id, body) VALUES (?, ?, ?, ?, ?)'
    ).run(article_slug, user.login, user.avatar_url, String(user.id), commentBody)

    return new Response(JSON.stringify({ success: true }), { status: 201 })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid user data' }), { status: 400 })
  }
}
