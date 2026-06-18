# ADR-007: Deploy Hook Security Model

**Status:** Accepted  
**Date:** 2026-06-17  
**Deciders:** JootaCee  
**Related:** ADR-003 (client-side auth), ADR-006 (content source of truth)

---

## Context

Goal 9 (Rebuild Trigger) requires the admin to trigger production builds after publishing portfolio content changes. Deploy hooks (Vercel, Netlify, Cloudflare Pages) are secret HTTPS URLs that trigger a rebuild when called with a POST request. The question is where to store this secret and how to trigger it safely.

Constraints:
- `output: 'export'` → no API routes, no server-side secret storage
- Single-admin site — no multi-user authorization requirements
- The admin panel is protected by `AdminAuthGate` (password/Google/Supabase auth)
- localStorage is the persistence layer for admin configuration

---

## Decision

**Store `deployHookUrl` in `AdminState.integrations.deployHookUrl` (localStorage), trigger via `fetch()` POST from the browser.**

The trigger button in the admin panel calls:
```typescript
await fetch(state.integrations.deployHookUrl, { method: 'POST' })
dispatch({ type: 'DEPLOY_TRIGGERED', payload: new Date().toISOString() })
```

No server-side intermediary. The POST goes directly from the admin's browser to the deploy provider's webhook endpoint.

---

## Security Analysis

**Accepted risks:**
1. **Deploy hook URL stored in localStorage**: Any XSS attack against the admin session could read and expose the hook URL. However, the admin panel is behind `AdminAuthGate`, and the site has strict CSP headers that mitigate XSS.
2. **Hook URL visible in browser DevTools**: An authenticated admin can see the hook URL in localStorage. Acceptable for single-admin personal site.
3. **No rate limiting on the client**: Multiple rapid triggers are possible. Deploy providers have their own queue limits.

**Mitigations:**
- `deployHookUrl` is only set via the admin Config panel — never hardcoded or shipped in public HTML
- The URL is not included in content exports (future: `EXPORT_CONTENT` action excludes `integrations.deployHookUrl`)
- AdminAuthGate prevents unauthenticated access to the admin panel
- Deploy hook URLs should be rotated if compromised (one-click regeneration in deploy provider dashboard)

**Alternative rejected — environment variable:**
- Would require the deploy hook URL to be baked into the static export at build time
- Not updatable without a rebuild → catch-22 for first-time setup
- Cannot be changed via the admin panel after deployment

---

## Consequences

**Positive:**
- Zero server infrastructure required for rebuild triggering
- Admin can update the deploy hook URL at any time without a rebuild
- Works with Vercel, Netlify, Cloudflare Pages (any provider with a POST webhook)

**Negative:**
- Deploy hook URL is stored in localStorage — must be rotated if admin session is compromised
- No server-side audit log of deploy triggers

**Recommended practice:**
- Use the deploy provider's scope-limited hook (build-only permission, not full API access)
- Rotate the hook URL if the device running the admin panel is lost or compromised
- Keep the admin panel behind at minimum `AuthMode: 'password'` in production
