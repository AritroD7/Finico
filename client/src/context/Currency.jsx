// FILE: client/src/context/Currency.jsx
import { createContext, useContext, useEffect, useMemo, useState, isValidElement } from 'react'

const STORAGE_KEY = 'finplan.currency.v1'
const STORAGE_FX  = 'finplan.fx.v1'
const FX_TTL_MS   = 6 * 60 * 60 * 1000 // 6h

const DEFAULT_BASE = 'USD'
const DEFAULT_USD_PER = { USD: 1.0, EUR: 0.92, GBP: 0.78, BDT: 110.0 } // 1 USD equals these

const CurrencyCtx = createContext(null)

function isRenderable(node) {
  return (
    node == null ||
    typeof node === 'string' ||
    typeof node === 'number' ||
    Array.isArray(node) ||
    isValidElement(node)
  )
}

export function CurrencyProvider({ children }) {
  const [base, setBase] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '""') || DEFAULT_BASE }
    catch { return DEFAULT_BASE }
  })
  const [usdPer, setUsdPer] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_FX) || 'null')?.rates || DEFAULT_USD_PER }
    catch { return DEFAULT_USD_PER }
  })
  const [lastUpdated, setLastUpdated] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_FX) || 'null')?.ts || 0 }
    catch { return 0 }
  })
  const [loadingRates, setLoadingRates] = useState(false)
  const [fxError, setFxError] = useState(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(base)) }, [base])
  useEffect(() => { localStorage.setItem(STORAGE_FX, JSON.stringify({ rates: usdPer, ts: lastUpdated })) }, [usdPer, lastUpdated])

  async function refreshRates() {
    setFxError(null); setLoadingRates(true)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      if (!res.ok) throw new Error('FX API error')
      const json = await res.json()
      if (json.result !== 'success') throw new Error('FX API failed')
      const r = json.rates || {}
      setUsdPer({
        USD: 1.0,
        EUR: r.EUR ?? DEFAULT_USD_PER.EUR,
        GBP: r.GBP ?? DEFAULT_USD_PER.GBP,
        BDT: r.BDT ?? DEFAULT_USD_PER.BDT,
      })
      setLastUpdated(Date.now())
    } catch (e) {
      setFxError(e.message || String(e))
    } finally {
      setLoadingRates(false)
    }
  }

  useEffect(() => {
    if (!lastUpdated || Date.now() - lastUpdated > FX_TTL_MS) refreshRates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toUSD = (amount, code = base) => Number(amount) / (usdPer[code] ?? 1.0)
  const fromUSD = (amountUSD, code = base) => Number(amountUSD) * (usdPer[code] ?? 1.0)
  const convert = (amount, from, to) => fromUSD(toUSD(amount, from), to)
  const format = (amount, code = base) => {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(Number(amount)) }
    catch { return `${code} ${Number(amount).toFixed(2)}` }
  }

  const value = useMemo(() => ({
    base, setBase, usdPer, setUsdPer,
    lastUpdated, loadingRates, fxError,
    toUSD, fromUSD, convert, format,
    refreshRates,
  }), [base, usdPer, lastUpdated, loadingRates, fxError])

  // HARD GUARD: never let a plain object render as children
  const safeChildren = isRenderable(children) ? children : null
  if (safeChildren === null && process.env.NODE_ENV !== 'production') {
    // surface where it happens without crashing the app
    console.error('CurrencyProvider received non-renderable children. This often means something like {useCurrency()} was placed directly into JSX.')
  }

  return (
    <CurrencyCtx.Provider value={value}>
      {safeChildren}
    </CurrencyCtx.Provider>
  )
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyCtx)
  if (!ctx) throw new Error('useCurrency must be used within <CurrencyProvider>')
  return ctx
}
