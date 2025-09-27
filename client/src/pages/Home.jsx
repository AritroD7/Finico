import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calculator,
  TrendingUp,
  BrainCircuit,
  Gauge,
  CheckCircle2,
  Lock,
  Rocket,
  FileDown,
  Sparkles,
} from "lucide-react";

// in App.jsx or wherever you define routes
//import Login from "./pages/Login";

import PageBackground from "../components/PageBackground";
// ...your other imports


/* -------------------------------------------------
   Small utilities
-------------------------------------------------- */

function CountUp({ end = 0, duration = 1100, className = "" }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!started.current && entry.isIntersecting) {
          started.current = true;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / duration);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.floor(end * eased));
            if (p < 1) requestAnimationFrame(tick);
            else setValue(end);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  );
}

function SoftCanvas() {
  // Faint, clipped background; won’t create scrollbars
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
      <div className="absolute inset-[-2px] bg-[radial-gradient(60rem_40rem_at_0%_0%,rgba(139,92,246,0.10),transparent_55%),radial-gradient(60rem_40rem_at_100%_0%,rgba(236,72,153,0.08),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.22] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="griddots" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.25" className="fill-slate-300/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#griddots)" />
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Page
-------------------------------------------------- */

export default function Home() {
  const navigate = useNavigate();
  const [demo, setDemo] = useState({ income: 3200, rent: 1200, groceries: 300 });

  const savings = useMemo(() => {
    const fixed = demo.rent;
    const variable = demo.groceries;
    const total = fixed + variable;
    const remain = Math.max(0, demo.income - total);
    const rate = demo.income > 0 ? Math.round((remain / demo.income) * 100) : 0;
    return { fixed, variable, total, remain, rate };
  }, [demo]);

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/80">
      {/* subtle header backing so the top isn’t flat white */}
      <div className="sticky top-0 z-0 h-[52px] w-full bg-[linear-gradient(to_bottom,rgba(148,163,184,0.12),rgba(148,163,184,0)_65%)]" />

      {/* HERO */}
      <section className="relative z-[1] mx-auto max-w-[110rem] px-6 pb-10 pt-5 lg:px-10">
        <div className="relative mx-auto w-full rounded-[24px] border border-slate-200/70 bg-white/70 p-6 shadow-[0_18px_56px_-24px_rgba(2,6,23,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/55 md:p-7">
          <SoftCanvas />

          {/* fixed card column on lg so the card never grows */}
          <div className="relative grid grid-cols-1 gap-8 lg:[grid-template-columns:minmax(0,1fr)_auto]">
            {/* Left copy */}
            <div className="flex flex-col gap-6">
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_0_3px_rgba(124,58,237,0.18)]" />
                New: polished Budget + local scenarios
              </span>

              <h1 className="text-balance text-[2.25rem] font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-[2.55rem] md:text-[2.8rem]">
                Plan, forecast, and stress-test your money — elegantly.
              </h1>

              <p className="max-w-2xl text-pretty text-slate-600 md:text-[1.02rem]">
                A clean toolkit for budgeting, wealth forecasting, risk analysis, and goal
                planning. Fast, clear, and privacy-first.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/budget"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-[0.75rem] text-[0.95rem] font-medium text-white shadow-lg transition-transform hover:-translate-y-[1px] hover:shadow-xl"
                >
                  <span className="relative z-[1]">Plan my budget</span>
                  <span className="absolute inset-0 -z-[1] bg-[radial-gradient(120px_60px_at_var(--x,50%)_50%,rgba(255,255,255,0.25),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>

                <Link
                  to="/forecast"
                  className="rounded-xl border border-slate-200/80 bg-white px-5 py-[0.75rem] text-[0.95rem] font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                  Run a forecast
                </Link>

                <Link
                  to="/help"
                  className="rounded-xl border border-slate-200/80 bg-white px-5 py-[0.75rem] text-[0.95rem] font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                  How it works
                </Link>
              </div>

              {/* quick facts */}
              <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Fact label="< 60s" caption="Time to first plan" />
                <Fact label="Exportable" caption="Charts" />
                <Fact label="Local-first" caption="Privacy" />
                <Fact label="Free (MVP)" caption="Cost" />
              </div>
            </div>

            {/* Right: compact demo card */}
            <div className="relative">
              <div className="w-[360px] sm:w-[380px] md:w-[400px] rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-[0_14px_36px_-18px_rgba(2,6,23,0.14)] md:p-5">
                <h3 className="mb-2 flex items-center gap-2 text-[0.95rem] font-semibold text-slate-800">
                  <Gauge className="h-[16px] w-[16px] text-violet-600" />
                  Quick demo
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <LabeledNumber
                    label="Monthly income"
                    value={demo.income}
                    onChange={(v) => setDemo((s) => ({ ...s, income: v }))}
                    small
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <LabeledNumber
                      label="Rent"
                      value={demo.rent}
                      onChange={(v) => setDemo((s) => ({ ...s, rent: v }))}
                      small
                    />
                    <LabeledNumber
                      label="Groceries"
                      value={demo.groceries}
                      onChange={(v) => setDemo((s) => ({ ...s, groceries: v }))}
                      small
                    />
                  </div>

                  <div className="mt-1">
                    <div className="mb-[2px] flex items-center justify-between text-[12px] text-slate-500">
                      <span>Savings</span>
                      <span className="tabular-nums">${savings.remain.toLocaleString()}</span>
                    </div>
                    <div className="h-[7px] w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div
                        className="h-[7px] rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-[width]"
                        style={{ width: `${savings.rate}%` }}
                      />
                    </div>
                    <div className="mt-[2px] text-right text-[12px] text-slate-500">
                      Rate: {savings.rate}% of income
                    </div>
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => navigate("/budget")}
                      className="flex-1 rounded-xl bg-violet-600 px-3.5 py-2 text-[0.9rem] font-medium text-white shadow hover:bg-violet-500"
                    >
                      Open Budget
                    </button>
                    <button
                      onClick={() => navigate("/forecast")}
                      className="flex-1 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[0.9rem] font-medium text-slate-800 shadow-sm hover:border-slate-300"
                    >
                      Forecast
                    </button>
                  </div>
                </div>
              </div>

              {/* soft pad shadow */}
              <div className="pointer-events-none absolute inset-x-3 -bottom-5 h-8 rounded-2xl bg-gradient-to-b from-slate-300/40 to-transparent blur-xl" />
            </div>
          </div>
        </div>

        {/* Stats with animation */}
        <div className="mx-auto mt-7 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value={12400} label="Budgets created" />
          <Stat value={8600} label="Forecasts run" />
          <Stat value={4900} label="Risk sims" />
          <Stat value={98} suffix="%" label="User satisfaction" />
        </div>
      </section>

      {/* HOW IT WORKS (improved layout kept) */}
      <section id="how" className="relative z-[1] mx-auto max-w-[110rem] scroll-mt-16 px-6 pb-8 pt-3 lg:px-10">
        <h2 className="mb-1 text-center text-[1.55rem] font-semibold text-slate-900 sm:text-3xl">
          How it works
        </h2>
        <p className="mb-8 text-center text-slate-600">Three steps. Adjust anytime.</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Step
            idx={1}
            icon={Calculator}
            title="Start a budget"
            text="Enter income and a few expenses. See savings and fixed/variable split instantly."
          />
          <Step
            idx={2}
            icon={TrendingUp}
            title="Forecast"
            text="Project balances (nominal vs real); export snapshots for tracking."
          />
          <Step
            idx={3}
            icon={BrainCircuit}
            title="Stress-test"
            text="Run risk sims (P10/P50/P90) to gauge plan robustness."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Quote text="The fastest budgeting flow I’ve used — exports are clean." author="Maya A." />
          <Quote text="Forecast & risk in one place. Simple, clear, local-first." author="Daniel P." />
          <Quote text="Premium feel without clutter. Exactly what I needed." author="Ibrahim K." />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Chip icon={Lock} title="Local-first" text="Your data stays on your device by default. Export anytime." />
          <Chip icon={Rocket} title="Fast & clear" text="Immediate results and polished charts for clarity." />
          <Chip icon={FileDown} title="Exportable" text="Download snapshots to keep history or share." />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-center shadow-sm backdrop-blur md:p-8">
          <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">Start planning now</h3>
          <p className="mt-1 text-slate-600">Build a budget in under a minute. Tweak anytime.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/budget"
              className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white shadow hover:bg-violet-500"
            >
              Open Budget
            </Link>
            <Link
              to="/forecast"
              className="rounded-xl border border-slate-200/80 bg-white px-5 py-3 font-medium text-slate-800 shadow-sm hover:border-slate-300"
            >
              Forecast
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER (polished & spaced) */}
      <footer className="relative z-[1] mt-10 border-t border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        <div className="mx-auto grid max-w-[110rem] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-3 lg:px-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <span className="text-lg font-semibold text-slate-900">Finico</span>
            </div>
            <p className="max-w-sm text-slate-600">
              Educational math models — not investment advice. Your data stays on your device unless you save to cloud later.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:col-span-2 md:grid-cols-4">
            <FooterCol
              title="Product"
              links={[
                { to: "/budget", label: "Budget" },
                { to: "/forecast", label: "Forecast" },
                { to: "/risk", label: "Risk" },
                { to: "/goal", label: "Goal" },
              ]}
            />
            <FooterCol
              title="Learn"
              links={[
                { to: "/help#budget", label: "Budget guide" },
                { to: "/help#forecast", label: "Forecast guide" },
                { to: "/help#risk", label: "Risk guide" },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { to: "/help#about", label: "About" },
                { to: "/help#faq", label: "FAQ" },
              ]}
            />
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Contact</h4>
              <p className="text-slate-600">hello@finico.app</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200/70">
          <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-6 py-4 text-sm text-slate-500 lg:px-10">
            <span>© {new Date().getFullYear()} Finico. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/help#terms" className="hover:text-slate-700">
                Terms
              </Link>
              <Link to="/help#privacy" className="hover:text-slate-700">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );

  return (
    <main className="relative">
      <PageBackground />   {/* 👈 sits behind everything on Home */}
      {/* ⬇️ keep your existing Home content below untouched */}
      {/* ...your full hero, demo card, metrics, how-it-works, footer, etc. */}
    </main>
  );
}

