'use client'

import { Plus, ArrowRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EntryType, ProjectCategory, ProjectStatus, ResearchCategory, LinkCategory, DriveResourceType, TrackedSourceType, LabStatus, FeedCategory, FeedType, FeedPlan } from '@/lib/admin/types'
import {
  inputCls, textareaCls, selectCls, fieldGroupCls, fieldLabelCls, twoColCls,
  type IntakeForm,
} from './constants'

interface CurrentType {
  label:       string
  color:       string
  targetPanel: string
}

interface Props {
  selectedType: EntryType
  form:         IntakeForm
  set:          <K extends keyof IntakeForm>(k: K, v: IntakeForm[K]) => void
  isValid:      boolean
  handleSubmit: () => void
  currentType:  CurrentType
}

export function FormFields({ selectedType, form, set, isValid, handleSubmit, currentType }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          <Zap className="mr-1 inline-block h-2.5 w-2.5" style={{ color: currentType.color }} />
          {currentType.label}
        </span>
        <span className="font-mono text-[8.5px] text-white/22">→ {currentType.targetPanel}</span>
      </div>

      <div className="space-y-4 p-4">

        {/* Title */}
        <div className={fieldGroupCls}>
          <label className={fieldLabelCls}>
            {selectedType === 'source' ? 'Source name' : 'Title'}
            <span className="ml-0.5 text-rose-400/70"> *</span>
          </label>
          <input
            className={inputCls}
            placeholder={
              selectedType === 'project'          ? 'AI Trading System v3'     :
              selectedType === 'research'         ? 'GraphRAG: A New Approach' :
              selectedType === 'resource'         ? 'LangChain Cookbook'       :
              selectedType === 'drive'            ? 'hermes-agent.md'          :
              selectedType === 'source'           ? 'Anthropic Blog'           :
              selectedType === 'github-showcase'  ? 'my-awesome-repo'          :
              selectedType === 'intel-source'     ? 'Hacker News RSS'          :
                                                    'Lab name'
            }
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>

        {/* URL */}
        {(selectedType === 'resource' || selectedType === 'source' || selectedType === 'github-showcase' || selectedType === 'intel-source') && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>
              URL<span className="ml-0.5 text-rose-400/70"> *</span>
            </label>
            <input
              className={inputCls}
              placeholder={
                selectedType === 'github-showcase' ? 'https://github.com/user/repo' :
                selectedType === 'intel-source'    ? 'https://api.example.com/feed' :
                'https://...'
              }
              value={form.url}
              onChange={e => set('url', e.target.value)}
            />
          </div>
        )}
        {selectedType === 'drive' && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>
              Drive URL<span className="ml-0.5 text-rose-400/70"> *</span>
            </label>
            <input
              className={inputCls}
              placeholder="https://drive.google.com/file/..."
              value={form.driveUrl}
              onChange={e => set('driveUrl', e.target.value)}
            />
          </div>
        )}

        {/* Tagline */}
        {(selectedType === 'project' || selectedType === 'lab') && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>Tagline</label>
            <input
              className={inputCls}
              placeholder="One-liner that captures the essence"
              value={form.tagline}
              onChange={e => set('tagline', e.target.value)}
            />
          </div>
        )}

        {/* Excerpt */}
        {selectedType === 'research' && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>
              Excerpt<span className="ml-0.5 text-rose-400/70"> *</span>
            </label>
            <input
              className={inputCls}
              placeholder="Brief summary shown in article cards"
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
            />
          </div>
        )}

        {/* Description */}
        {selectedType !== 'source' && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>Description</label>
            <textarea
              className={textareaCls}
              rows={3}
              placeholder="Full description..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
        )}

        {/* Category / status row */}
        <div className={twoColCls}>
          {selectedType === 'project' && (
            <>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Category</label>
                <select className={selectCls} value={form.projectCategory} onChange={e => set('projectCategory', e.target.value as ProjectCategory)}>
                  {(['ai','web','automation','infrastructure','tool','research','other'] as ProjectCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Status</label>
                <select className={selectCls} value={form.projectStatus} onChange={e => set('projectStatus', e.target.value as ProjectStatus)}>
                  {(['live','beta','wip','archived'] as ProjectStatus[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
          {selectedType === 'research' && (
            <>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Category</label>
                <select className={selectCls} value={form.researchCategory} onChange={e => set('researchCategory', e.target.value as ResearchCategory)}>
                  {(['opinion','research','essays','news'] as ResearchCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Read time (min)</label>
                <input className={inputCls} type="number" min={1} max={120} value={form.readTime} onChange={e => set('readTime', Math.max(1, parseInt(e.target.value) || 5))} />
              </div>
            </>
          )}
          {selectedType === 'resource' && (
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>Category</label>
              <select className={selectCls} value={form.linkCategory} onChange={e => set('linkCategory', e.target.value as LinkCategory)}>
                {(['tools','articles','repos','videos','docs','agents','automations','other'] as LinkCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {selectedType === 'drive' && (
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>Resource type</label>
              <select className={selectCls} value={form.resourceType} onChange={e => set('resourceType', e.target.value as DriveResourceType)}>
                {(['agent-md','skill-md','automation','mcp-config','prompt','template','dataset','other'] as DriveResourceType[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {selectedType === 'source' && (
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>Source type</label>
              <select className={selectCls} value={form.sourceType} onChange={e => set('sourceType', e.target.value as TrackedSourceType)}>
                {(['newsletter','blog','youtube','podcast','github','twitter','other'] as TrackedSourceType[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {selectedType === 'lab' && (
            <>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Key (slug)</label>
                <input className={inputCls} placeholder="auto-from-title" value={form.labKey} onChange={e => set('labKey', e.target.value)} />
              </div>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Status</label>
                <select className={selectCls} value={form.labStatus} onChange={e => set('labStatus', e.target.value as LabStatus)}>
                  {(['live','beta','rd','roadmap'] as LabStatus[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
          {selectedType === 'intel-source' && (
            <>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Category</label>
                <select className={selectCls} value={form.feedCategory} onChange={e => set('feedCategory', e.target.value as FeedCategory)}>
                  {(['news','tech','finance','research','ai','security','cyber','tool','resource','database','newsletter','video','podcast','other'] as FeedCategory[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Feed type</label>
                <select className={selectCls} value={form.feedType} onChange={e => set('feedType', e.target.value as FeedType)}>
                  {(['rss','api','websocket','relay'] as FeedType[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Project extras */}
        {selectedType === 'project' && (
          <>
            <div className={twoColCls}>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Repo URL</label>
                <input className={inputCls} placeholder="https://github.com/..." value={form.repoUrl} onChange={e => set('repoUrl', e.target.value)} />
              </div>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Live URL</label>
                <input className={inputCls} placeholder="https://..." value={form.liveUrl} onChange={e => set('liveUrl', e.target.value)} />
              </div>
            </div>
            <div className={twoColCls}>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>
                  Tech stack
                  <span className="normal-case font-mono text-[8px] text-white/22 tracking-normal"> · comma-separated</span>
                </label>
                <input className={inputCls} placeholder="Next.js, Python, PostgreSQL" value={form.techStack} onChange={e => set('techStack', e.target.value)} />
              </div>
              <div className={fieldGroupCls}>
                <label className={fieldLabelCls}>Accent color</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-white/10 bg-transparent p-0.5" value={form.accent} onChange={e => set('accent', e.target.value)} />
                  <span className="font-mono text-[10.5px] text-white/50">{form.accent}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Research extras */}
        {selectedType === 'research' && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>External URL</label>
            <input className={inputCls} placeholder="https://... (leave empty for internal)" value={form.externalUrl} onChange={e => set('externalUrl', e.target.value)} />
          </div>
        )}

        {/* Lab extras */}
        {selectedType === 'lab' && (
          <div className={twoColCls}>
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>
                Stack
                <span className="normal-case font-mono text-[8px] text-white/22 tracking-normal"> · comma-separated</span>
              </label>
              <input className={inputCls} placeholder="React, FastAPI, Redis" value={form.stack} onChange={e => set('stack', e.target.value)} />
            </div>
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>Accent color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-white/10 bg-transparent p-0.5" value={form.labAccent} onChange={e => set('labAccent', e.target.value)} />
                <span className="font-mono text-[10.5px] text-white/50">{form.labAccent}</span>
              </div>
            </div>
          </div>
        )}

        {/* Intel source extras */}
        {selectedType === 'intel-source' && (
          <div className={twoColCls}>
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>Plan</label>
              <select className={selectCls} value={form.feedPlan} onChange={e => set('feedPlan', e.target.value as FeedPlan)}>
                {(['free','freemium','paid'] as FeedPlan[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={fieldGroupCls}>
              <label className={fieldLabelCls}>Icon (emoji)</label>
              <input className={inputCls} placeholder="📡" value={form.feedIcon} onChange={e => set('feedIcon', e.target.value)} />
            </div>
          </div>
        )}

        {/* Tags */}
        {selectedType !== 'source' && (
          <div className={fieldGroupCls}>
            <label className={fieldLabelCls}>
              Tags
              <span className="normal-case font-mono text-[8px] text-white/22 tracking-normal"> · comma-separated</span>
            </label>
            <input className={inputCls} placeholder="ai, automation, nextjs" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
        )}

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          {selectedType !== 'source' && selectedType !== 'github-showcase' && selectedType !== 'intel-source' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 cursor-pointer accent-violet-400" checked={form.published} onChange={e => set('published', e.target.checked)} />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">Published</span>
            </label>
          )}
          {(selectedType === 'project' || selectedType === 'research' || selectedType === 'resource') && (
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 cursor-pointer accent-violet-400" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">Featured</span>
            </label>
          )}
          {selectedType === 'source' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 cursor-pointer accent-violet-400" checked={form.active} onChange={e => set('active', e.target.checked)} />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">Active</span>
            </label>
          )}
          {selectedType === 'lab' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 cursor-pointer accent-violet-400" checked={form.labVisible} onChange={e => set('labVisible', e.target.checked)} />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/45">Visible</span>
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={cn(
            'mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all',
            isValid
              ? 'cursor-pointer text-white/70 hover:text-white/90 hover:shadow-sm'
              : 'cursor-not-allowed border-white/6 bg-white/[0.02] text-white/20'
          )}
          style={isValid ? { background: `${currentType.color}12`, borderColor: `${currentType.color}28` } : {}}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add {currentType.label}</span>
          <ArrowRight className="h-3 w-3 opacity-50" />
          <span className="ml-auto font-mono text-[8.5px] text-white/30">→ {currentType.targetPanel}</span>
        </button>

      </div>
    </div>
  )
}
