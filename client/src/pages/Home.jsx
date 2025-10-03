// FILE: client/src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import InsightsSection from "../components/InsightsSection"
import { Icon } from "../components/Icons"

/* -----------------------------------------------------------------------------
  Currency helpers
 ----------------------------------------------------------------------------- */
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const fmt0 = (n) => fmt.format(Math.max(0, Math.round(n)))

/* -----------------------------------------------------------------------------
  Micro charts (using Icons component now imported from separate file)
 ----------------------------------------------------------------------------- */

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
    <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-6">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl"></div>
      <div className="absolute top-1/2 -left-32 h-48 w-48 rounded-full bg-indigo-200/25 blur-3xl"></div>
      
      {/* Feature announcement badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-blue-500">
          <span className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
        </span>
        New • Polished Budget + local scenarios
      </div>
      
      {/* Main heading with gradient highlight */}
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-[56px] leading-tight">
        Plan, forecast, and{" "}
        <span className="relative inline-block">
          <span className="relative z-10">stress-test your money</span>
          <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-blue-300/50 to-indigo-300/50 -z-10 transform skew-x-12"></span>
        </span>
      </h1>
      
      {/* Subheading with animated highlight */}
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Budgeting, forecasting, risk analysis, and net-worth tracking — 
        <span className="relative inline-block mx-1 font-medium">
          <span className="relative text-slate-800">fast, clear, and privacy-first.</span>
          <span className="absolute -bottom-0.5 left-0 right-0 h-2 bg-gradient-to-r from-blue-200/60 to-indigo-200/60 -z-10"></span>
        </span>
      </p>
      
      {/* CTA buttons with enhanced styling */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link to="/budget" className="relative overflow-hidden rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)] group">
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute right-0 bottom-0 h-16 w-16 -rotate-45 translate-x-8 translate-y-8 bg-white/10 transform transition-transform duration-500 ease-out group-hover:translate-y-6"></span>
          <span className="relative flex items-center gap-2">
            Plan my budget
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </Link>
        
        <Link to="/forecast" className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-5 py-3.5 text-base font-semibold text-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
          <span className="absolute inset-0 bg-gradient-to-r from-slate-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center gap-2">
            Run a forecast 
            <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
        
        <Link to="/help" className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-5 py-3.5 text-base font-semibold text-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
          <span className="absolute inset-0 bg-gradient-to-r from-slate-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center gap-2">
            Learn finance
            <Icon name="book" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
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
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-lg transition-all duration-300 hover:shadow-xl backdrop-blur-sm relative overflow-hidden group">
      {/* Interactive gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Card header with animation */}
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6V3l4 4-4 4V8c-3.3 0-6 2.7-6 6 0 1 .3 2 .8 2.8l-1.4 1.4C4.5 16.8 4 15.5 4 14c0-4.4 3.6-8 8-8zm8 8c0 1.5-.5 2.8-1.4 4L17.2 18c.5-.8.8-1.8.8-2.8 0-3.3-2.7-6-6-6v3l-4-4 4-4v3c4.4 0 8 3.6 8 8z" />
            </svg>
          </div>
          <div className="text-[16px] font-semibold text-slate-900">Interactive Demo</div>
        </div>
        <button
          className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-100 transition-colors duration-200"
          onClick={() => { setIncome(3200); setRent(1200); setGroceries(300) }}
        >
          Reset values
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6V3l-4 4 4 4V8c3.3 0 6 2.7 6 6 0 1-.3 2-.8 2.8l1.4 1.4c.9-1.2 1.4-2.5 1.4-4 0-4.4-3.6-8-8-8z" />
          </svg>
        </button>
      </div>

      {/* Enhanced inputs with icons */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Monthly income
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value || 0))}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 px-8 text-slate-900 outline-none transition-all duration-200 
                         focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100/50 shadow-sm"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">USD</span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            Use whole numbers; you can fine-tune later.
          </p>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M9 22V12h6v10" />
            </svg>
            Rent
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={rent}
              onChange={(e) => setRent(Number(e.target.value || 0))}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 px-8 text-slate-900 outline-none transition-all duration-200 
                         focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100/50 shadow-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM16 10a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M7 21l2.6-5.2a5 5 0 016.8 0L19 21" />
            </svg>
            Groceries
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={groceries}
              onChange={(e) => setGroceries(Number(e.target.value || 0))}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 px-8 text-slate-900 outline-none transition-all duration-200 
                         focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100/50 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Enhanced output section */}
      <div className="mt-6 flex flex-col gap-5 md:flex-row">
        {/* Savings meter with enhanced styling */}
        <div className="flex w-full flex-none items-center gap-4 md:w-auto">
          <div className="relative">
            <SavingsMeter pct={pct} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-700">Monthly Savings</div>
            <div className="text-2xl font-bold text-slate-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {fmt0(savings)}
            </div>
            <div className="text-[13px] text-slate-600 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 17h3a2 2 0 002-2V9a2 2 0 00-2-2h-3m-6 10H7a2 2 0 01-2-2V9a2 2 0 012-2h3m0 4h4" />
              </svg>
              from {fmt0(income)} income
            </div>
          </div>
        </div>

        {/* Enhanced sparkline with card styling */}
        <div className="w-full min-w-0">
          <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-3 shadow-sm transition-all duration-300 group-hover:shadow-md overflow-hidden relative">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">Financial Overview</div>
              <div className="text-xs text-slate-500">6 month projection</div>
            </div>
            <div className="h-20 w-full overflow-hidden">
              <TinySparkline points={spark} stroke="url(#sparkGradient)" />
              <svg className="h-0 w-0">
                <defs>
                  <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTAs */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button 
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300" 
          onClick={() => nav("/budget")}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10l-2-4h-3l1-4h-2l-1 4h-4l1-4h-2l-1 4H6L4 10h3l-1 4h-3l-2 4h3l-1 4h2l1-4h4l-1 4h2l1-4h3l2-4h-3l1-4h3zm-11 4h-4l1-4h4l-1 4z" />
          </svg>
          Open Full Budget
        </button>
        <button
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all duration-300"
          onClick={() => nav("/forecast")}
        >
          <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 14l4-4 4 4 8-8" />
            <path d="M4 20h16M18 4h2v2" />
          </svg>
          Create Forecast
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
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-lg transition-all duration-300 hover:shadow-xl backdrop-blur-sm relative overflow-hidden group">
      {/* Interactive gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Card header with icon */}
      <div className="flex items-center gap-2 relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100">
          <svg className="h-4 w-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-[16px] font-semibold text-slate-900">Why Finico?</div>
      </div>
      
      {/* Feature list with enhanced styling */}
      <ul className="mt-4 space-y-4 relative">
        {items.map((it, index) => (
          <li key={it.title} className="flex items-start gap-3.5 transition-transform duration-300 hover:translate-x-1">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <Icon name={it.icon} className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{it.title}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{it.desc}</div>
            </div>
          </li>
        ))}
      </ul>

      {/* Enhanced education promo card */}
      <div className="mt-6 rounded-xl border border-slate-200/80 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm relative overflow-hidden group-hover:shadow-md transition-all duration-300">
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-t from-indigo-100/50 to-transparent rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.4a12 12 0 01.2 6.8m-12.72 0a12 12 0 01.2-6.8L12 14"/>
              <path d="M12 14v10"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Financial Education</div>
            <div className="text-sm font-medium text-slate-700">Bite-sized guides for budgeting & risk analysis</div>
            <Link to="/help" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-indigo-700 transition-colors duration-200">
              Explore guides
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
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
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-lg transition-all duration-300 hover:shadow-xl backdrop-blur-sm relative overflow-hidden group">
      {/* Interactive gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Card header with icon */}
      <div className="flex items-center gap-2 relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
          <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div className="text-[16px] font-semibold text-slate-900">Financial Snapshot</div>
      </div>
      
      {/* Stats grid with enhanced styling */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((s, idx) => (
          <div 
            key={s.label} 
            className="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden relative group/stat"
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase relative">{s.label}</div>
            <div className="mt-1 text-lg font-bold text-slate-900 relative bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text group-hover/stat:text-transparent transition-colors duration-500">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced activity chart */}
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
          </div>
          <Link to="/help" className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-purple-700 transition-colors duration-200">
            View details
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        <div className="mt-3 h-20 w-full overflow-hidden relative">
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-purple-50/30 to-transparent rounded-b-lg"></div>
          <TinySparkline points={activity} stroke="url(#activityGradient)" />
          <svg className="h-0 w-0">
            <defs>
              <linearGradient id="activityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Numbers are illustrative; real usage updates soon.
      </div>
    </div>
  )
}

