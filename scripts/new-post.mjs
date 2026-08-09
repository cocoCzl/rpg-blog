import { access, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const postsDir = new URL('../src/content/posts/', import.meta.url)

export function normalizeSlug(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || fallback
}

export function buildPostSource({ title, date, summary, tags, category, draft, featured }) {
  const quote = (value) => JSON.stringify(String(value))
  const frontmatter = [
    '---',
    `title: ${quote(title)}`,
    `date: ${date}`,
    `summary: ${quote(summary)}`,
    `tags: [${tags.map(quote).join(', ')}]`,
    ...(category ? [`category: ${quote(category)}`] : []),
    `draft: ${draft}`,
    `featured: ${featured}`,
    '---',
    '',
    '在这里开始写正文。',
    '',
  ]
  return frontmatter.join('\n')
}

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue
    const [key, inlineValue] = arg.slice(2).split('=')
    values[key] = inlineValue ?? argv[index + 1] ?? ''
    if (inlineValue === undefined && argv[index + 1] && !argv[index + 1].startsWith('--')) index += 1
  }
  return values
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

async function prompt(args) {
  if (args.title) {
    return {
      title: args.title,
      slug: normalizeSlug(args.slug, `post-${today()}`),
      date: args.date || today(),
      summary: args.summary || '',
      tags: (args.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      category: args.category || '',
      draft: args.draft !== 'false',
      featured: args.featured === 'true',
    }
  }

  const rl = createInterface({ input, output })
  const ask = async (label, fallback = '') => (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim() || fallback
  try {
    const title = await ask('标题')
    if (!title) throw new Error('标题不能为空。')
    const date = await ask('发布日期 (YYYY-MM-DD)', today())
    return {
      title,
      slug: normalizeSlug(await ask('文件名 slug（英文、数字、短横线）', `post-${date}`), `post-${date}`),
      date,
      summary: await ask('摘要'),
      tags: (await ask('标签（用英文逗号分隔）')).split(',').map((tag) => tag.trim()).filter(Boolean),
      category: await ask('分类（可留空）'),
      draft: (await ask('是否为草稿 (true/false)', 'true')) !== 'false',
      featured: (await ask('是否置顶 (true/false)', 'false')) === 'true',
    }
  } finally {
    rl.close()
  }
}

async function main() {
  const post = await prompt(parseArgs(process.argv.slice(2)))
  const filename = `${post.slug}.md`
  const target = new URL(filename, postsDir)
  try {
    await access(target, constants.F_OK)
    throw new Error(`文章已存在：src/content/posts/${filename}`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await writeFile(target, buildPostSource(post), 'utf8')
  output.write(`已创建：src/content/posts/${filename}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
