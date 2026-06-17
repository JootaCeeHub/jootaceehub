import type {
  BlockSection,
  SiteContent,
  NavbarSettings,
  FooterSettings,
  LogoItem,
  GalleryItem,
  TeamMember,
  FaqItem,
  PortfolioItem,
  CtaContent,
  ContactContent,
  MapContent,
  NewsletterContent,
  SocialProofItem,
  BlogContent,
} from '../types'

// ─── Blocks ───────────────────────────────────────────────────────────────────

export const defaultBlocks: BlockSection[] = [
  { id: 'hero',         type: 'hero',         label: 'Hero',             description: 'Sección principal con título y llamada a la acción',            icon: '🎯', enabled: true,  order: 0,  effects3D: true,  effects3DIntensity: 0.7 },
  { id: 'logos',        type: 'logos',        label: 'Logos / Partners', description: 'Logotipos de clientes o partners',                              icon: '📋', enabled: true,  order: 1,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'stats',        type: 'stats',        label: 'Estadísticas',     description: 'Métricas y números clave del negocio',                          icon: '📊', enabled: true,  order: 2,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'services',     type: 'services',     label: 'Servicios',        description: 'Muestra tus servicios o características principales',            icon: '🔧', enabled: true,  order: 3,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'gallery',      type: 'gallery',      label: 'Galería',          description: 'Galería de imágenes con lightbox',                              icon: '🖼️', enabled: true,  order: 4,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'team',         type: 'team',         label: 'Equipo',           description: 'Presenta a los miembros de tu equipo',                          icon: '👥', enabled: true,  order: 5,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'pricing',      type: 'pricing',      label: 'Precios',          description: 'Planes y precios de tus servicios',                             icon: '💰', enabled: true,  order: 6,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'testimonials', type: 'testimonials', label: 'Testimonios',      description: 'Opiniones y valoraciones de clientes',                          icon: '💬', enabled: true,  order: 7,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'faq',          type: 'faq',          label: 'FAQ',              description: 'Preguntas frecuentes',                                          icon: '❓', enabled: false, order: 8,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'blog',         type: 'blog',         label: 'Blog / Artículos', description: 'Últimas publicaciones del blog',                               icon: '📝', enabled: false, order: 9,  effects3D: false, effects3DIntensity: 0.3 },
  { id: 'portfolio',    type: 'portfolio',    label: 'Portfolio',        description: 'Trabajos y proyectos destacados',                               icon: '🗂️', enabled: false, order: 10, effects3D: false, effects3DIntensity: 0.3 },
  { id: 'cta',          type: 'cta',          label: 'CTA Final',        description: 'Llamada a la acción final de página',                           icon: '🚀', enabled: true,  order: 11, effects3D: false, effects3DIntensity: 0.3 },
  { id: 'contact',      type: 'contact',      label: 'Contacto',         description: 'Formulario o información de contacto',                         icon: '📬', enabled: true,  order: 12, effects3D: false, effects3DIntensity: 0.3 },
  { id: 'map',          type: 'map',          label: 'Mapa',             description: 'Mapa de ubicación del negocio',                                 icon: '📍', enabled: false, order: 13, effects3D: false, effects3DIntensity: 0.3 },
  { id: 'newsletter',   type: 'newsletter',   label: 'Newsletter',       description: 'Captación de suscriptores por email',                           icon: '📧', enabled: false, order: 14, effects3D: false, effects3DIntensity: 0.3 },
  { id: 'social-proof', type: 'social-proof', label: 'Social Proof',     description: 'Premios, certificaciones y logros',                             icon: '🏆', enabled: false, order: 15, effects3D: false, effects3DIntensity: 0.3 },
]

// ─── Page Blocks Map ──────────────────────────────────────────────────────────

function pb(id: string, label: string, icon: string, desc: string, enabled: boolean, order: number): BlockSection {
  return { id, type: id, label, description: desc, icon, enabled, order, effects3D: false, effects3DIntensity: 0.3 }
}

