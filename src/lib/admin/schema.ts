import { z } from 'zod'

// ─── CMS Phase 3 Schemas ──────────────────────────────────────────────────────

export const CmsStatusSchema = z.enum(['draft', 'review', 'published', 'archived'])

export const TagSchema = z.object({
  id:          z.string().min(1),
  slug:        z.string().regex(/^[a-z0-9-]+$/),
  label:       z.string().min(1),
  color:       z.string().optional(),
  description: z.string().optional(),
  createdAt:   z.string(),
})

export const CategorySchema = z.object({
  id:          z.string().min(1),
  slug:        z.string().regex(/^[a-z0-9-]+$/),
  label:       z.string().min(1),
  description: z.string().optional(),
  parentId:    z.string().optional(),
  createdAt:   z.string(),
})

export const MediaItemSchema = z.object({
  id:       z.string().min(1),
  url:      z.string().url(),
  alt:      z.string().min(1),
  caption:  z.string().optional(),
  width:    z.number().int().positive().optional(),
  height:   z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  source:   z.enum(['external', 'github']),
  addedAt:  z.string(),
})

export const ContentRevisionSchema = z.object({
  id:          z.string().min(1),
  contentId:   z.string().min(1),
  contentType: z.enum(['project', 'research', 'lab', 'system']),
  savedAt:     z.string(),
  note:        z.string().optional(),
  snapshot:    z.record(z.string(), z.unknown()),
})

export const SeriesSchema = z.object({
  id:          z.string().min(1),
  slug:        z.string().regex(/^[a-z0-9-]+$/),
  title:       z.string().min(1),
  description: z.string().optional(),
  order:       z.array(z.string()),
  contentType: z.enum(['project', 'research', 'lab', 'system']),
  createdAt:   z.string(),
})

// ─── Site Core ────────────────────────────────────────────────────────────────

export const SiteConfigSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  description: z.string(),
  businessFocus: z.string(),
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

export const RuntimeMetaSchema = z.object({
  version: z.string(),
  environment: z.enum(['production', 'staging', 'development']),
  deployedAt: z.string().datetime(),
  activeAgents: z.number().int().min(0),
  mcpTools: z.number().int().min(0),
  systemsOnline: z.number().int().min(0),
})

// ─── Systems Manager ─────────────────────────────────────────────────────────

export const SystemEntrySchema = z.object({
  key: z.string(),
  name: z.string(),
  badge: z.string(),
  description: z.string(),
  status: z.enum(['operational', 'degraded', 'maintenance', 'offline']),
  version: z.string(),
  uptime: z.string(),
  tools: z.number().int().min(0),
  visible: z.boolean(),
})

// ─── Labs Manager ─────────────────────────────────────────────────────────────

export const LabMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
})

export const LabEntrySchema = z.object({
  key: z.string(),
  name: z.string(),
  tagline: z.string(),
  status: z.enum(['live', 'beta', 'rd', 'roadmap']),
  description: z.string(),
  stack: z.array(z.string()),
  metrics: z.array(LabMetricSchema),
  accent: z.string(),
  visible: z.boolean(),
})

// ─── Research Manager ────────────────────────────────────────────────────────

export const ResearchEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.enum(['opinion', 'research', 'essays', 'news']),
  excerpt: z.string(),
  tags: z.array(z.string()),
  readTime: z.number().int().min(1),
  published: z.boolean(),
  featured: z.boolean(),
})

// ─── Projects Manager ────────────────────────────────────────────────────────

export const ProjectScreenshotSchema = z.object({
  url: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
})

export const ProjectEntrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  category: z.enum(['ai', 'web', 'automation', 'infrastructure', 'tool', 'research', 'other']),
  status: z.enum(['live', 'beta', 'wip', 'archived']),
  featured: z.boolean(),
  published: z.boolean(),
  description: z.string(),
  body: z.string().optional(),
  techStack: z.array(z.string()),
  tags: z.array(z.string()),
  repoUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  screenshots: z.array(ProjectScreenshotSchema),
  architectureDiagram: z.string().optional(),
  roadmap: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  relatedResearch: z.array(z.string()).optional(),
  relatedResources: z.array(z.string()).optional(),
  accent: z.string(),
})

// ─── Infrastructure Manager ───────────────────────────────────────────────────

