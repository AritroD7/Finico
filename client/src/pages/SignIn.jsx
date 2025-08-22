import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../hooks/useAuth"

export default function SignIn(){
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  // if already logged in, bounce to account (or where they came from)
  useEffect(() => {
    if (!loading && user) {
      const returnTo = sessionStorage.getItem("returnTo") || "/account"
      sessionStorage.removeItem("returnTo")
      nav(returnTo, { replace: true })
    }
  }, [user, loading, nav, loc])

  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setErr(""); setMessage("")
    try {
      setBusy(true)
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage("Signed in!")
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage("Account created. You can sign in now.")
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email, options: { emailRedirectTo: window.location.origin + "/account" }
        })
        if (error) throw error
        setMessage("Magic link sent. Check your email.")
      }
    } catch (e) {
      setErr(e?.message || "Authentication failed")
    } finally {
      setBusy(false)
    }
  }

  const loginGoogle = async () => {
    setErr(""); setMessage("")
    sessionStorage.setItem("returnTo", "/account")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/account" }
    })
    if (error) setErr(error.message)
  }

  if (loading) {
    return <div className="container-page max-w-lg"><div className="card">Loading session…</div></div>
  }

  return (
    <div className="container-page max-w-lg">
      <h1 className="section-title mb-2">Sign In</h1>
      <p className="section-subtitle mb-6">Use email & password, magic link, or Google.</p>

      <div className="card space-y-4">
        <div className="flex gap-2">
          {["signin","signup","magic"].map(m => (
            <button key={m}
              className={`btn-secondary ${mode===m ? "ring-2 ring-blue-500/50" : ""}`}
              onClick={() => setMode(m)}>
              {m === "signin" ? "Sign In" : m === "signup" ? "Create Account" : "Magic Link"}
            </button>
          ))}
        </div>

        <button className="btn w-full" onClick={loginGoogle}>
          <span className="mr-2">🔐</span> Continue with Google
        </button>

        <div className="grid gap-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {mode !== "magic" && (
            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button className="btn" onClick={run} disabled={busy || !email || (mode!=="magic" && !password)}>
            {busy ? "Working…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Magic Link"}
          </button>
        </div>

        {!!message && <div className="text-emerald-700 text-sm">{message}</div>}
        {!!err && <div className="text-rose-600 text-sm">{err}</div>}
      </div>
    </div>
  )
}
