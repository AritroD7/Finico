// FILE: client/src/api.js
// Normalize base URL, add auth header, correct endpoints. Works with Vite proxy.

import { supabase } from './lib/supabase'

// Allow VITE_API_BASE='http://localhost:5001' or 'http://localhost:5001/api'
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
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

// Health / billing (if used)
export const getHealth = () => authedFetch('/health', { method: 'GET' })
export const getBillingStatus = () => authedFetch('/billing/status', { method: 'GET' })

// Forecast (compound)
export const postCompound = (payload) =>
  authedFetch('/forecast/compound', { method: 'POST', body: JSON.stringify(payload) })

// Risk (Monte Carlo) — corrected path
export const postMonteCarlo = (payload) =>
  authedFetch('/forecast/montecarlo', { method: 'POST', body: JSON.stringify(payload) })

// Goal (required monthly) — back-compat signature (token, payload) or (payload)
export const postRequiredContribution = (a, b) => {
  const payload = b ?? a
  return authedFetch('/goal/required-contribution', { method: 'POST', body: JSON.stringify(payload) })
}
