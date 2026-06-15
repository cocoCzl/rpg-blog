export function normalizeRedirectPath(target?: string): string {
  if (!target) return '/'
  return /^\/(?!\/)/.test(target) && !target.includes('\n') && !target.includes('\r') ? target : '/'
}

export function buildGithubLoginHref(target?: string): string {
  const redirectTo = normalizeRedirectPath(target)
  return `/api/auth/github/login?redirect=${encodeURIComponent(redirectTo)}`
}
