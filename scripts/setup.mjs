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
export const VALID_WIZARD_LOCALES = ['zh', 'en']
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
  toolbox1TitleZh: '羽笔与地图',
  toolbox1TitleEn: 'Quill And Map',
  toolbox1DetailZh: '记录草稿、复盘、路线图和发布节奏。',
  toolbox1DetailEn: 'Drafts, retrospectives, route maps, and publishing rhythms.',
  toolbox1Href: '',
  toolbox2TitleZh: '工坊道具',
  toolbox2TitleEn: 'Workshop Items',
  toolbox2DetailZh: '存放正在打磨的作品、实验和可复用资源。',
  toolbox2DetailEn: 'Works, experiments, and reusable resources currently being refined.',
  toolbox2Href: '',
  content: 'keep',
  wizardLocale: 'zh',
}

const wizardText = {
  zh: {
    title: 'rpg-blog 公会初始化向导',
    hint: '直接按回车会保留推荐默认值。',
    complete: '公会初始化向导完成。',
    theme: '主题',
    effects: '氛围效果',
    none: '无',
    contentMode: '内容模式',
    created: '已创建',
    removedPosts: '已移除手札',
    next: '下一步：本地运行 npm run dev 预览，部署前运行 npm run build。',
    toolboxHint: '道具栏工具箱内容也可以之后在 site.config.ts 的 home.toolbox 修改。',
    labels: {
      siteUrl: '站点地址',
      titleZh: '中文站点标题',
      titleEn: '英文 UI 站点标题',
      descriptionZh: '中文副标题',
      descriptionEn: '英文 UI 副标题',
      introZh: '中文首页介绍',
      introEn: '英文 UI 首页介绍',
      authorZh: '中文作者名称',
      authorEn: '英文 UI 作者名称',
      bioZh: '中文作者简介',
      bioEn: '英文 UI 作者简介',
      avatar: '作者头像路径',
      github: 'GitHub 社交链接',
      twitter: 'Twitter/X 社交链接',
      website: '个人网站链接',
      locale: '默认 UI 语言 (zh/en)',
      theme: '公会主题 (guild)',
      background: '可选自定义背景路径',
      effects: '公会氛围效果，多个用英文逗号分隔',
      showAbout: '显示角色档案页 (true/false)',
      showTags: '显示线索页 (true/false)',
      showArchive: '显示手札归档页 (true/false)',
      showToolbox: '显示道具栏工具箱 (true/false)',
      toolbox1TitleZh: '工具箱条目 1 中文标题',
      toolbox1TitleEn: '工具箱条目 1 英文 UI 标题',
      toolbox1DetailZh: '工具箱条目 1 中文说明',
      toolbox1DetailEn: '工具箱条目 1 英文 UI 说明',
      toolbox1Href: '工具箱条目 1 链接，可留空',
      toolbox2TitleZh: '工具箱条目 2 中文标题',
      toolbox2TitleEn: '工具箱条目 2 英文 UI 标题',
      toolbox2DetailZh: '工具箱条目 2 中文说明',
      toolbox2DetailEn: '工具箱条目 2 英文 UI 说明',
      toolbox2Href: '工具箱条目 2 链接，可留空',
      content: '内容模式 (keep/starter/clear)',
    },
  },
  en: {
    title: 'rpg-blog Guild Setup Wizard',
    hint: 'Press Enter to keep the recommended default.',
    complete: 'Guild Setup Wizard complete.',
    theme: 'Theme',
    effects: 'Effects',
    none: 'none',
    contentMode: 'Content mode',
    created: 'Created',
    removedPosts: 'Removed posts',
    next: 'Next: run npm run dev locally, then npm run build before deployment.',
    toolboxHint: 'You can also edit Inventory Toolkit items later in site.config.ts under home.toolbox.',
    labels: {
      siteUrl: 'Site URL',
      titleZh: 'Chinese site title',
      titleEn: 'English UI site title',
      descriptionZh: 'Chinese subtitle',
      descriptionEn: 'English UI subtitle',
      introZh: 'Chinese homepage intro',
      introEn: 'English UI homepage intro',
      authorZh: 'Chinese author name',
      authorEn: 'English UI author name',
      bioZh: 'Chinese author bio',
      bioEn: 'English UI author bio',
      avatar: 'Author avatar path',
      github: 'GitHub social URL',
      twitter: 'Twitter/X social URL',
      website: 'Website social URL',
      locale: 'Default UI locale (zh/en)',
      theme: 'Guild theme (guild)',
      background: 'Optional custom background path',
      effects: 'Atmospheric guild effects, comma separated',
      showAbout: 'Show Profile (true/false)',
      showTags: 'Show clues page (true/false)',
      showArchive: 'Show Journal Archive (true/false)',
      showToolbox: 'Show Inventory Toolkit (true/false)',
      toolbox1TitleZh: 'Toolkit item 1 Chinese title',
      toolbox1TitleEn: 'Toolkit item 1 English UI title',
      toolbox1DetailZh: 'Toolkit item 1 Chinese detail',
      toolbox1DetailEn: 'Toolkit item 1 English UI detail',
      toolbox1Href: 'Toolkit item 1 link, optional',
      toolbox2TitleZh: 'Toolkit item 2 Chinese title',
      toolbox2TitleEn: 'Toolkit item 2 English UI title',
      toolbox2DetailZh: 'Toolkit item 2 Chinese detail',
      toolbox2DetailEn: 'Toolkit item 2 English UI detail',
      toolbox2Href: 'Toolkit item 2 link, optional',
      content: 'Content mode (keep/starter/clear)',
    },
  },
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

export function normalizeWizardLocale(value) {
  return normalizeChoice(value, VALID_WIZARD_LOCALES, defaults.wizardLocale)
}

export function getWizardText(locale) {
  return wizardText[normalizeWizardLocale(locale)]
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
    const wizardLocale = normalizeWizardLocale(
      await rl.question(`向导语言 / Wizard language (zh/en) [${defaults.wizardLocale}]: `),
    )
    const text = getWizardText(wizardLocale)
    const labels = text.labels
    output.write(`\n${text.title}\n`)
    output.write(`${text.hint}\n\n`)
    return {
      wizardLocale,
      siteUrl: await ask('siteUrl', labels.siteUrl),
      titleZh: await ask('titleZh', labels.titleZh),
      titleEn: await ask('titleEn', labels.titleEn),
      descriptionZh: await ask('descriptionZh', labels.descriptionZh),
      descriptionEn: await ask('descriptionEn', labels.descriptionEn),
      introZh: await ask('introZh', labels.introZh),
      introEn: await ask('introEn', labels.introEn),
      authorZh: await ask('authorZh', labels.authorZh),
      authorEn: await ask('authorEn', labels.authorEn),
      bioZh: await ask('bioZh', labels.bioZh),
      bioEn: await ask('bioEn', labels.bioEn),
      avatar: await ask('avatar', labels.avatar),
      github: await ask('github', labels.github),
      twitter: await ask('twitter', labels.twitter),
      website: await ask('website', labels.website),
      locale: await ask('locale', labels.locale),
      theme: await ask('theme', labels.theme),
      background: await ask('background', labels.background),
      effects: await ask('effects', labels.effects),
      showAbout: await ask('showAbout', labels.showAbout),
      showTags: await ask('showTags', labels.showTags),
      showArchive: await ask('showArchive', labels.showArchive),
      showToolbox: await ask('showToolbox', labels.showToolbox),
      toolbox1TitleZh: await ask('toolbox1TitleZh', labels.toolbox1TitleZh),
      toolbox1TitleEn: await ask('toolbox1TitleEn', labels.toolbox1TitleEn),
      toolbox1DetailZh: await ask('toolbox1DetailZh', labels.toolbox1DetailZh),
      toolbox1DetailEn: await ask('toolbox1DetailEn', labels.toolbox1DetailEn),
      toolbox1Href: await ask('toolbox1Href', labels.toolbox1Href),
      toolbox2TitleZh: await ask('toolbox2TitleZh', labels.toolbox2TitleZh),
      toolbox2TitleEn: await ask('toolbox2TitleEn', labels.toolbox2TitleEn),
      toolbox2DetailZh: await ask('toolbox2DetailZh', labels.toolbox2DetailZh),
      toolbox2DetailEn: await ask('toolbox2DetailEn', labels.toolbox2DetailEn),
      toolbox2Href: await ask('toolbox2Href', labels.toolbox2Href),
      content: await ask('content', labels.content),
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

function renderToolboxItem(titleZh, titleEn, detailZh, detailEn, href) {
  const hrefLine = href ? `\n        href: '${escapeSingleQuoted(href)}',` : ''
  return `      {
        title: {
          zh: '${escapeSingleQuoted(titleZh)}',
          en: '${escapeSingleQuoted(titleEn)}',
        },
        detail: {
          zh: '${escapeSingleQuoted(detailZh)}',
          en: '${escapeSingleQuoted(detailEn)}',
        },${hrefLine}
      }`
}

export function buildSiteConfigSource(_current, rawConfig) {
  const locale = normalizeChoice(rawConfig.locale, VALID_LOCALES, defaults.locale)
  const theme = normalizeChoice(rawConfig.theme, VALID_THEMES, defaults.theme)
  const effects = parseEffects(rawConfig.effects)
  const contentMode = normalizeContentMode(rawConfig.content)
  const background = rawConfig.background || ''

  const config = {
    ...defaults,
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
${renderToolboxItem(config.toolbox1TitleZh, config.toolbox1TitleEn, config.toolbox1DetailZh, config.toolbox1DetailEn, config.toolbox1Href)},
${renderToolboxItem(config.toolbox2TitleZh, config.toolbox2TitleEn, config.toolbox2DetailZh, config.toolbox2DetailEn, config.toolbox2Href)},
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
  const text = getWizardText(rawConfig.wizardLocale)
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

  output.write(`\n${text.complete}\n`)
  output.write(`${text.theme}: ${config.theme}\n`)
  output.write(`${text.effects}: ${config.effects.join(', ') || text.none}\n`)
  output.write(`${text.contentMode}: ${contentResult.mode}\n`)
  if (contentResult.createdFile) output.write(`${text.created}: src/content/posts/${contentResult.createdFile}\n`)
  if (contentResult.removedFiles.length > 0) output.write(`${text.removedPosts}: ${contentResult.removedFiles.join(', ')}\n`)
  output.write(`${text.toolboxHint}\n`)
  output.write(`\n${text.next}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
