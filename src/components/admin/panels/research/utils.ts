import type { LinkCategory, DriveResourceType, TrackedSourceType, ResearchCategory } from '@/lib/admin/types'

// ─── Type aliases ─────────────────────────────────────────────────────────────

export type MainTab = 'publications' | 'intelligence' | 'resources'
export type IntelSubTab = 'feeds' | 'collections' | 'sources'

// ─── Config maps ──────────────────────────────────────────────────────────────

export const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: 'publications', label: 'Publications',  icon: '📝' },
  { id: 'intelligence', label: 'Intelligence',  icon: '🧠' },
  { id: 'resources',    label: 'Resources',     icon: '📁' },
]

export const ARTICLE_CATEGORIES: { id: ResearchCategory | 'all'; label: string; color: string }[] = [
  { id: 'all',      label: 'All',      color: '#94a3b8' },
  { id: 'opinion',  label: 'Opinion',  color: '#f472b6' },
  { id: 'research', label: 'Research', color: '#34d399' },
  { id: 'essays',   label: 'Essays',   color: '#818cf8' },
  { id: 'news',     label: 'News',     color: '#fbbf24' },
]

export const CAT_COLORS: Record<ResearchCategory, string> = {
  opinion: '#f472b6', research: '#34d399', essays: '#818cf8', news: '#fbbf24',
}

export const LINK_CATEGORIES: { id: LinkCategory; label: string; color: string; icon: string }[] = [
  { id: 'tools',       label: 'Herramientas',   color: '#60a5fa', icon: '🔧' },
  { id: 'articles',    label: 'Artículos',       color: '#f472b6', icon: '📄' },
  { id: 'repos',       label: 'Repositorios',    color: '#a78bfa', icon: '⑂' },
  { id: 'videos',      label: 'Videos',          color: '#f97316', icon: '🎬' },
  { id: 'docs',        label: 'Documentación',   color: '#34d399', icon: '📚' },
  { id: 'agents',      label: 'Agentes AI',      color: '#818cf8', icon: '🤖' },
  { id: 'automations', label: 'Automatizaciones', color: '#fbbf24', icon: '⚡' },
  { id: 'other',       label: 'Otros',           color: '#94a3b8', icon: '📌' },
]

export const DRIVE_TYPES: { id: DriveResourceType; label: string; icon: string; color: string }[] = [
  { id: 'agent-md',    label: 'Agent MD',       icon: '🤖', color: '#818cf8' },
  { id: 'skill-md',    label: 'Skill MD',       icon: '⚡', color: '#60a5fa' },
  { id: 'automation',  label: 'Automatización', icon: '🔄', color: '#fbbf24' },
  { id: 'mcp-config',  label: 'MCP Config',     icon: '🔌', color: '#34d399' },
  { id: 'prompt',      label: 'Prompt',         icon: '💬', color: '#f472b6' },
  { id: 'template',    label: 'Template',       icon: '📋', color: '#a78bfa' },
  { id: 'dataset',     label: 'Dataset',        icon: '📊', color: '#f97316' },
  { id: 'other',       label: 'Otro',           icon: '📁', color: '#94a3b8' },
]

export const SOURCE_TYPES: { id: TrackedSourceType; label: string; icon: string; color: string }[] = [
  { id: 'newsletter', label: 'Newsletter', icon: '📧', color: '#60a5fa' },
  { id: 'blog',       label: 'Blog',       icon: '✍️', color: '#34d399' },
  { id: 'youtube',    label: 'YouTube',    icon: '▶️', color: '#f97316' },
  { id: 'podcast',    label: 'Podcast',    icon: '🎙️', color: '#a78bfa' },
  { id: 'github',     label: 'GitHub',     icon: '⑂',  color: '#818cf8' },
  { id: 'twitter',    label: 'Twitter/X',  icon: '𝕏',  color: '#94a3b8' },
  { id: 'other',      label: 'Otro',       icon: '🌐', color: '#64748b' },
]

// ─── Category badge color map ─────────────────────────────────────────────────

