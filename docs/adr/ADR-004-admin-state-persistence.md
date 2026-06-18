# ADR-004: Admin State Persistence

Status: Accepted
Date: 2026-06-17

## Context

The admin CMS manages ~59 top-level keys of configuration: site content, design tokens, project registries, integration configs, and studio preferences. This state must survive page refreshes and browser restarts without a backend database.

## Decision

**Dual-write persistence: localStorage (primary) + IndexedDB (secondary).**

```
User action
  → dispatch(AdminAction)
  → adminReducer(state, action) → newState
  → React re-render
  → debounce(800ms)
  → localStorage.setItem('jootacee-command-v2', JSON.stringify(newState))   [primary]
  → idb.put('admin-state', newState)                                         [secondary, async]
```

### Storage Key

`jootacee-command-v2` — The `-v2` suffix signals a schema break from any prior version. If the schema changes incompatibly in the future, increment to `-v3` and add a migration function in `src/lib/admin/store.tsx`.

### Load Order

```
1. Read localStorage['jootacee-command-v2']
2. Validate with AdminStateSchema.partial().safeParse()
3. If invalid → log error via reportError(), use createInitialState()
4. If valid → merge with createInitialState() (forward-compatible: new keys get defaults)
5. Attempt IDB read → only used as fallback if localStorage is empty/corrupt
```

### Zod Validation

Every localStorage load and JSON import is validated with `AdminStateSchema.partial().safeParse()`. Using `.partial()` (not `.safeParse()`) means:
- Missing keys are filled with defaults (forward-compatible: adding new state keys doesn't break existing persisted data)
- Extra keys from old schema versions are stripped silently

### Security Note

The full AdminState — including user-entered API keys (GitHub PAT, OpenAI key, feed URLs) in `integrations`, `github`, `llm`, and `feeds` sub-objects — is stored in `localStorage` in plaintext.

**Risk surface:** localStorage is domain-scoped; XSS is the primary attack vector. The CSP in `public/_headers` and `src/lib/config/csp.ts` mitigates inline-script injection.

**Mitigation planned:** Encrypt sensitive fields (API keys) with a derived key from the password hash before persisting. This is a Phase 3 item.

**Not a risk:** Auth tokens are in `sessionStorage` (separate from state), and the content is non-secret (it's the admin's own portfolio data).

### Debounce Strategy

800ms debounce is chosen to:
- Avoid write-on-every-keystroke for text inputs (30+ dispatches per second)
- Remain responsive enough that closing the tab within 1 second of an edit is unlikely to lose data
- The IDB write is async and does not block the debounce timer

## Consequences

**Positive:**
- Zero backend dependency — works completely offline
- Sub-millisecond reads at app startup
- IDB provides a recovery path if localStorage is cleared by the browser
- Zod partial validation means old persisted data survives schema additions

**Negative:**
- `localStorage` is limited to ~5MB per origin — the full AdminState (with large content arrays) should be monitored
- Sensitive fields (API keys) are plaintext in localStorage — XSS attack can read them
- No versioned history or rollback (only the latest state is persisted)

## Alternatives Considered

**Server-side Supabase persistence:** Viable once/if the site moves off `output: 'export'`. Tracked as Phase 3.

**Only localStorage (no IDB):** IDB is kept as a fallback because browsers can evict localStorage under storage pressure. IDB is harder to evict.

**Only IDB (no localStorage):** IDB is async — using it as primary would require async bootstrap of the AdminContext on every mount, adding complexity without benefit.

**JSON file export/import (only):** Already implemented as a complementary feature (`Export JSON` / `Import JSON` buttons in AdminShell). Not sufficient as a persistence strategy because it requires manual action.
