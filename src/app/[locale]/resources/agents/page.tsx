'use client'

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Copy, Check } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
interface AgentPattern {
  title: string
  description: string
  pseudocode?: string
  strengths: string[]
  useWhen?: string[]
  stack: string[]
}

const patterns: AgentPattern[] = [
  {
    title: 'ReAct (Reason + Act)',
    description:
      'The foundational loop. The model reasons about the task, picks a tool, observes the result, and reasons again until complete.',
    pseudocode: `while not done:
  thought = llm.think(history)
  if thought.action:
    result = tools[thought.action](thought.input)
    history.append(observation=result)
  else:
    return thought.final_answer`,
    strengths: ['Simple', 'Debuggable', 'Works with any tool-capable model'],
    useWhen: ['Single-agent tasks', 'Tool-heavy operations', 'Step-by-step problems'],
    stack: ['Claude API', 'OpenAI', 'LangChain AgentExecutor'],
  },
  {
    title: 'Multi-Agent Orchestration',
    description:
      'Orchestrator breaks task into subtasks, dispatches to specialist agents, aggregates results.',
    pseudocode: `User → Orchestrator → [Agent A | Agent B | Agent C]
              → Aggregator → Response`,
    strengths: ['Parallelism', 'Domain specialization', 'Easier testing'],
    useWhen: ['Complex tasks with distinct subtasks', 'Parallelizable work'],
    stack: ['LangGraph', 'AutoGen', 'CrewAI'],
  },
  {
    title: 'RAG Agent',
    description:
      'Agent decides when to retrieve context. Retrieval is a tool call, not a preprocessing step.',
    pseudocode: `Query → Embedding → Vector Search → Context Injection → Generation
Key params: chunk_size=512, overlap=64, top_k=5, reranker=cross-encoder`,
    strengths: ['Up-to-date knowledge', 'Grounded responses', 'Auditable sources'],
    stack: ['LangChain + pgvector', 'Weaviate', 'Pinecone'],
  },
  {
    title: 'Memory Agent (Short + Long Term)',
    description:
      'Short-term = conversation context window. Long-term = vector store of past interactions. On each turn: retrieve relevant memories → inject into context → generate → store new memory.',
    strengths: ['Continuity across sessions', 'Personalization', 'Accumulated knowledge'],
    stack: ['Claude + MCP memory server', 'LangChain Memory', 'Mem0'],
  },
  {
    title: 'Critic-Refinement Loop',
    description:
      'Generator produces output → Critic evaluates against criteria → Refiner incorporates feedback → repeat until pass.',
    pseudocode: `output = generator.generate(task)
for i in range(max_iterations):
  feedback = critic.evaluate(output, criteria)
  if feedback.passes: break
  output = refiner.improve(output, feedback)
return output`,
    strengths: ['Self-improving output', 'Catches errors before delivery'],
    useWhen: ['Code generation', 'Document writing', 'Structured data extraction'],
    stack: ['Claude API with two system prompts'],
  },
  {
    title: 'Tool-Use Pattern (Parallel Calls)',
    description:
      'Model identifies all independent tool calls and executes them in parallel. Use tool_choice: "auto" with multiple tools defined. Model emits multiple tool_use blocks in one response.',
    pseudocode: `# Simultaneously fetch GitHub stats + Stripe revenue + PostHog analytics
# → compose dashboard
# Result: 3–5× speedup vs sequential; fewer total LLM turns`,
    strengths: ['3–5× speedup vs sequential', 'Reduces total LLM turns'],
    stack: ['Claude API', 'OpenAI with parallel_tool_calls'],
  },
  {
    title: 'Supervisor / Router Pattern',
    description:
      'Supervisor classifies intent → routes to specialized subagent → returns to supervisor for output handling.',
    pseudocode: `Input → Supervisor (classify)
      → [CodeAgent | ResearchAgent | DataAgent]
      → Supervisor (format) → Output`,
    strengths: ['Each agent is narrow and optimizable', 'Easy to add new agents'],
    stack: ['LangGraph StateGraph', 'Claude with structured routing'],
  },
  {
    title: 'Event-Driven Agent',
    description:
      'Agent wakes on external event (webhook, schedule, file change). Performs task. Goes back to sleep. No persistent conversation — each invocation is stateless (state lives in external store).',
    strengths: ['Scalable', 'Cost-efficient', 'Integrates with existing infrastructure'],
    useWhen: ['Automated pipelines', 'Background tasks', 'Monitoring agents'],
    stack: ['n8n + Claude API', 'GitHub Actions + Claude', 'Temporal'],
  },
  {
    title: 'Self-Healing Agent',
    description: 'Agent catches its own errors and attempts automated recovery. On tool failure: retry with modified input, try alternative tool, or escalate to human.',
    pseudocode: `try:
  result = agent.execute(task)
except ToolError as e:
  strategy = error_classifier.classify(e)
  if strategy == 'retry':
    result = agent.execute(task, hint=e.message)
  elif strategy == 'fallback':
    result = fallback_tool.execute(task)
  else:
    return escalate_to_human(task, e)`,
    strengths: ['High autonomy', 'Reduced human intervention', 'Graceful degradation'],
    useWhen: ['Production systems', 'Long-running pipelines', 'Unmonitored overnight tasks'],
    stack: ['Claude API', 'LangGraph error handlers', 'Temporal retry policies'],
  },
  {
    title: 'Plan-and-Execute',
    description: 'Planner LLM generates a full task plan upfront. Executor LLM carries out each step. Planner can revise the plan based on execution results.',
    pseudocode: `plan = planner_llm.create_plan(task)
results = []
for step in plan.steps:
  result = executor_llm.run(step, context=results)
  results.append(result)
  if result.needs_replan:
    plan = planner_llm.revise(plan, result)
return synthesizer.combine(results)`,
    strengths: ['Long-horizon tasks', 'Transparent execution', 'Efficient use of weaker executor models'],
    useWhen: ['Multi-step research', 'Code migrations', 'Data transformation pipelines'],
    stack: ['Claude 3 Opus (planner)', 'Claude Haiku (executor)', 'LangGraph'],
  },
  {
    title: 'Human-in-the-Loop (HITL)',
    description: 'Agent pauses at defined checkpoints to request human approval before proceeding. Supports async approval via Slack, email, or UI.',
    pseudocode: `for step in plan:
  agent.execute(step)
  if step.requires_approval:
    approval = await human_gateway.request(
      action=step.description,
      timeout=3600
    )
    if not approval.granted:
      return abort_with_explanation(approval.reason)`,
    strengths: ['Safe for high-stakes actions', 'Auditable', 'Builds user trust'],
    useWhen: ['Financial operations', 'Production deployments', 'Data deletion', 'Customer communications'],
    stack: ['Claude API', 'Slack Approval Bot', 'n8n + Telegram', 'LangGraph interrupt()'],
  },
  {
    title: 'Structured Extraction Agent',
    description: 'Specialized agent for transforming unstructured data (documents, emails, web pages) into typed, validated schemas using forced JSON output.',
    pseudocode: `const schema = z.object({
  title: z.string(),
  date: z.string().datetime(),
  items: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })),
})

const result = await anthropic.messages.create({
  tools: [{ name: 'extract', input_schema: zodToJsonSchema(schema) }],
  tool_choice: { type: 'tool', name: 'extract' },
  messages: [{ role: 'user', content: rawDocument }],
})`,
    strengths: ['100% structured output', 'Schema-validated', 'Composable with downstream systems'],
    useWhen: ['Invoice processing', 'Form extraction', 'Email parsing', 'Web scraping'],
    stack: ['Claude API', 'Zod', 'zodToJsonSchema', 'TypeScript'],
  },
  {
    title: 'Agentic Code Interpreter',
    description: 'Agent writes code, executes it in a sandbox, reads the output, and iterates until the result matches the goal. Combines code generation with tool-based execution.',
    pseudocode: `goal = "Analyze sales_data.csv and find the top 5 products by revenue"
while not satisfied:
  code = llm.write_code(goal, context=previous_outputs)
  stdout, stderr = sandbox.execute(code)
  if stderr:
    context.add(error=stderr)
  elif not satisfies_goal(stdout, goal):
    context.add(output=stdout, feedback="Not quite — refine")
  else:
    return format_result(stdout)`,
    strengths: ['Handles complex data analysis', 'Self-correcting', 'No schema required'],
    useWhen: ['Data analysis tasks', 'Report generation', 'Algorithm verification', 'Mathematical computation'],
    stack: ['Claude API', 'E2B Sandbox', 'Docker executor', 'Deno sandbox'],
  },
]

