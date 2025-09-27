// FILE: client/src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Small, typed-ish user shape for convenience
function shapeUser(sessionUser) {
  if (!sessionUser) return null
  const { id, email, user_metadata } = sessionUser
  return { id, email, name: user_metadata?.full_name ?? null, avatar: user_metadata?.avatar_url ?? null }
}

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // initial session + token
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setUser(shapeUser(data.session?.user))
        setToken(data.session?.access_token || null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    // session event listener
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(shapeUser(session?.user))
      setToken(session?.access_token || null)
    })
    return () => { mounted = false; sub?.subscription?.unsubscribe?.() }
  }, [])

  // ---- Auth actions ----
  const signInWithGoogle = async () => {
    setError(null)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { prompt: 'select_account' } }
    })
    if (error) throw error
  }

  const signInWithEmail = async (email, password) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(shapeUser(data.user))
    return data.user
  }

  const signUpWithEmail = async (email, password) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) throw error
    return data.user
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
  }

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  const value = useMemo(() => ({
    user, token, loading, error,
    signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getAccessToken
  }), [user, token, loading, error])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
