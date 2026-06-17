import type { Article } from '@/lib/journal/types'

const article: Article = {
  slug: 'orchestration-is-the-new-compute',
  title: 'Orchestration Is the New Compute',
  excerpt:
    'The intelligence bottleneck has shifted from raw model capability to coordination primitives. Whoever controls orchestration controls the stack.',
  date: '2026-05-01T00:00:00.000Z',
  category: 'opinion',
  depth: 'brief',
  abstract:
    'The intelligence bottleneck has migrated from raw model capability to the coordination layer between models. This analysis argues that orchestration primitives — not model weights — are now the primary source of defensible value in AI systems architecture, drawing on the structural parallel between TCP/HTTP and the emerging class of agent coordination protocols.',
  tags: ['orchestration', 'MCP', 'AI infrastructure', 'architecture'],
  readTime: 6,
  featured: true,
  content: `
<p>For three years we were told the race was about models — bigger weights, better benchmarks, faster inference. The consensus was that compute was the moat. Scale enough GPUs, train long enough, and you owned the future.</p>

<p>That was wrong. Or at least: it was a temporary framing that masked the real battle happening underneath.</p>

<h2>The Shift Nobody Named</h2>

<p>The transition from compute to orchestration happened gradually, then all at once. When Claude can call tools, delegate sub-tasks to specialized agents, read from a knowledge graph, and write back to it — the model becomes infrastructure. The <em>protocol</em> around the model becomes the product.</p>

<p>This is why the Model Context Protocol matters more than any individual model release. MCP is not a feature. It is a coordination primitive. And coordination primitives — TCP, HTTP, SQL — tend to outlast the systems that first implement them.</p>

<h2>What Orchestration Actually Means</h2>

<p>In engineering terms, orchestration is the layer that decides:</p>

<ul>
  <li>Which model runs which sub-task</li>
  <li>What context flows between agents</li>
  <li>How memory persists across turns</li>
  <li>When to retry, escalate, or terminate</li>
</ul>

<p>None of this is glamorous. All of it is critical. The teams building production AI systems know this — they spend 80% of their time on orchestration glue and 20% on the model interaction itself.</p>

<h2>The Operational Implication</h2>

<p>If orchestration is the real value layer, then the organizations that win will be those who invest in protocol design before model selection. They will treat their orchestration fabric as a core engineering artifact — versioned, observable, composable — rather than as a collection of API calls strung together with error handling.</p>

<p>This is not a speculative view. It is already visible in the architecture of every serious AI deployment I have studied or helped build. The models change every six months. The orchestration layer survives.</p>

<p>Build for what survives.</p>
`,
}

export default article
