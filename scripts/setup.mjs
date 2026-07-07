import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { applyContentMode, normalizeContentMode } from './setup-content.mjs'

const siteConfigPath = new URL('../site.config.ts', import.meta.url)
const envExamplePath = new URL('../.env.example', import.meta.url)
const envPath = new URL('../.env', import.meta.url)
const postsDirPath = new URL('../src/content/posts/', import.meta.url)

export const VALID_LOCALES = ['zh', 'en']
export const VALID_THEMES = ['guild']
export const VALID_EFFECTS = ['embers', 'mist', 'stars']

const defaults = {
  siteUrl: 'http://localhost:4321',
  titleZh: '企鹅工会',
  titleEn: 'Penguin Guild',
  descriptionZh: '一套像进入像素 RPG 公会菜单一样打开的个人博客模板。',
  descriptionEn: 'A personal blog template that opens like a polished pixel RPG guild menu.',
  introZh: '任务板显示置顶手札，存档栏收纳最近记录，指令菜单带你进入章节、线索和个人档案。',
  introEn: 'The quest board highlights a pinned entry, save slots hold recent notes, and the command menu opens chapters, clues, and profile paths.',
  authorZh: '未命名记录员',
  authorEn: 'Unnamed Scribe',
  bioZh: '在公会大厅、地图桌和道具栏之间整理见闻，把每次出发写成可以回看的冒险手札。',
  bioEn: 'Collecting notes between the guild hall, map table, and inventory, then saving each departure as a journal entry.',
  avatar: '',
  github: '',
  twitter: '',
  website: '',
  locale: 'zh',
  theme: 'guild',
  background: '',
  effects: 'embers,mist',
  showAbout: 'true',
  showTags: 'true',
  showArchive: 'true',
  showToolbox: 'true',
  content: 'keep',
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue
    const raw = arg.slice(2)
    const [key, inlineValue] = raw.split('=')
    if (key === 'yes' || key === 'non-interactive') {
      values.nonInteractive = 'true'
      continue
    }
    values[key] = inlineValue ?? argv[index + 1] ?? ''
    if (inlineValue === undefined && argv[index + 1] && !argv[index + 1].startsWith('--')) index += 1
  }
  return values
}

function escapeSingleQuoted(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function normalizeChoice(value, allowed, fallback) {
  const normalized = String(value || '').trim().toLowerCase()
  return allowed.includes(normalized) ? normalized : fallback
}

function parseEffects(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => VALID_EFFECTS.includes(item))
}

function parseBoolean(value, fallback = true) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return fallback
  return ['1', 'true', 'yes', 'y', 'on'].includes(normalized)
}

async function promptForConfig(args) {
  if (args.nonInteractive === 'true') return { ...defaults, ...args }

  const rl = createInterface({ input, output })
  async function ask(key, label) {
    const value = await rl.question(`${label} [${defaults[key]}]: `)
    return value.trim() || defaults[key]
  }

  try {
    output.write('\nrpg-blog Guild Setup Wizard\n')
    output.write('Press Enter to keep the recommended default.\n\n')
    return {
      siteUrl: await ask('siteUrl', 'Site URL'),
      titleZh: await ask('titleZh', 'Chinese site title'),
      titleEn: await ask('titleEn', 'English UI site title'),
      descriptionZh: await ask('descriptionZh', 'Chinese subtitle'),
      descriptionEn: await ask('descriptionEn', 'English UI subtitle'),
      introZh: await ask('introZh', 'Chinese homepage intro'),
      introEn: await ask('introEn', 'English UI homepage intro'),
      authorZh: await ask('authorZh', 'Chinese author name'),
      authorEn: await ask('authorEn', 'English UI author name'),
      bioZh: await ask('bioZh', 'Chinese author bio'),
      bioEn: await ask('bioEn', 'English UI author bio'),
      avatar: await ask('avatar', 'Author avatar path'),
      github: await ask('github', 'GitHub social URL'),
      twitter: await ask('twitter', 'Twitter/X social URL'),
      website: await ask('website', 'Website social URL'),
      locale: await ask('locale', 'Default UI locale (zh/en)'),
      theme: await ask('theme', 'Guild theme (guild)'),
      background: await ask('background', 'Optional custom background path'),
      effects: await ask('effects', 'Atmospheric guild effects, comma separated'),
      showAbout: await ask('showAbout', 'Show Profile (true/false)'),
      showTags: await ask('showTags', 'Show clues page (true/false)'),
      showArchive: await ask('showArchive', 'Show Journal Archive (true/false)'),
      showToolbox: await ask('showToolbox', 'Show Inventory Toolkit (true/false)'),
      content: await ask('content', 'Content mode (keep/starter/clear)'),
    }
  } finally {
    rl.close()
  }
}

async function ensureEnvFile() {
  try {
    await access(envPath, constants.F_OK)
  } catch {
    await writeFile(envPath, await readFile(envExamplePath, 'utf8'), 'utf8')
  }
}

function renderLocalized(zh, en) {
  return `{\n    zh: '${escapeSingleQuoted(zh)}',\n    en: '${escapeSingleQuoted(en)}',\n  }`
}

