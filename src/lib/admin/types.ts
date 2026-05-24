export type AdminPanel =
  | 'dashboard'
  | 'config'
  | 'blocks'
  | 'navbar'
  | 'design'
  | 'personality'
  | 'results'

export interface SiteConfig {
  name: string
  url: string
  description: string
  businessFocus: string
  whatsappNumber: string
  whatsappMessage: string
  trackingId: string
  enableAnalytics: boolean
  enableTelemetry: boolean
  maintenanceMode: boolean
}

export interface SeoConfig {
  titleTemplate: string
  defaultTitle: string
  defaultDescription: string
  ogImage: string
  twitterHandle: string
  robots: string
  canonicalBase: string
}

export interface BlockItem {
  id: string
  label: string
  enabled: boolean
  order: number
}

export interface NavbarConfig {
  logoText: string
  logoUrl: string
  layout: 'sticky' | 'fixed' | 'static'
  background: 'solid' | 'glass' | 'transparent'
  behavior: 'hide-on-scroll' | 'always-visible' | 'compress-on-scroll'
  actionButtons: { label: string; href: string; variant: 'primary' | 'secondary' | 'ghost' }[]
  navLinks: { label: string; href: string; external?: boolean }[]
}

export type ColorPalette =
  | 'ocean'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'slate'
  | 'custom'

export interface DesignTokens {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  spacingScale: 'compact' | 'normal' | 'relaxed' | 'spacious'
  shadowIntensity: 'none' | 'subtle' | 'normal' | 'dramatic'
  gradientStyle: 'none' | 'subtle' | 'vibrant' | 'mesh'
  buttonStyle: 'sharp' | 'rounded' | 'pill'
  typography: 'system' | 'modern' | 'classic' | 'mono'
}

export interface DesignConfig {
  darkModeDefault: 'dark' | 'light' | 'system'
  palette: ColorPalette
  customPrimary: string
  customSecondary: string
  customAccent: string
  tokens: DesignTokens
}

export type DesignPersonality =
  | 'minimalist'
  | 'corporate'
  | 'creative'
  | 'futuristic'
  | 'playful'
  | 'elegant'
  | 'brutalist'

export interface WebEffect {
  id: string
  name: string
  enabled: boolean
  intensity: number
}

export interface PersonalityConfig {
  active: DesignPersonality
  effects: WebEffect[]
  designGuide: string
}

export interface QualityResult {
  score: number
  checks: { name: string; pass: boolean; detail: string }[]
  lastRun: string
}

export interface MetricResult {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  history: number[]
}

export interface PerformanceResult {
  lcp: number
  cls: number
  inp: number
  fcp: number
  ttfb: number
  score: number
}

export interface AbTest {
  id: string
  name: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variantA: string
  variantB: string
  trafficSplit: number
  startDate: string
  endDate?: string
  winner?: 'A' | 'B' | 'none'
}

export interface AlertItem {
  id: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
}

export interface ReportItem {
  id: string
  title: string
  type: 'audit' | 'performance' | 'accessibility' | 'seo'
  date: string
  score: number
  summary: string
}

export interface TrackingEvent {
  id: string
  event: string
  category: string
  label?: string
  value?: number
  timestamp: string
}

export interface ResultsState {
  quality: QualityResult
  metrics: MetricResult[]
  performance: PerformanceResult
  abTests: AbTest[]
  alerts: AlertItem[]
  reports: ReportItem[]
  tracking: TrackingEvent[]
}

export interface AdminState {
  panel: AdminPanel
  site: SiteConfig
  seo: SeoConfig
  blocks: BlockItem[]
  navbar: NavbarConfig
  design: DesignConfig
  personality: PersonalityConfig
  results: ResultsState
  unsaved: boolean
  lastSaved: string | null
}

export type AdminAction =
  | { type: 'SET_PANEL'; payload: AdminPanel }
  | { type: 'UPDATE_SITE'; payload: Partial<SiteConfig> }
  | { type: 'UPDATE_SEO'; payload: Partial<SeoConfig> }
  | { type: 'SET_BLOCKS'; payload: BlockItem[] }
  | { type: 'UPDATE_NAVBAR'; payload: Partial<NavbarConfig> }
  | { type: 'UPDATE_DESIGN'; payload: Partial<DesignConfig> }
  | { type: 'UPDATE_TOKENS'; payload: Partial<DesignTokens> }
  | { type: 'UPDATE_PERSONALITY'; payload: Partial<PersonalityConfig> }
  | { type: 'SET_EFFECTS'; payload: WebEffect[] }
  | { type: 'UPDATE_RESULTS'; payload: Partial<ResultsState> }
  | { type: 'MARK_SAVED' }
  | { type: 'IMPORT_STATE'; payload: AdminState }
  | { type: 'RESET_STATE' }
