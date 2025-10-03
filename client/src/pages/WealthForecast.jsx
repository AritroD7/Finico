// FILE: client/src/pages/WealthForecast.jsx
import { useEffect, useMemo, useRef, useState } from "react"

/* -------------------------------------------------------
   Decorative helpers (match Budget page vibe)
--------------------------------------------------------*/
const gradientCard =
  "relative overflow-hidden rounded-2xl border border-transparent [background:linear-gradient(#ffffff,#ffffff)_padding-box,linear-gradient(120deg,#c7d2fe,#f5d0fe)_border-box] shadow-sm"

/* -------------------------------------------------------
   Safe ranges for inputs
--------------------------------------------------------*/
const LIMITS = {
  start: { min: 0, max: 1e9 },
  monthly: { min: 0, max: 1e7 },
  years: { min: 1, max: 60 },
  contribGrowth: { min: -10, max: 20 }, // %/yr
  rtn: { min: -10, max: 20 },           // %/yr expected
  vol: { min: 0, max: 60 },             // %/yr stdev
  fees: { min: 0, max: 3 },             // %/yr
  inflation: { min: -2, max: 15 },      // %/yr
  sims: { min: 50, max: 1000 },
  target: { min: 0, max: 1e12 },
}
const clamp = (n, a, b) => Math.min(b, Math.max(a, n))
const clampBy = (val, key) => clamp(Number(val || 0), LIMITS[key].min, LIMITS[key].max)
const monthsInYear = 12
const MAX_BAL = 1e13 // hard ceiling to avoid Infinity from extreme combos

/* -------------------------------------------------------
   Random + monthly parameters
--------------------------------------------------------*/
// Box–Muller transform for ~N(0,1)
function randn() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Convert annual inputs to monthly **lognormal** parameters
function monthlyParams(annualReturnPct, annualVolPct, feePct, inflationPct, realReturns) {
  const r = (annualReturnPct || 0) / 100
  const volA = (annualVolPct || 0) / 100
  const fees = (feePct || 0) / 100
  const inflA = (inflationPct || 0) / 100

  // Net annual return after fees; protect from nonsense
  const netAnnual = clamp(r - fees, -0.95, 10)

  // Geometric monthly drift from net annual (log(1+r)/12)
  const muLogM = Math.log(1 + netAnnual) / monthsInYear

  // Monthly volatility
  const sigM = volA / Math.sqrt(monthsInYear)

  // Real adjustment: deflate each month by inflation
  const inflM = Math.pow(1 + inflA, 1 / monthsInYear) - 1
  const deflator = realReturns ? 1 / (1 + inflM) : 1

  return { muLogM, sigM, deflator }
}

/* -------------------------------------------------------
   Simulation engine (lognormal with contributions)
--------------------------------------------------------*/
function simulatePaths({
  start = 0,
  monthlyContribution = 0,
  contribGrowthPct = 0, // per year
  years = 30,
  annualReturnPct = 6,
  annualVolPct = 12,
  feePct = 0.2,
  inflationPct = 2.5,
  realReturns = true,
  sims = 200,
}) {
  const months = clamp(Math.round(years * monthsInYear), 1, LIMITS.years.max * monthsInYear)
  const { muLogM, sigM, deflator } = monthlyParams(annualReturnPct, annualVolPct, feePct, inflationPct, realReturns)
  const contribGrowthM = Math.pow(1 + (contribGrowthPct || 0) / 100, 1 / monthsInYear)

  const paths = Array.from({ length: sims }, () => new Array(months + 1).fill(0))
  for (let s = 0; s < sims; s++) {
    let bal = clamp(start, LIMITS.start.min, LIMITS.start.max)
    let contrib = clamp(monthlyContribution, LIMITS.monthly.min, LIMITS.monthly.max)
    paths[s][0] = bal

    for (let m = 1; m <= months; m++) {
      // contribution at start of month
      bal += contrib

      // lognormal monthly growth factor: exp(mu - 0.5σ² + σZ)
      const growth = Math.exp(muLogM - 0.5 * sigM * sigM + sigM * randn())

      // apply nominal growth then real deflator if needed
      bal = bal * growth * deflator

      // guard rails
      if (!Number.isFinite(bal) || bal > MAX_BAL) bal = MAX_BAL
      if (bal < 0) bal = 0

      paths[s][m] = bal
      contrib = clamp(contrib * contribGrowthM, LIMITS.monthly.min, LIMITS.monthly.max)
    }
  }
  return { paths, months }
}

// Percentiles per month across sims
function percentileSeries(paths, p) {
  const months = paths[0].length
  const out = new Array(months)
  for (let m = 0; m < months; m++) {
    const col = paths.map((row) => row[m]).sort((a, b) => a - b)
    const idx = clamp(Math.floor((p / 100) * (col.length - 1)), 0, col.length - 1)
    out[m] = col[idx]
  }
  return out
}

