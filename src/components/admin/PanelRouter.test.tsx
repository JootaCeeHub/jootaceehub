import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// PanelRouter lazy-imports each panel individually — mock each file directly.
// Mocking the barrel './panels' does NOT intercept lazy(() => import('./panels/X'))
vi.mock('./panels/CommandPanel',          () => ({ default: () => <div data-testid="panel-command" /> }))
vi.mock('./panels/SiteCorePanel',         () => ({ default: () => <div data-testid="panel-site-core" /> }))
vi.mock('./panels/SystemsManagerPanel',   () => ({ default: () => <div data-testid="panel-systems" /> }))
vi.mock('./panels/LabsManagerPanel',      () => ({ default: () => <div data-testid="panel-labs" /> }))
vi.mock('./panels/ResearchManagerPanel',  () => ({ default: () => <div data-testid="panel-research" /> }))
vi.mock('./panels/InfraManagerPanel',     () => ({ default: () => <div data-testid="panel-infrastructure" /> }))
vi.mock('./panels/GitHubLayerPanel',      () => ({ default: () => <div data-testid="panel-github" /> }))
vi.mock('./panels/AIAssistantPanel',      () => ({ default: () => <div data-testid="panel-ai" /> }))
vi.mock('./panels/IntegrationsPanel',     () => ({ default: () => <div data-testid="panel-integrations" /> }))
vi.mock('./panels/ShowcasePanel',         () => ({ default: () => <div data-testid="panel-showcase" /> }))
vi.mock('./panels/SEOPanel',              () => ({ default: () => <div data-testid="panel-seo" /> }))
vi.mock('./panels/DesignPanel',           () => ({ default: () => <div data-testid="panel-design" /> }))
vi.mock('./panels/PersonalityPanel',      () => ({ default: () => <div data-testid="panel-personality" /> }))
vi.mock('./panels/AnalyticsPanel',        () => ({ default: () => <div data-testid="panel-analytics" /> }))
vi.mock('./panels/BlocksPanel',           () => ({ default: () => <div data-testid="panel-blocks" /> }))
vi.mock('./panels/ContentPanel',          () => ({ default: () => <div data-testid="panel-content" /> }))
vi.mock('./panels/NavbarConfigPanel',     () => ({ default: () => <div data-testid="panel-navbar-config" /> }))
vi.mock('./panels/FooterConfigPanel',     () => ({ default: () => <div data-testid="panel-footer-config" /> }))
vi.mock('./panels/ProjectsPanel',         () => ({ default: () => <div data-testid="panel-projects" /> }))
vi.mock('./panels/DesignLabPanel',        () => ({ default: () => <div data-testid="panel-design-lab" /> }))
vi.mock('./panels/IntelligenceFeedsPanel',() => ({ default: () => <div data-testid="panel-intelligence" /> }))
vi.mock('./panels/IntakePanel',           () => ({ default: () => <div data-testid="panel-intake" /> }))
vi.mock('./panels/AboutPanel',            () => ({ default: () => <div data-testid="panel-about" /> }))
vi.mock('./panels/PostsManagerPanel',     () => ({ default: () => <div data-testid="panel-posts" /> }))
vi.mock('./panels/ContentEditorPanel',    () => ({ default: () => <div data-testid="panel-content-editor" /> }))
vi.mock('./panels/MediaLibraryPanel',     () => ({ default: () => <div data-testid="panel-media" /> }))
vi.mock('./panels/PagesPanel',            () => ({ default: () => <div data-testid="panel-pages" /> }))
vi.mock('./panels/DesignStudioPanel',     () => ({ default: () => <div data-testid="panel-design-studio" /> }))

let activePanel = 'command'
vi.mock('@/lib/admin/store', () => ({
  useAdmin: () => ({ state: { panel: activePanel } }),
}))

// act(async) flushes: the mounted-state useEffect + Suspense lazy resolution
async function renderRouter(panel: string) {
  activePanel = panel
  await act(async () => {
    render(<PanelRouter />)
  })
}

let PanelRouter: React.ComponentType

describe('PanelRouter', () => {
  beforeAll(async () => {
    const mod = await import('./PanelRouter')
    PanelRouter = mod.default
  })

  it('renders CommandPanel by default', async () => {
    await renderRouter('command')
    expect(screen.getByTestId('panel-command')).toBeInTheDocument()
  })

  it.each([
    ['site-core',      'panel-site-core'],
    ['systems',        'panel-systems'],
    ['labs',           'panel-labs'],
    ['research',       'panel-research'],
    ['infrastructure', 'panel-infrastructure'],
    ['github',         'panel-github'],
    ['seo',            'panel-seo'],
    ['design',         'panel-design'],
    ['personality',    'panel-personality'],
    ['analytics',      'panel-analytics'],
    ['blocks',         'panel-blocks'],
    ['content',        'panel-content'],
    ['intake',         'panel-intake'],
  ])('renders correct panel for "%s"', async (panel, testId) => {
    await renderRouter(panel)
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('falls back to CommandPanel for unknown panel value', async () => {
    await renderRouter('completely-unknown-panel')
    expect(screen.getByTestId('panel-command')).toBeInTheDocument()
  })

  it('renders only one panel at a time', async () => {
    await renderRouter('analytics')
    expect(screen.getByTestId('panel-analytics')).toBeInTheDocument()
    expect(screen.queryByTestId('panel-command')).not.toBeInTheDocument()
  })
})
