import { describe, it, expect, beforeAll } from 'vitest'

import config from '../../site.config'
import { BASE } from './test-base'

describe('GitHub OAuth', () => {
  it('GET /api/auth/me returns anonymous when not logged in', async () => {
    const resp = await fetch(`${BASE}/api/auth/me`)
    const data = await resp.json()
    expect(data.type).toBe('anonymous')
  })

  it('GET /api/auth/github/callback returns 400 without code', async () => {
    const resp = await fetch(`${BASE}/api/auth/github/callback`)
    expect(resp.status).toBe(400)
  })

  it('GET /api/auth/github/login redirects when configured', async () => {
    const resp = await fetch(`${BASE}/api/auth/github/login`, { redirect: 'manual' })
    // Either configured (302 to GitHub) or not configured (500)
    expect([302, 500]).toContain(resp.status)
  })
})

describe('GitHub Login UI', () => {
  let html = ''

  beforeAll(async () => {
    html = await fetch(`${BASE}/`).then(r => r.text())
  })

  it('homepage includes nav bar', () => {
    expect(html).toContain(config.title)
  })
})