interface FrameworkRow {
  name: string
  language: string
  bestFor: string
  abstraction: 'High' | 'Medium' | 'Low'
  agentType: string
}

const frameworks: FrameworkRow[] = [
  { name: 'LangChain',   language: 'Python/JS', bestFor: 'Rapid prototyping, RAG',        abstraction: 'High',   agentType: 'Single/Multi' },
  { name: 'LangGraph',   language: 'Python',    bestFor: 'Complex stateful agents',        abstraction: 'Medium', agentType: 'Multi-agent' },
  { name: 'AutoGen',     language: 'Python',    bestFor: 'Multi-agent debate',             abstraction: 'Medium', agentType: 'Multi-agent' },
  { name: 'CrewAI',      language: 'Python',    bestFor: 'Role-based crews',               abstraction: 'High',   agentType: 'Multi-agent' },
  { name: 'Llama Index', language: 'Python',    bestFor: 'Data-focused RAG',               abstraction: 'High',   agentType: 'RAG/Tool' },
  { name: 'Pydantic AI', language: 'Python',    bestFor: 'Type-safe agents',               abstraction: 'Low',    agentType: 'Single' },
  { name: 'Claude SDK',  language: 'Any',       bestFor: 'Direct API, full control',       abstraction: 'Low',    agentType: 'Any' },
]

