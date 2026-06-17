'use client'

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Copy, Check } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, copy] = useCopyToClipboard()
  const cls = small
    ? 'flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary cursor-pointer'
    : 'shrink-0 flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white/40 transition-colors hover:border-primary/30 hover:text-primary cursor-pointer'
  return (
    <button onClick={() => copy(text)} className={cls} aria-label="Copy">
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

interface SkillItem {
  command: string
  title: string
  description: string
  example?: string
  builtin?: boolean
}

const builtinSkills: SkillItem[] = [
  {
    command: '/ultrareview',
    title: 'Ultra Review',
    builtin: true,
    description:
      'Multi-agent cloud review of current branch or PR. Spawns specialized reviewers for Security, Performance, Architecture, and Test Coverage.',
    example: '/ultrareview\n/ultrareview 42',
  },
  {
    command: '/plan',
    title: 'Architecture Planner',
    builtin: true,
    description:
      'Enter architecture planning mode. Produces structured implementation plan: phase breakdown, file map, dependency graph, and verification checklist.',
    example: '/plan',
  },
  {
    command: '/fast',
    title: 'Fast Mode',
    builtin: true,
    description:
      'Toggle Fast mode (Claude Opus with faster output). Use for speed-critical tasks where throughput matters more than maximum reasoning depth.',
    example: '/fast',
  },
]

const customSkills: SkillItem[] = [
  {
    command: '/deploy',
    title: 'Deploy to Railway',
    description:
      'Run railway up --environment production, tail logs, confirm healthy. Needs RAILWAY_TOKEN env var and project ID configured.',
    example: '/deploy',
  },
  {
    command: '/test <file>',
    title: 'Generate Tests',
    description:
      "Analyze the file's public API surface. Generate Vitest unit tests for all exported functions. Follow existing test patterns in src/test/.",
    example: '/test src/lib/utils.ts',
  },
  {
    command: '/docs <file>',
    title: 'Document API',
    description:
      'Read the file. Generate TypeScript JSDoc for every exported symbol. Produce a companion .md API reference with examples.',
    example: '/docs src/lib/admin/store.tsx',
  },
  {
    command: '/audit',
    title: 'Security Audit',
    description:
      'Scan all source files for SQL injection vectors, XSS sinks, insecure dependencies, exposed secrets, and OWASP Top 10 patterns. Report with severity and fix.',
    example: '/audit',
  },
  {
    command: '/commit',
    title: 'Smart Commit',
    description:
      'Stage all changes. Generate a conventional commit message from the diff. Show the message, ask for approval, then commit.',
    example: '/commit',
  },
  {
    command: '/changelog',
    title: 'Generate Changelog',
    description:
      'Read git log since last tag. Group commits by type (feat/fix/chore/docs). Generate CHANGELOG.md entry in Keep a Changelog format with date header.',
    example: '/changelog',
  },
  {
    command: '/bundle',
    title: 'Analyze Bundle',
    description:
      'Run ANALYZE=true npm run build. Parse treemap output. Report the 5 largest chunks with import paths and optimization suggestions.',
    example: '/bundle',
  },
  {
    command: '/migrate <name>',
    title: 'DB Migration',
    description:
      'Create a new Drizzle migration with the given name. Run drizzle-kit generate, then drizzle-kit migrate. Verify schema diff and summarize changes.',
    example: '/migrate add_user_preferences',
  },
  {
    command: '/review',
    title: 'Code Review',
    description:
      'Review staged changes or a specific file. Check for: type safety, performance, test coverage, naming, and SOLID violations. Rate each dimension.',
    example: '/review\n/review src/lib/utils.ts',
  },
  {
    command: '/optimize <file>',
    title: 'Performance Optimizer',
    description:
      'Profile the file for: unnecessary re-renders, missing memoization, unoptimized loops, large bundle imports. Suggest and apply fixes.',
    example: '/optimize src/components/LabsSection.tsx',
  },
  {
    command: '/i18n',
    title: 'i18n Coverage Check',
    description:
      'Scan all .tsx files for hardcoded strings. Compare against messages/en.json. Report missing keys. Generate the missing translation entries.',
    example: '/i18n',
  },
  {
    command: '/types',
    title: 'Type Generation',
    description:
      'Read an API response or JSON schema. Generate TypeScript interfaces with JSDoc. Place output in src/lib/types/ with proper exports.',
    example: '/types api-response.json',
  },
]

const skillFileFormatExample = `---
name: deploy
description: Deploy the current branch to production via Railway
---
# Deploy Skill

Run \`railway up --environment production\` for the current project.

## Steps
1. Check for uncommitted changes (git status)
2. Confirm the target environment with the user
3. Run: railway up --environment production
4. Tail deployment logs until success or failure
5. Verify health endpoint responds 200

## Requirements
- RAILWAY_TOKEN must be set in environment
- railway CLI installed globally`

const settingsJsonSchema = `{
  // Permissions — what Claude Code can and cannot do automatically
  "permissions": {
    "allow": [
      // Glob patterns for allowed shell commands (no prompt needed)
      "Bash(git log:*)",
      "Bash(npm run *)",
      "Bash(npx tsc --noEmit)",
      "Read(**/*)",
      "Write(src/**/*)"
    ],
    "deny": [
      // Patterns that are always blocked regardless of context
      "Bash(rm -rf /)",
      "Bash(git push --force *)"
    ]
  },

  // Hooks — shell scripts run at lifecycle events
  "hooks": {
    // Runs before every tool call; can block with non-zero exit code
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "echo 'About to run: $CLAUDE_TOOL_INPUT'"
        }]
      }
    ],
    // Runs after every tool call
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [{
          "type": "command",
          "command": "npx tsc --noEmit 2>&1 | head -20"
        }]
      }
    ],
    // Runs when Claude is done responding (Stop event)
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "notify-send 'Claude Code' 'Response complete'"
        }]
      }
    ],
    // Runs when Claude sends a notification (e.g., awaiting input)
    "Notification": [
      {
        "hooks": [{
          "type": "command",
          "command": "say 'Claude needs your attention'"
        }]
      }
    ]
  },

  // Inject env vars into every Claude Code session
  "env": {
    "NODE_ENV": "development",
    "NEXT_PUBLIC_LOG_LEVEL": "debug"
  },

  // Shell script that outputs an API key (alternative to ANTHROPIC_API_KEY)
  "apiKeyHelper": "op read 'op://Personal/Anthropic/credential'",

  // Default model for primary responses
  "model": "claude-sonnet-4-6",

  // Faster/cheaper model for classification, routing, quick tasks
  "smallFastModel": "claude-haiku-4-5-20251001"
}`

const preCommitHook = `#!/bin/bash
# .git/hooks/pre-commit
# Wire Claude Code /review into git pre-commit

set -e

# Get list of staged .ts/.tsx files
STAGED=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\\.(ts|tsx)$' || true)

if [ -z "$STAGED" ]; then
  exit 0  # No TypeScript files staged, skip
fi

echo "Running Claude Code review on staged files..."
echo "$STAGED" | xargs -I{} claude --print "/review {}" 2>&1 | tee /tmp/claude-review.txt

# Fail if review finds critical issues (exit code 1 from claude means issues found)
# Adjust this logic based on your team's review threshold
if grep -q "severity: critical" /tmp/claude-review.txt; then
  echo "\\nClaude Code found critical issues. Fix them before committing."
  exit 1
fi

echo "Review passed. Committing..."
exit 0`

const commitMsgHook = `#!/bin/bash
# .git/hooks/commit-msg
# Validate commit message quality with Claude Code

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Skip merge commits
if echo "$COMMIT_MSG" | grep -q "^Merge"; then
  exit 0
fi

# Ask Claude to validate the message follows Conventional Commits
VALIDATION=$(claude --print "Validate this commit message follows Conventional Commits spec (type(scope): description). Reply with only PASS or FAIL and a one-line reason.\\n\\nMessage: $COMMIT_MSG" 2>/dev/null)

if echo "$VALIDATION" | grep -q "^FAIL"; then
  echo "\\nCommit message validation failed:"
  echo "$VALIDATION"
  echo "\\nExpected format: type(scope): description"
  echo "Types: feat, fix, chore, docs, style, refactor, test, perf"
  exit 1
fi

exit 0`

const prePushHook = `#!/bin/bash
# .git/hooks/pre-push
# Run /audit before pushing to remote

set -e

REMOTE=$1
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Running Claude Code security audit before push to $REMOTE/$BRANCH..."

# Run the audit skill
claude --print "/audit" 2>&1 | tee /tmp/claude-audit.txt

# Block push if high-severity issues found
if grep -qE "(HIGH|CRITICAL)" /tmp/claude-audit.txt; then
  echo "\\nSecurity audit found HIGH/CRITICAL issues. Resolve before pushing."
  cat /tmp/claude-audit.txt
  exit 1
fi

echo "Audit passed. Pushing..."
exit 0`

const claudeMdPatterns = [
  {
    name: 'API Backend Project',
    description: 'Node.js / Python REST or tRPC API with database, auth, and background jobs.',
    template: `# Project: My API

## Stack
- Runtime: Bun 1.x
- Framework: Hono
- Database: PostgreSQL via Drizzle ORM
- Auth: Better Auth
- Validation: Zod
- Queue: BullMQ + Redis
- Tests: Vitest

## Critical Rules
- All DB queries via Drizzle, no raw SQL unless absolutely necessary
- All route inputs validated with Zod schemas
- Errors return JSON: { error: string, code: string }
- All async handlers wrapped in try/catch
- No console.log in production code — use logger.ts

## Architecture
- src/routes/  — Hono route handlers (thin, delegate to services)
- src/services/ — Business logic (no framework imports)
- src/db/       — Drizzle schema + migrations
- src/lib/      — Shared utilities

## Common Tasks
- Dev: bun run dev
- Migrate: bun run db:migrate
- Test: bun run test`,
  },
  {
    name: 'Frontend React Project',
    description: 'Next.js App Router with TailwindCSS, component library, and i18n.',
    template: `# Project: My Frontend

## Stack
- Next.js 16 (App Router, output: export)
- React 19, TypeScript strict
- TailwindCSS v4
- Framer Motion, GSAP
- Vitest + Testing Library

## Critical Rules
- CSS Separation: ALL Tailwind in *.styles.ts, NEVER inline in .tsx
- 'use client' only when required (state, events, browser APIs)
- Server components by default
- Co-locate tests: Component.test.tsx next to Component.tsx
- Never commit secrets or .env files

## Architecture
- src/app/          — Next.js pages and layouts
- src/components/   — Reusable UI components
- src/lib/          — Utilities, hooks, types
- src/styles/       — Global CSS only

## Common Tasks
- Dev: npm run dev
- Build: npm run build
- Typecheck: npm run typecheck
- Test: npm run test`,
  },
  {
    name: 'CLI Tool Project',
    description: 'Node.js or Rust command-line tool with argument parsing and file operations.',
    template: `# Project: My CLI Tool

## Stack
- Runtime: Bun
- Arg parsing: @clack/prompts + minimist
- File ops: Node fs/path
- Tests: Vitest

## Critical Rules
- All user-facing output via stdout; errors via stderr
- Exit code 0 = success, non-zero = failure
- No interactive prompts in non-TTY mode (support piping)
- Support --json flag for machine-readable output on all commands
- Every command documented in help text

## Commands
- my-tool init        — scaffold a new project
- my-tool run <file>  — execute a task file
- my-tool config      — show/edit configuration

## Common Tasks
- Dev: bun run src/index.ts
- Build: bun build src/index.ts --outdir dist --target node
- Install globally: npm link`,
  },
  {
    name: 'AI / LLM Application',
    description: 'Claude API application with agents, tools, structured output, and streaming.',
    template: `# Project: My AI App

## Stack
- Runtime: Node 22 / Bun
- LLM: Claude API (Anthropic SDK)
- Framework: Next.js 16 or Hono
- DB: Neon PostgreSQL + pgvector
- Queue: Inngest
- Validation: Zod

## Critical Rules
- NEVER log API keys or user data
- All LLM calls wrapped in retry logic (max 3 attempts)
- Structured output via tool_choice: force + Zod schema
- Stream responses to UI — never buffer entire response
- Store prompt/completion pairs in DB for eval/debugging

## Agent Architecture
- Orchestrator model: claude-sonnet-4-6
- Worker model: claude-haiku-4-5-20251001
- Max iterations per agent loop: 10
- Tool timeout: 30s

## Common Tasks
- Dev: npm run dev
- Test agent: npx tsx scripts/test-agent.ts
- Eval: npm run eval`,
  },
]

interface MatrixRow {
  capability: string
  tools: string
  active: boolean
}

const matrixRows: MatrixRow[] = [
  { capability: 'Web research', tools: 'brave-search MCP', active: true },
  { capability: 'Code execution', tools: 'filesystem + Docker MCP', active: true },
  { capability: 'Memory recall', tools: 'memory MCP', active: true },
  { capability: 'Telegram gateway', tools: 'telegram MCP', active: true },
  { capability: 'GitHub operations', tools: 'github MCP', active: true },
  { capability: 'Database queries', tools: 'postgres MCP', active: true },
  { capability: 'Email dispatch', tools: 'resend MCP', active: true },
  { capability: 'Scheduled tasks', tools: 'Hermes cron scheduler', active: true },
  { capability: 'File management', tools: 'filesystem MCP', active: true },
  { capability: 'Slack notifications', tools: 'slack MCP', active: false },
]

const codePatterns: { label: string; code: string }[] = [
  {
    label: 'Pattern 1: Structured output with tool_choice auto',
    code: `const result = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools: [searchTool, calculatorTool, databaseTool],
  messages: [{ role: 'user', content: userMessage }],
})`,
  },
  {
    label: 'Pattern 2: Parallel tool calls',
    code: `const toolResults = await Promise.all(
  result.content
    .filter(block => block.type === 'tool_use')
    .map(block => executeToolCall(block.name, block.input))
)`,
  },
  {
    label: 'Pattern 3: Agent loop until end_turn',
    code: `while (result.stop_reason !== 'end_turn') {
  const toolResults = processToolCalls(result.content)
  result = await anthropic.messages.create({
    messages: [
      ...messages,
      { role: 'assistant', content: result.content },
      { role: 'user', content: toolResults },
    ],
  })
}`,
  },
]

const claudeMdTemplate = `# Project: My App

## Stack
- Next.js 16, React 19, TailwindCSS v4, TypeScript strict
- npm (not yarn/pnpm)
- Tests: Vitest + Testing Library

## Critical Rules
- CSS Separation: all Tailwind in *.styles.ts, never inline
- No server APIs (output: export)
- Commit only when explicitly asked

## Common Tasks
- Dev server: npm run dev
- Build: npm run build
- Typecheck: npm run typecheck
- Tests: npm run test

## Architecture Notes
- Custom i18n: useTranslations() from @/lib/i18n/context
- Admin state: useReducer + Context, localStorage key jootacee-admin-v1
- All routes under src/app/[locale]/

## File Conventions
- Components: PascalCase.tsx + PascalCase.styles.ts
- Hooks: useCamelCase.ts in src/hooks/
- Types: in src/lib/types.ts or co-located

## Do Not
- Do not use next-intl
- Do not add useEffect for data fetching
- Do not commit .env files`

export default function ResourcesSkillsPage() {
  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Resources / Skills
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Skills &amp; Capabilities.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Claude Code skills (slash commands), settings.json configuration, git hooks integration,
          and per-project CLAUDE.md patterns. Everything you need to supercharge your Claude Code workflow.
        </p>
      </div>

      {/* Skill File Format */}
      <div className="mb-10 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.03] p-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/60">Format Reference</p>
        <h2 className="mb-3 text-lg font-semibold text-white/85">Skill File Format</h2>
        <p className="mb-4 text-sm text-white/45">
          Skills live at <code>.claude/skills/&lt;name&gt;.md</code> — YAML frontmatter declares the name and description;
          the Markdown body becomes the skill&apos;s system prompt when invoked.
        </p>
        <pre className="mb-8 rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-green-400/70 overflow-x-auto" >{skillFileFormatExample}</pre>
      </div>

      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Built-in Skills</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {builtinSkills.map((skill, i) => (
          <ScrollReveal key={skill.command} delay={i * 0.06}>
            <div className="group rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15" >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-mono text-sm font-bold text-primary" >{skill.command}</span>
              </div>
              <p className="text-sm font-semibold text-white">{skill.title}</p>
              <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
              {skill.example && (
                <div className="rounded-lg border border-white/6 bg-black/30 p-3 font-mono text-[10px] text-green-400/60 overflow-x-auto whitespace-pre" >{skill.example}</div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Custom Skill Templates</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {customSkills.map((skill, i) => (
          <ScrollReveal key={skill.command} delay={i * 0.05}>
            <div className="group rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15" >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-mono text-sm font-bold text-primary" >{skill.command}</span>
                {skill.example && <CopyButton text={skill.example} />}
              </div>
              <p className="text-sm font-semibold text-white">{skill.title}</p>
              <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
              {skill.example && (
                <div className="rounded-lg border border-white/6 bg-black/30 p-3 font-mono text-[10px] text-green-400/60 overflow-x-auto whitespace-pre" >{skill.example}</div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* settings.json Guide */}
      <div className="mt-10 rounded-2xl border border-sky-400/15 bg-sky-400/[0.03] p-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-400/60">Configuration Reference</p>
        <h2 className="mb-3 text-lg font-semibold text-white/85">~/.claude/settings.json Schema</h2>
        <p className="mb-4 text-sm text-white/45">
          The <code>settings.json</code> file controls Claude Code permissions, hooks, environment variables,
          and model selection. Place at <code>~/.claude/settings.json</code> for global config or
          <code>.claude/settings.json</code> in your project for project-level overrides.
        </p>
        <div className="mb-6 space-y-3">
          {[
            { field: 'permissions.allow', desc: 'Array of glob patterns for shell commands and file operations Claude can execute without prompting. Use Bash(*), Read(**), Write(src/**) patterns.' },
            { field: 'permissions.deny', desc: 'Array of patterns that are ALWAYS blocked regardless of context. Use for irreversible operations you never want automated.' },
            { field: 'hooks.PreToolUse', desc: 'Shell commands run BEFORE each tool call. Return non-zero exit code to block the tool call. Receives CLAUDE_TOOL_INPUT env var.' },
            { field: 'hooks.PostToolUse', desc: 'Shell commands run AFTER each tool call completes. Great for running typecheck after every Write operation.' },
            { field: 'hooks.Stop', desc: 'Shell commands run when Claude finishes responding. Use for notifications: system alerts, Slack messages, terminal bells.' },
            { field: 'hooks.Notification', desc: 'Shell commands run when Claude sends a notification (e.g., awaiting user input on a long task).' },
            { field: 'env', desc: 'Key-value pairs injected as environment variables into every Claude Code session. Useful for NODE_ENV, log levels, feature flags.' },
            { field: 'apiKeyHelper', desc: 'Shell command that outputs an API key to stdout. Replaces ANTHROPIC_API_KEY env var. Example: use 1Password CLI to fetch the key.' },
            { field: 'model', desc: 'Default model for primary responses. Example: "claude-sonnet-4-6". Can be overridden per-session.' },
            { field: 'smallFastModel', desc: 'Faster/cheaper model used for classification, routing, and quick utility tasks within the same session.' },
          ].map(item => (
            <div key={item.field} className="rounded-lg border border-white/6 bg-black/20 p-3">
              <code className="block mb-1 font-mono text-[10px] text-sky-400/90">{item.field}</code>
              <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-2 mt-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">~/.claude/settings.json</span>
          <CopyButton text={settingsJsonSchema} />
        </div>
        <pre className="mb-8 rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-green-400/70 overflow-x-auto" >{settingsJsonSchema}</pre>
      </div>

      {/* Git Hooks Integration */}
      <div className="mt-10 rounded-2xl border border-orange-400/15 bg-orange-400/[0.03] p-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-orange-400/60">Git Hooks Integration</p>
        <h2 className="mb-3 text-lg font-semibold text-white/85">Wire Claude Code into Git Hooks</h2>
        <p className="mb-4 text-sm text-white/45">
          Run Claude Code skills automatically at key git lifecycle events. Install hooks in
          <code>.git/hooks/</code> (or use Husky for team-wide hooks via <code>.husky/</code>).
        </p>

        <ScrollReveal delay={0.04}>
          <div className="mb-4 rounded-xl border border-white/8 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-orange-400/90">pre-commit</span>
              <span className="rounded-full border border-orange-400/20 bg-orange-400/8 px-2 py-0.5 font-mono text-[9px] text-orange-400/70">Review staged files</span>
              <CopyButton text={preCommitHook} small />
            </div>
            <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
              Runs <code>/review</code> on staged TypeScript files. Blocks commit if critical issues are found.
            </p>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[10.5px] leading-relaxed text-emerald-400/70 border border-white/5" >{preCommitHook}</pre>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="mb-4 rounded-xl border border-white/8 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-orange-400/90">commit-msg</span>
              <span className="rounded-full border border-orange-400/20 bg-orange-400/8 px-2 py-0.5 font-mono text-[9px] text-orange-400/70">Validate commit message quality</span>
              <CopyButton text={commitMsgHook} small />
            </div>
            <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
              Validates that commit messages follow Conventional Commits spec via Claude.
              Blocks commits with poorly-formatted messages.
            </p>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[10.5px] leading-relaxed text-emerald-400/70 border border-white/5" >{commitMsgHook}</pre>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div className="mb-4 rounded-xl border border-white/8 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-orange-400/90">pre-push</span>
              <span className="rounded-full border border-orange-400/20 bg-orange-400/8 px-2 py-0.5 font-mono text-[9px] text-orange-400/70">Security audit before push</span>
              <CopyButton text={prePushHook} small />
            </div>
            <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
              Runs <code>/audit</code> on the full codebase before pushing. Blocks push if HIGH or CRITICAL
              security issues are found.
            </p>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[10.5px] leading-relaxed text-emerald-400/70 border border-white/5" >{prePushHook}</pre>
          </div>
        </ScrollReveal>
      </div>

      {/* CLAUDE.md Best Practices */}
      <div className="mt-10 rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400/60">Best Practices · Template</p>
        <h2 className="mb-3 text-lg font-semibold text-white/85">CLAUDE.md Template</h2>
        <p className="mb-4 text-sm text-white/45">
          Place <code>CLAUDE.md</code> at your project root. Claude Code reads it on every invocation.
          Define stack, rules, common tasks, and architecture decisions here.
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">CLAUDE.md</span>
          <CopyButton text={claudeMdTemplate} />
        </div>
        <pre className="mb-8 rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-green-400/70 overflow-x-auto" >{claudeMdTemplate}</pre>
      </div>

      {/* Per-project CLAUDE.md Patterns */}
      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Per-Project CLAUDE.md Patterns</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {claudeMdPatterns.map((pattern, i) => (
          <ScrollReveal key={pattern.name} delay={i * 0.06}>
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]" >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-white">{pattern.name}</p>
                <CopyButton text={pattern.template} small />
              </div>
              <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{pattern.description}</p>
              <pre className="rounded-lg border border-white/6 bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-green-400/60 overflow-x-auto whitespace-pre max-h-64" >{pattern.template}</pre>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Hermes Capabilities Matrix */}
      <div className="mt-10">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-400/60">Hermes Agent Capabilities Matrix</p>
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="min-w-full text-xs">
            <thead className="bg-white/[0.04]">
              <tr>
                <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">Capability</th>
                <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">Tools Used</th>
                <th className="px-4 py-2.5 text-left font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">Status</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map(row => (
                <tr key={row.capability} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-sm text-white/55">{row.capability}</td>
                  <td className={`px-4 py-2.5 text-sm text-white/55 font-mono text-[10px]`}>{row.tools}</td>
                  <td className="px-4 py-2.5 text-sm text-white/55">
                    <span className={row.active ? "px-2 py-0.5 rounded-full font-mono text-[9px] bg-emerald-400/10 text-emerald-400" : "px-2 py-0.5 rounded-full font-mono text-[9px] bg-white/5 text-white/30"}>
                      {row.active ? '✓ Active' : '○ Configured'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >AI Tool-Use Patterns</p>
      <div className="mt-4 space-y-4">
        {codePatterns.map((pattern) => (
          <ScrollReveal key={pattern.label} delay={0.05}>
            <div className="relative rounded-xl border border-white/8 bg-black/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6 bg-white/[0.02]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{pattern.label}</span>
                <CopyButton text={pattern.code} small />
              </div>
              <pre className="p-4 font-mono text-[11px] leading-relaxed text-green-400/70 overflow-x-auto whitespace-pre" >{pattern.code}</pre>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </DomainLayout>
  )
}
