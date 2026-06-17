import { describe, it, expect } from 'vitest'
import { extractToc, slugifyHeading, injectHeadingIds } from './toc'

describe('slugifyHeading', () => {
  it('lowercases text', () => {
    expect(slugifyHeading('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugifyHeading('getting started')).toBe('getting-started')
  })

  it('strips special characters', () => {
    expect(slugifyHeading('What is AI?')).toBe('what-is-ai')
  })

  it('collapses multiple hyphens', () => {
    expect(slugifyHeading('one  --  two')).toBe('one-two')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugifyHeading('  -hello-  ')).toBe('hello')
  })

  it('handles accented characters', () => {
    const result = slugifyHeading('Configuración del Sistema')
    expect(result).toBeTruthy()
    expect(result).not.toContain(' ')
  })
})

describe('extractToc', () => {
  it('returns empty array for empty string', () => {
    expect(extractToc('')).toEqual([])
  })

  it('extracts h2 headings', () => {
    const md = `# H1 ignored\n## Introduction\nsome text\n## Conclusion`
    const toc = extractToc(md)
    expect(toc).toHaveLength(2)
    expect(toc[0].text).toBe('Introduction')
    expect(toc[0].level).toBe(2)
    expect(toc[1].text).toBe('Conclusion')
  })

  it('extracts h3 headings nested under h2', () => {
    const md = `## Section One\n### Sub-section A\n### Sub-section B\n## Section Two`
    const toc = extractToc(md)
    expect(toc).toHaveLength(4)
    expect(toc[0].level).toBe(2)
    expect(toc[1].level).toBe(3)
    expect(toc[2].level).toBe(3)
    expect(toc[3].level).toBe(2)
  })

  it('assigns unique ids', () => {
    const md = `## Intro\n## Intro`
    const toc = extractToc(md)
    expect(toc).toHaveLength(2)
    expect(toc[0].id).not.toBe(toc[1].id)
  })

  it('ignores headings inside code blocks', () => {
    const md = '## Real Heading\n```\n## Fake Heading in code block\n```'
    const toc = extractToc(md)
    expect(toc).toHaveLength(1)
    expect(toc[0].text).toBe('Real Heading')
  })

  it('handles h4 headings', () => {
    const md = `## Main\n#### Detail`
    const toc = extractToc(md)
    const h4 = toc.find((t) => t.level === 4)
    expect(h4).toBeDefined()
    expect(h4?.text).toBe('Detail')
  })
})

describe('injectHeadingIds', () => {
  it('injects id into h2 tags', () => {
    const html = '<h2>Getting Started</h2>'
    const result = injectHeadingIds(html)
    expect(result).toContain('id="getting-started"')
  })

  it('injects ids into multiple headings', () => {
    const html = '<h2>One</h2><h3>Two</h3><h4>Three</h4>'
    const result = injectHeadingIds(html)
    expect(result).toContain('id="one"')
    expect(result).toContain('id="two"')
    expect(result).toContain('id="three"')
  })

  it('does not double-inject if id already exists', () => {
    const html = '<h2 id="existing">Heading</h2>'
    const result = injectHeadingIds(html)
    // Should not add another id= attribute
    expect(result.match(/id=/g)?.length).toBe(1)
  })

  it('passes through non-heading html unchanged', () => {
    const html = '<p>paragraph</p><span>span</span>'
    expect(injectHeadingIds(html)).toBe(html)
  })
})
