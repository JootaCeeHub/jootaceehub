import { z } from 'zod'

export const SiteConfigSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  description: z.string(),
  businessFocus: z.string(),
  whatsappNumber: z.string(),
  whatsappMessage: z.string(),
  trackingId: z.string(),
  enableAnalytics: z.boolean(),
  enableTelemetry: z.boolean(),
  maintenanceMode: z.boolean(),
})

export const SeoConfigSchema = z.object({
  titleTemplate: z.string(),
  defaultTitle: z.string(),
  defaultDescription: z.string(),
  ogImage: z.string(),
  twitterHandle: z.string(),
  robots: z.string(),
  canonicalBase: z.string().url(),
})

export const BlockItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  order: z.number().int().min(0),
})

export const NavbarConfigSchema = z.object({
  logoText: z.string(),
  logoUrl: z.string(),
  layout: z.enum(['sticky', 'fixed', 'static']),
  background: z.enum(['solid', 'glass', 'transparent']),
  behavior: z.enum(['hide-on-scroll', 'always-visible', 'compress-on-scroll']),
  actionButtons: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      variant: z.enum(['primary', 'secondary', 'ghost']),
    })
  ),
  navLinks: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      external: z.boolean().optional(),
    })
  ),
})

export const DesignTokensSchema = z.object({
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  spacingScale: z.enum(['compact', 'normal', 'relaxed', 'spacious']),
  shadowIntensity: z.enum(['none', 'subtle', 'normal', 'dramatic']),
  gradientStyle: z.enum(['none', 'subtle', 'vibrant', 'mesh']),
  buttonStyle: z.enum(['sharp', 'rounded', 'pill']),
  typography: z.enum(['system', 'modern', 'classic', 'mono']),
})

export const DesignConfigSchema = z.object({
  darkModeDefault: z.enum(['dark', 'light', 'system']),
  palette: z.enum(['ocean', 'emerald', 'amber', 'rose', 'violet', 'slate', 'custom']),
  customPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  customSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  customAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  tokens: DesignTokensSchema,
})

export const WebEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  intensity: z.number().min(0).max(1),
})

export const PersonalityConfigSchema = z.object({
  active: z.enum(['minimalist', 'corporate', 'creative', 'futuristic', 'playful', 'elegant', 'brutalist']),
  effects: z.array(WebEffectSchema),
  designGuide: z.string(),
})

export const QualityResultSchema = z.object({
  score: z.number().min(0).max(100),
  checks: z.array(
    z.object({
      name: z.string(),
      pass: z.boolean(),
      detail: z.string(),
    })
  ),
  lastRun: z.string().datetime(),
})

export const MetricResultSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  trend: z.enum(['up', 'down', 'flat']),
  history: z.array(z.number()),
})

export const PerformanceResultSchema = z.object({
  lcp: z.number(),
  cls: z.number(),
  inp: z.number(),
  fcp: z.number(),
  ttfb: z.number(),
  score: z.number().min(0).max(100),
})

export const AbTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['draft', 'running', 'paused', 'completed']),
  variantA: z.string(),
  variantB: z.string(),
  trafficSplit: z.number().min(0).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  winner: z.enum(['A', 'B', 'none']).optional(),
})

export const AlertItemSchema = z.object({
  id: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  timestamp: z.string().datetime(),
  acknowledged: z.boolean(),
})

export const ReportItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['audit', 'performance', 'accessibility', 'seo']),
  date: z.string().datetime(),
  score: z.number().min(0).max(100),
  summary: z.string(),
})

export const TrackingEventSchema = z.object({
  id: z.string(),
  event: z.string(),
  category: z.string(),
  label: z.string().optional(),
  value: z.number().optional(),
  timestamp: z.string().datetime(),
})

export const ResultsStateSchema = z.object({
  quality: QualityResultSchema,
  metrics: z.array(MetricResultSchema),
  performance: PerformanceResultSchema,
  abTests: z.array(AbTestSchema),
  alerts: z.array(AlertItemSchema),
  reports: z.array(ReportItemSchema),
  tracking: z.array(TrackingEventSchema),
})

export const AdminStateSchema = z.object({
  panel: z.enum(['dashboard', 'config', 'blocks', 'navbar', 'design', 'personality', 'results']),
  site: SiteConfigSchema,
  seo: SeoConfigSchema,
  blocks: z.array(BlockItemSchema),
  navbar: NavbarConfigSchema,
  design: DesignConfigSchema,
  personality: PersonalityConfigSchema,
  results: ResultsStateSchema,
  unsaved: z.boolean(),
  lastSaved: z.string().datetime().nullable(),
})

export type ValidatedAdminState = z.infer<typeof AdminStateSchema>
