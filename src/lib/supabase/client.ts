import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// supabase-js v2 throws at module load if url is empty/undefined.
// Using a syntactically-valid placeholder prevents the crash when env vars
// are absent (dev without .env.local, CI, build time). All actual Supabase
// operations will fail with a network error — which is expected and handled
// by the IS_CONFIGURED guard in src/lib/supabase/context.tsx.
export const supabase = createClient<Database>(
  url ?? 'https://placeholder.supabase.co',
  key ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
