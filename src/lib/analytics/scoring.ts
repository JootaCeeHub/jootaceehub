/**
 * AI Analysis scoring engine — extracted for testability.
 * Called by AnalyticsPanel with pre-computed audit arrays from admin state.
 */
import type { AdminState } from '@/lib/admin/types'

// ─── Shared audit types ───────────────────────────────────────────────────────

export interface AuditCheck {
  label: string
  value: string
  pass: boolean
  hint: string
}

export interface ProdCheck {
  label: string
  pass: boolean
  cat: string
  hint: string
}

export interface HealthDomain {
  label: string
  score: number
  items: AuditCheck[]
  color: string
}

// ─── AI Analysis result types ─────────────────────────────────────────────────

export interface AIPriorityItem {
  rank: number
  title: string
  context: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  domain: string
  actionCode?: string
}

export interface AIDimension {
  label: string
  score: number
  icon: string
  assessment: string
}

export interface AIRisk {
  risk: string
  impact: 'critical' | 'high' | 'medium'
  probability: 'high' | 'medium' | 'low'
  mitigation: string
}

export interface AIRoadmapPhase {
  phase: string
  focus: string
  items: string[]
  color: string
  completion: number
}

export interface AIProjectTrait {
  trait: string
  value: string
  quality: 'excellent' | 'good' | 'needs-work'
}

export interface AIAnalysisResult {
  overallScore: number
  verdictLevel: 'excellent' | 'good' | 'caution' | 'critical'
  verdictText: string
  generatedAt: string
  dimensions: AIDimension[]
  priorityQueue: AIPriorityItem[]
  strengths: { title: string; detail: string }[]
  risks: AIRisk[]
  roadmap: AIRoadmapPhase[]
  projectDNA: AIProjectTrait[]
}

// ─── Scoring weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  prodPassRate:  0.28,
  codeScore:     0.20,
  seoPassRate:   0.18,
  lighthouseAvg: 0.14,
  contentScore:  0.12,
  a11yPassRate:  0.08,
} as const

// ─── computeAIAnalysis ────────────────────────────────────────────────────────

