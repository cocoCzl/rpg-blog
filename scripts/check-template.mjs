import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const checks = []

function addCheck(name, ok, message) {
  checks.push({ name, ok, message })
}

async function readIfExists(path) {
  if (!existsSync(path)) return ''
  return readFile(path, 'utf8')
}

const env = await readIfExists('.env')
const siteConfig = await readIfExists('site.config.ts')
const posts = existsSync('src/content/posts') ? await readdir('src/content/posts') : []

addCheck('.env exists', Boolean(env), 'Run cp .env.example .env and npm run setup.')

if (env) {
  addCheck(
    'SITE_URL is configured',
    /^SITE_URL=(?!https:\/\/your-domain\.com)(?!http:\/\/localhost:4321$).+/m.test(env),
    'Set SITE_URL to your public production URL before deployment.'
  )
  addCheck(
    'admin password is not a placeholder',
    !/^ADMIN_PASSWORD=(replace_with_a_long_random_password|change_me_immediately|your_admin_password)?$/m.test(env),
    'Set ADMIN_PASSWORD to a strong value.'
  )
  addCheck(
    'session secret is not a placeholder',
    !/^SESSION_SECRET=(replace_with_a_long_random_session_secret|change_me_to_random_string|dev-secret-change-me)?$/m.test(env),
    'Set SESSION_SECRET to a long random value.'
  )
}

addCheck(
  'site config exists',
  Boolean(siteConfig),
  'Keep site.config.ts as the primary customization entrypoint.'
)

if (siteConfig) {
  addCheck(
    'site title changed',
    !siteConfig.includes("title: 'Starter Blog'"),
    'Update title in site.config.ts.'
  )
  addCheck(
    'author name changed',
    !siteConfig.includes("name: 'Site Owner'"),
    'Update author.name in site.config.ts.'
  )
}

const demoPosts = posts.filter((post) => [
  'hello-world.md',
  'hello-world.zh.md',
  'getting-started.md',
  'getting-started.zh.md',
].includes(post))

addCheck(
  'demo posts removed or reviewed',
  demoPosts.length === 0,
  `Review or remove demo posts before publishing: ${demoPosts.join(', ')}`
)

let failed = 0
for (const check of checks) {
  if (check.ok) {
    console.log(`OK ${check.name}`)
  } else {
    failed += 1
    console.error(`FAIL ${check.name}: ${check.message}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} template check(s) failed.`)
  process.exitCode = 1
} else {
  console.log('\nTemplate checks passed.')
}
