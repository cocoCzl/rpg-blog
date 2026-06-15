import { spawn } from 'node:child_process'

const host = process.env.TEST_HOST || '127.0.0.1'
const port = process.env.TEST_PORT || '4321'
const baseUrl = `http://${host}:${port}`
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function spawnCommand(command, args, extraEnv = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  })
}

async function waitForServer(url, timeoutMs = 45_000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Server not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

function terminate(child) {
  if (!child.killed) child.kill('SIGTERM')
}

const server = spawnCommand(npmCmd, ['run', 'dev', '--', '--host', host, '--port', port])
let serverExitCode = null
const serverExited = new Promise((_, reject) => {
  server.on('exit', (code, signal) => {
    serverExitCode = code
    reject(new Error(`Dev server exited before tests could run (code ${code}, signal ${signal})`))
  })
  server.on('error', reject)
})

try {
  await Promise.race([
    waitForServer(baseUrl),
    serverExited,
  ])

  await new Promise((resolve, reject) => {
    const testProcess = spawnCommand(npmCmd, [
      'exec',
      'vitest',
      'run',
      'src/__tests__/integration.test.ts',
      'src/__tests__/auth.test.ts',
      'src/__tests__/github-oauth.test.ts',
      'src/__tests__/content.test.ts',
    ])

    testProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Integration tests failed with exit code ${code}`))
    })
    testProcess.on('error', reject)
  })
} finally {
  if (serverExitCode === null) terminate(server)
}
