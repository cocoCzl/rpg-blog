import { describe, expect, it } from 'vitest'
import config from '../../site.config'
import en from '../../locales/en.json'
import zh from '../../locales/zh.json'
import { apiText, jsonError, jsonSuccess } from '../lib/api-response'
import { disabledFeatureCode, disabledFeatureMessage, disabledJsonResponse, isCommentsEnabled, isGithubAuthEnabled, isRpgEnabled } from '../lib/features'

function expectTranslationShape(locale: Record<string, any>) {
  expect(locale.home.recent_posts).toBeTruthy()
  expect(locale.home.popular_tags).toBeTruthy()
  expect(locale.home.featured_notes).toBeTruthy()
  expect(locale.blog.about_post).toBeTruthy()
  expect(locale.blog.written_by).toBeTruthy()
  expect(locale.api.comments_disabled).toBeTruthy()
  expect(locale.api.github_comments_disabled).toBeTruthy()
  expect(locale.api.rpg_disabled).toBeTruthy()
  expect(locale.api.forbidden).toBeTruthy()
  expect(locale.api.github_oauth_disabled).toBeTruthy()
}

describe('Template helper behavior', () => {
  it('derives feature flags from site config', () => {
    expect(isCommentsEnabled()).toBe(config.features.comments)
    expect(isGithubAuthEnabled()).toBe(config.features.comments && config.features.githubOAuth)
    expect(isRpgEnabled()).toBe(config.features.rpg)
  })

  it.each([
    ['comments', 'COMMENTS_DISABLED'],
    ['github_comments', 'GITHUB_COMMENTS_DISABLED'],
    ['rpg', 'RPG_DISABLED'],
  ] as const)('maps %s to a stable disabled code', (feature, code) => {
    expect(disabledFeatureCode(feature)).toBe(code)
  })

  it.each([
    ['comments', 'api.comments_disabled'],
    ['github_comments', 'api.github_comments_disabled'],
    ['rpg', 'api.rpg_disabled'],
  ] as const)('maps %s to the configured locale message', (feature, key) => {
    expect(disabledFeatureMessage(feature)).toBe(apiText(key))
  })

  it('returns stable JSON payload for disabled features', async () => {
    const response = disabledJsonResponse('comments')
    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: apiText('api.comments_disabled'),
      code: 'COMMENTS_DISABLED',
    })
  })
})

describe('API response helpers', () => {
  it('builds jsonError payloads with code and status', async () => {
    const response = jsonError('Bad request', 422, 'BAD_REQUEST')
    expect(response.status).toBe(422)
    expect(response.headers.get('content-type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      error: 'Bad request',
      code: 'BAD_REQUEST',
    })
  })

  it('builds jsonSuccess payloads with status override', async () => {
    const response = jsonSuccess({ ok: true }, 201)
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })
})

describe('Locale coverage', () => {
  it('en locale contains template customization keys', () => {
    expectTranslationShape(en as Record<string, any>)
  })

  it('zh locale contains template customization keys', () => {
    expectTranslationShape(zh as Record<string, any>)
  })
})