// InsightsSection is now imported from components/InsightsSection.jsx

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-0 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl"></div>
        <div className="absolute top-2/3 right-0 h-80 w-80 rounded-full bg-indigo-100/40 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl"></div>
      </div>
      
      {/* Wave pattern (optional) */}
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3NDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9IndhdjEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxNDQwIiBoZWlnaHQ9IjY0MCIgcGF0dGVyblRyYW5zZm9ybT0ic2NhbGUoMSkiPjxwYXRoIGQ9Ik0wIDQwYzIwIDAgNDAgNDAgODAgNDBzNjAtNDAgODAtNDAgNjAgNDAgODAgNDBjNDAgMCA2MC00MCA4MC00MHM0MCA0MCA4MCA0MCA2MC00MCA4MC00MCA0MCA0MCA4MCA0MCA2MC00MCA4MC00MCA0MCA0MCA4MCA0MCA2MC00MCA4MC00MCA0MCA0MCA4MCA0MCA2MC00MCA4MC00MCA0MCA0MCA4MCA0MCA2MC00MCA4MC00MCA0MCA0MCA4MCA0MCA2MC00MCA4MC00MHY2MDBIMFYweiIgb3BhY2l0eT0iLjA1IiBmaWxsPSIjYzdjZGZlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2MSkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <Hero />
      
      {/* Main content section with subtle animation */}
      <section className="relative mx-auto mt-8 max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="transform transition-all duration-500 hover:translate-y-[-8px]">
            <QuickDemoCard />
          </div>
          <div className="transform transition-all duration-500 hover:translate-y-[-8px] delay-75">
            <WhyFinicoCard />
          </div>
          <div className="transform transition-all duration-500 hover:translate-y-[-8px] delay-150">
            <AtAGlanceCard />
          </div>
        </div>
      </section>
      
      {/* Divider with subtle animation */}
      <div className="relative mx-auto my-12 max-w-4xl">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-slate-500">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
      
      <InsightsSection />
      <FloatingTips />
    </div>
  )
}