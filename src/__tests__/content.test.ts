import { describe, it, expect, beforeAll } from 'vitest'

describe('Article Content Collections', () => {
  let homeHtml = ''
  let helloHtml = ''
  let gettingStartedHtml = ''

  beforeAll(async () => {
    const [home, hello, gs] = await Promise.all([
      fetch('http://localhost:4321/').then(r => r.text()),
      fetch('http://localhost:4321/posts/hello-world').then(r => r.text()),
      fetch('http://localhost:4321/posts/getting-started').then(r => r.text()),
    ])
    homeHtml = home
    helloHtml = hello
    gettingStartedHtml = gs
  })

  it('homepage lists articles', () => {
    expect(homeHtml).toContain('Hello World')
    expect(homeHtml).toContain('Getting Started with RPG Blog')
  })

  it('article page renders title', () => {
    expect(helloHtml).toContain('<h1')
    expect(helloHtml).toContain('Hello World')
  })

  it('article page renders markdown content', () => {
    expect(helloHtml).toContain('Welcome')
    expect(helloHtml).toContain('Happy blogging')
  })

  it('article page shows tags', () => {
    expect(helloHtml).toContain('general')
  })

  it('article page shows date', () => {
    expect(helloHtml).toContain('2026')
  })

  it('article page has back link', () => {
    expect(helloHtml).toContain('Back to home')
  })
})