interface CostRow {
  pattern: string
  tokens: string
  latency: string
  model: string
  costPer1k: string
}

const costRows: CostRow[] = [
  { pattern: 'ReAct',                    tokens: '2k–8k',    latency: '<3s',    model: 'Sonnet 4.6',              costPer1k: '$5–20' },
  { pattern: 'Multi-Agent',              tokens: '10k–50k',  latency: '10–60s', model: 'Sonnet (supervisor) + Haiku (workers)', costPer1k: '$50–200' },
  { pattern: 'RAG Agent',                tokens: '4k–12k',   latency: '<5s',    model: 'Sonnet 4.6',              costPer1k: '$10–40' },
  { pattern: 'Memory Agent',             tokens: '6k–20k',   latency: '3–10s',  model: 'Sonnet 4.6',              costPer1k: '$20–60' },
  { pattern: 'Critic-Refinement Loop',   tokens: '8k–30k',   latency: '10–30s', model: 'Sonnet (2× calls)',        costPer1k: '$25–90' },
  { pattern: 'Tool-Use (Parallel)',       tokens: '3k–10k',   latency: '<5s',    model: 'Sonnet 4.6',              costPer1k: '$8–30' },
  { pattern: 'Supervisor / Router',      tokens: '4k–15k',   latency: '5–15s',  model: 'Haiku (routing) + Sonnet', costPer1k: '$10–45' },
  { pattern: 'Event-Driven',             tokens: '1k–5k',    latency: '<2s',    model: 'Haiku 4.5',               costPer1k: '$1–10' },
  { pattern: 'Self-Healing',             tokens: '4k–20k',   latency: '5–20s',  model: 'Sonnet 4.6',              costPer1k: '$12–60' },
  { pattern: 'Plan-and-Execute',         tokens: '6k–30k',   latency: '15–60s', model: 'Opus (plan) + Haiku (exec)', costPer1k: '$30–150' },
  { pattern: 'Human-in-the-Loop',        tokens: '3k–10k',   latency: 'async',  model: 'Sonnet 4.6',              costPer1k: '$8–30' },
  { pattern: 'Structured Extraction',    tokens: '1k–4k',    latency: '<2s',    model: 'Haiku 4.5',               costPer1k: '$2–10' },
  { pattern: 'Code Interpreter',         tokens: '5k–25k',   latency: '10–60s', model: 'Sonnet 4.6',              costPer1k: '$15–80' },
]

const modelGuide = [
  {
    model: 'Claude Haiku 4.5',
    token: 'haiku-4-5',
    color: 'emerald',
    speed: 'Fastest',
    cost: '$',
    bestFor: ['Classification', 'Routing', 'Simple extraction', 'High-volume tasks', 'Event-driven triggers'],
    avoid: ['Complex multi-step reasoning', 'Long-horizon planning', 'Creative generation'],
  },
  {
    model: 'Claude Sonnet 4.6',
    token: 'sonnet-4-6',
    color: 'sky',
    speed: 'Balanced',
    cost: '$$',
    bestFor: ['Most agent tasks', 'Tool use', 'Code generation', 'Structured output', 'Multi-step reasoning'],
    avoid: ['Extreme cost constraints at scale', 'Tasks solvable by Haiku'],
  },
  {
    model: 'Claude Opus 4.7',
    token: 'opus-4-7',
    color: 'violet',
    speed: 'Thorough',
    cost: '$$$$',
    bestFor: ['Complex reasoning', 'Long-horizon planning', 'Planner in Plan-and-Execute', 'Highest accuracy tasks'],
    avoid: ['High-volume workloads', 'Simple routing or classification', 'Any task Sonnet handles well'],
  },
]

