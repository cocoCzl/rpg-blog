import { randomBytes } from 'crypto'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || ''
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''

const stateStore = new Map<string, { redirectTo: string; createdAt: number }>()

function generateState(): string {
  return randomBytes(16).toString('hex')
}

function storeState(redirectTo: string): string {
  const state = generateState()
  stateStore.set(state, { redirectTo, createdAt: Date.now() })
  // Cleanup expired states (5 minutes)
  const now = Date.now()
  for (const [key, val] of stateStore) {
    if (now - val.createdAt > 5 * 60 * 1000) stateStore.delete(key)
  }
  return state
}

export function consumeState(state: string): string | null {
  const entry = stateStore.get(state)
  if (entry) {
    stateStore.delete(state)
    return entry.redirectTo
  }
  return null
}

export function getGithubAuthUrl(redirectTo?: string): string {
  const state = storeState(redirectTo || '/')
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    scope: 'read:user',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export function getRedirectUri(): string {
  const origin = process.env.SITE_URL || 'http://localhost:4321'
  return `${origin}/api/auth/github/callback`
}

export async function exchangeCode(code: string): Promise<{
  accessToken: string
  user: { login: string; avatar_url: string; id: number }
} | null> {
  const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenResp.json()
  if (!tokenData.access_token) return null

  const userResp = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'rpg-blog',
    },
  })

  const userData = await userResp.json()
  if (!userData.login) return null

  return {
    accessToken: tokenData.access_token,
    user: {
      login: userData.login,
      avatar_url: userData.avatar_url,
      id: userData.id,
    },
  }
}

export function isConfigured(): boolean {
  return Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET)
}
