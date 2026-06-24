'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useJobQueue } from '@/hooks/useJobQueue'
import {
  validateProject,
  validateResearch,
  validateLab,
  validateSystem,
} from '@/lib/cms/validation'
import type { RevisionContentType, ProjectEntry, ResearchEntry } from '@/lib/admin/types'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  GitBranch,
  GitCommit,
  Eye,
  Send,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WizardStep = 'validate' | 'preview' | 'commit' | 'done'

export interface PublishTarget {
  contentType: RevisionContentType
  contentId: string
  contentSlug: string
  label: string
}

interface Props {
  target: PublishTarget
  onClose: () => void
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'validate', label: 'Validate' },
  { key: 'preview',  label: 'Preview'  },
  { key: 'commit',   label: 'Commit'   },
  { key: 'done',     label: 'Done'     },
]

function StepIndicator({ current }: { current: WizardStep }) {
  const idx = STEPS.findIndex(s => s.key === current)
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border',
              i < idx  && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
              i === idx && 'bg-cyan-500/20 border-cyan-400 text-cyan-300',
              i > idx  && 'bg-white/5 border-white/20 text-white/30',
            )}
          >
            {i < idx ? '✓' : i + 1}
          </div>
          <span className={cn(
            'text-xs',
            i === idx ? 'text-white/80' : 'text-white/30',
          )}>{s.label}</span>
          {i < STEPS.length - 1 && <ChevronRight size={12} className="text-white/20" />}
        </div>
      ))}
    </div>
  )
}

// ─── Step: Validate ───────────────────────────────────────────────────────────

function ValidateStep({
  target,
  state,
  onNext,
}: {
  target: PublishTarget
  state: ReturnType<typeof useAdmin>['state']
  onNext: () => void
}) {
  const item = getItem(state, target)
  const result = item ? runValidation(target.contentType, item) : { valid: false, errors: [{ field: 'item', message: 'Item not found in registry' }] }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Checking <span className="text-white font-mono">{target.contentSlug}</span> before publishing…
      </p>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
        {result.valid ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">All checks passed</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400">
              <XCircle size={16} />
              <span className="text-sm font-medium">{result.errors.length} issue{result.errors.length !== 1 ? 's' : ''} found</span>
            </div>
            {result.errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-rose-300/80 ml-6">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span><span className="font-mono text-rose-300">{e.field}</span>: {e.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {result.valid ? (
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-colors"
          >
            Continue to Preview
          </button>
        ) : (
          <p className="text-xs text-white/40 self-center">Fix the issues above before publishing.</p>
        )}
      </div>
    </div>
  )
}

// ─── Step: Preview ────────────────────────────────────────────────────────────

function PreviewStep({
  target,
  state,
  onNext,
  onBack,
}: {
  target: PublishTarget
  state: ReturnType<typeof useAdmin>['state']
  onNext: () => void
  onBack: () => void
}) {
  const item = getItem(state, target)

  const fields: { label: string; value: string }[] = item
    ? Object.entries(item)
        .filter(([k]) => ['title', 'slug', 'status', 'cmsStatus', 'tags', 'category', 'description', 'excerpt', 'techStack'].includes(k))
        .map(([k, v]) => ({
          label: k,
          value: Array.isArray(v) ? (v as string[]).join(', ') : String(v ?? '—'),
        }))
    : []

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">Review content before committing.</p>

      <div className="rounded-lg border border-white/10 bg-white/5 divide-y divide-white/5 text-xs max-h-64 overflow-y-auto">
        {fields.map(f => (
          <div key={f.label} className="flex px-3 py-2 gap-3">
            <span className="text-white/40 font-mono w-28 shrink-0">{f.label}</span>
            <span className="text-white/80 break-all">{f.value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-colors"
        >
          <Eye size={14} />
          Looks good — Continue
        </button>
      </div>
    </div>
  )
}

// ─── Step: Commit ─────────────────────────────────────────────────────────────

function CommitStep({
  target,
  onDone,
  onBack,
}: {
  target: PublishTarget
  onDone: (jobId: string) => void
  onBack: () => void
}) {
  const { state, dispatch } = useAdmin()
  const { addJob } = useJobQueue()
  const [mode, setMode] = useState<'direct' | 'branch'>('direct')
  const [branchName, setBranchName] = useState(`publish/${target.contentSlug}`)
  const [commitMsg, setCommitMsg] = useState(`feat: publish ${target.contentType} "${target.contentSlug}"`)
  const [loading, setLoading] = useState(false)

  const handlePublish = useCallback(() => {
    setLoading(true)

    // Dispatch CMS status update
    if (target.contentType === 'project') {
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: target.contentId, data: { cmsStatus: 'published', published: true, publishedAt: new Date().toISOString() } } })
    } else if (target.contentType === 'research') {
      dispatch({ type: 'UPDATE_RESEARCH_ENTRY', payload: { slug: target.contentSlug, data: { cmsStatus: 'published', published: true, publishedAt: new Date().toISOString() } } })
    }

    // Log audit entry
    const prevItem = getItem(state, target)
    dispatch({
      type: 'LOG_AUDIT',
      payload: {
        action: 'publish',
        contentType: target.contentType,
        contentId: target.contentId,
        contentSlug: target.contentSlug,
        previousStatus: (prevItem as { cmsStatus?: string })?.cmsStatus as never ?? 'draft',
        newStatus: 'published',
        metadata: { mode, commitMessage: commitMsg, branch: mode === 'branch' ? branchName : 'main' },
      },
    })

    // Enqueue a commit job
    addJob({
      type: 'git-commit',
      label: commitMsg,
      status: 'pending',
      payload: {
        message: commitMsg,
        branch: mode === 'branch' ? branchName : 'main',
        contentType: target.contentType,
        contentId: target.contentId,
        contentSlug: target.contentSlug,
        mode,
      },
    })

    // If mode is branch, also enqueue a push job
    if (mode === 'branch') {
      addJob({
        type: 'git-push',
        label: `Push branch ${branchName}`,
        status: 'pending',
        payload: { branch: branchName },
      })
    }

    // Small delay to show loading, then move to done
    setTimeout(() => {
      setLoading(false)
      onDone('queued')
    }, 600)
  }, [mode, branchName, commitMsg, target, dispatch, state, addJob, onDone])

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">Choose how to commit this publish action.</p>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(['direct', 'branch'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors',
              mode === m
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70',
            )}
          >
            {m === 'direct' ? <GitCommit size={12} /> : <GitBranch size={12} />}
            {m === 'direct' ? 'Direct to main' : 'Create branch + PR'}
          </button>
        ))}
      </div>

      {/* Branch name (only for branch mode) */}
      {mode === 'branch' && (
        <div className="space-y-1">
          <label className="text-xs text-white/50">Branch name</label>
          <input
            value={branchName}
            onChange={e => setBranchName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-mono focus:outline-none focus:border-cyan-500/40"
            placeholder="publish/my-slug"
          />
        </div>
      )}

      {/* Commit message */}
      <div className="space-y-1">
        <label className="text-xs text-white/50">Commit message</label>
        <input
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-cyan-500/40"
          placeholder="feat: publish ..."
        />
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Back
        </button>
        <button
          onClick={handlePublish}
          disabled={loading || !commitMsg.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  )
}

