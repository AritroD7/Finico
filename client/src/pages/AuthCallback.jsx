// FILE: client/src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToaster } from '../components/Toaster'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { push } = useToaster()
  const [msg, setMsg] = useState('Completing sign-in…')

  useEffect(() => {
    let cancelled = false
    async function complete() {
      try {
        // already have a session?
        const { data: init } = await supabase.auth.getSession()
        if (init.session) {
          if (!cancelled) navigate('/account', { replace: true })
          return
        }
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) throw error
        if (!cancelled) {
          setMsg('Signed in. Redirecting…')
          navigate('/account', { replace: true })
        }
      } catch (e) {
        push({ title: 'Auth callback failed', message: e.message, type: 'error' })
        if (!cancelled) setMsg('There was a problem. You can close this tab.')
      }
    }
    complete()
    return () => { cancelled = true }
  }, [navigate, push])

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Signing you in…</h1>
      <p style={{ opacity: 0.7 }}>{msg}</p>
    </div>
  )
}
