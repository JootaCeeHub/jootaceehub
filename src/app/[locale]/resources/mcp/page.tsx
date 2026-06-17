'use client'

import { useState } from 'react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Copy, Check } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
type FilterTab = 'All' | 'Official' | 'Database' | 'Productivity' | 'DevOps' | 'AI' | 'Communication'

interface McpServer {
  name: string
  category: 'official' | 'database' | 'productivity' | 'devops' | 'ai' | 'communication'
  description: string
  install: string
  tools: string[]
  needs?: string[]
}

const servers: McpServer[] = [
  // --- OFFICIAL ---
  {
    name: 'filesystem',
    category: 'official',
    description: 'Read, write, list, and manage local filesystem. Essential for any code-working agent.',
    install: 'npx @modelcontextprotocol/server-filesystem <path>',
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory', 'move_file', 'search_files'],
  },
  {
    name: 'brave-search',
    category: 'official',
    description: 'Real-time web search via Brave Search API. Returns titles, URLs, and snippets.',
    install: 'npx @modelcontextprotocol/server-brave-search',
    tools: ['brave_web_search', 'brave_local_search'],
    needs: ['BRAVE_API_KEY'],
  },
  {
    name: 'github',
    category: 'official',
    description: 'Full GitHub API — repos, files, commits, issues, PRs, branches.',
    install: 'npx @modelcontextprotocol/server-github',
    tools: ['search_repositories', 'get_file_contents', 'create_issue', 'list_commits', 'create_pull_request'],
    needs: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
  },
  {
    name: 'postgres',
    category: 'official',
    description: 'Execute queries, inspect schema, list tables on any PostgreSQL database.',
    install: 'npx @modelcontextprotocol/server-postgres <connection-string>',
    tools: ['query', 'list_tables', 'describe_table'],
  },
  {
    name: 'sqlite',
    category: 'official',
    description: 'Full SQLite read/write operations on local .db files.',
    install: 'npx @modelcontextprotocol/server-sqlite <path>',
    tools: ['read_query', 'write_query', 'create_table', 'list_tables'],
  },
  {
    name: 'puppeteer',
    category: 'official',
    description: 'Headless browser automation: navigate, screenshot, fill forms, extract DOM.',
    install: 'npx @modelcontextprotocol/server-puppeteer',
    tools: ['puppeteer_navigate', 'puppeteer_screenshot', 'puppeteer_click', 'puppeteer_fill', 'puppeteer_evaluate'],
  },
  {
    name: 'fetch',
    category: 'official',
    description: 'HTTP GET/POST requests. Web scraping, API calls, form submission.',
    install: 'npx @modelcontextprotocol/server-fetch',
    tools: ['fetch', 'fetch_post'],
  },
  {
    name: 'memory',
    category: 'official',
    description: 'Persistent knowledge graph with entities, relations, and observations.',
    install: 'npx @modelcontextprotocol/server-memory',
    tools: ['create_entities', 'create_relations', 'add_observations', 'read_graph', 'search_nodes'],
  },
  {
    name: 'sequential-thinking',
    category: 'official',
    description: 'Forces structured multi-step reasoning with branching.',
    install: 'npx @modelcontextprotocol/server-sequential-thinking',
    tools: ['sequentialthinking'],
  },
  // --- DATABASE ---
  {
    name: 'mysql',
    category: 'database',
    description: 'Execute queries, inspect schema, manage tables on any MySQL/MariaDB database.',
    install: 'npx @modelcontextprotocol/server-mysql <connection-string>',
    tools: ['query', 'list_tables', 'describe_table', 'execute'],
  },
  {
    name: 'mongodb',
    category: 'database',
    description: 'MongoDB CRUD operations, aggregation pipelines, index management, and collection listing.',
    install: 'npx mcp-server-mongodb <connection-string>',
    tools: ['find', 'insert', 'update', 'delete', 'aggregate', 'list_collections'],
  },
  {
    name: 'redis',
    category: 'database',
    description: 'Full Redis command set: strings, hashes, lists, sets, sorted sets, pub/sub, and key expiry.',
    install: 'npx mcp-server-redis',
    tools: ['redis_get', 'redis_set', 'redis_del', 'redis_hset', 'redis_lpush', 'redis_keys'],
    needs: ['REDIS_URL'],
  },
  {
    name: 'elasticsearch',
    category: 'database',
    description: 'Full-text search, index management, document CRUD, and cluster health on Elasticsearch/OpenSearch.',
    install: 'npx mcp-server-elasticsearch',
    tools: ['search', 'index_document', 'get_document', 'list_indices', 'cluster_health'],
    needs: ['ELASTICSEARCH_URL', 'ELASTICSEARCH_API_KEY'],
  },
  {
    name: 'supabase',
    category: 'database',
    description: 'Supabase database queries, storage, and auth operations.',
    install: 'npx mcp-server-supabase',
    tools: ['execute_sql', 'list_tables', 'get_storage_files'],
    needs: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'],
  },
  // --- PRODUCTIVITY ---
  {
    name: 'google-drive',
    category: 'productivity',
    description: 'List, read, create, update, and share files and folders in Google Drive.',
    install: 'npx @modelcontextprotocol/server-gdrive',
    tools: ['list_files', 'read_file', 'create_file', 'update_file', 'share_file'],
    needs: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    name: 'google-maps',
    category: 'productivity',
    description: 'Geocoding, route planning, place search, and distance matrix via Google Maps API.',
    install: 'npx @modelcontextprotocol/server-google-maps',
    tools: ['geocode', 'reverse_geocode', 'search_places', 'get_directions', 'distance_matrix'],
    needs: ['GOOGLE_MAPS_API_KEY'],
  },
  {
    name: 'obsidian',
    category: 'productivity',
    description: 'Read and write Obsidian vault notes, search by tag, list recent files, and manage frontmatter.',
    install: 'npx mcp-obsidian <vault-path>',
    tools: ['read_note', 'write_note', 'list_notes', 'search_notes', 'get_tags'],
  },
  {
    name: 'airtable',
    category: 'productivity',
    description: 'Read and write Airtable bases, tables, records, and fields. Schema introspection included.',
    install: 'npx mcp-airtable',
    tools: ['list_bases', 'list_tables', 'get_records', 'create_record', 'update_record'],
    needs: ['AIRTABLE_API_KEY'],
  },
  {
    name: 'notion',
    category: 'productivity',
    description: 'Read/write Notion pages, databases, blocks.',
    install: 'npx mcp-notion-server',
    tools: ['get_page', 'create_page', 'update_page', 'query_database'],
    needs: ['NOTION_API_KEY'],
  },
  {
    name: 'linear',
    category: 'productivity',
    description: 'Create, update, transition, and search Linear issues, cycles, and projects.',
    install: 'npx @linear/mcp-server',
    tools: ['create_issue', 'list_issues', 'update_issue', 'list_projects'],
    needs: ['LINEAR_API_KEY'],
  },
  {
    name: 'jira',
    category: 'productivity',
    description: 'Create, update, transition, and search Jira issues, sprints, and projects.',
    install: 'npx mcp-server-jira',
    tools: ['get_issue', 'create_issue', 'update_issue', 'transition_issue', 'search_issues', 'list_projects'],
    needs: ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  },
  // --- DEVOPS ---
  {
    name: 'git',
    category: 'devops',
    description: 'Local Git operations: status, diff, log, commit, branch, checkout, push, and merge.',
    install: 'npx @modelcontextprotocol/server-git --repository <path>',
    tools: ['git_status', 'git_diff', 'git_log', 'git_commit', 'git_branch', 'git_checkout'],
  },
  {
    name: 'docker',
    category: 'devops',
    description: 'Docker container lifecycle, log tailing, exec, image management, and network inspection.',
    install: 'npx mcp-server-docker',
    tools: ['list_containers', 'start_container', 'stop_container', 'get_logs', 'exec_in_container', 'list_images'],
  },
  {
    name: 'kubernetes',
    category: 'devops',
    description: 'Kubernetes cluster operations: pods, deployments, services, ConfigMaps, logs, and exec.',
    install: 'npx mcp-server-kubernetes',
    tools: ['list_pods', 'get_pod_logs', 'apply_manifest', 'delete_resource', 'get_deployments', 'exec_in_pod'],
    needs: ['KUBECONFIG'],
  },
  {
    name: 'cloudflare',
    category: 'devops',
    description: 'Manage Cloudflare Workers, KV namespaces, D1 databases, R2 buckets, and DNS records.',
    install: 'npx @cloudflare/mcp-server-cloudflare',
    tools: ['kv_get', 'kv_put', 'kv_delete', 'workers_list', 'd1_query', 'dns_list_records'],
    needs: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
  },
  {
    name: 'sentry',
    category: 'devops',
    description: 'Query Sentry for issues, events, releases, and performance data. Triage errors with AI.',
    install: 'npx mcp-server-sentry',
    tools: ['list_issues', 'get_issue', 'list_events', 'resolve_issue', 'list_releases'],
    needs: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG'],
  },
  // --- AI ---
  {
    name: 'tavily',
    category: 'ai',
    description: 'AI-optimized web search returning clean, structured results. Faster than raw HTML scraping.',
    install: 'npx tavily-mcp',
    tools: ['tavily_search', 'tavily_extract'],
    needs: ['TAVILY_API_KEY'],
  },
  {
    name: 'stripe',
    category: 'ai',
    description: 'Stripe customers, subscriptions, invoices, payments.',
    install: 'npx @stripe/agent-toolkit',
    tools: ['create_customer', 'list_subscriptions', 'create_invoice', 'retrieve_payment_intent'],
    needs: ['STRIPE_SECRET_KEY'],
  },
  {
    name: 'aws-kb-retrieval',
    category: 'ai',
    description: 'AWS Knowledge Base RAG — retrieve grounded context from Amazon Bedrock Knowledge Bases.',
    install: 'npx @modelcontextprotocol/server-aws-kb-retrieval-server',
    tools: ['retrieve'],
    needs: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'KNOWLEDGE_BASE_ID'],
  },
  {
    name: 'everything',
    category: 'ai',
    description: 'Reference implementation and test server. Exercises all MCP primitives: tools, resources, prompts, sampling.',
    install: 'npx @modelcontextprotocol/server-everything',
    tools: ['echo', 'add', 'longRunningOperation', 'sampleLLM', 'getTinyImage'],
  },
  // --- COMMUNICATION ---
  {
    name: 'slack',
    category: 'communication',
    description: 'Post messages, list channels, fetch thread history.',
    install: 'npx mcp-server-slack',
    tools: ['list_channels', 'post_message', 'reply_to_thread', 'get_channel_history'],
    needs: ['SLACK_BOT_TOKEN', 'SLACK_TEAM_ID'],
  },
  {
    name: 'gmail',
    category: 'communication',
    description: 'Read, send, search, and label Gmail messages. Draft management and attachment handling.',
    install: 'npx mcp-server-gmail',
    tools: ['list_messages', 'get_message', 'send_email', 'create_draft', 'search_messages'],
    needs: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    name: 'telegram',
    category: 'communication',
    description: 'Send messages and files to Telegram chats and channels via Bot API.',
    install: 'npx mcp-server-telegram',
    tools: ['send_message', 'send_document', 'get_chat_info', 'get_updates'],
    needs: ['TELEGRAM_BOT_TOKEN'],
  },
  {
    name: 'resend',
    category: 'communication',
    description: 'Send transactional email via Resend API. Supports React Email templates.',
    install: 'npx mcp-server-resend',
    tools: ['send_email'],
    needs: ['RESEND_API_KEY'],
  },
]

