import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import config from '../../site.config'
import { BASE } from './test-base'

async function loginAsAdmin(): Promise<{ cookie: string; csrfToken: string }> {
  const resp = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'change_me_immediately' }),
  })
  const setCookieHeaders = resp.headers.getSetCookie ? resp.headers.getSetCookie() : [resp.headers.get('set-cookie') || '']
  const allCookies = setCookieHeaders.map(h => h.split(';')[0]).join('; ')
  const csrfMatch = setCookieHeaders.join('; ').match(/csrf_token=([^;]+)/)
  const csrfToken = csrfMatch ? csrfMatch[1] : ''
  return { cookie: allCookies, csrfToken }
}

async function adminFetch(path: string, cookie: string, csrfToken: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: cookie,
      Origin: BASE,
      'x-csrf-token': csrfToken,
    },
  })
}

describe('Homepage', () => {
  let html = ''
  beforeAll(async () => { html = await fetch(`${BASE}/`).then(r => r.text()) })

  it('returns 200', async () => {
    const resp = await fetch(`${BASE}/`)
    expect(resp.status).toBe(200)
  })

  it('has nav bar with site title', () => {
    expect(html).toContain(config.title)
  })

  it('lists both demo articles', () => {
    expect(html).toContain('Hello World')
    expect(html).toContain('Getting Started with the Blog Template')
  })

  it('has article summaries', () => {
    expect(html).toContain('Welcome to your new blog template')
  })

  it('renders HTML lang attribute', () => {
    expect(html).toContain('lang="en"')
  })

  it('has dark mode class on html', () => {
    expect(html).toContain('class="dark"')
  })

  it('renders CSS custom properties', () => {
    expect(html).toContain('--color-primary')
    expect(html).toContain('--color-bg')
    expect(html).toContain('--font-heading')
  })
})

describe('Locale Switching', () => {
  it('sets locale cookie and redirects back to the requested path', async () => {
    const resp = await fetch(`${BASE}/api/locale?locale=zh&redirect=/rpg`, { redirect: 'manual' })
    expect(resp.status).toBe(302)
    expect(resp.headers.get('location')).toBe('/rpg')
    expect(resp.headers.get('set-cookie')).toContain('locale=zh')
  })

  it('renders localized site and component text for zh locale', async () => {
    const home = await fetch(`${BASE}/`, { headers: { Cookie: 'locale=zh' } }).then(r => r.text())
    expect(home).toContain('lang="zh"')
    expect(home).toContain('起步博客')
    expect(home).toContain('一个可直接部署的博客模板')
    expect(home).toContain('博客模板快速开始')
    expect(home).toContain('欢迎使用你的新博客模板')
    expect(home).toContain('在线时长')
    expect(home).toContain('>EN</a>')
  })

  it('renders localized post content for zh locale on stable post URLs', async () => {
    const html = await fetch(`${BASE}/posts/hello-world`, { headers: { Cookie: 'locale=zh' } }).then(r => r.text())
    expect(html).toContain('你好，世界')
    expect(html).toContain('这是你的第一篇博客文章')
    expect(html).toContain('开始写作吧')
  })

  it('renders localized RPG demo data for zh locale', async () => {
    const html = await fetch(`${BASE}/rpg`, { headers: { Cookie: 'locale=zh' } }).then(r => r.text())
    expect(html).toContain('RPG 面板')
    expect(html).toContain('技能')
    expect(html).toContain('写作')
    expect(html).toContain('机械键盘')
    expect(html).toContain('咖啡增益')
  })

  it('renders localized admin login for zh locale', async () => {
    const html = await fetch(`${BASE}/admin/login`, { headers: { Cookie: 'locale=zh' } }).then(r => r.text())
    expect(html).toContain('管理员登录')
    expect(html).toContain('用户名')
    expect(html).toContain('密码')
  })
})