export const CAT_BADGE: Record<LinkCategory, { border: string; text: string; bg: string }> = {
  repos:       { border: 'border-violet-400/30', text: 'text-violet-300',  bg: 'bg-violet-400/5'  },
  videos:      { border: 'border-orange-400/30', text: 'text-orange-300',  bg: 'bg-orange-400/5'  },
  tools:       { border: 'border-cyan-400/30',   text: 'text-cyan-300',    bg: 'bg-cyan-400/5'    },
  articles:    { border: 'border-pink-400/30',   text: 'text-pink-300',    bg: 'bg-pink-400/5'    },
  docs:        { border: 'border-emerald-400/30',text: 'text-emerald-300', bg: 'bg-emerald-400/5' },
  agents:      { border: 'border-amber-400/30',  text: 'text-amber-300',   bg: 'bg-amber-400/5'   },
  automations: { border: 'border-yellow-400/30', text: 'text-yellow-300',  bg: 'bg-yellow-400/5'  },
  other:       { border: 'border-white/15',      text: 'text-white/40',    bg: 'bg-white/3'       },
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

export function uid(): string { return crypto.randomUUID() }
export function now(): string { return new Date().toISOString() }

// ─── Auto-categorize ──────────────────────────────────────────────────────────

export function autoCategorize(url: string, folder: string, title = ''): LinkCategory {
  const d    = extractDomain(url).toLowerCase()
  const f    = folder.toLowerCase()
  const t    = title.toLowerCase()
  const path = (() => { try { return new URL(url).pathname.toLowerCase() } catch { return '' } })()

  // ── Repositories ────────────────────────────────────────────────────
  if (/github\.com|gitlab\.com|bitbucket\.org|sourcehut\.org|codeberg\.org/.test(d)) return 'repos'
  if (/\.github\.io$/.test(d)) return 'repos'                   // GitHub Pages
  if (/repositori|repos?\b|github|gitlab/.test(f)) return 'repos'

  // ── Videos ──────────────────────────────────────────────────────────
  if (/youtube\.com|youtu\.be|vimeo\.com|twitch\.tv|rumble\.com|loom\.com|dailymotion\.com/.test(d)) return 'videos'
  if (/watch\?v=|\/shorts\/|\/live\/|\/stream/.test(path)) return 'videos'
  if (/video|youtube|vimeo|curso|course|talk|keynote|webinar|conference/.test(f)) return 'videos'
  if (/\b(video|tutorial video|curso|masterclass|webinar|keynote|talk)\b/.test(t)) return 'videos'

  // ── Tools (domain-based) ─────────────────────────────────────────────
  if (/npmjs\.com|pypi\.org|pkg\.go\.dev|crates\.io|packagist\.org|nuget\.org/.test(d)) return 'tools'
  if (/marketplace\.visualstudio\.com|plugins\.jetbrains\.com|extensions\.gnome\.org/.test(d)) return 'tools'
  if (/ray\.so|transform\.tools|regex101\.com|regexr\.com|jsoncrack\.com|jq\.dev/.test(d)) return 'tools'
  if (/bundlephobia\.com|npmgraph\.js\.org|packagephobia\.com|socket\.dev/.test(d)) return 'tools'
  if (/excalidraw\.com|tldraw\.com|mermaid\.live|dbdiagram\.io|draw\.io|diagrams\.net/.test(d)) return 'tools'
  if (/codepen\.io|jsfiddle\.net|replit\.com|stackblitz\.com|codesandbox\.io/.test(d)) return 'tools'
  if (/cursor\.sh|warp\.dev|fig\.io|runme\.dev|devpod\.sh|gitpod\.io|github\.dev/.test(d)) return 'tools'
  // Design & productivity
  if (/canva\.com|figma\.com|framer\.com|webflow\.com|sketch\.com|invision\.app|whimsical\.com/.test(d)) return 'tools'
  if (/notion\.so|obsidian\.md|logseq\.com|roamresearch\.com|anytype\.io|coda\.io/.test(d)) return 'tools'
  if (/linear\.app|plane\.so|height\.app|clickup\.com|asana\.com/.test(d)) return 'tools'
  // SEO / marketing tools
  if (/ahrefs\.com|semrush\.com|moz\.com|screaming-frog\.co\.uk|sitebulb\.com/.test(d)) return 'tools'
  if (/mailchimp\.com|convertkit\.com|beehiiv\.com|kit\.com/.test(d)) return 'tools'
  // API / infra tools
  if (/postman\.com|insomnia\.rest|hoppscotch\.io|httpie\.io/.test(d)) return 'tools'
  if (/cloudflare\.com|railway\.app|fly\.io|render\.com|supabase\.com|planetscale\.com/.test(d)) return 'tools'
  // Image / media tools
  if (/squoosh\.app|tinypng\.com|svgomg\.net|photopea\.com|remove\.bg/.test(d)) return 'tools'
  if (/tool|util|software|extension|plugin|playground|sandbox|fiddle|generador|generator/.test(f)) return 'tools'

  // ── Documentation ───────────────────────────────────────────────────
  if (/^docs\.|^developer\.|\.readthedocs\.io$|^wiki\.|^man\./.test(d)) return 'docs'
  if (/mdn\.mozilla|developer\.mozilla|developer\.apple|developer\.android/.test(d)) return 'docs'
  if (/[/](docs|documentation|reference|api|guide|manual|spec|handbook)[/]/.test(path)) return 'docs'
  if (/\.gitbook\.io$|gitbook\.com/.test(d)) return 'docs'
  if (/docusaurus|mintlify|readme\.io|stoplight\.io/.test(d)) return 'docs'
  if (/documentaci|docs\b|referencia|reference|manual|guia\b|handbook|wiki/.test(f)) return 'docs'

  // ── AI Agents & LLMs (domain-based) ─────────────────────────────────
  if (/openai\.com|anthropic\.com|claude\.ai|cohere\.com|mistral\.ai|ai21\.com/.test(d)) return 'agents'
  if (/huggingface\.co|replicate\.com|elevenlabs\.io|stability\.ai|runway\.ml/.test(d)) return 'agents'
  if (/langchain\.com|langsmith\.com|langgraph\.com|llamaindex\.ai|haystack\.deepset/.test(d)) return 'agents'
  if (/flowise|dify\.ai|agentops|botpress|voiceflow|relevanceai\.com/.test(d)) return 'agents'
  if (/ollama\.ai|jan\.ai|localai|lmstudio|gpt4all|continue\.dev/.test(d)) return 'agents'
  if (/crewai|autogen|agentgpt|superagi|gptpilot|devika|cognition\.ai/.test(d)) return 'agents'
  if (/perplexity\.ai|you\.com|phind\.com|poe\.com|character\.ai/.test(d)) return 'agents'
  if (/writesonic\.com|copy\.ai|jasper\.ai|rytr\.me|neuralwriter\.com/.test(d)) return 'agents'
  if (/midjourney\.com|leonardo\.ai|ideogram\.ai|playground\.com|civitai\.com/.test(d)) return 'agents'
  if (/toolify\.ai|futurepedia\.io|theresanaiforthat\.com|aitoptools\.com/.test(d)) return 'agents'
  if (/dupdub\.com|murf\.ai|speechify\.com|heygen\.com|synthesia\.io/.test(d)) return 'agents'
  if (/pythagora\.ai|devin\.ai|e2b\.dev|copilot\.microsoft\.com/.test(d)) return 'agents'
  // .ai TLD heuristic — if domain ends in .ai and context is AI-related
  if (/\.ai$/.test(d)) return 'agents'
  if (/agentes?\s*(ai|ia)|ia\b|inteligencia artificial|llm|agent|copilot/.test(f)) return 'agents'
  if (/\b(agent|llm|llama|gpt|claude|gemini|copilot|chatbot|rag|embedding)\b/.test(f)) return 'agents'

  // ── Automations & Workflows ─────────────────────────────────────────
  if (/n8n\.io|zapier\.com|make\.com|integromat\.com|activepieces\.com/.test(d)) return 'automations'
  if (/pipedream\.com|tray\.io|ifttt\.com|automate\.io|workato\.com/.test(d)) return 'automations'
  if (/trigger\.dev|windmill\.dev|temporal\.io|inngest\.com|retool\.com/.test(d)) return 'automations'
  if (/airflow\.apache|prefect\.io|dagster\.io|mage\.ai|kestra\.io/.test(d)) return 'automations'
  if (/automatiz|workflow|n8n|zapier|automation\b|orquestaci|integración/.test(f)) return 'automations'

  // ── Articles, Research & Blogs ──────────────────────────────────────
  if (/arxiv\.org|papers\.cool|paperswithcode\.com|semanticscholar\.org|pubmed\.ncbi/.test(d)) return 'articles'
  if (/medium\.com|substack\.com|dev\.to|hashnode\.com|bearblog\.dev|hackernoon\.com/.test(d)) return 'articles'
  if (/news\.ycombinator\.com|lobste\.rs|tldrnewsletter\.com|tldr\.tech/.test(d)) return 'articles'
  if (/techcrunch\.com|wired\.com|arstechnica\.com|theverge\.com|thenewstack\.io/.test(d)) return 'articles'
  if (/towardsdatascience\.com|kdnuggets\.com|infoq\.com|dzone\.com/.test(d)) return 'articles'
  if (/newsletter|blog\.|\.blog|post\b|noticia|articulo|read\b/.test(f)) return 'articles'

  // ── Title-based patterns (last resort, broadest) ─────────────────────
  // Tools — any title mentioning "tool", "toolkit", "generator", "converter", "playground"
  if (/\b(tool(s|kit)?|generator|convert(er|or|idor)?|playground|sandbox)\b/.test(t)) return 'tools'
  if (/\b(herramienta(s)?|generador|convertidor)\b/.test(t)) return 'tools'
  if (/\b(cli|sdk|framework|library|package|extension|plugin|ide|editor)\b/.test(t) && !/video/.test(t)) return 'tools'
  // Agents — anything with AI + action word in title
  if (/\bai\b.*(tool|assistant|helper|writer|editor|generator|builder|platform|chat|voice)\b/.test(t)) return 'agents'
  if (/\b(chatgpt|gpt-?[0-9]|gemini|llama|claude)\b/.test(t)) return 'agents'
  if (/\b(ai|artificial intelligence|machine learning|deep learning|neural)\b.*(tool|model|system|platform|app)\b/.test(t)) return 'agents'
  // Articles — tutorials, how-tos, guides
  if (/\b(tutorial|how.to|guide|article|blog|post|essay|paper|research)\b/.test(t)) return 'articles'
  // Automations — workflow/pipeline in title
  if (/\b(workflow|automation|pipeline|orchestration|etl|integration)\b/.test(t)) return 'automations'
  // Docs — changelog, spec, reference in title
  if (/\b(documentation|api reference|spec|rfc|changelog|readme)\b/.test(t)) return 'docs'

  return 'other'
}

// ─── Auto-describe from domain/category knowledge ─────────────────────────────

export const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  'github.com':            'GitHub repository',
  'gitlab.com':            'GitLab repository',
  'codeberg.org':          'Codeberg repository',
  'arxiv.org':             'Academic research paper',
  'papers.cool':           'Machine learning research paper',
  'paperswithcode.com':    'ML paper with code implementation',
  'semanticscholar.org':   'Academic paper index',
  'medium.com':            'Article on Medium',
  'substack.com':          'Substack newsletter or post',
  'dev.to':                'Developer article on DEV Community',
  'hashnode.com':          'Developer blog on Hashnode',
  'hackernoon.com':        'Tech article on HackerNoon',
  'news.ycombinator.com':  'Hacker News discussion thread',
  'lobste.rs':             'Lobsters community discussion',
  'youtube.com':           'YouTube video',
  'youtu.be':              'YouTube video',
  'vimeo.com':             'Vimeo video',
  'twitch.tv':             'Twitch stream',
  'npmjs.com':             'npm package',
  'pypi.org':              'Python package on PyPI',
  'pkg.go.dev':            'Go package documentation',
  'crates.io':             'Rust crate',
  'huggingface.co':        'Model, dataset or Space on Hugging Face',
  'openai.com':            'OpenAI documentation or resource',
  'anthropic.com':         'Anthropic / Claude resource',
  'claude.ai':             'Claude AI interface',
  'mistral.ai':            'Mistral AI resource',
  'replicate.com':         'AI model hosted on Replicate',
  'elevenlabs.io':         'ElevenLabs voice AI',
  'langchain.com':         'LangChain framework resource',
  'flowise':               'Flowise AI workflow builder',
  'dify.ai':               'Dify AI application platform',
  'ollama.ai':             'Ollama local LLM runner',
  'n8n.io':                'n8n automation workflow',
  'zapier.com':            'Zapier automation',
  'make.com':              'Make.com automation scenario',
  'pipedream.com':         'Pipedream event-driven workflow',
  'activepieces.com':      'Activepieces open-source automation',
  'trigger.dev':           'Trigger.dev background job',
  'temporal.io':           'Temporal workflow orchestration',
  'excalidraw.com':        'Excalidraw diagram or whiteboard',
  'draw.io':               'Draw.io / Diagrams.net diagram',
  'regex101.com':          'Regex101 interactive tester',
  'mdn.mozilla.org':       'MDN Web Docs reference',
  'developer.mozilla.org': 'MDN Web Docs reference',
  'gitbook.com':           'GitBook documentation',
  'readthedocs.io':        'ReadTheDocs project documentation',
  'vercel.com':            'Vercel deployment or resource',
  'netlify.com':           'Netlify deployment or resource',
  'tailwindcss.com':       'Tailwind CSS resource',
  'shadcn.com':            'shadcn/ui component library',
  'ui.shadcn.com':         'shadcn/ui component library',
  'perplexity.ai':         'Perplexity AI search result',
  'reddit.com':            'Reddit community or discussion',
  'techcrunch.com':        'TechCrunch tech news article',
  'wired.com':             'Wired magazine article',
  'theverge.com':          'The Verge tech article',
  'arstechnica.com':       'Ars Technica tech article',
  'towardsdatascience.com':'Data science article',
  'infoq.com':             'InfoQ software engineering article',
}