const buildServerCode = `import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  { name: 'my-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'my_tool',
    description: 'Does something useful',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'The input value' },
      },
      required: ['input'],
    },
  }],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'my_tool') {
    const { input } = request.params.arguments as { input: string }
    return { content: [{ type: 'text', text: \`Processed: \${input}\` }] }
  }
  throw new Error(\`Unknown tool: \${request.params.name}\`)
})

const transport = new StdioServerTransport()
await server.connect(transport)`

const stdioTransportCode = `import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// stdio transport: communicates via stdin/stdout
// Perfect for: local tools, CLI scripts, process pipes
// Launch via: claude --mcp "node my-server.js"

const server = new Server(
  { name: 'stdio-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// ... register handlers ...

const transport = new StdioServerTransport()
await server.connect(transport)
// Server is now listening on stdin, writing to stdout`

const httpTransportCode = `import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'

// HTTP/SSE transport: communicates over HTTP with Server-Sent Events
// Perfect for: remote servers, multi-user, authentication, cloud deployment

const app = express()
app.use(express.json())

const server = new Server(
  { name: 'http-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// Require auth header for all requests
app.use((req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (token !== process.env.MCP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

app.listen(3000, () => console.log('MCP server running on :3000'))`

const claudeDesktopConfig = `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}`

