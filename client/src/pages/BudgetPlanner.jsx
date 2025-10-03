// FILE: client/src/pages/BudgetPlanner.jsx
import { useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import { useNavigate } from "react-router-dom"

/* -------------------------------------------------------
   Formatting
--------------------------------------------------------*/
const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const currency = { format: (n) => fmt.format(n ?? 0) }

/* -------------------------------------------------------
   Helpers
--------------------------------------------------------*/
const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0))
const sumByType = (rows, type) => rows.filter((r) => r.type === type).reduce((a, r) => a + (Number(r.amount) || 0), 0)

// A subtle gradient border using layered backgrounds (works without extra CSS)
const gradientCard =
  "relative overflow-hidden rounded-2xl border border-transparent [background:linear-gradient(#ffffff,#ffffff)_padding-box,linear-gradient(120deg,#c7d2fe,#f5d0fe)_border-box] shadow-sm"

/* -------------------------------------------------------
   Storage + Component
--------------------------------------------------------*/
const LS_KEY = "finico.budget.v1"

export default function BudgetPlanner() {
  const navigate = useNavigate()

  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { income: 0, categories: [] }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const totals = useMemo(() => {
    const fixed = sumByType(data.categories, "fixed")
    const variable = sumByType(data.categories, "variable")
    const expenses = fixed + variable
    const savings = (Number(data.income) || 0) - expenses // allow negative
    const rate = data.income > 0 ? savings / data.income : 0
    const deficitPct = data.income > 0 && savings < 0 ? Math.round((-savings / data.income) * 100) : 0
    return { fixed, variable, expenses, savings, rate, deficitPct }
  }, [data])

  const addCategory = (type = "variable") =>
    setData((d) => ({
      ...d,
      categories: [...d.categories, { id: uuid(), name: type === "fixed" ? "New fixed expense" : "New variable expense", amount: 0, type }],
    }))
  const updateRow = (id, patch) =>
    setData((d) => ({ ...d, categories: d.categories.map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
  const removeRow = (id) => setData((d) => ({ ...d, categories: d.categories.filter((r) => r.id !== id) }))

  // Import/Export
  const fileRef = useRef(null)
  const onImportClick = () => fileRef.current?.click()
  const importJson = async (file) => {
    try {
      const obj = JSON.parse(await file.text())
      if (!obj || typeof obj !== "object" || !Array.isArray(obj.categories)) throw new Error("bad")
      setData({
        income: Number(obj.income) || 0,
        categories: obj.categories.map((c) => ({
          id: c.id || uuid(),
          name: String(c.name || "Untitled"),
          amount: Number(c.amount) || 0,
          type: c.type === "fixed" ? "fixed" : "variable",
        })),
      })
    } catch {
      alert("Invalid JSON file.")
    }
  }
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement("a"), { href: url, download: "finico-budget.json" })
    a.click()
    URL.revokeObjectURL(url)
  }

  // Donut
  const donutPercent = clamp01(totals.expenses > 0 ? totals.fixed / totals.expenses : 0)
  const donutStyle = { background: `conic-gradient(rgb(99 102 241) ${donutPercent * 360}deg, rgb(244 114 182) 0)` }
  const isDeficit = totals.savings < 0

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header Card with decorative accents */}
      <div className={`${gradientCard} p-4 sm:p-6`}>
        {/* soft corner glow */}
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900">
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Budget Planner</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track income and expenses. See fixed vs variable, savings, and export your plan.
            </p>

            {/* deficit chip under title if needed */}
            {isDeficit && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <IconAlert className="h-4 w-4" />
                Over budget by <strong className="font-semibold">{currency.format(-totals.savings)}</strong>
                {totals.deficitPct ? <span className="text-rose-600/80">({totals.deficitPct}%)</span> : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importJson(f)
                e.currentTarget.value = ""
              }}
            />
            <button onClick={onImportClick} className="btn border inline-flex items-center gap-2">
              <IconUpload /> Import JSON
            </button>
            <button onClick={exportJson} className="btn border inline-flex items-center gap-2">
              <IconDownload /> Export
            </button>
            <button onClick={() => setData({ income: 0, categories: [] })} className="btn border inline-flex items-center gap-2" title="Clear all">
              <IconReset /> Reset
            </button>
            <button
              onClick={() => navigate("/forecast")}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-white border border-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-95 active:translate-y-[0.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1 transition"
            >
              <IconForecast /> Forecast
            </button>
          </div>
        </div>

        {/* thin gradient underline for title */}
        <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-transparent" />
      </div>

      {/* Stats */}
      <div className="mb-6 mt-4 grid gap-3 md:grid-cols-4">
        <StatCard label="MONTHLY INCOME">{currency.format(data.income)}</StatCard>
        <StatCard label="FIXED EXPENSES">{currency.format(totals.fixed)}</StatCard>
        <StatCard label="VARIABLE EXPENSES">{currency.format(totals.variable)}</StatCard>
        <StatCard label="SAVINGS">
          <div className="flex items-baseline justify-between">
            <span className={isDeficit ? "text-rose-600" : "text-slate-900"}>{currency.format(totals.savings)}</span>
            <span className={`text-xs ${isDeficit ? "text-rose-600" : "text-slate-500"}`}>
              {isDeficit ? `-${totals.deficitPct}%` : `${Math.round(totals.rate * 100)}%`}
            </span>
          </div>
          {isDeficit && <div className="mt-1 text-[11px] text-rose-600/80">Expenses exceed income</div>}
        </StatCard>
      </div>

      {/* Income + Donut */}
      <div className="mb-6 grid items-start gap-4 md:grid-cols-[1.2fr_.8fr]">
        <div className={`${gradientCard} p-4`}>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Monthly income</span>
            <input
              type="number"
              value={data.income}
              onChange={(e) => setData((d) => ({ ...d, income: Number(e.target.value || 0) }))}
              className="input w-full"
              min="0"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">Tip: use whole numbers; you can fine-tune later.</p>
        </div>

        <div className={`${gradientCard} p-4 overflow-hidden`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Fixed vs variable</h3>
            <span className="text-xs text-slate-500">share of monthly expenses</span>
          </div>

          <div className="mt-2 grid grid-cols-[120px_1fr] items-center gap-4 sm:grid-cols-[140px_1fr]">
            <div className="relative mx-auto aspect-square w-[120px] sm:w-[140px]">
              <div className="absolute inset-0 rounded-full" style={donutStyle} />
              <div className="absolute inset-[10%] grid place-items-center rounded-full bg-white shadow-inner">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">{Math.round(donutPercent * 100)}%</div>
                  <div className="text-[11px] text-slate-500">fixed</div>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <DonutPill label="Fixed" value={currency.format(totals.fixed)} dotClass="bg-indigo-500" />
                <DonutPill label="Variable" value={currency.format(totals.variable)} dotClass="bg-fuchsia-500" />
                <DonutPill label="Expenses" value={currency.format(totals.expenses)} />
                <DonutPill
                  label="Savings"
                  value={currency.format(totals.savings)}
                  tone={isDeficit ? "danger" : totals.savings > 0 ? "success" : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${gradientCard} p-4`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addCategory("fixed")} className="btn border">Add fixed</button>
            <button onClick={() => addCategory("variable")} className="btn border">Add variable</button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[1fr_140px_140px_44px] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 sm:grid-cols-[1fr_160px_160px_44px]">
            <div>Name</div>
            <div className="text-right">Amount</div>
            <div className="text-center">Type</div>
            <div />
          </div>

          <ul className="divide-y divide-slate-200">
            {data.categories.map((row) => (
              <li key={row.id} className="grid grid-cols-[1fr_140px_140px_44px] items-center px-3 py-2 sm:grid-cols-[1fr_160px_160px_44px]">
                <input
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  className="input mr-2 w-full"
                  placeholder="Category name"
                />
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) => updateRow(row.id, { amount: Number(e.target.value || 0) })}
                  className="input w-full text-right"
                  min="0"
                />
                <TypeSwitch value={row.type} onChange={(v) => updateRow(row.id, { type: v })} />
                <button
                  onClick={() => removeRow(row.id)}
                  className="inline-grid h-9 w-9 place-items-center rounded-md border border-slate-200 hover:bg-slate-50"
                  title="Remove"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
            {data.categories.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-500">
                No categories yet. Add a fixed or variable expense.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Small components
--------------------------------------------------------*/
function StatCard({ label, children }) {
  return (
    <div className={`${gradientCard} p-4 text-sm`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{children}</div>
    </div>
  )
}

function DonutPill({ label, value, dotClass, tone }) {
  const tones = {
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }
  const dot = tone === "danger" ? "bg-rose-500" : tone === "success" ? "bg-emerald-500" : dotClass || "bg-slate-300"
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs shadow-sm ${tones[tone] || "border-slate-200 bg-white text-slate-700"}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <span>{label}</span>
      <span className="ml-1 font-medium">{value}</span>
    </div>
  )
}

function TypeSwitch({ value, onChange }) {
  const isFixed = value === "fixed"
  return (
    <div className="mx-auto inline-flex rounded-lg border border-slate-200 p-0.5">
      <button
        onClick={() => onChange("fixed")}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${isFixed ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
      >
        Fixed
      </button>
      <button
        onClick={() => onChange("variable")}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${!isFixed ? "bg-fuchsia-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
      >
        Variable
      </button>
    </div>
  )
}

/* -------------------------------------------------------
   Icons (tiny inline SVGs)
--------------------------------------------------------*/
function IconForecast(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} className="h-4 w-4">
      <path fill="currentColor" d="M3 18h18v2H3zm2-4.5 3.5-3.5 3 3 6.5-6.5 1.5 1.5-8 8-3-3L6 15.5z" />
    </svg>
  )
}
function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} className="h-4 w-4">
      <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-16 5 5h-3v4h-4V9H7l5-5Z" />
    </svg>
  )
}
function IconDownload(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} className="h-4 w-4">
      <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-16v8l3-3 1.4 1.4L12 16l-4.4-4.6L9 11l3 3V4Z" />
    </svg>
  )
}
function IconReset(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} className="h-4 w-4">
      <path fill="currentColor" d="M12 6V3L8 7l4 4V8c2.8 0 5 2.2 5 5a5 5 0 0 1-8.8 3.5l-1.4 1.4A7 7 0 0 0 19 13c0-3.9-3.1-7-7-7Z" />
    </svg>
  )
}
function IconAlert(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
    </svg>
  )
}
