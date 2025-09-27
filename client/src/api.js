// FILE: client/src/api.js
import { supabase } from './lib/supabase'

const RAW_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5001').toString().replace(/\/$/, '')
export const API_BASE = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`

async function authedFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    let body = ''
    try { body = await res.text() } catch {}
    try { const json = JSON.parse(body); throw new Error(json.error || body || `HTTP ${res.status}`) }
    catch { throw new Error(body || `HTTP ${res.status}`) }
  }
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export const getHealth = () => authedFetch('/health', { method: 'GET' })

export const postBudgetSummary = (payload) =>
  authedFetch('/budget/summary', { method: 'POST', body: JSON.stringify(payload) })

export const postCompound = (payload) =>
  authedFetch('/forecast/compound', { method: 'POST', body: JSON.stringify(payload) })

export const postMonteCarlo = (payload) =>
  authedFetch('/forecast/montecarlo', { method: 'POST', body: JSON.stringify(payload) })

export const postRequiredContribution = (payload) =>
  authedFetch('/goal/required-contribution', { method: 'POST', body: JSON.stringify(payload) })

export const createCheckoutSession = (body) =>
  authedFetch('/billing/create-checkout-session', { method: 'POST', body: JSON.stringify(body || {}) })

export const createPortalSession = (body) =>
  authedFetch('/billing/create-portal-session', { method: 'POST', body: JSON.stringify(body || {}) })

export const getBillingSession = (id) =>
  authedFetch(`/billing/session?id=${encodeURIComponent(id)}`, { method: 'GET' })

export const getBillingStatus = () =>
  authedFetch('/billing/status', { method: 'GET' })

export default {
  API_BASE,
  authedFetch,
  getHealth,
  postBudgetSummary,
  postCompound,
  postMonteCarlo,
  postRequiredContribution,
  createCheckoutSession,
  createPortalSession,
  getBillingSession,
  getBillingStatus,
}
