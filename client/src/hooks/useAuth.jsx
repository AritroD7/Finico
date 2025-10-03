import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function shapeUser(sessionUser) {
  if (!sessionUser) return null
  const { id, email, user_metadata } = sessionUser
  return {
    id,
    email,
    name: user_metadata?.full_name ?? null,
    avatar: user_metadata?.avatar_url ?? null,
  }
}

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initial session load + subscription
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        setUser(shapeUser(data.session?.user))
        setToken(data.session?.access_token ?? null)
      } catch (e) {
        console.error('[auth] getSession failed', e)
        setError(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(shapeUser(session?.user))
      setToken(session?.access_token ?? null)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const signInWithProvider = useCallback(async (provider, opts = {}) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: opts.redirectTo ?? `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) throw error
    return data
  }, [])

  const sendMagicLink = useCallback(async (email, opts = {}) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: opts.redirectTo ?? `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
    return data
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(shapeUser(data.user))
    return data.user
  }, [])

  const signUpWithEmail = useCallback(async (email, password) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
    setUser(shapeUser(data.user))
    return data.user
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      signInWithProvider,
      sendMagicLink,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [user, token, loading, error, signInWithProvider, sendMagicLink, signInWithEmail, signUpWithEmail, signOut],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
