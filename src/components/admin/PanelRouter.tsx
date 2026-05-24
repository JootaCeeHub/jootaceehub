'use client'

import { useAdmin } from '@/lib/admin/store'
import {
  DashboardPanel,
  ConfigPanel,
  BlocksPanel,
  NavbarPanel,
  DesignPanel,
  PersonalityPanel,
  ResultsPanel,
} from './panels'

export default function PanelRouter() {
  const { state } = useAdmin()

  switch (state.panel) {
    case 'dashboard':
      return <DashboardPanel />
    case 'config':
      return <ConfigPanel />
    case 'blocks':
      return <BlocksPanel />
    case 'navbar':
      return <NavbarPanel />
    case 'design':
      return <DesignPanel />
    case 'personality':
      return <PersonalityPanel />
    case 'results':
      return <ResultsPanel />
    default:
      return <DashboardPanel />
  }
}