export const defaultPageBlocksMap: Record<string, BlockSection[]> = {
  home: defaultBlocks,
  about: [
    pb('hero-about',    'Hero',          '👤', 'Cabecera personal con identidad y propuesta',       true,  0),
    pb('narrative',     'Narrativa',     '📖', 'Historia personal y trayectoria profesional',       true,  1),
    pb('focus-areas',   'Áreas de foco', '🎯', 'Especialidades y ámbitos de trabajo',               true,  2),
    pb('timeline',      'Timeline',      '⏱️', 'Hitos y evolución cronológica',                    true,  3),
    pb('values',        'Valores',       '💎', 'Principios de diseño y filosofía de trabajo',       true,  4),
    pb('skills-matrix', 'Skills',        '🛠️', 'Mapa visual de competencias técnicas',             false, 5),
    pb('cta-about',     'CTA',           '🚀', 'Llamada a la acción final',                         true,  6),
  ],
  contact: [
    pb('hero-contact',  'Hero',          '📬', 'Cabecera de la página de contacto',                 true,  0),
    pb('contact-form',  'Formulario',    '📝', 'Formulario de contacto con validación',             true,  1),
    pb('services-list', 'Servicios',     '🔧', 'Lista de servicios disponibles',                    true,  2),
    pb('availability',  'Disponibilidad','🟢', 'Estado actual y tiempos de respuesta',              true,  3),
    pb('faqs-contact',  'FAQs',          '❓', 'Preguntas frecuentes sobre colaboración',           false, 4),
    pb('location-map',  'Mapa',          '📍', 'Mapa de ubicación',                                 false, 5),
  ],
  systems: [
    pb('hero-systems',    'Hero',           '⚡', 'Cabecera de la sección de sistemas',                true,  0),
    pb('architecture-map','Arquitectura',   '🗺️', 'Mapa visual de la arquitectura de sistemas',       true,  1),
    pb('systems-grid',    'Grid de sistemas','⚙️', 'Tarjetas de cada sistema con estado y métricas',  true,  2),
    pb('capabilities',    'Capacidades',    '🔬', 'Resumen de capacidades y características clave',   true,  3),
    pb('cta-systems',     'CTA',            '🚀', 'Llamada a la acción',                               false, 4),
  ],
  'systems/mcp': [
    pb('hero-mcp',        'Hero',           '🔗', 'Cabecera del sistema MCP',                          true,  0),
    pb('protocol-diagram','Diagrama',       '📡', 'Diagrama del protocolo MCP y flujo de datos',       true,  1),
    pb('mcp-capabilities','Capacidades',    '🛠️', 'Lista de herramientas y capacidades MCP',          true,  2),
    pb('tool-registry',   'Registry',       '📋', 'Registro de herramientas disponibles',              true,  3),
    pb('integrations-mcp','Integraciones',  '🔌', 'Integraciones y conectores soportados',             false, 4),
    pb('roadmap-mcp',     'Roadmap',        '🗓️', 'Hoja de ruta del sistema MCP',                    false, 5),
  ],
  'systems/graphrag': [
    pb('hero-graphrag',   'Hero',           '🧠', 'Cabecera del sistema GraphRAG',                     true,  0),
    pb('graph-diagram',   'Diagrama',       '🕸️', 'Visualización del grafo de conocimiento',          true,  1),
    pb('query-pipeline',  'Pipeline',       '⚙️', 'Pipeline de consulta y recuperación',              true,  2),
    pb('memory-arch',     'Arquitectura',   '💾', 'Arquitectura de memoria y almacenamiento',          true,  3),
    pb('benchmarks',      'Benchmarks',     '📊', 'Comparativas vs sistemas vectoriales',              false, 4),
  ],
  'systems/agents': [
    pb('hero-agents',     'Hero',           '🤖', 'Cabecera de la red de agentes',                     true,  0),
    pb('agent-network',   'Red de agentes', '🌐', 'Visualización de la red y roles de agentes',        true,  1),
    pb('roles-registry',  'Roles',          '📋', 'Registro de roles y permisos de agentes',           true,  2),
    pb('tool-access',     'Acceso',         '🔑', 'Control de acceso a herramientas por agente',       true,  3),
    pb('comm-protocol',   'Protocolo',      '📡', 'Protocolo de comunicación entre agentes',           false, 4),
  ],
  'systems/automation': [
    pb('hero-auto',       'Hero',           '⚙️', 'Cabecera de la capa de automatización',            true,  0),
    pb('pipeline-diag',   'Pipeline',       '🔄', 'Diagrama de pipelines de automatización',           true,  1),
    pb('triggers',        'Triggers',       '⚡', 'Tipos de triggers y condiciones de activación',     true,  2),
    pb('actions',         'Acciones',       '🎬', 'Biblioteca de acciones disponibles',                true,  3),
    pb('automation-metrics','Métricas',     '📊', 'Métricas de eficiencia y rendimiento',              false, 4),
  ],
  labs: [
    pb('hero-labs',       'Hero',           '🧪', 'Cabecera del hub de laboratorios',                  true,  0),
    pb('labs-grid',       'Grid de labs',   '🗂️', 'Grid de todos los laboratorios con estado',        true,  1),
    pb('featured-lab',    'Lab destacado',  '⭐', 'Showcase ampliado del lab principal',               true,  2),
    pb('metrics-board',   'Métricas',       '📊', 'Tablero de métricas globales de labs',              false, 3),
    pb('cta-labs',        'CTA',            '🚀', 'Llamada a la acción',                               false, 4),
  ],
  'labs/trading-ai': [
    pb('hero-trading',    'Hero',           '📈', 'Cabecera del lab Trading AI',                       true,  0),
    pb('dashboard-prev',  'Dashboard',      '🖥️', 'Preview del dashboard de trading',                 true,  1),
    pb('signal-engine',   'Señales',        '⚡', 'Motor de señales y procesamiento',                  true,  2),
    pb('risk-model',      'Riesgo',         '🛡️', 'Modelo de gestión de riesgo',                      true,  3),
    pb('perf-metrics',    'Métricas',       '📊', 'Métricas de rendimiento y backtesting',             true,  4),
    pb('stack-trading',   'Tech Stack',     '🔧', 'Stack tecnológico utilizado',                       false, 5),
    pb('cta-trading',     'CTA',            '🚀', 'Llamada a la acción',                               false, 6),
  ],
  'labs/stl-generator': [
    pb('hero-stl',        'Hero',           '🔷', 'Cabecera del lab STL Generator',                    true,  0),
    pb('demo-preview',    'Demo',           '🎮', 'Área de demo interactiva',                          true,  1),
    pb('gen-pipeline',    'Pipeline',       '⚙️', 'Pipeline de generación de modelos 3D',             true,  2),
    pb('export-options',  'Exportación',    '💾', 'Opciones de exportación y formatos soportados',     false, 3),
    pb('stack-stl',       'Tech Stack',     '🔧', 'Stack tecnológico utilizado',                       false, 4),
    pb('cta-stl',         'CTA',            '🚀', 'Llamada a la acción',                               false, 5),
  ],
  'labs/crm': [
    pb('hero-crm',        'Hero',           '👥', 'Cabecera del lab CRM Platform',                     true,  0),
    pb('pipeline-view',   'Pipeline',       '🔄', 'Vista del pipeline de ventas',                      true,  1),
    pb('contact-intel',   'Inteligencia',   '🧠', 'Inteligencia de contactos y scoring',               true,  2),
    pb('ai-scoring',      'AI Scoring',     '⭐', 'Puntuación automatizada con IA',                    true,  3),
    pb('stack-crm',       'Tech Stack',     '🔧', 'Stack tecnológico utilizado',                       false, 4),
    pb('cta-crm',         'CTA',            '🚀', 'Llamada a la acción',                               false, 5),
  ],
  'labs/erp': [
    pb('hero-erp',        'Hero',           '📦', 'Cabecera del lab ERP Platform',                     true,  0),
    pb('modules-overview','Módulos',        '🗂️', 'Visión general de los módulos del ERP',            true,  1),
    pb('workflow-builder','Workflows',      '⚙️', 'Constructor visual de flujos de trabajo',           true,  2),
    pb('financial-module','Finanzas',       '💰', 'Módulo financiero e inteligencia de datos',         false, 3),
    pb('stack-erp',       'Tech Stack',     '🔧', 'Stack tecnológico utilizado',                       false, 4),
  ],
  'labs/aura': [
    pb('hero-aura',       'Hero',           '💜', 'Cabecera del lab AURA',                              true,  0),
    pb('orch-diagram',    'Orquestación',   '🔮', 'Diagrama de orquestación de agentes',               true,  1),
    pb('agent-roster',    'Agentes',        '🤖', 'Roster de agentes activos y sus roles',             true,  2),
    pb('tool-gateway',    'Tool Gateway',   '🔑', 'Gateway de herramientas y control de acceso',       true,  3),
    pb('memory-system',   'Memoria',        '💾', 'Sistema de memoria persistente',                    false, 4),
    pb('stack-aura',      'Tech Stack',     '🔧', 'Stack tecnológico utilizado',                       false, 5),
  ],
  journal: [
    pb('hero-journal',    'Hero',           '📖', 'Cabecera del hub de publicaciones',                 true,  0),
    pb('featured-art',    'Destacados',     '⭐', 'Artículos destacados y más leídos',                 true,  1),
    pb('recent-posts',    'Recientes',      '🆕', 'Últimas publicaciones',                             true,  2),
    pb('categories',      'Categorías',     '🏷️', 'Navegación por categorías de contenido',           true,  3),
    pb('newsletter-j',    'Newsletter',     '📧', 'Captación de suscriptores',                         false, 4),
  ],
  projects: [
    pb('hero-projects',   'Hero',           '🗂️', 'Cabecera de la sección de proyectos',              true,  0),
    pb('projects-grid',   'Grid',           '📋', 'Grid de todos los proyectos publicados',            true,  1),
    pb('featured-proj',   'Destacado',      '⭐', 'Proyecto destacado con showcase ampliado',          false, 2),
    pb('filters-proj',    'Filtros',        '🔍', 'Filtros por categoría, estado y tecnología',        false, 3),
    pb('cta-projects',    'CTA',            '🚀', 'Llamada a la acción de colaboración',               true,  4),
  ],
  research: [
    pb('hero-research',   'Hero',           '🔬', 'Cabecera de la sección de investigación',           true,  0),
    pb('research-grid',   'Grid',           '📚', 'Grid de artículos de investigación',                true,  1),
    pb('featured-res',    'Destacado',      '⭐', 'Artículo destacado con preview',                    false, 2),
    pb('categories-res',  'Categorías',     '🏷️', 'Filtros y categorías de investigación',            true,  3),
    pb('newsletter-res',  'Newsletter',     '📧', 'Captación de suscriptores',                         false, 4),
  ],
  resources: [
    pb('hero-resources',  'Hero',           '📚', 'Cabecera de la sección de recursos',                true,  0),
    pb('resources-grid',  'Grid',           '🗂️', 'Grid de todos los recursos categorizados',         true,  1),
    pb('categories-rsc',  'Categorías',     '🏷️', 'Navegación por categorías de recursos',            true,  2),
    pb('search-rsc',      'Búsqueda',       '🔍', 'Búsqueda y filtrado de recursos',                   false, 3),
    pb('featured-rsc',    'Destacados',     '⭐', 'Recursos destacados y recomendados',                false, 4),
    pb('cta-resources',   'CTA',            '🚀', 'Llamada a la acción',                               false, 5),
  ],
  infrastructure: [
    pb('hero-infra',      'Hero',           '🏗️', 'Cabecera del centro de operaciones',               true,  0),
    pb('nodes-topology',  'Topología',      '🌐', 'Mapa visual de nodos y conexiones',                 true,  1),
    pb('deployments',     'Deploys',        '🚀', 'Feed de deployments recientes',                     true,  2),
    pb('metrics-dash',    'Métricas',       '📊', 'Dashboard de métricas en tiempo real',              true,  3),
    pb('logs-stream',     'Logs',           '📋', 'Stream de logs operacionales',                      false, 4),
  ],
  github: [
    pb('hero-github',     'Hero',           '💻', 'Cabecera de la capa GitHub',                        true,  0),
    pb('repos-grid',      'Repositorios',   '📁', 'Grid de repositorios destacados',                   true,  1),
    pb('contrib-graph',   'Contribuciones', '📈', 'Gráfico de contribuciones',                         true,  2),
    pb('activity-tl',     'Actividad',      '⚡', 'Timeline de actividad reciente',                    true,  3),
    pb('lang-stats',      'Lenguajes',      '🔤', 'Estadísticas por lenguaje de programación',         false, 4),
  ],
  playground: [
    pb('hero-playground', 'Hero',           '🎮', 'Cabecera del sandbox interactivo',                  true,  0),
    pb('roadmap-tl',      'Roadmap',        '🗓️', 'Timeline del roadmap de herramientas',             true,  1),
    pb('planned-tools',   'Herramientas',   '🛠️', 'Lista de herramientas planificadas',               true,  2),
    pb('subscribe-pg',    'Suscríbete',     '📧', 'Formulario de suscripción para avisos',             false, 3),
  ],
}

