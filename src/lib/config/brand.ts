import type { BrandData, NavItem, ProfileData } from '@/lib/foundation/types'

// ─── Core Brand Identity ──────────────────────────────────────────────────────

export const brand: BrandData = {
  name: 'JootaCee',
  domain: 'jootacee.com',
  signature: 'JOOTACEE / OPS',
  role: 'AI Systems Architect & Automation Engineer',
  headline: 'Building AI systems, automation infrastructures and modular digital ecosystems.',
  subheadline:
    'Designing intelligent operational architectures for the next generation of digital systems.',
  ctaPrimary: 'Explore Systems',
  ctaSecondary: 'Open Labs',
}

export const heroSignals = [
  'Multi-agent orchestration',
  'Industrial automation intelligence',
  'Graph memory + runtime observability',
]

export const navItems: NavItem[] = [
  { name: 'Systems', href: '#systems' },
  { name: 'Labs', href: '#labs' },
  { name: 'Infrastructure', href: '#infrastructure' },
  { name: 'GitHub', href: '#github' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
]

// ─── Full Profile ─────────────────────────────────────────────────────────────

export const profile: ProfileData = {
  name: 'JootaCee',
  displayName: 'JootaCee',
  role: 'AI Systems Architect & Automation Engineer',
  tagline: 'Architecting autonomous systems at the intersection of AI, infrastructure, and intelligence.',
  bio:
    'I design and build AI-native operational systems — from multi-agent orchestration runtimes and graph memory architectures to automated trading engines and modular enterprise platforms. My work lives at the intersection of cutting-edge AI capability and production-grade engineering discipline.',
  bioExtended:
    'Over several years working at the frontier of AI infrastructure, I developed a conviction: the bottleneck in AI systems is never the model — it\'s the orchestration layer. This drives every architectural decision I make. AURA, my core runtime, is the direct product of that conviction: a protocol-first, memory-native orchestration engine that treats models as infrastructure rather than endpoints. When I\'m not building systems, I write in the Journal about the ideas that shape them: orchestration primitives, graph memory theory, autonomous infrastructure, and the evolving protocol landscape (MCP, A2A, and beyond).',
  location: 'Europe',
  timezone: 'CET (UTC+1)',
  availability: 'available',
  availabilityNote: 'Open to select consulting engagements and advisory relationships in AI systems architecture. Response time: 24–48h.',
  email: 'contact@jootacee.com',
  openSourceUrl: 'https://github.com/JootaCee',
  social: [
    {
      platform: 'github',
      label: 'JootaCee',
      href: 'https://github.com/JootaCee',
      icon: 'Github',
    },
    {
      platform: 'linkedin',
      label: 'JootaCee',
      href: 'https://linkedin.com/in/jootacee',
      icon: 'Linkedin',
    },
    {
      platform: 'twitter',
      label: '@jootacee',
      href: 'https://twitter.com/jootacee',
      icon: 'Twitter',
    },
  ],
  expertise: [
    {
      title: 'Multi-Agent Orchestration',
      description:
        'Designing orchestration fabrics that coordinate multiple AI models through protocol-native routing, capability discovery, and persistent memory — built on MCP and A2A primitives.',
      tags: ['MCP', 'A2A', 'LangGraph', 'AURA', 'Agent Mesh'],
    },
    {
      title: 'AI Infrastructure Engineering',
      description:
        'Building production-grade AI systems from the ground up — containerized runtimes, observability layers, memory stores, and deployment pipelines that survive real operational load.',
      tags: ['Kubernetes', 'Docker', 'Neo4j', 'Redis', 'Kafka'],
    },
    {
      title: 'Autonomous Automation Systems',
      description:
        'Engineering self-operating pipelines for trading, CRM intelligence, ERP automation, and data processing — systems designed to act with minimal human intervention.',
      tags: ['Trading AI', 'Signal Processing', 'LangChain', 'Event-driven', 'FastAPI'],
    },
    {
      title: 'Digital Ecosystem Architecture',
      description:
        'Architecting full-stack digital platforms from infrastructure to interface — combining modern web technology, AI integration, and modular CMS systems into coherent operational headquarters.',
      tags: ['Next.js', 'React', 'TypeScript', 'Static Export', 'PWA'],
    },
    {
      title: 'Graph Memory & Knowledge Systems',
      description:
        'Implementing persistent memory architectures for AI agents using graph databases — enabling cross-session context continuity, entity resolution, and semantic retrieval at scale.',
      tags: ['Neo4j', 'GraphRAG', 'Knowledge Graphs', 'Vector Search', 'LLM Retrieval'],
    },
  ],
  services: [
    {
      title: 'AI Systems Architecture',
      description:
        'End-to-end design of multi-agent systems, orchestration layers, and AI infrastructure for production environments. From protocol design to deployment topology.',
      deliverables: [
        'Architecture document with node-level diagram',
        'Protocol and tooling selection rationale',
        'Deployment topology and scaling strategy',
        'Observability and failure-mode analysis',
      ],
      engagement: 'project',
    },
    {
      title: 'Automation Engineering',
      description:
        'Design and implementation of autonomous pipelines for trading, CRM intelligence, data processing, and enterprise operations. Built to run without babysitting.',
      deliverables: [
        'Pipeline architecture and flow design',
        'Production-ready codebase (Python/TypeScript)',
        'Monitoring and alerting setup',
        'Documentation and handoff package',
      ],
      engagement: 'project',
    },
    {
      title: 'Technical Advisory',
      description:
        'Strategic advisory for engineering teams navigating AI infrastructure decisions — model selection, orchestration strategy, MCP adoption, and operational readiness.',
      deliverables: [
        'Monthly strategy sessions',
        'Architecture review and feedback',
        'Priority access for questions and reviews',
        'Written recommendations on key decisions',
      ],
      engagement: 'advisory',
    },
  ],
  philosophy: [
    'The orchestration layer outlasts the model. Build infrastructure that survives every model upgrade.',
    'Observability is not optional. Systems that cannot explain themselves cannot be trusted to act autonomously.',
    'Protocol design precedes implementation. A well-designed protocol compresses future complexity.',
    'Autonomy is earned through reliability. A system earns the right to act independently by first proving it acts correctly.',
  ],
}

// ─── SEO / Meta Defaults ──────────────────────────────────────────────────────

export const defaultMeta = {
  title: 'JootaCee — AI Systems Architect',
  description:
    'Building AI systems, multi-agent orchestration runtimes, and modular digital ecosystems. Explore AURA, the Labs, and the Systems layer at jootacee.com.',
  ogImage: '/og-image.png',
  twitterHandle: '@jootacee',
  canonicalBase: 'https://jootacee.com',
}
