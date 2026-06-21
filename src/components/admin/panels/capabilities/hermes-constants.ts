import type { HermesBackend, PlatformId } from '@/lib/admin/types'

export type TestStatus = 'idle' | 'testing' | 'success' | 'error'

export const BACKENDS: { id: HermesBackend; label: string; desc: string; cmd: string }[] = [
  { id: 'local',       label: 'Local',       desc: 'Python process',  cmd: 'pip install hermes-agent && hermes start' },
  { id: 'docker',      label: 'Docker',      desc: 'Container',       cmd: 'docker run -p 8000:8000 nousresearch/hermes-agent' },
  { id: 'ssh',         label: 'SSH',         desc: 'Remote host',     cmd: 'hermes start --ssh user@host' },
  { id: 'singularity', label: 'Singularity', desc: 'HPC container',   cmd: 'singularity run hermes-agent.sif' },
  { id: 'modal',       label: 'Modal',       desc: 'Serverless',      cmd: 'modal deploy hermes_agent.py' },
  { id: 'daytona',     label: 'Daytona',     desc: 'Dev env',         cmd: 'daytona create hermes-workspace' },
  { id: 'vercel',      label: 'Vercel',      desc: 'Edge function',   cmd: 'vercel deploy --prod' },
]

export const PROVIDERS = ['openrouter', 'nous-portal', 'openai', 'anthropic', 'ollama', 'novitaai', 'nvidia-nim', 'custom']

export const MODEL_PRESETS: Record<string, string[]> = {
  openrouter: [
    'nousresearch/hermes-3-llama-3.1-70b',
    'nousresearch/hermes-3-llama-3.1-405b',
    'meta-llama/llama-3.1-70b-instruct',
    'anthropic/claude-3.5-sonnet',
  ],
  openai:    ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
  anthropic: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  ollama:    ['llama3.2', 'qwen2.5:72b', 'mistral', 'phi4'],
}

export const PLATFORM_META: Record<PlatformId, { label: string; emoji: string; color: string }> = {
  telegram: { label: 'Telegram', emoji: '✈', color: '#229ED9' },
  discord:  { label: 'Discord',  emoji: '◉', color: '#5865F2' },
  slack:    { label: 'Slack',    emoji: '#', color: '#4A154B' },
  whatsapp: { label: 'WhatsApp', emoji: '◎', color: '#25D366' },
  signal:   { label: 'Signal',   emoji: '⊕', color: '#3A76F0' },
  email:    { label: 'Email',    emoji: '@', color: '#EA4335' },
}

export const CRON_DELIVERY_PLATFORMS = ['cli', 'telegram', 'discord', 'slack', 'whatsapp', 'signal', 'email']

export function generateId(): string {
  return crypto.randomUUID()
}