const modelFlowchart = `Is the task simple?
(classification, routing, extraction)
        │
        ├─ YES → Use Haiku 4.5
        │         Fast + cheap
        │
        └─ NO → Does it require deep reasoning
                 or long-horizon planning?
                         │
                         ├─ YES → Use Opus 4.7
                         │         Best accuracy
                         │
                         └─ NO → Use Sonnet 4.6
                                   Best balance`

const agentLoopCode = `// Complete Claude agentic loop in TypeScript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const tools: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description: 'Read a file from the filesystem',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Absolute file path' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
    },
  },
]

async function runAgent(task: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: task },
  ]

  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools,
      messages,
    })

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text')
      return textBlock?.type === 'text' ? textBlock.text : ''
    }

    // Process all tool calls in parallel
    const toolUses = response.content.filter(b => b.type === 'tool_use')
    const toolResults = await Promise.all(
      toolUses.map(async (block) => {
        if (block.type !== 'tool_use') return null
        const result = await executeToolCall(block.name, block.input)
        return {
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: result,
        }
      })
    )

    messages.push({
      role: 'user',
      content: toolResults.filter(Boolean) as Anthropic.ToolResultBlockParam[],
    })
  }
}`

const antiPatterns = [
  { title: 'Agent for simple tasks', desc: 'If a single LLM call solves it, don\'t add an agent loop. Agents add latency, cost, and failure modes.' },
  { title: 'Unbounded loops', desc: 'Always set max_iterations. An agent that loops forever is a runaway cost bill.' },
  { title: 'No error handling on tool calls', desc: 'Tool failures should be caught and injected back as observations, not thrown.' },
  { title: 'Shared mutable state between agents', desc: 'Each agent should receive inputs and return outputs. Side effects across agents cause race conditions.' },
  { title: 'Over-trusting agent output', desc: 'For high-stakes actions (delete, send, deploy), always validate tool call inputs before execution.' },
]

function abstractionClass(level: 'High' | 'Medium' | 'Low'): string {
  if (level === 'High')   return "inline-block rounded-full px-2 py-0.5 font-mono text-[9px] border border-amber-500/30 bg-amber-500/10 text-amber-400"
  if (level === 'Medium') return "inline-block rounded-full px-2 py-0.5 font-mono text-[9px] border border-sky-500/30 bg-sky-500/10 text-sky-400"
  return "inline-block rounded-full px-2 py-0.5 font-mono text-[9px] border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
}

