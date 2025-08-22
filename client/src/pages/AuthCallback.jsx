// FILE: client/src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState('Completing sign-in…')

  useEffect(() => {
    let cancelled = false

    async function complete() {
      try {
        // Fast path: already have a session
        const { data: init } = await supabase.auth.getSession()
        if (init?.session) {
          if (!cancelled) navigate('/', { replace: true })
          return
        }

        const url = new URL(window.location.href)
        const hasHash = url.hash && url.hash.length > 1
        const hasCode = !!url.searchParams.get('code')

        // 1) Hash-based flow (#access_token/#refresh_token)
        if (hasHash) {
          // Try modern helper if available
          const canUseHelper = typeof supabase.auth.getSessionFromUrl === 'function'
          if (canUseHelper) {
            const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
            if (error) throw error
          } else {
            // Fallback: manually set session from URL fragment
            const params = new URLSearchParams(url.hash.slice(1))
            const access_token = params.get('access_token') || ''
            const refresh_token = params.get('refresh_token') || ''
            if (!access_token || !refresh_token) {
              throw new Error('Missing access or refresh token in URL hash')
            }
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) throw error
          }
          if (!cancelled) navigate('/', { replace: true })
          return
        }

        // 2) PKCE code flow (?code=...)
        if (hasCode) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (error) throw error
          if (data?.session && !cancelled) {
            navigate('/', { replace: true })
            return
          }
        }

        setMsg('Could not establish a session. Please sign in again.')
      } catch (e) {
        setMsg(String(e?.message || e))
      }
    }

    complete()
    return () => { cancelled = true }
  }, [navigate])

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Signing you in…</h1>
      <p style={{ opacity: 0.7 }}>{msg}</p>
    </div>
  )
}