// ─── Step: Done ───────────────────────────────────────────────────────────────

function DoneStep({ target, onClose }: { target: PublishTarget; onClose: () => void }) {
  return (
    <div className="space-y-4 text-center py-4">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle size={28} className="text-emerald-400" />
        </div>
      </div>
      <div>
        <p className="text-white font-medium">Published!</p>
        <p className="text-sm text-white/50 mt-1">
          <span className="font-mono text-white/70">{target.contentSlug}</span> is now live.
          A commit job has been queued — check the Job Queue panel for status.
        </p>
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white/70 text-sm hover:bg-white/15 transition-colors"
      >
        Close
      </button>
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function PublishWizard({ target, onClose }: Props) {
  const { state } = useAdmin()
  const [step, setStep] = useState<WizardStep>('validate')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0d0d1a] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Publish Wizard</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-lg leading-none">✕</button>
        </div>

        <StepIndicator current={step} />

        {step === 'validate' && (
          <ValidateStep
            target={target}
            state={state}
            onNext={() => setStep('preview')}
          />
        )}
        {step === 'preview' && (
          <PreviewStep
            target={target}
            state={state}
            onNext={() => setStep('commit')}
            onBack={() => setStep('validate')}
          />
        )}
        {step === 'commit' && (
          <CommitStep
            target={target}
            onDone={() => setStep('done')}
            onBack={() => setStep('preview')}
          />
        )}
        {step === 'done' && (
          <DoneStep target={target} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getItem(
  state: ReturnType<typeof useAdmin>['state'],
  target: PublishTarget,
): Record<string, unknown> | null {
  if (target.contentType === 'project') {
    const found = (state.projectsRegistry ?? []).find(p => p.id === target.contentId)
    return found ? (found as unknown as Record<string, unknown>) : null
  }
  if (target.contentType === 'research') {
    const found = (state.researchRegistry ?? []).find(r => r.slug === target.contentSlug)
    return found ? (found as unknown as Record<string, unknown>) : null
  }
  if (target.contentType === 'lab') {
    const found = (state.labsRegistry ?? []).find(l => l.key === target.contentId)
    return found ? (found as unknown as Record<string, unknown>) : null
  }
  if (target.contentType === 'system') {
    const found = (state.systemsRegistry ?? []).find(s => s.key === target.contentId)
    return found ? (found as unknown as Record<string, unknown>) : null
  }
  return null
}

function runValidation(type: RevisionContentType, item: Record<string, unknown>) {
  if (type === 'project') return validateProject(item as unknown as ProjectEntry)
  if (type === 'research') return validateResearch(item as unknown as ResearchEntry)
  if (type === 'lab') return validateLab(item)
  if (type === 'system') return validateSystem(item)
  return { valid: true, errors: [] }
}
