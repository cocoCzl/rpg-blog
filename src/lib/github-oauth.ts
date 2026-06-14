import { randomBytes } from 'crypto'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || ''
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''

// NOTE: stateStore is an in-memory Map. If running multiple server instances
// behind a load balancer (e.g. Kubernetes, Docker Swarm), the OAuth state
// stored by one instance will not be available to the callback handler on
// another instance. For production multi-instance deployments, replace this
// with a shared store (Redis, database table with TTL, or sticky sessions).
const stateStore = new Map<string, { redirectTo: string; createdAt: number }>()

// Limit state store to prevent memory exhaustion
const MAX_STATES = 10000

// Periodic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of stateStore) {
      if (now - val.createdAt > 5 * 60 * 1000) stateStore.delete(key)
    }
  }, 5 * 60 * 1000)
}

function generateState(): string {
  return randomBytes(16).toString('hex')
}

function isValidRedirect(target: string): boolean {
  // Only allow relative paths (starting with /) to prevent open redirect attacks
  return /^\/[^/]/.test(target) && !target.includes('\n') && !target.includes('\r')
}

function storeState(redirectTo: string): string {
  if (!isValidRedirect(redirectTo)) redirectTo = '/'
  const state = generateState()
  stateStore.set(state, { redirectTo, createdAt: Date.now() })
  // If too many entries, remove oldest
  if (stateStore.size > MAX_STATES) {
    const entries = Array.from(stateStore.entries()).sort((a, b) => a[1].createdAt - b[1].createdAt)
    for (let i = 0; i < entries.length - MAX_STATES; i++) {
      stateStore.delete(entries[i][0])
    }
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
