// ─── AI module — imported so types are available within this file ────────────
// Canonical definitions live in src/lib/ai/types.ts.
// Imported here for use inside AdminState / AdminAction; re-exported below for
// backward-compatible consumers that import from @/lib/admin/types.
import type {
  LLMProvider,
  LLMProfile,
  ChatMessage,
  ChatConversation,
  AIConfig,
} from '@/lib/ai/types'

// ─── Panel Registry ──────────────────────────────────────────────────────────

export type EntryType =
  | 'project'
  | 'research'
  | 'resource'
  | 'drive'
  | 'source'
  | 'lab'
  | 'github-showcase'
  | 'intel-source'

export type AdminPanel =
  | 'command'
  | 'intake'
  | 'projects'
  | 'research'
  | 'github'
  | 'about'
  | 'site-core'
  | 'seo'
  | 'design'
  | 'personality'
  | 'navbar-config'
  | 'content'
  | 'blocks'
  | 'footer-config'
  | 'systems'
  | 'labs'
  | 'infrastructure'
  | 'ai'
  | 'integrations'
  | 'showcase'
  | 'analytics'
  | 'design-lab'
  | 'intelligence'
  | 'posts'
  | 'content-editor'
  | 'media'
  | 'pages'
  | 'design-studio'
  | 'capabilities'
  | 'studio'
  | 'search'
  | 'taxonomy'
  | 'cms-relations'
  | 'vps'
  | 'cms-workflow'

// ─── Studio Config (Command Center settings) ──────────────────────────────────

export type StudioSidebarWidth  = 'compact' | 'normal' | 'wide'
export type StudioDensity       = 'compact' | 'normal' | 'comfortable'
export type StudioBg            = 'midnight' | 'dark' | 'slate' | 'void'
export type StudioSidebarStyle  = 'solid' | 'glass' | 'border'
export type StudioFont          = 'mono' | 'sans' | 'system'
export type StudioFontSize      = 'xs' | 'sm' | 'md'
export type StudioHeaderHeight    = 'sm' | 'md' | 'lg'
export type StudioContentWidth    = 'lg' | 'xl' | '2xl' | 'full'
export type StudioPanelPadding    = 'tight' | 'normal' | 'loose'
export type StudioBorderRadius    = 'sharp' | 'normal' | 'rounded'
export type StudioPanelTransition = 'fade' | 'slide' | 'scale' | 'none'
export type StudioScrollbarStyle  = 'normal' | 'thin' | 'hidden'
export type StudioAnimationSpeed  = 'slow' | 'normal' | 'fast'

export interface StudioWorkspaceProfile {
  id: string
  name: string
  icon: string
  description?: string
  createdAt: string
  snapshot: Partial<Omit<StudioConfig, 'workspaceProfiles' | 'customPresets'>>
}

export interface StudioNavGroupConfig {
  key: string
  label?: string
  visible: boolean
  collapsed: boolean
  order: number
}

export interface StudioCustomPreset {
  id: string
  name: string
  createdAt: string
  config: Pick<StudioConfig,
    'backgroundStyle' | 'sidebarStyle' | 'accentColor' | 'useCustomAccent' |
    'borderRadius' | 'glowEffect' | 'sidebarBorder'
  >
}

export interface StudioPanelConfig {
  id: AdminPanel
  visible: boolean
  order: number
  customLabel?: string
  customDesc?: string
}

export interface StudioConfig {
  // Layout
  sidebarWidth:    StudioSidebarWidth
  density:         StudioDensity
  headerHeight:    StudioHeaderHeight
  contentMaxWidth: StudioContentWidth
  panelPadding:    StudioPanelPadding
  // Appearance
  backgroundStyle: StudioBg
  sidebarStyle:    StudioSidebarStyle
  accentColor:     string
  useCustomAccent: boolean
  fontFamily:      StudioFont
  fontSize:        StudioFontSize
  borderRadius:    StudioBorderRadius
  glowEffect:      boolean
  glowOpacity:     number
  sidebarBorder:   boolean
  activePreset:    string
  // Behavior
  animations:              boolean
  showDescriptions:        boolean
  rememberLastPanel:       boolean
  keyboardShortcuts:       boolean
  showSavedIndicator:      boolean
  confirmReset:            boolean
  autoSaveMs:              number
  showTooltips:            boolean
  sidebarCollapsedDefault: boolean
  sidebarHoverExpand:      boolean
  headerShowClock:         boolean
  compactHeader:           boolean
  panelTransition:         StudioPanelTransition
  scrollbarStyle:          StudioScrollbarStyle
  animationSpeed:          StudioAnimationSpeed
  showPanelBadges:         boolean
  sidebarFooter:           boolean
  // Accessibility
  reducedMotion: boolean
  highContrast:  boolean
  // Default state
  defaultPanel: AdminPanel
  // Nav group visibility + order
  navGroups:         StudioNavGroupConfig[]
  panelOverrides:    StudioPanelConfig[]
  showGroupDividers: boolean
  // Pinned panels (always visible at top of sidebar)
  pinnedPanels: AdminPanel[]
  // User-saved custom presets
  customPresets: StudioCustomPreset[]
  // User-saved workspace profiles (full config snapshots)
  workspaceProfiles: StudioWorkspaceProfile[]
  // Header quick actions
  headerActions: {
    showExport:  boolean
    showImport:  boolean
    showBackup:  boolean
    showReset:   boolean
    showSearch:  boolean
  }
}

// ─── About Config ─────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id:          string
  year:        string
  title:       string
  org:         string
  description: string
  type:        'work' | 'project' | 'certification' | 'education' | 'milestone'
}

export interface AboutConfig {
  headline:            string
  bio:                 string
  location:            string
  availability:        'available' | 'limited' | 'unavailable'
  skills:              string[]
  tools:               string[]
  certifications:      string[]
  collaborationTypes:  string[]
  timeline:            TimelineEntry[]
}

// ─── Site Core ────────────────────────────────────────────────────────────────

