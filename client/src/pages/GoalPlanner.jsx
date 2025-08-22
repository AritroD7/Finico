import { useState } from "react"
import SliderInput from "../components/SliderInput.jsx"
import StatMini from "../components/StatMini.jsx"
import { postRequiredContribution } from "../api.js"
import { useAuth } from "../hooks/useAuth"
import { useCurrency } from "../context/Currency"

// conversions
const a2m = (annualPct) => (Math.pow(1 + Number(annualPct || 0) / 100, 1 / 12) - 1) * 100
const m2a = (monthlyPct) => (Math.pow(1 + Number(monthlyPct || 0) / 100, 12) - 1) * 100
const s_a2m = (sigmaA) => Number(sigmaA || 0) / Math.sqrt(12)
const s_m2a = (sigmaM) => Number(sigmaM || 0) * Math.sqrt(12)
const round = (x, d = 4) => (Number.isFinite(x) ? Number(x.toFixed(d)) : 0)

export default function GoalPlanner(){
  const { user, token } = useAuth()
  const { base, format, toUSD } = useCurrency() // inputs base→USD, outputs USD→format

  // Inputs (BASE currency)
  const [initial, setInitial] = useState(10000)
  const [target, setTarget] = useState(500000)
  const [years, setYears] = useState(25)

  // Rate mode & synced params
  const [rateMode, setRateMode] = useState("annual")
  const [meanA, setMeanA] = useState(7)
  const [stdevA, setStdevA] = useState(14)
  const [inflA, setInflA] = useState(2.5)
  const [meanM, setMeanM] = useState(round(a2m(7)))
  const [stdevM, setStdevM] = useState(round(s_a2m(14)))
  const [inflM, setInflM] = useState(round(a2m(2.5)))

  const [sims, setSims] = useState(4000)
  const [prob, setProb] = useState(70)

  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState("")
  const [result, setResult] = useState(null)

  // Sync handlers
  const onChangeMeanA = (v) => { setMeanA(v); setMeanM(round(a2m(v))) }
  const onChangeMeanM = (v) => { setMeanM(v); setMeanA(round(m2a(v))) }
  const onChangeStdevA = (v) => { setStdevA(v); setStdevM(round(s_a2m(v))) }
  const onChangeStdevM = (v) => { setStdevM(v); setStdevA(round(s_m2a(v))) }
  const onChangeInflA = (v) => { setInflA(v); setInflM(round(a2m(v))) }
  const onChangeInflM = (v) => { setInflM(v); setInflA(round(m2a(v))) }

  const switchToAnnual = () => { onChangeMeanM(meanM); onChangeStdevM(stdevM); onChangeInflM(inflM); setRateMode("annual") }
  const switchToMonthly = () => { onChangeMeanA(meanA); onChangeStdevA(stdevA); onChangeInflA(inflA); setRateMode("monthly") }

  const run = async () => {
    setErrMsg(""); setLoading(true)
    try {
      // Always send ANNUAL to backend
      const meanAnnual  = rateMode === "annual" ? meanA  : round(m2a(meanM))
      const stdevAnnual = rateMode === "annual" ? stdevA : round(s_m2a(stdevM))
      const inflAnnual  = rateMode === "annual" ? inflA  : round(m2a(inflM))

      const r = await postRequiredContribution(token, {
        initial: toUSD(initial, base),
        target: toUSD(target, base),
        years,
        simulations: sims,
        mean_annual_return_pct: meanAnnual,
        stdev_annual_return_pct: stdevAnnual,
        annual_inflation_pct: inflAnnual,
        target_prob: prob/100
      })
      setResult(r) // USD
    } catch (e) {
      setErrMsg(e?.message || "Failed to solve. Try lowering simulations.")
    } finally {
      setLoading(false)
    }
  }

  const hintRetA   = `≈ ${round(a2m(meanA), 2)}% / mo`
  const hintRetM   = `≈ ${round(m2a(meanM), 2)}% / yr`
  const hintStdevA = `≈ ${round(s_a2m(stdevA), 2)}% / mo`
  const hintStdevM = `≈ ${round(s_m2a(stdevM), 2)}% / yr`
  const hintInflA  = `≈ ${round(a2m(inflA), 2)}% / mo`
  const hintInflM  = `≈ ${round(m2a(inflM), 2)}% / yr`

  return (
    <div className="container-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">Goal Planner (Pro)</h1>
          <p className="section-subtitle mt-1">You’re entering values in <strong>{base}</strong>.</p>
        </div>
      </div>

      {!user && <div className="card mb-6">This is a premium tool. Please sign in to use it.</div>}

      <div className="mb-4 flex gap-2">
        <button className={`btn-secondary ${rateMode === "annual" ? "ring-2 ring-blue-500/50" : ""}`} onClick={switchToAnnual}>Annual</button>
        <button className={`btn-secondary ${rateMode === "monthly" ? "ring-2 ring-blue-500/50" : ""}`} onClick={switchToMonthly}>Monthly</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Inputs</h2>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Initial ({base})</label>
                <input className="input" type="number" value={initial} onChange={e=>setInitial(Number(e.target.value||0))}/>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Target (Real, {base})</label>
                <input className="input" type="number" value={target} onChange={e=>setTarget(Number(e.target.value||0))}/>
              </div>
            </div>

            {rateMode === "annual" ? (
              <>
                <SliderInput label="Mean Annual Return"  hint={hintRetA}   value={meanA}  onChange={onChangeMeanA}  min={-5} max={20} step={0.1} suffix="%" />
                <SliderInput label="Stdev Annual Return" hint={hintStdevA} value={stdevA} onChange={onChangeStdevA} min={0}  max={40} step={0.1} suffix="%" />
                <SliderInput label="Annual Inflation"    hint={hintInflA}  value={inflA}  onChange={onChangeInflA}  min={0}  max={10} step={0.1} suffix="%" />
              </>
            ) : (
              <>
                <SliderInput label="Mean Monthly Return"  hint={hintRetM}   value={meanM}  onChange={onChangeMeanM}  min={-2} max={5}  step={0.01} suffix="%/mo" />
                <SliderInput label="Stdev Monthly Return" hint={hintStdevM} value={stdevM} onChange={onChangeStdevM} min={0}  max={12} step={0.05} suffix="%/mo" />
                <SliderInput label="Monthly Inflation"    hint={hintInflM}  value={inflM}  onChange={onChangeInflM}  min={0}  max={2}  step={0.01} suffix="%/mo" />
              </>
            )}

            <SliderInput label="Years" value={years} onChange={setYears} min={1} max={50} step={1} />
            <SliderInput label="Simulations (500–6000)" value={sims} onChange={setSims} min={500} max={6000} step={500} />
            <SliderInput label="Target Success Probability" value={prob} onChange={setProb} min={50} max={95} step={1} suffix="%" />
          </div>

          <div className="mt-6">
            <button className="btn" onClick={run} disabled={loading || !user}>{loading ? "Solving…" : "Solve"}</button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          {errMsg && <div className="text-rose-600 text-sm mb-2">{errMsg}</div>}
          {!result ? (
            <div className="helper">Run the solver to see the required monthly contribution.</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <StatMini label="Required Monthly" value={format(result.required_monthly)} accent="text-blue-700" />
                <StatMini label="Years" value={years} />
                <StatMini label="Simulations" value={result.used_simulations?.toLocaleString?.() || sims} />
              </div>
              <div className="text-sm text-slate-600">
                The monthly amount is inflation‑aware (target and balances modeled in real terms).
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