// ─── Site Content ─────────────────────────────────────────────────────────────

const defaultLogos: LogoItem[] = [
  { id: 'l1', name: 'Next.js',      imageUrl: '', url: 'https://nextjs.org'         },
  { id: 'l2', name: 'Vercel',       imageUrl: '', url: 'https://vercel.com'         },
  { id: 'l3', name: 'Cloudflare',   imageUrl: '', url: 'https://cloudflare.com'     },
  { id: 'l4', name: 'Anthropic',    imageUrl: '', url: 'https://anthropic.com'      },
  { id: 'l5', name: 'Python',       imageUrl: '', url: 'https://python.org'         },
  { id: 'l6', name: 'PostgreSQL',   imageUrl: '', url: 'https://postgresql.org'     },
]

const defaultGallery: GalleryItem[] = [
  { id: 'g1', src: '', alt: 'TradingAI Dashboard',    caption: 'Plataforma de trading algorítmico con señales en tiempo real' },
  { id: 'g2', src: '', alt: 'AURA Multi-Agent System', caption: 'Sistema de orquestación multi-agente'                       },
  { id: 'g3', src: '', alt: 'GraphRAG Knowledge Base', caption: 'Base de conocimiento con grafos semánticos'                 },
]

const defaultTeam: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Joaquín Cerezo',
    role: 'AI Systems Architect & Automation Engineer',
    bio: 'Diseño y construyo sistemas de IA autónomos, infraestructuras de automatización y ecosistemas digitales modulares. Especializado en MCP, GraphRAG, orquestación multi-agente e inteligencia industrial.',
    photoUrl: '',
    linkedin: 'https://linkedin.com/in/jootacee',
    github: 'https://github.com/jootaceehub',
  },
]

