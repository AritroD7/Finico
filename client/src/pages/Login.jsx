import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as Toaster from '../components/Toaster'

const providers = [
  { key: 'google', label: 'Continue with Google', icon: GoogleIcon },
]

export default function Login() {
  const { user, loading, signInWithProvider, signInWithEmail, signUpWithEmail, sendMagicLink } = useAuth()
  const [tab, setTab] = useState('signin') // 'signin' | 'signup' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [params] = useSearchParams()

  // Toaster adapter (supports either useToast or useToaster)
  const useToastHook = Toaster.useToaster || Toaster.useToast
  const toast = useToastHook ? useToastHook() : null
  const notify = (msg, opts = {}) => {
    if (!toast) return console.log('[toast]', msg)
    if (toast.push) return toast.push({ title: opts.title ?? undefined, message: msg, type: opts.type, duration: opts.duration })
    if (toast.show) return toast.show(msg, opts)
  }

  useEffect(() => {
    const ok = params.get('success')
    const err = params.get('error')
    if (ok) notify('Signed in successfully.', { type: 'success' })
    if (err) notify(err, { type: 'error' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    )
  }
  if (user) return <Navigate to="/account" replace />

  const submitSignin = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await signInWithEmail(email, password)
      notify('Welcome back!', { type: 'success' })
    } catch (err) {
      notify(err.message ?? String(err), { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const submitSignup = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await signUpWithEmail(email, password)
      notify('Account created. Check your email if confirmation is required.', { type: 'success' })
    } catch (err) {
      notify(err.message ?? String(err), { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  const submitMagic = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await sendMagicLink(email)
      notify('Magic link sent. Check your inbox.', { type: 'success' })
    } catch (err) {
      notify(err.message ?? String(err), { type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] grid md:grid-cols-2">
      <AuthLeftPanel />
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border shadow-sm p-6 bg-white">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Welcome to Finico</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to save scenarios and get updates.</p>

            <div className="mt-4 space-y-3">
              {providers.map(p => (
                <button
                  key={p.key}
                  onClick={() => signInWithProvider(p.key)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[15px] font-medium hover:bg-gray-50 transition"
                >
                  <p.icon className="h-5 w-5" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
              <div className="h-px flex-1 bg-gray-200" />
              <span>or continue with email</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {tab === 'signin' && (
              <form className="space-y-3" onSubmit={submitSignin}>
                <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
                <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button disabled={busy} className="btn w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
              </form>
            )}

            {tab === 'signup' && (
              <form className="space-y-3" onSubmit={submitSignup}>
                <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
                <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button disabled={busy} className="btn w-full">{busy ? 'Creating account…' : 'Create account'}</button>
              </form>
            )}

            {tab === 'magic' && (
              <form className="space-y-3" onSubmit={submitMagic}>
                <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
                <button disabled={busy} className="btn w-full">{busy ? 'Sending…' : 'Send magic link'}</button>
              </form>
            )}

            <p className="mt-6 text-xs text-gray-500">
              By continuing you agree to our Terms and acknowledge our Privacy Policy.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            New here? <button className="text-indigo-600 hover:underline" onClick={()=>setTab('signup')}>Create an account</button>
          </p>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={[
        'flex-1 rounded-md px-3 py-2 text-sm font-medium transition',
        active ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      <input
        {...props}
        className="input w-full"
      />
    </label>
  )
}

function AuthLeftPanel() {
  return (
    <div className="relative hidden md:block">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative h-full w-full p-10 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Plan your money with confidence</h2>
          <p className="mt-2 max-w-sm text-white/90">
            Finico helps you model budgets, goals, and long‑term wealth—free while in early access.
          </p>
        </div>
        <ul className="space-y-3 text-white/90">
          <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5" /> Save multiple scenarios</li>
          <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5" /> Export clean PDFs for sharing</li>
          <li className="flex items-center gap-3"><CheckIcon className="h-5 w-5" /> Private by default—your data, your control</li>
        </ul>
      </div>
    </div>
  )
}

// --- icons ---
function GoogleIcon(props){return(<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" {...props}><path fill="currentColor" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8A6.4 6.4 0 1 1 12 5.6c1.8 0 3 .7 3.6 1.3l2.4-2.4A10.6 10.6 0 0 0 12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 9.6-4.1 9.6-10c0-.7-.1-1.1-.2-1.6H12z"/></svg>)}
function CheckIcon(props){return(<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M20.3 5.7 9.8 16.2l-6-6L2.4 11l7.4 7.3L21.7 6.5z"/></svg>)}

