import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AuthModal({ open, onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleEmail = async () => {
    setErr(''); setLoading(true)
    try {
      if (mode === 'signin') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
      onClose?.()
    } catch (e) {
      setErr(e?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setErr(''); setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      setErr(e?.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>✕</button>
        </div>

        {err && <div className="text-sm text-rose-600 mb-3">{err}</div>}

        <div className="grid gap-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Email</label>
            <input className="input w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Password</label>
            <input className="input w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          <button className="btn" onClick={handleEmail} disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">or</span>
            </div>
          </div>

          <button className="btn-secondary" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          {mode === 'signin' ? (
            <>New here? <button className="text-blue-600 hover:underline" onClick={()=>setMode('signup')}>Create an account</button></>
          ) : (
            <>Already have an account? <button className="text-blue-600 hover:underline" onClick={()=>setMode('signin')}>Sign in</button></>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          This platform provides mathematical models and insights only. It is <strong>not</strong> investment advice.
        </p>
      </div>
    </div>
  )
}