export function computeAIAnalysis(
  state: AdminState,
  prodChecks: ProdCheck[],
  healthDomains: HealthDomain[],
  seoChecks: AuditCheck[],
  a11yChecks: AuditCheck[],
  errorCount: number,
  longTaskCount: number,
  lighthouseAvg: number,
): AIAnalysisResult {
  // ── Pass rates ──────────────────────────────────────────────────────────────
  const prodPassRate  = prodChecks.length > 0 ? Math.round(prodChecks.filter(c => c.pass).length / prodChecks.length * 100) : 0
  const seoPassRate   = seoChecks.length  > 0 ? Math.round(seoChecks.filter(c => c.pass).length  / seoChecks.length  * 100) : 0
  const a11yPassRate  = a11yChecks.length > 0 ? Math.round(a11yChecks.filter(c => c.pass).length / a11yChecks.length * 100) : 0
  const codeScore     = healthDomains.find(d => d.label === 'Code Quality')?.score ?? 100
  const contentScore  = healthDomains.find(d => d.label === 'Content')?.score ?? 0

  // ── Overall score (weighted composite) ─────────────────────────────────────
  const overallScore = Math.round(
    prodPassRate  * WEIGHTS.prodPassRate  +
    codeScore     * WEIGHTS.codeScore     +
    seoPassRate   * WEIGHTS.seoPassRate   +
    lighthouseAvg * WEIGHTS.lighthouseAvg +
    contentScore  * WEIGHTS.contentScore  +
    a11yPassRate  * WEIGHTS.a11yPassRate
  )

  // ── Verdict ─────────────────────────────────────────────────────────────────
  const verdictLevel: AIAnalysisResult['verdictLevel'] =
    overallScore >= 85 ? 'excellent' :
    overallScore >= 70 ? 'good' :
    overallScore >= 55 ? 'caution' : 'critical'

  const verdictMap: Record<AIAnalysisResult['verdictLevel'], string> = {
    excellent: 'El proyecto está listo para producción. Fundamentos técnicos sobresalientes — TypeScript strict, i18n 9/9, PWA configurado y CSS separation en toda la base de código. Los únicos pendientes son optimizaciones de rendimiento (TBT/R3F) y configuración final de tracking.',
    good:      'Fundamentos técnicos sólidos con arquitectura moderna y futurista. Faltan configuraciones críticas de producción: OG image, Analytics ID y contenido mínimo del portfolio. Estéticamente superior y arquitecturalmente correcto. Completable en ~1 sprint.',
    caution:   'Base técnica avanzada con gaps de contenido y configuración significativos. SEO incompleto, tracking sin configurar y portfolio vacío limitan la viabilidad del lanzamiento. Priorizar Phase 1 del roadmap — ~3 días de trabajo.',
    critical:  'Requiere trabajo esencial antes de cualquier lanzamiento. La base técnica está bien construida pero el ecosistema de contenido y configuración de producción no alcanza el mínimo viable para salir al público.',
  }

  // ── Dimensions ──────────────────────────────────────────────────────────────
  const dimensions: AIDimension[] = [
    { label: 'Technical Quality', score: codeScore,     icon: '⚙',  assessment: codeScore >= 98     ? 'TS strict · 0 errores'        : 'Sólido' },
    { label: 'SEO & Visibility',  score: seoPassRate,   icon: '◎',  assessment: seoPassRate >= 90   ? 'Optimizado'                   : 'Señales clave faltantes' },
    { label: 'Accessibility',     score: a11yPassRate,  icon: '⬡',  assessment: a11yPassRate >= 95  ? 'WCAG 2.1 AA'                  : 'Casi completo — 1 item' },
    { label: 'Performance',       score: lighthouseAvg, icon: '⚡', assessment: lighthouseAvg >= 70 ? 'Óptimo'                       : 'TBT alto — R3F main thread' },
    { label: 'Production Ready',  score: prodPassRate,  icon: '↑',  assessment: prodPassRate >= 90  ? 'Listo para lanzar'           : `${prodChecks.filter(c => !c.pass).length} bloqueadores` },
  ]

  // ── Priority queue ──────────────────────────────────────────────────────────
  const queue: AIPriorityItem[] = []
  let rank = 1
  const hasOG        = state.seo.ogImage.length > 0
  const hasAnalytics = state.site.enableAnalytics && state.site.trackingId.length > 0
  const hasCanonical = state.seo.canonicalBase.length > 0
  const hasTwitter   = state.seo.twitterHandle.length > 0
  const hasHero      = state.content.hero.title.length > 10
  const hasMeta      = state.seo.defaultDescription.length >= 50
  const hasSeoTitle  = state.seo.defaultTitle.length > 10

  // Dynamic checks — items only appear if actually pending
  if (!hasOG)       queue.push({ rank: rank++, title: 'Agregar OG image (1200×630px)', context: 'Ausente. Bloquea previews en LinkedIn, Twitter, Slack e iMessage. Máximo impacto por mínimo esfuerzo — 15 min de trabajo.', impact: 'critical', effort: 'low', domain: 'SEO', actionCode: '/public/og.png → SEO panel > OG Image field' })
  if (!hasAnalytics) queue.push({ rank: rank++, title: 'Configurar Google Analytics 4', context: 'Sin tracking activo no hay datos de tráfico, conversión ni comportamiento post-lanzamiento. Impide tomar decisiones data-driven.', impact: 'critical', effort: 'low', domain: 'Analytics', actionCode: 'Branding panel > Tracking ID: G-XXXXXXXXXX' })
  if (!hasCanonical) queue.push({ rank: rank++, title: 'Configurar canonical base URL', context: 'Sin URL canónica Google recibe señales de contenido duplicado (en/ vs es/). Requerida para rel=alternate correcto y evitar penalización.', impact: 'high', effort: 'low', domain: 'SEO', actionCode: 'SEO panel > Canonical Base: https://jootacee.com' })
  if (!hasTwitter)   queue.push({ rank: rank++, title: 'Configurar @twitterHandle en SEO', context: 'Activa Twitter Cards — vista previa expandida en tweets con imagen, título y descripción. Crítico para distribución en comunidades tech.', impact: 'high', effort: 'low', domain: 'SEO', actionCode: 'SEO panel > Twitter Handle: @jootacee' })
  if (!hasHero)      queue.push({ rank: rank++, title: 'Completar Hero content', context: 'El titular del hero (h1) está vacío o es muy corto. Es el primer elemento que lee un visitante y la señal SEO on-page más importante de la página.', impact: 'high', effort: 'low', domain: 'Content' })
  if (!hasSeoTitle)  queue.push({ rank: rank++, title: 'Configurar SEO title (50–60 chars)', context: 'El título de página controla el click-through desde Google. Afecta ranking en búsquedas de marca y nombre.', impact: 'high', effort: 'low', domain: 'SEO', actionCode: 'SEO panel > Default Title' })
  if (!hasMeta)      queue.push({ rank: rank++, title: 'Completar meta description (120–160 chars)', context: 'La descripción SEO aparece directamente en los resultados de búsqueda. Sin ella Google extrae texto arbitrario de la página.', impact: 'medium', effort: 'low', domain: 'SEO', actionCode: 'SEO panel > Default Description' })
  // Long tasks indicate real runtime performance issues
  if (longTaskCount > 3) queue.push({ rank: rank++, title: `Reducir long tasks (${longTaskCount} detectados activamente)`, context: `PerformanceObserver detecta ${longTaskCount} long tasks activos en esta sesión — tareas JS que bloquean el hilo principal >50ms. Afecta TBT, INP y percepción de fluidez.`, impact: 'high', effort: 'medium', domain: 'Performance' })
  // Static items for known pending work
  queue.push({ rank: rank++, title: 'Implementar JSON-LD Schema markup', context: 'Ninguna sección tiene structured data. Person + WebSite + SoftwareApplication schemas activan rich snippets en Google (rating stars, sitelinks, knowledge panel).', impact: 'medium', effort: 'medium', domain: 'SEO' })
  queue.push({ rank: rank++, title: 'Convertir PWA icons PNG → WebP/AVIF', context: 'Los iconos PNG (192px, 512px, apple-touch) son 40-60% más grandes que en formatos modernos. Afecta el Lighthouse PWA score y la carga en conexiones lentas.', impact: 'low', effort: 'low', domain: 'PWA', actionCode: 'npx sharp-cli icon-512x512.png -o icon-512x512.webp' })

  // ── Strengths ───────────────────────────────────────────────────────────────
  const strengths: { title: string; detail: string }[] = [
    { title: 'TypeScript strict · 0 errores en tsc --noEmit', detail: 'La base de código completa es type-safe. Pre-commit hooks impiden que cualquier error de tipo llegue al repo.' },
    { title: 'i18n completo — todas las secciones, en + es', detail: 'Sistema i18n custom lightweight, superior a next-intl para static export. key={locale} fuerza remount correcto en navegación entre locales.' },
    { title: 'Inline Tailwind + CVA — zero archivos .styles.ts', detail: 'Todas las clases van directamente en JSX. Pattern abolido en v2 → máxima co-localización y zero overhead de imports adicionales. Variantes type-safe con CVA.' },
    { title: 'R3F lazy-loaded — dynamic import ssr:false + LazySection', detail: 'NeuralNetworkScene usa next/dynamic con ssr:false. Secciones below-fold cargan solo cuando se acercan al viewport via PerformanceObserver. TBT del hero protegido.' },
    { title: 'Skip navigation · 6 error boundaries activos', detail: 'SkipToMain visible en focus de teclado (WCAG 2.4.1 ✓). Cada sección está envuelta en SectionErrorBoundary — un crash no derriba el resto de la página.' },
    { title: 'PWA instalable — SW v1 + offline fallback', detail: 'Service worker con cache versioned, offline.html standalone, manifest completo con maskable icons. Instalable desde Chrome y Safari.' },
    { title: 'Security headers production-grade', detail: 'HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy en _headers. Seguridad configurada desde el primer deploy en Netlify/CF Pages.' },
    { title: 'Pre-commit gates: lint + tsc + vitest', detail: 'Husky + lint-staged hace imposible commitear código roto. GitHub Actions CI en 3 stages (quality → build → lighthouse).' },
    { title: 'Zod validation en admin state + JSON imports', detail: 'localStorage y imports JSON validados en runtime. Estado corrupto o malformado never crashea el dashboard — fallback a defaults.' },
  ]

  // ── Risks — only include risks that are actually present/unresolved ────────
  const risks: AIRisk[] = [
    ...(!hasOG ? [{ risk: 'OG image ausente — previews sociales rotos en todos los canales', impact: 'critical' as const, probability: 'high' as const, mitigation: 'Crear og.png 1200×630px + configurar en SEO panel — 15 min' }] : []),
    ...(!hasAnalytics ? [{ risk: 'Analytics no configurado — zero datos de uso post-lanzamiento', impact: 'high' as const, probability: 'high' as const, mitigation: 'GA4 Measurement ID en Branding panel > Tracking ID — 5 min' }] : []),
    ...(lighthouseAvg > 0 && lighthouseAvg < 55 ? [{ risk: `Performance Lighthouse ${lighthouseAvg} — señal negativa en Google CrUX y Core Web Vitals`, impact: 'high' as const, probability: 'medium' as const, mitigation: 'Auditar chunks >200KB con bundle analyzer y revisar long tasks en tab Performance' }] : []),
    ...(longTaskCount > 3 ? [{ risk: `${longTaskCount} long tasks activos — main thread bloqueado >50ms en cada tarea`, impact: 'high' as const, probability: 'high' as const, mitigation: 'Revisar tab Performance → Long Tasks para identificar la fuente exacta' }] : []),
    ...(errorCount > 0 ? [{ risk: `${errorCount} runtime errors activos — posible degradación silenciosa en producción`, impact: 'medium' as const, probability: 'medium' as const, mitigation: 'Revisar tab Errors — distinguir noise de Three.js de errores reales de aplicación' }] : []),
    { risk: 'Sin schema markup JSON-LD — rich snippets y knowledge panel inactivos', impact: 'medium', probability: 'high', mitigation: 'Implementar Person + WebSite en layout.tsx — una tarde de trabajo, impacto SEO duradero' },
    ...(!hasCanonical ? [{ risk: 'URL canónica no configurada — riesgo de contenido duplicado en/es', impact: 'medium' as const, probability: 'medium' as const, mitigation: 'SEO panel > Canonical Base URL' }] : []),
  ]

  // ── Roadmap ─────────────────────────────────────────────────────────────────
  const pubArticles  = state.researchRegistry.filter(r => r.published).length
  const pubProjects  = (state.projectsRegistry?.filter(p => p.published).length ?? 0)
  const phase1Checks = [hasOG, hasAnalytics, hasCanonical, hasTwitter, hasHero, pubProjects >= 2]
  const phase1Done   = phase1Checks.filter(Boolean).length

  const roadmap: AIRoadmapPhase[] = [
    {
      phase: 'Fase 1 · 30 días',
      focus: 'Bloqueadores críticos de producción',
      color: '#f43f5e',
      completion: Math.round((phase1Done / phase1Checks.length) * 100),
      items: [
        `OG image 1200×630px — /public/og.png${hasOG ? ' ✓' : ''}`,
        `GA4 configurado — Branding > Tracking ID${hasAnalytics ? ' ✓' : ''}`,
        `Canonical base URL — https://jootacee.com${hasCanonical ? ' ✓' : ''}`,
        `@twitterHandle — SEO panel${hasTwitter ? ' ✓' : ''}`,
        `Hero content completo (>10 chars)${hasHero ? ' ✓' : ''}`,
        `2+ proyectos publicados en portfolio${pubProjects >= 2 ? ' ✓' : ''}`,
      ],
    },
    {
      phase: 'Fase 2 · 60 días',
      focus: 'Performance & Structured Data',
      color: '#f59e0b',
      // R3F dynamic import ✓ + skip nav ✓ = 2/5 items done = 40%
      completion: longTaskCount === 0 ? 50 : 40,
      items: [
        'Dynamic import NeuralNetworkScene + LazySection ✓',
        'Skip navigation link (WCAG 2.4.1) ✓',
        'JSON-LD Schema — Person + WebSite + SoftwareApplication',
        'Convertir PWA icons PNG → WebP/AVIF',
        'PostHog o Plausible como segunda capa analytics',
      ],
    },
    {
      phase: 'Fase 3 · 90 días',
      focus: 'Expansión del Ecosistema Digital',
      color: '#34d399',
      completion: Math.min(pubArticles >= 2 ? 30 : 5, 35),
      items: [
        'Journal system — MDX + 4 categorías (opinion/research/news/essays)',
        'Mega-nav con dropdowns Systems/Labs/Journal',
        'Domain pages — /systems, /labs, /infrastructure',
        'GitHub Intelligence — repos synced + activity timeline',
        'Sentry/Highlight para error tracking en producción',
        `Bundle analyzer — audit y split chunks >200KB${pubArticles >= 2 ? ' ✓' : ''}`,
      ],
    },
  ]

  // ── Project DNA ─────────────────────────────────────────────────────────────
  const projectDNA: AIProjectTrait[] = [
    { trait: 'Framework',       value: 'Next.js 16.2.6 · App Router · React 19.2',  quality: 'excellent' },
    { trait: 'Rendering',       value: 'Static Export · output: export · 8 pages',   quality: 'good' },
    { trait: 'Type Safety',     value: 'TypeScript strict · 0 errors · tsc clean',   quality: 'excellent' },
    { trait: 'CSS',             value: 'Tailwind v4 · Inline + CVA · zero .styles.ts', quality: 'excellent' },
    { trait: 'i18n',            value: 'Custom lightweight · en + es · 9/9 sections', quality: 'excellent' },
    { trait: 'Animation',       value: 'Framer Motion + GSAP + React Three Fiber',   quality: 'good' },
    { trait: 'State Mgmt',      value: 'useReducer + Context + Zod validation',      quality: 'excellent' },
    { trait: 'Testing',         value: 'Vitest + RTL · pre-commit hooks activos',    quality: 'good' },
    { trait: 'PWA',             value: 'Service Worker v1 · offline fallback · manifest', quality: 'good' },
    { trait: 'Security',        value: '_headers · CSP + HSTS + X-Frame-Options',    quality: 'good' },
    { trait: 'CI/CD',           value: 'GitHub Actions 3-stage · Lighthouse CI',     quality: 'good' },
    { trait: 'Bundle Weight',   value: lighthouseAvg > 0 ? `Lighthouse Perf ${lighthouseAvg} · ${longTaskCount > 0 ? `${longTaskCount} long tasks` : 'long tasks clear'}` : '~1.47MB parsed · audit pendiente', quality: lighthouseAvg >= 70 ? 'good' : 'needs-work' },
  ]

  return {
    overallScore,
    verdictLevel,
    verdictText: verdictMap[verdictLevel],
    generatedAt: new Date().toLocaleTimeString(),
    dimensions,
    priorityQueue: queue.slice(0, 10),
    strengths,
    risks,
    roadmap,
    projectDNA,
  }
}