const defaultFaq: FaqItem[] = [
  { id: 'faq1', question: '¿Qué tipo de sistemas construyes?',          answer: 'Sistemas de IA autónomos: orquestación multi-agente, pipelines MCP, GraphRAG, automatización industrial y plataformas de datos en tiempo real.' },
  { id: 'faq2', question: '¿Con qué tecnologías trabajas principalmente?', answer: 'Python, TypeScript/Next.js, LangChain, Claude API, PostgreSQL/pgvector, Docker, n8n, Temporal, y React Three Fiber para visualizaciones.' },
  { id: 'faq3', question: '¿Puedo ver proyectos reales en producción?', answer: 'Sí. El apartado Labs muestra TradingAI, STL Generator, CRM Platform, ERP Modular y AURA — todos con arquitecturas reales y stacks documentados.' },
  { id: 'faq4', question: '¿Trabajas con equipos o individualmente?',   answer: 'Principalmente como arquitecto independiente, pero colaboro con equipos de producto y engineering como contractor o advisor en proyectos de mediana y gran escala.' },
  { id: 'faq5', question: '¿Cómo empezar una colaboración?',            answer: 'Escríbeme a jootac@gmail.com con el contexto del proyecto. Respondo en menos de 24h con una propuesta de scoping inicial.' },
]

