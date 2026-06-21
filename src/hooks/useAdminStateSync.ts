'use client'

// Admin state persistence: localStorage (primary) + IndexedDB (backup).
// Both writes are handled in src/lib/admin/store.tsx automatically.
// No-op hook — kept for API compatibility with AdminShell.
export function useAdminStateSync() {
  // Intentionally empty — persistence is handled by the store.
}
