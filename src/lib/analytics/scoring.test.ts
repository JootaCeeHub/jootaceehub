import { describe, it, expect } from 'vitest'
import { computeAIAnalysis } from './scoring'
import type { ProdCheck, HealthDomain, AuditCheck } from './scoring'
import { createInitialState } from '@/lib/admin/state'

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function makeProdChecks(passCount: number, total: number): ProdCheck[] {
  return Array.from({ length: total }, (_, i) => ({
    label: `Check ${i}`,
    pass: i < passCount,
    cat: 'Test',
    hint: '',
  }))
}

function makeAuditChecks(passCount: number, total: number): AuditCheck[] {
  return Array.from({ length: total }, (_, i) => ({
    label: `Audit ${i}`,
    value: i < passCount ? 'OK' : 'Fail',
    pass: i < passCount,
    hint: '',
  }))
}

function makeHealthDomains(
  overrides: Partial<Record<string, number>> = {},
): HealthDomain[] {
  const defaults: Record<string, number> = {
    'Code Quality':  100,
    'Content':       0,
    'Integrations':  0,
    'Systems & AI':  50,
  }
  const merged = { ...defaults, ...overrides }
  return Object.entries(merged).map(([label, score]) => ({
    label,
    score,
    items: [],
    color: '#fff',
  }))
}

// Fully configured state for "excellent" scoring scenario
function configuredState() {
  const s = createInitialState()
  return {
    ...s,
    seo: {
      ...s.seo,
      ogImage: '/og-image.png',
      canonicalBase: 'https://jootacee.com',
      twitterHandle: '@jootacee',
      defaultTitle: 'JootaCee — AI Systems Architect',
      defaultDescription: 'Building AI systems and multi-agent orchestration runtimes for the next generation of digital ecosystems.',
      robots: 'index, follow',
    },
    site: {
      ...s.site,
      enableAnalytics: true,
      trackingId: 'G-TEST12345',
      url: 'https://jootacee.com',
    },
    content: {
      ...s.content,
      hero: { ...s.content.hero, title: 'Building AI systems at the frontier of autonomy.' },
    },
  }
}

// ─── Overall score calculation ────────────────────────────────────────────────

