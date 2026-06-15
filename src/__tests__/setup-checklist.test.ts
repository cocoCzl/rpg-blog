import { describe, expect, it } from 'vitest'

describe('setup checklist helper', () => {
  it('builds a plain blog checklist without oauth or rpg steps', async () => {
    const { buildPostSetupChecklist } = await import('../../scripts/setup-checklist.mjs')
    const items = buildPostSetupChecklist({
      siteUrl: 'http://localhost:4321',
      contentMode: 'replace',
      features: {
        comments: false,
        githubOAuth: false,
        rpg: false,
      },
    })
    expect(items.some((item) => item.includes('GITHUB_CLIENT_ID'))).toBe(false)
    expect(items.some((item) => item.includes('data/rpg/'))).toBe(false)
    expect(items.some((item) => item.includes('generated starter post'))).toBe(true)
  })

  it('adds oauth and rpg steps when those features are enabled', async () => {
    const { buildPostSetupChecklist } = await import('../../scripts/setup-checklist.mjs')
    const items = buildPostSetupChecklist({
      siteUrl: 'https://blog.example.com/',
      contentMode: 'keep',
      features: {
        comments: true,
        githubOAuth: true,
        rpg: true,
      },
    })
    expect(items.some((item) => item.includes('GITHUB_CLIENT_ID'))).toBe(true)
    expect(items.some((item) => item.includes('https://blog.example.com/api/auth/github/callback'))).toBe(true)
    expect(items.some((item) => item.includes('data/rpg/'))).toBe(true)
    expect(items.some((item) => item.includes('demo posts'))).toBe(true)
  })
})
