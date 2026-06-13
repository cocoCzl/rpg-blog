import { describe, it, expect, beforeAll } from 'vitest'

const BASE = 'http://localhost:4321'

describe('Admin Authentication', () => {
  let sessionCookie = ''

  it('redirects unauthenticated user to login', async () => {
    const resp = await fetch(`${BASE}/admin`, { redirect: 'manual' })
    expect(resp.status).toBe(302)
    expect(resp.headers.get('location')).toContain('/admin/login')
  })

  it('rejects login with wrong credentials', async () => {
    const resp = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
    })
    expect(resp.status).toBe(401)
    const data = await resp.json()
    expect(data.error).toBeTruthy()
  })

  it('accepts login with correct credentials', async () => {
    const resp = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'change_me_immediately' }),
    })
    expect(resp.status).toBe(200)
    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toBeTruthy()
    expect(setCookie).toContain('session=')
    sessionCookie = setCookie?.split(';')[0] || ''
  })

  it('allows access to /admin with valid session', async () => {
    const resp = await fetch(`${BASE}/admin`, {
      headers: { Cookie: sessionCookie },
      redirect: 'manual',
    })
    expect(resp.status).toBe(200)
    const html = await resp.text()
    expect(html).toContain('Admin Dashboard')
  })

  it('rejects access to /admin with invalid session', async () => {
    const resp = await fetch(`${BASE}/admin`, {
      headers: { Cookie: 'session=invalid.token.here' },
      redirect: 'manual',
    })
    expect(resp.status).toBe(302)
  })

  it('logout clears session cookie', async () => {
    const resp = await fetch(`${BASE}/api/auth/logout`, {
      headers: {
        Cookie: sessionCookie,
        Origin: 'http://localhost:4321',
      },
    })
    expect(resp.ok).toBe(true)
    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toBeTruthy()
    expect(setCookie).toContain('session=deleted')
  })
})