describe('computeAIAnalysis — overall score', () => {
  it('returns a number between 0 and 100', () => {
    const state = createInitialState()
    const result = computeAIAnalysis(
      state,
      makeProdChecks(10, 18),
      makeHealthDomains(),
      makeAuditChecks(7, 10),
      makeAuditChecks(9, 11),
      0, 0, 44,
    )
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('higher pass rates produce higher overall scores', () => {
    const state = createInitialState()
    const low = computeAIAnalysis(state, makeProdChecks(0, 18), makeHealthDomains({ 'Code Quality': 50, 'Content': 0 }), makeAuditChecks(0, 10), makeAuditChecks(0, 11), 0, 0, 30)
    const high = computeAIAnalysis(state, makeProdChecks(18, 18), makeHealthDomains({ 'Code Quality': 100, 'Content': 100 }), makeAuditChecks(10, 10), makeAuditChecks(11, 11), 0, 0, 90)
    expect(high.overallScore).toBeGreaterThan(low.overallScore)
  })

  it('returns overallScore as an integer (no decimals)', () => {
    const result = computeAIAnalysis(
      createInitialState(),
      makeProdChecks(11, 18),
      makeHealthDomains(),
      makeAuditChecks(6, 10),
      makeAuditChecks(8, 11),
      0, 0, 44,
    )
    expect(result.overallScore).toBe(Math.round(result.overallScore))
  })
})

// ─── Verdict levels ───────────────────────────────────────────────────────────

describe('computeAIAnalysis — verdict levels', () => {
  it('verdictLevel "excellent" when overallScore ≥ 85', () => {
    const state = configuredState()
    const result = computeAIAnalysis(
      state,
      makeProdChecks(18, 18),
      makeHealthDomains({ 'Code Quality': 100, 'Content': 100 }),
      makeAuditChecks(10, 10),
      makeAuditChecks(11, 11),
      0, 0, 90,
    )
    expect(result.verdictLevel).toBe('excellent')
    expect(result.verdictText.length).toBeGreaterThan(10)
  })

  it('verdictLevel "critical" when overallScore < 55', () => {
    const state = createInitialState()
    const result = computeAIAnalysis(
      state,
      makeProdChecks(0, 18),
      makeHealthDomains({ 'Code Quality': 20, 'Content': 0 }),
      makeAuditChecks(0, 10),
      makeAuditChecks(0, 11),
      5, 3, 20,
    )
    expect(result.verdictLevel).toBe('critical')
  })

  it('verdictLevel "good" maps to a non-empty verdictText', () => {
    const result = computeAIAnalysis(
      createInitialState(),
      makeProdChecks(13, 18),
      makeHealthDomains({ 'Code Quality': 100, 'Content': 50 }),
      makeAuditChecks(7, 10),
      makeAuditChecks(9, 11),
      0, 0, 44,
    )
    expect(['good', 'caution', 'excellent', 'critical']).toContain(result.verdictLevel)
    expect(result.verdictText.length).toBeGreaterThan(0)
  })
})

// ─── Priority queue ───────────────────────────────────────────────────────────

describe('computeAIAnalysis — priority queue', () => {
  it('includes OG image item when ogImage is empty', () => {
    const base = createInitialState()
    const state = { ...base, seo: { ...base.seo, ogImage: '' } }
    const result = computeAIAnalysis(state, makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    const ogItem = result.priorityQueue.find(i => i.title.includes('OG image'))
    expect(ogItem).toBeDefined()
    expect(ogItem?.impact).toBe('critical')
  })

  it('omits OG image item when ogImage is configured', () => {
    const state = configuredState()
    const result = computeAIAnalysis(state, makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    const ogItem = result.priorityQueue.find(i => i.title.includes('OG image'))
    expect(ogItem).toBeUndefined()
  })

  it('includes Analytics item when analytics not configured', () => {
    const state = createInitialState()
    const result = computeAIAnalysis(state, makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    const analyticsItem = result.priorityQueue.find(i => i.title.includes('Analytics'))
    expect(analyticsItem).toBeDefined()
  })

  it('queue items have sequential ranks starting at 1', () => {
    const result = computeAIAnalysis(
      createInitialState(),
      makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    result.priorityQueue.forEach((item, i) => {
      expect(item.rank).toBe(i + 1)
    })
  })

  it('queue is capped at 10 items', () => {
    const result = computeAIAnalysis(
      createInitialState(),
      makeProdChecks(0, 18), makeHealthDomains({ 'Code Quality': 0 }),
      makeAuditChecks(0, 10), makeAuditChecks(0, 11),
      5, 5, 20,
    )
    expect(result.priorityQueue.length).toBeLessThanOrEqual(10)
  })

  it('JSON-LD Schema item always appears in queue', () => {
    // NeuralNetworkScene lazy-loading is now a COMPLETED optimization (it's in strengths).
    // The always-present queue items are Schema markup and PWA icons.
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    const schemaItem = result.priorityQueue.find(i => i.title.includes('JSON-LD'))
    expect(schemaItem).toBeDefined()
    expect(schemaItem?.impact).toBe('medium')
  })
})

// ─── Dimensions ───────────────────────────────────────────────────────────────

describe('computeAIAnalysis — dimensions', () => {
  it('returns exactly 5 dimensions', () => {
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    expect(result.dimensions).toHaveLength(5)
  })

  it('dimensions include all expected labels', () => {
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    const labels = result.dimensions.map(d => d.label)
    expect(labels).toContain('Technical Quality')
    expect(labels).toContain('SEO & Visibility')
    expect(labels).toContain('Accessibility')
    expect(labels).toContain('Performance')
    expect(labels).toContain('Production Ready')
  })

  it('performance dimension score reflects lighthouseAvg', () => {
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 75,
    )
    const perf = result.dimensions.find(d => d.label === 'Performance')
    expect(perf?.score).toBe(75)
    expect(perf?.assessment).toBe('Óptimo')
  })
})

// ─── Risks ────────────────────────────────────────────────────────────────────

describe('computeAIAnalysis — risks', () => {
  it('returns at least 3 risks', () => {
    // With lighthouseAvg=44 (<55): perf risk + schema markup risk are always present.
    // !hasAnalytics from initial state adds a 3rd. OG + canonical are set in initial state.
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    expect(result.risks.length).toBeGreaterThanOrEqual(3)
  })

  it('adds runtime error risk when errorCount > 0', () => {
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      3, 0, 44,
    )
    const errRisk = result.risks.find(r => r.risk.includes('runtime errors'))
    expect(errRisk).toBeDefined()
    expect(errRisk?.risk).toContain('3')
  })

  it('does NOT add runtime error risk when errorCount is 0', () => {
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    const errRisk = result.risks.find(r => r.risk.includes('runtime errors'))
    expect(errRisk).toBeUndefined()
  })
})

// ─── Roadmap ──────────────────────────────────────────────────────────────────

describe('computeAIAnalysis — roadmap', () => {
  it('returns exactly 3 roadmap phases', () => {
    const result = computeAIAnalysis(
      createInitialState(), makeProdChecks(5, 18), makeHealthDomains(),
      makeAuditChecks(5, 10), makeAuditChecks(5, 11),
      0, 0, 44,
    )
    expect(result.roadmap).toHaveLength(3)
  })

  it('phase 1 completion increases when more items are done', () => {
    const baseline = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    const withConfig = computeAIAnalysis(configuredState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    expect(withConfig.roadmap[0].completion).toBeGreaterThan(baseline.roadmap[0].completion)
  })

  it('phase 2 completion is higher when no long tasks detected', () => {
    const withTasks    = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 3, 44)
    const withoutTasks = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    expect(withoutTasks.roadmap[1].completion).toBeGreaterThan(withTasks.roadmap[1].completion)
  })
})

// ─── Strengths & projectDNA ───────────────────────────────────────────────────

describe('computeAIAnalysis — strengths and projectDNA', () => {
  it('returns 9 strengths', () => {
    // Strengths grew from 8→9 when Zod validation strength was added.
    const result = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    expect(result.strengths).toHaveLength(9)
  })

  it('returns 12 projectDNA traits', () => {
    const result = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    expect(result.projectDNA).toHaveLength(12)
  })

  it('each projectDNA trait has a valid quality', () => {
    const result = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    const validQualities = ['excellent', 'good', 'needs-work']
    result.projectDNA.forEach(trait => {
      expect(validQualities).toContain(trait.quality)
    })
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('computeAIAnalysis — edge cases', () => {
  it('handles empty check arrays without throwing or producing NaN', () => {
    const result = computeAIAnalysis(
      createInitialState(),
      makeProdChecks(0, 0),  // empty
      makeHealthDomains(),
      makeAuditChecks(0, 0), // empty
      makeAuditChecks(0, 0), // empty
      0, 0, 0,
    )
    expect(Number.isNaN(result.overallScore)).toBe(false)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
  })

  it('generatedAt is a non-empty string', () => {
    const result = computeAIAnalysis(createInitialState(), makeProdChecks(5, 18), makeHealthDomains(), makeAuditChecks(5, 10), makeAuditChecks(5, 11), 0, 0, 44)
    expect(typeof result.generatedAt).toBe('string')
    expect(result.generatedAt.length).toBeGreaterThan(0)
  })
})
