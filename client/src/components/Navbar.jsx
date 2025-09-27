import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/finico-logo.png";

const cx = (...a) => a.filter(Boolean).join(" ");

function NavItem({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cx(
        "relative inline-flex items-center justify-center px-3 py-2 text-[15px] font-medium",
        "text-slate-800/85 transition-colors hover:text-slate-950"
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full"
        style={{
          opacity: active ? 1 : 0,
          transition: "opacity .18s ease",
          background:
            "linear-gradient(90deg, rgba(139,92,246,1), rgba(217,70,239,1), rgba(56,189,248,1))",
        }}
      />
      <span className="relative z-10">{children}</span>
    </NavLink>
  );
}

function MobileToggle({ open, setOpen }) {
  return (
    <button
      aria-label="Toggle menu"
      onClick={() => setOpen((v) => !v)}
      className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/35 bg-white/65 shadow-sm backdrop-blur-md transition hover:bg-white/80 lg:hidden"
    >
      <svg
        className="h-5 w-5 text-slate-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {open ? (
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Subtle glass header with a faint gradient. No hairline -> no 1px gap */}
      <div
        className={cx(
          "relative w-full backdrop-blur-xl",
          scrolled ? "shadow-[0_6px_22px_-10px_rgba(0,0,0,.25)] ring-1 ring-black/5" : "ring-0"
        )}
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(217,70,239,0.10), rgba(56,189,248,0.10))",
          boxShadow: "inset 0 -1px 0 rgba(148,163,184,0.25)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 lg:px-5">
          {/* BIGGER LOGO (≈3× on desktop), still responsive */}
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-xl transition-transform hover:scale-[1.01] focus:outline-none"
            aria-label="Finico Home"
          >
            <img
              src={logo}
              alt="Finico"
              loading="eager"
              decoding="async"
              className={cx(
                // base → tablet → desktop → xl → 2xl
                "block w-auto object-contain",
                "h-[24px] sm:h-[30px] md:h-[40px] lg:h-[60px] xl:h-[72px]" // ← grow a lot on desktop
              )}
              // If your exported PNG/SVG has extra padding, it will still scale. For tighter crop, re-export with less padding.
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 lg:flex">
            <NavItem to="/budget">Budget</NavItem>
            <NavItem to="/forecast">Forecast</NavItem>
            <NavItem to="/risk">Risk</NavItem>
            <NavItem to="/goal">Goal</NavItem>
            <NavItem to="/help">Help</NavItem>
            <div className="ml-3 pl-3">
              <Link
                to="/login"
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-white shadow-sm transition",
                  "bg-[linear-gradient(90deg,rgba(139,92,246,1),rgba(217,70,239,1))] hover:brightness-[1.06] active:brightness-[.98]"
                )}
              >
                Sign in
              </Link>
            </div>
          </nav>

          {/* Mobile actions */}
          <div className="flex items-center lg:hidden">
            <Link
              to="/login"
              className="mr-1 inline-flex items-center rounded-xl bg-[linear-gradient(90deg,rgba(139,92,246,1),rgba(217,70,239,1))] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-[1.06]"
            >
              Sign in
            </Link>
            <MobileToggle open={open} setOpen={setOpen} />
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cx(
            "lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out",
            open ? "max-h-80" : "max-h-0"
          )}
        >
          <div className="mx-3 mb-3 rounded-2xl border border-white/35 bg-white/70 p-2 shadow-sm backdrop-blur-xl">
            <div className="grid gap-1.5">
              <NavItem to="/budget" onClick={() => setOpen(false)}>
                Budget
              </NavItem>
              <NavItem to="/forecast" onClick={() => setOpen(false)}>
                Forecast
              </NavItem>
              <NavItem to="/risk" onClick={() => setOpen(false)}>
                Risk
              </NavItem>
              <NavItem to="/goal" onClick={() => setOpen(false)}>
                Goal
              </NavItem>
              <NavItem to="/help" onClick={() => setOpen(false)}>
                Help
              </NavItem>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-[linear-gradient(90deg,rgba(139,92,246,1),rgba(217,70,239,1))] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-[1.06]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