export const CATEGORY_AUTO_DESC: Partial<Record<LinkCategory, string>> = {
  repos:       'Source code repository',
  videos:      'Video content',
  tools:       'Developer tool or utility',
  articles:    'Article or blog post',
  docs:        'Documentation or API reference',
  agents:      'AI agent or LLM resource',
  automations: 'Automation workflow or integration',
}

export function autoDescribe(url: string, category: LinkCategory, title = ''): string {
  const d = extractDomain(url).toLowerCase()

  // 1. Known domain lookup
  for (const [domain, desc] of Object.entries(DOMAIN_DESCRIPTIONS)) {
    if (d === domain || d.endsWith('.' + domain) || d.includes(domain)) return desc
  }

  // 2. Extract site name from title patterns like "Description | SiteName" or "Description - SiteName"
  if (title) {
    const sep = title.match(/\s[|—–]\s/)
    if (sep) {
      const parts = title.split(sep[0])
      const siteName = parts[parts.length - 1].trim()
      if (siteName.length >= 3 && siteName.length <= 50 && siteName !== title) return siteName
    }
    // "Description - SiteName" (hyphen separator, looser)
    const hyphenParts = title.split(' - ')
    if (hyphenParts.length >= 2) {
      const siteName = hyphenParts[hyphenParts.length - 1].trim()
      if (siteName.length >= 3 && siteName.length <= 50 && siteName !== title) return siteName
    }
  }

  // 3. Category fallback
  return CATEGORY_AUTO_DESC[category] ?? ''
}
