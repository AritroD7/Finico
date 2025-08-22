// FILE: client/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Read Vite envs (must start with VITE_)
const url = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Fail fast in dev so we don't chase ghost 401s
if (!url || !anon) {
  throw new Error(
    'Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env, then restart `npm run dev`.'
  )
}
if (!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url)) {
  // keep this loose; some refs are 20–22 chars. Adjust if needed.
  console.warn('Supabase URL looks unusual:', url)
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // supports hash callbacks
    flowType: 'pkce',         // prefer PKCE for Google OAuth
  },
})
