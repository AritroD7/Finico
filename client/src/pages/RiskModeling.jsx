import { useEffect, useMemo, useState } from "react"
import { Line } from "react-chartjs-2"
import { Chart as ChartJS, LineElement, LinearScale, PointElement, Tooltip, Legend, CategoryScale } from "chart.js"
import SliderInput from "../components/SliderInput.jsx"
import StatMini from "../components/StatMini.jsx"
import { postMonteCarlo, getBillingStatus } from "../api.js"
import { useAuth } from "../hooks/useAuth"
import { useCurrency } from "../context/Currency"

ChartJS.register(LineElement, LinearScale, PointElement, Tooltip, Legend, CategoryScale)

// conversions
const a2m = (annualPct) => (Math.pow(1 + Number(annualPct || 0) / 100, 1 / 12) - 1) * 100
const m2a = (monthlyPct) => (Math.pow(1 + Number(monthlyPct || 0) / 100, 12) - 1) * 100
const s_a2m = (sigmaA) => Number(sigmaA || 0) / Math.sqrt(12)
const s_m2a = (sigmaM) => Number(sigmaM || 0) * Math.sqrt(12)
const round = (x, d = 4) => (Number.isFinite(x) ? Number(x.toFixed(d)) : 0)

export default function RiskModeling(){
  const { user, token } = useAuth()
  const { base, format, toUSD } = useCurrency() // inputs base→USD, outputs USD→format

  // Pro gating
  const [pro, setPro] = useState(false)
  useEffect(() => {
    (async () => {
      try {
        if (!token) return setPro(false)
        const s = await getBillingStatus(token)
        setPro(!!s.active)
      } catch { setPro(false) }
    })()
  }, [token])

  // Inputs (BASE currency)
  const [initial, setInitial] = useState(10000)
  const [monthly, setMonthly] = useState(300)
  const [years, setYears] = useState(20)

  // Rate mode & synced params
  const [rateMode, setRateMode] = useState("annual")

  const [meanA, setMeanA] = useState(7)
  const [stdevA, setStdevA] = useState(14)
  const [inflA, setInflA] = useState(2.5)

  const [meanM, setMeanM] = useState(round(a2m(7)))
  const [stdevM, setStdevM] = useState(round(s_a2m(14)))
  const [inflM, setInflM] = useState(round(a2m(2.5)))

  // Sync handlers
  const onChangeMeanA = (v) => { setMeanA(v); setMeanM(round(a2m(v))) }
  const onChangeMeanM = (v) => { setMeanM(v); setMeanA(round(m2a(v))) }
  const onChangeStdevA = (v) => { setStdevA(v); setStdevM(round(s_a2m(v))) }
  const onChangeStdevM = (v) => { setStdevM(v); setStdevA(round(s_m2a(v))) }
  const onChangeInflA = (v) => { setInflA(v); setInflM(round(a2m(v))) }
  const onChangeInflM = (v) => { setInflM(v); setInflA(round(m2a(v))) }

  const switchToAnnual = () => { onChangeMeanM(meanM); onChangeStdevM(stdevM); onChangeInflM(inflM); setRateMode("annual") }
  const switchToMonthly = () => { onChangeMeanA(meanA); onChangeStdevA(stdevA); onChangeInflA(inflA); setRateMode("monthly") }

  const [sims, setSims] = useState(1000)
  const [goal, setGoal] = useState(500000)
  const [goalYear, setGoalYear] = useState(20)

  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)
  const maxSims = pro ? 10000 : 1000

  const run = async () => {
    if (sims > maxSims) return alert(`Max simulations for your plan: ${maxSims}.`)
    setLoading(true)

    // Always send ANNUAL to backend
    const meanAnnual  = rateMode === "annual" ? meanA  : round(m2a(meanM))
    const stdevAnnual = rateMode === "annual" ? stdevA : round(s_m2a(stdevM))
    const inflAnnual  = rateMode === "annual" ? inflA  : round(m2a(inflM))

    const r = await postMonteCarlo({
      initial: toUSD(initial, base),
      monthly_contrib: toUSD(monthly, base),
      years,
      simulations: sims,
      mean_annual_return_pct: meanAnnual,
      stdev_annual_return_pct: stdevAnnual,
      annual_inflation_pct: inflAnnual,
      goal_target: toUSD(goal, base),
      goal_year: goalYear
    })
    setRes(r); setLoading(false)
  }

  const labels = res?.years?.map(y => `Y${y}`) || []
  const data = useMemo(()=>({
    labels,
    datasets: [
      { label: "p5",    data: res?.yearly_percentiles?.map(p => p.p5)  || [], tension:.25, borderWidth:2 },
      { label: "median",data: res?.yearly_percentiles?.map(p => p.p50) || [], tension:.25, borderWidth:2 },
      { label: "p95",   data: res?.yearly_percentiles?.map(p => p.p95) || [], tension:.25, borderWidth:2 },
    ]
  }), [labels, res])
  const final = res?.yearly_percentiles?.at(-1)

  const hintRetA   = `≈ ${round(a2m(meanA), 2)}% / mo`
  const hintRetM   = `≈ ${round(m2a(meanM), 2)}% / yr`
  const hintStdevA = `≈ ${round(s_a2m(stdevA), 2)}% / mo`
  const hintStdevM = `≈ ${round(s_m2a(stdevM), 2)}% / yr`
  const hintInflA  = `≈ ${round(a2m(inflA), 2)}% / mo`
  const hintInflM  = `≈ ${round(m2a(inflM), 2)}% / yr`

  return (
    <div className="container-page">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="section-title">Risk Modeling (Monte Carlo)</h1>
        <div className={`pill ${pro ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
          {pro ? "Pro: 10k sims" : "Free: up to 1k sims"}
        </div>
      </div>

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
                <label className="block text-sm text-slate-600 mb-1">Monthly Contribution ({base})</label>
                <input className="input" type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value||0))}/>
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Goal (Real, {base})</label>
                <input className="input" type="number" value={goal} onChange={e=>setGoal(Number(e.target.value||0))}/>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Goal Year</label>
                <input className="input" type="number" value={goalYear} onChange={e=>setGoalYear(Number(e.target.value||0))}/>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="btn" onClick={run} disabled={loading}>{loading ? "Running…" : "Run"}</button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Results (Real)</h2>
          {!res ? (
            <div className="helper">Set inputs and run.</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <StatMini label="p5 (final)"  value={format(final.p5)} />
                <StatMini label="p50 (final)" value={format(final.p50)} />
                <StatMini label="p95 (final)" value={format(final.p95)} />
              </div>
              <div style={{height: 340}}>
                <Line data={data} options={{
                  responsive:true, maintainAspectRatio:false,
                  plugins:{ legend:{ position:"bottom" }, tooltip:{ callbacks:{
                    label:(ctx)=> `${ctx.dataset.label}: ${format(Number(ctx.raw))}`
                  } } }
                }}/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
