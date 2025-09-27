// FILE: client/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Read Vite envs (must start with VITE_)
const url = (import.meta.env.VITE_SUPABASE_URL || 'https://zbaktdqzvhbekuvmvprs.supabase.co').trim()
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYWt0ZHF6dmhiZWt1dm12cHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODYyOTYsImV4cCI6MjA3MTI2MjI5Nn0.MHctusDQOktYf-qpZXXFQVWn_idLakV08LQ8-I122pk').trim()

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