const defaultPortfolio: PortfolioItem[] = [
  { id: 'p1', title: 'TradingAI Dashboard',   description: 'Motor de señales algorítmicas con backtesting, gestión de riesgo y dashboard en tiempo real.',                  imageUrl: '', tags: ['Python', 'React', 'WebSocket', 'FastAPI'],       url: 'https://jootacee.com/labs/trading-ai',   year: '2025' },
  { id: 'p2', title: 'AURA Multi-Agent',       description: 'Sistema de orquestación multi-agente con memoria persistente, tool gateway y roles dinámicos.',                imageUrl: '', tags: ['LangChain', 'Claude API', 'PostgreSQL', 'MCP'],   url: 'https://jootacee.com/labs/aura',         year: '2025' },
  { id: 'p3', title: 'GraphRAG Knowledge Base',description: 'Base de conocimiento con grafos semánticos, recuperación híbrida y memoria episódica para agentes IA.',      imageUrl: '', tags: ['pgvector', 'Neo4j', 'Python', 'LangChain'],       url: 'https://jootacee.com/systems/graphrag',  year: '2025' },
  { id: 'p4', title: 'STL Generator',          description: 'Generación de modelos 3D desde lenguaje natural con exportación directa a STL/OBJ via OpenSCAD + FastAPI.', imageUrl: '', tags: ['Three.js', 'OpenSCAD', 'FastAPI', 'Claude API'],   url: 'https://jootacee.com/labs/stl-generator', year: '2024' },
  { id: 'p5', title: 'ERP Modular',            description: 'Suite de gestión empresarial con módulos RRHH, finanzas, logística y workflows visuales.',                    imageUrl: '', tags: ['Next.js', 'PostgreSQL', 'Temporal', 'TypeScript'], url: 'https://jootacee.com/labs/erp',          year: '2025' },
]

