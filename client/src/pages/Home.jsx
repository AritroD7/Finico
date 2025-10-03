// FILE: client/src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

/* -----------------------------------------------------------------------------
  Currency helpers
 ----------------------------------------------------------------------------- */
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const fmt0 = (n) => fmt.format(Math.max(0, Math.round(n)))

/* -----------------------------------------------------------------------------
  Inline icon set (no external deps)
 ----------------------------------------------------------------------------- */
function Icon({ name, className = "h-4 w-4", stroke = "currentColor" }) {
  const p = { fill: "none", stroke, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "flash":   return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M13 2L3 14h7l-1 8L21 8h-7l-1-6z"/></svg>)
    case "lock":    return (<svg viewBox="0 0 24 24" className={className} {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>)
    case "export":  return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><rect x="4" y="15" width="16" height="6" rx="2"/></svg>)
    case "calc":    return (<svg viewBox="0 0 24 24" className={className} {...p}><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 6h10M7 10h4M7 14h4M7 18h10"/></svg>)
    case "book":    return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M20 22H6.5A2.5 2.5 0 014 19.5V5.6A2.6 2.6 0 016.6 3H20v19z"/><path d="M8 3v14"/></svg>)
    case "arrow":   return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>)
    default:        return null
  }
}

/* -----------------------------------------------------------------------------
  Micro charts (sparkline + donut)
 ----------------------------------------------------------------------------- */
function TinySparkline({ points = [], className = "h-20 w-full", stroke = "#60a5fa" }) {
  // strict height to avoid layout collapse
  const H = 80, W = 180, PAD = 8
  if (!points.length) return <div className={className} />
  const xs = points.map((_, i) => PAD + (i * (W - PAD * 2)) / (points.length - 1))
  const min = Math.min(...points), max = Math.max(...points)
  const ys = points.map(v => H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2))
  const d = xs.map((x, i) => `${i ? "L" : "M"}${x},${ys[i]}`).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className}>
      <path d={d} fill="none" stroke={stroke} strokeWidth="2.5" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="1.8" fill={stroke} />)}
    </svg>
  )
}

function SavingsMeter({ pct = 0 }) {
  const clamp = Math.max(0, Math.min(100, pct))
  const r = 28, C = 2 * Math.PI * r, dash = (clamp / 100) * C
  return (
    <div className="relative grid h-24 w-24 flex-none place-items-center">
      <svg viewBox="0 0 72 72" className="h-24 w-24">
        <circle cx="36" cy="36" r={r} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <circle cx="36" cy="36" r={r} stroke="url(#saveG)" strokeWidth="8"
                strokeDasharray={`${dash} ${C - dash}`} strokeLinecap="round"
                fill="none" transform="rotate(-90 36 36)"/>
        <defs>
          <linearGradient id="saveG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-slate-900">{Math.round(clamp)}%</div>
        <div className="text-[11px] text-slate-500">savings rate</div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
  Sections
 ----------------------------------------------------------------------------- */
function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/50 px-3 py-1 text-xs font-semibold text-blue-700">
        <span className="h-2 w-2 rounded-full bg-blue-500" /> New • Polished Budget + local scenarios
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-[44px]">
        Plan, forecast, and <span className="brand-text">stress-test your money</span>.
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Budgeting, forecasting, risk analysis, and net-worth tracking — fast, clear, and privacy-first.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to="/budget" className="btn-primary">Plan my budget</Link>
        <Link to="/forecast" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Run a forecast <Icon name="arrow" className="h-4 w-4" />
        </Link>
        <Link to="/help" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Learn finance <Icon name="book" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

function QuickDemoCard() {
  const nav = useNavigate()
  const [income, setIncome] = useState(3200)
  const [rent, setRent] = useState(1200)
  const [groceries, setGroceries] = useState(300)

  const expenses = rent + groceries
  const savings = Math.max(0, income - expenses)
  const pct = Math.max(0, Math.min(100, (savings / Math.max(1, income)) * 100))

  const spark = useMemo(() => {
    const base = Math.max(120, Math.min(300, income / 12))
    const arr = [base - 20, base + 8, base - 5, base + 18, base + 4, base + 24]
    return arr.map((n) => n - (rent / 80) + (groceries / 40))
  }, [income, rent, groceries])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold text-slate-900">Quick demo</div>
        <button
          className="text-xs text-blue-700 hover:underline"
          onClick={() => { setIncome(3200); setRent(1200); setGroceries(300) }}
        >
          Try it ↓
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <label className="text-[12px] font-semibold text-slate-600">Monthly income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value || 0))}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-[11px] text-slate-500">Tip: use whole numbers; you can fine-tune later.</p>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-slate-600">Rent</label>
          <input
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value || 0))}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-slate-600">Groceries</label>
          <input
            type="number"
            value={groceries}
            onChange={(e) => setGroceries(Number(e.target.value || 0))}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Outputs (robust layout) */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        {/* Donut + numbers (never shrink) */}
        <div className="flex w-full flex-none items-center gap-4 md:w-auto">
          <SavingsMeter pct={pct} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Savings</div>
            <div className="text-xl font-bold text-slate-900">{fmt0(savings)}</div>
            <div className="text-[12px] text-slate-600">of {fmt0(income)} income</div>
          </div>
        </div>

        {/* Sparkline block (strict height + full width) */}
        <div className="w-full min-w-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="h-20 w-full overflow-hidden">
              <TinySparkline points={spark} stroke="#60a5fa" />
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => nav("/budget")}>Open Budget</button>
        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => nav("/forecast")}
        >
          Forecast
        </button>
      </div>
    </div>
  )
}

