import { cp, mkdir, readFile, rm, writeFile, chmod } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { isIP } from 'node:net'

const run = promisify(execFile)
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const releaseDir = join(rootDir, 'release')
const deployDir = join(rootDir, 'deploy')
const caddyImage = 'caddy:2.8.4-alpine'

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
  if (
    url.protocol !== 'https:' || !url.hostname || url.hostname === 'localhost' || isIP(url.hostname)
    || url.pathname !== '/' || url.port || url.search || url.hash
  ) {
    throw new Error('SITE_URL 必须是没有路径的公网 HTTPS 域名，例如 https://blog.example.com。')
  }
  return { siteUrl: url.origin, host: url.hostname }
}

export function renderCompose() {
  return `services:
  blog:
    image: \${BLOG_IMAGE}
    restart: unless-stopped
    expose:
      - "80"

  caddy:
    image: \${CADDY_IMAGE}
    restart: unless-stopped
    depends_on:
      - blog
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
  reverse_proxy blog:80
}
`
}

function releaseId() {
  return new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
}

async function command(command, args, options = {}) {
  await run(command, args, { cwd: rootDir, stdio: 'inherit', ...options })
}

async function ensureDocker() {
  try {
    await command('docker', ['version', '--format', '{{.Server.Version}}'])
  } catch {
    throw new Error('未找到可用的 Docker。请先启动 Docker Desktop。')
  }
}

async function main() {
  const env = await readFile(join(rootDir, '.env'), 'utf8').catch(() => '')
  const configuredSiteUrl = process.env.SITE_URL || readEnvValue(env, 'SITE_URL')
  const { siteUrl, host } = getDeploymentSite(configuredSiteUrl)
  await ensureDocker()
  const id = releaseId()
  const blogImage = `rpg-blog:${id}`
  const packageName = `rpg-blog-${id}`
  const packageDir = join(releaseDir, packageName)
  const archive = join(releaseDir, `${packageName}.tar.gz`)

  await rm(packageDir, { recursive: true, force: true })
  await rm(archive, { force: true })
  await mkdir(packageDir, { recursive: true })

  console.log('Building the blog image...')
  await command('docker', ['build', '--build-arg', `SITE_URL=${siteUrl}`, '--tag', blogImage, '.'])
  console.log('Fetching the pinned Caddy image...')
  await command('docker', ['pull', caddyImage])
  console.log('Exporting Docker images...')
  await command('docker', ['save', '--output', join(packageDir, 'images.tar'), blogImage, caddyImage])

  await writeFile(join(packageDir, 'compose.yaml'), renderCompose(), 'utf8')
  await writeFile(join(packageDir, 'Caddyfile'), renderCaddyfile(host), 'utf8')
  await writeFile(join(packageDir, '.env'), `BLOG_IMAGE=${blogImage}\nCADDY_IMAGE=${caddyImage}\n`, 'utf8')
  await writeFile(join(packageDir, 'README.txt'), `rpg-blog deployment package\n\n1. Upload this whole folder or its .tar.gz archive to your Ubuntu/Debian server.\n2. Extract the archive if needed.\n3. Run: sudo ./install.sh\n\nDomain: ${siteUrl}\nThe server must have Docker Engine + Docker Compose, DNS must point to this server, and ports 80/443 must be open.\n`, 'utf8')
  await cp(join(deployDir, 'install.sh'), join(packageDir, 'install.sh'))
  await chmod(join(packageDir, 'install.sh'), 0o755)
  await command('tar', ['-czf', archive, '-C', releaseDir, packageName])
  await rm(packageDir, { recursive: true, force: true })

  console.log(`\nDeployment package created:\n${archive}`)
  console.log('Upload it to the server, extract it, then run: sudo ./install.sh')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`\nPackaging failed: ${error.message}`)
    process.exitCode = 1
  })
}