const defaultCta: CtaContent = {
  headline: 'Ready to build?',
  subheadline: "Let's architect your next autonomous system. Whether it's an AI agent network, an automation pipeline, or industrial intelligence — I can help.",
  primaryBtnText: 'Start a conversation',
  primaryBtnHref: '#contact',
  secondaryBtnText: 'Explore Systems',
  secondaryBtnHref: '/en/systems',
  showBackground: true,
}

const defaultContact: ContactContent = {
  email: 'jootac@gmail.com',
  phone: '',
  address: 'Madrid, España · Remote worldwide',
  mapEmbedUrl: '',
  showForm: true,
  showMap: false,
  whatsapp: '',
}

const defaultMap: MapContent = {
  embedUrl: '',
  markerLabel: 'JootaCee — Madrid',
  zoom: 12,
}

const defaultNewsletter: NewsletterContent = {
  title: 'Stay in the loop',
  description: 'New systems, labs, and technical deep-dives — delivered when they ship, not on a schedule.',
  placeholder: 'your@email.com',
  successMessage: "You're in. I'll reach out when something worth sharing ships.",
  showNameField: false,
}

const defaultSocialProof: SocialProofItem[] = [
  { id: 'sp1', name: 'Model Context Protocol',   imageUrl: '', url: 'https://modelcontextprotocol.io', category: 'partner'       },
  { id: 'sp2', name: 'Anthropic Claude API',      imageUrl: '', url: 'https://anthropic.com',          category: 'certification' },
  { id: 'sp3', name: 'Vercel Deployment',         imageUrl: '', url: 'https://vercel.com',             category: 'partner'       },
]

const defaultBlog: BlogContent = {
  postsCount: 3,
  showAuthor: true,
  showDate: true,
  showExcerpt: true,
  category: '',
}

export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: 'AI Systems Architecture',
    title: 'Architecting autonomous systems.',
    subtitle: 'AI infrastructure, automation orchestration, and industrial intelligence. Built for the future, deployed today.',
    primaryBtnText: 'Explore Systems',
    primaryBtnHref: '/en/systems',
    secondaryBtnText: 'View Labs',
    secondaryBtnHref: '/en/labs',
    showBadge: true,
  },
  logos: defaultLogos,
  stats: [
    { value: '5+',   label: 'AI systems in production', icon: '⚡' },
    { value: '99.9%', label: 'Infrastructure uptime',   icon: '🟢' },
    { value: '12+',  label: 'MCP tools integrated',     icon: '🔗' },
    { value: '3',    label: 'Automation pipelines live', icon: '🤖' },
  ],
  services: [
    { icon: '🧠', title: 'AI Systems Architecture',         description: 'Design and implementation of autonomous AI systems — multi-agent orchestration, memory architectures, and reasoning pipelines.' },
    { icon: '🔗', title: 'MCP Ecosystems',                  description: 'Model Context Protocol server design, tool registries, and integration layers for production AI agents.' },
    { icon: '🕸️', title: 'GraphRAG & Knowledge Systems',   description: 'Graph-based retrieval augmentation, semantic knowledge bases, and hybrid vector/graph memory for AI agents.' },
    { icon: '⚙️', title: 'Automation Infrastructure',      description: 'End-to-end automation pipelines using n8n, Temporal, and custom orchestrators. From trigger to outcome.' },
    { icon: '📊', title: 'Industrial Intelligence',         description: 'Real-time data ingestion, signal processing, and AI-powered analytics for industrial and financial systems.' },
    { icon: '🏗️', title: 'Technical Architecture Consulting', description: 'Architecture strategy for AI products — system design, stack selection, and engineering roadmaps.' },
  ],
  gallery: defaultGallery,
  team: defaultTeam,
  pricing: [
    {
      name: 'Scoping',
      price: 'Free',
      period: '1h call',
      description: 'Understand your problem and propose an architecture',
      features: ['System requirements review', 'Architecture proposal', 'Stack recommendation', 'Effort estimate', 'No commitment'],
      highlighted: false,
      ctaText: 'Book a call',
      ctaHref: '#contact',
    },
    {
      name: 'Project',
      price: 'Custom',
      period: 'per project',
      description: 'Full design and build of a defined AI system',
      features: ['Architecture + implementation', 'MCP / agent / automation', 'Documentation included', 'Deployment support', '30d post-launch support'],
      highlighted: true,
      ctaText: 'Discuss project',
      ctaHref: '#contact',
    },
    {
      name: 'Advisory',
      price: 'Retainer',
      period: 'per month',
      description: 'Ongoing technical leadership for your AI initiatives',
      features: ['Weekly architecture reviews', 'Code review & guidance', 'Roadmap co-design', 'Team upskilling', 'Priority availability'],
      highlighted: false,
      ctaText: 'Enquire',
      ctaHref: '#contact',
    },
  ],
  testimonials: [],
  faq: defaultFaq,
  blog: defaultBlog,
  portfolio: defaultPortfolio,
  cta: defaultCta,
  contact: defaultContact,
  map: defaultMap,
  newsletter: defaultNewsletter,
  socialProof: defaultSocialProof,
}

