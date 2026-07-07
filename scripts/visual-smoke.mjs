import { readFile, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const htmlChecks = [
  {
    name: 'desktop Save Board homepage shell',
    file: 'dist/index.html',
    markers: [
      'retro-hero',
      'ambiance-canvas',
      'retro-title',
      'floating-card',
      'floating-command',
      'floating-profile',
      'floating-quest',
      'save-slot',
      '指令菜单',
      '任务板',
      '最近存档',
      '第一份委托：把博客开成公会菜单',
      '/posts/guild-first-commission',
      '/posts/inventory-writing-rhythm',
      '/tags/%E5%86%99%E4%BD%9C',
    ],
  },
  {
    name: 'desktop Journal Detail Screen',
    file: 'dist/posts/guild-first-commission/index.html',
    markers: [
      'prose-content',
      'journal-paper',
      '记录来源',
      '上一份存档',
      '下一份存档',
      '/tags/%E5%86%99%E4%BD%9C',
    ],
  },
  {
    name: 'Profile route uses guild language',
    file: 'dist/about/index.html',
    markers: ['角色档案', '当前委托', '公开链接'],
  },
]

const cssChecks = [
  {
    name: 'Handheld Menu Layout stacks the save board',
    patterns: [/@media\s*\((\s*max-width\s*:\s*1080px\s*|width<=1080px)\)/, /\.floating-card/, /position:\s*relative/, /transform:\s*none/],
  },
  {
    name: 'RetroUI homepage exposes pixel UI styling',
    patterns: [/\.retro-hero/, /\.retro-title/, /\.floating-card/, /\.tilt-left/, /\.pixel-button/, /box-shadow:\s*var\(--shadow-card\)/],
  },
  {
    name: 'top navigation uses RetroUI keycap styling',
    patterns: [/\.site-brand/, /\.site-nav-links a,\s*\.language-toggle/, /border:\s*4px solid var\(--color-border\)/, /box-shadow:\s*5px 5px 0 var\(--color-border\)/],
  },
  {
    name: 'bright grid RetroUI palette is active',
    patterns: [/#1111110b/, /#F4D142|#f4d142/, /#C36AA4|#c36aa4/, /#58D6C8|#58d6c8/],
  },
  {
    name: 'pixel atmosphere stays behind readable content',
    patterns: [/#ambiance-canvas/, /#falling-effects/, /z-index:\s*-3/, /pointer-events:\s*none/],
  },
  {
    name: 'guild backdrop stays behind the document',
    patterns: [/\.site-backdrop/, /display:\s*none/],
  },
  {
    name: 'long-form reading uses readable paper styling',
    patterns: [/\.journal-paper/, /\.prose-content/, /line-height:\s*1\.85/, /font-size:\s*1\.08rem/],
  },
]

const assetChecks = [
  'dist/images/scenes/guild-hall.svg',
  'dist/images/departure-cover.webp',
]

const linkedRouteChecks = [
  'dist/posts/guild-first-commission/index.html',
  'dist/posts/inventory-writing-rhythm/index.html',
  'dist/chapters/index.html',
  'dist/chapters/启程章节/index.html',
  'dist/tags/写作/index.html',
]

let failed = 0

function pass(message) {
  console.log(`OK ${message}`)
}

function fail(message) {
  failed += 1
  console.error(`FAIL ${message}`)
}

async function readText(path) {
  if (!existsSync(path)) {
    fail(`${path} is missing`)
    return ''
  }
  return readFile(path, 'utf8')
}

if (!existsSync('dist')) {
  console.error('FAIL dist is missing. Run npm run build before npm run test:visual.')
  process.exit(1)
}

for (const check of htmlChecks) {
  const html = await readText(check.file)
  if (!html) continue
  const missing = check.markers.filter((marker) => !html.includes(marker))
  if (missing.length === 0) {
    pass(check.name)
  } else {
    fail(`${check.name} is missing marker(s): ${missing.join(', ')}`)
  }
}

const cssFiles = existsSync('dist/_astro')
  ? (await readdir('dist/_astro')).filter((file) => file.endsWith('.css'))
  : []
const css = (await Promise.all(cssFiles.map((file) => readFile(`dist/_astro/${file}`, 'utf8')))).join('\n')

if (css.length === 0) {
  fail('compiled CSS bundle is missing')
} else {
  for (const check of cssChecks) {
    const missing = check.patterns.filter((pattern) => !pattern.test(css)).map(String)
    if (missing.length === 0) {
      pass(check.name)
    } else {
      fail(`${check.name} is missing CSS pattern(s): ${missing.join(', ')}`)
    }
  }
}

for (const asset of assetChecks) {
  if (existsSync(asset) && (await stat(asset)).size > 0) {
    pass(`asset exists: ${asset}`)
  } else {
    fail(`asset is missing or empty: ${asset}`)
  }
}

for (const route of linkedRouteChecks) {
  if (existsSync(route) && (await stat(route)).size > 0) {
    pass(`linked route exists: ${route}`)
  } else {
    fail(`linked route is missing or empty: ${route}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} visual smoke check(s) failed.`)
  process.exitCode = 1
} else {
  console.log('\nVisual smoke checks passed.')
}
