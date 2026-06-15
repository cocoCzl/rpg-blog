import { readFile, writeFile, access, mkdir } from 'node:fs/promises'
import { constants } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { randomBytes } from 'node:crypto'
import { TEMPLATE_PROFILES, getTemplateProfileFeatures, needsGithubOAuth, normalizeTemplateProfile } from './setup-profiles.mjs'
import { normalizeContentMode, replaceDemoContent } from './setup-content.mjs'
import { buildPostSetupChecklist } from './setup-checklist.mjs'

const siteConfigPath = new URL('../site.config.ts', import.meta.url)
const envExamplePath = new URL('../.env.example', import.meta.url)
const envPath = new URL('../.env', import.meta.url)
const uploadDirPath = new URL('../data/uploads', import.meta.url)
const postsDirPath = new URL('../src/content/posts/', import.meta.url)

const rl = createInterface({ input, output })
const VALID_LOCALES = new Set(['en', 'zh'])
const VALID_PRESETS = new Set(['ocean', 'forest', 'twilight'])

function escapeSingleQuoted(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function prompt(label, fallback) {
  const value = await rl.question(`${label} [${fallback}]: `)
  return value.trim() || fallback
}

async function promptOptional(label, fallback = '') {
  const suffix = fallback ? ` [${fallback}]` : ' [leave blank to disable]'
  const value = await rl.question(`${label}${suffix}: `)
  return value.trim() || fallback
}

async function promptBoolean(label, fallback) {
  const fallbackLabel = fallback ? 'y' : 'n'
  const value = await rl.question(`${label} [${fallbackLabel}]: `)
  if (!value.trim()) return fallback
  return ['y', 'yes', 'true', '1'].includes(value.trim().toLowerCase())
}

async function promptTemplateProfile() {
  output.write('\nTemplate profiles:\n')
  output.write('  plain    - standard blog, no comments, no RPG\n')
  output.write('  comments - blog with GitHub comments, no RPG\n')
  output.write('  rpg      - blog with comments and RPG dashboard\n')
  output.write('  manual   - choose feature toggles yourself\n\n')
  const value = await rl.question('Template profile [rpg]: ')
  return normalizeTemplateProfile(value || 'rpg')
}

async function promptContentMode() {
  output.write('\nStarter content:\n')
  output.write('  replace - remove demo posts and create one starter post for your site\n')
  output.write('  keep    - keep the existing demo posts\n\n')
  const value = await rl.question('Starter content mode [replace]: ')
  return normalizeContentMode(value || 'replace')
}

async function ensureEnvFile() {
  try {
    await access(envPath, constants.F_OK)
  } catch {
    const example = await readFile(envExamplePath, 'utf8')
    await writeFile(envPath, example, 'utf8')
  }
}

function normalizeLocale(value) {
  const normalized = value.trim().toLowerCase()
  return VALID_LOCALES.has(normalized) ? normalized : 'en'
}

function normalizePreset(value) {
  const normalized = value.trim().toLowerCase()
  return VALID_PRESETS.has(normalized) ? normalized : 'twilight'
}

function setOrAppendEnvValue(content, key, value) {
  const line = `${key}=${value}`
  if (new RegExp(`^${key}=.*$`, 'm').test(content)) {
    return content.replace(new RegExp(`^${key}=.*$`, 'm'), line)
  }
  return `${content.replace(/\s*$/, '\n')}${line}\n`
}

async function main() {
  const profile = await promptTemplateProfile()
  const contentMode = await promptContentMode()
  const siteTitle = await prompt('Site title', 'My Blog')
  const description = await prompt('Description', 'A blog about code, worlds, and side quests.')
  const homeIntro = await prompt('Homepage intro', 'Use this space for a short site introduction, publishing focus, or editorial note.')
  const authorName = await prompt('Author name', 'Site Owner')
  const authorAvatar = await promptOptional('Author avatar URL or path')
  const authorBio = await prompt('Author bio', 'Write a short introduction so readers know what this site is about.')
  const siteUrl = await prompt('Site URL', 'http://localhost:4321')
  const locale = normalizeLocale(await prompt('Locale (en/zh)', 'en'))
  const preset = normalizePreset(await prompt('Theme preset (ocean/forest/twilight)', 'twilight'))
  const githubUrl = await promptOptional('GitHub profile URL')
  const twitterUrl = await promptOptional('Twitter / X profile URL')
  const websiteUrl = await promptOptional('Personal website URL')
  const adminUsername = await prompt('Admin username', 'admin')
  const adminPassword = await prompt('Admin password', randomBytes(18).toString('base64url'))
  const profileFeatures = getTemplateProfileFeatures(profile)
  const enableComments = profileFeatures ? profileFeatures.comments : await promptBoolean('Enable comments', true)
  const enableGithubOAuth = profileFeatures
    ? profileFeatures.githubOAuth
    : enableComments
      ? await promptBoolean('Enable GitHub OAuth comments', true)
      : false
  const enableRpg = profileFeatures ? profileFeatures.rpg : await promptBoolean('Enable RPG dashboard', true)
  const sessionSecret = randomBytes(32).toString('base64url')

  const siteConfig = await readFile(siteConfigPath, 'utf8')
  const nextSiteConfig = siteConfig
    .replace(/siteUrl: .*?\n/, `siteUrl: process.env.SITE_URL || '${escapeSingleQuoted(siteUrl)}',\n`)
    .replace(/title: .*?\n/, `title: '${escapeSingleQuoted(siteTitle)}',\n`)
    .replace(/description: .*?\n/, `description: '${escapeSingleQuoted(description)}',\n`)
    .replace(/intro: .*?\n/, `intro: '${escapeSingleQuoted(homeIntro)}',\n`)
    .replace(/name: .*?\n/, `name: '${escapeSingleQuoted(authorName)}',\n`)
    .replace(/avatar: .*?\n/, `avatar: '${escapeSingleQuoted(authorAvatar)}',\n`)
    .replace(/bio: .*?\n/, `bio: '${escapeSingleQuoted(authorBio)}',\n`)
    .replace(/github: .*?\n/, `github: '${escapeSingleQuoted(githubUrl)}',\n`)
    .replace(/twitter: .*?\n/, `twitter: '${escapeSingleQuoted(twitterUrl)}',\n`)
    .replace(/website: .*?\n/, `website: '${escapeSingleQuoted(websiteUrl)}',\n`)
    .replace(/preset: .*?\n/, `preset: '${escapeSingleQuoted(preset)}',\n`)
    .replace(/locale: .*?\n/, `locale: '${escapeSingleQuoted(locale)}',\n`)
    .replace(/comments: .*?\n/, `comments: ${enableComments},\n`)
    .replace(/githubOAuth: .*?\n/, `githubOAuth: ${enableGithubOAuth},\n`)
    .replace(/rpg: .*?\n/, `rpg: ${enableRpg},\n`)

  await writeFile(siteConfigPath, nextSiteConfig, 'utf8')
  await ensureEnvFile()
  await mkdir(uploadDirPath, { recursive: true })

  const envContent = await readFile(envPath, 'utf8')
  let nextEnv = envContent
  nextEnv = setOrAppendEnvValue(nextEnv, 'SITE_URL', siteUrl)
  nextEnv = setOrAppendEnvValue(nextEnv, 'ADMIN_USERNAME', adminUsername)
  nextEnv = setOrAppendEnvValue(nextEnv, 'ADMIN_PASSWORD', adminPassword)
  nextEnv = setOrAppendEnvValue(nextEnv, 'SESSION_SECRET', sessionSecret)
  nextEnv = setOrAppendEnvValue(nextEnv, 'UPLOAD_PATH', './data/uploads')
  nextEnv = setOrAppendEnvValue(nextEnv, 'UPLOAD_URL_BASE', '/uploads')

  await writeFile(envPath, nextEnv, 'utf8')

  let contentSummary = 'Kept existing demo posts'
  if (contentMode === 'replace') {
    const contentResult = await replaceDemoContent({
      postsDir: postsDirPath,
      siteTitle,
      authorName,
      profile,
      locale,
    })
    contentSummary = `Replaced content with ${contentResult.createdFile}`
  }

  output.write('\nConfigured site.config.ts, .env, and data/uploads\n')
  output.write(`Profile: ${TEMPLATE_PROFILES[profile].label}\n`)
  output.write(`Features: comments=${enableComments}, githubOAuth=${enableGithubOAuth}, rpg=${enableRpg}\n`)
  output.write(`Content: ${contentSummary}\n`)
  if (needsGithubOAuth({ comments: enableComments, githubOAuth: enableGithubOAuth, rpg: enableRpg })) {
    output.write('Reminder: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env before enabling reader comments in production.\n')
  }
  output.write('\nNext steps:\n')
  const checklist = buildPostSetupChecklist({
    siteUrl,
    contentMode,
    features: {
      comments: enableComments,
      githubOAuth: enableGithubOAuth,
      rpg: enableRpg,
    },
  })
  checklist.forEach((item, index) => {
    output.write(`${index + 1}. ${item}\n`)
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => {
    rl.close()
  })
