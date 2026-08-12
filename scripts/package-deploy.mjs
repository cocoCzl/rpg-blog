import { chmod, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { isIP } from 'node:net'

const run = promisify(execFile)
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const releaseDir = join(rootDir, 'release')
const deployDir = join(rootDir, 'deploy')
const caddyImage = 'caddy:2.10.2-alpine'
export const SUPPORTED_PLATFORMS = ['linux/amd64', 'linux/arm64']

export function readEnvValue(source, name) {
  const match = source.match(new RegExp(`^${name}\\s*=\\s*(.+?)\\s*$`, 'm'))
  return match ? match[1].replace(/^['"]|['"]$/g, '') : ''
}

export function getDeploymentSite(siteUrl) {
  let url
  try {
    url = new URL(siteUrl)
  } catch {
    throw new Error('SITE_URL 必须是有效的 HTTPS 域名，例如 https://blog.example.com。')
  }
  if (url.protocol !== 'https:' || !url.hostname || url.hostname === 'localhost' || isIP(url.hostname)
    || url.pathname !== '/' || url.port || url.search || url.hash) {
    throw new Error('SITE_URL 必须是没有路径的公网 HTTPS 域名，例如 https://blog.example.com。')
  }
  return { siteUrl: url.origin, host: url.hostname }
}

export function normalizePlatform(value = 'linux/amd64') {
  const platform = String(value).trim().toLowerCase()
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    throw new Error(`不支持的平台 ${value}；请选择 linux/amd64 或 linux/arm64。`)
  }
  return platform
}

export function parsePlatform(argv) {
  const inline = argv.find((arg) => arg.startsWith('--platform='))?.split('=')[1]
  const index = argv.indexOf('--platform')
  return normalizePlatform(inline || (index >= 0 ? argv[index + 1] : '') || 'linux/amd64')
}

export function renderCompose() {
  return `services:
  blog:
    image: \${BLOG_IMAGE}
    restart: unless-stopped
    read_only: true
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp
      - /var/cache/nginx
      - /var/run
    expose:
      - "8080"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/"]
      interval: 15s
      timeout: 3s
      retries: 5

  caddy:
    image: \${CADDY_IMAGE}
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    depends_on:
      blog:
        condition: service_healthy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - rpg_blog_caddy_data:/data
      - rpg_blog_caddy_config:/config

volumes:
  rpg_blog_caddy_data:
    name: rpg_blog_caddy_data
  rpg_blog_caddy_config:
    name: rpg_blog_caddy_config
`
}

export function renderCaddyfile(host) {
  return `${host} {
  encode zstd gzip
  reverse_proxy blog:8080
}
`
}

function releaseId() {
  return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
}

async function command(command, args, options = {}) {
  return run(command, args, { cwd: rootDir, ...options })
}

async function imagePlatform(image) {
  const { stdout } = await command('docker', ['image', 'inspect', image, '--format', '{{.Os}}/{{.Architecture}}'])
  return stdout.trim()
}

async function checksum(path) {
  const data = await readFile(path)
  return createHash('sha256').update(data).digest('hex')
}

async function ensureDocker() {
  try {
    await command('docker', ['version', '--format', '{{.Server.Version}}'])
    await command('docker', ['buildx', 'version'])
  } catch {
    throw new Error('未找到可用的 Docker Engine 或 Buildx。请先启动 Docker Desktop。')
  }
}

async function main() {
  const platform = parsePlatform(process.argv.slice(2))
  const architecture = platform.split('/')[1]
  const env = await readFile(join(rootDir, '.env'), 'utf8').catch(() => '')
  const configuredSiteUrl = process.env.SITE_URL || readEnvValue(env, 'SITE_URL')
  const { siteUrl, host } = getDeploymentSite(configuredSiteUrl)
  await ensureDocker()
  const id = releaseId()
  const blogImage = `rpg-blog:${id}-${architecture}`
  const packageName = `rpg-blog-${id}-${architecture}`
  const packageDir = join(releaseDir, packageName)
  const archive = join(releaseDir, `${packageName}.tar.gz`)

  await rm(packageDir, { recursive: true, force: true })
  await rm(archive, { force: true })
  await mkdir(packageDir, { recursive: true })

  console.log(`Building ${blogImage} for ${platform}...`)
  await command('docker', ['buildx', 'build', '--platform', platform, '--build-arg', `SITE_URL=${siteUrl}`, '--tag', blogImage, '--load', '.'])
  console.log(`Fetching Caddy for ${platform}...`)
  await command('docker', ['pull', '--platform', platform, caddyImage])
  for (const image of [blogImage, caddyImage]) {
    const actual = await imagePlatform(image)
    if (actual !== platform) throw new Error(`${image} 架构为 ${actual}，目标架构为 ${platform}。`)
  }

  const imagesPath = join(packageDir, 'images.tar')
  await command('docker', ['save', '--output', imagesPath, blogImage, caddyImage])
  await writeFile(join(packageDir, 'compose.yaml'), renderCompose(), 'utf8')
  await writeFile(join(packageDir, 'Caddyfile'), renderCaddyfile(host), 'utf8')
  await writeFile(join(packageDir, '.env'), `BLOG_IMAGE=${blogImage}\nCADDY_IMAGE=${caddyImage}\n`, 'utf8')
  await writeFile(join(packageDir, 'manifest.json'), `${JSON.stringify({ version: 1, siteUrl, platform, blogImage, caddyImage, createdAt: new Date().toISOString() }, null, 2)}\n`, 'utf8')
  await writeFile(join(packageDir, 'README.txt'), `rpg-blog offline deployment package\n\nTarget: ${platform}\nDomain: ${siteUrl}\n\n1. Upload this archive to an Ubuntu/Debian server with the same CPU architecture.\n2. Extract it.\n3. Run: sudo ./install.sh\n`, 'utf8')
  await cp(join(deployDir, 'install.sh'), join(packageDir, 'install.sh'))
  await chmod(join(packageDir, 'install.sh'), 0o755)
  const checkedFiles = ['images.tar', 'compose.yaml', 'Caddyfile', '.env', 'manifest.json', 'README.txt', 'install.sh']
  const sums = await Promise.all(checkedFiles.map(async (file) => `${await checksum(join(packageDir, file))}  ${file}`))
  await writeFile(join(packageDir, 'SHA256SUMS'), `${sums.join('\n')}\n`, 'utf8')
  await command('tar', ['-czf', archive, '-C', releaseDir, packageName])
  await rm(packageDir, { recursive: true, force: true })
  console.log(`\nDeployment package created:\n${archive}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`\nPackaging failed: ${error.message}`)
    process.exitCode = 1
  })
}