const toolPrimitiveCode = `// MCP Tool — a function the AI can call (actions, side effects)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'send_email',
    description: 'Send an email via Resend API',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['to', 'subject', 'body'],
    },
  }],
}))`

const resourcePrimitiveCode = `// MCP Resource — data the AI can read (files, DB, APIs)
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js'

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: 'file:///project/README.md',
    name: 'Project README',
    description: 'Main project documentation',
    mimeType: 'text/markdown',
  }],
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => ({
  contents: [{
    uri: request.params.uri,
    mimeType: 'text/markdown',
    text: await fs.readFile(request.params.uri.replace('file://', ''), 'utf-8'),
  }],
}))`

const promptPrimitiveCode = `// MCP Prompt — reusable prompt templates with parameters
import { ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js'

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [{
    name: 'code_review',
    description: 'Review code with specified focus areas',
    arguments: [
      { name: 'language', description: 'Programming language', required: true },
      { name: 'focus', description: 'Review focus: security|performance|readability', required: false },
    ],
  }],
}))

server.setRequestHandler(GetPromptRequestSchema, async (request) => ({
  messages: [{
    role: 'user',
    content: {
      type: 'text',
      text: \`Review this \${request.params.arguments?.language} code focusing on \${request.params.arguments?.focus ?? 'all areas'}.\`,
    },
  }],
}))`

