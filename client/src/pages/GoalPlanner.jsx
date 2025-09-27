// FILE: client/src/pages/GoalPlanner.jsx
import { useState } from "react"
import { postRequiredContribution } from "../api"
import { useToaster } from "../components/Toaster"

const formatMoney = (n, code = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(Number(n || 0))

export default function GoalPlanner() {
  const { push } = useToaster()

  const [target, setTarget] = useState(50000)
  const [years, setYears] = useState(5)
  const [initial, setInitial] = useState(0)
  const [annualReturn, setAnnualReturn] = useState(7)
  const [inflation, setInflation] = useState(2.5)
  const [fee, setFee] = useState(0.2)
  const [escalation, setEscalation] = useState(0)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const r = await postRequiredContribution({
        target_amount: target, years, initial,
        annual_return_pct: annualReturn,
        annual_inflation_pct: inflation,
        annual_fee_pct: fee,
        contribution_escalation_pct: escalation,
      })
      setResult(r)
    } catch (e) {
      push({ title: "Goal solver error", message: e.message, type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-lg font-semibold mb-2">Goal Planner</h1>
          <p className="text-sm text-slate-600 mb-4">Currency: <span className="font-medium">USD</span></p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Num label="Target amount" val={target} setVal={setTarget} />
              <Num label="Years" val={years} setVal={setYears} step={1} />
              <Num label="Initial capital" val={initial} setVal={setInitial} />
              <Num label="Annual return (%)" val={annualReturn} setVal={setAnnualReturn} />
              <Num label="Annual inflation (%)" val={inflation} setVal={setInflation} />
              <Num label="Annual fee (%)" val={fee} setVal={setFee} />
              <Num label="Contribution escalation (%)" val={escalation} setVal={setEscalation} />
              <button className="btn" onClick={run} disabled={loading}>
                {loading ? "Solving…" : "Compute required monthly"}
              </button>
            </div>

            <div className="lg:col-span-2">
              {result ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Stat label="Start monthly" value={formatMoney(result.required_monthly_start ?? result.required_monthly ?? 0)} />
                  <Stat label="End monthly" value={formatMoney(result.required_monthly_end ?? result.required_monthly ?? 0)} />
                  <Stat label="Average monthly" value={formatMoney(result.required_monthly_avg ?? result.required_monthly ?? 0)} />
                </div>
              ) : (
                <div className="p-3 rounded-xl border bg-white text-sm text-slate-600">
                  Enter inputs and click “Compute required monthly”.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Num({ label, val, setVal, step = 0.01 }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <input type="number" step={step} className="input w-full" value={val} onChange={(e) => setVal(Number(e.target.value || 0))} />
    </label>
  )
}
function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-xl border bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  )
}
