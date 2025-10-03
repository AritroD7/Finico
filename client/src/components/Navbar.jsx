// FILE: client/src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import logo from "../assets/finico-high-resolution-logo-transparent.png"
import { API_BASE } from "../api"

const cx = (...a) => a.filter(Boolean).join(" ")

/* --------------------------- small inline icons --------------------------- */
function Icon({ name, className = "h-4 w-4" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "budget":    return (<svg viewBox="0 0 24 24" className={className} {...common}><path d="M3 5h18M3 12h18M3 19h18"/><path d="M8 5v14"/></svg>)
    case "forecast":  return (<svg viewBox="0 0 24 24" className={className} {...common}><path d="M3 17l6-6 4 4 7-7"/><path d="M14 7h7v7"/></svg>)
    case "risk":      return (<svg viewBox="0 0 24 24" className={className} {...common}><path d="M12 2v20"/><path d="M4 6h16M4 12h8M4 18h4"/></svg>)
    case "loans":     return (<svg viewBox="0 0 24 24" className={className} {...common}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h12M6 13h8"/></svg>)
    case "networth":  return (<svg viewBox="0 0 24 24" className={className} {...common}><path d="M3 20h18"/><path d="M7 20V9l5-3 5 3v11"/></svg>)
    case "help":      return (<svg viewBox="0 0 24 24" className={className} {...common}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>)
    case "book":      return (<svg viewBox="0 0 24 24" className={className} {...common}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M20 22H6.5A2.5 2.5 0 014 19.5V5.6A2.6 2.6 0 016.6 3H20v19z"/><path d="M8 3v14"/></svg>)
    case "sparkle":   return (<svg viewBox="0 0 24 24" className={className} {...common}><path d="M12 3l1.7 3.3L17 8l-3.3 1.7L12 13l-1.7-3.3L7 8l3.3-1.7L12 3zM5 17l.8 1.5L7 20l-1.5.8L5 22l-.8-1.2L3 20l1.2-1.5L5 17zM19 14l.8 1.5L21 17l-1.5.8L19 19l-.8-1.2L17 17l1.2-1.5L19 14z"/></svg>)
    case "news":      return (<svg viewBox="0 0 24 24" className={className} {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>)
    default:          return null
  }
}

/* --------------------------- link components ---------------------------- */
function NavItem({ to, icon, children }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <NavLink
      to={to}
      className={cx(
        "relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14.5px] font-medium",
        "text-slate-700 hover:text-slate-900 transition-all duration-300",
        "before:absolute before:inset-0 before:z-0 before:rounded-lg before:opacity-0 before:transition-opacity",
        "before:bg-gradient-to-r before:from-blue-50 before:to-indigo-50",
        "hover:before:opacity-100"
      )}
    >
      <Icon name={icon} className="relative z-10 h-[18px] w-[18px] text-blue-600/80" />
      <span className="relative z-10">{children}</span>
      <span
        className={cx(
          "absolute -bottom-2 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full transition-all duration-300",
          "bg-gradient-to-r from-blue-500 to-indigo-500",
          active ? "w-12" : "w-0"
        )}
      />
    </NavLink>
  )
}

function DropdownLink({ to, icon, children }) {
  return (
    <li>
      <NavLink
        to={to}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      >
        <Icon name={icon} className="h-[16px] w-[16px] text-blue-600/80" />
        <span>{children}</span>
      </NavLink>
    </li>
  )
}
function MobileLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-slate-700 hover:bg-slate-100"
    >
      <Icon name={icon} className="h-[18px] w-[18px] text-blue-600/80" />
      <span>{children}</span>
    </NavLink>
  )
}

/* -------------------------------- NEWS STRIP ------------------------------ */
/* Fetches from Flask: GET ${API_BASE}/news/ticker
   Items contain: { title, url, source } and are rendered as external links. */
