'use client'

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSupabaseAuth } from '@/lib/supabase/context'
import { useAdmin } from '@/lib/admin/store'
import { reportError } from '@/lib/error'
import type { AdminConfigRow, AdminConfigInsert } from '@/lib/supabase/types'

const SUPABASE_CONFIG_KEY = 'admin-state-v1'
const DEBOUNCE_MS = 3000

// ── Remote persistence helpers ─────────────────────────────────────────────
async function loadRemoteState(userId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from('admin_config')
    .select('config_value')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return (data as Pick<AdminConfigRow, 'config_value'>).config_value
}

async function saveRemoteState(
  userId: string,
  state: Record<string, unknown>
): Promise<void> {
  const upsertData: AdminConfigInsert = {
    user_id: userId,
    config_key: SUPABASE_CONFIG_KEY,
    config_value: state,
  }

  const { error } = await supabase
    .from('admin_config')
    .upsert(upsertData as AdminConfigInsert & Record<string, unknown>, { onConflict: 'user_id' })

  if (error) reportError(error, { context: 'useAdminStateSync/saveRemoteState' })
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAdminStateSync() {
  const { user, isConfigured } = useSupabaseAuth()
  const { state, importJSON } = useAdmin()
  const hasLoaded = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load remote state once on sign-in
  useEffect(() => {
    if (!isConfigured || !user || hasLoaded.current) return
    hasLoaded.current = true

    loadRemoteState(user.id).then((remote) => {
      if (!remote) return
      try {
        importJSON(JSON.stringify(remote))
      } catch (e) {
        reportError(e, { context: 'useAdminStateSync/load' })
      }
    })
  }, [user, isConfigured, importJSON])

  // Debounced sync on state change
  const syncToRemote = useCallback(() => {
    if (!isConfigured || !user) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const { unsaved: _unsaved, ...persistable } = state
      void saveRemoteState(user.id, persistable as Record<string, unknown>)
    }, DEBOUNCE_MS)
  }, [user, isConfigured, state])

  useEffect(() => {
    if (state.unsaved) syncToRemote()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [state.unsaved, syncToRemote])
}