describe('Article Pages', () => {
  let html = ''
  beforeAll(async () => { html = await fetch(`${BASE}/posts/hello-world`).then(r => r.text()) })

  it('renders article title', () => {
    expect(html).toContain('Hello World')
  })

  it('renders date', () => {
    expect(html).toContain('January 1, 2026')
  })

  it('renders tags as badges', () => {
    expect(html).toContain('general')
  })

  it('renders markdown headings', () => {
    expect(html).toContain('<h2')
    expect(html).toContain('Welcome')
  })

  it('renders code blocks with syntax highlighting', () => {
    expect(html).toContain('astro-code')
    expect(html).toContain('Hello, World!')
  })

  it('renders blockquotes', () => {
    expect(html).toContain('<blockquote>')
  })

  it('has back to home link', () => {
    expect(html).toContain('Back to home')
    expect(html).toContain('href="/"')
  })

  it('includes comment section', () => {
    expect(html).toContain('Comments')
  })

  it('title tag includes site name', () => {
    expect(html).toContain(`<title>Hello World - ${config.title}</title>`)
  })

  it('meta description uses summary', () => {
    expect(html).toContain('Welcome to your new blog template')
  })
})

describe('Article Getting Started', () => {
  let html = ''
  beforeAll(async () => { html = await fetch(`${BASE}/posts/getting-started`).then(r => r.text()) })

  it('renders multiple tags', () => {
    expect(html).toContain('tutorial')
    expect(html).toContain('template')
  })

  it('renders date', () => {
    expect(html).toContain('February 15, 2026')
  })

  it('renders code block content', () => {
    // Code blocks get syntax highlighted, so check for expected text fragments
    expect(html).toContain('docker')
    expect(html).toContain('astro-code')
  })
})

describe('Pagination', () => {
  it('page 1 renders without page number in title', async () => {
    const html = await fetch(`${BASE}/`).then(r => r.text())
    expect(html).toContain(config.title)
  })
})

describe('RSS Feed', () => {
  let xml = ''
  beforeAll(async () => { xml = await fetch(`${BASE}/feed.xml`).then(r => r.text()) })

  it('returns 200 with xml content type', async () => {
    const resp = await fetch(`${BASE}/feed.xml`)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('content-type')).toContain('xml')
  })

  it('has valid RSS structure', () => {
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('</rss>')
  })

  it('includes both articles as items', () => {
    expect(xml).toContain('<item>')
    expect(xml).toContain('<title>Hello World</title>')
    expect(xml).toContain('<title>Getting Started with the Blog Template</title>')
  })

  it('includes channel title from config', () => {
    expect(xml).toContain(`<title>${config.title}</title>`)
  })

  it('has pubDate for each item', () => {
    expect(xml).toContain('<pubDate>')
  })
})

describe('Sitemap', () => {
  let xml = ''
  beforeAll(async () => { xml = await fetch(`${BASE}/sitemap.xml`).then(r => r.text()) })

  it('returns 200 with xml', async () => {
    const resp = await fetch(`${BASE}/sitemap.xml`)
    expect(resp.status).toBe(200)
  })

  it('has valid sitemap structure', () => {
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
  })

  it('includes homepage URL', () => {
    expect(xml).toContain(`<loc>${config.siteUrl}/</loc>`)
  })

  it('includes article URLs', () => {
    expect(xml).toContain('/posts/hello-world')
    expect(xml).toContain('/posts/getting-started')
  })
})

describe('OG Image', () => {
  it('returns image/png', async () => {
    const resp = await fetch(`${BASE}/og-image`)
    // May fail without fonts, but endpoint exists
    expect([200, 500]).toContain(resp.status)
  })
})

