import type {
  AdminState,
  BlockItem,
  ResultsState,
  WebEffect,
} from './types'

export const defaultBlocks: BlockItem[] = [
  { id: 'hero', label: 'Hero Section', enabled: true, order: 0 },
  { id: 'systems', label: 'Systems Overview', enabled: true, order: 1 },
  { id: 'labs', label: 'Interactive Labs', enabled: true, order: 2 },
  { id: 'infrastructure', label: 'Infrastructure Stack', enabled: true, order: 3 },
  { id: 'github', label: 'GitHub Intelligence', enabled: true, order: 4 },
  { id: 'about', label: 'About', enabled: true, order: 5 },
  { id: 'contact', label: 'Contact', enabled: true, order: 6 },
]

export const defaultEffects: WebEffect[] = [
  { id: 'particles', name: 'Ambient Particles', enabled: true, intensity: 0.7 },
  { id: 'glow', name: 'Neon Glow', enabled: true, intensity: 0.5 },
  { id: 'grain', name: 'Film Grain', enabled: false, intensity: 0.3 },
  { id: 'parallax', name: 'Parallax Depth', enabled: true, intensity: 0.6 },
  { id: 'cursor', name: 'Custom Cursor', enabled: false, intensity: 0.5 },
  { id: 'noise', name: 'Background Noise', enabled: false, intensity: 0.2 },
]

export const defaultResults: ResultsState = {
  quality: {
    score: 96,
    lastRun: '2026-05-18T12:00:00.000Z',
    checks: [
      { name: 'HTML Semantic Structure', pass: true, detail: 'Proper heading hierarchy and landmarks' },
      { name: 'ARIA Labels', pass: true, detail: 'All interactive elements labeled' },
      { name: 'Color Contrast', pass: true, detail: 'WCAG AA compliant ratios' },
      { name: 'Keyboard Navigation', pass: true, detail: 'All controls reachable via Tab' },
      { name: 'Focus Indicators', pass: true, detail: 'Visible focus rings on all focusable elements' },
      { name: 'Alt Text Coverage', pass: false, detail: '3 images missing descriptive alt text' },
      { name: 'Form Labels', pass: true, detail: 'All inputs have associated labels' },
      { name: 'Skip Links', pass: true, detail: 'Skip-to-content link present' },
    ],
  },
  metrics: [
    { name: 'Visitors', value: 12400, unit: 'users', trend: 'up', history: [8200, 9100, 10300, 9800, 11200, 12400] },
    { name: 'Page Views', value: 38400, unit: 'views', trend: 'up', history: [24000, 26000, 29000, 31000, 35000, 38400] },
    { name: 'Bounce Rate', value: 34.2, unit: '%', trend: 'down', history: [42, 40, 38, 37, 35.5, 34.2] },
    { name: 'Avg Session', value: 3.8, unit: 'min', trend: 'up', history: [2.5, 2.8, 3.1, 3.3, 3.6, 3.8] },
    { name: 'Conversion', value: 4.2, unit: '%', trend: 'flat', history: [3.8, 4.0, 4.1, 4.2, 4.15, 4.2] },
  ],
  performance: {
    lcp: 1.2,
    cls: 0.02,
    inp: 120,
    fcp: 0.8,
    ttfb: 0.18,
    score: 94,
  },
  abTests: [
    { id: 'ab-1', name: 'Hero CTA Variant', status: 'running', variantA: 'Explore Systems', variantB: 'Start Building', trafficSplit: 50, startDate: '2026-05-01' },
    { id: 'ab-2', name: 'Contact Form Length', status: 'completed', variantA: '3 fields', variantB: '5 fields', trafficSplit: 50, startDate: '2026-04-15', endDate: '2026-05-10', winner: 'A' },
  ],
  alerts: [
    { id: 'a1', severity: 'warning', message: 'Graph Memory sync latency above threshold (71ms)', timestamp: '2026-05-18T11:55:00.000Z', acknowledged: false },
    { id: 'a2', severity: 'info', message: 'New deployment trading-ai-engine v2.4.1 successful', timestamp: '2026-05-18T11:45:00.000Z', acknowledged: true },
    { id: 'a3', severity: 'critical', message: 'CRM webhook batch #8841 retry triggered', timestamp: '2026-05-18T11:40:00.000Z', acknowledged: false },
  ],
  reports: [
    { id: 'r1', title: 'Monthly Accessibility Audit', type: 'accessibility', date: '2026-05-15', score: 96, summary: 'Minor alt text issues on 3 images. All other checks passed.' },
    { id: 'r2', title: 'Q2 Performance Review', type: 'performance', date: '2026-05-10', score: 94, summary: 'LCP improved by 12%. INP still needs optimization on mobile.' },
    { id: 'r3', title: 'SEO Health Check', type: 'seo', date: '2026-05-05', score: 100, summary: 'All meta tags, structured data, and sitemap validated successfully.' },
  ],
  tracking: [
    { id: 't1', event: 'page_view', category: 'engagement', label: '/en', value: 1, timestamp: '2026-05-18T11:59:00.000Z' },
    { id: 't2', event: 'click', category: 'conversion', label: 'cta_primary', value: 1, timestamp: '2026-05-18T11:58:00.000Z' },
    { id: 't3', event: 'scroll', category: 'engagement', label: 'systems_section', value: 80, timestamp: '2026-05-18T11:57:00.000Z' },
  ],
}

