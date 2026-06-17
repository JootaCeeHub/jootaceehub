
export interface LiveBundleEntry {
  name: string
  url: string
  encodedKB: number
  decodedKB: number
  duration: number
}

export interface LiveBundleGroup {
  name: string
  color: string
  lazy: boolean
  decodedKB: number
  transferKB: number
  label: string
  gzip: string
  entries: LiveBundleEntry[]
}

export interface BundleSummary {
  totalDecodedKB: number
  totalTransferKB: number
  scriptCount: number
  cssCount: number
  imageCount: number
  fontCount: number
  otherCount: number
  cacheRatio: number
  slowCount: number
}

const VENDOR_PATTERNS: { pattern: RegExp; name: string; color: string; lazy: boolean }[] = [
  { pattern: /three(?:\.esm|\.min)?\.js|three\/build\//i,  name: 'Three.js core',           color: '#fb923c', lazy: true  },
  { pattern: /@react-three|react-three/i,                   name: 'React Three Fiber + Drei', color: '#f472b6', lazy: true  },
  { pattern: /gsap(?:\.min)?\.js|ScrollTrigger/i,           name: 'GSAP + ScrollTrigger',    color: '#f59e0b', lazy: false },
  { pattern: /framer.motion|framer\/motion/i,               name: 'Framer Motion',           color: '#a78bfa', lazy: false },
  { pattern: /chunks\/framework|next\/dist\/compiled\/react(?:[^-]|$)/i, name: 'React + Next.js runtime', color: '#38bdf8', lazy: false },
  { pattern: /lucide/i,                                     name: 'Lucide icons',            color: '#818cf8', lazy: false },
]

function toKB(bytes: number) { return Math.round(bytes / 1024) }

export function inspectBundles(): LiveBundleGroup[] {
  if (typeof window === 'undefined') return []

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const scripts = resources.filter((r) =>
    r.initiatorType === 'script' ||
    r.name.match(/\.(js|mjs)(\?|$)/)
  )

  const groups: LiveBundleGroup[] = []
  const matched = new Set<string>()

  for (const { pattern, name, color, lazy } of VENDOR_PATTERNS) {
    const matching = scripts.filter((r) => pattern.test(r.name) && !matched.has(r.name))
    if (matching.length === 0) continue
    matching.forEach((r) => matched.add(r.name))

    const decoded  = matching.reduce((a, r) => a + r.decodedBodySize, 0)
    const transfer = matching.reduce((a, r) => a + r.transferSize,    0)
    const decodedKB  = toKB(decoded)
    const transferKB = toKB(transfer)

    groups.push({
      name,
      color,
      lazy,
      decodedKB,
      transferKB,
      label: decodedKB > 0 ? `${decodedKB}KB` : transfer > 0 ? '~cached' : '—',
      gzip:  transferKB > 0 ? `${transferKB}KB` : 'cached',
      entries: matching.slice(0, 5).map((r) => ({
        name: r.name.split('/').pop()?.split('?')[0] ?? r.name,
        url: r.name,
        encodedKB: toKB(r.transferSize),
        decodedKB: toKB(r.decodedBodySize),
        duration: Math.round(r.duration),
      })),
    })
  }

  const unmatched = scripts.filter((r) => !matched.has(r.name))
  if (unmatched.length > 0) {
    const decoded  = unmatched.reduce((a, r) => a + r.decodedBodySize, 0)
    const transfer = unmatched.reduce((a, r) => a + r.transferSize,    0)
    const decodedKB  = toKB(decoded)
    const transferKB = toKB(transfer)
    groups.push({
      name: 'App code (routes + shared)',
      color: '#34d399',
      lazy: false,
      decodedKB,
      transferKB,
      label: decodedKB > 0 ? `${decodedKB}KB` : '—',
      gzip:  transferKB > 0 ? `${transferKB}KB` : 'cached',
      entries: unmatched.slice(0, 8).map((r) => ({
        name: r.name.split('/').pop()?.split('?')[0] ?? r.name,
        url: r.name,
        encodedKB: toKB(r.transferSize),
        decodedKB: toKB(r.decodedBodySize),
        duration: Math.round(r.duration),
      })),
    })
  }

  return groups.sort((a, b) => b.decodedKB - a.decodedKB)
}

export function getBundleSummary(): BundleSummary {
  if (typeof window === 'undefined') {
    return { totalDecodedKB: 0, totalTransferKB: 0, scriptCount: 0, cssCount: 0, imageCount: 0, fontCount: 0, otherCount: 0, cacheRatio: 0, slowCount: 0 }
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  const scripts = resources.filter((r) => r.initiatorType === 'script' || r.name.match(/\.(js|mjs)(\?|$)/))
  const css     = resources.filter((r) => r.initiatorType === 'link' && r.name.match(/\.css(\?|$)/))
  const images  = resources.filter((r) => r.initiatorType === 'img' || r.name.match(/\.(png|jpg|jpeg|webp|avif|svg|gif)(\?|$)/i))
  const fonts   = resources.filter((r) => r.initiatorType === 'css' && r.name.match(/\.(woff2?|ttf|otf)(\?|$)/i))
  const other   = resources.filter((r) => !scripts.includes(r) && !css.includes(r) && !images.includes(r) && !fonts.includes(r))

  const totalDecoded  = resources.reduce((a, r) => a + r.decodedBodySize, 0)
  const totalTransfer = resources.reduce((a, r) => a + r.transferSize,    0)
  const cached        = resources.filter((r) => r.transferSize === 0 && r.decodedBodySize > 0).length
  const slow          = resources.filter((r) => r.duration > 500).length

  return {
    totalDecodedKB:  toKB(totalDecoded),
    totalTransferKB: toKB(totalTransfer),
    scriptCount: scripts.length,
    cssCount:    css.length,
    imageCount:  images.length,
    fontCount:   fonts.length,
    otherCount:  other.length,
    cacheRatio:  resources.length > 0 ? cached / resources.length : 0,
    slowCount:   slow,
  }
}