export const InfraNodeSchema = z.object({
  name: z.string(),
  role: z.string(),
  image: z.string(),
  status: z.enum(['running', 'stopped', 'degraded']),
  cpu: z.string(),
  mem: z.string(),
  uptime: z.string(),
  visible: z.boolean(),
})

export const DeployEntrySchema = z.object({
  service: z.string(),
  version: z.string(),
  env: z.string(),
  status: z.enum(['success', 'pending', 'failed']),
  timestamp: z.string(),
})

export const InfraConfigSchema = z.object({
  region: z.string(),
  orchestrator: z.string(),
  version: z.string(),
  nodes: z.array(InfraNodeSchema),
  deployments: z.array(DeployEntrySchema),
})

// ─── GitHub Layer ─────────────────────────────────────────────────────────────

export const GithubRepoMetaSchema = z.object({
  description: z.string().optional(),
  language: z.string().optional(),
  stars: z.number().optional(),
  forks: z.number().optional(),
  topics: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
})

export const GithubConfigSchema = z.object({
  username: z.string(),
  accessToken: z.string().optional(),
  displayRepos: z.array(z.string()),
  repoMeta: z.record(z.string(), GithubRepoMetaSchema).optional(),
  showProfileCard: z.boolean().optional(),
  showContributions: z.boolean(),
  showStats: z.boolean(),
  showActivity: z.boolean(),
  showLanguages: z.boolean().optional(),
  showTopics: z.boolean().optional(),
  showForks: z.boolean().optional(),
  showStarred: z.boolean().optional(),
  showOwnRepos: z.boolean().optional(),
  showCommitActivity: z.boolean().optional(),
  showRecentReleases: z.boolean().optional(),
  showDeployments: z.boolean().optional(),
  pageBadge: z.string().optional(),
  pageHeadline: z.string().optional(),
  pageSubheadline: z.string().optional(),
  ownReposTitle: z.string().optional(),
  ownReposSubtitle: z.string().optional(),
  ownReposLimit: z.number().optional(),
  starredTitle: z.string().optional(),
  starredSubtitle: z.string().optional(),
  showStarredCategories: z.boolean().optional(),
  statSlot4: z.enum(['forks', 'starred']).optional(),
  activityLimit: z.number().optional(),
  displayMode: z.enum(['grid', 'list', 'compact']).optional(),
})

export const CuratedLinkSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(['tools', 'articles', 'repos', 'videos', 'docs', 'agents', 'automations', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  domain: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  addedAt: z.string().optional(),
})

export const DriveResourceSchema = z.object({
  id: z.string(),
  driveUrl: z.string(),
  title: z.string(),
  description: z.string().optional(),
  resourceType: z.enum(['agent-md', 'skill-md', 'automation', 'mcp-config', 'prompt', 'template', 'dataset', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  addedAt: z.string().optional(),
})

export const TrackedSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  sourceType: z.enum(['newsletter', 'blog', 'youtube', 'podcast', 'github', 'twitter', 'other'] as const).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  addedAt: z.string().optional(),
})

// ─── Visual Engine ────────────────────────────────────────────────────────────

export const DesignTokensSchema = z.object({
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  spacingScale: z.enum(['compact', 'normal', 'relaxed', 'spacious']),
  shadowIntensity: z.enum(['none', 'subtle', 'normal', 'dramatic']),
  glowIntensity: z.enum(['off', 'subtle', 'normal', 'vivid']).optional(),
  gradientStyle: z.enum(['none', 'subtle', 'vibrant', 'mesh']),
  buttonStyle: z.enum(['sharp', 'rounded', 'pill']),
  typography: z.enum(['system', 'modern', 'classic', 'mono']),
  fontSizeScale: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  animationSpeed: z.enum(['instant', 'fast', 'normal', 'slow']).optional(),
  containerWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).optional(),
  cardStyle: z.enum(['flat', 'elevated', 'outlined', 'ghost']).optional(),
  inputStyle: z.enum(['flat', 'outlined', 'filled', 'underlined']).optional(),
  sectionPadding: z.enum(['compact', 'normal', 'spacious']).optional(),
  glassBlur: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  glassOpacity: z.enum(['ghost', 'light', 'normal', 'heavy', 'solid']).optional(),
  glassBorderOpacity: z.enum(['none', 'subtle', 'normal', 'strong']).optional(),
})

