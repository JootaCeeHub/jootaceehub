# ADR-009: Content Repository + Adapter Pattern

**Status:** Accepted  
**Date:** 2026-06-19  
**Supersedes:** N/A  
**Related:** ADR-006 (Git as content source), ADR-008 (Git-First CMS architecture)

---

## Context

After Phase 5 (Supabase elimination), content is read from two sources:

1. **MDX files** (`src/content/journal/*.mdx`) — loaded by `src/lib/journal/articles.ts` using Node.js `fs` at build time
2. **AdminState registries** (projects, labs, systems, research) — loaded from `src/content/**/*.json` at module init, then held in React context

Components that need to query across types (e.g., a "featured content" feed, a
search page, or an AI recommendation engine) must import from two different
places and apply their own filtering. This creates duplication and couples
consumers to the data source.

A unified abstraction is needed so components can access any content type
through a single, consistent API — and the underlying source can change without
touching consumers.

---

## Decision

Define a `ContentRepository<T>` interface in `src/lib/content/repository.ts`
with four methods: `findBySlug`, `findAll`, `count`, and `search`. All methods
return Promises for consistency (adapters may be async in the future).

Create two concrete adapters:

| Adapter | File | Context | Source |
|---|---|---|---|
| `createMdxContentAdapter()` | `adapters/mdx.ts` | Server / build-time | `src/content/journal/*.mdx` via Node.js `fs` |
| `createRegistryAdapter()` | `adapters/admin-state.ts` | Client-safe | AdminState registry arrays passed as a snapshot |

The `applyContentFilter` helper (also in `repository.ts`) implements the shared
filtering logic so both adapters behave identically for identical inputs.

---

## Consequences

### Positive

- **Decoupled consumers**: pages and hooks query content without knowing the source
- **Testable**: adapters accept plain arrays, making unit tests trivial
- **Forward-compatible**: a future VPS API adapter can implement the same interface
- **Zero breaking changes**: existing `getAllMeta()`, `SYSTEMS_JSON`, etc. remain unchanged — adapters call them internally

### Negative

- **Dual creation cost**: the registry adapter must be created on every render cycle (or memoized by the caller) because AdminState may change
- **MDX adapter is build-time only**: calling it from client code fails silently in dev and loudly in production — the file-level comment and function name (`createMdx...`) signal this, but no compile-time enforcement exists yet

### Trade-offs Considered

- **Class-based adapters**: rejected — factory functions with closures are simpler and avoid `this` binding issues in Next.js module graph
- **Single merged repository**: rejected — MDX and AdminState serve different consumers (server vs. client) and merging them would require conditional logic in the factory
- **Zod validation in adapter**: deferred — content is already validated at write time (Zod schemas in `lib/admin/schema.ts`); adding validation in the adapter would be redundant for the current static export architecture

---

## Canonical ID Scheme

All content items use a `{type}:{slug}` canonical ID:

```
article:building-with-llms
project:jootaceehub
lab:aura
system:ai-engine
resource:claude-api
```

See `src/lib/content/canonical-id.ts` for `makeCanonicalId`, `parseCanonicalId`,
`isCanonicalId`, and `slugify`.

---

## Taxonomy Unification

Tags, categories, and series are unified under `src/lib/content/taxonomy.ts`,
which reads `src/content/taxonomies/tags.json` as the single canonical source.

- `ALL_TAGS` — 10 tags with slug, label, color, description
- `ALL_CATEGORIES` — 5 content-type categories
- `ALL_SERIES` — empty array, pre-wired for Phase 3

---

## Alternatives Considered

### Keep ad-hoc imports everywhere

Simple and requires zero new abstractions. Rejected because:
1. Cross-type queries (search, recommendations) require duplicated filtering
2. Future CMS migration would touch every consumer file
3. No clear testing boundary for content access code

### Use SWR or React Query for client-side content

Over-engineered for a static export. All "queries" are synchronous in-memory
operations; async wrappers exist only for interface consistency. SWR adds 12 KB
to the bundle for no benefit.

---

## Implementation Checklist

- [x] `src/lib/content/repository.ts` — `ContentRepository<T>` + `ContentFilter` + `applyContentFilter`
- [x] `src/lib/content/adapters/mdx.ts` — `createMdxContentAdapter()`
- [x] `src/lib/content/adapters/admin-state.ts` — `createRegistryAdapter(RegistrySnapshot)`
- [x] `src/lib/content/canonical-id.ts` — `makeCanonicalId`, `parseCanonicalId`, `isCanonicalId`, `slugify`
- [x] `src/lib/content/taxonomy.ts` — `ALL_TAGS`, `ALL_CATEGORIES`, `ALL_SERIES` + lookup helpers
- [x] `docs/publication-lifecycle.md` — full lifecycle documentation
- [x] Tests: `canonical-id.test.ts`, `taxonomy.test.ts`, `repository.test.ts`
