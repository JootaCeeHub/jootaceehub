import type { DataSource, SourceType, SourceStatus, GitHubRepo } from '@/lib/admin/types'

const TEXT_EXTS = new Set(['.md', '.mdx', '.txt', '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml', '.csv', '.env.example', '.toml', '.sh', '.py', '.go', '.rs', '.sql', '.html', '.css', '.scss'])
const MAX_CONTENT_BYTES = 80_000

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function truncate(str: string, max = MAX_CONTENT_BYTES): string {
  if (str.length <= max) return str
  return str.slice(0, max) + '\n\n[... content truncated ...]'
}

function ext(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot) : ''
}

// ─── GitHub Repo Source ───────────────────────────────────────────────────────

interface GHReadme {
  content: string
  encoding: string
}

interface GHTree {
  tree: Array<{ path: string; type: string; size?: number }>
  truncated: boolean
}

interface GHContents {
  content: string
  encoding: string
}

async function ghFetch<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  if (!res.ok) return null
  return res.json() as Promise<T>
}

export async function fetchGitHubRepoSource(
  repo: GitHubRepo,
  token: string
): Promise<DataSource> {
  const base: DataSource = {
    id: uid(),
    type: 'github-repo',
    name: repo.name,
    description: repo.description || repo.fullName,
    url: repo.url,
    content: '',
    fileTree: [],
    metadata: {
      fullName: repo.fullName,
      language: repo.language,
      stars: repo.stars,
      isPrivate: repo.isPrivate,
      updatedAt: repo.updatedAt,
    },
    status: 'indexing',
    addedAt: new Date().toISOString(),
    byteSize: 0,
  }

  try {
    const [owner, repoName] = repo.fullName.split('/')
    const sections: string[] = [`# ${repo.name}\n${repo.description || ''}\n`]

    // 1. README
    const readme = await ghFetch<GHReadme>(`/repos/${owner}/${repoName}/readme`, token)
    if (readme?.content) {
      const decoded = atob(readme.content.replace(/\n/g, ''))
      sections.push(`## README\n${decoded}`)
    }

    // 2. File tree
    const tree = await ghFetch<GHTree>(`/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`, token)
    const paths = (tree?.tree ?? [])
      .filter((f) => f.type === 'blob')
      .map((f) => f.path)
    base.fileTree = paths.slice(0, 500)

    const treeText = base.fileTree.slice(0, 120).join('\n')
    sections.push(`## File Structure\n\`\`\`\n${treeText}${base.fileTree.length > 120 ? `\n... and ${base.fileTree.length - 120} more files` : ''}\n\`\`\``)

    // 3. Key files: package.json, pyproject.toml, Cargo.toml, go.mod, README alternatives
    const keyFiles = ['package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'requirements.txt', 'docker-compose.yml', '.env.example']
    for (const file of keyFiles) {
      if (paths.includes(file)) {
        const data = await ghFetch<GHContents>(`/repos/${owner}/${repoName}/contents/${file}`, token)
        if (data?.content) {
          try {
            const decoded = atob(data.content.replace(/\n/g, ''))
            sections.push(`## ${file}\n\`\`\`\n${decoded.slice(0, 3000)}\n\`\`\``)
          } catch {
            // skip undecodable
          }
        }
      }
    }

    // 4. Fetch important source files (first 5 text files that aren't node_modules/dist)
    const sourcePaths = paths
      .filter((p) => !p.startsWith('node_modules/') && !p.startsWith('dist/') && !p.startsWith('.next/') && TEXT_EXTS.has(ext(p)) && !keyFiles.includes(p))
      .slice(0, 5)

    for (const filePath of sourcePaths) {
      const data = await ghFetch<GHContents>(`/repos/${owner}/${repoName}/contents/${filePath}`, token)
      if (data?.content) {
        try {
          const decoded = atob(data.content.replace(/\n/g, ''))
          if (decoded.length < 5000) {
            sections.push(`## ${filePath}\n\`\`\`\n${decoded}\n\`\`\``)
          }
        } catch {
          // skip
        }
      }
    }

    const fullContent = sections.join('\n\n')
    return {
      ...base,
      content: truncate(fullContent),
      byteSize: fullContent.length,
      status: 'ready',
    }
  } catch (err) {
    return {
      ...base,
      status: 'error',
      error: err instanceof Error ? err.message : 'Failed to fetch repo',
    }
  }
}

// ─── File Source ──────────────────────────────────────────────────────────────

export async function readFileSource(file: File): Promise<DataSource> {
  const fileExt = ext(file.name)
  const isText = TEXT_EXTS.has(fileExt) || file.type.startsWith('text/')
  const isZip = file.name.endsWith('.zip') || file.type === 'application/zip'

  const base: DataSource = {
    id: uid(),
    type: isZip ? 'archive' : 'file',
    name: file.name,
    description: `${isZip ? 'Archive' : 'File'} — ${(file.size / 1024).toFixed(1)} KB`,
    content: '',
    fileTree: [],
    metadata: {
      mimeType: file.type || 'application/octet-stream',
      extension: fileExt,
      size: file.size,
    },
    status: 'indexing',
    addedAt: new Date().toISOString(),
    byteSize: file.size,
  }

  try {
    if (isZip) {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(file)
      const entries: string[] = []
      const textParts: string[] = [`# Archive: ${file.name}\n`]

      zip.forEach((relativePath, zipEntry) => {
        entries.push(relativePath)
        return zipEntry
      })

      base.fileTree = entries.slice(0, 500)
      textParts.push(`## Contents (${entries.length} files)\n\`\`\`\n${entries.slice(0, 150).join('\n')}\n\`\`\``)

      // Extract text files inside the ZIP
      const textEntries = entries
        .filter((p) => TEXT_EXTS.has(ext(p)) && !p.includes('node_modules/') && !p.includes('dist/'))
        .slice(0, 8)

      for (const entryPath of textEntries) {
        const zipFile = zip.file(entryPath)
        if (!zipFile) continue
        try {
          const text = await zipFile.async('string')
          if (text.length < 6000) {
            textParts.push(`## ${entryPath}\n\`\`\`\n${text}\n\`\`\``)
          }
        } catch {
          // skip binary
        }
      }

      const content = textParts.join('\n\n')
      return { ...base, content: truncate(content), fileTree: entries, status: 'ready' }
    }

    if (isText) {
      const text = await file.text()
      const content = `# ${file.name}\n\n\`\`\`${fileExt.slice(1)}\n${text}\n\`\`\``
      return { ...base, content: truncate(content), status: 'ready' }
    }

    // Binary file — store metadata only
    return {
      ...base,
      type: 'file',
      content: `# ${file.name}\n\nBinary file (${file.type}). Size: ${(file.size / 1024).toFixed(1)} KB`,
      status: 'ready',
    }
  } catch (err) {
    return { ...base, status: 'error', error: err instanceof Error ? err.message : 'Read failed' }
  }
}

// ─── Folder Source ────────────────────────────────────────────────────────────

export async function readFolderSource(files: FileList): Promise<DataSource> {
  const allFiles = Array.from(files)
  const folderName = allFiles[0]?.webkitRelativePath?.split('/')[0] ?? 'folder'

  const base: DataSource = {
    id: uid(),
    type: 'folder',
    name: folderName,
    description: `${allFiles.length} files`,
    content: '',
    fileTree: [],
    metadata: { fileCount: allFiles.length },
    status: 'indexing',
    addedAt: new Date().toISOString(),
    byteSize: allFiles.reduce((acc, f) => acc + f.size, 0),
  }

  try {
    const paths = allFiles.map((f) => f.webkitRelativePath || f.name)
    base.fileTree = paths.slice(0, 500)

    const sections: string[] = [`# Folder: ${folderName}\n${allFiles.length} files total\n`]
    sections.push(`## File Structure\n\`\`\`\n${paths.slice(0, 100).join('\n')}\n\`\`\``)

    const textFiles = allFiles
      .filter((f) => TEXT_EXTS.has(ext(f.name)) && !f.webkitRelativePath.includes('node_modules/') && !f.webkitRelativePath.includes('dist/') && f.size < 20000)
      .slice(0, 10)

    for (const file of textFiles) {
      const text = await file.text()
      sections.push(`## ${file.webkitRelativePath || file.name}\n\`\`\`\n${text.slice(0, 3000)}\n\`\`\``)
    }

    const content = sections.join('\n\n')
    return { ...base, content: truncate(content), status: 'ready' }
  } catch (err) {
    return { ...base, status: 'error', error: err instanceof Error ? err.message : 'Read failed' }
  }
}

// ─── URL Source ───────────────────────────────────────────────────────────────

export async function fetchUrlSource(url: string): Promise<DataSource> {
  const parsedUrl = new URL(url)
  const name = parsedUrl.hostname + parsedUrl.pathname

  const base: DataSource = {
    id: uid(),
    type: 'url',
    name,
    description: url,
    url,
    content: '',
    fileTree: [],
    metadata: { hostname: parsedUrl.hostname, protocol: parsedUrl.protocol },
    status: 'indexing',
    addedAt: new Date().toISOString(),
    byteSize: 0,
  }

  try {
    const res = await fetch(url, { mode: 'cors', signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    // Strip HTML tags for cleaner content
    const stripped = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    return {
      ...base,
      content: truncate(`# ${url}\n\n${stripped}`),
      byteSize: text.length,
      status: 'ready',
    }
  } catch (err) {
    // CORS likely blocked — store as reference only
    const message = err instanceof Error ? err.message : 'Fetch failed'
    const isCors = message.includes('Failed to fetch') || message.includes('NetworkError')
    return {
      ...base,
      content: `# ${url}\n\nURL reference. ${isCors ? 'CORS blocked direct fetch — content not available in browser. Use this source as a reference link for the AI assistant.' : message}`,
      status: isCors ? 'ready' : 'error',
      error: isCors ? undefined : message,
      byteSize: 0,
    }
  }
}

// ─── Database Source ──────────────────────────────────────────────────────────

export function createDatabaseSource(name: string, connectionString: string): DataSource {
  const proto = connectionString.split('://')[0] ?? 'unknown'
  return {
    id: uid(),
    type: 'database',
    name: name || proto,
    description: connectionString.replace(/:[^:@]+@/, ':***@'),
    url: connectionString,
    content: `# Database: ${name || proto}\n\nConnection string stored as reference.\nProtocol: ${proto}\n\nUse the AI assistant to query schema information or generate SQL.`,
    fileTree: [],
    metadata: { protocol: proto },
    status: 'ready',
    addedAt: new Date().toISOString(),
    byteSize: 0,
  }
}

// ─── Source type helpers ──────────────────────────────────────────────────────

export const SOURCE_TYPE_META: Record<SourceType, { label: string; color: string; accent: string }> = {
  'github-repo': { label: 'GitHub Repo',  color: 'text-violet-400',  accent: '#a78bfa' },
  'file':        { label: 'File',          color: 'text-sky-400',     accent: '#38bdf8' },
  'url':         { label: 'URL',           color: 'text-amber-400',   accent: '#fbbf24' },
  'database':    { label: 'Database',      color: 'text-emerald-400', accent: '#34d399' },
  'archive':     { label: 'Archive',       color: 'text-orange-400',  accent: '#fb923c' },
  'folder':      { label: 'Folder',        color: 'text-cyan-400',    accent: '#22d3ee' },
}

export const STATUS_META: Record<SourceStatus, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'text-white/30' },
  indexing: { label: 'Indexing', color: 'text-amber-400' },
  ready:    { label: 'Ready',    color: 'text-emerald-400' },
  error:    { label: 'Error',    color: 'text-red-400' },
}