export const DomainAccentsSchema = z.object({
  projects: z.string(),
  research: z.string(),
  resources: z.string(),
  intelligence: z.string(),
  github: z.string(),
  about: z.string(),
})

export const DesignConfigSchema = z.object({
  darkModeDefault: z.enum(['dark', 'light', 'system']),
  palette: z.enum(['ocean', 'emerald', 'amber', 'rose', 'violet', 'slate', 'custom']),
  customPrimary: z.string(),
  customSecondary: z.string(),
  customAccent: z.string(),
  customBackground: z.string().optional(),
  customSurface: z.string().optional(),
  customText: z.string().optional(),
  customBorder: z.string().optional(),
  customGlow: z.string().optional(),
  customGlowSecondary: z.string().optional(),
  customRing: z.string().optional(),
  customMuted: z.string().optional(),
  customMutedFg: z.string().optional(),
  gradientStart: z.string().optional(),
  gradientMid: z.string().optional(),
  gradientEnd: z.string().optional(),
  btnGradientFrom: z.string().optional(),
  btnGradientTo: z.string().optional(),
  btnText: z.string().optional(),
  domainAccents: DomainAccentsSchema.optional(),
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

export const NavEntrySchema = z.object({
  key: z.string(),
  label: z.string(),
  href: z.string(),
  visible: z.boolean(),
  order: z.number().int().min(0),
})

// ─── AI / Integrations / Capabilities (loose schemas — content is user-generated) ─

const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  model: z.string().optional(),
})

const ChatConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  profileId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const LLMProfileSchema = z.object({
  id: z.string(),
  provider: z.enum(['gemini', 'claude', 'openai', 'ollama', 'hermes']),
  label: z.string(),
  model: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().optional(),
})

export const AIConfigSchema = z.object({
  conversations: z.array(ChatConversationSchema),
  activeConversationId: z.string().nullable(),
  profiles: z.array(LLMProfileSchema),
  activeProfileId: z.string().nullable(),
  siteContextEnabled: z.boolean(),
})

const GitHubRepoSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  description: z.string(),
  stars: z.number(),
  forks: z.number().optional(),
  language: z.string(),
  url: z.string(),
  isPrivate: z.boolean(),
  updatedAt: z.string(),
  topics: z.array(z.string()).optional(),
})

const SocialStatSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
})

const SocialPlatformSchema = z.object({
  id: z.enum(['linkedin', 'twitter', 'youtube', 'instagram', 'devto', 'hashnode', 'medium', 'substack', 'producthunt', 'behance', 'telegram', 'discord', 'spotify', 'notion']),
  connected: z.boolean(),
  handle: z.string(),
  profileUrl: z.string(),
  apiKey: z.string(),
  displayName: z.string(),
  bio: z.string(),
  avatarUrl: z.string(),
  stats: z.array(SocialStatSchema),
  visible: z.boolean(),
  lastSync: z.string().nullable(),
})

const ShowcaseOutputSchema = z.object({
  readme: z.string(),
  showcase: z.string(),
  architecture: z.string(),
  features: z.string(),
  stack: z.string(),
  generatedAt: z.string(),
  modelUsed: z.string(),
})

const DataSourceSchema = z.object({
  id: z.string(),
  type: z.enum(['github-repo', 'file', 'url', 'database', 'archive', 'folder']),
  name: z.string(),
  description: z.string(),
  url: z.string().optional(),
  content: z.string(),
  fileTree: z.array(z.string()),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  status: z.enum(['pending', 'indexing', 'ready', 'error']),
  addedAt: z.string(),
  byteSize: z.number(),
  error: z.string().optional(),
  showcaseOutput: ShowcaseOutputSchema.optional(),
})

export const IntegrationsConfigSchema = z.object({
  github: z.object({
    connected: z.boolean(),
    accessToken: z.string(),
    username: z.string(),
    avatarUrl: z.string(),
    repos: z.array(GitHubRepoSchema),
    selectedRepos: z.array(z.string()),
    lastSync: z.string().nullable(),
  }),
  dataSources: z.array(DataSourceSchema).optional(),
  socialPlatforms: z.array(SocialPlatformSchema).optional(),
  deployHookUrl: z.string().optional(),
  lastDeployTriggeredAt: z.string().optional(),
})

const HermesCronTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  cron: z.string(),
  prompt: z.string(),
  deliveryPlatform: z.string(),
  enabled: z.boolean(),
  lastRun: z.string().nullable(),
})

const HermesConfigSchema = z.object({
  enabled: z.boolean(),
  backend: z.enum(['local', 'docker', 'ssh', 'singularity', 'modal', 'daytona', 'vercel']),
  endpoint: z.string(),
  status: z.enum(['connected', 'disconnected', 'connecting', 'error']),
  provider: z.string(),
  model: z.string(),
  portalEnabled: z.boolean(),
  portalToken: z.string(),
  learningLoop: z.boolean(),
  persistentMemory: z.boolean(),
  scheduler: z.boolean(),
  subagents: z.boolean(),
  mcpEnabled: z.boolean(),
  lastConnected: z.string().nullable(),
  apiKey: z.string(),
  sshHost: z.string().optional().default(''),
  sshUser: z.string().optional().default('ubuntu'),
  sshPort: z.string().optional().default('22'),
  dockerImage: z.string().optional().default('nousresearch/hermes-agent:latest'),
  singularityImage: z.string().optional().default(''),
  modalAppName: z.string().optional().default('hermes-agent'),
  daytonaWorkspace: z.string().optional().default('hermes-workspace'),
  vercelFunctionUrl: z.string().optional().default(''),
  voiceTranscription: z.boolean().optional().default(false),
  sessionSearch: z.boolean().optional().default(true),
  userModeling: z.boolean().optional().default(true),
  researchMode: z.boolean().optional().default(false),
  commandApproval: z.boolean().optional().default(true),
  containerIsolation: z.boolean().optional().default(false),
  allowedUsers: z.string().optional().default(''),
  personality: z.string().optional().default('default'),
  contextFiles: z.string().optional().default('AGENTS.md,SOUL.md,MEMORY.md'),
  scheduledTasks: z.array(HermesCronTaskSchema).optional().default([]),
  version: z.string().optional().default(''),
  toolGateway: z.boolean().optional().default(false),
})

const PlatformConnectionSchema = z.object({
  id: z.enum(['telegram', 'discord', 'slack', 'whatsapp', 'signal', 'email']),
  enabled: z.boolean(),
  token: z.string(),
  botName: z.string(),
  webhookUrl: z.string().optional(),
  status: z.enum(['active', 'inactive', 'error']),
})

export const CapabilitiesConfigSchema = z.object({
  mcpServers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    transport: z.enum(['http', 'sse', 'stdio']),
    description: z.string(),
    enabled: z.boolean(),
  })),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    source: z.string(),
    type: z.enum(['skill', 'agent', 'tool']),
    enabled: z.boolean(),
    systemPrompt: z.string().optional(),
  })),
  hermes: HermesConfigSchema.optional(),
  platforms: z.array(PlatformConnectionSchema).optional(),
})

// ─── Blocks Panel ─────────────────────────────────────────────────────────────

export const BlockSectionSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  label: z.string(),
  description: z.string(),
  icon: z.string(),
  enabled: z.boolean(),
  order: z.number().int().min(0),
  effects3D: z.boolean(),
  effects3DIntensity: z.number().min(0).max(1),
})

// ─── Content Panel ────────────────────────────────────────────────────────────

export const HeroContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  primaryBtnText: z.string(),
  primaryBtnHref: z.string(),
  secondaryBtnText: z.string(),
  secondaryBtnHref: z.string(),
  showBadge: z.boolean(),
})

export const StatItemSchema = z.object({ value: z.string(), label: z.string(), icon: z.string() })
export const ServiceItemSchema = z.object({ icon: z.string(), title: z.string(), description: z.string() })
export const PricingPlanSchema = z.object({
  name: z.string(), price: z.string(), period: z.string(), description: z.string(),
  features: z.array(z.string()), highlighted: z.boolean(), ctaText: z.string(), ctaHref: z.string(),
})
export const TestimonialItemSchema = z.object({
  id: z.string(), name: z.string(), role: z.string(), company: z.string(),
  content: z.string(), rating: z.number().int().min(1).max(5),
})