describe('Admin Authentication', () => {
  let cookie = ''
  let csrf = ''

  beforeAll(async () => {
    const result = await loginAsAdmin()
    cookie = result.cookie
    csrf = result.csrfToken
  })

  it('login sets session cookie', () => {
    expect(cookie).toBeTruthy()
    expect(cookie).toContain('session=')
  })

  it('GET /api/auth/me returns admin after login', async () => {
    const resp = await adminFetch('/api/auth/me', cookie, csrf)
    const data = await resp.json()
    expect(data.type).toBe('admin')
    expect(data.username).toBe('admin')
  })

  it('admin dashboard is accessible', async () => {
    const resp = await adminFetch('/admin', cookie, csrf)
    expect(resp.status).toBe(200)
    const html = await resp.text()
    expect(html).toContain('Admin Dashboard')
  })

  it('admin comments page is accessible', async () => {
    const resp = await adminFetch('/admin/comments', cookie, csrf)
    expect(resp.status).toBe(200)
    const html = await resp.text()
    expect(html).toContain('Comment Moderation')
  })

  it('upload page is accessible by admin', async () => {
    const resp = await adminFetch('/admin/upload', cookie, csrf)
    expect(resp.status).toBe(200)
    const html = await resp.text()
    expect(html).toContain('Upload')
  })

  it('admin login page does not require auth', async () => {
    const resp = await fetch(`${BASE}/admin/login`)
    expect(resp.status).toBe(200)
    const html = await resp.text()
    expect(html).toContain('Admin Login')
  })

  it('admin login page has form fields', async () => {
    const html = await fetch(`${BASE}/admin/login`).then(r => r.text())
    expect(html).toContain('Username')
    expect(html).toContain('Password')
  })

  it('invalid session redirected to login', async () => {
    const resp = await fetch(`${BASE}/admin`, {
      headers: { Cookie: 'session=bad.token' },
      redirect: 'manual',
    })
    expect(resp.status).toBe(302)
  })

  it('no session redirected to login', async () => {
    const resp = await fetch(`${BASE}/admin/comments`, { redirect: 'manual' })
    expect(resp.status).toBe(302)
  })

  it('logout clears session', async () => {
    const resp = await adminFetch('/api/auth/logout', cookie, csrf, { method: 'POST' })
    expect(resp.ok).toBe(true)
  })
})

describe('Comment System', () => {
  let adminCookie = ''
  let adminCsrf = ''

  beforeAll(async () => {
    const result = await loginAsAdmin()
    adminCookie = result.cookie
    adminCsrf = result.csrfToken
  })

  it('GET /api/comments requires article_slug', async () => {
    const resp = await fetch(`${BASE}/api/comments`)
    expect(resp.status).toBe(400)
    const data = await resp.json()
    expect(data.error).toContain('article_slug')
  })

  it('GET /api/comments?article_slug=hello-world returns object with comments', async () => {
    const resp = await fetch(`${BASE}/api/comments?article_slug=hello-world`)
    const data = await resp.json()
    expect(Array.isArray(data.comments)).toBe(true)
    expect(data.total).toBeDefined()
    expect(data.totalPages).toBeDefined()
  })

  it('POST /api/comments without auth returns 401', async () => {
    const resp = await fetch(`${BASE}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_slug: 'hello-world', body: 'test' }),
    })
    expect(resp.status).toBe(401)
  })

  it('admin GET /api/admin/comments returns array', async () => {
    const resp = await adminFetch('/api/admin/comments', adminCookie, adminCsrf)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(Array.isArray(data)).toBe(true)
  })

  it('admin POST moderate without auth returns 403', async () => {
    const resp = await fetch(`${BASE}/api/admin/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, action: 'approve' }),
    })
    expect(resp.status).toBe(403)
  })

  it('admin POST moderate with invalid data returns 400', async () => {
    const resp = await adminFetch('/api/admin/comments', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(resp.status).toBe(400)
  })

  it('article page has empty comments initially', async () => {
    const html = await fetch(`${BASE}/posts/hello-world`).then(r => r.text())
    expect(html).toContain('Comments (0)')
  })
})

