/**
 * Post-build HTML beautifier.
 *
 * Runs after `next build` to format every .html file in dist/ so that
 * view-source shows clean, readable, well-indented markup — matching
 * the quality of hand-crafted HTML sites.
 *
 * Run: node scripts/beautify-html.mjs
 * Auto-run: wired into the `postbuild` npm script.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import pkg from 'js-beautify'
const { html_beautify } = pkg

const DIST_DIR = join(process.cwd(), 'dist')

const OPTIONS = {
  indent_size: 2,
  indent_char: ' ',
  max_preserve_newlines: 1,
  preserve_newlines: true,
  wrap_line_length: 0,           // no forced line wrapping
  end_with_newline: true,

  // Head: keep each meta/link on its own line
  extra_liners: ['head', 'body', '/html'],
  // content_unformatted: preserve the CONTENT of script/style blocks (JSON-LD, inline CSS)
  // but still format each tag on its own line
  unformatted: [],
  content_unformatted: ['script', 'style', 'pre', 'textarea'],
  indent_scripts: 'normal',

  // Void elements: self-closing tags stay compact
  void_elements: [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
  ],

  templating: ['none'],
  indent_handlebars: false,
  wrap_attributes: 'aligned-multiple',
  wrap_attributes_min_attrs: 3,    // wrap attr when >= 3 attrs on one element
  wrap_attributes_indent_size: 2,
}

let processed = 0
let skipped = 0

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (extname(entry) === '.html') {
      const raw = readFileSync(full, 'utf8')
      const formatted = html_beautify(raw, OPTIONS)
      if (formatted !== raw) {
        writeFileSync(full, formatted, 'utf8')
        processed++
      } else {
        skipped++
      }
    }
  }
}

try {
  walk(DIST_DIR)
  console.log(`✓ HTML beautified: ${processed} files formatted, ${skipped} already clean`)
} catch (err) {
  // Non-fatal: beautifier failure should not break the build pipeline
  console.warn(`⚠ HTML beautifier skipped: ${err.message}`)
}
