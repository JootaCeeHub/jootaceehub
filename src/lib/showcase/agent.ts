import type { LLMProfile, ChatMessage, ShowcaseOutput, DataSource } from '@/lib/admin/types'
import { callLLM } from '@/lib/ai/providers'

// ─── Default system prompt ────────────────────────────────────────────────────
// Can be overridden by the 'showcase-generator' agent entry in capabilities.skills

export const DEFAULT_SHOWCASE_PROMPT = `You are the **Showcase Generator** — a specialized agent embedded in JootaCee's command center.

MISSION: Analyze a private codebase and produce five professional public-facing documents that position the project compellingly, WITHOUT revealing any proprietary implementation details, source code, or business-sensitive information.

━━━ ABSOLUTE CONSTRAINTS ━━━
NEVER output: actual source code, function/class/variable names, internal API endpoint paths, database table/column names, environment variable names, specific package versions, internal folder structures beyond high-level layers, pricing or access-control logic, security implementation details, or performance numbers that reveal algorithmic efficiency secrets.

━━━ OUTPUT FORMAT ━━━
Return ONLY a valid JSON object with exactly these five string keys (no markdown fences, no extra text outside the JSON):
{ "readme": "...", "showcase": "...", "architecture": "...", "features": "...", "stack": "..." }

━━━ DOCUMENT SPECIFICATIONS ━━━

**readme** — PUBLIC README (README-PUBLIC.md)
- Title with tech stack badge row (shields.io format)
- One compelling paragraph: what problem it solves, for whom
- ## Features — 5-7 bullets (what it does, NOT how)
- ## Architecture — Mermaid flowchart diagram (conceptual layers, max 6 nodes, use \`\`\`mermaid blocks)
- ## Status — Live / Beta / R&D badge + brief note
- ## Access — "This is a premium product. Contact hello@jootacee.com for licensing and demo access."
- Under 400 words. Professional. No fluff.

**showcase** — MARKETING SHOWCASE (SHOWCASE.md)
- # Hero tagline — under 12 words, ends with impact
- ## The Problem — 2 sentences, paint the pain clearly
- ## The Solution — 2 paragraphs, outcomes-focused, no tech details
- ## Core Capabilities — 6-8 items: **[Emoji] Feature Name** — one-line description each
- ## Built For — 3 target personas or use cases
- ## Technology Foundation — grouped summary: AI/ML Layer | Data Layer | Application Layer | Infrastructure
- ## Access — contact CTA linking to hello@jootacee.com
- Tone: confident technical credibility. ~500 words.

**architecture** — ARCHITECTURE OVERVIEW (ARCHITECTURE.md)
- ## System Overview — 1 paragraph conceptual description
- ## Architecture Diagram — Mermaid flowchart (max 8 conceptual nodes: "AI Engine", "API Gateway", "Data Store", "Client App", etc.)
- ## Core Components — table: Component | Role | Key Characteristic
- ## Integration Layer — what categories of external services it connects to
- ## Security Model — high-level: authentication approach, data handling, isolation
- ## Scalability — how it scales conceptually (horizontal, event-driven, etc.)
- ~300 words + diagram.

**features** — FEATURE HIGHLIGHTS (FEATURES.md)
- ## Feature Matrix — markdown table: Feature | Category | Status | Business Value
- For each major feature (6-10 total): ### Feature Name → 2-sentence description + 1-sentence user benefit + status badge
- Focus on user-facing value and outcomes, not technical mechanics
- ~400 words.

**stack** — TECH STACK CARD (STACK.md)
- ## Technology Stack
- Sections: **Frontend** | **Backend** | **AI/ML** | **Data** | **Infrastructure** | **DevOps**
- Each entry: Technology Name — why chosen (architecture rationale, 1 sentence)
- ## Engineering Philosophy — 2-3 sentences on architectural decisions that shaped the stack
- NO versions, NO internal package names, NO config details
- ~250 words.

━━━ TONE GUIDE ━━━
Professional-technical. A senior engineer who understands business value writing for a technical audience that evaluates software. Precise. Confident. No buzzwords. Facts and clarity over hype.`

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerateShowcaseOptions {
  source: DataSource
  profile: LLMProfile
  systemPrompt?: string
}

// ─── Core generation function ─────────────────────────────────────────────────

export async function generateShowcase(opts: GenerateShowcaseOptions): Promise<ShowcaseOutput> {
  const { source, profile, systemPrompt = DEFAULT_SHOWCASE_PROMPT } = opts

  const userMessage = buildUserMessage(source)

  const messages: ChatMessage[] = [
    {
      id: 'user-1',
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    },
  ]

  const response = await callLLM(profile, messages, systemPrompt)

  const parsed = parseShowcaseJSON(response.content)
  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    modelUsed: response.model,
  }
}

// ─── Build the user message with source content ───────────────────────────────

function buildUserMessage(source: DataSource): string {
  const lines: string[] = [
    `# Analyze this codebase and generate the 5 public documents.`,
    ``,
    `## Project Information`,
    `- Name: ${source.name}`,
    `- Type: ${source.type}`,
    `- Description: ${source.description}`,
  ]

  if (source.metadata) {
    const meta = source.metadata
    if (meta.language) lines.push(`- Primary Language: ${meta.language}`)
    if (meta.stars !== undefined) lines.push(`- GitHub Stars: ${meta.stars}`)
    if (meta.isPrivate !== undefined) lines.push(`- Visibility: ${meta.isPrivate ? 'Private (premium product)' : 'Public'}`)
    if (meta.fullName) lines.push(`- Full Name: ${meta.fullName}`)
  }

  if (source.fileTree.length > 0) {
    lines.push(``, `## File Tree (${source.fileTree.length} files)`)
    lines.push('```')
    lines.push(source.fileTree.slice(0, 200).join('\n'))
    if (source.fileTree.length > 200) lines.push(`... and ${source.fileTree.length - 200} more files`)
    lines.push('```')
  }

  if (source.content) {
    lines.push(``, `## Indexed Content`)
    // Cap at 60KB to stay within context limits
    const cap = 60_000
    const content = source.content.length > cap
      ? source.content.slice(0, cap) + '\n\n[... content truncated for context window ...]'
      : source.content
    lines.push(content)
  }

  lines.push(``, `---`, `Now generate the JSON object with the 5 documents. Remember: output ONLY the JSON, nothing else.`)

  return lines.join('\n')
}

// ─── Parse the LLM JSON response ─────────────────────────────────────────────

function parseShowcaseJSON(raw: string): Omit<ShowcaseOutput, 'generatedAt' | 'modelUsed'> {
  // Strip potential markdown code fences the model may have added despite instructions
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  // Try to find the JSON object even if there's surrounding text
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in model response')

  const jsonStr = cleaned.slice(start, end + 1)
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>

  const get = (key: string): string => {
    const val = parsed[key]
    if (typeof val === 'string' && val.trim()) return val
    return `_${key} section not generated. Please try again._`
  }

  return {
    readme: get('readme'),
    showcase: get('showcase'),
    architecture: get('architecture'),
    features: get('features'),
    stack: get('stack'),
  }
}