export interface SiteConfig {
  name: string
  url: string
  description: string
  businessFocus: string
  trackingId: string
  enableAnalytics: boolean
  enableTelemetry: boolean
  maintenanceMode: boolean
  /** VPS Content API base URL — overrides NEXT_PUBLIC_CONTENT_API_URL env var */
  contentApiUrl: string
  contentApiEnabled: boolean
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

export interface RuntimeMeta {
  version: string
  environment: 'production' | 'staging' | 'development'
  deployedAt: string
  activeAgents: number
  mcpTools: number
  systemsOnline: number
}

// ─── Systems Manager ─────────────────────────────────────────────────────────

export type SystemStatus = 'operational' | 'degraded' | 'maintenance' | 'offline'

export interface SystemEntry {
  key: string
  name: string
  badge: string
  description: string
  status: SystemStatus
  version: string
  uptime: string
  tools: number
  visible: boolean
  cmsStatus?: CmsStatus
}

// ─── Labs Manager ─────────────────────────────────────────────────────────────

export type LabStatus = 'live' | 'beta' | 'rd' | 'roadmap'

export interface LabMetric {
  label: string
  value: string
}

export interface LabEntry {
  key: string
  name: string
  tagline: string
  status: LabStatus
  description: string
  stack: string[]
  metrics: LabMetric[]
  accent: string
  visible: boolean
  cmsStatus?: CmsStatus
}

// ─── Research Manager ────────────────────────────────────────────────────────

export type ResearchCategory = 'opinion' | 'research' | 'essays' | 'news'

export interface ResearchEntry {
  slug: string
  title: string
  category: ResearchCategory
  excerpt: string
  body?: string
  externalUrl?: string
  tags: string[]
  readTime: number
  published: boolean
  featured: boolean
  createdAt?: string
  publishedAt?: string
  /** Full lifecycle status. `published` flag kept for backward compat. */
  cmsStatus?: CmsStatus
}

// ─── Projects Manager ────────────────────────────────────────────────────────

export type ProjectStatus = 'live' | 'beta' | 'wip' | 'archived'
export type ProjectCategory = 'ai' | 'web' | 'automation' | 'infrastructure' | 'tool' | 'research' | 'other'

export interface ProjectScreenshot {
  url: string
  alt: string
  caption?: string
}

export interface ProjectEntry {
  id: string
  slug: string
  title: string
  tagline: string
  category: ProjectCategory
  status: ProjectStatus
  featured: boolean
  published: boolean
  description: string
  body?: string
  techStack: string[]
  tags: string[]
  repoUrl?: string
  liveUrl?: string
  screenshots: ProjectScreenshot[]
  architectureDiagram?: string
  roadmap?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  relatedResearch?: string[]
  relatedResources?: string[]
  accent: string
  /** Full lifecycle status. `published` flag kept for backward compat. */
  cmsStatus?: CmsStatus
}

// ─── CMS Phase 3 — Content Lifecycle ─────────────────────────────────────────

/** Four-stage lifecycle for portfolio content managed in AdminState. */
export type CmsStatus = 'draft' | 'review' | 'published' | 'archived'

/** Global taxonomy atom. Tags are defined once, referenced by slug everywhere. */
export interface Tag {
  id: string
  slug: string
  label: string
  color?: string
  description?: string
  createdAt: string
}

/** Hierarchical taxonomy node (optional parent for nesting). */
export interface Category {
  id: string
  slug: string
  label: string
  description?: string
  parentId?: string
  createdAt: string
}

/** External media asset for portfolio content (URLs only — no file upload in static export). */
export type MediaSource = 'external' | 'github'
export interface MediaItem {
  id: string
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
  mimeType?: string
  source: MediaSource
  addedAt: string
}

/** Ordered reading sequence grouping content items. */
export interface Series {
  id: string
  slug: string
  title: string
  description?: string
  /** ContentItem IDs in reading order */
  order: string[]
  contentType: RevisionContentType
  createdAt: string
}

/** Point-in-time snapshot of a portfolio content item for revision history. */
export type RevisionContentType = 'project' | 'research' | 'lab' | 'system'
export interface ContentRevision {
  id: string
  contentId: string
  contentType: RevisionContentType
  savedAt: string
  note?: string
  // reason: generic snapshot — caller controls shape, restored via typed dispatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: Record<string, any>
}

// ─── CMS Maturity — Phase 3 extensions ────────────────────────────────────────

/** Immutable append-only audit record. Max 200 entries (oldest pruned). */
export interface AuditLogEntry {
  id: string
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'archive' | 'rollback' | 'schedule' | 'delete'
  contentType: string
  contentId: string
  contentSlug: string
  timestamp: string   // ISO 8601
  previousStatus?: CmsStatus
  newStatus?: CmsStatus
  metadata?: Record<string, string>
}

/** Bi-directional link between en and es variants of the same content. */
export interface LocaleRelation {
  id: string
  contentType: RevisionContentType
  enId: string        // ContentItem.id of the English version
  esId: string        // ContentItem.id of the Spanish version
  createdAt: string
}

/** Typed cross-reference between two content items. */
export type ContentRelationType = 'related' | 'references' | 'part-of' | 'supersedes'
export interface ContentRelation {
  id: string
  sourceId: string
  sourceType: RevisionContentType
  targetId: string
  targetType: RevisionContentType
  relationType: ContentRelationType
  createdAt: string
}

/** Scheduled future publish — applied when APPLY_SCHEDULED_PUBLISHES fires on load. */
export type ScheduleStatus = 'pending' | 'applied' | 'cancelled'
export interface PublishSchedule {
  id: string
  contentId: string
  contentType: RevisionContentType
  contentSlug: string
  scheduledAt: string   // ISO — publish at this UTC timestamp
  createdAt: string
  status: ScheduleStatus
}

// ─── Curated Links ────────────────────────────────────────────────────────────

export type LinkCategory = 'tools' | 'articles' | 'repos' | 'videos' | 'docs' | 'agents' | 'automations' | 'other'

export interface CuratedLink {
  id: string
  url: string
  title: string
  description: string
  category: LinkCategory
  tags: string[]
  domain: string
  published: boolean
  featured: boolean
  addedAt: string
}

// ─── Drive Resources ──────────────────────────────────────────────────────────

export type DriveResourceType = 'agent-md' | 'skill-md' | 'automation' | 'mcp-config' | 'prompt' | 'template' | 'dataset' | 'other'

export interface DriveResource {
  id: string
  driveUrl: string
  title: string
  description: string
  resourceType: DriveResourceType
  tags: string[]
  published: boolean
  addedAt: string
}

// ─── Resource Registries ─────────────────────────────────────────────────────

export interface ResourceToolItem   { id: string; name: string; subCat: string; url: string; pricing: string }
export interface ResourceRepoItem   { id: string; org: string; name: string; lang: string; stars: string; url: string; cat: string }
export interface ResourceWorkItem   { id: string; title: string; type: 'cicd' | 'n8n' | 'ai'; complexity: 'Low' | 'Medium' | 'High' }
export interface ResourcePromptItem { id: string; title: string; cat: string; models: string[] }
export interface ResourceMcpItem    { id: string; name: string; cat: string; install: string; toolCount: number }
export interface ResourceAgentItem  { id: string; title: string; stack: string[] }
export interface ResourceSkillItem  { id: string; command: string; title: string; builtin: boolean }

// ─── Tracked Sources ──────────────────────────────────────────────────────────

export type TrackedSourceType = 'newsletter' | 'blog' | 'youtube' | 'podcast' | 'github' | 'twitter' | 'other'

export interface TrackedSource {
  id: string
  name: string
  url: string
  sourceType: TrackedSourceType
  description: string
  active: boolean
  addedAt: string
}

// ─── Infrastructure Manager ───────────────────────────────────────────────────

export type NodeStatus = 'running' | 'stopped' | 'degraded'

export interface InfraNode {
  name: string
  role: string
  image: string
  status: NodeStatus
  cpu: string
  mem: string
  uptime: string
  visible: boolean
}

export type DeployStatus = 'success' | 'pending' | 'failed'

export interface DeployEntry {
  service: string
  version: string
  env: string
  status: DeployStatus
  timestamp: string
}

export interface InfraConfig {
  region: string
  orchestrator: string
  version: string
  nodes: InfraNode[]
  deployments: DeployEntry[]
}

// ─── GitHub Layer ─────────────────────────────────────────────────────────────

export interface GithubRepoMeta {
  description: string
  language: string
  stars: number
  forks: number
  topics: string[]
  pinned: boolean
}

export type GithubDisplayMode = 'grid' | 'list' | 'compact'

export interface GithubConfig {
  username: string
  accessToken: string
  displayRepos: string[]
  repoMeta: Record<string, GithubRepoMeta>
  // ── Section visibility ─────────────────────────────────────
  showProfileCard: boolean
  showContributions: boolean
  showStats: boolean
  showActivity: boolean
  showLanguages: boolean
  showTopics: boolean
  showForks: boolean
  showStarred: boolean
  showOwnRepos: boolean
  showCommitActivity: boolean
  showRecentReleases: boolean
  showDeployments: boolean
  // ── Page hero ──────────────────────────────────────────────
  pageBadge: string
  pageHeadline: string
  pageSubheadline: string
  // ── Curated repos section ──────────────────────────────────
  ownReposTitle: string
  ownReposSubtitle: string
  ownReposLimit: number
  // ── Starred section ────────────────────────────────────────
  starredTitle: string
  starredSubtitle: string
  showStarredCategories: boolean
  // ── Display ────────────────────────────────────────────────
  statSlot4: 'forks' | 'starred'
  activityLimit: number
  displayMode: GithubDisplayMode
}

// ─── Visual Engine (extracted to types/design.ts) ─────────────────────────────
import type {
  ColorPalette,
  DesignTokens,
  DomainAccents,
  DesignConfig,
  DesignPersonality,
  WebEffect,
  PersonalityConfig,
  VisualEffectToggle,
  ShaderPreset,
  BgGridConfig,
  VisualEffectsConfig,
  HeroSceneConfig,
  PageEffectSlot,
  PageEffectsMap,
} from './types/design'

export type {
  ColorPalette,
  DesignTokens,
  DomainAccents,
  DesignConfig,
  DesignPersonality,
  WebEffect,
  PersonalityConfig,
  VisualEffectToggle,
  ShaderPreset,
  BgGridConfig,
  VisualEffectsConfig,
  HeroSceneConfig,
  PageEffectSlot,
  PageEffectsMap,
}

// ─── Intelligence Feeds ───────────────────────────────────────────────────────

export type FeedCategory =
  | 'news' | 'tech' | 'finance' | 'research' | 'social' | 'opendata' | 'ai'
  | 'osint' | 'conflict' | 'security' | 'aviation' | 'cyber' | 'disaster'
  | 'energy' | 'markets' | 'climate' | 'humanitarian'
  | 'tool' | 'resource' | 'reference' | 'community' | 'newsletter' | 'video' | 'podcast' | 'database'
export type FeedType = 'rss' | 'api' | 'websocket' | 'relay'
export type FeedPlan = 'free' | 'freemium' | 'paid'

export interface IntelligenceFeed {
  id: string
  name: string
  category: FeedCategory
  type: FeedType
  plan: FeedPlan
  description: string
  url: string
  docsUrl: string
  apiKey: string
  enabled: boolean
  connected: boolean
  lastSync: string | null
  itemCount: number
  icon: string  // emoji or letter
  color: string // hex accent
  // Optional enrichment fields
  tags?: string[]           // user-defined tags
  website?: string          // homepage URL (different from feed/API url)
  language?: string         // e.g. 'en', 'es'
  notes?: string            // internal admin notes
  publishable?: boolean     // mark to show on public site
  publishedPages?: string[] // page slugs: ['research', 'resources', 'home']
}

export interface IntelligenceConfig {
  feeds: IntelligenceFeed[]
  refreshInterval: number  // minutes
  maxItemsPerFeed: number
  autoRefresh: boolean
}

export interface NavEntry {
  key: string
  label: string
  href: string
  visible: boolean
  order: number
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
// Canonical types live in src/lib/ai/types.ts (imported at the top of this file).
// Re-exported here for backward compatibility — prefer importing from @/lib/ai.

export type { LLMProvider, LLMProfile, ChatMessage, ChatConversation, AIConfig }

// ─── Integrations ─────────────────────────────────────────────────────────────

export interface GitHubRepo {
  name: string
  fullName: string
  description: string
  stars: number
  forks: number
  language: string
  url: string
  isPrivate: boolean
  updatedAt: string
  topics?: string[]
}

export interface GitHubIntegration {
  connected: boolean
  accessToken: string
  username: string
  avatarUrl: string
  repos: GitHubRepo[]
  selectedRepos: string[]
  lastSync: string | null
}

// ─── Data Sources ─────────────────────────────────────────────────────────────

export type SourceType = 'github-repo' | 'file' | 'url' | 'database' | 'archive' | 'folder'
export type SourceStatus = 'pending' | 'indexing' | 'ready' | 'error'

export interface ShowcaseOutput {
  readme: string
  showcase: string
  architecture: string
  features: string
  stack: string
  generatedAt: string
  modelUsed: string
}

export interface DataSource {
  id: string
  type: SourceType
  name: string
  description: string
  url?: string
  content: string
  fileTree: string[]
  metadata: Record<string, string | number | boolean>
  status: SourceStatus
  addedAt: string
  byteSize: number
  error?: string
  showcaseOutput?: ShowcaseOutput
}

// ─── Social Platforms ─────────────────────────────────────────────────────────

export type SocialPlatformId =
  // Social networks
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'bluesky'
  | 'mastodon'
  | 'reddit'
  | 'facebook'
  | 'threads'
  // Video / streaming
  | 'youtube'
  | 'twitch'
  | 'vimeo'
  // Developer platforms
  | 'devto'
  | 'hashnode'
  | 'stackoverflow'
  | 'gitlab'
  | 'huggingface'
  | 'npm_org'
  // Design / creative
  | 'behance'
  | 'dribbble'
  | 'figma'
  // Writing / newsletter
  | 'medium'
  | 'substack'
  | 'beehiiv'
  // Audio / podcast
  | 'spotify'
  | 'soundcloud'
  // Community / messaging
  | 'telegram'
  | 'discord'
  // Productivity / knowledge
  | 'notion'
  // Monetization
  | 'producthunt'
  | 'gumroad'
  | 'kofi'
  | 'patreon'

export interface SocialStat {
  label: string
  value: string | number
}

export interface SocialPlatform {
  id: SocialPlatformId
  connected: boolean
  handle: string
  profileUrl: string
  apiKey: string
  displayName: string
  bio: string
  avatarUrl: string
  stats: SocialStat[]
  visible: boolean
  lastSync: string | null
}

export interface IntegrationsConfig {
  github: GitHubIntegration
  dataSources: DataSource[]
  socialPlatforms: SocialPlatform[]
  /** Vercel / Netlify / CF Pages deploy hook URL. Stored here for single-admin convenience. */
  deployHookUrl?: string
  /** ISO timestamp of last manual deploy trigger. */
  lastDeployTriggeredAt?: string
}

// ─── Hermes Agent ─────────────────────────────────────────────────────────────

export type HermesBackend = 'local' | 'docker' | 'ssh' | 'singularity' | 'modal' | 'daytona' | 'vercel'
export type HermesStatus = 'connected' | 'disconnected' | 'connecting' | 'error'
export type PlatformId = 'telegram' | 'discord' | 'slack' | 'whatsapp' | 'signal' | 'email'

export interface PlatformConnection {
  id: PlatformId
  enabled: boolean
  token: string
  botName: string
  webhookUrl?: string
  status: 'active' | 'inactive' | 'error'
}

export interface HermesCronTask {
  id: string
  name: string
  cron: string
  prompt: string
  deliveryPlatform: PlatformId | 'cli'
  enabled: boolean
  lastRun: string | null
}

export interface HermesConfig {
  enabled: boolean
  backend: HermesBackend
  endpoint: string
  status: HermesStatus
  provider: string
  model: string
  portalEnabled: boolean
  portalToken: string
  learningLoop: boolean
  persistentMemory: boolean
  scheduler: boolean
  subagents: boolean
  mcpEnabled: boolean
  lastConnected: string | null
  apiKey: string
  sshHost: string
  sshUser: string
  sshPort: string
  dockerImage: string
  singularityImage: string
  modalAppName: string
  daytonaWorkspace: string
  vercelFunctionUrl: string
  voiceTranscription: boolean
  sessionSearch: boolean
  userModeling: boolean
  researchMode: boolean
  commandApproval: boolean
  containerIsolation: boolean
  allowedUsers: string
  personality: string
  contextFiles: string
  scheduledTasks: HermesCronTask[]
  version: string
  toolGateway: boolean
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

export type MCPTransport = 'http' | 'sse' | 'stdio'

export interface MCPServer {
  id: string
  name: string
  url: string
  transport: MCPTransport
  description: string
  enabled: boolean
}

export interface CapabilitySkill {
  id: string
  name: string
  description: string
  source: string
  type: 'skill' | 'agent' | 'tool'
  enabled: boolean
  systemPrompt?: string
}

export interface CapabilitiesConfig {
  mcpServers: MCPServer[]
  skills: CapabilitySkill[]
  hermes: HermesConfig
  platforms: PlatformConnection[]
}

// ─── Blocks Panel ─────────────────────────────────────────────────────────────

export interface BlockSection {
  id: string             // unique UUID per instance
  type: string           // block template key ('hero' | 'gallery' | 'stats' | etc.)
  label: string
  description: string
  icon: string
  enabled: boolean
  order: number
  effects3D: boolean
  effects3DIntensity: number
}

// ─── Content Panel ────────────────────────────────────────────────────────────

export interface HeroContent {
  eyebrow: string
  title: string
  subtitle: string
  primaryBtnText: string
  primaryBtnHref: string
  secondaryBtnText: string
  secondaryBtnHref: string
  showBadge: boolean
}

export interface StatItem {
  value: string
  label: string
  icon: string
}

export interface ServiceItem {
  icon: string
  title: string
  description: string
}

export interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted: boolean
  ctaText: string
  ctaHref: string
}

export interface TestimonialItem {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
}

// ─── Extended content types (one per block) ───────────────────────────────────

export interface LogoItem {
  id: string
  name: string
  imageUrl: string
  url: string
}

export interface GalleryItem {
  id: string
  src: string
  alt: string
  caption: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  photoUrl: string
  linkedin: string
  github: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  tags: string[]
  url: string
  year: string
}

export interface CtaContent {
  headline: string
  subheadline: string
  primaryBtnText: string
  primaryBtnHref: string
  secondaryBtnText: string
  secondaryBtnHref: string
  showBackground: boolean
}

export interface ContactContent {
  email: string
  phone: string
  address: string
  mapEmbedUrl: string
  showForm: boolean
  showMap: boolean
  whatsapp: string
}

export interface MapContent {
  embedUrl: string
  markerLabel: string
  zoom: number
}

export interface NewsletterContent {
  title: string
  description: string
  placeholder: string
  successMessage: string
  showNameField: boolean
}

export interface SocialProofItem {
  id: string
  name: string
  imageUrl: string
  url: string
  category: 'award' | 'certification' | 'partner' | 'press'
}

export interface BlogContent {
  postsCount: number
  showAuthor: boolean
  showDate: boolean
  showExcerpt: boolean
  category: string
}

export interface SiteContent {
  hero: HeroContent
  logos: LogoItem[]
  stats: StatItem[]
  services: ServiceItem[]
  gallery: GalleryItem[]
  team: TeamMember[]
  pricing: PricingPlan[]
  testimonials: TestimonialItem[]
  faq: FaqItem[]
  blog: BlogContent
  portfolio: PortfolioItem[]
  cta: CtaContent
  contact: ContactContent
  map: MapContent
  newsletter: NewsletterContent
  socialProof: SocialProofItem[]
}

// ─── Footer Config ────────────────────────────────────────────────────────────

export type FooterVariant = 'minimal' | 'columns' | 'centered'
export type FooterBackground = 'dark' | 'light' | 'transparent' | 'card'

export interface FooterLinkColumn {
  id: string
  heading: string
  links: { label: string; href: string }[]
}

export interface FooterSocial {
  platform: string
  url: string
  visible: boolean
}

export interface FooterSettings {
  visible: boolean
  variant: FooterVariant
  background: FooterBackground
  showLogo: boolean
  showScrollTop: boolean
  brandDescription: string
  columns: FooterLinkColumn[]
  socials: FooterSocial[]
  showNewsletter: boolean
  newsletterTitle: string
  newsletterPlaceholder: string
  legalLinks: { label: string; href: string }[]
  copyrightText: string
}

// ─── Navbar Config ────────────────────────────────────────────────────────────

export type NavbarVariant = 'default' | 'centered' | 'minimal' | 'side'
export type NavbarShape = 'square' | 'rounded' | 'pill'
export type NavbarHeight = 'compact' | 'medium' | 'tall'
export type NavbarShadow = 'none' | 'subtle' | 'normal' | 'dramatic'
export type NavbarBackground = 'solid' | 'blur' | 'transparent' | 'glass'
export type NavbarLogoIcon = 'sparkles' | 'zap' | 'cpu' | 'globe' | 'none'

export interface NavbarSettings {
  visible: boolean
  showIconWithName: boolean
  logoIcon: NavbarLogoIcon
  variant: NavbarVariant
  shape: NavbarShape
  height: NavbarHeight
  shadow: NavbarShadow
  background: NavbarBackground
  showBorderBottom: boolean
  backdropBlur: boolean
  sticky: boolean
  transparentOnTop: boolean
  animateOnScroll: boolean
}

// ─── VPS Sync State (Phase 4) ─────────────────────────────────────────────────

/**
 * The 6 sync states for VPS content mutations.
 * idle → saving → saved → validating → building → deployed | failed
 */
export type VpsSyncState = 'idle' | 'saving' | 'saved' | 'validating' | 'building' | 'deployed' | 'failed'

export interface VpsSyncStatus {
  state: VpsSyncState
  message: string
  jobId?: string
  error?: string
  lastSyncAt?: string
}

export const VPS_SYNC_IDLE: VpsSyncStatus = { state: 'idle', message: '' }

// ─── CMS Job Queue ────────────────────────────────────────────────────────────

export type CmsJobType =
  | 'git-commit'     // Commit changes to Git via VPS API
  | 'git-push'       // Push branch to remote
  | 'deploy-hook'    // Trigger Cloudflare/Netlify/Vercel deploy webhook
  | 'media-upload'   // Upload media file to VPS
  | 'publish'        // Full publish pipeline (commit + push + deploy)
  | 'rollback'       // Revert to a previous revision

export type CmsJobStatus = 'pending' | 'running' | 'done' | 'failed' | 'cancelled'

export interface CmsJob {
  id: string
  type: CmsJobType
  label: string
  status: CmsJobStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  /** Serialisable context — varies by job type */
  payload: Record<string, unknown>
  /** Output from the job (e.g. commit SHA, deploy URL) */
  result?: Record<string, unknown>
  error?: string
  /** Number of retry attempts so far */
  attempts: number
}

// ─── Root State ───────────────────────────────────────────────────────────────

export interface AdminState {
  panel: AdminPanel
  // Site Core
  site: SiteConfig
  seo: SeoConfig
  runtime: RuntimeMeta
  // Ecosystem Managers
  projectsRegistry: ProjectEntry[]
  systemsRegistry: SystemEntry[]
  labsRegistry: LabEntry[]
  researchRegistry: ResearchEntry[]
  infraConfig: InfraConfig
  githubConfig: GithubConfig
  // Design
  design: DesignConfig
  personality: PersonalityConfig
  visualEffects: VisualEffectsConfig
  heroSceneConfig: HeroSceneConfig
  pageEffectsMap: PageEffectsMap
  // Personalización
  blocks: BlockSection[]
  pageBlocksMap: Record<string, BlockSection[]>
  content: SiteContent
  navbarSettings: NavbarSettings
  footerSettings: FooterSettings
  navigation: NavEntry[]
  // Resource Registries
  toolRegistry:     ResourceToolItem[]
  repoRegistry:     ResourceRepoItem[]
  workflowRegistry: ResourceWorkItem[]
  promptRegistry:   ResourcePromptItem[]
  mcpRegistry:      ResourceMcpItem[]
  agentRegistry:    ResourceAgentItem[]
  skillRegistry:    ResourceSkillItem[]
  // Content Operations
  curatedLinks: CuratedLink[]
  driveResources: DriveResource[]
  trackedSources: TrackedSource[]
  aboutConfig: AboutConfig
  // Ecosistema
  aiConfig: AIConfig
  integrations: IntegrationsConfig
  capabilities: CapabilitiesConfig
  intelligence: IntelligenceConfig
  // CMS
  editingPostId: string | null
  intakeType: EntryType | null
  pagesActiveTab?: string
  // CMS Phase 3 — taxonomies, media, revisions, series
  tagRegistry: Tag[]
  categoryRegistry: Category[]
  mediaRegistry: MediaItem[]
  seriesRegistry: Series[]
  /** Rolling revision log — max 50 entries (oldest pruned). */
  revisionLog: ContentRevision[]
  // CMS Maturity — Phase 3 extensions
  /** Append-only audit trail — max 200 entries. */
  auditLog: AuditLogEntry[]
  /** Links between English and Spanish variants of the same content. */
  localeRelations: LocaleRelation[]
  /** Typed cross-references between content items. */
  contentRelations: ContentRelation[]
  /** Scheduled future publishes (applied on store init). */
  publishSchedules: PublishSchedule[]
  // Command Center
  studioConfig: StudioConfig
  // CMS Job Queue — persisted so in-flight jobs survive page reloads
  jobQueue: CmsJob[]
  // Meta
  unsaved: boolean
  lastSaved: string | null
  // VPS Sync (Phase 4 — ephemeral, not persisted to localStorage)
  vpsStatus: VpsSyncStatus
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type AdminAction =
  | { type: 'SET_PANEL'; payload: AdminPanel }
  | { type: 'SET_EDITING_POST_ID'; payload: string | null }
  | { type: 'SET_INTAKE_TYPE'; payload: EntryType | null }
  | { type: 'SET_PAGES_TAB'; payload: string }
  | { type: 'UPDATE_SITE'; payload: Partial<SiteConfig> }
  | { type: 'UPDATE_SEO'; payload: Partial<SeoConfig> }
  | { type: 'UPDATE_RUNTIME'; payload: Partial<RuntimeMeta> }
  // Projects
  | { type: 'SET_PROJECTS_REGISTRY'; payload: ProjectEntry[] }
  | { type: 'ADD_PROJECT'; payload: ProjectEntry }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; data: Partial<ProjectEntry> } }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'SET_SYSTEMS_REGISTRY'; payload: SystemEntry[] }
  | { type: 'ADD_SYSTEM'; payload: SystemEntry }
  | { type: 'UPDATE_SYSTEM'; payload: { key: string; data: Partial<SystemEntry> } }
  | { type: 'REMOVE_SYSTEM'; payload: string }
  | { type: 'SET_LABS_REGISTRY'; payload: LabEntry[] }
  | { type: 'ADD_LAB_ENTRY'; payload: LabEntry }
  | { type: 'UPDATE_LAB'; payload: { key: string; data: Partial<LabEntry> } }
  | { type: 'SET_RESEARCH_REGISTRY'; payload: ResearchEntry[] }
  | { type: 'ADD_RESEARCH_ENTRY'; payload: ResearchEntry }
  | { type: 'UPDATE_RESEARCH_ENTRY'; payload: { slug: string; data: Partial<ResearchEntry> } }
  | { type: 'UPDATE_INFRA_CONFIG'; payload: Partial<Omit<InfraConfig, 'nodes' | 'deployments'>> }
  | { type: 'SET_INFRA_NODES'; payload: InfraNode[] }
  | { type: 'UPDATE_INFRA_NODE'; payload: { name: string; data: Partial<InfraNode> } }
  | { type: 'ADD_INFRA_NODE'; payload: InfraNode }
  | { type: 'REMOVE_INFRA_NODE'; payload: string }
  | { type: 'SET_INFRA_DEPLOYMENTS'; payload: DeployEntry[] }
  | { type: 'ADD_INFRA_DEPLOYMENT'; payload: DeployEntry }
  | { type: 'REMOVE_INFRA_DEPLOYMENT'; payload: number }
  | { type: 'UPDATE_GITHUB_CONFIG'; payload: Partial<GithubConfig> }
  | { type: 'SET_REPO_META'; payload: { repo: string; meta: Partial<GithubRepoMeta> } }
  // Resource Registries
  | { type: 'SET_TOOL_REGISTRY';     payload: ResourceToolItem[] }
  | { type: 'SET_REPO_REGISTRY';     payload: ResourceRepoItem[] }
  | { type: 'SET_WORKFLOW_REGISTRY'; payload: ResourceWorkItem[] }
  | { type: 'SET_PROMPT_REGISTRY';   payload: ResourcePromptItem[] }
  | { type: 'SET_MCP_REGISTRY';      payload: ResourceMcpItem[] }
  | { type: 'SET_AGENT_REGISTRY';    payload: ResourceAgentItem[] }
  | { type: 'SET_SKILL_REGISTRY';    payload: ResourceSkillItem[] }
  // Curated Links
  | { type: 'SET_CURATED_LINKS'; payload: CuratedLink[] }
  | { type: 'ADD_CURATED_LINK'; payload: CuratedLink }
  | { type: 'UPDATE_CURATED_LINK'; payload: { id: string; data: Partial<CuratedLink> } }
  | { type: 'REMOVE_CURATED_LINK'; payload: string }
  // Drive Resources
  | { type: 'SET_DRIVE_RESOURCES'; payload: DriveResource[] }
  | { type: 'ADD_DRIVE_RESOURCE'; payload: DriveResource }
  | { type: 'UPDATE_DRIVE_RESOURCE'; payload: { id: string; data: Partial<DriveResource> } }
  | { type: 'REMOVE_DRIVE_RESOURCE'; payload: string }
  // Tracked Sources
  | { type: 'SET_TRACKED_SOURCES'; payload: TrackedSource[] }
  | { type: 'ADD_TRACKED_SOURCE'; payload: TrackedSource }
  | { type: 'UPDATE_TRACKED_SOURCE'; payload: { id: string; data: Partial<TrackedSource> } }
  | { type: 'REMOVE_TRACKED_SOURCE'; payload: string }
  // Blocks
  | { type: 'SET_BLOCKS'; payload: BlockSection[] }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; data: Partial<BlockSection> } }
  // Page Blocks Map
  | { type: 'SET_PAGE_BLOCKS'; payload: { page: string; blocks: BlockSection[] } }
  | { type: 'UPDATE_PAGE_BLOCK'; payload: { page: string; id: string; data: Partial<BlockSection> } }
  // Content
  | { type: 'UPDATE_CONTENT'; payload: Partial<SiteContent> }
  | { type: 'UPDATE_HERO_CONTENT'; payload: Partial<HeroContent> }
  | { type: 'SET_LOGOS'; payload: LogoItem[] }
  | { type: 'SET_STATS'; payload: StatItem[] }
  | { type: 'SET_SERVICES'; payload: ServiceItem[] }
  | { type: 'SET_GALLERY'; payload: GalleryItem[] }
  | { type: 'SET_TEAM'; payload: TeamMember[] }
  | { type: 'SET_PRICING'; payload: PricingPlan[] }
  | { type: 'SET_TESTIMONIALS'; payload: TestimonialItem[] }
  | { type: 'SET_FAQ'; payload: FaqItem[] }
  | { type: 'UPDATE_BLOG_CONTENT'; payload: Partial<BlogContent> }
  | { type: 'SET_PORTFOLIO'; payload: PortfolioItem[] }
  | { type: 'UPDATE_CTA_CONTENT'; payload: Partial<CtaContent> }
  | { type: 'UPDATE_CONTACT_CONTENT'; payload: Partial<ContactContent> }
  | { type: 'UPDATE_MAP_CONTENT'; payload: Partial<MapContent> }
  | { type: 'UPDATE_NEWSLETTER_CONTENT'; payload: Partial<NewsletterContent> }
  | { type: 'SET_SOCIAL_PROOF'; payload: SocialProofItem[] }
  // Navbar Config
  | { type: 'UPDATE_NAVBAR_SETTINGS'; payload: Partial<NavbarSettings> }
  // Footer Config
  | { type: 'UPDATE_FOOTER_SETTINGS'; payload: Partial<FooterSettings> }
  | { type: 'SET_FOOTER_COLUMNS'; payload: FooterLinkColumn[] }
  // Navigation links
  | { type: 'SET_NAVIGATION'; payload: NavEntry[] }
  | { type: 'UPDATE_DESIGN'; payload: Partial<DesignConfig> }
  | { type: 'UPDATE_TOKENS'; payload: Partial<DesignTokens> }
  | { type: 'UPDATE_PERSONALITY'; payload: Partial<PersonalityConfig> }
  | { type: 'SET_EFFECTS'; payload: WebEffect[] }
  | { type: 'UPDATE_VISUAL_EFFECTS'; payload: Partial<VisualEffectsConfig> }
  | { type: 'SET_SHADER_PRESET'; payload: string }
  | { type: 'SET_HERO_SCENE_CONFIG'; payload: Partial<HeroSceneConfig> }
  | { type: 'SET_PAGE_EFFECT'; payload: { page: string; slot: Partial<PageEffectSlot> } }
  // About
  | { type: 'UPDATE_ABOUT'; payload: Partial<AboutConfig> }
  | { type: 'ABOUT_ADD_TIMELINE'; payload: TimelineEntry }
  | { type: 'ABOUT_UPDATE_TIMELINE'; payload: { id: string; data: Partial<TimelineEntry> } }
  | { type: 'ABOUT_REMOVE_TIMELINE'; payload: string }
  // Intelligence Feeds
  | { type: 'INTELLIGENCE_TOGGLE_FEED'; payload: string }
  | { type: 'INTELLIGENCE_SET_KEY'; payload: { id: string; key: string } }
  | { type: 'INTELLIGENCE_UPDATE_CONFIG'; payload: Partial<IntelligenceConfig> }
  | { type: 'INTELLIGENCE_SET_STATUS'; payload: { id: string; connected: boolean; lastSync: string; itemCount: number } }
  | { type: 'INTELLIGENCE_ADD_FEED'; payload: IntelligenceFeed }
  | { type: 'INTELLIGENCE_REMOVE_FEED'; payload: string }
  | { type: 'INTELLIGENCE_UPDATE_FEED'; payload: { id: string; data: Partial<IntelligenceFeed> } }
  // AI Assistant
  | { type: 'AI_NEW_CONVERSATION'; payload: ChatConversation }
  | { type: 'AI_SET_ACTIVE'; payload: string }
  | { type: 'AI_ADD_MESSAGE'; payload: { conversationId: string; message: ChatMessage } }
  | { type: 'AI_UPDATE_TITLE'; payload: { conversationId: string; title: string } }
  | { type: 'AI_DELETE_CONVERSATION'; payload: string }
  | { type: 'AI_SET_PROFILE'; payload: LLMProfile }
  | { type: 'AI_SET_ACTIVE_PROFILE'; payload: string }
  | { type: 'AI_REMOVE_PROFILE'; payload: string }
  | { type: 'AI_TOGGLE_CONTEXT'; payload: boolean }
  // Integrations
  | { type: 'INTEGRATIONS_SET_GITHUB'; payload: Partial<GitHubIntegration> }
  | { type: 'INTEGRATIONS_DISCONNECT_GITHUB' }
  | { type: 'SYNC_GITHUB_FROM_INTEGRATIONS' }
  // Social Platforms
  | { type: 'UPDATE_SOCIAL_PLATFORM'; payload: { id: SocialPlatformId; data: Partial<SocialPlatform> } }
  | { type: 'TOGGLE_SOCIAL_PLATFORM'; payload: SocialPlatformId }
  // Data Sources
  | { type: 'SOURCES_ADD'; payload: DataSource }
  | { type: 'SOURCES_UPDATE'; payload: { id: string; data: Partial<DataSource> } }
  | { type: 'SOURCES_REMOVE'; payload: string }
  | { type: 'SOURCES_CLEAR_ALL' }
  | { type: 'SOURCES_SET_SHOWCASE'; payload: { id: string; output: ShowcaseOutput } }
  // Capabilities
  | { type: 'CAPABILITIES_ADD_MCP'; payload: MCPServer }
  | { type: 'CAPABILITIES_TOGGLE_MCP'; payload: string }
  | { type: 'CAPABILITIES_REMOVE_MCP'; payload: string }
  | { type: 'CAPABILITIES_ADD_SKILL'; payload: CapabilitySkill }
  | { type: 'CAPABILITIES_TOGGLE_SKILL'; payload: string }
  | { type: 'CAPABILITIES_REMOVE_SKILL'; payload: string }
  | { type: 'CAPABILITIES_UPDATE_SKILL'; payload: { id: string; data: Partial<CapabilitySkill> } }
  | { type: 'CAPABILITIES_UPDATE_HERMES'; payload: Partial<HermesConfig> }
  | { type: 'HERMES_ADD_CRON_TASK'; payload: HermesCronTask }
  | { type: 'HERMES_UPDATE_CRON_TASK'; payload: { id: string; data: Partial<HermesCronTask> } }
  | { type: 'HERMES_REMOVE_CRON_TASK'; payload: string }
  | { type: 'CAPABILITIES_UPDATE_PLATFORM'; payload: Partial<PlatformConnection> & { id: PlatformId } }
  | { type: 'MARK_SAVED' }
  | { type: 'IMPORT_STATE'; payload: AdminState }
  | { type: 'RESET_STATE' }
  // Studio (Command Center config)
  | { type: 'UPDATE_STUDIO'; payload: Partial<StudioConfig> }
  | { type: 'STUDIO_SET_NAV_GROUP'; payload: { key: string; data: Partial<StudioNavGroupConfig> } }
  | { type: 'STUDIO_REORDER_GROUP'; payload: { key: string; direction: 'up' | 'down' } }
  | { type: 'STUDIO_SET_PANEL_OVERRIDE'; payload: { id: AdminPanel; data: Partial<StudioPanelConfig> } }
  | { type: 'STUDIO_TOGGLE_PIN'; payload: AdminPanel }
  | { type: 'STUDIO_SAVE_PRESET'; payload: StudioCustomPreset }
  | { type: 'STUDIO_DELETE_PRESET'; payload: string }
  | { type: 'STUDIO_SAVE_WORKSPACE_PROFILE'; payload: StudioWorkspaceProfile }
  | { type: 'STUDIO_DELETE_WORKSPACE_PROFILE'; payload: string }
  // CMS Phase 3 — Tag Registry
  | { type: 'SET_TAG_REGISTRY'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: { id: string; data: Partial<Tag> } }
  | { type: 'REMOVE_TAG'; payload: string }
  // CMS Phase 3 — Category Registry
  | { type: 'SET_CATEGORY_REGISTRY'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; data: Partial<Category> } }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  // CMS Phase 3 — Media Registry
  | { type: 'SET_MEDIA_REGISTRY'; payload: MediaItem[] }
  | { type: 'ADD_MEDIA_ITEM'; payload: MediaItem }
  | { type: 'UPDATE_MEDIA_ITEM'; payload: { id: string; data: Partial<MediaItem> } }
  | { type: 'REMOVE_MEDIA_ITEM'; payload: string }
  // CMS Phase 3 — Revision Log
  | { type: 'LOG_REVISION'; payload: ContentRevision }
  | { type: 'CLEAR_REVISIONS'; payload: { contentId: string; contentType: RevisionContentType } }
  | { type: 'RESTORE_REVISION'; payload: ContentRevision }
  // CMS Phase 3 — Publishing Workflow
  | { type: 'CONTENT_SET_STATUS'; payload: { contentType: RevisionContentType; contentId: string; status: CmsStatus } }
  // CMS Phase 3 — Series Registry
  | { type: 'SET_SERIES_REGISTRY'; payload: Series[] }
  | { type: 'ADD_SERIES'; payload: Series }
  | { type: 'UPDATE_SERIES'; payload: { id: string; data: Partial<Series> } }
  | { type: 'REMOVE_SERIES'; payload: string }
  // CMS Phase 3 — Deploy Hook
  | { type: 'SET_DEPLOY_HOOK_URL'; payload: string }
  | { type: 'DEPLOY_TRIGGERED'; payload: string }
  | { type: 'STUDIO_RESET' }
  // CMS Maturity — Audit Log
  | { type: 'LOG_AUDIT'; payload: Omit<AuditLogEntry, 'id' | 'timestamp'> }
  | { type: 'CLEAR_AUDIT_LOG' }
  // CMS Maturity — Locale Relations
  | { type: 'SET_LOCALE_RELATION'; payload: Omit<LocaleRelation, 'id' | 'createdAt'> }
  | { type: 'REMOVE_LOCALE_RELATION'; payload: string }
  // CMS Maturity — Content Relations
  | { type: 'ADD_CONTENT_RELATION'; payload: Omit<ContentRelation, 'id' | 'createdAt'> }
  | { type: 'REMOVE_CONTENT_RELATION'; payload: string }
  // CMS Maturity — Scheduler
  | { type: 'SCHEDULE_PUBLISH'; payload: Omit<PublishSchedule, 'id' | 'createdAt' | 'status'> }
  | { type: 'CANCEL_SCHEDULE'; payload: string }
  | { type: 'APPLY_SCHEDULED_PUBLISHES' }
  // VPS Sync (Phase 4)
  | { type: 'SET_VPS_STATUS'; payload: VpsSyncStatus }
  | { type: 'CLEAR_VPS_ERROR' }
  // CMS Job Queue
  | { type: 'JOB_ADD'; payload: Omit<CmsJob, 'id' | 'createdAt' | 'attempts'> }
  | { type: 'JOB_UPDATE'; payload: { id: string; data: Partial<CmsJob> } }
  | { type: 'JOB_CANCEL'; payload: string }
  | { type: 'JOB_CLEAR_DONE' }
