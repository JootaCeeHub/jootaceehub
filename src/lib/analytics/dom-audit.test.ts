/**
 * Tests for dom-audit functions that can run in jsdom (no real browser APIs needed).
 * Functions relying on PerformanceObserver or navigator.serviceWorker are covered
 * only for the safe/static parts — browser-specific branches are snapshot-tested.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { runDOMSEOAudit, runDOMA11yAudit, runPerformanceHintsAudit, runSecurityAudit, runConfigSEOAudit } from './dom-audit'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setMeta(name: string, content: string, attr: 'name' | 'property' | 'http-equiv' = 'name') {
  const el = document.createElement('meta')
  el.setAttribute(attr, name)
  el.content = content
  document.head.appendChild(el)
  return el
}

function setLink(rel: string, href = 'https://example.com') {
  const el = document.createElement('link')
  el.rel  = rel
  el.href = href
  document.head.appendChild(el)
  return el
}

// ─── runConfigSEOAudit ────────────────────────────────────────────────────────

describe('runConfigSEOAudit', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.lang = ''
  })

  const base = {
    defaultTitle: 'JootaCee — AI Systems Architect',
    defaultDescription: 'Building autonomous AI systems. Explore the architecture of modern intelligence.',
    ogImage: '/og-image.png',
    twitterHandle: '@jootacee',
    canonicalBase: 'https://jootacee.com',
    robots: 'index,follow',
  }

  it('passes all config-only checks for a fully configured SEO state', () => {
    // Some checks in runConfigSEOAudit read the live DOM (html[lang], JSON-LD).
    // Set up the DOM to make those pass too.
    document.documentElement.lang = 'en'
    const s = document.createElement('script')
    s.type        = 'application/ld+json'
    s.textContent = '{}'
    document.head.appendChild(s)
    const checks = runConfigSEOAudit(base)
    const fails  = checks.filter(c => !c.pass)
    expect(fails).toHaveLength(0)
  })

  it('fails when title is too short', () => {
    const checks = runConfigSEOAudit({ ...base, defaultTitle: 'Hi' })
    expect(checks.find(c => c.label === 'Page title')?.pass).toBe(false)
  })

  it('fails when title is too long (> 70 chars)', () => {
    const checks = runConfigSEOAudit({ ...base, defaultTitle: 'A'.repeat(75) })
    expect(checks.find(c => c.label === 'Page title')?.pass).toBe(false)
  })

  it('fails when description is too short', () => {
    const checks = runConfigSEOAudit({ ...base, defaultDescription: 'Too short' })
    expect(checks.find(c => c.label === 'Meta description')?.pass).toBe(false)
  })

  it('fails when description is too long (> 160 chars)', () => {
    const checks = runConfigSEOAudit({ ...base, defaultDescription: 'A'.repeat(165) })
    expect(checks.find(c => c.label === 'Meta description')?.pass).toBe(false)
  })
})

// ─── runDOMSEOAudit ───────────────────────────────────────────────────────────

describe('runDOMSEOAudit', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.title = ''
  })

  it('passes lang attribute check when html[lang] is set', () => {
    document.documentElement.lang = 'en'
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'lang attribute')?.pass).toBe(true)
  })

  it('fails lang attribute check when html[lang] is empty', () => {
    document.documentElement.lang = ''
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'lang attribute')?.pass).toBe(false)
  })

  it('passes single H1 check with exactly one h1', () => {
    document.body.innerHTML = '<h1>Title</h1>'
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'Single H1')?.pass).toBe(true)
  })

  it('fails single H1 check with zero h1 elements', () => {
    document.body.innerHTML = '<h2>Sub</h2>'
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'Single H1')?.pass).toBe(false)
  })

  it('fails single H1 check with multiple h1 elements', () => {
    document.body.innerHTML = '<h1>A</h1><h1>B</h1>'
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'Single H1')?.pass).toBe(false)
  })

  it('passes images alt text when all images have alt', () => {
    document.body.innerHTML = '<img src="a.png" alt="desc">'
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'Images with alt text')?.pass).toBe(true)
  })

  it('fails images alt text when an image is missing alt', () => {
    document.body.innerHTML = '<img src="a.png">'
    const checks = runDOMSEOAudit()
    expect(checks.find(c => c.label === 'Images with alt text')?.pass).toBe(false)
  })
})

// ─── runDOMA11yAudit ──────────────────────────────────────────────────────────

describe('runDOMA11yAudit', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.documentElement.lang = 'en'
  })

  it('passes lang attribute check', () => {
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'HTML lang attribute')?.pass).toBe(true)
  })

  it('fails lang attribute check when lang is missing', () => {
    document.documentElement.lang = ''
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'HTML lang attribute')?.pass).toBe(false)
  })

  it('passes <main> check when main element exists', () => {
    document.body.innerHTML = '<main></main>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === '<main> landmark')?.pass).toBe(true)
  })

  it('fails <main> check when main element is absent', () => {
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === '<main> landmark')?.pass).toBe(false)
  })

  it('passes <nav> landmark check when nav exists', () => {
    document.body.innerHTML = '<nav></nav>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === '<nav> landmark')?.pass).toBe(true)
  })

  it('passes heading order when headings are sequential', () => {
    document.body.innerHTML = '<h1>A</h1><h2>B</h2><h3>C</h3>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'Heading order')?.pass).toBe(true)
  })

  it('fails heading order when a level is skipped', () => {
    document.body.innerHTML = '<h1>A</h1><h3>C</h3>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'Heading order')?.pass).toBe(false)
  })

  it('passes unlabeled controls check when all buttons have text', () => {
    document.body.innerHTML = '<button>Click me</button>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'Unlabeled controls')?.pass).toBe(true)
  })

  it('fails unlabeled controls check for an empty button', () => {
    document.body.innerHTML = '<button></button>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'Unlabeled controls')?.pass).toBe(false)
  })

  it('passes unlabeled controls for aria-labeled button', () => {
    document.body.innerHTML = '<button aria-label="Close menu"></button>'
    const checks = runDOMA11yAudit()
    expect(checks.find(c => c.label === 'Unlabeled controls')?.pass).toBe(true)
  })
})

// ─── runPerformanceHintsAudit ─────────────────────────────────────────────────

describe('runPerformanceHintsAudit', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('returns the expected number of checks', () => {
    const checks = runPerformanceHintsAudit()
    expect(checks.length).toBe(8)
  })

  it('passes viewport check when viewport meta is set correctly', () => {
    setMeta('viewport', 'width=device-width, initial-scale=1')
    const checks = runPerformanceHintsAudit()
    expect(checks.find(c => c.label === 'Viewport meta')?.pass).toBe(true)
  })

  it('fails viewport check when viewport meta is missing', () => {
    const checks = runPerformanceHintsAudit()
    expect(checks.find(c => c.label === 'Viewport meta')?.pass).toBe(false)
  })

  it('passes render-blocking check when all scripts are deferred', () => {
    const s = document.createElement('script')
    s.defer = true
    s.src   = 'app.js'
    document.head.appendChild(s)
    const checks = runPerformanceHintsAudit()
    expect(checks.find(c => c.label === 'Render-blocking scripts')?.pass).toBe(true)
  })

  it('fails render-blocking check when a sync script exists', () => {
    const s = document.createElement('script')
    s.src = 'blocking.js'
    // no defer, no async
    document.head.appendChild(s)
    const checks = runPerformanceHintsAudit()
    expect(checks.find(c => c.label === 'Render-blocking scripts')?.pass).toBe(false)
  })

  it('passes font preconnect check when fonts.googleapis.com preconnect exists', () => {
    const fontLink = document.createElement('link')
    fontLink.rel  = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter'
    document.head.appendChild(fontLink)
    setLink('preconnect', 'https://fonts.googleapis.com')
    const checks = runPerformanceHintsAudit()
    expect(checks.find(c => c.label === 'Font preconnect')?.pass).toBe(true)
  })

  it('fails font preconnect when external font is loaded without preconnect', () => {
    const fontLink = document.createElement('link')
    fontLink.rel  = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter'
    document.head.appendChild(fontLink)
    const checks = runPerformanceHintsAudit()
    expect(checks.find(c => c.label === 'Font preconnect')?.pass).toBe(false)
  })
})

// ─── runSecurityAudit ─────────────────────────────────────────────────────────

describe('runSecurityAudit', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('returns the expected number of checks', () => {
    const checks = runSecurityAudit()
    expect(checks.length).toBe(7)
  })

  it('passes theme-color check when theme-color meta is set', () => {
    setMeta('theme-color', '#0d0d0d')
    const checks = runSecurityAudit()
    expect(checks.find(c => c.label === 'Theme color meta')?.pass).toBe(true)
  })

  it('fails theme-color check when theme-color meta is absent', () => {
    const checks = runSecurityAudit()
    expect(checks.find(c => c.label === 'Theme color meta')?.pass).toBe(false)
  })

  it('always passes CSP meta tag check (CSP may be HTTP header)', () => {
    const checks = runSecurityAudit()
    expect(checks.find(c => c.label === 'CSP meta tag')?.pass).toBe(true)
  })

  it('passes unsafe-inline check when no CSP is present', () => {
    const checks = runSecurityAudit()
    expect(checks.find(c => c.label === 'Unsafe-inline in CSP')?.pass).toBe(true)
  })

  it('fails unsafe-inline check when CSP contains unsafe-inline', () => {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'content-security-policy'
    meta.content   = "default-src 'self' 'unsafe-inline'"
    document.head.appendChild(meta)
    const checks = runSecurityAudit()
    expect(checks.find(c => c.label === 'Unsafe-inline in CSP')?.pass).toBe(false)
  })

  it('passes HTTPS check on localhost', () => {
    // jsdom uses localhost by default
    const checks = runSecurityAudit()
    expect(checks.find(c => c.label === 'HTTPS (canonical)')?.pass).toBe(true)
  })
})