const LogoItemSchema = z.object({ id: z.string(), name: z.string(), imageUrl: z.string(), url: z.string() })
const GalleryItemSchema = z.object({ id: z.string(), src: z.string(), alt: z.string(), caption: z.string() })
const TeamMemberSchema = z.object({ id: z.string(), name: z.string(), role: z.string(), bio: z.string(), photoUrl: z.string(), linkedin: z.string(), github: z.string() })
const FaqItemSchema = z.object({ id: z.string(), question: z.string(), answer: z.string() })
const PortfolioItemSchema = z.object({ id: z.string(), title: z.string(), description: z.string(), imageUrl: z.string(), tags: z.array(z.string()), url: z.string(), year: z.string() })
const CtaContentSchema = z.object({ headline: z.string(), subheadline: z.string(), primaryBtnText: z.string(), primaryBtnHref: z.string(), secondaryBtnText: z.string(), secondaryBtnHref: z.string(), showBackground: z.boolean() })
const ContactContentSchema = z.object({ email: z.string(), phone: z.string(), address: z.string(), mapEmbedUrl: z.string(), showForm: z.boolean(), showMap: z.boolean(), whatsapp: z.string() })
const MapContentSchema = z.object({ embedUrl: z.string(), markerLabel: z.string(), zoom: z.number() })
const NewsletterContentSchema = z.object({ title: z.string(), description: z.string(), placeholder: z.string(), successMessage: z.string(), showNameField: z.boolean() })
const SocialProofItemSchema = z.object({ id: z.string(), name: z.string(), imageUrl: z.string(), url: z.string(), category: z.enum(['award', 'certification', 'partner', 'press']) })
const BlogContentSchema = z.object({ postsCount: z.number().int().min(1).max(20), showAuthor: z.boolean(), showDate: z.boolean(), showExcerpt: z.boolean(), category: z.string() })

export const SiteContentSchema = z.object({
  hero: HeroContentSchema,
  logos: z.array(LogoItemSchema).optional(),
  stats: z.array(StatItemSchema),
  services: z.array(ServiceItemSchema),
  gallery: z.array(GalleryItemSchema).optional(),
  team: z.array(TeamMemberSchema).optional(),
  pricing: z.array(PricingPlanSchema),
  testimonials: z.array(TestimonialItemSchema),
  faq: z.array(FaqItemSchema).optional(),
  blog: BlogContentSchema.optional(),
  portfolio: z.array(PortfolioItemSchema).optional(),
  cta: CtaContentSchema.optional(),
  contact: ContactContentSchema.optional(),
  map: MapContentSchema.optional(),
  newsletter: NewsletterContentSchema.optional(),
  socialProof: z.array(SocialProofItemSchema).optional(),
})

// ─── Navbar + Footer Config ───────────────────────────────────────────────────

export const NavbarSettingsSchema = z.object({
  visible: z.boolean(),
  showIconWithName: z.boolean(),
  logoIcon: z.enum(['sparkles', 'zap', 'cpu', 'globe', 'none']),
  variant: z.enum(['default', 'centered', 'minimal', 'side']),
  shape: z.enum(['square', 'rounded', 'pill']),
  height: z.enum(['compact', 'medium', 'tall']),
  shadow: z.enum(['none', 'subtle', 'normal', 'dramatic']),
  background: z.enum(['solid', 'blur', 'transparent', 'glass']),
  showBorderBottom: z.boolean(),
  backdropBlur: z.boolean(),
  sticky: z.boolean(),
  transparentOnTop: z.boolean(),
  animateOnScroll: z.boolean(),
})

export const FooterSettingsSchema = z.object({
  visible: z.boolean(),
  variant: z.enum(['minimal', 'columns', 'centered']),
  background: z.enum(['dark', 'light', 'transparent', 'card']),
  showLogo: z.boolean(),
  showScrollTop: z.boolean(),
  brandDescription: z.string(),
  columns: z.array(z.object({
    id: z.string(),
    heading: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.string() })),
  })),
  socials: z.array(z.object({ platform: z.string(), url: z.string(), visible: z.boolean() })),
  showNewsletter: z.boolean(),
  newsletterTitle: z.string(),
  newsletterPlaceholder: z.string(),
  legalLinks: z.array(z.object({ label: z.string(), href: z.string() })),
  copyrightText: z.string(),
})

// ─── Visual Effects ───────────────────────────────────────────────────────────

