// FILE: client/src/pages/Login.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useToaster } from "../components/Toaster"

export default function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const { push } = useToaster()
  const nav = useNavigate()
  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) nav("/account", { replace: true }) }, [user, nav])

  const handleEmail = async () => {
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
        nav('/account', { replace:true })
      } else {
        await signUpWithEmail(email, password)
        push({ title: 'Check your email', message: 'Confirm the sign-up link, then return here.', type: 'info', timeout: 6000 })
      }
    } catch (e) {
      push({ title: 'Auth error', message: e.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      push({ title: 'Google sign-in failed', message: e.message, type: 'error' })
    }
  }

  return (
    <div className="container-page">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-lg font-semibold mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
          <p className="text-sm text-slate-600 mb-4">
            Use email + password or continue with Google.
          </p>

          <div className="space-y-2">
            <input className="input w-full" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="input w-full" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn w-full" onClick={handleEmail} disabled={loading}>
              {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in with Email' : 'Create account')}
            </button>
            <div className="h-px bg-slate-200 my-3" />
            <button className="btn-secondary w-full" onClick={handleGoogle}>Continue with Google</button>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            {mode === 'signin' ? (
              <>New here? <button className="text-indigo-600 hover:underline" onClick={()=>setMode("signup")}>Create an account</button></>
            ) : (
              <>Already have an account? <button className="text-indigo-600 hover:underline" onClick={()=>setMode("signin")}>Sign in</button></>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-500">
            This platform provides mathematical models and educational content only. It is <strong>not</strong> investment advice.
          </p>
        </div>
      </div>
    </div>
  )
}
