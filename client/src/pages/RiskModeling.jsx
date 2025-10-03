// FILE: client/src/pages/RiskModeling.jsx
import { useMemo, useState } from "react"

const gradientCard =
  "relative overflow-hidden rounded-2xl border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(120deg,#c7d2fe,#f5d0fe)_border-box] shadow-sm"

const LIMITS = {
  start: { min: 0, max: 1e9 },
  monthly: { min: -1e7, max: 1e7 },
  years: { min: 1, max: 60 },
  rtn: { min: -10, max: 20 },
  vol: { min: 0, max: 60 },
  sims: { min: 100, max: 2000 },
  target: { min: 0, max: 1e12 },
}
const clamp = (n, a, b) => Math.min(b, Math.max(a, n))
const clampBy = (v, k) => clamp(Number(v || 0), LIMITS[k].min, LIMITS[k].max)
const monthsInYear = 12
const MAX_BAL = 1e13

function randn() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function monthlyParams(annualReturnPct, annualVolPct) {
  const r = (annualReturnPct || 0) / 100
  const volA = (annualVolPct || 0) / 100
  const muLogM = Math.log(1 + r) / monthsInYear
  const sigM = volA / Math.sqrt(monthsInYear)
  return { muLogM, sigM }
}

function simulate({ start, monthly, years, rtn, vol, sims, target }) {
  const months = clampBy(years, "years") * monthsInYear
  const { muLogM, sigM } = monthlyParams(rtn, vol)
  const ruinFlags = new Array(sims).fill(false)
  const ends = new Array(sims).fill(0)
  const ddMax = new Array(sims).fill(0)

  for (let s = 0; s < sims; s++) {
    let bal = clampBy(start, "start")
    let peak = bal
    let ruined = false

    for (let m = 1; m <= months; m++) {
      bal += clampBy(monthly, "monthly")
      const growth = Math.exp(muLogM - 0.5 * sigM * sigM + sigM * randn())
      bal = bal * growth
      if (!Number.isFinite(bal) || bal > MAX_BAL) bal = MAX_BAL
      if (bal < 0) bal = 0

      peak = Math.max(peak, bal)
      const dd = peak > 0 ? 1 - bal / peak : 0
      ddMax[s] = Math.max(ddMax[s], dd)

      if (bal <= 0.01) ruined = true
    }
    ends[s] = bal
    ruinFlags[s] = ruined
  }

  const sortedEnds = [...ends].sort((a, b) => a - b)
  const pct = (p) => sortedEnds[Math.floor((p / 100) * (sortedEnds.length - 1))]
  const probTarget = sortedEnds.filter((v) => v >= target).length / sims
  const probRuin = ruinFlags.filter(Boolean).length / sims
  const avgDD = ddMax.reduce((a, b) => a + b, 0) / sims

  return {
    ends,
    p10: pct(10),
    p50: pct(50),
    p90: pct(90),
    probTarget: Math.round(probTarget * 100),
    probRuin: Math.round(probRuin * 100),
    avgDD: Math.round(avgDD * 100),
  }
}

