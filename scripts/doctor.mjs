import { access, readFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getDeploymentSite, normalizePlatform, readEnvValue } from './package-deploy.mjs'

const run = promisify(execFile)
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const deployMode = process.argv.includes('--deploy')
const platformFlag = process.argv.indexOf('--platform')
const platformArg = process.argv.find((arg) => arg.startsWith('--platform='))?.split('=')[1]
  || (platformFlag >= 0 ? process.argv[platformFlag + 1] : '')
  || 'linux/amd64'
let failures = 0

function result(ok, message) {
  console.log(`${ok ? 'OK' : 'FAIL'} ${message}`)
  if (!ok) failures += 1
}

const [major, minor] = process.versions.node.split('.').map(Number)
result(major > 22 || (major === 22 && minor >= 12), `Node ${process.versions.node} (requires >=22.12.0)`)

for (const path of ['site.config.ts', 'src/content.config.ts', 'src/content/posts']) {
  try {
    await access(join(rootDir, path))
    result(true, `${path} exists`)
  } catch {
    result(false, `${path} is missing`)
  }
}

try {
  await import('astro')
  await import('sharp')
  await import('vite')
  result(true, 'native dependencies can be loaded')
} catch (error) {
  result(false, `dependencies are incomplete: ${error.message}\n  Run npm ci in a clean clone or remove node_modules and run npm ci again.`)
}

if (deployMode) {
  try {
    normalizePlatform(platformArg)
    result(true, `target platform ${platformArg}`)
  } catch (error) {
    result(false, error.message)
  }

  const env = await readFile(join(rootDir, '.env'), 'utf8').catch(() => '')
  try {
    const { siteUrl } = getDeploymentSite(process.env.SITE_URL || readEnvValue(env, 'SITE_URL'))
    result(true, `deployment URL ${siteUrl}`)
  } catch (error) {
    result(false, error.message)
  }

  for (const [command, args, label] of [
    ['docker', ['version', '--format', '{{.Server.Version}}'], 'Docker engine'],
    ['docker', ['buildx', 'version'], 'Docker Buildx'],
  ]) {
    try {
      await run(command, args)
      result(true, `${label} is available`)
    } catch {
      result(false, `${label} is unavailable`)
    }
  }

  try {
    const { stdout } = await run('docker', ['buildx', 'inspect', '--bootstrap'])
    result(stdout.includes(platformArg), `Buildx advertises ${platformArg}`)
  } catch {
    result(false, 'Could not verify Docker cross-platform support')
  }
}

if (failures > 0) {
  console.error(`\n${failures} doctor check(s) failed.`)
  process.exitCode = 1
} else {
  console.log('\nEnvironment is ready.')
}