function WhyFinicoCard() {
  const items = [
    { icon: "flash",  title: "Instant results", desc: "Polished charts with clear, editable inputs." },
    { icon: "calc",   title: "Solid math",      desc: "Compounding, real vs nominal, Monte-Carlo." },
    { icon: "lock",   title: "Local-first",     desc: "Your data stays on your device by default." },
    { icon: "export", title: "Share & export",  desc: "Snapshots you can keep or send to others." },
  ]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="text-[15px] font-semibold text-slate-900">Why Finico?</div>
      <ul className="mt-3 space-y-3">
        {items.map((it) => (
          <li key={it.title} className="flex items-start gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
              <Icon name={it.icon} className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{it.title}</div>
              <div className="text-sm text-slate-600">{it.desc}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-slate-700">Education</div>
            <div className="text-sm text-slate-600">Bite-sized guides for budgeting & risk.</div>
          </div>
          <Link to="/help" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
            Read guides <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function AtAGlanceCard() {
  const stats = [
    { label: "BUDGETS", value: "$12,400" },
    { label: "FORECASTS", value: "$8,600" },
    { label: "RISK SIMS", value: "$4,900" },
    { label: "SATISFACTION", value: "98%" },
  ]
  const activity = [7, 10, 9, 12, 8, 14, 16, 13]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="text-[15px] font-semibold text-slate-900">At a glance</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] font-semibold tracking-wide text-slate-500">{s.label}</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Recent activity</div>
          <Link to="/help" className="text-xs text-blue-700 hover:underline">View details</Link>
        </div>
        <div className="mt-2 h-20 w-full overflow-hidden">
          <TinySparkline points={activity} stroke="#6366f1" />
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">Numbers are illustrative; real usage updates soon.</p>
    </div>
  )
}

function InsightsSection() {
  const cards = [
    { tag: "Guide • 6 min", title: "The 50/30/20 rule — still useful in 2025?", blurb: "A quick primer with real-world tweaks for high-inflation periods.", href: "/help" },
    { tag: "Guide • 4 min", title: "Nominal vs real returns (and why it matters).", blurb: "See how inflation changes your wealth picture, with a tiny example.", href: "/help" },
    { tag: "Guide • 5 min", title: "Monte-Carlo: plan for best / worst cases.", blurb: "Stress-test your plan so surprises don’t derail your goals.", href: "/risk" },
  ]
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4">
      <div className="text-xl font-bold text-slate-900">Financial insights</div>
      <p className="mt-1 text-slate-600">Bite-sized guides to build confidence with money.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="pointer-events-none absolute -inset-12 -z-10 aurora-bg opacity-30 transition-opacity group-hover:opacity-50" />
            <div className="text-[11px] font-semibold text-blue-700">{c.tag}</div>
            <h3 className="mt-1 text-[15px] font-semibold text-slate-900">{c.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{c.blurb}</p>
            <Link to={c.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
              Read <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4">
        <Link to="/help" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          View all insights <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* -----------------------------------------------------------------------------
  Floating tip (gentle + frequency-limited)
 ----------------------------------------------------------------------------- */
const TIPS = [
  { id: "t1", icon: "💡", title: "Pro tip", text: "Use presets to see savings change instantly.", cta: { label: "Presets", href: "/budget#presets" } },
  { id: "t2", icon: "📚", title: "Learn finance", text: "Read our 50/30/20 guide in 6 minutes.", cta: { label: "Open guide", href: "/help" } },
  { id: "t3", icon: "🧮", title: "Risk 101", text: "Monte-Carlo shows best/worst cases.", cta: { label: "Run risk", href: "/risk" } },
]
function FloatingTips() {
  const SHOW_MS = 7000, GAP_MS = 20000, KEY = "finico.tip.nextAt"
  const [tip, setTip] = useState(null)

  useEffect(() => {
    let tShow, tHide
    const now = Date.now(), nextAt = Number(localStorage.getItem(KEY) || 0)
    const startDelay = Math.max(0, nextAt - now) || 1500
    const show = () => {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)])
      tHide = setTimeout(() => {
        setTip(null)
        localStorage.setItem(KEY, String(Date.now() + GAP_MS))
        tShow = setTimeout(show, GAP_MS)
      }, SHOW_MS)
    }
    tShow = setTimeout(show, startDelay)
    return () => { clearTimeout(tShow); clearTimeout(tHide) }
  }, [])

  if (!tip) return null
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[45] w-[320px]">
      <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl">
        <div className="flex items-start gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-lg">{tip.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{tip.title}</div>
            <div className="text-sm text-slate-600">{tip.text}</div>
            {tip.cta && <Link to={tip.cta.href} className="mt-1 inline-flex text-[13px] text-blue-700 hover:underline">{tip.cta.label} →</Link>}
          </div>
          <button onClick={() => { setTip(null); localStorage.setItem(KEY, String(Date.now() + GAP_MS)) }}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
  Page
 ----------------------------------------------------------------------------- */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Hero />
      <section className="mx-auto mt-5 max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickDemoCard />
          <WhyFinicoCard />
          <AtAGlanceCard />
        </div>
      </section>
      <InsightsSection />
      <FloatingTips />
    </div>
  )
}