export function buildSiteConfigSource(_current, rawConfig) {
  const locale = normalizeChoice(rawConfig.locale, VALID_LOCALES, defaults.locale)
  const theme = normalizeChoice(rawConfig.theme, VALID_THEMES, defaults.theme)
  const effects = parseEffects(rawConfig.effects)
  const contentMode = normalizeContentMode(rawConfig.content)
  const background = rawConfig.background || ''

  const config = {
    ...rawConfig,
    locale,
    theme,
    background,
    effects: effects.length > 0 ? effects : ['embers', 'mist'],
    showAbout: parseBoolean(rawConfig.showAbout, true),
    showTags: parseBoolean(rawConfig.showTags, true),
    showArchive: parseBoolean(rawConfig.showArchive, true),
    showToolbox: parseBoolean(rawConfig.showToolbox, true),
    contentMode,
  }

  const next = `import type { SiteConfig } from './src/lib/theme'

const config: SiteConfig = {
  siteUrl: process.env.SITE_URL || '${escapeSingleQuoted(config.siteUrl)}',
  locale: '${config.locale}',
  title: ${renderLocalized(config.titleZh, config.titleEn)},
  description: ${renderLocalized(config.descriptionZh, config.descriptionEn)},
  author: {
    name: ${renderLocalized(config.authorZh, config.authorEn)},
    avatar: '${escapeSingleQuoted(config.avatar)}',
    bio: ${renderLocalized(config.bioZh, config.bioEn)},
  },
  social: {
    github: '${escapeSingleQuoted(config.github)}',
    twitter: '${escapeSingleQuoted(config.twitter)}',
    website: '${escapeSingleQuoted(config.website)}',
  },
  home: {
    intro: ${renderLocalized(config.introZh, config.introEn)},
    focus: [
      {
        title: {
          zh: '当前状态',
          en: 'Current Status',
        },
        detail: {
          zh: '整理新的冒险记录，打磨公会菜单的每个入口。',
          en: 'Sorting new journal entries and polishing every guild menu route.',
        },
      },
      {
        title: {
          zh: '章节路线',
          en: 'Chapter Routes',
        },
        detail: {
          zh: '技术、阅读、生活和项目被归入不同章节，方便回看。',
          en: 'Technology, reading, life, and projects are grouped into readable chapters.',
        },
      },
      {
        title: {
          zh: '下一份委托',
          en: 'Next Commission',
        },
        detail: {
          zh: '把道具栏里的方法、灵感和链接整理成下一篇手札。',
          en: 'Turning inventory methods, ideas, and links into the next journal entry.',
        },
      },
    ],
    toolbox: [
      {
        title: {
          zh: '羽笔与地图',
          en: 'Quill And Map',
        },
        detail: {
          zh: '记录草稿、复盘、路线图和发布节奏。',
          en: 'Drafts, retrospectives, route maps, and publishing rhythms.',
        },
      },
      {
        title: {
          zh: '工坊道具',
          en: 'Workshop Items',
        },
        detail: {
          zh: '存放正在打磨的作品、实验和可复用资源。',
          en: 'Works, experiments, and reusable resources currently being refined.',
        },
      },
    ],
  },
  theme: {
    preset: '${config.theme}',
    backgroundImage: '${escapeSingleQuoted(config.background)}',
    effects: [${config.effects.map((effect) => `'${effect}'`).join(', ')}],
  },
  display: {
    showAbout: ${config.showAbout},
    showTags: ${config.showTags},
    showArchive: ${config.showArchive},
    showToolbox: ${config.showToolbox},
  },
  postsPerPage: 6,
}

export default config
`

  return { source: next, config }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const rawConfig = await promptForConfig(args)
  const current = await readFile(siteConfigPath, 'utf8')
  const { source, config } = buildSiteConfigSource(current, rawConfig)

  await writeFile(siteConfigPath, source, 'utf8')
  await ensureEnvFile()

  const env = await readFile(envPath, 'utf8')
  const nextEnv = /^SITE_URL=/m.test(env)
    ? env.replace(/^SITE_URL=.*$/m, `SITE_URL=${config.siteUrl}`)
    : `${env.replace(/\s*$/, '\n')}SITE_URL=${config.siteUrl}\n`
  await writeFile(envPath, nextEnv, 'utf8')

  const contentResult = await applyContentMode({
    postsDir: postsDirPath,
    siteTitle: config.titleZh,
    authorName: config.authorZh,
    mode: config.contentMode,
  })

  output.write('\nGuild Setup Wizard complete.\n')
  output.write(`Theme: ${config.theme}\n`)
  output.write(`Effects: ${config.effects.join(', ') || 'none'}\n`)
  output.write(`Content mode: ${contentResult.mode}\n`)
  if (contentResult.createdFile) output.write(`Created: src/content/posts/${contentResult.createdFile}\n`)
  if (contentResult.removedFiles.length > 0) output.write(`Removed posts: ${contentResult.removedFiles.join(', ')}\n`)
  output.write('\nNext: run npm run dev locally, then npm run build before deployment.\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
