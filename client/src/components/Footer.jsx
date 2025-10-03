// FILE: client/src/components/Footer.jsx
import { Link } from "react-router-dom"
import logo from "../assets/finico-high-resolution-logo-transparent.png"

export default function Footer() {
  return (
    <footer className="mt-14">
      <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="relative overflow-hidden">
        {/* Enhanced decorative background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-blue-50/35 to-slate-50" />
        
        {/* Modernized decorative elements */}
        <div className="absolute left-[-15%] top-[-25%] h-[520px] w-[520px] -z-10 rounded-full bg-gradient-to-br from-blue-200/30 via-indigo-200/30 to-purple-200/30 blur-3xl"></div>
        <div className="absolute right-[-10%] bottom-[-30%] h-[420px] w-[420px] -z-10 rounded-full bg-gradient-to-tr from-blue-200/30 via-indigo-200/30 to-purple-200/30 blur-3xl"></div>
        
        {/* Floating dots pattern (subtle) */}
        <div className="absolute inset-0 -z-5 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(99, 102, 241, 0.15) 2px, transparent 0)",
          backgroundSize: "50px 50px"
        }}></div>

        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Brand hero row */}
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <img src={logo} alt="Finico" className="h-[88px] w-auto object-contain" />
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">
                  <span className="brand-text">Finico</span>
                </div>
                <p className="mt-1 max-w-md text-slate-600">
                  Educational, beautifully-polished tools for budgets, forecasts, and risk.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">Local-first</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">Exportable charts</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">Free (MVP)</span>
                </div>
              </div>
            </div>

            {/* Enhanced Newsletter */}
            <form onSubmit={(e)=>e.preventDefault()} className="w-full max-w-lg rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-sm p-4 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="mb-2 text-sm font-semibold text-slate-700">Stay updated with financial insights</div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9z" strokeLinecap="round"/>
                    <path d="M3 12h6m6 0h6M12 3v6m0 6v6" strokeLinecap="round"/>
                  </svg>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter your email" 
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white/90 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button className="relative overflow-hidden h-12 px-5 rounded-xl font-medium text-white transition-all duration-300 hover:shadow-[0_5px_15px_rgba(59,130,246,0.35)]">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative">Subscribe</span>
                </button>
              </div>
              <div className="mt-2 px-1 flex items-center gap-2 text-[11px] text-slate-500">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                No spam. Unsubscribe any time.
              </div>
            </form>
          </div>

          {/* Links grid */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterCol title="Product" items={[
              ["Budget", "/budget"], ["Forecast", "/forecast"], ["Risk", "/risk"], ["Loans", "/loans"], ["Net Worth", "/networth"],
            ]}/>
            <FooterCol title="Learn" items={[
              ["Budgeting basics", "/help"], ["Forecasting 101", "/help"], ["Risk & Monte Carlo", "/help"], ["Net worth tracking", "/help"],
            ]}/>
            <FooterCol title="Company" items={[
              ["About", "/help"], ["FAQ", "/help"], ["Press", "/help"],
            ]}/>
            <div>
              <div className="text-sm font-semibold text-slate-900">Connect</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Social icon="twitter" />
                <Social icon="github" />
                <Social icon="linkedin" />
                <Social icon="mail" />
              </div>
              <div className="mt-3 text-sm text-slate-600">hello@finico.app</div>
              <div className="mt-1 text-xs text-slate-500">Educational math models — not investment advice.</div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-10 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>© {new Date().getFullYear()} Finico. All rights reserved.</div>
              <div className="flex flex-wrap items-center gap-4">
                <Link className="hover:underline" to="/help">Terms</Link>
                <Link className="hover:underline" to="/help">Privacy</Link>
                <Link className="hover:underline" to="/help">Security</Link>
                <Link className="hover:underline" to="/help">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-slate-700 hover:text-slate-900 hover:underline">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Social({ icon }) {
  const path = (name) => {
    switch (name) {
      case "twitter": return (<path d="M22 5.8c-.7.3-1.4.5-2.1.6.8-.5 1.4-1.2 1.7-2.1-.7.4-1.6.8-2.4 1-1.5-1.6-4-1.3-5.2.6-.6 1-.7 2.3-.3 3.4-3.2-.2-6-1.7-7.9-4.1-1.1 1.9-.5 4.3 1.3 5.6-.6 0-1.2-.2-1.8-.5 0 2.1 1.5 3.9 3.6 4.3-.5.1-1 .2-1.5.1.4 1.7 2 2.9 3.8 3-1.7 1.3-3.9 2-6.1 1.7 2 1.3 4.3 2.1 6.8 2.1 8.2 0 12.8-6.9 12.5-13.1.9-.6 1.6-1.3 2.2-2.2z" />)
      case "github":  return (<path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-2c-2.8.6-3.3-1.2-3.3-1.2-.5-1.1-1.2-1.4-1.2-1.4-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.6-.7 1.8-1 .1-.7.4-1.2.8-1.5-2.2-.2-4.6-1.2-4.6-5.2 0-1.1.4-2 .9-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1.1.8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.6.6.9 1.6.9 2.7 0 4-2.4 5-4.6 5.2.4.4.8 1.1.8 2.3v3.4c0 .3.3.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z" />)
      case "linkedin":return (<path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4zM9 8h3.8v2.1h.1c.5-1 1.8-2.1 3.7-2.1 3.9 0 4.6 2.6 4.6 6V23h-4v-7.1c0-1.7 0-3.8-2.3-3.8-2.3 0-2.6 1.8-2.6 3.7V23H9z" />)
      case "mail":    return (<><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M22 6l-10 7L2 6" /></>)
      default:        return null
    }
  }
  return (
    <a href="#" className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" aria-label={icon}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" stroke="currentColor" strokeWidth="0" aria-hidden="true">
        {path(icon)}
      </svg>
    </a>
  )
}