const buildSteps = [
  { num: '1', text: 'Install SDK: npm install @modelcontextprotocol/sdk' },
  { num: '2', text: 'Define tools: Describe name, description, input schema (JSON Schema)' },
  { num: '3', text: 'Handle calls: Return { content: [{ type: "text", text: result }] }' },
]

const transportComparison = [
  { feature: 'Communication', stdio: 'stdin / stdout pipes', http: 'HTTP POST + Server-Sent Events' },
  { feature: 'Security', stdio: 'Process-level isolation', http: 'Network layer, requires auth' },
  { feature: 'Latency', stdio: 'Sub-millisecond (local)', http: 'Network RTT (1–50ms typical)' },
  { feature: 'Deployment', stdio: 'Local process only', http: 'Cloud, container, serverless' },
  { feature: 'Authentication', stdio: 'OS-level (no extra needed)', http: 'Bearer token, API key, mTLS' },
  { feature: 'Multi-user', stdio: 'One user per process', http: 'Unlimited concurrent sessions' },
  { feature: 'Best for', stdio: 'Local tools, CLI, dev scripts', http: 'Production APIs, team servers' },
]

function CopyButton({ text, large }: { text: string; large?: boolean }) {
  const [copied, copy] = useCopyToClipboard()
  const cls = large
    ? 'flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary cursor-pointer'
    : 'shrink-0 flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary cursor-pointer'
  return (
    <button onClick={() => copy(text)} className={cls} aria-label="Copy">
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function categoryTag(category: McpServer['category']) {
  switch (category) {
    case 'official': return <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-400" >official</span>
    case 'database': return <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-400" >database</span>
    case 'productivity': return <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-400" >productivity</span>
    case 'devops': return <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-sky-400" >devops</span>
    case 'ai': return <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-fuchsia-400" >ai</span>
    case 'communication': return <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-rose-400" >communication</span>
  }
}

const filterTabs: FilterTab[] = ['All', 'Official', 'Database', 'Productivity', 'DevOps', 'AI', 'Communication']

const categoryGroups: { label: string; filter: FilterTab; categories: McpServer['category'][] }[] = [
  { label: 'Official Anthropic MCP Servers', filter: 'Official', categories: ['official'] },
  { label: 'Database Integrations', filter: 'Database', categories: ['database'] },
  { label: 'Productivity Tools', filter: 'Productivity', categories: ['productivity'] },
  { label: 'DevOps & Infrastructure', filter: 'DevOps', categories: ['devops'] },
  { label: 'AI & Search', filter: 'AI', categories: ['ai'] },
  { label: 'Communication', filter: 'Communication', categories: ['communication'] },
]

export default function ResourcesMcpPage() {
  const [active, setActive] = useState<FilterTab>('All')

  const visibleServers = (cats: McpServer['category'][]) => {
    if (active === 'All') return servers.filter(srv => cats.includes(srv.category))
    const filterCat = active.toLowerCase() as McpServer['category']
    return servers.filter(srv => cats.includes(srv.category) && srv.category === filterCat)
  }

  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Resources / MCP Servers
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">MCP Servers.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Model Context Protocol (MCP) is Anthropic&apos;s open standard for connecting AI models to tools,
          data, and services. Each server below plugs into Claude Desktop, Claude Code, or any MCP-compatible runtime.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={active === tab ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary cursor-pointer" : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50 transition-all hover:border-primary/40 hover:text-primary cursor-pointer"}
          >
            {tab}
          </button>
        ))}
      </div>

      {categoryGroups.map(group => {
        const groupServers = visibleServers(group.categories)
        if (groupServers.length === 0) return null
        if (active !== 'All' && active !== group.filter) return null
        return (
          <div key={group.label}>
            <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >{group.label}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {groupServers.map((srv, i) => (
                <ScrollReveal key={srv.name} delay={i * 0.05}>
                  <div className="group rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15" >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{srv.name}</span>
                        {categoryTag(srv.category)}
                      </div>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{srv.description}</p>
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-white/6 bg-black/30 px-3 py-2">
                      <code className="flex-1 min-w-0 truncate font-mono text-[10px] text-green-400/80">{srv.install}</code>
                      <CopyButton text={srv.install} />
                    </div>
                    {srv.needs && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-white/30 uppercase tracking-wide">Needs:</span>
                        {srv.needs.map(n => (
                          <span key={n} className="rounded-md bg-amber-500/8 border border-amber-500/20 px-2 py-0.5 font-mono text-[9px] text-amber-400/70" >{n}</span>
                        ))}
                      </div>
                    )}
                    <div className={`mt-3 flex flex-wrap gap-1`}>
                      {srv.tools.map(t => (
                        <span key={t} className="rounded-md bg-white/5 border border-white/6 px-2 py-0.5 font-mono text-[9px] text-white/40" >{t}</span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )
      })}

      {/* Claude Desktop Config */}
      <div className="mt-12">
        <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Claude Code Configuration</p>
        <p className="mb-2 text-base font-semibold text-white">.claude/mcp.json</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Configure multiple MCP servers in a single JSON file at the root of your project or user config.
        </p>
        <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">.claude/mcp.json</span>
            <CopyButton text={claudeDesktopConfig} large />
          </div>
          <pre>{claudeDesktopConfig}</pre>
        </div>
      </div>

      {/* Transport Types */}
      <div className="mt-12">
        <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Transport Types</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.03] p-5" >
            <p className="mb-2 text-base font-bold text-white/90">stdio Transport</p>
            <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
              Communicates via stdin/stdout process pipes. Ideal for local tools, CLI scripts,
              and development environments where the server runs as a child process.
            </p>
            <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">stdio-server.ts</span>
                <CopyButton text={stdioTransportCode} large />
              </div>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{stdioTransportCode}</pre>
            </div>
          </div>
          <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.03] p-5" >
            <p className="mb-2 text-base font-bold text-white/90">HTTP / SSE Transport</p>
            <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
              Communicates over HTTP with Server-Sent Events for streaming. Perfect for remote servers,
              multi-user deployments, and anything requiring authentication.
            </p>
            <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">http-server.ts</span>
                <CopyButton text={httpTransportCode} large />
              </div>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{httpTransportCode}</pre>
            </div>
          </div>
        </div>

        <p className="mt-8 mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-sky-400/60">stdio vs HTTP/SSE — Comparison</p>
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="min-w-full text-xs">
            <thead className="border-b border-white/8 bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Feature</th>
                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">stdio</th>
                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">HTTP / SSE</th>
              </tr>
            </thead>
            <tbody>
              {transportComparison.map(row => (
                <tr key={row.feature} className="border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-white">{row.feature}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.stdio}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.http}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MCP Primitives */}
      <div className="mt-12">
        <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >MCP Primitives</p>
        <p className="mb-6 text-sm text-muted-foreground max-w-2xl">
          MCP defines three primitive types that servers expose to AI clients.
          Each serves a distinct purpose in the AI-tool interaction model.
        </p>
        <div className="flex flex-col gap-4">
          <ScrollReveal delay={0.05}>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]" >
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                <span className="text-lg">⚡</span>
                <span className="text-base font-bold text-white">Tools</span>
                <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary/80" >Actions / Side Effects</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                Functions the AI can call. Tools have side effects: they write files, query databases,
                call APIs, send emails. The model decides when to invoke them based on the task.
              </p>
              <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">tool definition</span>
                  <CopyButton text={toolPrimitiveCode} large />
                </div>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{toolPrimitiveCode}</pre>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]" >
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                <span className="text-lg">📄</span>
                <span className="text-base font-bold text-white">Resources</span>
                <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary/80" >Data Sources / Read-Only</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                Data sources the AI can read. Resources are identified by URI and expose content
                that the model can include in its context — files, database rows, API responses.
              </p>
              <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">resource definition</span>
                  <CopyButton text={resourcePrimitiveCode} large />
                </div>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{resourcePrimitiveCode}</pre>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]" >
              <div className="mb-3 flex items-center gap-3 flex-wrap">
                <span className="text-lg">💬</span>
                <span className="text-base font-bold text-white">Prompts</span>
                <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary/80" >Reusable Prompt Templates</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                Parameterized prompt templates stored server-side. The client lists available prompts,
                selects one, passes arguments, and receives a fully-rendered message array ready to send.
              </p>
              <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">prompt definition</span>
                  <CopyButton text={promptPrimitiveCode} large />
                </div>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{promptPrimitiveCode}</pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Build Your Own */}
      <div className="mt-12 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.03] p-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-400/60">Build Your Own</p>
        <h2 className="mb-4 text-xl font-semibold text-white/85">Build Your Own MCP Server</h2>
        <div className="mb-6 space-y-2">
          {buildSteps.map(step => (
            <div key={step.num} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 font-mono text-[9px] font-bold text-cyan-400">{step.num}</span>
              <span className="text-sm text-white/55">{step.text}</span>
            </div>
          ))}
        </div>
        <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">my-mcp-server.ts</span>
            <CopyButton text={buildServerCode} large />
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{buildServerCode}</pre>
        </div>

        <div className="mt-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/60">Claude Desktop Config · claude_desktop_config.json</p>
          <div className="relative rounded-xl border border-white/8 bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-green-400/80 overflow-x-auto" >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">claude_desktop_config.json</span>
              <CopyButton text={claudeDesktopConfig} large />
            </div>
            <pre>{claudeDesktopConfig}</pre>
          </div>
        </div>
      </div>
    </DomainLayout>
  )
}