// CSV generator
function toCsv(rows, headers) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
  const head = headers.map(esc).join(",")
  const body = rows.map((r) => r.map(esc).join(",")).join("\n")
  return head + "\n" + body
}

/* -------------------------------------------------------
   Page
--------------------------------------------------------*/
export default function WealthForecast() {
  const [params, setParams] = useState({
    start: 10000,
    monthly: 500,
    years: 30,
    rtn: 7,
    vol: 15,
    fees: 0.2,
    inflation: 2.5,
    contribGrowth: 0,
    sims: 200,
    real: true,
    target: 1000000,
  })

  // presets
  const applyPreset = (preset) => {
    const presets = {
      conservative: { rtn: 5, vol: 10, fees: 0.2 },
      balanced: { rtn: 7, vol: 15, fees: 0.25 },
      aggressive: { rtn: 9, vol: 22, fees: 0.3 },
    }
    setParams((p) => ({ ...p, ...presets[preset] }))
  }

  // run sim
  const sim = useMemo(
    () =>
      simulatePaths({
        start: clampBy(params.start, "start"),
        monthlyContribution: clampBy(params.monthly, "monthly"),
        contribGrowthPct: clampBy(params.contribGrowth, "contribGrowth"),
        years: clampBy(params.years, "years"),
        annualReturnPct: clampBy(params.rtn, "rtn"),
        annualVolPct: clampBy(params.vol, "vol"),
        feePct: clampBy(params.fees, "fees"),
        inflationPct: clampBy(params.inflation, "inflation"),
        realReturns: !!params.real,
        sims: clampBy(params.sims, "sims"),
      }),
    [params]
  )

  const p10 = useMemo(() => percentileSeries(sim.paths, 10), [sim])
  const p50 = useMemo(() => percentileSeries(sim.paths, 50), [sim])
  const p90 = useMemo(() => percentileSeries(sim.paths, 90), [sim])

  const endBal = { p10: last(p10), p50: last(p50), p90: last(p90) }
  const probTarget = useMemo(() => {
    const end = sim.paths.map((r) => last(r))
    const hit = end.filter((v) => v >= clampBy(params.target, "target")).length
    return Math.round((hit / end.length) * 100)
  }, [sim, params.target])

  // export CSV
  const onExport = () => {
    const rows = []
    for (let m = 0; m < p50.length; m++) rows.push([m, p10[m], p50[m], p90[m]])
    const csv = toCsv(rows, ["month", "p10", "p50", "p90"])
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement("a"), { href: url, download: "finico-forecast.csv" })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className={`${gradientCard} p-4 sm:p-6`}>
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                Wealth Forecast
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Monte-Carlo (lognormal) with uncertainty bands (P10 / P50 / P90). For education—not advice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="btn border" onClick={() => applyPreset("conservative")}>Conservative</button>
            <button className="btn border" onClick={() => applyPreset("balanced")}>Balanced</button>
            <button className="btn border" onClick={() => applyPreset("aggressive")}>Aggressive</button>
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-white border border-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:opacity-95 active:translate-y-[0.5px] transition"
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-transparent" />
      </div>

      {/* Stats */}
      <div className="mb-6 mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="P10 (cautious)" value={endBal.p10} />
        <Stat label="P50 (median)" value={endBal.p50} highlight />
        <Stat label="P90 (optimistic)" value={endBal.p90} />
        <TargetStat target={clampBy(params.target, "target")} prob={probTarget} />
      </div>

      {/* Controls + Chart */}
      <div className="grid gap-4 md:grid-cols-[1.05fr_.95fr]">
        {/* Inputs */}
        <div className={`${gradientCard} p-4`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField label="Starting balance" value={params.start}
              onChange={(v) => setParams((p) => ({ ...p, start: clampBy(v, "start") }))} />
            <NumberField label="Monthly contribution" value={params.monthly}
              onChange={(v) => setParams((p) => ({ ...p, monthly: clampBy(v, "monthly") }))} />
            <NumberField label="Years" value={params.years} min={LIMITS.years.min} max={LIMITS.years.max}
              onChange={(v) => setParams((p) => ({ ...p, years: clampBy(v, "years") }))} />
            <NumberField label="Contrib growth (%/yr)" value={params.contribGrowth} step={0.1}
              onChange={(v) => setParams((p) => ({ ...p, contribGrowth: clampBy(v, "contribGrowth") }))} />
            <PercentField label="Expected return (%/yr)" value={params.rtn}
              onChange={(v) => setParams((p) => ({ ...p, rtn: clampBy(v, "rtn") }))} />
            <PercentField label="Volatility (%/yr)" value={params.vol}
              onChange={(v) => setParams((p) => ({ ...p, vol: clampBy(v, "vol") }))} />
            <PercentField label="Fees (%/yr)" value={params.fees} step={0.05}
              onChange={(v) => setParams((p) => ({ ...p, fees: clampBy(v, "fees") }))} />
            <PercentField label="Inflation (%/yr)" value={params.inflation} step={0.1}
              onChange={(v) => setParams((p) => ({ ...p, inflation: clampBy(v, "inflation") }))} />
            <NumberField label="Simulations" value={params.sims} min={LIMITS.sims.min} max={LIMITS.sims.max}
              onChange={(v) => setParams((p) => ({ ...p, sims: clampBy(v, "sims") }))} />
            <NumberField label="Target balance (end)" value={params.target}
              onChange={(v) => setParams((p) => ({ ...p, target: clampBy(v, "target") }))} />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={params.real}
                onChange={(e) => setParams((p) => ({ ...p, real: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Show values in <span className="font-medium">real (inflation-adjusted)</span> dollars
            </label>
          </div>
        </div>

        {/* Chart */}
        <div className={`${gradientCard} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Projection</h3>
            <span className="text-xs text-slate-500">P10 / P50 / P90 bands</span>
          </div>
          <ForecastChart p10={p10} p50={p50} p90={p90} years={params.years} real={params.real} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
            <LegendDot color="bg-fuchsia-400/70" label="P10" />
            <LegendDot color="bg-slate-400/70" label="P50" />
            <LegendDot color="bg-indigo-400/70" label="P90" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Reusable UI
--------------------------------------------------------*/
function currencyFmt(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0)
  } catch {
    return `$${Math.round(n || 0).toLocaleString()}`
  }
}
function last(a) { return a[a.length - 1] }

function Stat({ label, value, highlight }) {
  return (
    <div className={`${gradientCard} p-4`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${highlight ? "text-indigo-700" : "text-slate-900"}`}>{currencyFmt(value)}</div>
    </div>
  )
}

function TargetStat({ target, prob }) {
  return (
    <div className={`${gradientCard} p-4`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Target probability</div>
      <div className="mt-1 text-lg font-semibold">{prob}%</div>
      <div className="mt-1 text-xs text-slate-500">Target: {currencyFmt(target)}</div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${clamp(prob, 0, 100)}%` }} />
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input w-full"
      />
    </label>
  )
}
function PercentField({ label, value, onChange, step = 0.1 }) {
  return <NumberField label={label} value={value} step={step} onChange={onChange} />
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  )
}

/* -------------------------------------------------------
   SVG Chart (no external deps)
--------------------------------------------------------*/
function ForecastChart({ p10, p50, p90, years, real }) {
  const padding = { t: 12, r: 10, b: 24, l: 44 }
  const w = 720
  const h = 300

  const months = p50.length - 1
  const maxY = Math.max(...p90)
  const yNice = niceMax(maxY)
  const yTicks = ticks(0, yNice, 5)

  const x = (i) => padding.l + (i / months) * (w - padding.l - padding.r)
  const y = (v) => h - padding.b - (v / yNice) * (h - padding.t - padding.b)

  const path = (arr) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ")
  const areaP10P90 =
    `M${x(0)},${y(p10[0])} ` +
    p10.map((v, i) => `L${x(i)},${y(v)}`).join(" ") +
    " " +
    p90.map((_, i, a) => `L${x(a.length - 1 - i)},${y(p90[a.length - 1 - i])}`).join(" ") +
    " Z"

  const yearTicks = Array.from({ length: years + 1 }, (_, i) => Math.round(((i * months) / years) || 0))

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={padding.l} y1={y(v)} x2={w - padding.r} y2={y(v)} className="stroke-slate-200" />
            <text x={padding.l - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" className="fill-slate-500 text-[10px]">
              {shortCurrency(v)}
            </text>
          </g>
        ))}
        {yearTicks.map((mi, i) => (
          <line key={i} x1={x(mi)} y1={h - padding.b} x2={x(mi)} y2={padding.t} className="stroke-slate-100" />
        ))}
        <text x={(w - padding.l - padding.r) / 2 + padding.l} y={h - 6} textAnchor="middle" className="fill-slate-500 text-[10px]">
          Years
        </text>

        <path d={areaP10P90} className="fill-indigo-200/35" />
        <path d={path(p90)} className="fill-none stroke-indigo-500" strokeWidth="2" />
        <path d={path(p50)} className="fill-none stroke-slate-500" strokeWidth="2" strokeDasharray="3 3" />
        <path d={path(p10)} className="fill-none stroke-fuchsia-500" strokeWidth="2" />
      </svg>
      <div className="mt-1 text-[10px] text-slate-500">{real ? "Real (inflation-adjusted) dollars" : "Nominal dollars"}</div>
    </div>
  )
}

/* -------------------------------------------------------
   Chart axis helpers
--------------------------------------------------------*/
function niceMax(v) {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = Math.pow(10, exp)
  const m = v / base
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10
  return nice * base
}
function ticks(min, max, count) {
  const step = (max - min) / count
  return Array.from({ length: count + 1 }, (_, i) => min + i * step)
}
function shortCurrency(n) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${Math.round(n)}`
}
