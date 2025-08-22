// FILE: client/src/context/Currency.jsx
// Drop-in replacement keeping your existing API.
// Change: force English numerals for ALL currencies (locale 'en-US').
// Features preserved: live FX (backend → exchangerate.host → open.er-api), caching, persistence.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// ------- Config -------
const STORAGE_KEY = 'finplan.currency.v1'
const STORAGE_FX  = 'finplan.fx.v1'
const FX_TTL_MS   = 6 * 60 * 60 * 1000 // 6h cache
const DEFAULT_USD_PER = {
  USD: 1.0,
  EUR: 1.09,   // placeholder until live fetch
  GBP: 1.29,   // placeholder
  BDT: 0.0091, // ≈ 110 BDT = 1 USD (placeholder)
}
const SUPPORTED = ['USD','EUR','GBP','BDT']

// ------- Helpers -------
function normalizeUSDPer(payload){
  if (!payload || !payload.rates) return null
  const base = String(payload.base || 'USD').toUpperCase()
  const rates = payload.rates
  const out = {}
  if (base === 'USD') {
    for (const c of Object.keys(rates)) {
      const v = Number(rates[c]); if (!Number.isFinite(v) || v <= 0) continue
      out[c.toUpperCase()] = c.toUpperCase() === 'USD' ? 1 : 1 / v // USD per 1 c
    }
    out.USD = 1; return out
  }
  const usdPerBase = Number(rates.USD) ? (1 / Number(rates.USD)) : null
  if (!usdPerBase) return null
  out[base] = usdPerBase
  for (const c of Object.keys(rates)) {
    const v = Number(rates[c]); if (!Number.isFinite(v) || v <= 0) continue
    out[c.toUpperCase()] = usdPerBase / v
  }
  out.USD = 1
  return out
}

async function providerBackend(symbols = SUPPORTED){
  const qs = new URLSearchParams({ base:'USD', symbols: symbols.join(',') })
  const res = await fetch(`/api/fx/latest?${qs.toString()}`)
  if (!res.ok) throw new Error('backend fx failed')
  const data = await res.json() // { base:'USD', rates:{ EUR:0.92, ... } }
  const m = normalizeUSDPer(data); if (!m) throw new Error('backend fx malformed')
  return m
}
async function providerExchangerateHost(symbols = SUPPORTED){
  const qs = new URLSearchParams({ base:'USD', symbols: symbols.join(',') })
  const url = `https://api.exchangerate.host/latest?${qs.toString()}`
  const res = await fetch(url); if (!res.ok) throw new Error('exchangerate.host failed')
  const data = await res.json()
  const m = normalizeUSDPer({ base:'USD', rates: data?.rates || {} })
  if (!m) throw new Error('exchangerate.host malformed')
  return m
}
async function providerOpenERAPI(){
  const res = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!res.ok) throw new Error('open.er-api failed')
  const data = await res.json()
  const m = normalizeUSDPer({ base:'USD', rates: data?.rates || {} })
  if (!m) throw new Error('open.er-api malformed')
  return m
}
async function fetchUSDPerWithFallback(symbols = SUPPORTED){
  const providers = [providerBackend, providerExchangerateHost, providerOpenERAPI]
  let lastErr
  for (const p of providers){
    try { return await p(symbols) } catch (e) { lastErr = e }
  }
  console.warn('FX providers failed; using defaults', lastErr)
  return { ...DEFAULT_USD_PER }
}

// ------- Context -------
const CurrencyCtx = createContext({})

export function CurrencyProvider({ children }){
  const [base, setBase] = useState('USD')
  const [usdPer, setUsdPer] = useState(DEFAULT_USD_PER)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [fxError, setFxError] = useState('')

  // Load persisted base + manual overrides
  useEffect(()=>{
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if(raw){
        const { base:b, usdPer:r } = JSON.parse(raw)
        if(b) setBase(b)
        if(r) setUsdPer(prev => ({ ...prev, ...r }))
      }
    }catch{}
  },[])

  // Load cached FX (with TTL) and refresh if stale
  useEffect(()=>{
    try{
      const raw = localStorage.getItem(STORAGE_FX)
      if(raw){
        const { usdPer:cached, ts } = JSON.parse(raw)
        if(cached) setUsdPer(prev => ({ ...prev, ...cached }))
        if(ts) setLastUpdated(ts)
        if(!ts || (Date.now() - ts) > FX_TTL_MS){ refreshRates(true) }
      } else {
        refreshRates(true)
      }
    }catch{ refreshRates(true) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  // Persist base & overrides
  useEffect(()=>{
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({ base, usdPer })) }catch{}
  },[base, usdPer])

  async function refreshRates(silent=false){
    if(!silent) setLoadingRates(true)
    setFxError('')
    try{
      const m = await fetchUSDPerWithFallback(SUPPORTED)
      setUsdPer(prev => ({ ...prev, ...m }))
      const ts = Date.now(); setLastUpdated(ts)
      try{ localStorage.setItem(STORAGE_FX, JSON.stringify({ usdPer:m, ts })) }catch{}
    }catch(e){ setFxError(e?.message || 'Failed to load FX') }
    finally{ if(!silent) setLoadingRates(false) }
  }

  // Format & convert (FORCE ENGLISH NUMERALS via 'en-US' locale)
  const format = (value, cur = base) =>
    new Intl.NumberFormat('en-US', { style:'currency', currency:cur })
      .format(Number(value || 0))

  const toUSD   = (amount, from = base) => Number(amount || 0) * (usdPer[from] ?? 1)
  const fromUSD = (amount, to = base)   => Number(amount || 0) / (usdPer[to]   ?? 1)
  const convert = (amount, from, to)    => fromUSD(toUSD(amount, from), to)

  // Expose original keys + friendly aliases used by some components
  const value = useMemo(()=>({
    base, setBase,
    usdPer, setUsdPer,
    lastUpdated,
    loadingRates, fxError,
    // aliases for components that expect these exact names
    supported: SUPPORTED,
    rates: usdPer,
    loading: loadingRates,
    err: fxError,
    // helpers
    format, toUSD, fromUSD, convert,
    refreshRates,
  }),[base, usdPer, lastUpdated, loadingRates, fxError])

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>
}

export const useCurrency = () => useContext(CurrencyCtx)