function CopyButton({ text }: { text: string }) {
  const [copied, copy] = useCopyToClipboard()
  return (
    <button
      onClick={() => copy(text)}
      className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary cursor-pointer"
      aria-label="Copy"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function ResourcesAgentsPage() {
  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Resources / AI Agents
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Agent Architectures.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Production-ready agent patterns — from the foundational ReAct loop to multi-agent orchestration,
          RAG, memory systems, and critic-refinement. Each template includes pseudocode, strengths, stack recommendations,
          and cost estimates.
        </p>
      </div>

      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60">Core Patterns</p>
      <div className="grid gap-4 sm:grid-cols-1">
        {patterns.map((pattern, i) => (
          <ScrollReveal key={pattern.title} delay={i * 0.06}>
            <div className="group rounded-xl border-l-2 border-l-primary/40 border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15">
              <div className="mb-2 flex items-start justify-between gap-3">
                <span className="text-base font-semibold text-white">{pattern.title}</span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>
              {pattern.pseudocode && (
                <pre className="mb-3 rounded-lg border border-white/6 bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-green-400/70 overflow-x-auto whitespace-pre">{pattern.pseudocode}</pre>
              )}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {pattern.strengths.map(str => (
                  <span key={str} className="rounded-md bg-emerald-500/8 border border-emerald-500/20 px-2 py-0.5 font-mono text-[9px] text-emerald-400/80">{str}</span>
                ))}
                {pattern.useWhen?.map(u => (
                  <span key={u} className="rounded-md bg-sky-500/8 border border-sky-500/20 px-2 py-0.5 font-mono text-[9px] text-sky-400/80">{u}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-wide mr-1">Stack:</span>
                {pattern.stack.map(t => (
                  <span key={t} className="rounded-md bg-white/5 border border-white/6 px-2 py-0.5 font-mono text-[9px] text-white/40">{t}</span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Cost & Latency Profile */}
      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60">Cost &amp; Latency Profile</p>
      <p className="mb-4 text-sm text-muted-foreground max-w-2xl">
        Estimates based on Claude API pricing at 1,000 runs/month. Token counts include input + output.
        Costs vary significantly with prompt complexity and tool call frequency.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/8">
        <table className="min-w-full text-xs">
          <thead className="border-b border-white/8 bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Pattern</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Avg Tokens/Run</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Latency</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Model Recommendation</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Cost/1k runs</th>
            </tr>
          </thead>
          <tbody className="">
            {costRows.map(row => (
              <tr key={row.pattern} className="border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-xs font-semibold text-white">{row.pattern}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.tokens}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.latency}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.model}</td>
                <td className="px-4 py-3 text-xs font-mono text-amber-400/80">{row.costPer1k}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Selection Guide */}
      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60">Model Selection Guide</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {modelGuide.map(m => (
          <ScrollReveal key={m.model} delay={0.06}>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15">
              <div className="mb-1 flex items-start justify-between gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{m.model}</span>
                <div className="flex gap-1.5">
                  <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] text-sky-400">{m.speed}</span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] text-amber-400">{m.cost}</span>
                </div>
              </div>
              <p className="mb-3 font-mono text-[10px] text-primary/60">{m.token}</p>
              <div className="mb-3">
                <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-400/60">Best for</p>
                <ul className="space-y-1">
                  {m.bestFor.map(b => <li key={b} className="text-xs text-white/50 leading-relaxed before:content-['\25B8'] before:mr-1.5 before:text-emerald-400/50">{b}</li>)}
                </ul>
              </div>
              <div className="mb-3">
                <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-red-400/60">Avoid when</p>
                <ul className="space-y-1">
                  {m.avoid.map(a => <li key={a} className="text-xs text-white/50 leading-relaxed before:content-['\25B8'] before:mr-1.5 before:text-red-400/50">{a}</li>)}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/8 bg-black/20 p-5">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-white/30">Model Selection Decision Tree</p>
        <pre className="font-mono text-[11px] leading-relaxed text-white/50 overflow-x-auto whitespace-pre">{modelFlowchart}</pre>
      </div>

      {/* Complete Agent Loop TypeScript */}
      <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-400/[0.03] p-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-400/60">TypeScript · Complete Example</p>
        <h2 className="mb-4 text-lg font-semibold text-white/85">Complete Agent Loop · TypeScript</h2>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">agent-loop.ts</span>
          <CopyButton text={agentLoopCode} />
        </div>
        <pre className="overflow-x-auto rounded-lg bg-black/50 p-5 font-mono text-[11px] leading-relaxed text-emerald-400/80 border border-white/6">{agentLoopCode}</pre>
      </div>

      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60">Frameworks Comparison</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/8">
        <table className="min-w-full text-xs">
          <thead className="border-b border-white/8 bg-white/[0.03]">
            <tr>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Framework</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Language</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Best For</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Abstraction</th>
              <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-white/40">Agent Type</th>
            </tr>
          </thead>
          <tbody className="">
            {frameworks.map((fw) => (
              <tr key={fw.name} className="border-b border-white/4 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-xs font-semibold text-white">{fw.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{fw.language}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{fw.bestFor}</td>
                <td className="px-4 py-3">
                  <span className={abstractionClass(fw.abstraction)}>{fw.abstraction}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{fw.agentType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Anti-Patterns */}
      <div className="mt-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-red-400/60">Common Mistakes · Anti-Patterns</p>
        <div className="space-y-3">
          {antiPatterns.map((ap, i) => (
            <div key={ap.title} className="flex items-start gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/15 font-mono text-[9px] font-bold text-red-400">{i + 1}</span>
              <p className="text-sm text-white/55">
                <span className="font-semibold text-white/75">{ap.title} — </span>
                {ap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DomainLayout>
  )
}
