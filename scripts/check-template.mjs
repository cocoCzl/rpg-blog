import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const checks = []

function addCheck(name, ok, message) {
  checks.push({ name, ok, message })
}

async function readIfExists(path) {
  if (!existsSync(path)) return ''
  return readFile(path, 'utf8')
}

async function listFiles(dir, predicate = () => true) {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(path, predicate))
    if (entry.isFile() && predicate(path)) files.push(path)
  }
  return files
}

const publicDocs = [
  'README.md',
  'README.zh-CN.md',
  'CUSTOMIZATION.md',
  'DEPLOYMENT.md',
  'UPGRADING.md',
  'TEMPLATE_SCOPE.md',
  'SECURITY.md',
  'ASSET_LICENSES.md',
]

const forbiddenPublicTerms = [
  /ADMIN_PASSWORD/,
  /SESSION_SECRET/,
  /GitHub OAuth/i,
  /SQLite/i,
  /UPLOAD_PATH/,
  /\/api\/comments/,
  /\/api\/rpg/,
  /data\/rpg/,
  /components\/vue/,
  /cozy-farm/i,
  /homestead/i,
  /seasonal farm/i,
  /farm-(spring|autumn)/i,
  /NES\.css/i,
]

const docsText = (await Promise.all(publicDocs.map(readIfExists))).join('\n')
addCheck(
  'public docs describe the JRPG guild template',
  docsText.includes('JRPG') && docsText.includes('Guild') && docsText.includes('Save Slots'),
  'Public docs should sell the JRPG Guild Menu identity.'
)
addCheck(
  'public docs do not present discarded farm or NES direction',
  forbiddenPublicTerms.every((pattern) => !pattern.test(docsText)),
  'Remove old backend/admin/farm/NES direction from public docs.'
)

const postFiles = await listFiles('src/content/posts', (path) => /\.(md|mdx)$/.test(path))
const postText = (await Promise.all(postFiles.map(readIfExists))).join('\n')
addCheck(
  'default posts are Guild Sample Journal content',
  /第一份委托|地图桌|道具栏|章节路线图|黄昏存档点/.test(postText),
  'Default posts should demonstrate the Guild Sample Journal.'
)
addCheck(
  'default posts avoid setup instructions and discarded farm vocabulary',
  !/(setup|deploy|docker|site\.config|README|template profile|OAuth|SQLite|admin|农场|田地|播种|收获)/i.test(postText),
  'Default posts should not teach setup or revive the farm direction.'
)

const requiredAssets = [
  'public/images/scenes/guild-hall.svg',
  'public/images/departure-cover.webp',
  'public/images/build-log-cover.webp',
  'public/images/toolbox-cover.webp',
]

const requiredPublicFiles = ['LICENSE', 'SECURITY.md', 'CHANGELOG.md', 'ASSET_LICENSES.md', 'GITHUB_RELEASE.md', '.github/dependabot.yml']
for (const file of requiredPublicFiles) {
  addCheck(`public template file exists: ${file}`, existsSync(file), `Add ${file} before publishing the template.`)
}

for (const asset of requiredAssets) {
  const ok = existsSync(asset) && (await stat(asset)).size > 0
  addCheck(`asset exists: ${asset}`, ok, `Add a local static asset at ${asset}.`)
}

const sourceFiles = await listFiles('src', (path) => /\.(astro|ts|tsx|js|mjs|vue)$/.test(path))
const sourceText = (await Promise.all(sourceFiles.map(readIfExists))).join('\n')
addCheck(
  'source has no removed runtime feature vocabulary',
  !/(better-sqlite3|@astrojs\/node|@astrojs\/vue|pinia|SESSION_SECRET|UPLOAD_PATH|\/api\/rpg|\/api\/comments|admin\/login|showRpgFlavor|starfall|adventurer)/.test(sourceText),
  'Remove stale runtime backend references from source files.'
)
addCheck(
  'source uses guild homepage structure',
  /Command Menu|command_menu|Quest Board|Save Slots|save-slot|Character Slot|profile-card/.test(sourceText),
  'Homepage source should expose Command Menu, Character Slot, Quest Board, and Save Slots.'
)
addCheck(
  'source rejects discarded farm and NES UI vocabulary',
  !/(farm-entrance|pixel-farm|farm-place|farm-scene|nes-container|nes-btn|spring|autumn|petals|leaves)/i.test(sourceText),
  'Remove discarded farm/NES UI terms from public source.'
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