const VisualEffectToggleSchema = z.object({
  enabled: z.boolean(),
  intensity: z.number().min(0).max(1),
})

const ShaderPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.array(z.string()),
  speed: z.number(),
  angle: z.number(),
})

const BgGridConfigSchema = z.object({
  enabled: z.boolean(),
  color: z.string(),
  opacity: z.number().min(0).max(1),
  size: z.number().min(20).max(200),
  mask: z.boolean(),
})

export const VisualEffectsConfigSchema = z.object({
  meteors:      VisualEffectToggleSchema.extend({ count: z.number() }),
  borderBeam:   VisualEffectToggleSchema.extend({ speed: z.number() }),
  spotlight:    VisualEffectToggleSchema.extend({ radius: z.number() }),
  aurora:       VisualEffectToggleSchema,
  smoothScroll: VisualEffectToggleSchema.extend({ duration: z.number() }),
  noiseOverlay: VisualEffectToggleSchema,
  scanlines:    VisualEffectToggleSchema,
  parallax:     VisualEffectToggleSchema,
  glitchText:   VisualEffectToggleSchema,
  customCursor: VisualEffectToggleSchema,
  activeShaderPreset: z.string(),
  shaderPresets: z.array(ShaderPresetSchema),
  bgGrid: BgGridConfigSchema.optional(),
  bgGradientOpacity: z.number().min(0).max(1).optional(),
})

// ─── Hero Scene Config ────────────────────────────────────────────────────────

const HeroSceneConfigSchema = z.object({
  enabled: z.boolean(),
  tierOverride: z.enum(['auto', 'low', 'balanced', 'high']),
  particleCount: z.number().min(100).max(2500),
  lineCount: z.number().min(5).max(80),
  sphereRadius: z.number().min(0.8).max(3.0),
  backgroundOpacity: z.number().min(0).max(0.6),
  parallaxStrength: z.number().min(0).max(0.5),
  rotationSpeed: z.number().min(0).max(0.2),
  colorA: z.string(),
  colorB: z.string(),
  postFxBloom: z.boolean(),
  postFxVignette: z.boolean(),
  animated: z.boolean(),
})

const PageEffectSlotSchema = z.object({
  scene3d: z.boolean(),
  particles: z.boolean(),
  parallax: z.boolean(),
  grain: z.boolean(),
})

// ─── Intelligence Feeds ───────────────────────────────────────────────────────

const IntelligenceFeedSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['news', 'tech', 'finance', 'research', 'social', 'opendata', 'ai', 'osint', 'conflict', 'security', 'aviation', 'cyber', 'disaster', 'energy', 'markets', 'climate', 'humanitarian', 'tool', 'resource', 'reference', 'community', 'newsletter', 'video', 'podcast', 'database']),
  type: z.enum(['rss', 'api', 'websocket', 'relay']),
  plan: z.enum(['free', 'freemium', 'paid']),
  description: z.string(),
  url: z.string(),
  docsUrl: z.string(),
  apiKey: z.string(),
  enabled: z.boolean(),
  connected: z.boolean(),
  lastSync: z.string().nullable(),
  itemCount: z.number().int().min(0),
  icon: z.string(),
  color: z.string(),
  tags: z.array(z.string()).optional(),
  website: z.string().optional(),
  language: z.string().optional(),
  notes: z.string().optional(),
  publishable: z.boolean().optional(),
  publishedPages: z.array(z.string()).optional(),
})

export const IntelligenceConfigSchema = z.object({
  feeds: z.array(IntelligenceFeedSchema),
  refreshInterval: z.number().int().min(1),
  maxItemsPerFeed: z.number().int().min(1),
  autoRefresh: z.boolean(),
})

// ─── About Config ─────────────────────────────────────────────────────────────

export const TimelineEntrySchema = z.object({
  id: z.string(),
  year: z.string(),
  title: z.string(),
  org: z.string(),
  description: z.string(),
  type: z.enum(['work', 'project', 'certification', 'education', 'milestone']),
})

export const AboutConfigSchema = z.object({
  headline: z.string(),
  bio: z.string(),
  location: z.string(),
  availability: z.enum(['available', 'limited', 'unavailable']),
  skills: z.array(z.string()),
  tools: z.array(z.string()),
  certifications: z.array(z.string()),
  collaborationTypes: z.array(z.string()),
  timeline: z.array(TimelineEntrySchema),
})

