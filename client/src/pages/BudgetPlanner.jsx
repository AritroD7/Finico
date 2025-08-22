import { useMemo, useState } from "react"
import { useCurrency } from "../context/Currency"

function NumberRow({ value, onChange, onRemove, placeholder = "0" }) {
  return (
    <div className="flex gap-2">
      <input
        className="input flex-1"
        type="number"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(Number(e.target.value || 0))}
      />
      <button className="btn-secondary" onClick={onRemove} title="Remove">
        Remove
      </button>
    </div>
  )
}

function AddRow({ onAdd, label = "Add" }) {
  return (
    <div className="flex justify-end">
      <button className="btn-secondary" onClick={onAdd}>{label}</button>
    </div>
  )
}

export default function BudgetPlanner() {
  const { base, format } = useCurrency()

  // --- Inputs (monthly, in selected base currency) ---
  const [income, setIncome] = useState(4000)
  const [fixed, setFixed] = useState([1200, 200])
  const [variable, setVariable] = useState([600, 180])
  const [other, setOther] = useState([])

  // --- Calculations ---
  const totals = useMemo(() => {
    const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0)
    const fixedTotal = sum(fixed)
    const variableTotal = sum(variable)
    const otherTotal = sum(other)
    const totalExpenses = fixedTotal + variableTotal + otherTotal
    const savings = (Number(income) || 0) - totalExpenses
    const savingsRate = income > 0 ? (savings / income) * 100 : 0
    const runwayMonths = totalExpenses > 0 ? Math.max(0, savings) / totalExpenses : 0
    const variableShare = totalExpenses > 0 ? (variableTotal / totalExpenses) * 100 : 0

    return {
      fixedTotal,
      variableTotal,
      otherTotal,
      totalExpenses,
      savings,
      savingsRate,
      runwayMonths,
      variableShare,
    }
  }, [income, fixed, variable, other])

  // --- Insight text ---
  const insights = useMemo(() => {
    const items = []
    if (totals.savings < 0) {
      items.push(
        `You’re overspending by ${format(Math.abs(totals.savings))} per month. Reduce variable expenses or boost income.`
      )
    } else {
      items.push(`You’re saving ${format(totals.savings)} per month. Consider auto-investing ${format(Math.max(0, totals.savings * 0.6))}.`)
    }
    if (totals.savingsRate < 20) {
      items.push(`Savings rate is ${totals.savingsRate.toFixed(1)}%. Aim for ≥ 20% to stay on track for long‑term goals.`)
    } else {
      items.push(`Great! Savings rate is ${totals.savingsRate.toFixed(1)}%.`)
    }
    if (totals.variableShare > 45) {
      items.push(`Variable expenses are ${totals.variableShare.toFixed(0)}% of total. Try to shift more to planned/fixed categories.`)
    }
    if (totals.totalExpenses > 0) {
      items.push(
        `Emergency runway: with ${format(totals.savings)} saved monthly, your monthly expenses are ${format(
          totals.totalExpenses
        )} — that’s about ${totals.runwayMonths.toFixed(1)} month(s) of costs saved in one month.`
      )
    }
    return items
  }, [totals, format])

  // --- Helpers to update lists ---
  const updateAt = (list, idx, v) => list.map((x, i) => (i === idx ? v : x))
  const removeAt = (list, idx) => list.filter((_, i) => i !== idx)

  // --- UI ---
  return (
    <div className="space-y-8">
      {/* Hero */}
      <header className="pt-2">
        <div className="mb-2">
          <div className="inline-block rounded-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-500/20">
            Monthly Planner
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
            Budget Planner
          </span>
        </h1>
        <p className="text-slate-600 mt-2">
          Track income & expenses in <strong>{base}</strong>. Get instant insights and suggestions.
        </p>
      </header>

      {/* Grid */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left: Inputs */}
        <div className="space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">Monthly Inputs</h2>

            {/* Income */}
            <div className="mb-5">
              <label className="block text-sm text-slate-600 mb-1">
                Monthly Income ({base})
              </label>
              <input
                className="input w-full"
                type="number"
                inputMode="decimal"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value || 0))}
                placeholder="0"
              />
            </div>

            {/* Fixed */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Fixed Expenses ({base})</h3>
                <AddRow onAdd={() => setFixed([...fixed, 0])} />
              </div>
              <div className="space-y-2">
                {fixed.map((v, i) => (
                  <NumberRow
                    key={`f-${i}`}
                    value={v}
                    onChange={(nv) => setFixed(updateAt(fixed, i, nv))}
                    onRemove={() => setFixed(removeAt(fixed, i))}
                  />
                ))}
              </div>
            </div>

            {/* Variable */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Variable Expenses ({base})</h3>
                <AddRow onAdd={() => setVariable([...variable, 0])} />
              </div>
              <div className="space-y-2">
                {variable.map((v, i) => (
                  <NumberRow
                    key={`v-${i}`}
                    value={v}
                    onChange={(nv) => setVariable(updateAt(variable, i, nv))}
                    onRemove={() => setVariable(removeAt(variable, i))}
                  />
                ))}
              </div>
            </div>

            {/* Other */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Other Expenses ({base})</h3>
                <AddRow onAdd={() => setOther([...other, 0])} />
              </div>
              <div className="space-y-2">
                {other.map((v, i) => (
                  <NumberRow
                    key={`o-${i}`}
                    value={v}
                    onChange={(nv) => setOther(updateAt(other, i, nv))}
                    onRemove={() => setOther(removeAt(other, i))}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Insights */}
          <section className="card">
            <h2 className="text-lg font-semibold mb-2">Insights</h2>
            {insights.length === 0 ? (
              <div className="helper">Adjust inputs to see personalized suggestions.</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {insights.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: Summary (sticky) */}
        <aside className="lg:sticky lg:top-20">
          <section className="card">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>

            {/* KPI tiles */}
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border p-3 bg-white">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Total Expenses
                </div>
                <div className="text-xl font-semibold mt-1">
                  {format(totals.totalExpenses)}
                </div>
              </div>
              <div className="rounded-xl border p-3 bg-white">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Net Savings
                </div>
                <div className={`text-xl font-semibold mt-1 ${totals.savings >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {format(totals.savings)}
                </div>
              </div>
              <div className="rounded-xl border p-3 bg-white">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Savings Rate
                </div>
                <div className="text-xl font-semibold mt-1">
                  {totals.savingsRate.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="pill">Fixed: {format(totals.fixedTotal)}</span>
              <span className="pill">Variable: {format(totals.variableTotal)}</span>
              <span className="pill">Other: {format(totals.otherTotal)}</span>
            </div>

            {/* Progress */}
            <div className="mb-1 text-sm text-slate-600 flex items-center justify-between">
              <span>Monthly Target: ≥ 20% saved</span>
              <span className="font-medium">{totals.savingsRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all ${totals.savingsRate >= 20 ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${Math.max(0, Math.min(100, totals.savingsRate))}%` }}
              />
            </div>

            {/* Callout */}
            <div className="mt-5 rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-medium mb-1">Quick Tip</div>
              <div>
                Automate savings on payday. Even setting aside {format(Math.max(0, totals.savings * 0.5))} can build a strong buffer fast.
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
