import type { MDXComponents } from 'mdx/types'

// Global MDX component overrides. Applied whenever an .mdx file is rendered
// via Next.js's built-in MDX support. Add custom components here to replace
// default HTML elements (e.g. swap <code> for a syntax-highlighted version).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components }
}