export default function RiskModeling() {
  const [p, setP] = useState({
    start: 25000,
    monthly: -1000,
    years: 25,
    rtn: 6,
    vol: 15,
    sims: 1000,
    target: 100000,
  })
  const res = useMemo(
    () =>
      simulate({
        start: p.start,
        monthly: p.monthly,
        years: p.years,
        rtn: p.rtn,
        vol: p.vol,
        sims: clampBy(p.sims, "sims"),
        target: clampBy(p.target, "target"),
      }),
    [p]
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className={`${gradientCard} p-4 sm:p-6`}>
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <h1 className="text-3xl font-semibold">
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            Risk & Stress Test
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">Monte-Carlo drawdown & ruin analysis.</p>
        <div className="mt-4 h-[2px] w-full rounded-full bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-transparent" />
      </div>

      <div className="mb-6 mt-4 grid gap-3 md:grid-cols-4">
        <Kpi label="P10 (end balance)" value={res.p10} />
        <Kpi label="P50 (end balance)" value={res.p50} highlight />
        <Kpi label="P90 (end balance)" value={res.p90} />
        <Kpi label="Hit target" value={`${res.probTarget}%`} />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.05fr_.95fr]">
        <div className={`${gradientCard} p-4`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Num label="Starting balance" value={p.start} onChange={(v) => setP((x) => ({ ...x, start: clampBy(v, "start") }))} />
            <Num label="Monthly (+contrib / −withdraw)" value={p.monthly} onChange={(v) => setP((x) => ({ ...x, monthly: clampBy(v, "monthly") }))} />
            <Num label="Years" value={p.years} min={LIMITS.years.min} max={LIMITS.years.max} onChange={(v) => setP((x) => ({ ...x, years: clampBy(v, "years") }))} />
            <Num label="Target (end)" value={p.target} onChange={(v) => setP((x) => ({ ...x, target: clampBy(v, "target") }))} />
            <Num label="Expected return %/yr" value={p.rtn} step={0.1} onChange={(v) => setP((x) => ({ ...x, rtn: clampBy(v, "rtn") }))} />
            <Num label="Volatility %/yr" value={p.vol} step={0.1} onChange={(v) => setP((x) => ({ ...x, vol: clampBy(v, "vol") }))} />
            <Num label="Simulations" value={p.sims} min={LIMITS.sims.min} max={LIMITS.sims.max} onChange={(v) => setP((x) => ({ ...x, sims: clampBy(v, "sims") }))} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <Badge tone="danger" label="Prob. of ruin" value={`${res.probRuin ?? 0}%`} />
            <Badge tone="warning" label="Avg. max drawdown" value={`${res.avgDD ?? 0}%`} />
            <Badge tone="indigo" label="Target hit" value={`${res.probTarget ?? 0}%`} />
          </div>
        </div>

        <div className={`${gradientCard} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Distribution of end balances</h3>
            <span className="text-xs text-slate-700">P10 / P50 / P90 markers</span>
          </div>
          <Histogram values={res.ends} p10={res.p10} p50={res.p50} p90={res.p90} />
        </div>
      </div>
    </div>
  )
}

/* ---------- UI helpers ---------- */
function currencyFmt(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0)
}
function Kpi({ label, value, highlight }) {
  const display = typeof value === "number" ? currencyFmt(value) : value
  return (
    <div className={`${gradientCard} p-4`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${highlight ? "text-indigo-700" : "text-slate-900"}`}>{display}</div>
    </div>
  )
}
function Num({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">{label}</span>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="input w-full" />
    </label>
  )
}
function Badge({ tone = "indigo", label, value }) {
  const map = {
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  }
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2 ${map[tone]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/* ---------- High-visibility SVG Histogram ---------- */
function Histogram({ values, bins = 28, p10 = 0, p50 = 0, p90 = 0 }) {
  if (!values?.length) return null

  const w = 720
  const h = 300
  const pad = { l: 64, r: 14, t: 18, b: 40 }

  const max = Math.max(...values)
  const degenerate = !(max > 0)

  const niceMax = (v) => {
    if (v <= 0) return 1
    const exp = Math.floor(Math.log10(v))
    const base = Math.pow(10, exp)
    const m = v / base
    const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10
    return n * base
  }
  const xmax = niceMax(max)

  // format ticks so they don't all read "$0"
  const fmtTick = (v) => {
    if (xmax < 10) return `$${v.toFixed(1)}`
    if (xmax < 1000) return `$${Math.round(v)}`
    if (xmax < 1_000_000) return `$${(v / 1_000).toFixed(0)}k`
    if (xmax < 1_000_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    return `$${(v / 1_000_000_000).toFixed(1)}B`
  }

  const x = (v) => pad.l + ((v - 0) / (xmax - 0)) * (w - pad.l - pad.r)

  // histogram
  const hist = new Array(bins).fill(0)
  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v / xmax) * bins))
    hist[idx]++
  }
  const ymax = Math.max(...hist, 1)
  const y = (c) => h - pad.b - (c / ymax) * (h - pad.t - pad.b)

  const xTicks = 5
  const ticks = Array.from({ length: xTicks + 1 }, (_, i) => (i / xTicks) * xmax)
  const yTicks = 4
  const yt = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((i / yTicks) * ymax))

  return (
    <div className="relative w-full overflow-hidden">
      {degenerate && (
        <div className="absolute inset-0 z-10 grid place-items-center">
          <div className="rounded-xl border border-slate-300 bg-white/95 px-3 py-2 text-[13px] text-slate-800 shadow-sm">
            All paths ended at <strong>$0</strong> (ruin under current settings)
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {/* horizontal grid + Y axis ticks (counts) */}
        {yt.map((c, i) => (
          <g key={`y${i}`}>
            <line x1={pad.l} x2={w - pad.r} y1={y(c)} y2={y(c)} className="stroke-slate-200" />
            <text
              x={pad.l - 8}
              y={y(c)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#0f172a"
              fontSize="12"
              fontWeight="600"
            >
              {c}
            </text>
          </g>
        ))}

        {/* vertical grid + X axis ticks */}
        {ticks.map((v, i) => (
          <g key={`x${i}`}>
            <line x1={x(v)} y1={h - pad.b} x2={x(v)} y2={pad.t} className="stroke-slate-100" />
            <text
              x={x(v)}
              y={h - pad.b + 18}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="12"
              fontWeight="600"
            >
              {fmtTick(v)}
            </text>
          </g>
        ))}

        {/* strong baseline */}
        <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#94a3b8" strokeWidth="1.5" />

        {/* bars with labels */}
        {hist.map((c, i) => {
          const bw = (w - pad.l - pad.r) / bins - 2
          const x0 = pad.l + i * ((w - pad.l - pad.r) / bins) + 1
          const y0 = y(c)
          const showLabel = c > 0 && (h - pad.b - y0) > 18
          return (
            <g key={i}>
              <rect
                x={x0}
                y={y0}
                width={bw}
                height={h - pad.b - y0}
                fill="rgba(99,102,241,0.9)" /* indigo-500/90 */
                stroke="white"
                strokeWidth="0.75"
                rx="2"
              />
              {showLabel && (
                <text
                  x={x0 + bw / 2}
                  y={y0 - 5}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="700"
                >
                  {c}
                </text>
              )}
            </g>
          )
        })}

        {/* percentile markers with badges */}
        {[{ v: p10, c: "#f472b6", label: "P10" }, { v: p50, c: "#334155", label: "P50" }, { v: p90, c: "#6366f1", label: "P90" }].map((m, i) => (
          <g key={i}>
            <line x1={x(m.v)} x2={x(m.v)} y1={pad.t} y2={h - pad.b} stroke={m.c} strokeWidth="3" strokeLinecap="round" />
            <g transform={`translate(${x(m.v)}, ${pad.t + 12})`}>
              <rect x={-58} y={-13} width="116" height="24" rx="7" fill="white" stroke={m.c} />
              <text textAnchor="middle" dominantBaseline="middle" fill={m.c} fontSize="11" fontWeight="700">
                {m.label}: {formatBadge(m.v)}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}

function formatBadge(v) {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
  return `$${Math.round(v)}`
}
