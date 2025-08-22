import { Link } from "react-router-dom"

const GLOSSARY = [
  { term: "Net Savings", def: "Income minus total expenses. If negative, spending exceeds income." },
  { term: "Savings Rate", def: "Net savings divided by income, expressed as a percentage." },
  { term: "Nominal vs Real", def: "Nominal = raw currency. Real = inflation-adjusted (purchasing power)." },
  { term: "Compound Interest", def: "Interest earned on both principal and prior interest; we compound monthly." },
  { term: "Contribution Escalation", def: "Automatic % increase in recurring contributions each year (applied monthly here)." },
  { term: "Fee Drag", def: "Annual % cost reducing returns (e.g., fund fees), applied monthly." },
  { term: "Monte Carlo", def: "Many random scenarios to estimate distributions (we show p5, median, p95, and histograms)." },
  { term: "Goal Success Probability", def: "Chance of reaching a target by a specific year based on simulations." },
  { term: "Expected Shortfall", def: "Average shortfall from the target among the failing scenarios only." },
]

export default function Help(){
  return (
    <div className="container-page">
      <header className="mb-6">
        <h1 className="section-title">Guide &amp; Methodology</h1>
        <p className="section-subtitle mt-2">
          How to use the tools, what the outputs mean, and the math behind the scenes.
        </p>
      </header>

      {/* Quick Start */}
      <section className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="card">
          <div className="font-semibold mb-1">1) Plan a Budget</div>
          <p className="text-sm text-slate-700">
            Enter monthly income &amp; expenses. See net savings and savings rate. Visualize allocations.
          </p>
          <div className="mt-3"><Link className="btn-secondary focus-ring" to="/budget">Open Budget Planner</Link></div>
        </div>
        <div className="card">
          <div className="font-semibold mb-1">2) Forecast Wealth</div>
          <p className="text-sm text-slate-700">
            Choose annual or monthly rates, add inflation, escalation, and fees. View nominal vs real growth.
          </p>
          <div className="mt-3"><Link className="btn-secondary focus-ring" to="/forecast">Open Wealth Forecast</Link></div>
        </div>
        <div className="card">
          <div className="font-semibold mb-1">3) Model Risk</div>
          <p className="text-sm text-slate-700">
            Monte Carlo shows percentile bands &amp; histogram. Add a goal to get success probability and shortfall.
          </p>
          <div className="mt-3"><Link className="btn-secondary focus-ring" to="/risk">Open Risk Modeling</Link></div>
        </div>
      </section>

      {/* Tool How-To with collapsibles */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Tool Guides</h2>

        <ToolPanel
          title="Budget Planner"
          bullets={[
            "Fixed = bills that rarely change (rent, insurance).",
            "Variable = fluctuating costs (food, transport, utilities).",
            "Other = irregular/discretionary items.",
            "Net Savings = Income − Total Expenses.",
            "Savings Rate = (Net Savings / Income) × 100%.",
          ]}
          cta={{ to: "/budget", label: "Open Budget Planner" }}
        />

        <ToolPanel
          title="Wealth Forecast"
          bullets={[
            "Monthly compounding. Choose Annual or Monthly input mode.",
            "Inflation adjusts to real (purchasing power) values.",
            "Contribution Escalation: auto-increase monthly contributions by a yearly % (applied monthly).",
            "Fee Drag: annual % cost deducted from returns (applied monthly).",
            "Outputs: nominal vs real balance curves, monthly meta (r_month, i_month, fee_month).",
          ]}
          cta={{ to: "/forecast", label: "Open Wealth Forecast" }}
        />

        <ToolPanel
          title="Risk Modeling (Monte Carlo)"
          bullets={[
            "Simulates monthly returns ~ Normal(&mu;/12, &sigma;/√12).",
            "Shows percentiles (p5, median, p95) each year — downside, typical, upside.",
            "Histogram of final-year real outcomes.",
            "Goal: success probability (P(Wealth &ge; Target @ Year)) and expected shortfall if fail.",
          ]}
          cta={{ to: "/risk", label: "Open Risk Modeling" }}
        />
      </section>

      {/* Methodology / Math */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Methodology &amp; Formulas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="font-semibold mb-2">Compounding &amp; Inflation</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Monthly return from annual: <code>r_m = (1+r_a)^(1/12) − 1</code></li>
              <li>Monthly inflation from annual: <code>i_m = (1+i_a)^(1/12) − 1</code></li>
              <li>Fee drag monthly from annual: <code>f_m = (1+f_a)^(1/12) − 1</code> and applied: <code>r_eff = r_m − f_m</code></li>
              <li>Balance update: <code>B(t+1) = B(t) · (1+r_eff) + contrib_t</code>, with contrib escalation applied monthly.</li>
              <li>Real value: <code>B_real(t) = B(t) / &prod;(1+i_m)</code></li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Monte Carlo</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Monthly returns: <code>R_t ~ Normal(&mu;_m, &sigma;_m)</code> with <code>&mu;_m = (1+&mu;_a)^(1/12) − 1</code>, <code>&sigma;_m = &sigma;_a/√12</code>.</li>
              <li>Year-end real snapshots compute p5 / p50 / p95.</li>
              <li>Goal success: proportion of scenarios where <code>Wealth &ge; Target</code>.</li>
              <li>Expected shortfall: mean of <code>(Target - Wealth)</code> over failing scenarios.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Glossary</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {GLOSSARY.map((g, i) => (
            <div key={i} className="card">
              <div className="font-semibold">{g.term}</div>
              <div className="text-sm text-slate-700 mt-1">{g.def}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-sm text-slate-500">
        Built for education &amp; planning. Not investment advice.
      </footer>
    </div>
  )
}

/** Simple collapsible panel using <details> for zero-JS UX */
function ToolPanel({ title, bullets, cta }) {
  return (
    <details className="card mb-4 group" open>
      <summary className="cursor-pointer list-none flex items-center justify-between">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-slate-400 group-open:rotate-180 transition">⌄</span>
      </summary>
      <ul className="list-disc pl-5 mt-3 text-sm text-slate-700 space-y-2">
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      {cta && (
        <div className="mt-4">
          <Link className="btn-secondary focus-ring" to={cta.to}>{cta.label}</Link>
        </div>
      )}
    </details>
  )
}
