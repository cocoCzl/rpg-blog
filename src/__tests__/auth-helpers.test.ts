import { describe, expect, it } from 'vitest'
import { buildGithubLoginHref, normalizeRedirectPath } from '../lib/client-auth'
import { consumeState, getGithubAuthUrl } from '../lib/github-oauth'

describe('client auth helpers', () => {
  it('keeps safe relative redirect paths', () => {
    expect(normalizeRedirectPath('/posts/hello-world?ref=comments')).toBe('/posts/hello-world?ref=comments')
  })

  it('rejects unsafe redirect targets', () => {
    expect(normalizeRedirectPath('https://evil.example')).toBe('/')
    expect(normalizeRedirectPath('//evil.example')).toBe('/')
    expect(normalizeRedirectPath('javascript:alert(1)')).toBe('/')
  })

  it('builds github login href with encoded redirect', () => {
    expect(buildGithubLoginHref('/posts/hello-world?ref=comments')).toBe(
      '/api/auth/github/login?redirect=%2Fposts%2Fhello-world%3Fref%3Dcomments'
    )
  })
})

describe('server oauth redirect state', () => {
  it('round-trips safe redirect paths through state', () => {
    const url = new URL(getGithubAuthUrl('/posts/hello-world?ref=comments'))
    const state = url.searchParams.get('state')
    expect(state).toBeTruthy()
    expect(consumeState(state!)).toBe('/posts/hello-world?ref=comments')
  })

  it('falls back to root for unsafe redirect targets', () => {
    const url = new URL(getGithubAuthUrl('https://evil.example'))
    const state = url.searchParams.get('state')
    expect(state).toBeTruthy()
    expect(consumeState(state!)).toBe('/')
  })
})
