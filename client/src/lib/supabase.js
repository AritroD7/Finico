// FILE: client/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'


/**
* Central Supabase client (v2)
* - Persists session across reloads
* - Auto-refreshes tokens
* - Detects session from OAuth callback URL
*/
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()


if (!url || !anon) {
throw new Error('Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env')
}


// Optional: warn if URL shape seems off (helps catch wrong project)
if (!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url)) {
console.warn('[supabase] VITE_SUPABASE_URL looks unusual:', url)
}


export const supabase = createClient(url, anon, {
auth: {
persistSession: true,
autoRefreshToken: true,
detectSessionInUrl: true,
storage: typeof window !== 'undefined' ? window.localStorage : undefined,
},
})