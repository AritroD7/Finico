import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useState } from "react"
import CurrencySwitcher from "../context/CurrencySwitcher" // keep your current path

export default function Navbar() {
  const { user, signOut /*, loading */ } = useAuth()
  const [open, setOpen] = useState(false)         // user menu
  const [mobile, setMobile] = useState(false)     // mobile menu
  const nav = useNavigate()

  const linkClass = ({ isActive }) => `navlink px-3 py-2 rounded-md text-sm transition-colors ${
    isActive ? "text-indigo-600 bg-indigo-50" : "hover:bg-slate-50"
  }`

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <button
            className="sm:hidden p-2 -ml-2 rounded-md hover:bg-slate-50"
            onClick={() => setMobile(m => !m)}
            aria-label="Toggle menu"
            aria-expanded={mobile}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-[15px]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" />
            <span>FinPlan</span>
          </NavLink>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <NavLink to="/budget"   className={linkClass}>Budget</NavLink>
          <NavLink to="/forecast" className={linkClass}>Forecast</NavLink>
          <NavLink to="/risk"     className={linkClass}>Risk</NavLink>
          <NavLink to="/goal"     className={linkClass}>Goal</NavLink>
          <NavLink to="/help"     className={linkClass}>Help</NavLink>

          {/* Currency picker */}
          <div className="ml-2"><CurrencySwitcher /></div>

          {/* Auth area */}
          {user ? (
            <div className="relative">
              <button
                className="border rounded-full px-3 py-1.5 text-sm bg-white hover:bg-slate-50"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                aria-haspopup="menu"
              >
                {user.email?.split("@")[0] || "Account"} ▾
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg p-2">
                  <NavLink to="/account" className="block px-3 py-2 rounded-md hover:bg-slate-50" onClick={() => setOpen(false)}>Account</NavLink>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-50"
                    onClick={async () => { setOpen(false); await signOut(); nav("/") }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="btn">Sign in</NavLink>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <div className="sm:hidden border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            <NavLink to="/budget"   onClick={() => setMobile(false)} className="block py-1 px-2 rounded-md hover:bg-slate-50">Budget</NavLink>
            <NavLink to="/forecast" onClick={() => setMobile(false)} className="block py-1 px-2 rounded-md hover:bg-slate-50">Forecast</NavLink>
            <NavLink to="/risk"     onClick={() => setMobile(false)} className="block py-1 px-2 rounded-md hover:bg-slate-50">Risk</NavLink>
            <NavLink to="/goal"     onClick={() => setMobile(false)} className="block py-1 px-2 rounded-md hover:bg-slate-50">Goal</NavLink>
            <NavLink to="/help"     onClick={() => setMobile(false)} className="block py-1 px-2 rounded-md hover:bg-slate-50">Help</NavLink>

            {/* Currency in mobile */}
            <div className="pt-2">
              <CurrencySwitcher />
            </div>

            <div className="pt-2">
              {user ? (
                <>
                  <NavLink to="/account" onClick={() => setMobile(false)} className="block py-1 px-2 rounded-md hover:bg-slate-50">Account</NavLink>
                  <button
                    className="block w-full text-left py-1 px-2 rounded-md hover:bg-slate-50"
                    onClick={async () => { setMobile(false); await signOut(); nav("/") }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMobile(false)} className="btn inline-block">Sign in</NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
