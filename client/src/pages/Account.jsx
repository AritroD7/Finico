// FILE: client/src/pages/Account.jsx
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { createCheckoutSession, getBillingStatus } from "../api"
import { useToaster } from "../components/Toaster"

export default function Account(){
  const { user, signOut } = useAuth()
  const { push } = useToaster()
  const [loading, setLoading] = useState(true)
  const [billing, setBilling] = useState({ active:false, plan:null })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const status = await getBillingStatus()
        if (mounted) setBilling(status)
      } catch (e) {
        push({ title: 'Billing status failed', message: e.message, type: 'error' })
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [push])

  if (!user) {
    return (
      <div className="container-page">
        <div className="card">
          <div className="mb-2 font-semibold">Please sign in to view your account.</div>
          <a className="btn" href="/login">Go to Sign in</a>
        </div>
      </div>
    )
  }

  const startSubscribe = async () => {
    setSubmitting(true)
    try {
      const payload = {
        success_url: `${window.location.origin}/account?session=success`,
        cancel_url: `${window.location.origin}/account?session=cancel`
      }
      const res = await createCheckoutSession(payload)
      if (res?.url) {
        window.location.assign(res.url)
      } else {
        throw new Error('Unexpected response from server.')
      }
    } catch (e) {
      push({ title: 'Checkout error', message: e.message, type:'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page">
      <div className="card max-w-2xl">
        <h1 className="text-lg font-semibold mb-2">Account</h1>
        <div className="text-sm text-slate-700 mb-3">Signed in as <span className="font-medium">{user.email}</span></div>

        {loading ? (
          <div className="text-slate-500">Loading billing…</div>
        ) : (
          <div className="mb-4">
            <div className="text-sm">Plan: <span className="font-medium">{billing.active ? (billing.plan || 'Pro') : 'Free'}</span></div>
            <div className="text-xs text-slate-500">Billing status is simulated until Stripe is fully configured.</div>
          </div>
        )}

        {billing.active ? (
          <div className="flex gap-2">
            <button className="btn-secondary" disabled title="Coming soon">Manage Billing</button>
            <button className="btn-secondary" onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="btn" onClick={startSubscribe} disabled={submitting}>{submitting ? 'Starting…' : 'Upgrade to Pro'}</button>
            <button className="btn-secondary" onClick={signOut}>Sign out</button>
          </div>
        )}
      </div>
    </div>
  )
}