// ─── Resource Registries ─────────────────────────────────────────────────────

const ResourceToolItemSchema   = z.object({ id: z.string(), name: z.string(), subCat: z.string(), url: z.string(), pricing: z.string() })
const ResourceRepoItemSchema   = z.object({ id: z.string(), org: z.string(), name: z.string(), lang: z.string(), stars: z.string(), url: z.string(), cat: z.string() })
const ResourceWorkItemSchema   = z.object({ id: z.string(), title: z.string(), type: z.enum(['cicd', 'n8n', 'ai']), complexity: z.enum(['Low', 'Medium', 'High']) })
const ResourcePromptItemSchema = z.object({ id: z.string(), title: z.string(), cat: z.string(), models: z.array(z.string()) })
const ResourceMcpItemSchema    = z.object({ id: z.string(), name: z.string(), cat: z.string(), install: z.string(), toolCount: z.number() })
const ResourceAgentItemSchema  = z.object({ id: z.string(), title: z.string(), stack: z.array(z.string()) })
const ResourceSkillItemSchema  = z.object({ id: z.string(), command: z.string(), title: z.string(), builtin: z.boolean() })

// ─── Root State ───────────────────────────────────────────────────────────────

export const AdminStateSchema = z.object({
  panel: z.enum(['command', 'projects', 'research', 'about', 'github', 'site-core', 'seo', 'design', 'personality', 'navbar-config', 'content', 'blocks', 'footer-config', 'systems', 'labs', 'infrastructure', 'ai', 'integrations', 'showcase', 'analytics', 'design-lab', 'intelligence', 'intake', 'posts', 'media', 'content-editor', 'pages', 'design-studio', 'capabilities', 'studio', 'search', 'taxonomy']).catch('command'),
  site: SiteConfigSchema,
  seo: SeoConfigSchema,
  runtime: RuntimeMetaSchema,
  projectsRegistry: z.array(ProjectEntrySchema).optional(),
  systemsRegistry: z.array(SystemEntrySchema),
  labsRegistry: z.array(LabEntrySchema),
  researchRegistry: z.array(ResearchEntrySchema),
  toolRegistry:     z.array(ResourceToolItemSchema).optional(),
  repoRegistry:     z.array(ResourceRepoItemSchema).optional(),
  workflowRegistry: z.array(ResourceWorkItemSchema).optional(),
  promptRegistry:   z.array(ResourcePromptItemSchema).optional(),
  mcpRegistry:      z.array(ResourceMcpItemSchema).optional(),
  agentRegistry:    z.array(ResourceAgentItemSchema).optional(),
  skillRegistry:    z.array(ResourceSkillItemSchema).optional(),
  infraConfig: InfraConfigSchema,
  githubConfig: GithubConfigSchema,
  blocks: z.array(BlockSectionSchema).optional(),
  pageBlocksMap: z.record(z.string(), z.array(BlockSectionSchema)).optional(),
  content: SiteContentSchema.optional(),
  navbarSettings: NavbarSettingsSchema.optional(),
  footerSettings: FooterSettingsSchema.optional(),
  navigation: z.array(NavEntrySchema),
  design: DesignConfigSchema,
  personality: PersonalityConfigSchema,
  curatedLinks: z.array(CuratedLinkSchema).optional(),
  driveResources: z.array(DriveResourceSchema).optional(),
  trackedSources: z.array(TrackedSourceSchema).optional(),
  aboutConfig: AboutConfigSchema.optional(),
  aiConfig: AIConfigSchema.optional(),
  integrations: IntegrationsConfigSchema.optional(),
  capabilities: CapabilitiesConfigSchema.optional(),
  visualEffects: VisualEffectsConfigSchema.optional(),
  heroSceneConfig: HeroSceneConfigSchema.optional(),
  pageEffectsMap: z.record(z.string(), PageEffectSlotSchema).optional(),
  intelligence: IntelligenceConfigSchema.optional(),
  intakeType: z.enum(['project', 'research', 'resource', 'drive', 'source', 'lab', 'github-showcase', 'intel-source']).nullable().optional(),
  pagesActiveTab: z.string().optional(),
  tagRegistry:      z.array(TagSchema).optional(),
  categoryRegistry: z.array(CategorySchema).optional(),
  mediaRegistry:    z.array(MediaItemSchema).optional(),
  seriesRegistry:   z.array(SeriesSchema).optional(),
  revisionLog:      z.array(ContentRevisionSchema).optional(),
  studioConfig: z.object({
    sidebarWidth:       z.enum(['compact', 'normal', 'wide']).optional(),
    density:            z.enum(['compact', 'normal', 'comfortable']).optional(),
    headerHeight:       z.enum(['sm', 'md', 'lg']).optional(),
    contentMaxWidth:    z.enum(['lg', 'xl', '2xl', 'full']).optional(),
    panelPadding:       z.enum(['tight', 'normal', 'loose']).optional(),
    backgroundStyle:    z.enum(['midnight', 'dark', 'slate', 'void']).optional(),
    sidebarStyle:       z.enum(['solid', 'glass', 'border']).optional(),
    accentColor:        z.string().optional(),
    useCustomAccent:    z.boolean().optional(),
    fontFamily:         z.enum(['mono', 'sans', 'system']).optional(),
    fontSize:           z.enum(['xs', 'sm', 'md']).optional(),
    borderRadius:       z.enum(['sharp', 'normal', 'rounded']).optional(),
    glowEffect:              z.boolean().optional(),
    glowOpacity:             z.number().min(10).max(100).optional(),
    sidebarBorder:           z.boolean().optional(),
    activePreset:            z.string().optional(),
    animations:              z.boolean().optional(),
    showDescriptions:        z.boolean().optional(),
    rememberLastPanel:       z.boolean().optional(),
    keyboardShortcuts:       z.boolean().optional(),
    showSavedIndicator:      z.boolean().optional(),
    confirmReset:            z.boolean().optional(),
    autoSaveMs:              z.number().optional(),
    showTooltips:            z.boolean().optional(),
    sidebarCollapsedDefault: z.boolean().optional(),
    sidebarHoverExpand:      z.boolean().optional(),
    headerShowClock:         z.boolean().optional(),
    compactHeader:           z.boolean().optional(),
    panelTransition:         z.enum(['fade', 'slide', 'scale', 'none']).optional(),
    scrollbarStyle:          z.enum(['normal', 'thin', 'hidden']).optional(),
    animationSpeed:          z.enum(['slow', 'normal', 'fast']).optional(),
    showPanelBadges:         z.boolean().optional(),
    sidebarFooter:           z.boolean().optional(),
    showGroupDividers:       z.boolean().optional(),
    workspaceProfiles:       z.array(z.object({
      id: z.string(), name: z.string(), icon: z.string(),
      description: z.string().optional(), createdAt: z.string(),
      snapshot: z.record(z.string(), z.unknown()),
    })).optional(),
    reducedMotion:           z.boolean().optional(),
    highContrast:            z.boolean().optional(),
    defaultPanel:       z.string().optional(),
    pinnedPanels:       z.array(z.string()).optional(),
    customPresets:      z.array(z.object({
      id: z.string(), name: z.string(), createdAt: z.string(),
      config: z.object({
        backgroundStyle: z.enum(['midnight', 'dark', 'slate', 'void']).optional(),
        sidebarStyle:    z.enum(['solid', 'glass', 'border']).optional(),
        accentColor:     z.string().optional(),
        useCustomAccent: z.boolean().optional(),
        borderRadius:    z.enum(['sharp', 'normal', 'rounded']).optional(),
        glowEffect:      z.boolean().optional(),
        sidebarBorder:   z.boolean().optional(),
      }),
    })).optional(),
    navGroups:     z.array(z.object({ key: z.string(), label: z.string().optional(), visible: z.boolean(), collapsed: z.boolean(), order: z.number() })).optional(),
    panelOverrides: z.array(z.object({ id: z.string(), visible: z.boolean(), order: z.number(), customLabel: z.string().optional(), customDesc: z.string().optional() })).optional(),
    headerActions: z.object({ showExport: z.boolean(), showImport: z.boolean(), showBackup: z.boolean(), showReset: z.boolean(), showSearch: z.boolean() }).optional(),
  }).optional(),
  unsaved: z.boolean(),
  lastSaved: z.string().datetime().nullable(),
})

export type ValidatedAdminState = z.infer<typeof AdminStateSchema>