// ─── Navbar Settings ──────────────────────────────────────────────────────────

export const defaultNavbarSettings: NavbarSettings = {
  visible: true,
  showIconWithName: true,
  logoIcon: 'sparkles',
  variant: 'default',
  shape: 'square',
  height: 'medium',
  shadow: 'subtle',
  background: 'solid',
  showBorderBottom: true,
  backdropBlur: true,
  sticky: true,
  transparentOnTop: false,
  animateOnScroll: true,
}

// ─── Footer Settings ──────────────────────────────────────────────────────────

export const defaultFooterSettings: FooterSettings = {
  visible: true,
  variant: 'columns',
  background: 'dark',
  showLogo: true,
  showScrollTop: true,
  brandDescription: 'Operational laboratory for AI systems, automation infrastructures, and modular digital ecosystems. Built by Joaquín Cerezo.',
  columns: [
    {
      id: 'col-1',
      heading: 'Systems',
      links: [
        { label: 'Overview',    href: '/en/systems'            },
        { label: 'MCP',         href: '/en/systems/mcp'        },
        { label: 'GraphRAG',    href: '/en/systems/graphrag'   },
        { label: 'Agents',      href: '/en/systems/agents'     },
        { label: 'Automation',  href: '/en/systems/automation' },
      ],
    },
    {
      id: 'col-2',
      heading: 'Labs',
      links: [
        { label: 'All Labs',       href: '/en/labs'                  },
        { label: 'Trading AI',     href: '/en/labs/trading-ai'       },
        { label: 'STL Generator',  href: '/en/labs/stl-generator'    },
        { label: 'AURA',           href: '/en/labs/aura'             },
        { label: 'CRM Platform',   href: '/en/labs/crm'              },
      ],
    },
    {
      id: 'col-3',
      heading: 'Platform',
      links: [
        { label: 'Infrastructure', href: '/en/infrastructure' },
        { label: 'GitHub',         href: '/en/github'         },
        { label: 'Journal',        href: '/en/journal'        },
        { label: 'About',          href: '/en/about'          },
        { label: 'Contact',        href: '/en/contact'        },
      ],
    },
  ],
  socials: [
    { platform: 'Twitter / X', url: 'https://x.com/jootacee',                    visible: true  },
    { platform: 'LinkedIn',    url: 'https://linkedin.com/in/jootacee',           visible: true  },
    { platform: 'GitHub',      url: 'https://github.com/jootaceehub',             visible: true  },
    { platform: 'Instagram',   url: 'https://instagram.com/',                     visible: false },
    { platform: 'YouTube',     url: 'https://youtube.com/',                       visible: false },
  ],
  showNewsletter: true,
  newsletterTitle: 'Stay in the loop',
  newsletterPlaceholder: 'your@email.com',
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use',   href: '/terms'   },
    { label: 'Cookies',        href: '/cookies' },
  ],
  copyrightText: '© 2026 JootaCee · Joaquín Cerezo. All rights reserved.',
}