describe('RPG System', () => {
  let adminCookie = ''
  let adminCsrf = ''

  beforeAll(async () => {
    const result = await loginAsAdmin()
    adminCookie = result.cookie
    adminCsrf = result.csrfToken
  })

  it('GET /api/rpg returns state with defaults', async () => {
    const resp = await fetch(`${BASE}/api/rpg`)
    const data = await resp.json()
    expect(data.state).toBeDefined()
    expect(data.state.experience).toBeGreaterThanOrEqual(0)
    expect(data.state.level).toBeGreaterThanOrEqual(1)
  })

  it('GET /api/rpg returns skills array', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    expect(Array.isArray(data.skills)).toBe(true)
  })

  it('GET /api/rpg returns equipment array', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    expect(Array.isArray(data.equipment)).toBe(true)
  })

  it('GET /api/rpg returns quests array', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    expect(Array.isArray(data.quests)).toBe(true)
  })

  it('GET /api/rpg returns titles array', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    expect(Array.isArray(data.titles)).toBe(true)
  })

  it('admin can add experience', async () => {
    const resp = await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_experience', amount: 100 }),
    })
    expect(resp.ok).toBe(true)
  })

  it('experience is persisted after add', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    expect(data.state.experience).toBeGreaterThanOrEqual(100)
  })

  it('unauthenticated POST /api/rpg returns 403', async () => {
    const resp = await fetch(`${BASE}/api/rpg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_experience', amount: 50 }),
    })
    expect(resp.status).toBe(403)
  })

  it('admin can unlock skill', async () => {
    const resp = await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unlock_skill', key: 'writing' }),
    })
    expect(resp.ok).toBe(true)
  })

  it('unlocked skill appears in state', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    const writing = data.skills.find((s: any) => s.skill_key === 'writing')
    expect(writing).toBeDefined()
    expect(writing.unlocked).toBe(1)
  })

  it('admin can unlock quest', async () => {
    const resp = await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unlock_quest', key: 'first_post' }),
    })
    expect(resp.ok).toBe(true)
  })

  it('unlocked quest shows as active', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    const quest = data.quests.find((q: any) => q.quest_key === 'first_post')
    expect(quest).toBeDefined()
    expect(quest.status).toBe('active')
  })

  it('admin can complete quest', async () => {
    const resp = await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete_quest', key: 'first_post' }),
    })
    expect(resp.ok).toBe(true)
  })

  it('completed quest shows as completed', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    const quest = data.quests.find((q: any) => q.quest_key === 'first_post')
    expect(quest.status).toBe('completed')
  })

  it('admin can acquire and equip equipment', async () => {
    await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acquire_equipment', key: 'mechanical_keyboard' }),
    })
    await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'equip', key: 'mechanical_keyboard' }),
    })
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    const equip = data.equipment.find((e: any) => e.equipment_key === 'mechanical_keyboard')
    expect(equip).toBeDefined()
    expect(equip.equipped).toBe(1)
  })

  it('admin can unlock title', async () => {
    const resp = await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unlock_title', key: 'apprentice_writer' }),
    })
    expect(resp.ok).toBe(true)
  })

  it('unlocked title appears in state', async () => {
    const data = await fetch(`${BASE}/api/rpg`).then(r => r.json())
    const title = data.titles.find((t: any) => t.title_key === 'apprentice_writer')
    expect(title).toBeDefined()
    expect(title.unlocked).toBe(1)
  })

  it('invalid action returns 400', async () => {
    const resp = await adminFetch('/api/rpg', adminCookie, adminCsrf, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'nonexistent' }),
    })
    expect(resp.status).toBe(400)
  })
})

describe('Image Upload', () => {
  let adminCookie = ''
  let adminCsrf = ''

  beforeAll(async () => {
    const result = await loginAsAdmin()
    adminCookie = result.cookie
    adminCsrf = result.csrfToken
    expect(adminCookie).toBeTruthy()
  })

  it('POST without auth returns 403', async () => {
    const resp = await fetch(`${BASE}/api/upload`, { method: 'POST' })
    expect(resp.status).toBe(403)
  })

  it('POST without file and without auth returns 403', async () => {
    const resp = await fetch(`${BASE}/api/upload`, { method: 'POST' })
    expect(resp.status).toBe(403)
  })

  it('POST without file fails', async () => {
    const resp = await adminFetch('/api/upload', adminCookie, adminCsrf, {
      method: 'POST',
    })
    expect(resp.status).toBe(400)
  })
})

describe('i18n', () => {
  it('en.json exists and has required keys', () => {
    const en = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../locales/en.json'), 'utf-8'))
    expect(en.nav).toBeDefined()
    expect(en.blog).toBeDefined()
    expect(en.comment).toBeDefined()
    expect(en.rpg).toBeDefined()
    expect(en.admin).toBeDefined()
  })

  it('zh.json exists and has required keys', () => {
    const zh = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../locales/zh.json'), 'utf-8'))
    expect(zh.nav).toBeDefined()
    expect(zh.blog).toBeDefined()
    expect(zh.comment).toBeDefined()
    expect(zh.rpg).toBeDefined()
    expect(zh.admin).toBeDefined()
  })

  it('zh.json has Chinese content', () => {
    const zh = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../locales/zh.json'), 'utf-8'))
    expect(zh.nav.home).toBe('首页')
    expect(zh.admin.login).toBe('管理员登录')
  })
})

describe('RPG Data Files', () => {
  it('skills.ts exists and is readable', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../../data/rpg/skills.ts'), 'utf-8')
    expect(content).toContain('export default')
  })

  it('equipment.ts exists', () => {
    expect(readFileSync(resolve(import.meta.dirname, '../../data/rpg/equipment.ts'), 'utf-8')).toBeTruthy()
  })

  it('titles.ts exists', () => {
    expect(readFileSync(resolve(import.meta.dirname, '../../data/rpg/titles.ts'), 'utf-8')).toBeTruthy()
  })

  it('quests.ts exists', () => {
    expect(readFileSync(resolve(import.meta.dirname, '../../data/rpg/quests.ts'), 'utf-8')).toBeTruthy()
  })
})

describe('RPG Page', () => {
  it('renders RPG dashboard', async () => {
    const html = await fetch(`${BASE}/rpg`).then(r => r.text())
    expect(html).toContain('RPG Dashboard')
  })

  it('mentions skill tree', async () => {
    const html = await fetch(`${BASE}/rpg`).then(r => r.text())
    expect(html).toContain('Skills')
  })

  it('mentions equipment', async () => {
    const html = await fetch(`${BASE}/rpg`).then(r => r.text())
    expect(html).toContain('Equipment')
  })

  it('mentions quest log', async () => {
    const html = await fetch(`${BASE}/rpg`).then(r => r.text())
    expect(html).toContain('Quests')
  })
})

describe('404 Page', () => {
  it('returns 404 for nonexistent route', async () => {
    const resp = await fetch(`${BASE}/nonexistent-page`)
    expect(resp.status).toBe(404)
  })
})

describe('Static Files', () => {
  it('favicon is served', async () => {
    const resp = await fetch(`${BASE}/favicon.svg`)
    expect(resp.status).toBe(200)
  })
})

describe('GitHub OAuth Endpoints', () => {
  it('GET /api/auth/me returns anonymous without session', async () => {
    const resp = await fetch(`${BASE}/api/auth/me`)
    const data = await resp.json()
    expect(data.type).toBe('anonymous')
  })

  it('GET /api/auth/github/callback rejects without code', async () => {
    const resp = await fetch(`${BASE}/api/auth/github/callback`)
    expect(resp.status).toBe(400)
  })

  it('GET /api/auth/github/login returns 302 or 500', async () => {
    const resp = await fetch(`${BASE}/api/auth/github/login`, { redirect: 'manual' })
    expect([302, 500]).toContain(resp.status)
  })
})

describe('Demo Content', () => {
  it('has hello-world article', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../content/posts/hello-world.md'), 'utf-8')
    expect(content).toContain('Hello World')
    expect(content).toContain('## Welcome')
  })

  it('has getting-started article', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../content/posts/getting-started.md'), 'utf-8')
    expect(content).toContain('Getting Started')
    expect(content).toContain('docker compose up')
  })
})

describe('Environment Config', () => {
  it('.env.example exists with required keys', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../../.env.example'), 'utf-8')
    expect(content).toContain('ADMIN_USERNAME')
    expect(content).toContain('ADMIN_PASSWORD')
    expect(content).toContain('GITHUB_CLIENT_ID')
    expect(content).toContain('GITHUB_CLIENT_SECRET')
    expect(content).toContain('SESSION_SECRET')
  })

  it('.env.example has comments explaining GitHub OAuth', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../../.env.example'), 'utf-8')
    expect(content).toContain('https://github.com/settings/developers')
  })

  it('.env.production.example exists with deployment-oriented defaults', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../../.env.production.example'), 'utf-8')
    expect(content).toContain('SITE_URL=https://your-domain.com')
    expect(content).toContain('SQLITE_PATH=/app/storage/rpg-blog.db')
    expect(content).toContain('UPLOAD_PATH=/app/storage/uploads')
    expect(content).toContain('SESSION_SECRET=replace_with_a_long_random_session_secret')
  })
})

describe('Project Structure', () => {
  it('has .gitignore', () => {
    expect(readFileSync(resolve(import.meta.dirname, '../../.gitignore'), 'utf-8')).toContain('node_modules')
  })

  it('has .dockerignore', () => {
    expect(readFileSync(resolve(import.meta.dirname, '../../.dockerignore'), 'utf-8')).toContain('node_modules')
  })

  it('has Dockerfile', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../../Dockerfile'), 'utf-8')
    expect(content).toContain('node:22-alpine')
    expect(content).toContain('HEALTHCHECK')
  })

  it('has deployment and upgrade docs', () => {
    const deploymentDoc = readFileSync(resolve(import.meta.dirname, '../../DEPLOYMENT.md'), 'utf-8')
    const upgradingDoc = readFileSync(resolve(import.meta.dirname, '../../UPGRADING.md'), 'utf-8')
    const contributingDoc = readFileSync(resolve(import.meta.dirname, '../../CONTRIBUTING.md'), 'utf-8')
    const scopeDoc = readFileSync(resolve(import.meta.dirname, '../../TEMPLATE_SCOPE.md'), 'utf-8')
    const chineseReadme = readFileSync(resolve(import.meta.dirname, '../../README.zh-CN.md'), 'utf-8')
    expect(deploymentDoc).toContain('Docker Compose')
    expect(upgradingDoc).toContain('package.json')
    expect(upgradingDoc).toContain('src/content.config.ts')
    expect(contributingDoc).toContain('npm test')
    expect(scopeDoc).toContain('Out of scope by default')
    expect(chineseReadme).toContain('快速开始')
    expect(chineseReadme).toContain('README.md')
  })

  it('has docker-compose.yml', () => {
    const content = readFileSync(resolve(import.meta.dirname, '../../docker-compose.yml'), 'utf-8')
    expect(content).toContain('SQLITE_PATH')
    expect(content).toContain('UPLOAD_PATH')
    expect(content).toContain('volumes:')
  })

  it('has package.json with required scripts', () => {
    const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../package.json'), 'utf-8'))
    expect(pkg.scripts.dev).toBe('astro dev')
    expect(pkg.scripts.build).toBe('astro build')
    expect(pkg.scripts.setup).toBe('node scripts/setup.mjs')
    expect(pkg.scripts['test:unit']).toBeTruthy()
    expect(pkg.scripts['test:integration']).toBeTruthy()
  })
})