/* -------------------------------------------------
   Reusable bits
-------------------------------------------------- */

function LabeledNumber({ label, value, onChange, small = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-slate-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className={[
          "w-full rounded-xl border border-slate-200/80 bg-white text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400",
          small ? "px-3 py-[7px] text-[0.95rem]" : "px-3 py-2.5 text-[0.98rem]",
          "hover:border-slate-300 focus:border-violet-500",
        ].join(" ")}
      />
    </label>
  );
}

function Fact({ label, caption }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/85 p-3 shadow-sm backdrop-blur">
      <div className="text-[15px] font-semibold text-slate-900">{label}</div>
      <div className="text-xs text-slate-500">{caption}</div>
    </div>
  );
}

function Stat({ value, label, suffix = "+" }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 text-center shadow-sm backdrop-blur">
      <div className="text-2xl font-bold tracking-tight text-slate-900">
        <CountUp end={value} />
        {suffix}
      </div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

function Step({ idx, icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow">
          {idx}
        </div>
        <div className="flex items-center gap-2">
          <Icon className="h-[18px] w-[18px] text-violet-600" />
          <h3 className="text-[15.5px] font-semibold text-slate-900">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}

function Quote({ text, author }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="text-[15px] text-slate-700">“{text}”</p>
      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-900">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />— {author}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-[18px] w-[18px] text-violet-600" />
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-900">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-slate-600 hover:text-slate-800">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