export const createInitialState = (): AdminState => ({
  panel: 'dashboard',
  site: {
    name: 'JootaCee',
    url: 'https://jootacee.com',
    description: 'Operational laboratory for AI systems, automation infrastructures, and modular digital ecosystems.',
    businessFocus: 'AI Systems Architecture & Automation Infrastructure',
    whatsappNumber: '',
    whatsappMessage: 'Hello, I am interested in your AI infrastructure services.',
    trackingId: '',
    enableAnalytics: true,
    enableTelemetry: true,
    maintenanceMode: false,
  },
  seo: {
    titleTemplate: '%s | JootaCee',
    defaultTitle: 'JootaCee | AI Systems Architect',
    defaultDescription: 'Operational laboratory for AI systems, automation infrastructures, and modular digital ecosystems.',
    ogImage: '/og-image.jpg',
    twitterHandle: '@jootacee',
    robots: 'index, follow',
    canonicalBase: 'https://jootacee.com',
  },
  blocks: defaultBlocks,
  navbar: {
    logoText: 'JootaCee',
    logoUrl: '',
    layout: 'sticky',
    background: 'glass',
    behavior: 'compress-on-scroll',
    actionButtons: [
      { label: 'Contact', href: '/#contact', variant: 'primary' },
    ],
    navLinks: [
      { label: 'Systems', href: '/#systems' },
      { label: 'Labs', href: '/#labs' },
      { label: 'Infrastructure', href: '/#infrastructure' },
      { label: 'GitHub', href: '/#github' },
      { label: 'About', href: '/#about' },
    ],
  },
  design: {
    darkModeDefault: 'dark',
    palette: 'ocean',
    customPrimary: '#4ba8ff',
    customSecondary: '#7ed8ff',
    customAccent: '#ffd166',
    tokens: {
      borderRadius: 'xl',
      spacingScale: 'normal',
      shadowIntensity: 'subtle',
      gradientStyle: 'subtle',
      buttonStyle: 'pill',
      typography: 'modern',
    },
  },
  personality: {
    active: 'futuristic',
    effects: defaultEffects,
    designGuide: 'Maintain high contrast, generous whitespace, and subtle motion. Prioritize readability and hierarchy. Use glassmorphism sparingly on dark backgrounds.',
  },
  results: defaultResults,
  unsaved: false,
  lastSaved: null,
})
