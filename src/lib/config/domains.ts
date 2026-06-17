export interface DomainChild {
  key: string
  label: string
  href: string
  description: string
}

export interface DomainItem {
  key: string
  label: string
  href: string
  description: string
  children?: DomainChild[]
  /** Landing-page hash anchor (scroll behavior on home) */
  anchor?: string
}

export const domains: DomainItem[] = [
  {
    key: 'projects',
    label: 'Projects',
    href: '/projects',
    description: 'Engineering portfolio',
    anchor: '#labs',
    children: [
      { key: 'aura',          label: 'AURA',          href: '/labs/aura',          description: 'AI orchestration core platform'    },
      { key: 'trading-ai',    label: 'Trading AI',    href: '/labs/trading-ai',    description: 'Quantitative intelligence engine'  },
      { key: 'crm',           label: 'CRM Platform',  href: '/labs/crm',           description: 'Intelligent customer intelligence' },
      { key: 'erp',           label: 'ERP Platform',  href: '/labs/erp',           description: 'Autonomous operations system'      },
      { key: 'stl-generator', label: 'STL Generator', href: '/labs/stl-generator', description: 'Spatial AI fabrication tool'       },
    ],
  },
  {
    key: 'research',
    label: 'Research',
    href: '/research',
    description: 'Technical writing & analysis',
  },
  {
    key: 'resources',
    label: 'Resources',
    href: '/resources',
    description: 'Curated tools, repos & links',
    children: [
      { key: 'tools',      label: 'Tools',       href: '/resources/tools',       description: 'Curated developer tools'        },
      { key: 'repos',      label: 'Repos',       href: '/resources/repos',       description: 'Useful open-source repos'       },
      { key: 'workflows',  label: 'Workflows',   href: '/resources/workflows',   description: 'Automations & templates'        },
      { key: 'prompts',    label: 'Prompts',     href: '/resources/prompts',     description: 'AI prompts & system guides'     },
      { key: 'mcp',        label: 'MCP Servers', href: '/resources/mcp',         description: 'Model Context Protocol servers' },
      { key: 'agents',     label: 'AI Agents',   href: '/resources/agents',      description: 'Agent architectures & templates' },
      { key: 'skills',     label: 'Skills',      href: '/resources/skills',      description: 'Claude Code skills & AI tools' },
    ],
  },
  {
    key: 'intelligence',
    label: 'Intelligence',
    href: '/intelligence',
    description: 'Live feeds & signal monitoring',
  },
  {
    key: 'github',
    label: 'GitHub',
    href: '/github',
    description: 'Open source & code',
    anchor: '#github',
  },
  {
    key: 'about',
    label: 'About',
    href: '/about',
    description: 'Background & approach',
    anchor: '#about',
  },
]

/** Map a pathname segment to its domain config entry */
export function getDomainByKey(key: string): DomainItem | undefined {
  return domains.find((d) => d.key === key)
}

export interface BreadcrumbCrumb {
  key: string
  label: string
  href: string
}

/** Resolve breadcrumb from a locale-stripped pathname like /projects/aura */
export function resolveBreadcrumb(localelessPath: string): BreadcrumbCrumb[] {
  const parts = localelessPath.split('/').filter(Boolean)
  const crumbs: BreadcrumbCrumb[] = [{ key: 'home', label: 'Home', href: '/' }]

  let accumulated = ''
  for (const part of parts) {
    accumulated += `/${part}`
    const domain = domains.find((d) => d.href === `/${parts[0]}`)
    if (!domain) break

    if (part === parts[0]) {
      crumbs.push({ key: domain.key, label: domain.label, href: domain.href })
    } else {
      const child = domain.children?.find((c) => c.href === accumulated)
      if (child) crumbs.push({ key: child.key, label: child.label, href: child.href })
    }
  }
  return crumbs
}
