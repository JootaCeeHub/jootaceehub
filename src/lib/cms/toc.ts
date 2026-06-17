export interface TocItem {
  id: string
  level: 2 | 3 | 4
  text: string
}

// ── Heading slug ───────────────────────────────────────────────────────────
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')    // strip accent combining chars
    .replace(/[^\w\s-]/g, '')           // strip remaining special chars
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')            // trim leading / trailing hyphens
}

// ── Parse headings from markdown string ────────────────────────────────────
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const seen: Record<string, number> = {}
  let inCodeBlock = false

  for (const line of markdown.split('\n')) {
    // Track fenced code block boundaries
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = line.match(/^(#{2,4})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length as 2 | 3 | 4
    // Strip inline markdown (bold, italic, code, links)
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .trim()

    let id = slugifyHeading(text)
    // Deduplicate: same heading text → append counter
    if (seen[id] !== undefined) {
      seen[id]++
      id = `${id}-${seen[id]}`
    } else {
      seen[id] = 0
    }

    items.push({ id, level, text })
  }

  return items
}

// ── Inject id attributes into rendered HTML ────────────────────────────────
// Called on the HTML string produced by react-md-editor's preview.
// Skips headings that already carry an `id` attribute.
export function injectHeadingIds(html: string): string {
  const seen: Record<string, number> = {}
  return html.replace(/<(h[234])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs, inner) => {
    // Don't double-inject
    if (/\bid\s*=/.test(attrs)) return `<${tag}${attrs}>${inner}</${tag}>`

    const text = inner.replace(/<[^>]+>/g, '').trim()
    let id = slugifyHeading(text)
    if (seen[id] !== undefined) { seen[id]++; id = `${id}-${seen[id]}` }
    else seen[id] = 0
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
  })
}