function NewsStrip() {
  const [paused, setPaused] = useState(false)
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/news/ticker`, { credentials: "omit" })
        const data = await res.json()
        if (!cancelled && Array.isArray(data?.items)) {
          const mapped = data.items.slice(0, 24).map((it) => ({
            text: it.title,
            href: it.url,         // absolute external link from backend
            source: it.source,
            type: "article",
          }))
          setItems(mapped)
        }
      } catch {
        if (!cancelled) {
          // very small fallback if backend is down
          setItems([
            { type: "article",  text: "New: Sinking funds guide (5 min)", href: "/help" },
            { type: "marketUp", text: "Markets firmer • CPI cools",       href: "/help" },
            { type: "article",  text: "50/30/20 rule in 2025",            href: "/help" },
          ])
        }
      }
    })()
    return () => { cancelled = true }
  }, [])

  const badge = (t) => {
    if (t === "article")  return <span className="mr-2 rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">GUIDE</span>
    if (t === "marketUp") return <span className="mr-2 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">MARKET</span>
    if (t === "marketDn") return <span className="mr-2 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">MARKET</span>
    return null
  }

  const feed = items.length ? items : [
    { type: "article", text: "Welcome to Finico — learn the basics fast", href: "/help" }
  ]

  return (
    <div className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="relative flex items-center gap-3 py-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700">
            <Icon name="news" className="h-[16px] w-[16px] text-blue-600/80" />
            News
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div
              className="flex w-max items-center gap-6 whitespace-nowrap text-sm text-slate-700"
              style={{
                animation: "ticker 42s linear infinite",
                animationPlayState: paused ? "paused" : "running",
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {feed.concat(feed).map((it, i) => (
                <a
                  key={i}
                  href={it.href}
                  target={it.href?.startsWith("http") ? "_blank" : undefined}
                  rel={it.href?.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex items-center"
                  title={it.source ? `${it.source}` : undefined}
                >
                  {badge(it.type)}
                  <span className="hover:underline">{it.text}</span>
                </a>
              ))}
            </div>
            {/* edge fades */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
          </div>

          <Link to="/help" className="hidden sm:inline-flex text-xs text-blue-700 hover:underline">
            View insights →
          </Link>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- navbar -------------------------------- */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [openLearn, setOpenLearn] = useState(false)
  const [progress, setProgress] = useState(0)
  const learnRef = useRef(null)
  const location = useLocation()

  useEffect(() => { setOpen(false); setOpenLearn(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 6)
      const h = document.documentElement
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100
      setProgress(Math.max(0, Math.min(100, pct)))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e) => {
      if (!learnRef.current) return
      if (!learnRef.current.contains(e.target)) setOpenLearn(false)
    }
    if (openLearn) window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [openLearn])

  return (
    <header className="sticky top-0 z-50">
      {/* scroll progress */}
      <div className="fixed left-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%_100%]" 
           style={{ 
             width: `${progress}%`, 
             animation: progress > 0 ? 'shimmer 2.5s infinite linear' : 'none'
           }} 
      />

      {/* main bar */}
      <div className={cx(
        "backdrop-blur-md bg-white/95 border-b border-slate-200/80",
        "transition-all duration-300",
        scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,0.08)]" : "shadow-none"
      )}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex h-20 md:h-24 items-center justify-between gap-3">
            {/* Logo chip with animation */}
            <Link to="/" className="flex items-center group">
              <div className="relative overflow-hidden rounded-xl bg-white p-2 shadow-sm transition-all duration-300 group-hover:shadow-md">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <img
                  src={logo}
                  alt="Finico"
                  className="h-[52px] sm:h-[62px] md:h-[72px] w-auto object-contain relative z-10"
                  draggable="false"
                />
                <div className="absolute -bottom-6 -right-6 h-12 w-12 rounded-full bg-gradient-to-r from-blue-200/40 to-indigo-200/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>

            {/* desktop nav */}
            <nav className="hidden md:flex items-center gap-1.5">
              <NavItem to="/budget"   icon="budget">Budget</NavItem>
              <NavItem to="/forecast" icon="forecast">Forecast</NavItem>
              <NavItem to="/risk"     icon="risk">Risk</NavItem>
              <NavItem to="/loans"    icon="loans">Loans</NavItem>
              <NavItem to="/networth" icon="networth">Net Worth</NavItem>

              {/* Learn dropdown */}
              <div className="relative" ref={learnRef}>
                <button
                  onClick={() => setOpenLearn((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[14.5px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  <Icon name="book" className="h-[18px] w-[18px] text-blue-600/80" />
                  Learn
                  <svg width="14" height="14" viewBox="0 0 24 24" className="text-slate-500"><path fill="currentColor" d="M7 10l5 5 5-5H7z"/></svg>
                </button>

                {openLearn && (
                  <div className="absolute right-0 mt-2 w-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="aurora-bg absolute inset-0 opacity-40" />
                    <div className="relative grid grid-cols-2 gap-0">
                      <div className="p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guides</div>
                        <ul className="mt-2 space-y-1 text-sm">
                          <DropdownLink to="/help" icon="budget">Budgeting basics</DropdownLink>
                          <DropdownLink to="/help" icon="forecast">Wealth forecasting 101</DropdownLink>
                          <DropdownLink to="/help" icon="risk">Risk & Monte Carlo</DropdownLink>
                          <DropdownLink to="/help" icon="networth">Net worth tracking</DropdownLink>
                        </ul>
                      </div>
                      <div className="border-l border-slate-200 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured</div>
                        <div className="mt-2 rounded-xl border border-slate-200/70 bg-white p-3 hover:shadow-lg">
                          <div className="text-[11px] font-semibold text-blue-600">READ • 6 MIN</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            The 50/30/20 rule — does it still make sense in 2025?
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            A practical breakdown with examples and caveats for modern budgets.
                          </p>
                          <Link to="/help" className="mt-2 inline-flex items-center gap-1 text-[13px] text-blue-600 hover:underline">
                            Explore <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round"/></svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* actions */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(59,130,246,0.35)]">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sign in
                </span>
              </Link>
              <button
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-700 border-0 hover:shadow-sm transition-all duration-300"
                aria-label="Toggle menu"
                onClick={() => setOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {open ? <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* crisp brand divider */}
        <div className="brand-bg h-[2px] w-full" />
      </div>

      {/* news strip (external links via API_BASE) */}
      <div className="relative overflow-hidden border-y border-slate-200/70 bg-gradient-to-r from-slate-50/95 via-white to-slate-50/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.02),transparent_50%)]"></div>
        <NewsStrip />
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden border-b border-slate-200 bg-gradient-to-b from-sky-50/70 to-white">
          <div className="mx-auto max-w-6xl px-3 py-2">
            <div className="grid gap-1 py-1">
              <MobileLink to="/budget"   icon="budget">Budget</MobileLink>
              <MobileLink to="/forecast" icon="forecast">Forecast</MobileLink>
              <MobileLink to="/risk"     icon="risk">Risk</MobileLink>
              <MobileLink to="/loans"    icon="loans">Loans</MobileLink>
              <MobileLink to="/networth" icon="networth">Net Worth</MobileLink>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <Icon name="book" className="h-[14px] w-[14px] text-blue-600/80" />
                  Learn
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <MobileLink to="/help" icon="budget">Budgeting basics</MobileLink>
                  <MobileLink to="/help" icon="forecast">Forecasting 101</MobileLink>
                  <MobileLink to="/help" icon="risk">Risk & Monte Carlo</MobileLink>
                  <MobileLink to="/help" icon="networth">Net worth</MobileLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ticker keyframes (kept local so you don't need global CSS edits) */
const style = document.createElement("style")
style.innerHTML = `
@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
`
if (typeof document !== "undefined" && !document.getElementById("finico-ticker-kf")) {
  style.id = "finico-ticker-kf"
  document.head.appendChild(style)
}
