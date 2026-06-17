import type { Article } from '@/lib/journal/types'

const article: Article = {
  slug: 'protocol-convergence-mcp-a2a',
  title: 'Protocol Convergence: MCP and A2A Are the Same Bet',
  excerpt:
    'Anthropic\'s MCP and Google\'s A2A are often presented as competing standards. They are actually converging on the same architectural insight — and that convergence matters more than which protocol wins.',
  abstract:
    'The Model Context Protocol (MCP) and Agent-to-Agent protocol (A2A) represent two major vendor attempts to standardize inter-agent and agent-tool communication. This intelligence brief analyzes both protocols at the architectural level, identifies their convergence points, and argues that the real competition is not between MCP and A2A but between standardized protocol-first architectures and proprietary walled-garden approaches.',
  date: '2026-05-22T00:00:00.000Z',
  category: 'news',
  depth: 'signal',
  tags: ['MCP', 'A2A', 'protocols', 'interoperability', 'AI infrastructure'],
  readTime: 5,
  content: `
<p>The AI infrastructure community has spent the last several months debating MCP versus A2A as if they were competing products in the same category. This framing misses the important question, which is not which protocol you should pick but whether the protocol-first architecture both represent is the right approach — and the answer is yes.</p>

<h2>What Each Protocol Actually Does</h2>

<p><strong>Model Context Protocol (MCP)</strong>, published by Anthropic in late 2024, defines a client-server architecture for connecting AI models to external tools, data sources, and services. An MCP server exposes capabilities — functions, resources, prompts — through a standardized interface. An MCP client (typically an LLM runtime) discovers and calls these capabilities. The protocol is transport-agnostic: implementations run over stdio, HTTP, or WebSocket.</p>

<p><strong>Agent-to-Agent (A2A)</strong>, published by Google in early 2025, defines a protocol for agents to discover, communicate with, and delegate tasks to other agents. Where MCP is primarily about agent-to-tool connectivity, A2A is primarily about agent-to-agent coordination. An A2A agent publishes an Agent Card (a capability manifest) and exposes a task execution endpoint. Other agents can discover it through a registry and delegate work to it.</p>

<p>The framing of these as competitors is understandable — they both involve agents calling things. But the architectural layers are different. MCP is the tool layer. A2A is the coordination layer. A complete agent runtime needs both.</p>

<h2>Where They Converge</h2>

<p>Despite operating at different layers, both protocols share several architectural commitments that reveal the underlying consensus forming in the field:</p>

<p><strong>Capability discovery over hardcoded integration.</strong> Both MCP and A2A reject the pattern of hardcoded API integrations in favor of runtime discovery. An agent discovers what tools or agents are available through a manifest, not through compiled-in knowledge. This is the right call — it enables composability without coordination costs.</p>

<p><strong>Structured capability declaration.</strong> Both protocols require capabilities to be described in structured schemas before they can be used. MCP uses JSON Schema for tool parameters. A2A uses OpenAPI for task contracts. The specific schema language differs; the commitment to declared, validated interfaces is identical.</p>

<p><strong>Separation of discovery from execution.</strong> Both protocols distinguish between finding a capability and invoking it. This separation enables routing, load balancing, and capability-level access control — none of which are possible if discovery and execution are fused.</p>

<h2>What Actually Matters</h2>

<p>The protocol-first architecture both MCP and A2A represent is a bet that the AI infrastructure layer will look like the web: open, composable, and governed by standards rather than by any single vendor's API design choices.</p>

<p>The alternative is the walled-garden model: agents that only call tools from the same vendor's ecosystem, that only coordinate with agents running on the same platform, that only persist memory in the same vendor's proprietary store. This model optimizes for vendor margin at the cost of ecosystem composability.</p>

<p>Teams building production AI infrastructure should be less concerned with which open protocol wins and more concerned with whether they are building on open protocols at all. A system built on MCP today can adopt A2A coordination patterns with moderate refactoring. A system built on a proprietary integration model is much harder to evolve.</p>

<p>The protocols will converge or one will absorb the other. The architecture they represent is already the answer.</p>
`,
}

export default article
